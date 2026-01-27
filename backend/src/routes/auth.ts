import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  getUserById,
} from '../services/auth';
import { authenticate } from '../middleware/auth';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * POST /auth/register - Register a new user
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.error.issues,
      });
      return;
    }

    const { email, password, name } = validation.data;

    const { user, tokens } = await registerUser(email, password, name);

    res.status(201).json({
      user,
      ...tokens,
    });
  } catch (error: any) {
    if (error.message === 'User with this email already exists') {
      res.status(409).json({ error: error.message });
      return;
    }

    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /auth/login - Login user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.error.issues,
      });
      return;
    }

    const { email, password } = validation.data;

    const { user, tokens } = await loginUser(email, password);

    res.json({
      user,
      ...tokens,
    });
  } catch (error: any) {
    if (error.message === 'Invalid email or password') {
      res.status(401).json({ error: error.message });
      return;
    }

    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /auth/refresh - Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const validation = refreshSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.error.issues,
      });
      return;
    }

    const { refreshToken } = validation.data;

    const tokens = await refreshAccessToken(refreshToken);

    if (!tokens) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    res.json(tokens);
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

/**
 * POST /auth/logout - Logout (revoke refresh token)
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

/**
 * POST /auth/logout-all - Logout from all devices
 */
router.post('/logout-all', authenticate, async (req: Request, res: Response) => {
  try {
    await revokeAllUserTokens(req.userId!);
    res.json({ success: true });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

/**
 * GET /auth/me - Get current user
 */
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await getUserById(req.userId!);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
