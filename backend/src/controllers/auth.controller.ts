import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          error: {
            code: 2001,
            message: 'Name, email and password are required',
          },
        });
      }

      const result = await authService.register({ name, email, password });

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: error.code || 5000,
          message: error.message || 'Registration failed',
        },
      });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: {
            code: 2001,
            message: 'Email and password are required',
          },
        });
      }

      const result = await authService.login({ email, password });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        error: {
          code: error.code || 1001,
          message: error.message || 'Invalid credentials',
        },
      });
    }
  },

  async googleAuth(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: {
            code: 2001,
            message: 'Google token gerekli',
          },
        });
      }

      const result = await authService.googleAuth(token);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        error: {
          code: error.code || 1002,
          message: error.message || 'Google girişi başarısız',
        },
      });
    }
  },
};
