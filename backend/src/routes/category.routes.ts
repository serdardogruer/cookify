import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';

const router = Router();

router.get('/', categoryController.getCategories);
router.get('/ingredients/search', categoryController.searchIngredients);
router.get('/ingredients/popular', categoryController.getPopularIngredients);
router.get('/ingredients', categoryController.getIngredientsByCategoryName);
router.get('/:categoryId/ingredients', categoryController.getIngredientsByCategory);

export default router;
