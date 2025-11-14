import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { consumptionController } from '../controllers/consumption.controller';

const router = Router();

router.post('/log', authMiddleware, consumptionController.logConsumption);

export default router;
