import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UserFilters {
  isAdmin?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

const userManagementService = {
  async getAllUsers(filters: UserFilters = {}) {
    try {
      const { isAdmin, search, page = 1, limit = 50 } = filters;

      const where: any = {};

      if (isAdmin !== undefined) {
        where.isAdmin = isAdmin;
      }

      if (search) {
        where.OR = [
          { name: { contains: search } },
          { email: { contains: search } },
        ];
      }

      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            isAdmin: true,
            createdAt: true,
            _count: {
              select: {
                recipes: true,
                ownedKitchens: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.user.count({ where }),
      ]);

      return {
        users,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  },

  async getUserById(userId: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          kitchen: true,
          ownedKitchens: {
            include: {
              members: true,
            },
          },
          _count: {
            select: {
              recipes: true,
              customMeals: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  },

  async toggleAdminStatus(userId: number, isAdmin: boolean) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { isAdmin },
        select: {
          id: true,
          name: true,
          email: true,
          isAdmin: true,
        },
      });

      return user;
    } catch (error) {
      console.error('Toggle admin status error:', error);
      throw error;
    }
  },

  async deleteUser(userId: number) {
    try {
      // Kullanıcının sahip olduğu mutfakları kontrol et
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          ownedKitchens: {
            include: {
              members: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Transaction ile tüm ilişkili verileri sil
      await prisma.$transaction(async (tx) => {
        // Kullanıcının tariflerini sil
        await tx.recipe.deleteMany({
          where: { userId },
        });

        // Kullanıcının custom meal'larını sil
        await tx.customMeal.deleteMany({
          where: { userId },
        });

        // Kullanıcının mutfak üyeliklerini sil
        await tx.kitchenMember.deleteMany({
          where: { userId },
        });

        // Kullanıcının katılma isteklerini sil
        await tx.kitchenJoinRequest.deleteMany({
          where: { userId },
        });

        // Kullanıcının sahip olduğu mutfakları sil
        for (const kitchen of user.ownedKitchens) {
          // Mutfağın tüm üyelerini sil
          await tx.kitchenMember.deleteMany({
            where: { kitchenId: kitchen.id },
          });

          // Mutfağın katılma isteklerini sil
          await tx.kitchenJoinRequest.deleteMany({
            where: { kitchenId: kitchen.id },
          });

          // Mutfağın pantry item'larını sil
          await tx.pantryItem.deleteMany({
            where: { kitchenId: kitchen.id },
          });

          // Mutfağın market item'larını sil
          await tx.marketItem.deleteMany({
            where: { kitchenId: kitchen.id },
          });

          // Mutfağın modüllerini sil
          await tx.kitchenModule.deleteMany({
            where: { kitchenId: kitchen.id },
          });

          // Mutfağı sil
          await tx.kitchen.delete({
            where: { id: kitchen.id },
          });
        }

        // Son olarak kullanıcıyı sil
        await tx.user.delete({
          where: { id: userId },
        });
      });

      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  },

  async searchUsers(query: string) {
    try {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { email: { contains: query } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
          isAdmin: true,
        },
        take: 20,
      });

      return users;
    } catch (error) {
      console.error('Search users error:', error);
      throw error;
    }
  },

  async getUserStats() {
    try {
      const [
        totalUsers,
        adminUsers,
        activeUsers,
        usersWithRecipes,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isAdmin: true } }),
        prisma.user.count({
          where: {
            updatedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),
        prisma.user.count({
          where: {
            recipes: {
              some: {},
            },
          },
        }),
      ]);

      return {
        totalUsers,
        adminUsers,
        activeUsers,
        usersWithRecipes,
      };
    } catch (error) {
      console.error('Get user stats error:', error);
      throw error;
    }
  },
};


export { userManagementService };
