import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { convertUnit, convertBatch } from '../controllers/unit-conversion.controller';

const router = express.Router();

// Birim dönüşümü
router.post('/convert', authMiddleware, convertUnit);

// Toplu birim dönüşümü
router.post('/convert-batch', authMiddleware, convertBatch);

export default router;
