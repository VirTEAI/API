const { PrismaClient } = require('@prisma/client');
const { scoreTest10, scoreTest50 } = require("../services/scoringService");
const { getPatientProfileFromUserId } = require('../services/getProfilesService');

const prisma = new PrismaClient();

function validateAnswers(answers) {

    if (!answers || typeof answers !== "object") return false;

    const validOptions = [
        "strongly_disagree",
        "disagree",
        "neutral",
        "agree",
        "strongly_agree",
    ];

    return Object.values(answers).every(a => validOptions.includes(a));
}

const getIsTest10Completed = async (req, res) => {

  try {

    const userId = req.user?.userId;

    const patientProfile = await getPatientProfileFromUserId(userId);

    if (!patientProfile) {

      return res.status(404).json({ error: 'Perfil de paciente não encontrado' });
    }

    const isCompleted = patientProfile.test10Score ? patientProfile.test10Score !== 0 : false;

    return res.status(200).json({ 
        isTest10Completed: isCompleted,
        score: patientProfile.test10Score || 0
    });
  } catch (error) {

    console.error('Error em getIsTest10Completed:', error);
    return res.status(500).json({ error: 'Erro ao verificar conclusão do teste 10' });
  }
}

const getIsTest50Completed = async (req, res) => {

  try {

    const userId = req.user?.userId;

    const patientProfile = await getPatientProfileFromUserId(userId);

    if (!patientProfile) {

      return res.status(404).json({ error: 'Perfil de paciente não encontrado' });
    }

    const isCompleted = patientProfile.test50Score ? patientProfile.test50Score !== 0 : false;

    return res.status(200).json({ 
        isTest50Completed: isCompleted,
        score: patientProfile.test50Score || 0
    });
  } catch (error) {

    console.error('Error em getIsTest50Completed:', error);
    return res.status(500).json({ error: 'Erro ao verificar conclusão do teste 50' });
  }
}

const submitTest10 = async (req, res) => {

  try {

    const userId = req.user?.userId;
    const { answers } = req.body;

    if (!validateAnswers(answers)) {

      return res.status(400).json({
        error: "Formato de respostas inválido",
      });
    }

    const patientProfile = await getPatientProfileFromUserId(userId);

    if (!patientProfile) {

      return res.status(404).json({ error: 'Perfil de paciente não encontrado' });
    }

    const score = scoreTest10(answers);

    patientProfile.test10Score = score;

    await prisma.patientProfile.update({
      where: { userId },
      data: { test10Score: score }
    });

    return res.status(200).json({
      score,
      interpretation: score > 6 ? "acima_do_limite" : "abaixo_do_limite",
    });
  } catch (error) {

    console.error('Error em submitTest10:', error);
    return res.status(500).json({ error: 'Erro ao pontuar teste 10' });
  }
}

const submitTest50 = async (req, res) => {

  try {

    const userId = req.user?.userId;
    const { answers } = req.body;

    if (!validateAnswers(answers)) {

      return res.status(400).json({
        error: "Formato de respostas inválido",
      });
    }

    const patientProfile = await getPatientProfileFromUserId(userId);

    if (!patientProfile) {

      return res.status(404).json({ error: 'Perfil de paciente não encontrado' });
    }

    const score = scoreTest50(answers);

    patientProfile.test50Score = score;

    await prisma.patientProfile.update({
      where: { userId },
      data: { test50Score: score }
    });

    return res.status(200).json({
      score,
      interpretation:
        score >= 32 ? "altas_caracteristicas" :
        score >= 16 ? "moderadas_caracteristicas" :
        "baixas_caracteristicas",
    });
  } catch (error) {

    console.error('Error em submitTest50:', error);
    return res.status(500).json({ error: "Erro ao pontuar teste 50" });
  }
}

module.exports = {
  getIsTest10Completed,
  getIsTest50Completed,
  submitTest10,
  submitTest50
};