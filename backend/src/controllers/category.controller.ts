import { Request, Response } from 'express';
import categoryService from '../services/category.service';

export const categoryController = {
  async getCategories(_req: Request, res: Response) {
    try {
      const categories = await categoryService.getAllCategories();

      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to get categories',
        },
      });
    }
  },

  async searchIngredients(req: Request, res: Response) {
    try {
      const { q, limit } = req.query;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          error: { code: 2001, message: 'Query parameter is required' },
        });
      }

      const limitNum = limit ? parseInt(limit as string) : 10;
      const ingredients = await categoryService.searchIngredients(q, limitNum);

      return res.status(200).json({
        success: true,
        data: ingredients,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to search ingredients',
        },
      });
    }
  },

  async getIngredientsByCategory(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;

      const ingredients = await categoryService.getIngredientsByCategory(
        parseInt(categoryId)
      );

      return res.status(200).json({
        success: true,
        data: ingredients,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to get ingredients',
        },
      });
    }
  },

  async getPopularIngredients(req: Request, res: Response) {
    try {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : 20;

      const ingredients = await categoryService.getPopularIngredients(limitNum);

      return res.status(200).json({
        success: true,
        data: ingredients,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to get popular ingredients',
        },
      });
    }
  },
};
