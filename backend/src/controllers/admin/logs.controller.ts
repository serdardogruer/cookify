import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { logService } from '../../services/admin/log.service';

export const logsController = {
  async getLogs(req: AuthRequest, res: Response) {
    try {
      const {
        type,
        userId,
        action,
        startDate,
        endDate,
        page,
        limit,
      } = req.query;

      const filters: any = {};

      if (type) filters.type = type as string;
      if (userId) filters.userId = parseInt(userId as string);
      if (action) filters.action = action as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);

      const result = await logService.getLogs(filters);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Get logs error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to get logs',
        },
      });
    }
  },

  async getLogStats(req: AuthRequest, res: Response) {
    try {
      const stats = await logService.getLogStats();

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Get log stats error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to get log stats',
        },
      });
    }
  },

  async cleanOldLogs(req: AuthRequest, res: Response) {
    try {
      const { daysToKeep } = req.body;
      const days = daysToKeep ? parseInt(daysToKeep) : 90;

      const deletedCount = await logService.cleanOldLogs(days);

      return res.status(200).json({
        success: true,
        data: {
          message: `Cleaned ${deletedCount} old logs`,
          deletedCount,
        },
      });
    } catch (error: any) {
      console.error('Clean old logs error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to clean old logs',
        },
      });
    }
  },
};
