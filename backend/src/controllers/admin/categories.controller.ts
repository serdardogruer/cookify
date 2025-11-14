import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { categoryManagementService } from '../../services/admin/category-management.service';
import { logAdminAction } from '../../middleware/admin.middleware';

export const categoriesController = {
  async getAllCategories(req: AuthRequest, res: Response) {
    try {
      const categories = await categoryManagementService.getAllCategories();

      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      console.error('Get all categories error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to get categories',
        },
      });
    }
  },

  async getCategoryById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const categoryId = parseInt(id);

      const category = await categoryManagementService.getCategoryById(categoryId);

      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      console.error('Get category by ID error:', error);
      return res.status(404).json({
        success: false,
        error: {
          code: 4042,
          message: error.message || 'Category not found',
        },
      });
    }
  },

  async createCategory(req: AuthRequest, res: Response) {
    try {
      const adminUserId = req.user?.userId;
      if (!adminUserId) {
        return res.status(401).json({
          success: false,
          error: { code: 4001, message: 'Unauthorized' },
        });
      }

      const { name, icon } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          error: { code: 4000, message: 'Category name is required' },
        });
      }

      const category = await categoryManagementService.createCategory({ name, icon });

      // Log admin action
      await logAdminAction(
        'CREATE_CATEGORY',
        adminUserId,
        { categoryId: category.id, name },
        req
      );

      return res.status(201).json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      console.error('Create category error:', error);
      return res.status(400).json({
        success: false,
        error: {
          code: 4000,
          message: error.message || 'Failed to create category',
        },
      });
    }
  },

  async updateCategory(req: AuthRequest, res: Response) {
    try {
      const adminUserId = req.user?.userId;
      if (!adminUserId) {
        return res.status(401).json({
          success: false,
          error: { code: 4001, message: 'Unauthorized' },
        });
      }

      const { id } = req.params;
      const categoryId = parseInt(id);
      const { name, icon } = req.body;

      const category = await categoryManagementService.updateCategory(categoryId, {
        name,
        icon,
      });

      // Log admin action
      await logAdminAction(
        'UPDATE_CATEGORY',
        adminUserId,
        { categoryId, changes: { name, icon } },
        req
      );

      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      console.error('Update category error:', error);
      return res.status(400).json({
        success: false,
        error: {
          code: 4000,
          message: error.message || 'Failed to update category',
        },
      });
    }
  },

  async deleteCategory(req: AuthRequest, res: Response) {
    try {
      const adminUserId = req.user?.userId;
      if (!adminUserId) {
        return res.status(401).json({
          success: false,
          error: { code: 4001, message: 'Unauthorized' },
        });
      }

      const { id } = req.params;
      const categoryId = parseInt(id);

      await categoryManagementService.deleteCategory(categoryId);

      // Log admin action
      await logAdminAction(
        'DELETE_CATEGORY',
        adminUserId,
        { categoryId },
        req
      );

      return res.status(200).json({
        success: true,
        data: { message: 'Category deleted successfully' },
      });
    } catch (error: any) {
      console.error('Delete category error:', error);
      return res.status(400).json({
        success: false,
        error: {
          code: 4091,
          message: error.message || 'Failed to delete category',
        },
      });
    }
  },

  async checkCategoryUsage(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const categoryId = parseInt(id);

      const usage = await categoryManagementService.checkCategoryUsage(categoryId);

      return res.status(200).json({
        success: true,
        data: usage,
      });
    } catch (error: any) {
      console.error('Check category usage error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to check category usage',
        },
      });
    }
  },

  async getCategoryStats(req: AuthRequest, res: Response) {
    try {
      const stats = await categoryManagementService.getCategoryStats();

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Get category stats error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to get category stats',
        },
      });
    }
  },
};
