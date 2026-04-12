const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Pega o ID da sessão para confirmar que é válido
const getSessionId = async (req, res) => {
    try {

        const { sessionId } = req.params;

        if (!sessionId) {

            return res.status(400).json({ error: "ID da sessão é obrigatório" });
        }

        const user = await prisma.user.findUnique({
            where: { sessionId },
        });

        // Verificamos se o usuário existe e se o sessionId ainda é válido (não expirou)
        if (!user || !user.sessionIdExpiry || user.sessionIdExpiry < new Date()) {

            return res.status(404).json({ error: "Usuário não encontrado ou ID da sessão inválido" });
        }

        return res.status(200).json(true);
    } catch (error) {

        res.status(500).json({ error: error.message });
    }
}

// Gera um ID de sessão para o usuário e armazena no banco de dados
const generateSessionId = async (req, res) => {

  try {

    const sessionId = crypto.randomInt(100000, 1000000).toString();
    
    const { email } = req.body;

    const currentUser = await prisma.user.findUnique({ where: { email } });

    if (!currentUser) {

      return res.status(404).json({ error: 'User não encontrado' });
    }

    const threeHours = 3 * 60 * 60 * 1000;

    // Atualiza o usuário com o novo sessionId e a data de expiração
    await prisma.session.update({
        where: { userId: currentUser.id },
        data: { sessionId, sessionIdExpiry: new Date(Date.now() + threeHours) } // Expira em 3 horas
    });

    res.json(sessionId);
  } catch (error) {

    res.status(500).json({ error: error.message });
  }
};

const attachSessionData = async (req, res) => {

    try {

        const body = req.body;

        if (!body || !body.sessionId) {

            return res.status(400).json({

                error: "ID da sessão é obrigatório",
            });
        }

        const { sessionId, ...sessionPayload } = body;

        // Achamos o usuário pelo sessionId
        const user = await prisma.user.findUnique({
            where: { sessionId },
        });

        if (!user) {
            return res.status(404).json({
                error: "Usuário não encontrado para o sessionId fornecido",
            });
        }

        // Criamos um novo registro de SessionData para o usuário
        const sessionData = await prisma.sessionData.create({
            data: {
                userId: user.id,
                data: sessionPayload,
            },
        });

        // Limpamos o sessionId do usuário para evitar reutilização
        await prisma.user.update({
            where: { id: user.id },
            data: {
                sessionId: null,
                sessionIdExpiry: null,
            },
        });

        return res.status(200).json({
            message: "Dados da sessão anexados com sucesso",
            sessionData,
        });

    } catch (error) {

        res.status(500).json({ error: error.message });
    }
};

module.exports = { getSessionId, generateSessionId, attachSessionData };