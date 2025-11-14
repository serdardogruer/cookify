import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const customMealController = {
  // Kullanıcının yemeklerini getir
  async getUserMeals(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      const meals = await prisma.customMeal.findMany({
        where: { userId },
        include: {
          ingredients: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({
        success: true,
        data: meals,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to get meals',
        },
      });
    }
  },

  // Yeni yemek ekle
  async createMeal(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { name, ingredients } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      const meal = await prisma.customMeal.create({
        data: {
          userId,
          name,
          ingredients: {
            create: ingredients.map((ing: any) => ({
              name: ing.name,
              quantity: ing.quantity,
              unit: ing.unit,
            })),
          },
        },
        include: {
          ingredients: true,
        },
      });

      return res.status(201).json({
        success: true,
        data: meal,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to create meal',
        },
      });
    }
  },

  // Yemek sil
  async deleteMeal(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      // Yemeğin kullanıcıya ait olduğunu kontrol et
      const meal = await prisma.customMeal.findFirst({
        where: {
          id: parseInt(id),
          userId,
        },
      });

      if (!meal) {
        return res.status(404).json({
          success: false,
          error: { code: 3004, message: 'Meal not found' },
        });
      }

      await prisma.customMeal.delete({
        where: { id: parseInt(id) },
      });

      return res.status(200).json({
        success: true,
        data: { message: 'Meal deleted' },
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to delete meal',
        },
      });
    }
  },

  // Yemek yap (malzemeleri düş)
  async consumeMeal(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { mealId, servings = 1 } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      // Kullanıcının mutfağını bul
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { kitchenId: true },
      });

      if (!user?.kitchenId) {
        return res.status(404).json({
          success: false,
          error: { code: 3002, message: 'Kitchen not found' },
        });
      }

      // Yemeği ve malzemelerini getir
      const meal = await prisma.customMeal.findFirst({
        where: {
          id: mealId,
          userId,
        },
        include: {
          ingredients: true,
        },
      });

      if (!meal) {
        return res.status(404).json({
          success: false,
          error: { code: 3004, message: 'Meal not found' },
        });
      }

      const updates: any[] = [];

      // Her malzeme için dolabı güncelle
      for (const ingredient of meal.ingredients) {
        const pantryItem = await prisma.pantryItem.findFirst({
          where: {
            kitchenId: user.kitchenId,
            name: {
              contains: ingredient.name,
            },
          },
        });

        if (pantryItem && pantryItem.quantity > 0) {
          const consumeAmount = ingredient.quantity * servings;
          const newQuantity = Math.max(0, pantryItem.quantity - consumeAmount);

          await prisma.pantryItem.update({
            where: { id: pantryItem.id },
            data: { quantity: newQuantity },
          });

          updates.push({
            name: pantryItem.name,
            consumed: consumeAmount,
            unit: pantryItem.unit,
          });
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          meal: meal.name,
          servings,
          updates,
        },
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to consume meal',
        },
      });
    }
  },
};
