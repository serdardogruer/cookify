import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getStats = async (req: AuthRequest, res: Response) => {
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

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        password: true,
        plainPassword: true, // Admin için plain text şifre
        isAdmin: true,
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

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: { code: 500, message: 'Kullanıcılar alınamadı' }
    });
  }
};

export const getAllIngredients = async (req: AuthRequest, res: Response) => {
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

export const createIngredient = async (req: AuthRequest, res: Response) => {
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

export const updateIngredient = async (req: AuthRequest, res: Response) => {
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

export const deleteIngredient = async (req: AuthRequest, res: Response) => {
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


// Modül Yönetimi
export const getAllModulesAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const modules = await prisma.module.findMany({
      orderBy: [
        { isCore: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return res.json({ success: true, data: modules });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createModule = async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, description, icon, isCore, pricingType, price, trialDays, badge } = req.body;

    const module = await prisma.module.create({
      data: {
        name,
        slug,
        description,
        icon,
        isCore: isCore || false,
        pricingType: pricingType || 'free',
        price: price ? parseFloat(price) : null,
        trialDays: trialDays ? parseInt(trialDays) : null,
        badge: badge || null,
        isActive: true
      }
    });

    return res.json({ success: true, data: module });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateModule = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon, isCore, pricingType, price, trialDays, badge, isActive } = req.body;

    const module = await prisma.module.update({
      where: { id: parseInt(id) },
      data: {
        name,
        slug,
        description,
        icon,
        isCore,
        pricingType,
        price: price ? parseFloat(price) : null,
        trialDays: trialDays ? parseInt(trialDays) : null,
        badge: badge || null,
        isActive
      }
    });

    return res.json({ success: true, data: module });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteModule = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Temel modüller silinemez
    const module = await prisma.module.findUnique({
      where: { id: parseInt(id) }
    });

    if (module?.isCore) {
      return res.status(400).json({ success: false, message: 'Temel modüller silinemez' });
    }

    await prisma.module.delete({
      where: { id: parseInt(id) }
    });

    return res.json({ success: true, message: 'Modül silindi' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
