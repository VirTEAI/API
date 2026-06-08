const prisma = require('../config/prisma');
const path = require('path');
const { PutObjectCommand, HeadObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('../config/filebase');
const { normalizeString, parseDate, isCityValid } = require('../utils/validation');
const { parsePagination } = require('../utils/pagination');

// const createPatientProfile = async (req, res) => {

//   try {

//     const role = req.body.role;
    
//     if (role !== 'PATIENT') {
      
//       return res.status(403).json({ error: 'Apenas pacientes podem criar perfil de paciente' });
//     }
    
//     const userId = Number(req.body.userId);
//     const city = normalizeString(req.body.city);
//     const birthDate = parseDate(req.body.birthDate);

//     if (!city || !birthDate) {

//       return res.status(400).json({
//         error: 'país, cidade e data de nascimento são obrigatórios'
//       });
//     }

//     const existingProfile = await prisma.patientProfile.findUnique({
//       where: { userId }
//     });

//     if (existingProfile) {

//       return res.status(409).json({ error: 'Perfil de paciente já existe' });
//     }

//     const patientProfile = await prisma.patientProfile.create({
//       data: {
//         userId,
//         city,
//         birthDate
//       }
//     });

//     return res.status(201).json({
//       message: 'Perfil de paciente criado com sucesso',
//       patientProfile
//     });
//   } catch (error) {

//     console.error('Error in createPatientProfile:', error);
//     return res.status(500).json({ error: 'Erro ao criar perfil de paciente' });
//   }
// };

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

    const { skip, take } = parsePagination(req.query);

    const profiles = await prisma.patientProfile.findMany({
      ...(skip !== undefined ? { skip } : {}),
      ...(take !== undefined ? { take } : {}),
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
            updatedAt: true,
            sessions: true
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

        const patientUserId = Number(req.body.userId);
        const requesterId = req.user?.userId;
        const role = req.user?.role;

        if (role !== 'THERAPIST' && role !== 'ADMIN') {

            return res.status(403).json({ error: 'Apenas terapeutas e administradores podem atualizar o status de acompanhamento' });
        }

        if (!Number.isInteger(patientUserId) || patientUserId <= 0) {

            return res.status(400).json({ error: 'ID do paciente inválido' });
        }

        const existing = await prisma.patientProfile.findUnique({
            where: { userId: patientUserId }
        });

        if (!existing) {

            return res.status(404).json({ error: 'Perfil de paciente não encontrado' });
        }

        if (role === 'THERAPIST' && existing.therapistId !== requesterId) {

            return res.status(403).json({ error: 'Você não pode alterar o status de um paciente que não é seu' });
        }

        const allowed = ['NOT_STARTED', 'IN_PROGRESS', 'PAUSED', 'FINISHED'];

        if (!allowed.includes(req.body.careStatus)) {

            return res.status(400).json({ error: 'Status de acompanhamento inválido' });
        }

        const updated = await prisma.patientProfile.update({
            where: { userId: patientUserId },
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

    if (req.body.city) {

      const cityData = await isCityValid(req.body.city);

      if (!cityData) {

        return res.status(400).json({ error: 'Cidade inválida' });
      }

      data.city = cityData.name;
    }

    if (req.body.birthDate) {

      const date = parseDate(req.body.birthDate);

      if (!date) {

        return res.status(400).json({ error: 'Data de nascimento inválida' });
      }

      data.birthDate = date;
    }

    let oldProfilePictureKey = existing.profilePictureKey || null;

    if (req.file) {

      const ext = path.extname(req.file.originalname) || '.jpg';
      const key = `patients/${userId}/avatar-${Date.now()}${ext}`;

      await s3.send(new PutObjectCommand({
        Bucket: process.env.FILEBASE_BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      }));

      const head = await s3.send(new HeadObjectCommand({
        Bucket: process.env.FILEBASE_BUCKET,
        Key: key,
      }));

      

      data.profilePictureKey = key;
      data.profilePictureCid = head.Metadata?.cid || null;
      data.profilePictureUrl = `${process.env.FILEBASE_GATEWAY_URL}/ipfs/${data.profilePictureCid || key}`;

      if (oldProfilePictureKey) {
        
        await s3.send(new DeleteObjectCommand({
          Bucket: process.env.FILEBASE_BUCKET,
          Key: oldProfilePictureKey,
        }));
      }
    }

    const updated = await prisma.patientProfile.update({
      where: { userId },
      data,
      include: {
        user: true
      }
    });

    let updatedUser = null;

    if (req.body.name) {

      updatedUser = await prisma.user.update({
        where: { userId },
        data: { name: normalizeString(req.body.name) }
      });
    }

    const mergedUpdated = {
      ...updated,
      name: updatedUser?.name || updated.user.name
    };

    return res.json({
      message: 'Perfil atualizado com sucesso',
      patientProfile: mergedUpdated 
    });
  } catch (error) {

    console.error('Error in updatePatientProfile:', error);
    return res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

module.exports = {
  // createPatientProfile,
  getMyPatientProfile,
  getAllPatientProfiles,
  getPatientProfileById,
  updatePatientProfileCareStatus,
  updatePatientProfile
};
