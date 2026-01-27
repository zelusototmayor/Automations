import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../services/auth';

// Extend Express Request type to include user info
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

/**
 * Extract token from Authorization header
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
}

/**
 * Middleware that requires authentication
 * Returns 401 if no valid token is provided
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  // Attach user info to request
  req.userId = payload.userId;
  req.userEmail = payload.email;

  next();
}

/**
 * Middleware that optionally authenticates
 * Continues even without a token, but attaches user info if valid token provided
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (token) {
    const payload = verifyAccessToken(token);
    if (payload) {
      req.userId = payload.userId;
      req.userEmail = payload.email;
    }
  }

  next();
}
