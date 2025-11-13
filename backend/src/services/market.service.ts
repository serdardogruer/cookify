import { PrismaClient } from '@prisma/client';
import unitConversionService from './unit-conversion.service';

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
   * Market ürünü ekler - Birim dönüştürme ile birleştirme yapar
   */
  async addMarketItem(kitchenId: number, data: MarketItemInput) {
    // Aynı isim ve kategoride ürün var mı kontrol et
    const existingItem = await prisma.marketItem.findFirst({
      where: {
        kitchenId,
        name: data.name,
        category: data.category,
        status: 'PENDING',
      },
    });

    if (existingItem) {
      // Birim dönüştürme ile birleştirmeyi dene
      const merged = await unitConversionService.tryMergeItems(
        { quantity: existingItem.quantity, unit: existingItem.unit },
        { quantity: data.quantity, unit: data.unit, name: data.name }
      );

      if (merged) {
        // Birleştirme başarılı - mevcut ürünü güncelle
        return await prisma.marketItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: merged.quantity,
            unit: merged.unit,
          },
        });
      }
      // Birleştirme başarısız - farklı birimler, yeni satır olarak ekle
    }

    // Yeni ürün ekle
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
   * Ürünü dolaba taşır (alındı olarak işaretle) - SKT otomatik hesaplanır
   */
  async moveToPantry(itemId: number, kitchenId: number) {
    // Kitchen kontrolü
    const item = await prisma.marketItem.findFirst({
      where: { id: itemId, kitchenId },
    });

    if (!item) {
      throw new Error('Ürün bulunamadı veya erişim yetkiniz yok');
    }

    // Malzeme veritabanından SKT bilgisini al
    const category = await prisma.category.findFirst({
      where: { name: item.category },
    });

    let expiryDate: Date | null = null;

    if (category) {
      const ingredient = await prisma.ingredient.findFirst({
        where: {
          name: item.name,
          categoryId: category.id,
        },
      });

      // SKT hesapla
      if (ingredient?.shelfLifeDays) {
        const today = new Date();
        expiryDate = new Date(
          today.getTime() + ingredient.shelfLifeDays * 24 * 60 * 60 * 1000
        );
      }
    }

    // Transaction ile market'ten sil ve dolaba ekle/güncelle
    return await prisma.$transaction(async (tx) => {
      // Aynı malzeme dolabta var mı kontrol et
      const existingPantryItem = await tx.pantryItem.findFirst({
        where: {
          kitchenId,
          name: item.name,
          category: item.category,
        },
      });

      let pantryItem;

      if (existingPantryItem) {
        // Birim dönüştürme ile birleştirmeyi dene
        const merged = await unitConversionService.tryMergeItems(
          { quantity: existingPantryItem.quantity, unit: existingPantryItem.unit },
          { quantity: item.quantity, unit: item.unit, name: item.name }
        );

        if (merged) {
          // Birleştirme başarılı - mevcut malzemeyi güncelle
          pantryItem = await tx.pantryItem.update({
            where: { id: existingPantryItem.id },
            data: {
              quantity: merged.quantity,
              unit: merged.unit,
              initialQuantity: existingPantryItem.initialQuantity + item.quantity,
              // Yeni SKT daha yakınsa güncelle
              expiryDate: expiryDate
                ? existingPantryItem.expiryDate && expiryDate > existingPantryItem.expiryDate
                  ? existingPantryItem.expiryDate
                  : expiryDate
                : existingPantryItem.expiryDate,
            },
          });
        } else {
          // Birleştirme başarısız - yeni satır olarak ekle
          pantryItem = await tx.pantryItem.create({
            data: {
              kitchenId,
              name: item.name,
              category: item.category,
              quantity: item.quantity,
              initialQuantity: item.quantity,
              unit: item.unit,
              expiryDate,
            },
          });
        }
      } else {
        // Yeni malzeme ekle - SKT ile birlikte
        pantryItem = await tx.pantryItem.create({
          data: {
            kitchenId,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            initialQuantity: item.quantity,
            unit: item.unit,
            expiryDate,
          },
        });
      }

      // Market'ten sil
      await tx.marketItem.delete({
        where: { id: itemId },
      });

      return pantryItem;
    });
  }

  /**
   * Tüm market ürünlerini temizler
   */
  async clearAllItems(kitchenId: number) {
    return await prisma.marketItem.deleteMany({
      where: { kitchenId },
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
