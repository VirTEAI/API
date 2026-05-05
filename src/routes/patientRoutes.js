const express = require('express');

const {
  // createPatientProfile,
  getMyPatientProfile,
  getAllPatientProfiles,
  getPatientProfileById,
  updatePatientProfileCareStatus,
  updatePatientProfile
} = require('../controllers/patientController');

const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

const router = express.Router();

// /**
//  * @openapi
//  * tags:
//  *   name: Patients
//  *   description: Gerenciamento de perfis de pacientes
//  */

// /**
//  * @openapi
//  * /patients/create:
//  *   post:
//  *     tags: [Patients]
//  *     summary: Criar perfil de paciente
//  *     description: Cria o perfil clínico do paciente autenticado
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required: [city, birthDate]
//  *             properties:
//  *               city:
//  *                 type: string
//  *                 example: São Paulo
//  *               birthDate:
//  *                 type: string
//  *                 format: date
//  *                 example: 2000-01-15
//  *     responses:
//  *       201:
//  *         description: Perfil criado com sucesso
//  *       400:
//  *         description: Dados inválidos
//  *       401:
//  *         description: Não autenticado
//  *       403:
//  *         description: Acesso negado
//  *       409:
//  *         description: Perfil já existe
//  *       500:
//  *         description: Erro do servidor
//  */
// router.post('/create', createPatientProfile);

/**
 * @openapi
 * /patients/me:
 *   get:
 *     tags: [Patients]
 *     summary: Obter meu perfil de paciente (apenas para pacientes)
 *     description: Retorna o perfil clínico do paciente autenticado
 *     responses:
 *       200:
 *         description: Perfil encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Perfil não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.get('/me', auth, role('PATIENT'), getMyPatientProfile);

/**
 * @openapi
 * /patients/list:
 *   get:
 *     tags: [Patients]
 *     summary: Listar todos os perfis de pacientes
 *     description: Retorna uma lista de todos os perfis de pacientes
 *     responses:
 *       200:
 *         description: Perfis encontrados
 *       401:
 *         description: Não autenticado
 *       500:
 *         description: Erro do servidor
 */
router.get('/list', auth, getAllPatientProfiles);

/**
 * @openapi
 * /patients/{userId}:
 *   get:
 *     tags: [Patients]
 *     summary: Buscar perfil de paciente por ID (apenas para terapeutas e administradores)
 *     description: Retorna o perfil clínico de um paciente específico
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Perfil encontrado
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Perfil não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.get('/:userId', auth, role('THERAPIST', 'ADMIN'), getPatientProfileById);

/**
 * @openapi
 * /patients/care-status:
 *   patch:
 *     tags: [Patients]
 *     summary: Atualizar status de acompanhamento do paciente (apenas terapeutas e administradores)
 *     description: Permite que terapeutas ou administradores atualizem o status de acompanhamento de um paciente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [careStatus]
 *             properties:
 *               careStatus:
 *                 type: string
 *                 enum: [NOT_STARTED, IN_PROGRESS, PAUSED, FINISHED]
 *                 example: IN_PROGRESS
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 *       400:
 *         description: Status inválido
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Perfil não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.patch('/care-status', auth, role('THERAPIST', 'ADMIN'), updatePatientProfileCareStatus);

/**
 * @openapi
 * /patients/update:
 *   put:
 *     tags: [Patients]
 *     summary: Atualizar meu perfil de paciente
 *     description: Atualiza o perfil clínico do paciente autenticado
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               city:
 *                 type: string
 *                 example: São Paulo
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: 2000-01-15
 *               careStatus:
 *                 type: string
 *                 example: IN_PROGRESS
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Perfil não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.put('/update', auth, role('PATIENT'), updatePatientProfile);

module.exports = router;