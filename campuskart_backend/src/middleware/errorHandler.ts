import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as unknown as { code: string; meta?: { target?: string[] } };
    if (prismaErr.code === 'P2002') {
      return res.status(409).json({
        error: 'DUPLICATE_ENTRY',
        field: prismaErr.meta?.target?.join(', '),
      });
    }
    if (prismaErr.code === 'P2025') {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({ error: 'INTERNAL_ERROR' });
}
