import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import kitchenService from '../services/kitchen.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const kitchenController = {
  async getActiveKitchen(req: AuthRequest, res: Response) {
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
        include: {
          kitchen: {
            include: {
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      profileImage: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user?.kitchen) {
        return res.status(404).json({
          success: false,
          error: { code: 3002, message: 'Kitchen not found' },
        });
      }

      return res.status(200).json({
        success: true,
        data: user.kitchen,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to get kitchen',
        },
      });
    }
  },

  async joinKitchen(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { inviteCode } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      if (!inviteCode) {
        return res.status(400).json({
          success: false,
          error: { code: 2001, message: 'Invite code is required' },
        });
      }

      // Davet kodunu kontrol et
      const kitchen = await prisma.kitchen.findUnique({
        where: { inviteCode },
      });

      if (!kitchen) {
        return res.status(404).json({
          success: false,
          error: { code: 4002, message: 'Invalid invite code' },
        });
      }

      // Kullanıcının mevcut mutfağını pasif yap
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user?.kitchenId) {
        await prisma.kitchen.update({
          where: { id: user.kitchenId },
          data: { status: 'PASSIVE' },
        });
      }

      // Yeni mutfağa üye ekle
      const existingMember = await prisma.kitchenMember.findFirst({
        where: {
          kitchenId: kitchen.id,
          userId,
        },
      });

      if (!existingMember) {
        await prisma.kitchenMember.create({
          data: {
            kitchenId: kitchen.id,
            userId,
            role: 'MEMBER',
          },
        });
      }

      // Kullanıcının aktif mutfağını güncelle
      await prisma.user.update({
        where: { id: userId },
        data: { kitchenId: kitchen.id },
      });

      // Yeni mutfağı aktif yap
      await prisma.kitchen.update({
        where: { id: kitchen.id },
        data: { status: 'ACTIVE' },
      });

      return res.status(200).json({
        success: true,
        data: { kitchen },
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to join kitchen',
        },
      });
    }
  },

  async leaveKitchen(req: AuthRequest, res: Response) {
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
        include: {
          kitchen: true,
          ownedKitchens: true,
        },
      });

      if (!user?.kitchen) {
        return res.status(404).json({
          success: false,
          error: { code: 3002, message: 'No active kitchen' },
        });
      }

      // Kendi mutfağından ayrılamaz
      if (user.kitchen.ownerId === userId) {
        return res.status(400).json({
          success: false,
          error: { code: 4003, message: 'Cannot leave your own kitchen' },
        });
      }

      // Mevcut mutfağı pasif yap
      await prisma.kitchen.update({
        where: { id: user.kitchen.id },
        data: { status: 'PASSIVE' },
      });

      // Kullanıcının kendi mutfağını bul veya yeni oluştur
      let newKitchen = user.ownedKitchens.find((k) => k.ownerId === userId);

      if (newKitchen) {
        // Kendi mutfağını aktif yap
        await prisma.kitchen.update({
          where: { id: newKitchen.id },
          data: { status: 'ACTIVE' },
        });
      } else {
        // Yeni mutfak oluştur
        const result = await kitchenService.createKitchenForNewUser(userId, user.name);
        newKitchen = result.kitchen;
      }

      // Kullanıcının aktif mutfağını güncelle
      await prisma.user.update({
        where: { id: userId },
        data: { kitchenId: newKitchen.id },
      });

      return res.status(200).json({
        success: true,
        data: { kitchen: newKitchen },
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to leave kitchen',
        },
      });
    }
  },
};
