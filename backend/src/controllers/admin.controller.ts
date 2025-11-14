import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getStats = async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalKitchens,
      totalRecipes,
      totalPantryItems,
      totalMarketItems,
      totalIngredients,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.kitchen.count(),
      prisma.recipe.count(),
      prisma.pantryItem.count(),
      prisma.marketItem.count(),
      prisma.ingredient.count(),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalKitchens,
        totalRecipes,
        totalPantryItems,
        totalMarketItems,
        totalIngredients,
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: { code: 500, message: 'İstatistikler alınamadı' }
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            recipes: true,
            ownedKitchens: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // isAdmin bilgisini ayrıca al
    const usersWithAdmin = await Promise.all(
      users.map(async (user) => {
        const fullUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { isAdmin: true }
        });
        return { ...user, isAdmin: fullUser?.isAdmin || false };
      })
    );

    res.json({
      success: true,
      data: usersWithAdmin
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: { code: 500, message: 'Kullanıcılar alınamadı' }
    });
  }
};

export const getAllIngredients = async (req: Request, res: Response) => {
  try {
    const ingredients = await prisma.ingredient.findMany({
      include: {
        category: true
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: ingredients
    });
  } catch (error) {
    console.error('Get all ingredients error:', error);
    res.status(500).json({
      success: false,
      error: { code: 500, message: 'Malzemeler alınamadı' }
    });
  }
};

export const createIngredient = async (req: Request, res: Response) => {
  try {
    const { name, categoryId, defaultUnit, shelfLifeDays } = req.body;

    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        categoryId,
        defaultUnit,
        shelfLifeDays: shelfLifeDays || null
      },
      include: {
        category: true
      }
    });

    res.json({
      success: true,
      data: ingredient
    });
  } catch (error) {
    console.error('Create ingredient error:', error);
    res.status(500).json({
      success: false,
      error: { code: 500, message: 'Malzeme eklenemedi' }
    });
  }
};

export const updateIngredient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, categoryId, defaultUnit, shelfLifeDays } = req.body;

    const ingredient = await prisma.ingredient.update({
      where: { id: parseInt(id) },
      data: {
        name,
        categoryId,
        defaultUnit,
        shelfLifeDays: shelfLifeDays || null
      },
      include: {
        category: true
      }
    });

    res.json({
      success: true,
      data: ingredient
    });
  } catch (error) {
    console.error('Update ingredient error:', error);
    res.status(500).json({
      success: false,
      error: { code: 500, message: 'Malzeme güncellenemedi' }
    });
  }
};

export const deleteIngredient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.ingredient.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      data: { message: 'Malzeme silindi' }
    });
  } catch (error) {
    console.error('Delete ingredient error:', error);
    res.status(500).json({
      success: false,
      error: { code: 500, message: 'Malzeme silinemedi' }
    });
  }
};
