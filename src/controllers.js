const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./config");

const ROL_ADMINISTRADOR = 1;
const ROL_OPERADOR = 2;

// Registro público — siempre asigna rol Operador, nunca deja elegir el rol desde el body
async function registrar(req, res) {
  try {
    const { nombre, apellido, telefono, correo, password, tipo_usuario } = req.body;
    // tipo_usuario esperado: "administrador" u "operador"

    if (!nombre || !correo || !password || !tipo_usuario) {
      return res.status(400).json({ error: "Faltan datos: nombre, correo, password o tipo_usuario" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    const tipoNormalizado = tipo_usuario.toLowerCase();
    if (!["administrador", "operador"].includes(tipoNormalizado)) {
      return res.status(400).json({ error: "tipo_usuario debe ser 'administrador' u 'operador'" });
    }

    const rolResult = await pool.query(
      "SELECT id_rol FROM rol WHERE LOWER(nombre) = $1",
      [tipoNormalizado]
    );
    if (rolResult.rows.length === 0) {
      return res.status(400).json({ error: "El rol especificado no existe en la base de datos" });
    }
    const id_rol = rolResult.rows[0].id_rol;

    const existe = await pool.query(
      "SELECT id_usuario FROM usuario WHERE correo = $1",
      [correo]
    );
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: "Ese correo ya está registrado" });
    }

    const salt = await bcrypt.genSalt(10);
    const contraseñaHash = await bcrypt.hash(password, salt);

    const resultado = await pool.query(
      `INSERT INTO usuario (id_rol, nombre, apellido, telefono, correo, contraseña, activo, fecha_registro)
       VALUES ($1, $2, $3, $4, $5, $6, true, CURRENT_TIMESTAMP)
       RETURNING id_usuario, id_rol, nombre, apellido, telefono, correo, activo, fecha_registro`,
      [id_rol, nombre, apellido || null, telefono || null, correo, contraseñaHash]
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
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ error: "Faltan correo o password" });
    }

    const resultado = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.contraseña,
              u.activo, u.id_rol, r.nombre AS rol
       FROM usuario u
       JOIN rol r ON r.id_rol = u.id_rol
       WHERE u.correo = $1`,
      [correo]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const usuario = resultado.rows[0];

    if (!usuario.activo) {
      return res.status(403).json({ error: "Usuario inactivo, contacta al administrador" });
    }

    const passwordValido = await bcrypt.compare(password, usuario["contraseña"]);
    if (!passwordValido) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        correo: usuario.correo,
        id_rol: usuario.id_rol,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      mensaje: "Login exitoso",
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        id_rol: usuario.id_rol,
        rol: usuario.rol,
      },
    });
  } catch (err) {
    console.error("Error en login:", err.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function perfil(req, res) {
  return res.status(200).json({
    mensaje: "Acceso autorizado",
    usuario: req.usuario,
  });
}

// Solo un administrador autenticado puede crear usuarios con un rol específico (incluyendo otros admins)
async function crearUsuarioConRol(req, res) {
  try {
    const { nombre, apellido, telefono, correo, password, id_rol } = req.body;

    if (!nombre || !correo || !password || !id_rol) {
      return res.status(400).json({ error: "Faltan datos: nombre, correo, password o id_rol" });
    }

    const existe = await pool.query(
      "SELECT id_usuario FROM usuario WHERE correo = $1",
      [correo]
    );
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: "Ese correo ya está registrado" });
    }

    const salt = await bcrypt.genSalt(10);
    const contraseñaHash = await bcrypt.hash(password, salt);

    const resultado = await pool.query(
      `INSERT INTO usuario (id_rol, nombre, apellido, telefono, correo, contraseña, activo, fecha_registro)
       VALUES ($1, $2, $3, $4, $5, $6, true, CURRENT_TIMESTAMP)
       RETURNING id_usuario, id_rol, nombre, apellido, telefono, correo, activo, fecha_registro`,
      [id_rol, nombre, apellido || null, telefono || null, correo, contraseñaHash]
    );

    return res.status(201).json({
      mensaje: "Usuario creado correctamente por el administrador",
      usuario: resultado.rows[0],
    });
  } catch (err) {
    console.error("Error en crearUsuarioConRol:", err.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = { registrar, login, perfil, crearUsuarioConRol };