const express = require("express");
const router = express.Router();
const { registrar, login, perfil, crearUsuarioConRol } = require("./controllers");
const { verificarToken, verificarAdmin } = require("./middlewares");

/**
 * @swagger
 * /api/auth/registro:
 *   post:
 *     summary: Registra un nuevo usuario indicando si es administrador u operador
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - correo
 *               - password
 *               - tipo_usuario
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Ruben
 *               apellido:
 *                 type: string
 *                 example: Gonzalez Camargo
 *               telefono:
 *                 type: string
 *                 example: "6441234567"
 *               correo:
 *                 type: string
 *                 example: ruben@test.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *               tipo_usuario:
 *                 type: string
 *                 enum: [administrador, operador]
 *                 example: operador
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Faltan datos, contraseña muy corta, o tipo_usuario inválido
 *       409:
 *         description: El correo ya está registrado
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
 *               - correo
 *               - password
 *             properties:
 *               correo:
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
 *       403:
 *         description: Usuario inactivo
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

/**
 * @swagger
 * /api/auth/usuarios/crear:
 *   post:
 *     summary: Crea un usuario con un rol específico (solo administradores)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - correo
 *               - password
 *               - id_rol
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               telefono:
 *                 type: string
 *               correo:
 *                 type: string
 *               password:
 *                 type: string
 *               id_rol:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *       400:
 *         description: Faltan datos
 *       401:
 *         description: Token no proporcionado o inválido
 *       403:
 *         description: No tienes permisos de administrador
 *       409:
 *         description: El correo ya está registrado
 */
router.post("/usuarios/crear", verificarToken, verificarAdmin, crearUsuarioConRol);

module.exports = router;