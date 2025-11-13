import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { marketController } from '../controllers/market.controller';

const router = Router();

router.get('/', authMiddleware, marketController.getMarketItems);
router.post('/', authMiddleware, marketController.addMarketItem);
router.delete('/clear', authMiddleware, marketController.clearAllItems);
router.get('/export/whatsapp', authMiddleware, marketController.exportToWhatsApp);
router.put('/:id', authMiddleware, marketController.updateMarketItem);
router.delete('/:id', authMiddleware, marketController.deleteMarketItem);
router.post('/:id/move-to-pantry', authMiddleware, marketController.moveToPantry);

export default router;
