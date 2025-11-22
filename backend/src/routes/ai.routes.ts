import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth';
import {
  getAIIntegrations,
  addAIIntegration,
  updateAIIntegration,
  deleteAIIntegration,
  getRecipeSuggestions,
  recognizeIngredients,
  scanReceipt
} from '../controllers/ai.controller';

const router = Router();

// Multer config (memory storage for image processing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir'));
    }
  }
});

// Tüm route'lar authentication gerektirir
router.use(authMiddleware);

// AI entegrasyonları
router.get('/integrations', getAIIntegrations);
router.post('/integrations', addAIIntegration);
router.put('/integrations/:id', updateAIIntegration);
router.delete('/integrations/:id', deleteAIIntegration);

// AI özellikleri
router.post('/recipe-suggestions', getRecipeSuggestions);
router.post('/recognize-ingredients', upload.single('image'), recognizeIngredients);
router.post('/scan-receipt', upload.single('image'), scanReceipt);

export default router;
