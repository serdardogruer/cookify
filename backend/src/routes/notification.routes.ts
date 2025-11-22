import express from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notification.controller';

const router = express.Router();

// Kullanıcının bildirimlerini getir
router.get('/', authMiddleware, getUserNotifications);

// Bildirimi okundu olarak işaretle
router.put('/:id/read', authMiddleware, markAsRead);

// Tüm bildirimleri okundu olarak işaretle
router.put('/read-all', authMiddleware, markAllAsRead);

// Bildirimi sil
router.delete('/:id', authMiddleware, deleteNotification);

export default router;
