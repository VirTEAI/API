const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { swaggerUi, swaggerSpec } = require('../swagger.js');
const prisma = require('./config/prisma');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(compression());

app.use(express.json());

// CORS — allowlist via env ALLOWED_ORIGINS (vírgula-separado).
// Se ALLOWED_ORIGINS estiver vazio, libera qualquer origem (dev). Em prod, sempre defina a env.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origem não permitida pelo CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(apiLimiter);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    return res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));
// }

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/consultations', require('./routes/consultationRoutes'));
app.use('/objectives', require('./routes/objectiveRoutes'));
app.use('/patients', require('./routes/patientRoutes'));
app.use('/reports', require('./routes/reportRoutes'));
app.use('/scenarios', require('./routes/scenarioRoutes'));
app.use('/sessions', require('./routes/sessionRoutes'));
app.use('/tests', require('./routes/testRoutes'));
app.use('/therapists', require('./routes/therapistRoutes'));

app.use((req, res) => {

  res.status(404).json({ error: 'Rota não encontrada' });
});

app.use((err, req, res, next) => {
  
  console.error(err);
  return res.status(500).json({ error: 'Erro interno do servidor' });
});

module.exports = app;
