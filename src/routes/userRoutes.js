const express = require('express');
const { getUsers, createUser, getSessionData } = require('../controllers/userController');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Users
 *   description: Endpoints de gerenciamento de usuários
 */

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Listar usuários
 *     description: Retorna uma lista de todos os usuários
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       500:
 *         description: Erro do servidor
 */
router.get('/', getUsers);

/**
 * @openapi
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Criar usuário sem autenticação
 *     description: Cria um novo usuário sem necessidade de autenticação (para testes)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, name]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@email.com
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *     responses:
 *       200:
 *         description: Usuário criado
 *       500:
 *         description: Erro do servidor
 */
router.post('/', createUser);

/**
 * @openapi
 * /users/session-data/{userId}:
 *   get:
 *     tags: [Users]
 *     summary: Obter dados de sessão para um usuário
 *     description: Recupera todos os registros de dados de sessão vinculados a um usuário
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Dados de sessão recuperados
 *       404:
 *         description: Nenhum dado de sessão encontrado
 *       500:
 *         description: Erro do servidor
 */
router.get('/session-data/:userId', getSessionData);

module.exports = router;