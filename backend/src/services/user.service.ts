import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export class UserService {
  /**
   * Kullanıcı profil bilgilerini getirir
   */
  async getProfile(userId: number) {
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

    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Kullanıcı profil bilgilerini günceller
   */
  async updateProfile(userId: number, data: { name?: string; phone?: string; bio?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Profil resmini günceller
   */
  async updateProfileImage(userId: number, imagePath: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { profileImage: imagePath },
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Profil resmini siler
   */
  async deleteProfileImage(userId: number) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { profileImage: null },
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const userService = new UserService();
export default userService;
