import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

  if (!SUPABASE_JWT_SECRET) {
    console.error('❌ SUPABASE_JWT_SECRET is not set');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const decoded = jwt.verify(token, SUPABASE_JWT_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
