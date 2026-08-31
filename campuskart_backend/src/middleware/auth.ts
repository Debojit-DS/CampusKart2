import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

interface JwtPayload {
  sub: string;
  campusId: string;
  role: string;
  tokenVersion: number;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    campusId: string;
    role: string;
    tokenVersion: number;
  };
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET!
    ) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, campusId: true, role: true, tokenVersion: true, status: true },
    });

    if (!user || user.status === 'banned') {
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }

    if (user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ error: 'TOKEN_REVOKED' });
    }

    req.user = {
      id: user.id,
      campusId: user.campusId,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };

    next();
  } catch {
    return res.status(401).json({ error: 'INVALID_TOKEN' });
  }
}

export function requireVerified(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  // Check verification status from DB for write operations
  prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { isVerified: true },
  }).then(user => {
    if (!user?.isVerified) {
      return res.status(403).json({ error: 'EMAIL_NOT_VERIFIED' });
    }
    next();
  }).catch(() => {
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  });
}

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'FORBIDDEN' });
  }
  next();
}

export function requireCampusMatch(resourceCampusId: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.campusId !== resourceCampusId) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }
    next();
  };
}

export function requireOwnership(resourceOwnerId: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.id !== resourceOwnerId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    next();
  };
}
