import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { checkAdminAuth } from '../middleware/admin.middleware';
import * as adminController from '../controllers/admin.controller';
// YENİ CONTROLLER'LAR
import { usersController } from '../controllers/admin/users.controller';
import { categoriesController } from '../controllers/admin/categories.controller';
import { kitchensController } from '../controllers/admin/kitchens.controller';
import { logsController } from '../controllers/admin/logs.controller';
import { settingsController } from '../controllers/admin/settings.controller';

const router = Router();

// Tüm admin route'ları auth ve admin middleware'den geçer
router.use(authenticateToken);
router.use(checkAdminAuth);

// ========== MEVCUT ROUTE'LAR (DEĞİŞMEDİ) ==========
// İstatistikler
router.get('/stats', adminController.getStats);

// Kullanıcı Yönetimi - SPESİFİK ROUTE'LAR ÖNCE!
router.get('/users/stats', usersController.getUserStats);
router.get('/users/search', usersController.searchUsers);
router.get('/users/:id', usersController.getUserById);
router.post('/users/:id/toggle-admin', usersController.toggleAdminStatus);
router.delete('/users/:id', usersController.deleteUser);

// Kullanıcılar - GENEL ROUTE SONDA
router.get('/users', adminController.getAllUsers);

// Malzemeler (CRUD - MEVCUT)
router.get('/ingredients', adminController.getAllIngredients);
router.post('/ingredients', adminController.createIngredient);
router.put('/ingredients/:id', adminController.updateIngredient);
router.delete('/ingredients/:id', adminController.deleteIngredient);

// Kategori Yönetimi (YENİ)
router.get('/categories', categoriesController.getAllCategories);
router.get('/categories/stats', categoriesController.getCategoryStats);
router.get('/categories/:id', categoriesController.getCategoryById);
router.get('/categories/:id/usage', categoriesController.checkCategoryUsage);
router.post('/categories', categoriesController.createCategory);
router.put('/categories/:id', categoriesController.updateCategory);
router.delete('/categories/:id', categoriesController.deleteCategory);

// Mutfak Yönetimi (YENİ)
router.get('/kitchens', kitchensController.getAllKitchens);
router.get('/kitchens/stats', kitchensController.getGlobalKitchenStats);
router.get('/kitchens/search', kitchensController.searchKitchens);
router.get('/kitchens/:id', kitchensController.getKitchenDetails);
router.get('/kitchens/:id/stats', kitchensController.getKitchenStats);
router.put('/kitchens/:id/status', kitchensController.updateKitchenStatus);

// Log Yönetimi (YENİ)
router.get('/logs', logsController.getLogs);
router.get('/logs/stats', logsController.getLogStats);
router.post('/logs/clean', logsController.cleanOldLogs);

// Sistem Ayarları (YENİ)
router.get('/settings', settingsController.getSettings);
router.put('/settings', settingsController.updateSettings);
router.post('/settings/maintenance', settingsController.toggleMaintenanceMode);

// Modül Yönetimi (YENİ)
router.get('/modules', adminController.getAllModulesAdmin);
router.post('/modules', adminController.createModule);
router.put('/modules/:id', adminController.updateModule);
router.delete('/modules/:id', adminController.deleteModule);

export default router;
