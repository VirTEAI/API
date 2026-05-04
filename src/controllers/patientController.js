const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const normalizeString = (value) => String(value || '').trim();

const parseDate = (value) => {

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const createPatientProfile = async (req, res) => {

  try {

    const role = req.body.role;
    
    if (role !== 'PATIENT') {
      
      return res.status(403).json({ error: 'Apenas pacientes podem criar perfil de paciente' });
    }
    
    const userId = Number(req.body.userId);
    const country = normalizeString(req.body.country);
    const city = normalizeString(req.body.city);
    const birthDate = parseDate(req.body.birthDate);

    if (!country || !city || !birthDate) {

      return res.status(400).json({
        error: 'país, cidade e data de nascimento são obrigatórios'
      });
    }

    const existingProfile = await prisma.patientProfile.findUnique({
      where: { userId }
    });

    if (existingProfile) {

      return res.status(409).json({ error: 'Perfil de paciente já existe' });
    }

    const patientProfile = await prisma.patientProfile.create({
      data: {
        userId,
        country,
        city,
        birthDate
      }
    });

    return res.status(201).json({
      message: 'Perfil de paciente criado com sucesso',
      patientProfile
    });
  } catch (error) {

    console.error('Error in createPatientProfile:', error);
    return res.status(500).json({ error: 'Erro ao criar perfil de paciente' });
  }
};

const getMyPatientProfile = async (req, res) => {

  try {

    const userId = req.user?.userId;
    const role = req.user?.role;

    if (role !== 'PATIENT') {

      return res.status(403).json({ error: 'Apenas pacientes podem acessar seu perfil de paciente' });
    }

    const profile = await prisma.patientProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            userId: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        },
        therapist: true,
        therapeuticObjectives: true,
        scenarios: true,
        _count: {
          select: {
            consultations: true
          }
        }
      }
    });

    if (!profile) {

      return res.status(404).json({ error: 'Perfil de paciente não encontrado' });
    }

    return res.json(profile);
  } catch (error) {

    console.error('Error in getMyPatientProfile:', error);
    return res.status(500).json({ error: 'Erro ao buscar perfil de paciente' });
  }
};

const getAllPatientProfiles = async (req, res) => {

  try {

    const profiles = await prisma.patientProfile.findMany({
      include: {
        user: {
          select: {
            userId: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        },
        therapist: true,
        therapeuticObjectives: true,
        scenarios: true,
        _count: {
          select: {
            consultations: true
          }
        }
      }
    });

    return res.json(profiles);
  } catch (error) {

    console.error('Error in getAllPatientProfiles:', error);
    return res.status(500).json({ error: 'Erro ao buscar perfis de pacientes' });
  }
};

const getPatientProfileById = async (req, res) => {

  try {

    const userId = Number(req.params.userId);
    const role = req.user?.role;

    if (role !== 'THERAPIST' && role !== 'ADMIN') {

      return res.status(403).json({ error: 'Apenas terapeutas e administradores podem acessar perfis de pacientes por ID' });
    }

    if (!Number.isInteger(userId) || userId <= 0) {

      return res.status(400).json({ error: 'ID do usuário inválido' });
    }

    const profile = await prisma.patientProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            userId: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        },
        therapist: true,
        therapeuticObjectives: true,
        scenarios: true,
        _count: {
          select: {
            consultations: true
          }
        }
      }
    });

    if (!profile) {

      return res.status(404).json({ error: 'Perfil de paciente não encontrado' });
    }

    return res.json(profile);
  } catch (error) {

    console.error('Error in getMyPatientProfile:', error);
    return res.status(500).json({ error: 'Erro ao buscar perfil de paciente' });
  }
};

const updatePatientProfileCareStatus = async (req, res) => {

    try {

        const userId = req.body.userId;
        const role = req.user?.role;

        if (role !== 'THERAPIST' && role !== 'ADMIN') {

            return res.status(403).json({ error: 'Apenas terapeutas e administradores podem atualizar o status de acompanhamento' });
        }

        const existing = await prisma.patientProfile.findUnique({
            where: { userId }
        });

        if (!existing) {

            return res.status(404).json({ error: 'Perfil de paciente não encontrado' });
        }

        const allowed = ['NOT_STARTED', 'IN_PROGRESS', 'PAUSED', 'FINISHED'];

        if (!allowed.includes(req.body.careStatus)) {

            return res.status(400).json({ error: 'Status de acompanhamento inválido' });
        }

        const updated = await prisma.patientProfile.update({
            where: { userId },
            data: { careStatus: req.body.careStatus }
        });

        return res.json({
            message: 'Status de acompanhamento atualizado com sucesso',
            patientProfile: updated
        });
    } catch (error) {

      console.error('Error in updatePatientProfileCareStatus:', error);
      return res.status(500).json({ error: 'Erro ao atualizar status de acompanhamento' });
    }
};

const updatePatientProfile = async (req, res) => {

  try {

    const userId = req.user?.userId;
    const role = req.user?.role;

    if (role !== 'PATIENT') {

      return res.status(403).json({ error: 'Apenas pacientes podem atualizar seu perfil de paciente' });
    }

    const existing = await prisma.patientProfile.findUnique({
      where: { userId }
    });

    if (!existing) {
        
      return res.status(404).json({ error: 'Perfil de paciente não encontrado' });
    }

    const data = {};

    if (req.body.country) data.country = normalizeString(req.body.country);
    if (req.body.city) data.city = normalizeString(req.body.city);

    if (req.body.birthDate) {

      const date = parseDate(req.body.birthDate);

      if (!date) {

        return res.status(400).json({ error: 'Data de nascimento inválida' });
      }

      data.birthDate = date;
    }

    const updated = await prisma.patientProfile.update({
      where: { userId },
      data
    });

    return res.json({
      message: 'Perfil atualizado com sucesso',
      patientProfile: updated
    });
  } catch (error) {

    console.error('Error in updatePatientProfile:', error);
    return res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

module.exports = {
  createPatientProfile,
  getMyPatientProfile,
  getAllPatientProfiles,
  getPatientProfileById,
  updatePatientProfileCareStatus,
  updatePatientProfile
};