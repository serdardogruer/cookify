import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { kitchenManagementService } from '../../services/admin/kitchen-management.service';
import { logAdminAction } from '../../middleware/admin.middleware';

export const kitchensController = {
  async getAllKitchens(req: AuthRequest, res: Response) {
    try {
      const { status, search, page, limit } = req.query;

      const filters: any = {};
      if (status) filters.status = status as string;
      if (search) filters.search = search as string;
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);

      const result = await kitchenManagementService.getAllKitchens(filters);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Get all kitchens error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to get kitchens',
        },
      });
    }
  },

  async getKitchenDetails(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const kitchenId = parseInt(id);

      const kitchen = await kitchenManagementService.getKitchenDetails(kitchenId);

      return res.status(200).json({
        success: true,
        data: kitchen,
      });
    } catch (error: any) {
      console.error('Get kitchen details error:', error);
      return res.status(404).json({
        success: false,
        error: {
          code: 4043,
          message: error.message || 'Kitchen not found',
        },
      });
    }
  },

  async updateKitchenStatus(req: AuthRequest, res: Response) {
    try {
      const adminUserId = req.user?.userId;
      if (!adminUserId) {
        return res.status(401).json({
          success: false,
          error: { code: 4001, message: 'Unauthorized' },
        });
      }

      const { id } = req.params;
      const { status } = req.body;
      const kitchenId = parseInt(id);

      if (!status) {
        return res.status(400).json({
          success: false,
          error: { code: 4000, message: 'Status is required' },
        });
      }

      const kitchen = await kitchenManagementService.updateKitchenStatus(
        kitchenId,
        status
      );

      // Log admin action
      await logAdminAction(
        'UPDATE_KITCHEN_STATUS',
        adminUserId,
        { kitchenId, status },
        req
      );

      return res.status(200).json({
        success: true,
        data: kitchen,
      });
    } catch (error: any) {
      console.error('Update kitchen status error:', error);
      return res.status(400).json({
        success: false,
        error: {
          code: 4000,
          message: error.message || 'Failed to update kitchen status',
        },
      });
    }
  },

  async getKitchenStats(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const kitchenId = parseInt(id);

      const stats = await kitchenManagementService.getKitchenStats(kitchenId);

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Get kitchen stats error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to get kitchen stats',
        },
      });
    }
  },

  async getGlobalKitchenStats(req: AuthRequest, res: Response) {
    try {
      const stats = await kitchenManagementService.getGlobalKitchenStats();

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Get global kitchen stats error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to get global kitchen stats',
        },
      });
    }
  },

  async searchKitchens(req: AuthRequest, res: Response) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          error: { code: 4000, message: 'Search query is required' },
        });
      }

      const kitchens = await kitchenManagementService.searchKitchens(q as string);

      return res.status(200).json({
        success: true,
        data: kitchens,
      });
    } catch (error: any) {
      console.error('Search kitchens error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to search kitchens',
        },
      });
    }
  },
};
