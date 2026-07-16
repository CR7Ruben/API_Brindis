const jwt = require("jsonwebtoken");

// Verifica que el request traiga un token válido
function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // { id_usuario, correo, id_rol, rol }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

// Verifica que el usuario autenticado sea Administrador (id_rol = 1)
function verificarAdmin(req, res, next) {
  if (!req.usuario || req.usuario.id_rol !== 1) {
    return res.status(403).json({ error: "No tienes permisos de administrador" });
  }
  next();
}

module.exports = { verificarToken, verificarAdmin };