const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./config");

async function registrar(req, res) {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Faltan datos: nombre, email o password" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    const existe = await pool.query("SELECT id FROM usuarios WHERE email = $1", [email]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: "Ese email ya está registrado" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const resultado = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, nombre, email, rol, creado_en`,
      [nombre, email, passwordHash]
    );

    return res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      usuario: resultado.rows[0],
    });
  } catch (err) {
    console.error("Error en registrar:", err.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Faltan email o password" });
    }

    const resultado = await pool.query(
      "SELECT id, nombre, email, password_hash, rol FROM usuarios WHERE email = $1",
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const usuario = resultado.rows[0];

    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      mensaje: "Login exitoso",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (err) {
    console.error("Error en login:", err.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function perfil(req, res) {
  // req.usuario lo puso el middleware verificarToken
  return res.status(200).json({
    mensaje: "Acceso autorizado",
    usuario: req.usuario,
  });
}

module.exports = { registrar, login, perfil };