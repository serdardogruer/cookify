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
   * Malzemenin defaultUnit'ini bulur
   * Önce verilen kategoride arar, bulamazsa tüm kategorilerde arar
   */
  private async getDefaultUnit(name: string, categoryName: string): Promise<string | null> {
    try {
      // 1. Önce verilen kategoride ara
      const category = await prisma.category.findFirst({
        where: { name: categoryName },
      });

      if (category) {
        const ingredient = await prisma.ingredient.findFirst({
          where: {
            name: name,
            categoryId: category.id,
          },
        });

        if (ingredient?.defaultUnit) {
          return ingredient.defaultUnit;
        }
      }

      // 2. Kategoride bulunamadı, tüm kategorilerde ara (tam eşleşme)
      const ingredientAnyCategory = await prisma.ingredient.findFirst({
        where: { name: name },
      });

      if (ingredientAnyCategory?.defaultUnit) {
        return ingredientAnyCategory.defaultUnit;
      }

      // 3. Tam eşleşme yok, benzer isim ara (kısmi eşleşme)
      const allIngredients = await prisma.ingredient.findMany();
      const similarIngredient = allIngredients.find(ing => 
        ing.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(ing.name.toLowerCase())
      );

      return similarIngredient?.defaultUnit || null;
    } catch (error) {
      return null;
    }
  }

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
    // Malzemenin defaultUnit'ini bul
    const defaultUnit = await this.getDefaultUnit(data.name, data.category);
    
    // Kullanıcının girdiği birimi defaultUnit'e dönüştür
    let finalQuantity = data.quantity;
    let finalUnit = data.unit;
    
    if (defaultUnit && data.unit.toLowerCase() !== defaultUnit.toLowerCase()) {
      const converted = await unitConversionService.convert(
        data.quantity,
        data.unit,
        defaultUnit,
        data.name
      );
      
      if (converted) {
        finalQuantity = converted.quantity;
        finalUnit = converted.unit;
      } else {
        // Dönüştürülemezse kullanıcının girdiği birimi kullan
        finalUnit = data.unit;
      }
    } else if (defaultUnit) {
      finalUnit = defaultUnit;
    }

    // Akıllı market paketi öner
    const marketPackage = this.suggestMarketPackage(finalQuantity, finalUnit, data.name);

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
      // Mevcut ürün varsa, miktarı topla (artık aynı birimde olmalılar)
      return await prisma.marketItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + finalQuantity,
          unit: finalUnit,
          // @ts-ignore - Prisma type cache issue
          marketQuantity: marketPackage.quantity,
          // @ts-ignore - Prisma type cache issue
          marketUnit: marketPackage.unit,
        },
      });
    }

    // Yeni ürün ekle
    return await prisma.marketItem.create({
      data: {
        kitchenId,
        name: data.name,
        category: data.category,
        quantity: finalQuantity,
        unit: finalUnit,
        // @ts-ignore - Prisma type cache issue
        marketQuantity: marketPackage.quantity,
        // @ts-ignore - Prisma type cache issue
        marketUnit: marketPackage.unit,
        status: 'PENDING',
      },
    });
  }

  /**
   * Akıllı market paketi önerir
   */
  private suggestMarketPackage(quantity: number, unit: string, name: string): { quantity: number; unit: string } {
    const unitLower = unit.toLowerCase();

    // Paket/adet ürünler
    if (unitLower === 'paket' || unitLower === 'adet') {
      return { quantity: Math.ceil(quantity), unit };
    }

    // Kilogram
    if (unitLower === 'kg') {
      if (quantity < 0.25) return { quantity: 0.5, unit: 'kg' }; // 250gr altı → 500gr
      if (quantity < 0.5) return { quantity: 0.5, unit: 'kg' };
      if (quantity < 1) return { quantity: 1, unit: 'kg' };
      return { quantity: Math.ceil(quantity), unit: 'kg' };
    }

    // Gram
    if (unitLower === 'gr') {
      if (quantity < 50) return { quantity: 1, unit: 'paket' }; // Çok az → 1 paket
      if (quantity < 250) return { quantity: 250, unit: 'gr' };
      if (quantity < 500) return { quantity: 500, unit: 'gr' };
      return { quantity: 1, unit: 'kg' }; // 500gr üstü → 1 kg
    }

    // Litre
    if (unitLower === 'litre') {
      if (quantity < 0.5) return { quantity: 0.5, unit: 'litre' };
      if (quantity < 1) return { quantity: 1, unit: 'litre' };
      return { quantity: Math.ceil(quantity), unit: 'litre' };
    }

    // Mililitre
    if (unitLower === 'ml') {
      if (quantity < 250) return { quantity: 250, unit: 'ml' };
      if (quantity < 500) return { quantity: 500, unit: 'ml' };
      return { quantity: 1, unit: 'litre' };
    }

    // Varsayılan: yuvarla
    return { quantity: Math.ceil(quantity), unit };
  }

  /**
   * Market ürünü günceller
   */
  async updateMarketItem(
    itemId: number,
    kitchenId: number,
    data: Partial<MarketItemInput> & { marketQuantity?: number; marketUnit?: string }
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
    if (data.marketQuantity !== undefined) updateData.marketQuantity = data.marketQuantity;
    if (data.marketUnit) updateData.marketUnit = data.marketUnit;

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

    // Malzeme veritabanından SKT ve defaultUnit bilgisini al
    const category = await prisma.category.findFirst({
      where: { name: item.category },
    });

    let expiryDate: Date | null = null;
    let defaultUnit: string | null = null;

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

      // DefaultUnit'i al
      defaultUnit = ingredient?.defaultUnit || null;
    }

    // Market paketini kullan (kullanıcının düzenlediği miktar)
    // @ts-ignore - Prisma type cache issue
    const actualQuantity = item.marketQuantity || item.quantity;
    // @ts-ignore - Prisma type cache issue
    const actualUnit = item.marketUnit || item.unit;

    // Kullanıcının aldığı paketi defaultUnit'e dönüştür
    let finalQuantity = actualQuantity;
    let finalUnit = actualUnit;
    
    if (defaultUnit && actualUnit.toLowerCase() !== defaultUnit.toLowerCase()) {
      const converted = await unitConversionService.convert(
        actualQuantity,
        actualUnit,
        defaultUnit,
        item.name
      );
      
      if (converted) {
        finalQuantity = converted.quantity;
        finalUnit = converted.unit;
      } else {
        // Dönüştürülemezse kullanıcının aldığı birimi kullan
        finalUnit = actualUnit;
      }
    } else if (defaultUnit) {
      finalUnit = defaultUnit;
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
        // Mevcut malzeme varsa, miktarı topla (artık aynı birimde olmalılar)
        pantryItem = await tx.pantryItem.update({
          where: { id: existingPantryItem.id },
          data: {
            quantity: existingPantryItem.quantity + finalQuantity,
            unit: finalUnit,
            initialQuantity: existingPantryItem.initialQuantity + finalQuantity,
            // Yeni SKT daha yakınsa güncelle
            expiryDate: expiryDate
              ? existingPantryItem.expiryDate && expiryDate > existingPantryItem.expiryDate
                ? existingPantryItem.expiryDate
                : expiryDate
              : existingPantryItem.expiryDate,
          },
        });
      } else {
        // Yeni malzeme ekle - SKT ile birlikte
        pantryItem = await tx.pantryItem.create({
          data: {
            kitchenId,
            name: item.name,
            category: item.category,
            quantity: finalQuantity,
            initialQuantity: finalQuantity,
            unit: finalUnit,
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
