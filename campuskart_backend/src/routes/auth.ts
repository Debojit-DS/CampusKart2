import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { generateAccessToken, generateRefreshToken, generateVerificationCode } from '../utils/jwt.js';
import { extractEmailDomain } from '../utils/helpers.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.js';
import { storeResetToken, validateResetToken, consumeResetToken } from '../services/resetTokens.js';
import { storeVerificationCode, validateVerificationCode } from '../services/verification.js';

const router = Router();

const userSelect = {
  id: true,
  fullName: true,
  email: true,
  avatarUrl: true,
  isVerified: true,
  campusId: true,
  department: true,
  yearOfStudy: true,
  joinedAt: true,
  ratingAverage: true,
  ratingCount: true,
  role: true,
};

// POST /auth/signup
router.post('/signup', async (req: AuthRequest, res: Response) => {
  try {
    const { email, fullName, password, department, yearOfStudy } = req.body;

    if (!email || !fullName || !password) {
      return res.status(400).json({ error: 'MISSING_FIELDS' });
    }

    // Resolve institution from email domain
    const domain = extractEmailDomain(email);
    const institution = await prisma.institution.findFirst({
      where: {
        emailDomains: { has: domain },
      },
    });

    if (!institution) {
      return res.status(400).json({ error: 'UNSUPPORTED_INSTITUTION' });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'EMAIL_ALREADY_REGISTERED' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        department: department || null,
        yearOfStudy: yearOfStudy ? Number(yearOfStudy) : null,
        campusId: institution.id,
        isVerified: false,
      },
      select: userSelect,
    });

    // Generate verification code
    const code = generateVerificationCode();
    console.log(`[VERIFY] Verification code for ${email}: ${code}`);
    storeVerificationCode(email, code);
    sendVerificationEmail(email, code);

    return res.status(201).json({
      userId: user.id,
      message: 'Account created. Please verify your email.',
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// POST /auth/verify-email
router.post('/verify-email', async (req: AuthRequest, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'MISSING_FIELDS' });
    }

    if (!validateVerificationCode(email, code)) {
      return res.status(400).json({ error: 'INVALID_OR_EXPIRED_CODE' });
    }

    await prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });

    return res.json({ verified: true });
  } catch {
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// POST /auth/login
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'MISSING_FIELDS' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ error: 'ACCOUNT_BANNED' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    }

    const tokenPayload = {
      sub: user.id,
      campusId: user.campusId,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(user.id);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        campusId: user.campusId,
        department: user.department,
        yearOfStudy: user.yearOfStudy,
        joinedAt: user.joinedAt,
        ratingAverage: user.ratingAverage,
        ratingCount: user.ratingCount,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// POST /auth/refresh
router.post('/refresh', async (req: AuthRequest, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'NO_REFRESH_TOKEN' });
    }

    const { verifyRefreshToken } = await import('../utils/jwt.js');
    const decoded = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, campusId: true, role: true, tokenVersion: true, status: true },
    });

    if (!user || user.status === 'banned') {
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }

    const accessToken = generateAccessToken({
      sub: user.id,
      campusId: user.campusId,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ error: 'INVALID_REFRESH_TOKEN' });
  }
});

// POST /auth/logout
router.post('/logout', requireAuth, async (req: AuthRequest, res: Response) => {
  // Increment token version to invalidate all existing refresh tokens
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { tokenVersion: { increment: 1 } },
  });

  res.clearCookie('refreshToken');
  return res.status(204).send();
});

// POST /auth/forgot-password
router.post('/forgot-password', async (req: AuthRequest, res: Response) => {
  const { email } = req.body;

  // Always return 202 to avoid email enumeration
  if (email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = generateVerificationCode();
      console.log(`[RESET] Password reset token for ${email}: ${token}`);
      storeResetToken(token, email);
      sendPasswordResetEmail(email, token);
    }
  }

  return res.status(202).json({ message: 'If an account exists, a reset link has been sent.' });
});

// POST /auth/reset-password
router.post('/reset-password', async (req: AuthRequest, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'MISSING_FIELDS' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'PASSWORD_TOO_SHORT' });
    }

    const email = validateResetToken(token);
    if (!email) {
      return res.status(400).json({ error: 'INVALID_OR_EXPIRED_TOKEN' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    consumeResetToken(token);

    return res.json({ message: 'Password reset successful.' });
  } catch {
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export { router as authRoutes };
