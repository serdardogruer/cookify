import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import moduleService from '../services/module.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const moduleController = {
  async getModules(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.kitchenId) {
        return res.status(404).json({
          success: false,
          error: { code: 3002, message: 'No active kitchen' },
        });
      }

      const modules = await moduleService.getModuleStatus(user.kitchenId);

      return res.status(200).json({
        success: true,
        data: modules,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to get modules',
        },
      });
    }
  },

  async toggleModule(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.kitchenId) {
        return res.status(404).json({
          success: false,
          error: { code: 3002, message: 'No active kitchen' },
        });
      }

      const result = await moduleService.toggleModule(
        user.kitchenId,
        parseInt(id)
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 4004,
          message: error.message || 'Failed to toggle module',
        },
      });
    }
  },
};
