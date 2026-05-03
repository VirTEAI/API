const express = require('express');

const {
  createTherapistProfile,
  getMyTherapistProfile,
  updateTherapistProfile
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

/**
 * @openapi
 * /therapists/create:
 *   post:
 *     tags: [Therapists]
 *     summary: Criar perfil de terapeuta
 *     description: Cria o perfil clínico do terapeuta autenticado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [professionalRegister, country, city, birthDate, position, specialty, experience]
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
 *                 example: 5 anos de experiência
 *               attendanceModality:
 *                 type: string
 *                 example: BOTH
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
router.post('/create', auth, role('THERAPIST'), createTherapistProfile);

/**
 * @openapi
 * /therapists/me:
 *   get:
 *     tags: [Therapists]
 *     summary: Obter meu perfil de terapeuta
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
 * /therapists/update:
 *   put:
 *     tags: [Therapists]
 *     summary: Atualizar meu perfil de terapeuta
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

module.exports = router;