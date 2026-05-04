const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const isValidId = (value) => Number.isInteger(value) && value > 0;
const normalizeString = (value) => String(value || '').trim();

const getTherapistProfileFromUserId = async (userId) => {

  return prisma.therapistProfile.findUnique({
    where: { userId }
  });
};

const getPatientProfileFromUserId = async (userId) => {

  return prisma.patientProfile.findUnique({
    where: { userId }
  });
};

const createObjective = async (req, res) => {

  try {

    const userId = req.user?.userId;
    const role = req.user?.role;

    const patientId = Number(req.body.patientId);
    const title = normalizeString(req.body.title);

    if (!isValidId(patientId)) {

      return res.status(400).json({ error: 'ID do perfil do paciente inválido' });
    }

    if (!title) {

      return res.status(400).json({ error: 'Título é obrigatório' });
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

        return res.status(400).json({ error: 'ID do perfil do terapeuta inválido' });
      }
    }

    const objective = await prisma.therapeuticObjective.create({
      data: {
        patientId,
        therapistId,
        title
      }
    });

    return res.status(201).json({
      message: 'Objetivo terapêutico criado com sucesso',
      objective
    });
  } catch (error) {

    console.error('Erro em createObjective:', error);
    return res.status(500).json({ error: 'Erro ao criar objetivo terapêutico' });
  }
};

const listObjectives = async (req, res) => {

  try {

    const userId = req.user?.userId;
    const role = req.user?.role;

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

    const objectives = await prisma.therapeuticObjective.findMany({
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

    return res.json(objectives);
  } catch (error) {

    console.error('Erro em listObjectives:', error);
    return res.status(500).json({ error: 'Erro ao listar objetivos terapêuticos' });
  }
};

const getObjectiveById = async (req, res) => {

  try {

    const objectiveId = Number(req.params.objectiveId);

    if (!isValidId(objectiveId)) {

      return res.status(400).json({ error: 'ID do objetivo inválido' });
    }

    const objective = await prisma.therapeuticObjective.findUnique({
      where: { therapeuticObjectiveId: objectiveId },
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

    if (!objective) {

      return res.status(404).json({ error: 'Objetivo terapêutico não encontrado' });
    }

    return res.json(objective);
  } catch (error) {

    console.error('Erro em getObjectiveById:', error);
    return res.status(500).json({ error: 'Erro ao buscar objetivo terapêutico' });
  }
};

const updateObjective = async (req, res) => {

  try {

    const objectiveId = Number(req.params.objectiveId);
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!isValidId(objectiveId)) {

      return res.status(400).json({ error: 'ID do objetivo inválido' });
    }

    const existing = await prisma.therapeuticObjective.findUnique({
      where: { therapeuticObjectiveId: objectiveId }
    });

    if (!existing) {

      return res.status(404).json({ error: 'Objetivo terapêutico não encontrado' });
    }

    if (role === 'THERAPIST') {

      const therapistProfile = await getTherapistProfileFromUserId(userId);

      if (!therapistProfile || therapistProfile.therapistProfileId !== existing.therapistId) {

        return res.status(403).json({ error: 'Você não pode alterar este objetivo' });
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

    const updated = await prisma.therapeuticObjective.update({
      where: { therapeuticObjectiveId: objectiveId },
      data
    });

    return res.json({
      message: 'Objetivo terapêutico atualizado com sucesso',
      objective: updated
    });
  } catch (error) {

    console.error('Erro em updateObjective:', error);
    return res.status(500).json({ error: 'Erro ao atualizar objetivo terapêutico' });
  }
};

const deleteObjective = async (req, res) => {

  try {

    const objectiveId = Number(req.params.objectiveId);
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!isValidId(objectiveId)) {

      return res.status(400).json({ error: 'ID do objetivo inválido' });
    }

    const existing = await prisma.therapeuticObjective.findUnique({

      where: { therapeuticObjectiveId: objectiveId }
    });

    if (!existing) {

      return res.status(404).json({ error: 'Objetivo terapêutico não encontrado' });
    }

    if (role === 'THERAPIST') {

      const therapistProfile = await getTherapistProfileFromUserId(userId);

      if (!therapistProfile || therapistProfile.therapistProfileId !== existing.therapistId) {

        return res.status(403).json({ error: 'Você não pode excluir este objetivo' });
      }
    }

    await prisma.therapeuticObjective.delete({
      where: { therapeuticObjectiveId: objectiveId }
    });

    return res.json({ message: 'Objetivo terapêutico excluído com sucesso' });
  } catch (error) {
    
    console.error('Erro em deleteObjective:', error);
    return res.status(500).json({ error: 'Erro ao excluir objetivo terapêutico' });
  }
};

module.exports = {
  createObjective,
  listObjectives,
  getObjectiveById,
  updateObjective,
  deleteObjective
};