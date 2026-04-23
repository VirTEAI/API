const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

const SESSION_TTL_MS = 3 * 60 * 60 * 1000;

const hashValue = (value) =>
  crypto.createHash('sha256').update(value).digest('hex');

const generateSecureSessionId = () =>
    crypto.randomInt(1000000, 10000000).toString(); 

const getSessionId = async (req, res) => {

  try {

    const { sessionId } = req.params;

    if (!sessionId || typeof sessionId !== 'string') {

      return res.status(400).json({ error: 'ID da sessão é obrigatório' });
    }

    const sessionIdHash = hashValue(sessionId);

    const user = await prisma.user.findFirst({
      where: {
        sessionIdHash,
        sessionIdExpiry: {
          gt: new Date()
        }
      },
      select: {
        userId: true
      }
    });

    if (!user) {

      return res.status(404).json({ error: 'ID da sessão inválido ou expirado' });
    }

    return res.status(200).json({ valid: true });
  } catch (error) {

    return res.status(500).json({ error: 'Erro ao verificar ID da sessão' });
  }
};

const generateSessionId = async (req, res) => {

  try {

    const email = String(req.body.email || '').trim().toLowerCase();

    if (!email) {

      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email },
      select: { userId: true, email: true }
    });

    if (!currentUser) {

      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const sessionId = generateSecureSessionId();
    const sessionIdHash = hashValue(sessionId);
    const sessionIdExpiry = new Date(Date.now() + SESSION_TTL_MS);

    await prisma.user.update({
      where: { userId: currentUser.userId },
      data: {
        sessionIdHash,
        sessionIdExpiry
      }
    });

    return res.status(200).json({
      sessionId,
      expiresInMinutes: 180
    });
  } catch (error) {

    console.error('Erro ao gerar ID da sessão:', error);
    return res.status(500).json({ error: 'Erro ao gerar ID da sessão' });
  }
};

const attachSessionData = async (req, res) => {

  try {

    const body = req.body;

    if (!body || !body.sessionId) {

      return res.status(400).json({ error: 'ID da sessão é obrigatório' });
    }

    const { sessionId, ...sessionPayload } = body;
    const sessionIdHash = hashValue(String(sessionId));

    const user = await prisma.user.findFirst({
      where: {
        sessionIdHash,
        sessionIdExpiry: {
          gt: new Date()
        }
      },
      select: {
        userId: true
      }
    });

    if (!user) {
      return res.status(404).json({

        error: 'Usuário não encontrado para o sessionId fornecido'
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const sessionData = await tx.sessionData.create({
        data: {
          userId: user.userId,
          data: sessionPayload
        }
      });

      await tx.user.update({
        where: { userId: user.userId },
        data: {
          sessionIdHash: null,
          sessionIdExpiry: null
        }
      });

      return sessionData;
    });

    return res.status(200).json({
      message: 'Dados da sessão anexados com sucesso',
      sessionData: result
    });
  } catch (error) {

    return res.status(500).json({ error: 'Erro ao anexar dados da sessão' });
  }
};

module.exports = { getSessionId, generateSessionId, attachSessionData };