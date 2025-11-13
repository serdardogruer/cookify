import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { kitchenController } from '../controllers/kitchen.controller';

const router = Router();

router.get('/', authMiddleware, kitchenController.getActiveKitchen);
router.post('/join', authMiddleware, kitchenController.joinKitchen);
router.post('/leave', authMiddleware, kitchenController.leaveKitchen);
router.post('/remove-member', authMiddleware, kitchenController.removeMember);

export default router;
