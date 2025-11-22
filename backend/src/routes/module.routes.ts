import express from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getAllModules,
  getUserModules,
  toggleModule,
  activateModule
} from '../controllers/module.controller';

const router = express.Router();

// Tüm modülleri listele
router.get('/', authMiddleware, getAllModules);

// Kullanıcının modüllerini getir
router.get('/user', authMiddleware, getUserModules);

// Modülü aktif/pasif et
router.put('/:moduleId/toggle', authMiddleware, toggleModule);

// Modül satın al / deneme başlat
router.post('/:moduleId/activate', authMiddleware, activateModule);

export default router;
