const express = require('express');
const { register, login, forgotPassword } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

module.exports = router;const express = require('express');
const { getSessionId, generateSessionId, attachSessionData } = require('../controllers/sessionController');

const router = express.Router();

router.get('/get-id/:sessionId', getSessionId);
router.post('/generate-id', generateSessionId);
router.post('/attach', attachSessionData);

module.exports = router;const express = require('express');
const { getUsers, createUser, getSessionData } = require('../controllers/userController');

const router = express.Router();

router.get('/', getUsers);
router.post('/', createUser);
router.get('/session-data/:userId', getSessionData);

module.exports = router;const { PrismaClient } = require('@prisma/client');
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

        return res.status(200).send(true);
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

      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const threeHours = 3 * 60 * 60 * 1000;

    // Atualiza o usuário com o novo sessionId e a data de expiração
    await prisma.user.update({
        where: { userId: currentUser.userId },
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
                userId: user.userId,
                data: sessionPayload,
            },
        });

        // Limpamos o sessionId do usuário para evitar reutilização
        await prisma.user.update({
            where: { userId: user.userId },
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

module.exports = { getSessionId, generateSessionId, attachSessionData };const { PrismaClient } = require('@prisma/client');

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

    const user = await prisma.user.findUnique({ where: { userId: parseInt(userId) } });

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

module.exports = { getUsers, createUser, getSessionData };const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { TransactionalEmailsApi, SendSmtpEmail } = require('@getbrevo/brevo');

const prisma = new PrismaClient();

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });
    res.status(201).json({ message: 'User created', user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry }
    });

    // Send email via Brevo
    const apiInstance = new TransactionalEmailsApi();
    apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

    const sendSmtpEmail = new SendSmtpEmail();
    sendSmtpEmail.subject = 'Password Reset';
    sendSmtpEmail.htmlContent = `<p>Click <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">here</a> to reset your password.</p>`;
    sendSmtpEmail.sender = { name: 'Your App', email: 'noreply@yourapp.com' };
    sendSmtpEmail.to = [{ email }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    res.json({ message: 'Reset email sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login, forgotPassword };const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();

// Middleware
app.use(express.json());

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Routes
// Example route
app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// User routes
app.use('/users', require('./routes/userRoutes'));

// Session ID routes
app.use('/sessions', require('./routes/sessionRoutes.js'));

// Auth routes
app.use('/auth', require('./routes/authRoutes'));

module.exports = app;