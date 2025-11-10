import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import pantryService from '../services/pantry.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const pantryController = {
  async getPantryItems(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { category } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      // Kullanıcının aktif mutfağını al
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.kitchenId) {
        return res.status(404).json({
          success: false,
          error: { code: 3002, message: 'No active kitchen' },
        });
      }

      const items = await pantryService.getPantryItems(
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
          message: error.message || 'Failed to get pantry items',
        },
      });
    }
  },

  async addPantryItem(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { name, category, quantity, unit, expiryDate } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      // Validasyon
      if (!name || !category || !quantity || !unit) {
        return res.status(400).json({
          success: false,
          error: {
            code: 2001,
            message: 'Name, category, quantity and unit are required',
          },
        });
      }

      // Kullanıcının aktif mutfağını al
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.kitchenId) {
        return res.status(404).json({
          success: false,
          error: { code: 3002, message: 'No active kitchen' },
        });
      }

      const item = await pantryService.addPantryItem(user.kitchenId, {
        name,
        category,
        quantity: parseFloat(quantity),
        unit,
        expiryDate,
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
          message: error.message || 'Failed to add pantry item',
        },
      });
    }
  },

  async addMultiplePantryItems(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { items } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: 2001, message: 'Items array is required' },
        });
      }

      // Kullanıcının aktif mutfağını al
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.kitchenId) {
        return res.status(404).json({
          success: false,
          error: { code: 3002, message: 'No active kitchen' },
        });
      }

      const result = await pantryService.addMultiplePantryItems(
        user.kitchenId,
        items
      );

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to add pantry items',
        },
      });
    }
  },

  async updatePantryItem(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      const { name, category, quantity, unit, expiryDate } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      // Kullanıcının aktif mutfağını al
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.kitchenId) {
        return res.status(404).json({
          success: false,
          error: { code: 3002, message: 'No active kitchen' },
        });
      }

      const item = await pantryService.updatePantryItem(
        parseInt(id),
        user.kitchenId,
        { name, category, quantity, unit, expiryDate }
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
          message: error.message || 'Failed to update pantry item',
        },
      });
    }
  },

  async deletePantryItem(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      // Kullanıcının aktif mutfağını al
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.kitchenId) {
        return res.status(404).json({
          success: false,
          error: { code: 3002, message: 'No active kitchen' },
        });
      }

      await pantryService.deletePantryItem(parseInt(id), user.kitchenId);

      return res.status(200).json({
        success: true,
        data: { message: 'Item deleted successfully' },
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to delete pantry item',
        },
      });
    }
  },

  async moveToMarket(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      // Kullanıcının aktif mutfağını al
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.kitchenId) {
        return res.status(404).json({
          success: false,
          error: { code: 3002, message: 'No active kitchen' },
        });
      }

      const marketItem = await pantryService.addToMarket(
        parseInt(id),
        user.kitchenId
      );

      return res.status(200).json({
        success: true,
        data: marketItem,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to move item to market',
        },
      });
    }
  },
};
