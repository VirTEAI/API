const express = require('express');
const {
  getIsTest10Completed,
  getIsTest50Completed,
  submitTest10,
  submitTest50
} = require('../controllers/testController');

const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Tests
 *   description: Gerenciamento dos testes
 */

/**
 * @openapi
 * /tests/get-test-10:
 *   post:
 *     tags: [Tests]
 *     summary: Verificar se teste 10 foi completado
 *     description: Retorna se o paciente completou o teste 10
 *     responses:
 *       200:
 *         description: Status retornado com sucesso
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Perfil de paciente não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.get('/get-test-10', auth, role('PATIENT'), getIsTest10Completed);

/**
 * @openapi
 * /tests/get-test-50:
 *   post:
 *     tags: [Tests]
 *     summary: Verificar se teste 50 foi completado
 *     description: Retorna se o paciente completou o teste 50
 *     responses:
 *       200:
 *         description: Status retornado com sucesso
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Perfil de paciente não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.get('/get-test-50', auth, role('PATIENT'), getIsTest50Completed);

/**
 * @openapi
 * /tests/submit-test-10:
 *   post:
 *     tags:
 *       - Tests
 *     summary: Enviar respostas do teste de 10 questões
 *     description: |
 *       Recebe as respostas do teste com 10 perguntas e retorna a pontuação final.
 *       A pontuação é baseada em respostas esperadas (positivas e negativas).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmitTest10'
 *     responses:
 *       200:
 *         description: Pontuação calculada com sucesso
 *       400:
 *         description: Formato de respostas inválido
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Perfil de paciente não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.post('/submit-test-10', auth, role('PATIENT'), submitTest10);

/**
 * @openapi
 * /tests/submit-test-50:
 *   post:
 *     tags:
 *       - Tests
 *     summary: Enviar respostas do teste de 50 questões
 *     description: |
 *       Recebe as respostas do teste com 50 perguntas e retorna a pontuação final.
 *       A pontuação é baseada em respostas esperadas (positivas e negativas).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmitTest50'
 *     responses:
 *       200:
 *         description: Pontuação calculada com sucesso
 *       400:
 *         description: Formato de respostas inválido
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Perfil de paciente não encontrado
 *       500:
 *         description: Erro do servidor
 */

router.post('/submit-test-50', auth, role('PATIENT'), submitTest50);

module.exports = router;