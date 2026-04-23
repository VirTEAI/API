const express = require('express');
const { getUsers, createUser, getSessionData } = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware');
// const isAdmin = require('../middlewares/adminMiddleware.js');

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
 *     description: Retorna uma lista de usuários (apenas admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (não é admin)
 *       500:
 *         description: Erro do servidor
 */
router.get('/', auth, getUsers);

/**
 * ⚠️ Ideal: remover essa rota em produção
 * Use /auth/register em vez disso
 */
router.post('/', auth, createUser);

/**
 * @openapi
 * /users/session-data/{userId}:
 *   get:
 *     tags: [Users]
 *     summary: Obter dados de sessão
 *     description: Retorna dados de sessão do próprio usuário ou admin
 *     security:
 *       - bearerAuth: []
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
 *       400:
 *         description: userId inválido
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.get('/session-data/:userId', auth, getSessionData);

module.exports = router;