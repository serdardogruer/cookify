import { PrismaClient, Kitchen, KitchenMember } from '@prisma/client';
import { generateUniqueInviteCode } from '../utils/inviteCode';

const prisma = new PrismaClient();

export class KitchenService {
  /**
   * Kullanıcı kaydı sonrası otomatik mutfak oluşturur
   * @param userId - Kullanıcı ID
   * @param userName - Kullanıcı adı
   * @returns Oluşturulan mutfak ve üyelik bilgisi
   */
  async createKitchenForNewUser(
    userId: number,
    userName: string
  ): Promise<{ kitchen: Kitchen; membership: KitchenMember }> {
    // Benzersiz davet kodu üret
    const inviteCode = await generateUniqueInviteCode(async (code) => {
      const existing = await prisma.kitchen.findUnique({
        where: { inviteCode: code },
      });
      return !!existing;
    });

    // Mutfak adını oluştur: "{Kullanıcı Adı} Mutfağı"
    const kitchenName = `${userName} Mutfağı`;

    // Transaction ile mutfak ve üyelik kaydı oluştur
    const result = await prisma.$transaction(async (tx) => {
      // Mutfak oluştur
      const kitchen = await tx.kitchen.create({
        data: {
          name: kitchenName,
          inviteCode,
          ownerId: userId,
          status: 'ACTIVE',
        },
      });

      // Kitchen_members tablosuna owner kaydı ekle
      const membership = await tx.kitchenMember.create({
        data: {
          kitchenId: kitchen.id,
          userId,
          role: 'OWNER',
        },
      });

      // Kullanıcının aktif mutfağını güncelle
      await tx.user.update({
        where: { id: userId },
        data: { kitchenId: kitchen.id },
      });

      return { kitchen, membership };
    });

    return result;
  }

  /**
   * Davet kodunun benzersiz olup olmadığını kontrol eder
   * @param inviteCode - Kontrol edilecek davet kodu
   * @returns Kod varsa true, yoksa false
   */
  async checkInviteCodeExists(inviteCode: string): Promise<boolean> {
    const kitchen = await prisma.kitchen.findUnique({
      where: { inviteCode },
    });
    return !!kitchen;
  }

  /**
   * Mutfak bilgilerini getirir
   * @param kitchenId - Mutfak ID
   * @returns Mutfak bilgisi
   */
  async getKitchenById(kitchenId: number): Promise<Kitchen | null> {
    return await prisma.kitchen.findUnique({
      where: { id: kitchenId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
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
      },
    });
  }
}

export default new KitchenService();
