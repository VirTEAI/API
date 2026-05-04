const { PrismaClient } = require('@prisma/client');
const { getTherapistProfileFromUserId, getPatientProfileFromUserId } = require('../services/getProfiles');
const { normalizeString, isValidId } = require('../utils/validation');

const prisma = new PrismaClient();

const createReport = async (req, res) => {

  try {

    const userId = req.user?.userId;
    const role = req.user?.role;

    const patientId = Number(req.body.patientId);
    const sessionObjective = normalizeString(req.body.sessionObjective);
    const title = normalizeString(req.body.title);
    const evolution = normalizeString(req.body.evolution);
    const content = normalizeString(req.body.content);
    const consultationId = req.body.consultationId !== undefined ? Number(req.body.consultationId) : null;

    if (!isValidId(patientId)) {

      return res.status(400).json({ error: 'Perfil do paciente inválido' });
    }

    if (!sessionObjective || !title || !content) {

      return res.status(400).json({
        error: 'sessionObjective, title e content são obrigatórios'
      });
    }

    const allowedEvolutions = ['MAINTAINED', 'IMPROVED', 'REGRESSED'];

    if (!allowedEvolutions.includes(evolution)) {

      return res.status(400).json({
        error: 'Evolução inválida. Use MAINTAINED, IMPROVED ou REGRESSED'
      });
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

    if (consultationId && !isValidId(consultationId)) {

      return res.status(400).json({ error: 'ID da consulta inválido' });
    }

    if (consultationId) {

      const consultation = await prisma.consultation.findUnique({
        where: { consultationId }
      });

      if (!consultation) {

        return res.status(404).json({ error: 'Consulta não encontrada' });
      }

      if (consultation.patientId !== patientId) {

        return res.status(400).json({
          error: 'A consulta não pertence a este paciente'
        });
      }

      if (role === 'THERAPIST' && therapistProfile && consultation.therapistId !== therapistProfile.therapistProfileId) {

        return res.status(403).json({
          error: 'Você não pode criar relatório para esta consulta'
        });
      }
    }

    const report = await prisma.report.create({
      data: {
        patientId,
        therapistId: role === 'ADMIN' ? Number(req.body.therapistId) : userId,
        consultationId: consultationId || null,
        sessionObjective,
        title,
        evolution,
        content
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
        },
        consultation: true
      }
    });

    return res.status(201).json({
      message: 'Relatório criado com sucesso',
      report
    });
  } catch (error) {

    console.error('Erro em createReport:', error);
    return res.status(500).json({ error: 'Erro ao criar relatório' });
  }
};

const listReports = async (req, res) => {

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

    const reports = await prisma.report.findMany({
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
        },
        consultation: true
      }
    });

    return res.json(reports);
  } catch (error) {

    console.error('Erro em listReports:', error);
    return res.status(500).json({ error: 'Erro ao listar relatórios' });
  }
};

const getReportById = async (req, res) => {

  try {

    const reportId = Number(req.params.reportId);

    if (!isValidId(reportId)) {

      return res.status(400).json({ error: 'ID do relatório inválido' });
    }

    const report = await prisma.report.findUnique({
      where: { reportId },
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
        },
        consultation: true
      }
    });

    if (!report) {

      return res.status(404).json({ error: 'Relatório não encontrado' });
    }

    return res.json(report);
  } catch (error) {

    console.error('Erro em getReportById:', error);
    return res.status(500).json({ error: 'Erro ao buscar relatório' });
  }
};

const updateReport = async (req, res) => {

  try {

    const reportId = Number(req.params.reportId);
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!isValidId(reportId)) {

      return res.status(400).json({ error: 'ID do relatório inválido' });
    }

    const existing = await prisma.report.findUnique({
      where: { reportId }
    });

    if (!existing) {

      return res.status(404).json({ error: 'Relatório não encontrado' });
    }

    if (role === 'THERAPIST') {

      const therapistProfile = await getTherapistProfileFromUserId(userId);

      if (!therapistProfile || therapistProfile.therapistProfileId !== existing.therapistId) {

        return res.status(403).json({ error: 'Você não pode alterar este relatório' });
      }
    }

    const data = {};

    if (req.body.sessionObjective) {

      const sessionObjective = normalizeString(req.body.sessionObjective);

      if (!sessionObjective) {

        return res.status(400).json({ error: 'Objetivo da sessão não pode ser vazio' });
      }

      data.sessionObjective = sessionObjective;
    }

    if (req.body.title) {

      const title = normalizeString(req.body.title);

      if (!title) {

        return res.status(400).json({ error: 'Título não pode ser vazio' });
      }

      data.title = title;
    }

    if (req.body.evolution) {

      const evolution = normalizeString(req.body.evolution);
      const allowed = ['MAINTAINED', 'IMPROVED', 'REGRESSED'];

      if (!allowed.includes(evolution)) {

        return res.status(400).json({
          error: 'Evolução inválida. Use MAINTAINED, IMPROVED ou REGRESSED'
        });
      }

      data.evolution = evolution;
    }

    if (req.body.content) {

      const content = normalizeString(req.body.content);

      if (!content) {

        return res.status(400).json({ error: 'Conteúdo não pode ser vazio' });
      }

      data.content = content;
    }

    if (req.body.consultationId) {

      const consultationId = Number(req.body.consultationId);

      if (!isValidId(consultationId)) {

        return res.status(400).json({ error: 'ID da consulta inválido' });
      }

      const consultation = await prisma.consultation.findUnique({
        where: { consultationId }
      });

      if (!consultation) {

        return res.status(404).json({ error: 'Consulta não encontrada' });
      }

      if (consultation.patientId !== existing.patientId) {

        return res.status(400).json({ error: 'A consulta não pertence a este relatório' });
      }

      data.consultationId = consultationId;
    }

    const updated = await prisma.report.update({
      where: { reportId },
      data
    });

    return res.json({
      message: 'Relatório atualizado com sucesso',
      report: updated
    });
  } catch (error) {

    console.error('Erro em updateReport:', error);
    return res.status(500).json({ error: 'Erro ao atualizar relatório' });
  }
};

const deleteReport = async (req, res) => {

  try {

    const reportId = Number(req.params.reportId);
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!isValidId(reportId)) {

      return res.status(400).json({ error: 'ID do relatório inválido' });
    }

    const existing = await prisma.report.findUnique({
      where: { reportId }
    });

    if (!existing) {

      return res.status(404).json({ error: 'Relatório não encontrado' });
    }

    if (role === 'THERAPIST') {
        
      const therapistProfile = await getTherapistProfileFromUserId(userId);

      if (!therapistProfile || therapistProfile.therapistProfileId !== existing.therapistId) {

        return res.status(403).json({ error: 'Você não pode excluir este relatório' });
      }
    }

    await prisma.report.delete({
      where: { reportId }
    });

    return res.json({ message: 'Relatório excluído com sucesso' });
  } catch (error) {
    
    console.error('Erro em deleteReport:', error);
    return res.status(500).json({ error: 'Erro ao excluir relatório' });
  }
};

module.exports = {
  createReport,
  listReports,
  getReportById,
  updateReport,
  deleteReport
};