import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface KitchenFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

const kitchenManagementService = {
  async getAllKitchens(filters: KitchenFilters = {}) {
    try {
      const { status, search, page = 1, limit = 50 } = filters;

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { name: { contains: search } },
          { owner: { name: { contains: search } } },
        ];
      }

      const skip = (page - 1) * limit;

      const [kitchens, total] = await Promise.all([
        prisma.kitchen.findMany({
          where,
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                members: true,
                pantryItems: true,
                marketItems: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.kitchen.count({ where }),
      ]);

      return {
        kitchens,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Get all kitchens error:', error);
      throw error;
    }
  },

  async getKitchenDetails(kitchenId: number) {
    try {
      const kitchen = await prisma.kitchen.findUnique({
        where: { id: kitchenId },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
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
          pantryItems: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
          marketItems: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              members: true,
              pantryItems: true,
              marketItems: true,
              modules: true,
            },
          },
        },
      });

      if (!kitchen) {
        throw new Error('Kitchen not found');
      }

      return kitchen;
    } catch (error) {
      console.error('Get kitchen details error:', error);
      throw error;
    }
  },

  async updateKitchenStatus(kitchenId: number, status: string) {
    try {
      const kitchen = await prisma.kitchen.update({
        where: { id: kitchenId },
        data: { status },
      });

      return kitchen;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error('Kitchen not found');
      }
      console.error('Update kitchen status error:', error);
      throw error;
    }
  },

  async getKitchenStats(kitchenId: number) {
    try {
      const [
        memberCount,
        pantryItemCount,
        marketItemCount,
        activeModuleCount,
      ] = await Promise.all([
        prisma.kitchenMember.count({ where: { kitchenId } }),
        prisma.pantryItem.count({ where: { kitchenId } }),
        prisma.marketItem.count({ where: { kitchenId } }),
        prisma.kitchenModule.count({
          where: { kitchenId, isEnabled: true },
        }),
      ]);

      return {
        memberCount,
        pantryItemCount,
        marketItemCount,
        activeModuleCount,
      };
    } catch (error) {
      console.error('Get kitchen stats error:', error);
      throw error;
    }
  },

  async getGlobalKitchenStats() {
    try {
      const [
        totalKitchens,
        activeKitchens,
        passiveKitchens,
        totalMembers,
        averageMembersPerKitchen,
      ] = await Promise.all([
        prisma.kitchen.count(),
        prisma.kitchen.count({ where: { status: 'ACTIVE' } }),
        prisma.kitchen.count({ where: { status: 'PASSIVE' } }),
        prisma.kitchenMember.count(),
        prisma.kitchenMember.groupBy({
          by: ['kitchenId'],
          _count: true,
        }),
      ]);

      const avgMembers =
        averageMembersPerKitchen.length > 0
          ? averageMembersPerKitchen.reduce((sum, k) => sum + k._count, 0) /
            averageMembersPerKitchen.length
          : 0;

      return {
        totalKitchens,
        activeKitchens,
        passiveKitchens,
        totalMembers,
        averageMembersPerKitchen: Math.round(avgMembers * 10) / 10,
      };
    } catch (error) {
      console.error('Get global kitchen stats error:', error);
      throw error;
    }
  },

  async searchKitchens(query: string) {
    try {
      const kitchens = await prisma.kitchen.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { owner: { name: { contains: query } } },
          ],
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
        },
        take: 20,
      });

      return kitchens;
    } catch (error) {
      console.error('Search kitchens error:', error);
      throw error;
    }
  },
};

export { kitchenManagementService };
