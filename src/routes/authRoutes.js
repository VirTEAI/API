const express = require('express');
const { register, login, forgotPassword } = require('../controllers/authController');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticação e gerenciamento de usuários
 */

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registrar usuário
 *     description: Cria um novo usuário com email, nome e senha criptografada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@email.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 123456
 *     responses:
 *       201:
 *         description: Usuário criado
 *       500:
 *         description: Erro do servidor
 */
router.post('/register', register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login de usuário
 *     description: Autentica usuário e retorna token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@email.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login bem-sucedido, token JWT retornado
 *       401:
 *         description: Credenciais inválidas
 *       500:
 *         description: Erro do servidor
 */
router.post('/login', login);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Esqueci minha senha
 *     description: Gera token de reset e envia email para usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@email.com
 *     responses:
 *       200:
 *         description: Email de reset enviado
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.post('/forgot-password', forgotPassword);

module.exports = router;