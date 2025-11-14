import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// AuthRequest tipi - req.user objesi için
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: { code: 401, message: 'Token bulunamadı' }
      });
      return;
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any): void => {
      if (err) {
        res.status(403).json({
          success: false,
          error: { code: 403, message: 'Geçersiz token' }
        });
        return;
      }

      // req.user objesi olarak set et
      (req as AuthRequest).user = {
        userId: decoded.userId,
        email: decoded.email
      };
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: { code: 500, message: 'Sunucu hatası' }
    });
  }
};
