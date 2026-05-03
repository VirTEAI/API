const express = require('express');

const {
  createScenario,
  listScenarios,
  getScenarioById,
  updateScenario,
  deleteScenario
} = require('../controllers/scenarioController');

const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Scenarios
 *   description: Gerenciamento de cenários terapêuticos
 */

/**
 * @openapi
 * /scenarios/create:
 *   post:
 *     tags: [Scenarios]
 *     summary: Criar cenário
 *     description: Cria um novo cenário terapêutico para um paciente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patientProfileId, title]
 *             properties:
 *               patientProfileId:
 *                 type: integer
 *                 example: 1
 *               therapistProfileId:
 *                 type: integer
 *                 example: 2
 *               title:
 *                 type: string
 *                 example: Sala de aula
 *               status:
 *                 type: string
 *                 example: NOT_STARTED
 *     responses:
 *       201:
 *         description: Cenário criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Paciente ou terapeuta não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.post('/create', auth, role('THERAPIST', 'ADMIN'), createScenario);

/**
 * @openapi
 * /scenarios/list:
 *   get:
 *     tags: [Scenarios]
 *     summary: Listar cenários
 *     description: Lista cenários do paciente logado, do terapeuta logado ou todos para admin
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Perfil não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.get('/list', auth, role('PATIENT', 'THERAPIST', 'ADMIN'), listScenarios);

/**
 * @openapi
 * /scenarios/{scenarioId}:
 *   get:
 *     tags: [Scenarios]
 *     summary: Buscar cenário por ID
 *     description: Retorna um cenário terapêutico específico
 *     parameters:
 *       - in: path
 *         name: scenarioId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Cenário encontrado
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Cenário não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.get('/:scenarioId', auth, role('PATIENT', 'THERAPIST', 'ADMIN'), getScenarioById);

/**
 * @openapi
 * /scenarios/update/{scenarioId}:
 *   put:
 *     tags: [Scenarios]
 *     summary: Atualizar cenário
 *     description: Atualiza um cenário terapêutico existente
 *     parameters:
 *       - in: path
 *         name: scenarioId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Sala de aula
 *               status:
 *                 type: string
 *                 example: IN_PROGRESS
 *     responses:
 *       200:
 *         description: Cenário atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Cenário não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.put('/update/:scenarioId', auth, role('THERAPIST', 'ADMIN'), updateScenario);

/**
 * @openapi
 * /scenarios/delete/{scenarioId}:
 *   delete:
 *     tags: [Scenarios]
 *     summary: Excluir cenário
 *     description: Remove um cenário terapêutico existente
 *     parameters:
 *       - in: path
 *         name: scenarioId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Cenário excluído com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Cenário não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.delete('/delete/:scenarioId', auth, role('THERAPIST', 'ADMIN'), deleteScenario);

module.exports = router;