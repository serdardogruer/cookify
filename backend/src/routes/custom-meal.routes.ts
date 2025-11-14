import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { customMealController } from '../controllers/custom-meal.controller';

const router = Router();

router.get('/', authMiddleware, customMealController.getUserMeals);
router.post('/', authMiddleware, customMealController.createMeal);
router.delete('/:id', authMiddleware, customMealController.deleteMeal);
router.post('/consume', authMiddleware, customMealController.consumeMeal);

export default router;
