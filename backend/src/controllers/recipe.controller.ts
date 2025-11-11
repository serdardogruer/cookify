import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import recipeService from '../services/recipe.service';

export const recipeController = {
  async getAllRecipes(req: AuthRequest, res: Response) {
    try {
      const { limit, search } = req.query;
      const limitNum = limit ? parseInt(limit as string) : undefined;

      const recipes = await recipeService.getAllRecipes(
        limitNum,
        search as string | undefined
      );

      return res.status(200).json({
        success: true,
        data: recipes,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to get recipes',
        },
      });
    }
  },

  async getRecipeById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const recipe = await recipeService.getRecipeById(parseInt(id));

      if (!recipe) {
        return res.status(404).json({
          success: false,
          error: { code: 4004, message: 'Recipe not found' },
        });
      }

      return res.status(200).json({
        success: true,
        data: recipe,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to get recipe',
        },
      });
    }
  },

  async getUserRecipes(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      const recipes = await recipeService.getUserRecipes(userId);

      return res.status(200).json({
        success: true,
        data: recipes,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to get user recipes',
        },
      });
    }
  },

  async createRecipe(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      const recipe = await recipeService.createRecipe(userId, req.body);

      return res.status(201).json({
        success: true,
        data: recipe,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to create recipe',
        },
      });
    }
  },

  async updateRecipe(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      const recipe = await recipeService.updateRecipe(
        parseInt(id),
        userId,
        req.body
      );

      return res.status(200).json({
        success: true,
        data: recipe,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to update recipe',
        },
      });
    }
  },

  async deleteRecipe(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      await recipeService.deleteRecipe(parseInt(id), userId);

      return res.status(200).json({
        success: true,
        message: 'Recipe deleted successfully',
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to delete recipe',
        },
      });
    }
  },

  async searchRecipes(req: AuthRequest, res: Response) {
    try {
      const { q, difficulty, category, cuisine, maxPrepTime } = req.query;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          error: { code: 2001, message: 'Query parameter is required' },
        });
      }

      const filters = {
        difficulty: difficulty as string | undefined,
        category: category as string | undefined,
        cuisine: cuisine as string | undefined,
        maxPrepTime: maxPrepTime ? parseInt(maxPrepTime as string) : undefined,
      };

      const recipes = await recipeService.searchRecipes(q, filters);

      return res.status(200).json({
        success: true,
        data: recipes,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to search recipes',
        },
      });
    }
  },
};
