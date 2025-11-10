import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import marketService from '../services/market.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const marketController = {
  async getMarketItems(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { category } = req.query;

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

      const items = await marketService.getMarketItems(
        user.kitchenId,
        category as string | undefined
      );

      return res.status(200).json({
        success: true,
        data: items,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to get market items',
        },
      });
    }
  },

  async addMarketItem(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { name, category, quantity, unit } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      if (!name || !category || !quantity || !unit) {
        return res.status(400).json({
          success: false,
          error: {
            code: 2001,
            message: 'Name, category, quantity and unit are required',
          },
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

      const item = await marketService.addMarketItem(user.kitchenId, {
        name,
        category,
        quantity: parseFloat(quantity),
        unit,
      });

      return res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to add market item',
        },
      });
    }
  },

  async updateMarketItem(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      const { name, category, quantity, unit } = req.body;

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

      const item = await marketService.updateMarketItem(
        parseInt(id),
        user.kitchenId,
        { name, category, quantity, unit }
      );

      return res.status(200).json({
        success: true,
        data: item,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to update market item',
        },
      });
    }
  },

  async deleteMarketItem(req: AuthRequest, res: Response) {
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

      await marketService.deleteMarketItem(parseInt(id), user.kitchenId);

      return res.status(200).json({
        success: true,
        data: { message: 'Item deleted successfully' },
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to delete market item',
        },
      });
    }
  },

  async moveToPantry(req: AuthRequest, res: Response) {
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

      const pantryItem = await marketService.moveToPantry(
        parseInt(id),
        user.kitchenId
      );

      return res.status(200).json({
        success: true,
        data: pantryItem,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to move item to pantry',
        },
      });
    }
  },

  async exportToWhatsApp(req: AuthRequest, res: Response) {
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

      const message = await marketService.exportToWhatsApp(user.kitchenId);

      return res.status(200).json({
        success: true,
        data: { message },
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to export to WhatsApp',
        },
      });
    }
  },
};
