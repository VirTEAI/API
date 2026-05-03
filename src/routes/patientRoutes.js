const express = require('express');

const {
  createPatientProfile,
  getMyPatientProfile,
  updatePatientProfile
} = require('../controllers/patientController');

const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Patients
 *   description: Gerenciamento de perfis de pacientes
 */

/**
 * @openapi
 * /patients/create:
 *   post:
 *     tags: [Patients]
 *     summary: Criar perfil de paciente
 *     description: Cria o perfil clínico do paciente autenticado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [country, city, birthDate]
 *             properties:
 *               country:
 *                 type: string
 *                 example: Brasil
 *               city:
 *                 type: string
 *                 example: São Paulo
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: 2000-01-15
 *               careStatus:
 *                 type: string
 *                 example: NOT_STARTED
 *     responses:
 *       201:
 *         description: Perfil criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       409:
 *         description: Perfil já existe
 *       500:
 *         description: Erro do servidor
 */
router.post('/create', createPatientProfile);

/**
 * @openapi
 * /patients/me:
 *   get:
 *     tags: [Patients]
 *     summary: Obter meu perfil de paciente
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
 *               country:
 *                 type: string
 *                 example: Brasil
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