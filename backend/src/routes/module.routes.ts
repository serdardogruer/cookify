import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { moduleController } from '../controllers/module.controller';

const router = Router();

router.get('/', authMiddleware, moduleController.getModules);
router.post('/:id/toggle', authMiddleware, moduleController.toggleModule);

export default router;
