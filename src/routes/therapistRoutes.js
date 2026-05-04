const express = require('express');

const {
  // createTherapistProfile,
  getMyTherapistProfile,
  getAllTherapistProfiles,
  getTherapistPatients,
  getTherapistProfileById,
  updateTherapistProfile,
  takePatient
} = require('../controllers/therapistController');

const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Therapists
 *   description: Gerenciamento de perfis de terapeutas
 */

// /**
//  * @openapi
//  * /therapists/create:
//  *   post:
//  *     tags: [Therapists]
//  *     summary: Criar perfil de terapeuta
//  *     description: Cria o perfil clínico do terapeuta autenticado
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required: [professionalRegister, country, city, birthDate, position, specialty, experience]
//  *             properties:
//  *               professionalRegister:
//  *                 type: string
//  *                 example: CRP 00/00000
//  *               country:
//  *                 type: string
//  *                 example: Brasil
//  *               city:
//  *                 type: string
//  *                 example: São Paulo
//  *               birthDate:
//  *                 type: string
//  *                 format: date
//  *                 example: 1990-05-20
//  *               position:
//  *                 type: string
//  *                 example: Terapeuta
//  *               specialty:
//  *                 type: string
//  *                 example: Terapia Cognitivo-Comportamental
//  *               experience:
//  *                 type: string
//  *                 example: 5 anos de experiência
//  *               attendanceModality:
//  *                 type: string
//  *                 example: BOTH
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
// router.post('/create', createTherapistProfile);

/**
 * @openapi
 * /therapists/me:
 *   get:
 *     tags: [Therapists]
 *     summary: Obter meu perfil de terapeuta (apenas para terapeutas)
 *     description: Retorna o perfil clínico do terapeuta autenticado
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
router.get('/me', auth, role('THERAPIST'), getMyTherapistProfile);

/**
 * @openapi
 * /therapists/list:
 *   get:
 *     tags: [Therapists]
 *     summary: Listar todos os perfis de terapeutas
 *     description: Retorna uma lista de todos os perfis de terapeutas
 *     responses:
 *       200:
 *         description: Perfis encontrados
 *       401:
 *         description: Não autenticado
 *       500:
 *         description: Erro do servidor
 */
router.get('/list', auth, getAllTherapistProfiles);

/**
 * @openapi
 * /therapists/patients:
 *   get:
 *     tags: [Therapists]
 *     summary: Listar pacientes associados ao meu perfil de terapeuta (apenas para terapeutas)
 *     description: Retorna uma lista de pacientes associados ao perfil clínico do terapeuta autenticado
 *     responses:
 *       200:
 *         description: Pacientes encontrados
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro do servidor
 */
router.get('/patients', auth, role('THERAPIST'), getTherapistPatients);

/**
 * @openapi
 * /therapists/{userId}:
 *   get:
 *     tags: [Therapists]
 *     summary: Buscar perfil de terapeuta por ID
 *     description: Retorna o perfil clínico de um terapeuta específico
 *     responses:
 *       200:
 *         description: Perfil encontrado
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Perfil não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.get('/:userId', auth, getTherapistProfileById);

/**
 * @openapi
 * /therapists/update:
 *   put:
 *     tags: [Therapists]
 *     summary: Atualizar meu perfil de terapeuta (apenas para terapeutas)
 *     description: Atualiza o perfil clínico do terapeuta autenticado
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               professionalRegister:
 *                 type: string
 *                 example: CRP 00/00000
 *               country:
 *                 type: string
 *                 example: Brasil
 *               city:
 *                 type: string
 *                 example: São Paulo
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: 1990-05-20
 *               position:
 *                 type: string
 *                 example: Terapeuta
 *               specialty:
 *                 type: string
 *                 example: Terapia Cognitivo-Comportamental
 *               experience:
 *                 type: string
 *                 example: 7 anos de experiência
 *               attendanceModality:
 *                 type: string
 *                 example: ONLINE
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
router.put('/update', auth, role('THERAPIST'), updateTherapistProfile);

/**
 * @openapi
 * /therapists/take-patient/{patientId}:
 *   patch:
 *     tags: [Therapists]
 *     summary: Assumir acompanhamento de um paciente (apenas para terapeutas)
 *     description: Permite que um terapeuta assuma o acompanhamento de um paciente, associando o paciente ao perfil do terapeuta
 *     responses:
 *       200:
 *         description: Paciente associado ao terapeuta com sucesso
 *       400:
 *         description: ID do paciente inválido
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Perfil de terapeuta ou paciente não encontrado
 *       409:
 *         description: Paciente já está associado a um terapeuta
 *       500:
 *         description: Erro do servidor
*/
router.patch('/take-patient/:patientId', auth, role('THERAPIST'), takePatient);

module.exports = router;