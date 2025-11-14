import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Admin yetki kontrolü middleware
 * Sadece isAdmin: true olan kullanıcıların erişimine izin verir
 */
export const checkAdminAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 4001,
          message: 'Unauthorized - No user ID',
        },
      });
    }

    // Kullanıcının admin yetkisini kontrol et
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });

    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 4003,
          message: 'Forbidden - Admin access required',
        },
      });
    }

    // Admin yetkisi var, devam et
    return next();
  } catch (error: any) {
    console.error('Admin auth check error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 5000,
        message: 'Internal server error',
      },
    });
  }
};

/**
 * Admin işlemlerini loglama fonksiyonu
 * @param action - İşlem adı (örn: 'DELETE_USER', 'TOGGLE_ADMIN')
 * @param userId - İşlemi yapan admin kullanıcı ID
 * @param details - İşlem detayları (object olarak)
 * @param req - Request objesi (IP ve user agent için)
 */
export const logAdminAction = async (
  action: string,
  userId: number,
  details: any,
  req?: AuthRequest
): Promise<void> => {
  try {
    // @ts-ignore - Prisma client will be regenerated
    await prisma.systemLog.create({
      data: {
        type: 'ADMIN_ACTION',
        userId,
        action,
        details: JSON.stringify(details),
        ipAddress: req?.ip || req?.socket?.remoteAddress || null,
        userAgent: req?.get('user-agent') || null,
      },
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
    // Log hatası işlemi durdurmaz
  }
};

/**
 * Kullanıcı işlemlerini loglama fonksiyonu
 * @param action - İşlem adı (örn: 'LOGIN', 'LOGOUT', 'REGISTER')
 * @param userId - İşlemi yapan kullanıcı ID
 * @param details - İşlem detayları (object olarak)
 * @param req - Request objesi (IP ve user agent için)
 */
export const logUserAction = async (
  action: string,
  userId: number | null,
  details: any,
  req?: AuthRequest
): Promise<void> => {
  try {
    // @ts-ignore - Prisma client will be regenerated
    await prisma.systemLog.create({
      data: {
        type: 'USER_ACTION',
        userId,
        action,
        details: JSON.stringify(details),
        ipAddress: req?.ip || req?.socket?.remoteAddress || null,
        userAgent: req?.get('user-agent') || null,
      },
    });
  } catch (error) {
    console.error('Failed to log user action:', error);
    // Log hatası işlemi durdurmaz
  }
};

/**
 * Sistem olaylarını loglama fonksiyonu
 * @param action - Olay adı (örn: 'SYSTEM_START', 'BACKUP_COMPLETED')
 * @param details - Olay detayları (object olarak)
 */
export const logSystemEvent = async (
  action: string,
  details: any
): Promise<void> => {
  try {
    // @ts-ignore - Prisma client will be regenerated
    await prisma.systemLog.create({
      data: {
        type: 'SYSTEM_EVENT',
        action,
        details: JSON.stringify(details),
      },
    });
  } catch (error) {
    console.error('Failed to log system event:', error);
    // Log hatası işlemi durdurmaz
  }
};
