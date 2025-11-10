import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { pantryController } from '../controllers/pantry.controller';

const router = Router();

router.get('/', authMiddleware, pantryController.getPantryItems);
router.post('/', authMiddleware, pantryController.addPantryItem);
router.post('/bulk', authMiddleware, pantryController.addMultiplePantryItems);
router.put('/:id', authMiddleware, pantryController.updatePantryItem);
router.delete('/:id', authMiddleware, pantryController.deletePantryItem);
router.post('/:id/add-to-market', authMiddleware, pantryController.moveToMarket);

export default router;
