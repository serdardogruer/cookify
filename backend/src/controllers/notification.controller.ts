import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Kullanıcının bildirimlerini getir
export const getUserNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Yetkisiz erişim' });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Son 50 bildirim
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    return res.json({ 
      success: true, 
      data: { notifications, unreadCount } 
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Bildirimi okundu olarak işaretle
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Yetkisiz erişim' });
    }

    const notification = await prisma.notification.update({
      where: { 
        id: parseInt(id),
        userId // Sadece kendi bildirimini güncelleyebilir
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    return res.json({ success: true, data: notification });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Tüm bildirimleri okundu olarak işaretle
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Yetkisiz erişim' });
    }

    await prisma.notification.updateMany({
      where: { 
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    return res.json({ success: true, message: 'Tüm bildirimler okundu olarak işaretlendi' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Bildirimi sil
export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Yetkisiz erişim' });
    }

    await prisma.notification.delete({
      where: { 
        id: parseInt(id),
        userId
      }
    });

    return res.json({ success: true, message: 'Bildirim silindi' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Bildirim oluştur (sistem tarafından kullanılacak)
export const createNotification = async (
  userId: number,
  type: string,
  title: string,
  message: string,
  data?: any
) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data ? JSON.stringify(data) : null
      }
    });

    return notification;
  } catch (error) {
    console.error('Bildirim oluşturma hatası:', error);
    return null;
  }
};
