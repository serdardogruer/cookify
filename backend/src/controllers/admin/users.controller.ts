import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { userManagementService } from '../../services/admin/user-management.service';
import { logAdminAction } from '../../middleware/admin.middleware';

export const usersController = {
  async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const { isAdmin, search, page, limit } = req.query;

      const filters: any = {};
      if (isAdmin !== undefined) filters.isAdmin = isAdmin === 'true';
      if (search) filters.search = search as string;
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);

      const result = await userManagementService.getAllUsers(filters);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Get all users error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to get users',
        },
      });
    }
  },

  async getUserById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      const user = await userManagementService.getUserById(userId);

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      console.error('Get user by ID error:', error);
      return res.status(404).json({
        success: false,
        error: {
          code: 4041,
          message: error.message || 'User not found',
        },
      });
    }
  },

  async toggleAdminStatus(req: AuthRequest, res: Response) {
    try {
      const adminUserId = req.user?.userId;
      if (!adminUserId) {
        return res.status(401).json({
          success: false,
          error: { code: 4001, message: 'Unauthorized' },
        });
      }

      const { id } = req.params;
      const { isAdmin } = req.body;
      const userId = parseInt(id);

      if (isAdmin === undefined) {
        return res.status(400).json({
          success: false,
          error: { code: 4000, message: 'isAdmin field is required' },
        });
      }

      // Kendine admin yetkisi veremez/alamaz
      if (userId === adminUserId) {
        return res.status(400).json({
          success: false,
          error: { code: 4092, message: 'Cannot modify your own admin status' },
        });
      }

      const user = await userManagementService.toggleAdminStatus(userId, isAdmin);

      // Log admin action
      await logAdminAction(
        'TOGGLE_ADMIN_STATUS',
        adminUserId,
        { targetUserId: userId, isAdmin },
        req
      );

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      console.error('Toggle admin status error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to toggle admin status',
        },
      });
    }
  },

  async deleteUser(req: AuthRequest, res: Response) {
    try {
      const adminUserId = req.user?.userId;
      if (!adminUserId) {
        return res.status(401).json({
          success: false,
          error: { code: 4001, message: 'Unauthorized' },
        });
      }

      const { id } = req.params;
      const userId = parseInt(id);

      // Kendini silemez
      if (userId === adminUserId) {
        return res.status(400).json({
          success: false,
          error: { code: 4092, message: 'Cannot delete yourself' },
        });
      }

      await userManagementService.deleteUser(userId);

      // Log admin action
      await logAdminAction(
        'DELETE_USER',
        adminUserId,
        { targetUserId: userId },
        req
      );

      return res.status(200).json({
        success: true,
        data: { message: 'User deleted successfully' },
      });
    } catch (error: any) {
      console.error('Delete user error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to delete user',
        },
      });
    }
  },

  async searchUsers(req: AuthRequest, res: Response) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          error: { code: 4000, message: 'Search query is required' },
        });
      }

      const users = await userManagementService.searchUsers(q as string);

      return res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error: any) {
      console.error('Search users error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to search users',
        },
      });
    }
  },

  async getUserStats(req: AuthRequest, res: Response) {
    try {
      const stats = await userManagementService.getUserStats();

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Get user stats error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to get user stats',
        },
      });
    }
  },
};
