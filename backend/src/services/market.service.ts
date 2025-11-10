import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface MarketItemInput {
  name: string;
  category: string;
  quantity: number;
  unit: string;
}

export class MarketService {
  /**
   * Market ürünlerini listeler
   */
  async getMarketItems(kitchenId: number, category?: string) {
    const where: any = { kitchenId };

    if (category) {
      where.category = category;
    }

    return await prisma.marketItem.findMany({
      where,
      orderBy: [{ status: 'asc' }, { category: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Market ürünü ekler
   */
  async addMarketItem(kitchenId: number, data: MarketItemInput) {
    return await prisma.marketItem.create({
      data: {
        kitchenId,
        name: data.name,
        category: data.category,
        quantity: data.quantity,
        unit: data.unit,
        status: 'PENDING',
      },
    });
  }

  /**
   * Market ürünü günceller
   */
  async updateMarketItem(
    itemId: number,
    kitchenId: number,
    data: Partial<MarketItemInput>
  ) {
    // Kitchen kontrolü
    const item = await prisma.marketItem.findFirst({
      where: { id: itemId, kitchenId },
    });

    if (!item) {
      throw new Error('Ürün bulunamadı veya erişim yetkiniz yok');
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.category) updateData.category = data.category;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.unit) updateData.unit = data.unit;

    return await prisma.marketItem.update({
      where: { id: itemId },
      data: updateData,
    });
  }

  /**
   * Market ürünü siler
   */
  async deleteMarketItem(itemId: number, kitchenId: number) {
    // Kitchen kontrolü
    const item = await prisma.marketItem.findFirst({
      where: { id: itemId, kitchenId },
    });

    if (!item) {
      throw new Error('Ürün bulunamadı veya erişim yetkiniz yok');
    }

    return await prisma.marketItem.delete({
      where: { id: itemId },
    });
  }

  /**
   * Ürünü dolaba taşır (alındı olarak işaretle)
   */
  async moveToPantry(itemId: number, kitchenId: number) {
    // Kitchen kontrolü
    const item = await prisma.marketItem.findFirst({
      where: { id: itemId, kitchenId },
    });

    if (!item) {
      throw new Error('Ürün bulunamadı veya erişim yetkiniz yok');
    }

    // Transaction ile market'ten sil ve dolaba ekle
    return await prisma.$transaction(async (tx) => {
      // Dolaba ekle
      const pantryItem = await tx.pantryItem.create({
        data: {
          kitchenId,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
        },
      });

      // Market'ten sil
      await tx.marketItem.delete({
        where: { id: itemId },
      });

      return pantryItem;
    });
  }

  /**
   * WhatsApp export için liste oluşturur
   */
  async exportToWhatsApp(kitchenId: number) {
    const items = await prisma.marketItem.findMany({
      where: { kitchenId, status: 'PENDING' },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    let message = '🛒 *Market Listesi*\n\n';

    // Kategorilere göre grupla
    const grouped = items.reduce((acc: any, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    // Her kategori için liste oluştur
    Object.keys(grouped).forEach((category) => {
      message += `*${category}*\n`;
      grouped[category].forEach((item: any) => {
        message += `• ${item.name} - ${item.quantity} ${item.unit}\n`;
      });
      message += '\n';
    });

    return message;
  }
}

export const marketService = new MarketService();
export default marketService;
