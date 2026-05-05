const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const { normalizeString, parseDate } = require('../utils/validation');

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '1h';
const RESET_TOKEN_EXPIRES_IN_MS = 60 * 60 * 1000;

if (!JWT_SECRET) {

  throw new Error('JWT_SECRET é obrigatório para autenticação');
}

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isStrongPassword = (password) =>
  typeof password === 'string' &&
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password);

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const register = async (req, res) => {

  try {

    const name = String(req.body.name || '').trim();
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;
    const city = normalizeString(req.body.city);
    const birthDate = parseDate(req.body.birthDate);
    const role = String(req.body.role).trim().toUpperCase();

    let {
        professionalRegister,
        specialty,
        experience,
        attendanceModality
      } = req.body;
    
    if (!name || name.length < 2) {

      return res.status(400).json({ error: 'Nome deve ter pelo menos 2 caracteres' });
    }

    if (!isValidEmail(email)) {

      return res.status(400).json({ error: 'Email inválido' });
    }

    if (!isStrongPassword(password)) {
      
      return res.status(400).json({
        error: 'Senha deve ter pelo menos 8 caracteres e incluir maiúsculas, minúsculas e um número'
      });
    }

    if (!['PATIENT', 'THERAPIST', 'ADMIN'].includes(role)) {

      return res.status(400).json({ error: 'Perfil inválido' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {

      return res.status(409).json({ error: 'Email já está em uso' });
    }
    
    if (!city || !birthDate) {
      
      return res.status(400).json({
        error: 'país, cidade e data de nascimento são obrigatórios'
      });
    }

    if (role === 'THERAPIST') {

      if (
        !professionalRegister ||
        !specialty ||
        !experience
      ) {

        return res.status(400).json({
          error: 'Campos obrigatórios não preenchidos'
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      }
    });

    const userId = Number(user.userId);

    if (role === 'PATIENT') {

      // const existingProfile = await prisma.patientProfile.findUnique({
      //   where: { userId }
      // });

      // if (existingProfile) {

      //   return res.status(409).json({ error: 'Perfil de paciente já existe' });
      // }

      const patientProfile = await prisma.patientProfile.create({
        data: {
          userId,
          city,
          birthDate
        }
      });

      return res.status(201).json({
        message: 'Perfil de paciente criado com sucesso',
        patientProfile
      });
    } else if (role === 'THERAPIST') {

      // const existing = await prisma.therapistProfile.findUnique({
      //   where: { userId }
      // });

      // if (existing) {
          
      //   return res.status(409).json({ error: 'Perfil de terapeuta já existe' });
      // }

      const profile = await prisma.therapistProfile.create({
        data: {
          userId,
          professionalRegister,
          city,
          birthDate: parseDate(birthDate),
          specialty,
          experience,
          attendanceModality: attendanceModality || 'ONLINE'
        }
      });

      return res.status(201).json({
        message: 'Perfil de terapeuta criado com sucesso',
        therapistProfile: profile
      });
    }

    // return res.status(201).json({
    //   message: 'User created',
    //   user: {
    //     userId: user.userId,
    //     name: user.name,
    //     email: user.email,
    //     role: user.role
    //   }
    // });
  } catch (error) {

    console.error('Error in register:', error);
    return res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

const createTherapistProfile = async (req, res) => {

  try {

    
  } catch (error) {

    console.error('Error in createTherapistProfile:', error);
    return res.status(500).json({ error: 'Erro ao criar perfil de terapeuta' });
  }
};

const login = async (req, res) => {

  try {
    
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    if (!isValidEmail(email) || !password) {

      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        patientProfile: true,
        therapistProfile: true
      }
    });

    if (!user) {

      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    if (!user.patientProfile && !user.therapistProfile) {

      return res.status(403).json({ error: 'Perfil de paciente ou terapeuta não encontrado para este usuário' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {

      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const token = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'VirTEAI',
        audience: 'Usuários do VirTEAI'
      }
    );

    return res.json({ token });
  } catch (error) {

    console.error('Error in login:', error);
    return res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

const forgotPassword = async (req, res) => {

  try {

    const email = normalizeEmail(req.body.email);

    if (!isValidEmail(email)) {

      return res.status(200).json({
        message: 'Se o email existir, um link de redefinição foi enviado'
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      
      return res.status(200).json({
        message: 'Se o email existir, um link de redefinição foi enviado'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = hashToken(resetToken);
    const resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_EXPIRES_IN_MS);

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpiry
      }
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: `"Suporte VirTEAI" <${process.env.MAIL_FROM}>`,
      to: email,
      subject: 'Redefinição de senha',
      html: `
        <p>Você solicitou a redefinição de senha.</p>
        <p>Clique <a href="${resetUrl}">aqui</a> para redefinir sua senha.</p>
        <p>Este link expira em 1 hora.</p>
      `
    });

    return res.status(200).json({
      message: 'Se o email existir, um link de redefinição foi enviado'
    });

  } catch (error) {

    console.error('Erro em forgotPassword:', error);
    
    return res.status(500).json({
      error: 'Erro ao enviar link de redefinição'
    });
  }
};

const resetPassword = async (req, res) => {

  try {

    const token = String(req.body.token || '').trim();
    const newPassword = req.body.password;

    if (!token || !newPassword) {

      return res.status(400).json({ error: 'Token e senha são obrigatórios' });
    }

    if (!isStrongPassword(newPassword)) {

      return res.status(400).json({
        error: 'A senha deve ter pelo menos 8 caracteres e incluir letras maiúsculas, minúsculas e um número'
      });
    }

    const tokenHash = hashToken(token);

    const user = await prisma.user.findFirst({
      where: {
        resetToken: tokenHash,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {

      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { userId: user.userId },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return res.json({ message: 'Senha atualizada com sucesso' });
  } catch (error) {

    console.error('Erro em resetPassword:', error);
    return res.status(500).json({ error: 'Erro ao redefinir a senha' });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword
};