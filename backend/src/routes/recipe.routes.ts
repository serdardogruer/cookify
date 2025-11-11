import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { recipeController } from '../controllers/recipe.controller';

const router = Router();

// Public routes
router.get('/', recipeController.getAllRecipes);
router.get('/search', recipeController.searchRecipes);
router.get('/:id', recipeController.getRecipeById);

// Protected routes
router.get('/user/my-recipes', authMiddleware, recipeController.getUserRecipes);
router.post('/', authMiddleware, recipeController.createRecipe);
router.put('/:id', authMiddleware, recipeController.updateRecipe);
router.delete('/:id', authMiddleware, recipeController.deleteRecipe);

export default router;
