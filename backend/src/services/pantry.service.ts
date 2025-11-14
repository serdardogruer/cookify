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

    // Aynı isim ve kategoride malzeme var mı kontrol et (birim farketmeksizin)
    const existingItem = await prisma.pantryItem.findFirst({
      where: {
        kitchenId,
        name: data.name,
        category: data.category,
      },
    });

    if (existingItem) {
      // Mevcut malzeme varsa, miktarı topla (artık aynı birimde olmalılar)
      return await prisma.pantryItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + finalQuantity,
          unit: finalUnit,
          initialQuantity: existingItem.initialQuantity + finalQuantity,
          // Yeni SKT daha yakınsa güncelle
          expiryDate: data.expiryDate 
            ? (existingItem.expiryDate && new Date(data.expiryDate) > existingItem.expiryDate
                ? existingItem.expiryDate
                : new Date(data.expiryDate))
            : existingItem.expiryDate,
        },
      });
    }

    // Yeni malzeme ekle
    return await prisma.pantryItem.create({
      data: {
        kitchenId,
        name: data.name,
        category: data.category,
        quantity: finalQuantity,
        initialQuantity: finalQuantity,
        minQuantity: data.minQuantity || 0,
        unit: finalUnit,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      },
    });
  }

  /**
   * Toplu malzeme ekler
   */
  async addMultiplePantryItems(kitchenId: number, items: PantryItemInput[]) {
    // Her malzemeyi tek tek ekle (birim dönüşümü için)
    const results = [];
    for (const item of items) {
      const result = await this.addPantryItem(kitchenId, item);
      results.push(result);
    }
    return results;
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
        // Tarif malzemesini dolaptaki birime dönüştür
        let consumeQuantity = ingredient.quantity;
        
        if (ingredient.unit.toLowerCase() !== pantryItem.unit.toLowerCase()) {
          const converted = await unitConversionService.convert(
            ingredient.quantity,
            ingredient.unit,
            pantryItem.unit,
            ingredient.name
          );
          
          if (converted) {
            consumeQuantity = converted.quantity;
          } else {
            // Dönüştürülemezse, birimler uyumsuz - atla
            results.failed.push(`${ingredient.name} (birim uyumsuz: ${ingredient.unit} → ${pantryItem.unit})`);
            continue;
          }
        }

        // Miktarı düş
        const newQuantity = Math.max(0, pantryItem.quantity - consumeQuantity);

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
