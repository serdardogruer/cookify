import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 401, message: 'Yetkisiz erişim' }
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    });

    if (!user || !user.isAdmin) {
      res.status(403).json({
        success: false,
        error: { code: 403, message: 'Admin yetkisi gerekli' }
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      error: { code: 500, message: 'Sunucu hatası' }
    });
  }
};
