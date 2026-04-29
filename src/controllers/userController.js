const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const isValidEmail = (email) =>
  typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const getUsers = async (req, res) => {

  try {

    const users = await prisma.user.findMany({
      select: {
        userId: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.json(users);
  } catch (error) {

    console.error('Erro ao buscar usuários:', error);
    return res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};

// Criar usuário sem autenticação (para testes)
const createUser = async (req, res) => {

  try {

    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();

    if (!name || name.length < 2) {

      return res.status(400).json({ error: 'Nome inválido' });
    }

    if (!isValidEmail(email)) {

      return res.status(400).json({ error: 'Email inválido' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {

      return res.status(409).json({ error: 'Email já em uso' });
    }

    const user = await prisma.user.create({
      data: { email, name },
      select: {
        userId: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    return res.status(201).json(user);
  } catch (error) {

    console.error('Erro ao criar usuário:', error);
    return res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

// Mudar a forma que se acha o usuário certo por quem vai ver esses dados não ser o usuário logado, mas o terapeuta dele na aba de terapeutas, então o terapeuta vai colocar o id do paciente () e ver os dados de sessão dele
const getSessionData = async (req, res) => {

  try {

    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId) || userId <= 0) {

      return res.status(400).json({ error: 'ID do usuário inválido' });
    }

    const user = await prisma.user.findUnique({
      where: { userId },
      select: { userId: true }
    });

    if (!user) {

      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const sessionData = await prisma.sessionData.findMany({
      where: { userId: user.userId }
    });

    if (sessionData.length === 0) {

      return res.status(404).json({
        error: 'Dados de sessão não encontrados para o usuário fornecido'
      });
    }

    return res.json(sessionData);
  } catch (error) {

    console.error('Erro ao buscar dados de sessão:', error);
    return res.status(500).json({ error: 'Erro ao buscar dados de sessão:' + error.message });
  }
};

module.exports = { getUsers, createUser, getSessionData };