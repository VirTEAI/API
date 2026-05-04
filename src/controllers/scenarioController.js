const { PrismaClient } = require('@prisma/client');
const { getTherapistProfileFromUserId, getPatientProfileFromUserId } = require('../services/getProfiles');
const { normalizeString, isValidId } = require('../utils/validation');

const prisma = new PrismaClient();

const createScenario = async (req, res) => {

  try {

    const userId = req.user?.userId;
    const role = req.user?.role;

    const patientId = Number(req.body.patientId);
    const title = normalizeString(req.body.title);
    const status = normalizeString(req.body.status) || 'NOT_STARTED';

    if (!isValidId(patientId)) {

      return res.status(400).json({ error: 'Perfil do paciente inválido' });
    }

    if (!title) {

      return res.status(400).json({ error: 'Título é obrigatório' });
    }

    const allowedStatus = ['NOT_STARTED', 'IN_PROGRESS', 'FINISHED'];

    if (!allowedStatus.includes(status)) {

      return res.status(400).json({
        error: 'Status inválido. Use NOT_STARTED, IN_PROGRESS ou FINISHED'
      });
    }

    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: patientId }
    });

    if (!patientProfile) {

      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    let therapistId = null;

    if (role === 'THERAPIST') {

      const therapistProfile = await getTherapistProfileFromUserId(userId);

      if (!therapistProfile) {

        return res.status(404).json({ error: 'Perfil de terapeuta não encontrado' });
      }

      therapistId = therapistProfile.therapistProfileId;
    } else {

      therapistId = Number(req.body.therapistId);

      if (!isValidId(therapistId)) {

        return res.status(400).json({ error: 'Perfil de terapeuta inválido' });
      }
    }

    const scenario = await prisma.scenario.create({
      data: {
        patientId,
        therapistId,
        title,
        status
      }
    });

    return res.status(201).json({
      message: 'Cenário criado com sucesso',
      scenario
    });
  } catch (error) {

    console.error('Erro em createScenario:', error);
    return res.status(500).json({ error: 'Erro ao criar cenário' });
  }
};

const listScenarios = async (req, res) => {

  try {

    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId) {

      return res.status(401).json({ error: 'Não autenticado' });
    }

    let where = {};

    if (role === 'PATIENT') {

      const patientProfile = await getPatientProfileFromUserId(userId);

      if (!patientProfile) {

        return res.status(404).json({ error: 'Perfil de paciente não encontrado' });
      }

      where = { patientId: patientProfile.patientProfileId };
    }

    if (role === 'THERAPIST') {

      const therapistProfile = await getTherapistProfileFromUserId(userId);

      if (!therapistProfile) {

        return res.status(404).json({ error: 'Perfil de terapeuta não encontrado' });
      }

      where = { therapistId: therapistProfile.therapistProfileId };
    }

    const scenarios = await prisma.scenario.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          include: {
            user: {
              select: {
                userId: true,
                name: true,
                email: true
              }
            }
          }
        },
        therapist: {
          include: {
            user: {
              select: {
                userId: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return res.json(scenarios);
  } catch (error) {

    console.error('Erro em listScenarios:', error);
    return res.status(500).json({ error: 'Erro ao listar cenários' });
  }
};

const getScenarioById = async (req, res) => {

  try {

    const scenarioId = Number(req.params.scenarioId);

    if (!isValidId(scenarioId)) {

      return res.status(400).json({ error: 'ID do cenário inválido' });
    }

    const scenario = await prisma.scenario.findUnique({
      where: { scenarioId },
      include: {
        patient: {
          include: {
            user: {
              select: {
                userId: true,
                name: true,
                email: true
              }
            }
          }
        },
        therapist: {
          include: {
            user: {
              select: {
                userId: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!scenario) {

      return res.status(404).json({ error: 'Cenário não encontrado' });
    }

    return res.json(scenario);
  } catch (error) {

    console.error('Erro em getScenarioById:', error);
    return res.status(500).json({ error: 'Erro ao buscar cenário' });
  }
};

const updateScenario = async (req, res) => {

  try {

    const scenarioId = Number(req.params.scenarioId);
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!isValidId(scenarioId)) {

      return res.status(400).json({ error: 'ID do cenário inválido' });
    }

    const existing = await prisma.scenario.findUnique({
      where: { scenarioId }
    });

    if (!existing) {

      return res.status(404).json({ error: 'Cenário não encontrado' });
    }

    if (role === 'THERAPIST') {

      const therapistProfile = await getTherapistProfileFromUserId(userId);

      if (!therapistProfile || therapistProfile.therapistProfileId !== existing.therapistId) {

        return res.status(403).json({ error: 'Você não pode alterar este cenário' });
      }
    }

    const data = {};

    if (req.body.title) {

      const title = normalizeString(req.body.title);

      if (!title) {

        return res.status(400).json({ error: 'Título não pode ser vazio' });
      }

      data.title = title;
    }

    if (req.body.status) {

      const status = normalizeString(req.body.status);
      const allowed = ['NOT_STARTED', 'IN_PROGRESS', 'FINISHED'];

      if (!allowed.includes(status)) {

        return res.status(400).json({
          error: 'Status inválido. Use NOT_STARTED, IN_PROGRESS ou FINISHED'
        });
      }

      data.status = status;
    }

    const updated = await prisma.scenario.update({
      where: { scenarioId },
      data
    });

    return res.json({
      message: 'Cenário atualizado com sucesso',
      scenario: updated
    });
  } catch (error) {

    console.error('Erro em updateScenario:', error);
    return res.status(500).json({ error: 'Erro ao atualizar cenário' });
  }
};

const deleteScenario = async (req, res) => {

  try {

    const scenarioId = Number(req.params.scenarioId);
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!isValidId(scenarioId)) {

      return res.status(400).json({ error: 'ID do cenário inválido' });
    }

    const existing = await prisma.scenario.findUnique({
      where: { scenarioId }
    });

    if (!existing) {

      return res.status(404).json({ error: 'Cenário não encontrado' });
    }

    if (role === 'THERAPIST') {

      const therapistProfile = await getTherapistProfileFromUserId(userId);

      if (!therapistProfile || therapistProfile.therapistProfileId !== existing.therapistId) {

        return res.status(403).json({ error: 'Você não pode excluir este cenário' });
      }
    }

    await prisma.scenario.delete({
      where: { scenarioId }
    });

    return res.json({ message: 'Cenário excluído com sucesso' });
  } catch (error) {
    
    console.error('Erro em deleteScenario:', error);
    return res.status(500).json({ error: 'Erro ao excluir cenário' });
  }
};

module.exports = {
  createScenario,
  listScenarios,
  getScenarioById,
  updateScenario,
  deleteScenario
};