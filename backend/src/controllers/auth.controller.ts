import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/AuthService.js';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      const result = await authService.registerPatient(name, email, password);

      // Set JWT as httpOnly cookie
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  logout(_req: Request, res: Response) {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully.' });
  }

  getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = authService.getCurrentUser(req.user!.userId);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
