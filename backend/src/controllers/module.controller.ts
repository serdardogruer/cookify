import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Tüm modülleri listele (kullanıcı için)
export const getAllModules = async (req: AuthRequest, res: Response) => {
  try {
    const modules = await prisma.module.findMany({
      where: { isActive: true },
      orderBy: [
        { isCore: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    return res.json({ success: true, data: modules });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Kullanıcının modüllerini getir
export const getUserModules = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Yetkisiz erişim' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { kitchen: true }
    });

    if (!user || !user.kitchenId) {
      return res.status(404).json({ success: false, message: 'Mutfak bulunamadı' });
    }

    const kitchenModules = await prisma.kitchenModule.findMany({
      where: { kitchenId: user.kitchenId },
      include: { module: true }
    });

    const allModules = await prisma.module.findMany({
      where: { isActive: true }
    });

    const modules = allModules.map(module => {
      const userModule = kitchenModules.find(km => km.moduleId === module.id);
      
      return {
        ...module,
        isEnabled: userModule?.isEnabled || false,
        status: userModule?.status || 'locked',
        trialEndsAt: userModule?.trialEndsAt,
        paidUntil: userModule?.paidUntil
      };
    });

    return res.json({ success: true, data: modules });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Modülü aktif/pasif et
export const toggleModule = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { moduleId } = req.params;
    const { isEnabled } = req.body;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Yetkisiz erişim' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.kitchenId) {
      return res.status(404).json({ success: false, message: 'Mutfak bulunamadı' });
    }

    const module = await prisma.module.findUnique({
      where: { id: parseInt(moduleId) }
    });

    if (!module) {
      return res.status(404).json({ success: false, message: 'Modül bulunamadı' });
    }

    if (module.isCore) {
      return res.json({ success: true, message: 'Temel modüller kapatılamaz' });
    }

    const kitchenModule = await prisma.kitchenModule.upsert({
      where: {
        kitchenId_moduleId: {
          kitchenId: user.kitchenId,
          moduleId: parseInt(moduleId)
        }
      },
      update: { isEnabled },
      create: {
        kitchenId: user.kitchenId,
        moduleId: parseInt(moduleId),
        isEnabled,
        status: 'locked'
      }
    });

    return res.json({ success: true, data: kitchenModule });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Modül satın al / deneme başlat
export const activateModule = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { moduleId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Yetkisiz erişim' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.kitchenId) {
      return res.status(404).json({ success: false, message: 'Mutfak bulunamadı' });
    }

    const module = await prisma.module.findUnique({
      where: { id: parseInt(moduleId) }
    });

    if (!module) {
      return res.status(404).json({ success: false, message: 'Modül bulunamadı' });
    }

    let status = 'active';
    let trialEndsAt = null;
    let paidUntil = null;

    if (module.pricingType === 'trial' && module.trialDays) {
      status = 'trial';
      trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + module.trialDays);
    } else if (module.pricingType === 'paid') {
      status = 'active';
      paidUntil = new Date();
      paidUntil.setMonth(paidUntil.getMonth() + 1);
    }

    const kitchenModule = await prisma.kitchenModule.upsert({
      where: {
        kitchenId_moduleId: {
          kitchenId: user.kitchenId,
          moduleId: parseInt(moduleId)
        }
      },
      update: {
        isEnabled: true,
        status,
        trialEndsAt,
        paidUntil
      },
      create: {
        kitchenId: user.kitchenId,
        moduleId: parseInt(moduleId),
        isEnabled: true,
        status,
        trialEndsAt,
        paidUntil
      }
    });

    return res.json({ success: true, data: kitchenModule });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
