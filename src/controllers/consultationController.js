const { PrismaClient } = require('@prisma/client');
const { getTherapistProfileFromUserId, getPatientProfileFromUserId } = require('../services/getProfilesService');
const { normalizeString, parseDate, isValidId } = require('../utils/validation');

const prisma = new PrismaClient();

const createConsultation = async (req, res) => {

  try {

    const userId = req.user?.userId;
    const role = req.user?.role;

    const patientId = Number(req.body.patientId);
    const consultationDate = parseDate(req.body.consultationDate);
    const objective = normalizeString(req.body.objective);
    const score = Number(req.body.score);

    if (!isValidId(patientId)) {

      return res.status(400).json({ error: 'ID do paciente inválido' });
    }

    if (!consultationDate) {

      return res.status(400).json({ error: 'Data da consulta inválida' });
    }

    if (!objective) {

      return res.status(400).json({ error: 'Objetivo da consulta é obrigatório' });
    }

    if (!Number.isInteger(score) || score < 0 || score > 100) {

      return res.status(400).json({ error: 'Pontuação deve estar entre 0 e 100' });
    }

    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: patientId }
    });

    if (!patientProfile) {

      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    let therapistProfile = null;

    if (role === 'THERAPIST') {

      therapistProfile = await getTherapistProfileFromUserId(userId);

      if (!therapistProfile) {

        return res.status(404).json({ error: 'Perfil de terapeuta não encontrado' });
      }
    }

    const consultation = await prisma.consultation.create({
      data: {
        patientId,
        therapistId: role === 'ADMIN' ? Number(req.body.therapistId) : userId,
        consultationDate,
        objective,
        score
      },
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

    return res.status(201).json({
      message: 'Consulta criada com sucesso',
      consultation
    });
  } catch (error) {

    console.error('Erro em createConsultation:', error);
    return res.status(500).json({ error: 'Erro ao criar consulta' });
  }
};

const listConsultations = async (req, res) => {

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
    } else if (role === 'THERAPIST') {

      const therapistProfile = await getTherapistProfileFromUserId(userId);

      if (!therapistProfile) {

        return res.status(404).json({ error: 'Perfil de terapeuta não encontrado' });
      }

      where = { therapistId: therapistProfile.therapistProfileId };
    }

    const consultations = await prisma.consultation.findMany({
      where,
      orderBy: { consultationDate: 'desc' },
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

    return res.json(consultations);
  } catch (error) {

    console.error('Erro em listConsultations:', error);
    return res.status(500).json({ error: 'Erro ao listar consultas' });
  }
};

const getConsultationById = async (req, res) => {

  try {

    const consultationId = Number(req.params.consultationId);

    if (!isValidId(consultationId)) {

      return res.status(400).json({ error: 'ID da consulta inválido' });
    }

    const consultation = await prisma.consultation.findUnique({
      where: { consultationId },
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

    if (!consultation) {

      return res.status(404).json({ error: 'Consulta não encontrada' });
    }

    return res.json(consultation);
  } catch (error) {

    console.error('Erro em getConsultationById:', error);
    return res.status(500).json({ error: 'Erro ao buscar consulta' });
  }
};

const updateConsultation = async (req, res) => {

  try {

    const consultationId = Number(req.params.consultationId);
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!isValidId(consultationId)) {

      return res.status(400).json({ error: 'ID da consulta inválido' });
    }

    if (role !== 'THERAPIST' && role !== 'ADMIN') {

      return res.status(403).json({ error: 'Acesso negado' });
    }

    const existing = await prisma.consultation.findUnique({
      where: { consultationId }
    });

    if (!existing) {

      return res.status(404).json({ error: 'Consulta não encontrada' });
    }

    if (role === 'THERAPIST') {

      const therapistProfile = await getTherapistProfileFromUserId(userId);

      if (!therapistProfile || therapistProfile.therapistProfileId !== existing.therapistId) {

        return res.status(403).json({ error: 'Você não pode alterar esta consulta' });
      }
    }

    const data = {};

    if (req.body.patientId) {

      const patientId = Number(req.body.patientId);

      if (!isValidId(patientId)) {

        return res.status(400).json({ error: 'ID do perfil do paciente inválido' });
      }

      const patientProfile = await prisma.patientProfile.findUnique({
        where: { userId: patientId }
      });

      if (!patientProfile) {

        return res.status(404).json({ error: 'Paciente não encontrado' });
      }

      data.patientId = patientId;
    }

    if (req.body.consultationDate) {

      const consultationDate = parseDate(req.body.consultationDate);

      if (!consultationDate) {

        return res.status(400).json({ error: 'Data da consulta inválida' });
      }
      data.consultationDate = consultationDate;
    }

    if (req.body.objective) {

      const objective = normalizeString(req.body.objective);

      if (!objective) {

        return res.status(400).json({ error: 'Objetivo da consulta não pode ser vazio' });
      }

      data.objective = objective;
    }

    if (req.body.score) {

      const score = Number(req.body.score);

      if (!Number.isInteger(score) || score < 0 || score > 100) {

        return res.status(400).json({ error: 'Pontuação deve estar entre 0 e 100' });
      }

      data.score = score;
    }

    const updated = await prisma.consultation.update({
      where: { consultationId },
      data
    });

    return res.json({
      message: 'Consulta atualizada com sucesso',
      consultation: updated
    });
  } catch (error) {

    console.error('Erro em updateConsultation:', error);
    return res.status(500).json({ error: 'Erro ao atualizar consulta' });
  }
};

const deleteConsultation = async (req, res) => {

  try {

    const consultationId = Number(req.params.consultationId);
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!isValidId(consultationId)) {

      return res.status(400).json({ error: 'ID da consulta inválido' });
    }

    if (role !== 'THERAPIST' && role !== 'ADMIN') {

      return res.status(403).json({ error: 'Acesso negado' });
    }

    const existing = await prisma.consultation.findUnique({
      where: { consultationId }
    });

    if (!existing) {

      return res.status(404).json({ error: 'Consulta não encontrada' });
    }

    if (role === 'THERAPIST') {

      const therapistProfile = await getTherapistProfileFromUserId(userId);

      if (!therapistProfile || therapistProfile.therapistProfileId !== existing.therapistId) {

        return res.status(403).json({ error: 'Você não pode excluir esta consulta' });
      }
    }

    await prisma.consultation.delete({
      where: { consultationId }
    });

    return res.json({ message: 'Consulta excluída com sucesso' });
  } catch (error) {
    
    console.error('Erro em deleteConsultation:', error);
    return res.status(500).json({ error: 'Erro ao excluir consulta' });
  }
};

module.exports = {
  createConsultation,
  listConsultations,
  getConsultationById,
  updateConsultation,
  deleteConsultation
};