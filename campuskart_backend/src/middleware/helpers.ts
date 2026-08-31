import type { Response } from 'express';
import type { AuthRequest } from './auth.js';

export function successResponse<T>(res: Response, data: T, statusCode = 200) {
  return res.status(statusCode).json(data);
}

export function getAuthUser(req: AuthRequest) {
  return req.user!;
}
