const express = require('express');

const {
  createReport,
  listReports,
  getReportById,
  updateReport,
  deleteReport
} = require('../controllers/reportController');

const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Reports
 *   description: Gerenciamento de relatórios
 */

/**
 * @openapi
 * /reports/create:
 *   post:
 *     tags: [Reports]
 *     summary: Criar relatório
 *     description: Cria um novo relatório clínico
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patientId, sessionObjective, title, evolution, content]
 *             properties:
 *               patientId:
 *                 type: integer
 *                 example: 1
 *               therapistId:
 *                 type: integer
 *                 example: 2
 *               consultationId:
 *                 type: integer
 *                 example: 5
 *               sessionObjective:
 *                 type: string
 *                 example: Trabalhar interação social
 *               title:
 *                 type: string
 *                 example: Evolução da sessão
 *               evolution:
 *                 type: string
 *                 example: IMPROVED
 *               content:
 *                 type: string
 *                 example: O paciente demonstrou mais iniciativa...
 *     responses:
 *       201:
 *         description: Relatório criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Paciente, terapeuta ou consulta não encontrada
 *       500:
 *         description: Erro do servidor
 */
router.post('/create', auth, role('THERAPIST', 'ADMIN'), createReport);

/**
 * @openapi
 * /reports/list:
 *   get:
 *     tags: [Reports]
 *     summary: Listar relatórios
 *     description: Lista relatórios do paciente logado, do terapeuta logado ou todos para admin
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
router.get('/list', auth, role('PATIENT', 'THERAPIST', 'ADMIN'), listReports);

/**
 * @openapi
 * /reports/{reportId}:
 *   get:
 *     tags: [Reports]
 *     summary: Buscar relatório por ID
 *     description: Retorna um relatório clínico específico
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Relatório encontrado
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Relatório não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.get('/:reportId', auth, role('PATIENT', 'THERAPIST', 'ADMIN'), getReportById);

/**
 * @openapi
 * /reports/update/{reportId}:
 *   put:
 *     tags: [Reports]
 *     summary: Atualizar relatório
 *     description: Atualiza um relatório clínico existente
 *     parameters:
 *       - in: path
 *         name: reportId
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
 *               sessionObjective:
 *                 type: string
 *                 example: Trabalhar interação social
 *               title:
 *                 type: string
 *                 example: Evolução da sessão
 *               evolution:
 *                 type: string
 *                 example: MAINTAINED
 *               content:
 *                 type: string
 *                 example: O paciente manteve o padrão...
 *               consultationId:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Relatório atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Relatório não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.put('/update/:reportId', auth, role('THERAPIST', 'ADMIN'), updateReport);

/**
 * @openapi
 * /reports/delete/{reportId}:
 *   delete:
 *     tags: [Reports]
 *     summary: Excluir relatório
 *     description: Remove um relatório clínico existente
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Relatório excluído com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Relatório não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.delete('/delete/:reportId', auth, role('THERAPIST', 'ADMIN'), deleteReport);

module.exports = router;