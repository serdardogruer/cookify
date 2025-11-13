import { PrismaClient } from '@prisma/client';
import unitConversionService from './unit-conversion.service';

const prisma = new PrismaClient();

export interface PantryItemInput {
  name: string;
  category: string;
  quantity: number;
  minQuantity?: number;
  unit: string;
  expiryDate?: string;
}

export class PantryService {
  /**
   * Dolap malzemelerini listeler
   */
  async getPantryItems(kitchenId: number, category?: string) {
    const where: any = { kitchenId };

    if (category) {
      where.category = category;
    }

    return await prisma.pantryItem.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Tekli malzeme ekler - Birim dönüştürme ile birleştirme yapar
   */
  async addPantryItem(kitchenId: number, data: PantryItemInput) {
    // Aynı isim ve kategoride malzeme var mı kontrol et (birim farketmeksizin)
    const existingItem = await prisma.pantryItem.findFirst({
      where: {
        kitchenId,
        name: data.name,
        category: data.category,
      },
    });

    if (existingItem) {
      // Birim dönüştürme ile birleştirmeyi dene
      const merged = await unitConversionService.tryMergeItems(
        { quantity: existingItem.quantity, unit: existingItem.unit },
        { quantity: data.quantity, unit: data.unit, name: data.name }
      );

      if (merged) {
        // Birleştirme başarılı - mevcut malzemeyi güncelle
        return await prisma.pantryItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: merged.quantity,
            unit: merged.unit,
            initialQuantity: existingItem.initialQuantity + data.quantity,
            // Yeni SKT daha yakınsa güncelle
            expiryDate: data.expiryDate 
              ? (existingItem.expiryDate && new Date(data.expiryDate) > existingItem.expiryDate
                  ? existingItem.expiryDate
                  : new Date(data.expiryDate))
              : existingItem.expiryDate,
          },
        });
      }
      // Birleştirme başarısız - farklı birimler, yeni satır olarak ekle
    }

    // Yeni malzeme ekle
    return await prisma.pantryItem.create({
      data: {
        kitchenId,
        name: data.name,
        category: data.category,
        quantity: data.quantity,
        initialQuantity: data.quantity,
        minQuantity: data.minQuantity || 0,
        unit: data.unit,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      },
    });
  }

  /**
   * Toplu malzeme ekler
   */
  async addMultiplePantryItems(kitchenId: number, items: PantryItemInput[]) {
    const data = items.map((item) => ({
      kitchenId,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      initialQuantity: item.quantity, // Başlangıç miktarı = ilk miktar
      minQuantity: item.minQuantity || 0,
      unit: item.unit,
      expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
    }));

    return await prisma.pantryItem.createMany({
      data,
    });
  }

  /**
   * Malzeme günceller
   */
  async updatePantryItem(
    itemId: number,
    kitchenId: number,
    data: Partial<PantryItemInput>
  ) {
    // Kitchen kontrolü
    const item = await prisma.pantryItem.findFirst({
      where: { id: itemId, kitchenId },
    });

    if (!item) {
      throw new Error('Malzeme bulunamadı veya erişim yetkiniz yok');
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.category) updateData.category = data.category;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.unit) updateData.unit = data.unit;
    if (data.expiryDate !== undefined) {
      updateData.expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;
    }

    // Miktar sıfır veya negatifse sil
    if (data.quantity !== undefined && data.quantity <= 0) {
      await prisma.pantryItem.delete({
        where: { id: itemId },
      });
      return null;
    }

    return await prisma.pantryItem.update({
      where: { id: itemId },
      data: updateData,
    });
  }

  /**
   * Malzeme siler
   */
  async deletePantryItem(itemId: number, kitchenId: number) {
    // Kitchen kontrolü
    const item = await prisma.pantryItem.findFirst({
      where: { id: itemId, kitchenId },
    });

    if (!item) {
      throw new Error('Malzeme bulunamadı veya erişim yetkiniz yok');
    }

    return await prisma.pantryItem.delete({
      where: { id: itemId },
    });
  }

  /**
   * Malzemeyi market'e ekler (dolabdan silmez)
   */
  async addToMarket(itemId: number, kitchenId: number) {
    // Kitchen kontrolü
    const item = await prisma.pantryItem.findFirst({
      where: { id: itemId, kitchenId },
    });

    if (!item) {
      throw new Error('Malzeme bulunamadı veya erişim yetkiniz yok');
    }

    // Market'e ekle (dolabdan silme)
    const marketItem = await prisma.marketItem.create({
      data: {
        kitchenId,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        status: 'PENDING',
      },
    });

    return marketItem;
  }

  /**
   * Tarif malzemelerini dolabtan düşer
   */
  async consumeRecipeIngredients(
    kitchenId: number,
    ingredients: Array<{ name: string; quantity: number; unit: string }>
  ) {
    const results = {
      success: [] as string[],
      failed: [] as string[],
      notFound: [] as string[],
    };

    for (const ingredient of ingredients) {
      // Malzemeyi dolabta bul
      const allPantryItems = await prisma.pantryItem.findMany({
        where: { kitchenId },
      });

      // Büyük/küçük harf duyarsız arama
      const normalizedIngredientName = ingredient.name.toLowerCase().trim();
      const pantryItem = allPantryItems.find((item) => {
        const itemName = item.name.toLowerCase().trim();
        return itemName === normalizedIngredientName || 
               itemName.includes(normalizedIngredientName) ||
               normalizedIngredientName.includes(itemName);
      });

      if (!pantryItem) {
        results.notFound.push(ingredient.name);
        continue;
      }

      try {
        // Miktarı düş
        const newQuantity = Math.max(0, pantryItem.quantity - ingredient.quantity);

        if (newQuantity === 0) {
          // Miktar sıfır olduysa sil
          await prisma.pantryItem.delete({
            where: { id: pantryItem.id },
          });
        } else {
          // Miktarı güncelle
          await prisma.pantryItem.update({
            where: { id: pantryItem.id },
            data: { quantity: newQuantity },
          });
        }

        results.success.push(ingredient.name);
      } catch (error) {
        results.failed.push(ingredient.name);
      }
    }

    return results;
  }
}

export const pantryService = new PantryService();
export default pantryService;
