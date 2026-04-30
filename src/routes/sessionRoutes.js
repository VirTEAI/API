const express = require('express');
const {
  getSessionId,
  generateSessionId,
  attachSessionData
} = require('../controllers/sessionController');

const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const validateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50
});

const attachLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30
});

/**
 * @openapi
 * tags:
 *   name: Sessions
 *   description: Gerenciamento de sessões temporárias para coleta de dados
 */

/**
 * @openapi
 * /sessions/{sessionId}:
 *   get:
 *     tags: [Sessions]
 *     summary: Validar ID da sessão
 *     description: Verifica se um ID de sessão é válido e não expirado (apenas para terapeutas e admins)
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         example: "1234567..."
 *     responses:
 *       200:
 *         description: ID de sessão válido
 *       400:
 *         description: ID ausente ou inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: ID inválido ou expirado
 *       500:
 *         description: Erro do servidor
 */
router.get('/:sessionId', role(['THERAPIST', 'ADMIN']), validateLimiter, getSessionId);

/**
 * @openapi
 * /sessions/generate:
 *   post:
 *     tags: [Sessions]
 *     summary: Gerar ID de sessão
 *     description: Gera um token de sessão temporário (uso único) (apenas para terapeutas e admins)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token gerado com sucesso
 *       401:
 *         description: Não autenticado
 *       500:
 *         description: Erro do servidor
 */
router.post('/generate', role(['THERAPIST', 'ADMIN']), auth, generateSessionId);

/**
 * @openapi
 * /sessions/attach:
 *   post:
 *     tags: [Sessions]
 *     summary: Anexar dados de sessão
 *     description: Armazena dados e invalida o token (uso único)
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
 *                 example: "1234567..."
 *               data:
 *                 type: object
 *                 example: { gaze: "objeto_cogumelo", durationSeconds: 5 }
 *     responses:
 *       200:
 *         description: Dados armazenados com sucesso
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Token inválido ou expirado
 *       500:
 *         description: Erro do servidor
 */
// router.post('/attach', role(['THERAPIST', 'ADMIN']), attachLimiter, attachSessionData);
router.post('/attach', attachLimiter, attachSessionData); // Como ele vem do app do unity, não tem token de autenticação, então não dá pra usar o middleware de role aqui

module.exports = router;