const express = require('express');

const {
  createObjective,
  listObjectives,
  getObjectiveById,
  updateObjective,
  deleteObjective
} = require('../controllers/objectiveController');

const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Objectives
 *   description: Gerenciamento de objetivos terapêuticos
 */

/**
 * @openapi
 * /objectives/create:
 *   post:
 *     tags: [Objectives]
 *     summary: Criar objetivo terapêutico
 *     description: Cria um novo objetivo terapêutico para um paciente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patientId, title]
 *             properties:
 *               patientId:
 *                 type: integer
 *                 example: 1
 *               therapistId:
 *                 type: integer
 *                 example: 2
 *               title:
 *                 type: string
 *                 example: Interação social
 *               evolution:
 *                 type: string
 *                 example: MAINTAINED
 *     responses:
 *       201:
 *         description: Objetivo criado com sucesso
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
router.post('/create', auth, role('THERAPIST', 'ADMIN'), createObjective);

/**
 * @openapi
 * /objectives/list:
 *   get:
 *     tags: [Objectives]
 *     summary: Listar objetivos terapêuticos
 *     description: Lista objetivos do paciente logado, do terapeuta logado ou todos para admin
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
router.get('/list', auth, role('PATIENT', 'THERAPIST', 'ADMIN'), listObjectives);

/**
 * @openapi
 * /objectives/{objectiveId}:
 *   get:
 *     tags: [Objectives]
 *     summary: Buscar objetivo terapêutico por ID
 *     description: Retorna um objetivo terapêutico específico
 *     parameters:
 *       - in: path
 *         name: objectiveId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Objetivo encontrado
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Objetivo não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.get('/:objectiveId', auth, role('PATIENT', 'THERAPIST', 'ADMIN'), getObjectiveById);

/**
 * @openapi
 * /objectives/update/{objectiveId}:
 *   put:
 *     tags: [Objectives]
 *     summary: Atualizar objetivo terapêutico
 *     description: Atualiza um objetivo terapêutico existente
 *     parameters:
 *       - in: path
 *         name: objectiveId
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
 *                 example: Interação social
 *               evolution:
 *                 type: string
 *                 example: IMPROVED
 *     responses:
 *       200:
 *         description: Objetivo atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Objetivo não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.put('/update/:objectiveId', auth, role('THERAPIST', 'ADMIN'), updateObjective);

/**
 * @openapi
 * /objectives/delete/{objectiveId}:
 *   delete:
 *     tags: [Objectives]
 *     summary: Excluir objetivo terapêutico
 *     description: Remove um objetivo terapêutico existente
 *     parameters:
 *       - in: path
 *         name: objectiveId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Objetivo excluído com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Objetivo não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.delete('/delete/:objectiveId', auth, role('THERAPIST', 'ADMIN'), deleteObjective);

module.exports = router;