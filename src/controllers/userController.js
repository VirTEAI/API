const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, name } = req.body;
    const user = await prisma.user.create({
      data: { email, name }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mudar depois o método de pegar id do usuário
const getSessionData = async (req, res) => {

  try {

    const { userId } = req.params;

    const user = await prisma.user.findUnique({ where: { userId } });

    const sessionData = await prisma.sessionData.findMany({
        where: { userId: user.userId }
    });

    if (sessionData.length === 0) {

        return res.status(404).json({ error: 'Dados de sessão não encontrados para o usuário fornecido' });
    }

    res.json(sessionData);
  } catch (error) {

    res.status(500).json({ error: error.message });
  }
};

module.exports = { getUsers, createUser, getSessionData };