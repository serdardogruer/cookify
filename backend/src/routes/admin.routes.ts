import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import * as adminController from '../controllers/admin.controller';

const router = Router();

// Tüm admin route'ları auth ve admin middleware'den geçer
router.use(authenticateToken);
router.use(requireAdmin);

// İstatistikler
router.get('/stats', adminController.getStats);

// Kullanıcılar
router.get('/users', adminController.getAllUsers);

// Malzemeler (CRUD)
router.get('/ingredients', adminController.getAllIngredients);
router.post('/ingredients', adminController.createIngredient);
router.put('/ingredients/:id', adminController.updateIngredient);
router.delete('/ingredients/:id', adminController.deleteIngredient);

export default router;
