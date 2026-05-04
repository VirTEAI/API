const express = require('express');
const {
    register,
    login,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticação e gerenciamento de usuários
 */

// /**
//  * @openapi
//  * /auth/register:
//  *   post:
//  *     tags: [Auth]
//  *     summary: Registrar usuário
//  *     description: Cria um novo usuário com senha forte criptografada
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required: [name, email, password]
//  *             properties:
//  *               name:
//  *                 type: string
//  *                 example: John Doe
//  *               email:
//  *                 type: string
//  *                 format: email
//  *                 example: john@email.com
//  *               password:
//  *                 type: string
//  *                 format: password
//  *                 example: StrongPass123
//  *               role:
//  *                type: string
//  *                enum: [PATIENT, THERAPIST, ADMIN]
//  *                example: PATIENT
//  *     responses:
//  *       201:
//  *         description: Usuário criado
//  *       400:
//  *         description: Dados inválidos
//  *       409:
//  *         description: Email já em uso
//  *       500:
//  *         description: Erro do servidor
//  */

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registrar usuário
 *     description: Cria um novo usuário com senha forte criptografada e perfil associado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role, country, city, birthDate]
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
 *                 example: StrongPass123
 *               role:
 *                 type: string
 *                 enum: [PATIENT, THERAPIST, ADMIN]
 *                 example: PATIENT
 *               country:
 *                 type: string
 *                 example: Brazil
 *               city:
 *                 type: string
 *                 example: São Paulo
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: 1990-01-01
 *               professionalRegister (para terapeutas):
 *                 type: string
 *                 example: CRP 12345
 *               position (para terapeutas):
 *                 type: string
 *                 example: Psicólogo Clínico
 *               specialty (para terapeutas):
 *                 type: string
 *                 example: Terapia Cognitivo-Comportamental
 *               experience (para terapeutas):
 *                 type: string
 *                 example: 10 anos de experiência em clínica privada
 *               attendanceModality (para terapeutas):
 *                 type: string
 *                 enum: [ONLINE, PRESENCIAL, BOTH]
 *                 example: ONLINE
 *     responses:
 *       201:
 *         description: Usuário criado com perfil associado
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email já em uso
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
 *                 example: StrongPass123
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *       400:
 *         description: Dados inválidos
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
 *     description: Sempre retorna sucesso para evitar enumeração de usuários
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
 *         description: Se o email existir, o link de reset foi enviado
 *       500:
 *         description: Erro do servidor
 */
router.post('/forgot-password', forgotPassword);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Redefinir senha
 *     description: Redefine a senha usando token válido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *                 example: reset_token_here
 *               password:
 *                 type: string
 *                 format: password
 *                 example: NewStrongPass123
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *       400:
 *         description: Token inválido ou expirado
 *       500:
 *         description: Erro do servidor
 */
router.post('/reset-password', resetPassword);

module.exports = router;