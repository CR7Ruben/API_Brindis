const express = require("express");
const router = express.Router();
const { registrar, login, perfil } = require("./controllers");
const { verificarToken } = require("./middlewares");

/**
 * @swagger
 * /api/auth/registro:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Ruben Gonzalez
 *               email:
 *                 type: string
 *                 example: ruben@test.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Faltan datos o contraseña muy corta
 *       409:
 *         description: El email ya está registrado
 */
router.post("/registro", registrar);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicia sesión y devuelve un JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: ruben@test.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve el token JWT
 *       400:
 *         description: Faltan datos
 *       401:
 *         description: Credenciales inválidas
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/perfil:
 *   get:
 *     summary: Devuelve los datos del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario logueado
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.get("/perfil", verificarToken, perfil);

module.exports = router;