const express = require('express');

const {
  createConsultation,
  listConsultations,
  getConsultationById,
  updateConsultation,
  deleteConsultation
} = require('../controllers/consultationController');

const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Consultations
 *   description: Gerenciamento de consultas
 */

/**
 * @openapi
 * /consultations/create:
 *   post:
 *     tags: [Consultations]
 *     summary: Criar consulta
 *     description: Cria uma nova consulta vinculada a um paciente e terapeuta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patientProfileId, consultationDate, objective, score]
 *             properties:
 *               patientProfileId:
 *                 type: integer
 *                 example: 1
 *               therapistProfileId:
 *                 type: integer
 *                 example: 2
 *               consultationDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-04-30T15:00:00.000Z
 *               objective:
 *                 type: string
 *                 example: Trabalhar interação social
 *               score:
 *                 type: integer
 *                 example: 80
 *     responses:
 *       201:
 *         description: Consulta criada com sucesso
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
router.post('/create', auth, role('THERAPIST', 'ADMIN'), createConsultation);

/**
 * @openapi
 * /consultations/list:
 *   get:
 *     tags: [Consultations]
 *     summary: Listar consultas
 *     description: Lista consultas do paciente logado, do terapeuta logado ou todas para admin
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
router.get('/list', auth, role('PATIENT', 'THERAPIST', 'ADMIN'), listConsultations);

/**
 * @openapi
 * /consultations/{consultationId}:
 *   get:
 *     tags: [Consultations]
 *     summary: Buscar consulta por ID
 *     description: Retorna uma consulta específica
 *     parameters:
 *       - in: path
 *         name: consultationId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Consulta encontrada
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Consulta não encontrada
 *       500:
 *         description: Erro do servidor
 */
router.get('/:consultationId', auth, role('PATIENT', 'THERAPIST', 'ADMIN'), getConsultationById);

/**
 * @openapi
 * /consultations/update/{consultationId}:
 *   put:
 *     tags: [Consultations]
 *     summary: Atualizar consulta
 *     description: Atualiza uma consulta existente
 *     parameters:
 *       - in: path
 *         name: consultationId
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
 *               patientProfileId:
 *                 type: integer
 *                 example: 1
 *               consultationDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-04-30T15:00:00.000Z
 *               objective:
 *                 type: string
 *                 example: Ajustar objetivo terapêutico
 *               score:
 *                 type: integer
 *                 example: 90
 *     responses:
 *       200:
 *         description: Consulta atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Consulta não encontrada
 *       500:
 *         description: Erro do servidor
 */
router.put('/update/:consultationId', auth, role('THERAPIST', 'ADMIN'), updateConsultation);

/**
 * @openapi
 * /consultations/delete/{consultationId}:
 *   delete:
 *     tags: [Consultations]
 *     summary: Excluir consulta
 *     description: Remove uma consulta existente
 *     parameters:
 *       - in: path
 *         name: consultationId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Consulta excluída com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Consulta não encontrada
 *       500:
 *         description: Erro do servidor
 */
router.delete('/delete/:consultationId', auth, role('THERAPIST', 'ADMIN'), deleteConsultation);

module.exports = router;