import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { settingsService } from '../../services/admin/settings.service';
import { logAdminAction } from '../../middleware/admin.middleware';

export const settingsController = {
  async getSettings(req: AuthRequest, res: Response) {
    try {
      const settings = await settingsService.getSettings();

      return res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error: any) {
      console.error('Get settings error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to get settings',
        },
      });
    }
  },

  async updateSettings(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 4001, message: 'Unauthorized' },
        });
      }

      const {
        allowRegistration,
        maintenanceMode,
        maxFileUploadSize,
        sessionTimeout,
      } = req.body;

      const updateData: any = {};
      if (allowRegistration !== undefined) updateData.allowRegistration = allowRegistration;
      if (maintenanceMode !== undefined) updateData.maintenanceMode = maintenanceMode;
      if (maxFileUploadSize !== undefined) updateData.maxFileUploadSize = maxFileUploadSize;
      if (sessionTimeout !== undefined) updateData.sessionTimeout = sessionTimeout;

      const settings = await settingsService.updateSettings(updateData, userId);

      // Log admin action
      await logAdminAction(
        'UPDATE_SETTINGS',
        userId,
        { changes: updateData },
        req
      );

      return res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error: any) {
      console.error('Update settings error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to update settings',
        },
      });
    }
  },

  async toggleMaintenanceMode(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 4001, message: 'Unauthorized' },
        });
      }

      const { enabled } = req.body;

      if (enabled === undefined) {
        return res.status(400).json({
          success: false,
          error: { code: 4000, message: 'enabled field is required' },
        });
      }

      const settings = await settingsService.toggleMaintenanceMode(enabled, userId);

      // Log admin action
      await logAdminAction(
        'TOGGLE_MAINTENANCE_MODE',
        userId,
        { enabled },
        req
      );

      return res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error: any) {
      console.error('Toggle maintenance mode error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to toggle maintenance mode',
        },
      });
    }
  },
};
