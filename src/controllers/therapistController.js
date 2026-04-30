const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const normalizeString = (value) => String(value || '').trim();

const parseDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const createTherapistProfile = async (req, res) => {

  try {

    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId) {

      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (role !== 'THERAPIST') {
        
      return res.status(403).json({ error: 'Apenas terapeutas podem criar perfil' });
    }

    const {
      professionalRegister,
      country,
      city,
      birthDate,
      position,
      specialty,
      experience,
      attendanceModality
    } = req.body;

    if (
      !professionalRegister ||
      !country ||
      !city ||
      !birthDate ||
      !position ||
      !specialty ||
      !experience
    ) {

      return res.status(400).json({
        error: 'Campos obrigatórios não preenchidos'
      });
    }

    const existing = await prisma.therapistProfile.findUnique({
      where: { userId }
    });

    if (existing) {
        
      return res.status(409).json({ error: 'Perfil de terapeuta já existe' });
    }

    const profile = await prisma.therapistProfile.create({
      data: {
        userId,
        professionalRegister,
        country,
        city,
        birthDate: parseDate(birthDate),
        position,
        specialty,
        experience,
        attendanceModality: attendanceModality || 'ONLINE'
      }
    });

    return res.status(201).json({
      message: 'Perfil de terapeuta criado com sucesso',
      therapistProfile: profile
    });
  } catch (error) {

    console.error('Error in createTherapistProfile:', error);
    return res.status(500).json({ error: 'Erro ao criar perfil de terapeuta' });
  }
};

const getMyTherapistProfile = async (req, res) => {
    
  try {

    const userId = req.user.userId;

    const profile = await prisma.therapistProfile.findUnique({
      where: { userId },
      include: {
        _count: {
          select: {
            consultations: true
          }
        }
      }
    });

    if (!profile) {

      return res.status(404).json({ error: 'Perfil de terapeuta não encontrado' });
    }

    return res.json(profile);
  } catch (error) {

    console.error('Error in getMyTherapistProfile:', error);
    return res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
};

const getAllTherapistProfiles = async (req, res) => {

  try {

    const profiles = await prisma.therapistProfile.findMany({
      include: {
        _count: {
          select: {
            consultations: true
          }
        }
      }
    });

    return res.json(profiles);
  } catch (error) {

    console.error('Error in getAllTherapistProfiles:', error);
    return res.status(500).json({ error: 'Erro ao buscar perfis' });
  }
};

const getTherapistProfileById = async (req, res) => {

  try {

    const therapistId = Number(req.params.therapistId);

    if (!Number.isInteger(therapistId) || therapistId <= 0) {

      return res.status(400).json({ error: 'ID do terapeuta inválido' });
    }

    const profile = await prisma.therapistProfile.findUnique({
      where: { userId: therapistId },
      include: {
        _count: {
          select: {
            consultations: true
          }
        }
      }
    });

    if (!profile) {

      return res.status(404).json({ error: 'Perfil de terapeuta não encontrado' });
    }

    return res.json(profile);
  } catch (error) {

    console.error('Error in getMyTherapistProfile:', error);
    return res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
};

const updateTherapistProfile = async (req, res) => {

  try {

    const userId = req.user.userId;

    const existing = await prisma.therapistProfile.findUnique({
      where: { userId }
    });

    if (!existing) {

      return res.status(404).json({ error: 'Perfil não encontrado' });
    }

    const data = {};

    if (req.body.professionalRegister) data.professionalRegister = normalizeString(req.body.professionalRegister);
    if (req.body.country) data.country = normalizeString(req.body.country);
    if (req.body.city) data.city = normalizeString(req.body.city);
    if (req.body.position) data.position = normalizeString(req.body.position);
    if (req.body.specialty) data.specialty = normalizeString(req.body.specialty);
    if (req.body.experience) data.experience = normalizeString(req.body.experience);

    if (req.body.birthDate) {

      const date = parseDate(req.body.birthDate);

      if (!date) {

        return res.status(400).json({ error: 'Data inválida' });
      }

      data.birthDate = date;
    }

    if (req.body.attendanceModality) {

      const allowed = ['ONLINE', 'PRESENTIAL', 'BOTH'];

      if (!allowed.includes(req.body.attendanceModality)) {

        return res.status(400).json({ error: 'Modalidade inválida' });
      }

      data.attendanceModality = req.body.attendanceModality;
    }

    const updated = await prisma.therapistProfile.update({
      where: { userId },
      data
    });

    return res.json({
      message: 'Perfil atualizado com sucesso',
      therapistProfile: updated
    });
  } catch (error) {

    console.error('Error in updateTherapistProfile:', error);
    return res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

module.exports = {
  createTherapistProfile,
  getMyTherapistProfile,
  getAllTherapistProfiles,
  getTherapistProfileById,
  updateTherapistProfile
};