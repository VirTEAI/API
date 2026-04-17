const express = require('express');
const {
  getSessionId,
  generateSessionId,
  attachSessionData
} = require('../controllers/sessionController');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Sessions
 *   description: Gerenciamento de sessões temporárias para coleta de dados
 */

/**
 * @openapi
 * /sessions/get-id/{sessionId}:
 *   get:
 *     tags: [Sessions]
 *     summary: Validar ID da sessão
 *     description: Verifica se um ID de sessão é válido e não expirado
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         example: "123456"
 *     responses:
 *       200:
 *         description: ID de sessão válido
 *       404:
 *         description: ID de sessão inválido ou expirado
 *       400:
 *         description: ID de sessão ausente
 *       500:
 *         description: Erro do servidor
 */
router.get('/get-id/:sessionId', getSessionId);

/**
 * @openapi
 * /sessions/generate-id:
 *   post:
 *     tags: [Sessions]
 *     summary: Gerar ID de sessão
 *     description: Gera um ID de sessão temporário vinculado a um email de usuário
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
 *                 example: user@email.com
 *     responses:
 *       200:
 *         description: ID de sessão gerado
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.post('/generate-id', generateSessionId);

/**
 * @openapi
 * /sessions/attach:
 *   post:
 *     tags: [Sessions]
 *     summary: Anexar dados de sessão
 *     description: Armazena dados relacionados à sessão e invalida o ID da sessão
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId]
 *             properties:
 *               sessionId:
 *                 type: string
 *                 example: "123456"
 *               data:
 *                 type: object
 *                 example: { gaze: "left", duration: 120 }
 *     responses:
 *       200:
 *         description: Dados de sessão anexados com sucesso
 *       400:
 *         description: ID de sessão ausente
 *       404:
 *         description: Sessão não encontrada
 *       500:
 *         description: Erro do servidor
 */
router.post('/attach', attachSessionData);

module.exports = router;