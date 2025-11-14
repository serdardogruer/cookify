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

  async requestJoinKitchen(req: AuthRequest, res: Response) {
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

      // Zaten üye mi kontrol et
      const existingMember = await prisma.kitchenMember.findFirst({
        where: {
          kitchenId: kitchen.id,
          userId,
        },
      });

      if (existingMember) {
        return res.status(400).json({
          success: false,
          error: { code: 4006, message: 'Already a member of this kitchen' },
        });
      }

      // Bekleyen istek var mı kontrol et
      const existingRequest = await prisma.kitchenJoinRequest.findUnique({
        where: {
          kitchenId_userId: {
            kitchenId: kitchen.id,
            userId,
          },
        },
      });

      if (existingRequest) {
        if (existingRequest.status === 'PENDING') {
          return res.status(400).json({
            success: false,
            error: { code: 4007, message: 'Join request already pending' },
          });
        }
        // Eski isteği güncelle
        await prisma.kitchenJoinRequest.update({
          where: { id: existingRequest.id },
          data: { status: 'PENDING', updatedAt: new Date() },
        });
      } else {
        // Yeni istek oluştur
        await prisma.kitchenJoinRequest.create({
          data: {
            kitchenId: kitchen.id,
            userId,
            status: 'PENDING',
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: { 
          message: 'Join request sent successfully',
          kitchenName: kitchen.name 
        },
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to send join request',
        },
      });
    }
  },

  async getPendingRequests(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      // Kullanıcının sahip olduğu mutfakları bul
      const ownedKitchens = await prisma.kitchen.findMany({
        where: { ownerId: userId },
        include: {
          joinRequests: {
            where: { status: 'PENDING' },
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
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      // Tüm bekleyen istekleri topla
      const allRequests = ownedKitchens.flatMap((kitchen) =>
        kitchen.joinRequests.map((request) => ({
          ...request,
          kitchenName: kitchen.name,
        }))
      );

      return res.status(200).json({
        success: true,
        data: allRequests,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to get pending requests',
        },
      });
    }
  },

  async approveJoinRequest(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { requestId } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      if (!requestId) {
        return res.status(400).json({
          success: false,
          error: { code: 2001, message: 'Request ID is required' },
        });
      }

      // İsteği bul
      const request = await prisma.kitchenJoinRequest.findUnique({
        where: { id: requestId },
        include: { kitchen: true, user: true },
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          error: { code: 3004, message: 'Join request not found' },
        });
      }

      // Sadece mutfak sahibi onaylayabilir
      if (request.kitchen.ownerId !== userId) {
        return res.status(403).json({
          success: false,
          error: { code: 4008, message: 'Only kitchen owner can approve requests' },
        });
      }

      // Transaction ile işlemleri yap
      await prisma.$transaction(async (tx) => {
        // İsteği onayla
        await tx.kitchenJoinRequest.update({
          where: { id: requestId },
          data: { status: 'APPROVED' },
        });

        // Kullanıcının mevcut mutfağını pasif yap
        if (request.user.kitchenId) {
          await tx.kitchen.update({
            where: { id: request.user.kitchenId },
            data: { status: 'PASSIVE' },
          });
        }

        // Mutfağa üye ekle
        await tx.kitchenMember.create({
          data: {
            kitchenId: request.kitchenId,
            userId: request.userId,
            role: 'MEMBER',
          },
        });

        // Kullanıcının aktif mutfağını güncelle
        await tx.user.update({
          where: { id: request.userId },
          data: { kitchenId: request.kitchenId },
        });

        // Mutfağı aktif yap
        await tx.kitchen.update({
          where: { id: request.kitchenId },
          data: { status: 'ACTIVE' },
        });
      });

      return res.status(200).json({
        success: true,
        data: { message: 'Join request approved successfully' },
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to approve join request',
        },
      });
    }
  },

  async rejectJoinRequest(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { requestId } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      if (!requestId) {
        return res.status(400).json({
          success: false,
          error: { code: 2001, message: 'Request ID is required' },
        });
      }

      // İsteği bul
      const request = await prisma.kitchenJoinRequest.findUnique({
        where: { id: requestId },
        include: { kitchen: true },
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          error: { code: 3004, message: 'Join request not found' },
        });
      }

      // Sadece mutfak sahibi reddedebilir
      if (request.kitchen.ownerId !== userId) {
        return res.status(403).json({
          success: false,
          error: { code: 4009, message: 'Only kitchen owner can reject requests' },
        });
      }

      // İsteği reddet
      await prisma.kitchenJoinRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' },
      });

      return res.status(200).json({
        success: true,
        data: { message: 'Join request rejected successfully' },
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to reject join request',
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

  async removeMember(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { memberId } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      if (!memberId) {
        return res.status(400).json({
          success: false,
          error: { code: 2001, message: 'Member ID is required' },
        });
      }

      // Kullanıcının mutfağını kontrol et
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { kitchen: true },
      });

      if (!user?.kitchen) {
        return res.status(404).json({
          success: false,
          error: { code: 3002, message: 'No active kitchen' },
        });
      }

      // Sadece mutfak sahibi üye çıkarabilir
      if (user.kitchen.ownerId !== userId) {
        return res.status(403).json({
          success: false,
          error: { code: 4004, message: 'Only kitchen owner can remove members' },
        });
      }

      // Kendini çıkaramaz
      if (memberId === userId) {
        return res.status(400).json({
          success: false,
          error: { code: 4005, message: 'Cannot remove yourself' },
        });
      }

      // Üyeyi kontrol et
      const member = await prisma.kitchenMember.findFirst({
        where: {
          kitchenId: user.kitchen.id,
          userId: memberId,
        },
      });

      if (!member) {
        return res.status(404).json({
          success: false,
          error: { code: 3003, message: 'Member not found in this kitchen' },
        });
      }

      // Üyeyi sil
      await prisma.kitchenMember.delete({
        where: { id: member.id },
      });

      // Üyenin kendi mutfağını bul veya oluştur
      const memberUser = await prisma.user.findUnique({
        where: { id: memberId },
        include: { ownedKitchens: true },
      });

      if (memberUser) {
        let newKitchen = memberUser.ownedKitchens.find((k) => k.ownerId === memberId);

        if (newKitchen) {
          await prisma.kitchen.update({
            where: { id: newKitchen.id },
            data: { status: 'ACTIVE' },
          });
        } else {
          const result = await kitchenService.createKitchenForNewUser(memberId, memberUser.name);
          newKitchen = result.kitchen;
        }

        // Üyenin aktif mutfağını güncelle
        await prisma.user.update({
          where: { id: memberId },
          data: { kitchenId: newKitchen.id },
        });
      }

      return res.status(200).json({
        success: true,
        data: { message: 'Member removed successfully' },
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to remove member',
        },
      });
    }
  },

  async getMyJoinRequests(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      // Kullanıcının gönderdiği bekleyen istekleri bul
      const myRequests = await prisma.kitchenJoinRequest.findMany({
        where: { 
          userId,
          status: 'PENDING'
        },
        include: {
          kitchen: {
            select: {
              id: true,
              name: true,
              owner: {
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
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({
        success: true,
        data: myRequests,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to get join requests',
        },
      });
    }
  },

  async cancelJoinRequest(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { requestId } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      if (!requestId) {
        return res.status(400).json({
          success: false,
          error: { code: 2001, message: 'Request ID is required' },
        });
      }

      // İsteği bul
      const request = await prisma.kitchenJoinRequest.findUnique({
        where: { id: requestId },
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          error: { code: 3004, message: 'Join request not found' },
        });
      }

      // Sadece kendi isteğini iptal edebilir
      if (request.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: { code: 4010, message: 'You can only cancel your own requests' },
        });
      }

      // İsteği sil
      await prisma.kitchenJoinRequest.delete({
        where: { id: requestId },
      });

      return res.status(200).json({
        success: true,
        data: { message: 'Join request cancelled successfully' },
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to cancel join request',
        },
      });
    }
  },
};
