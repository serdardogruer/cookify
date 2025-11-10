import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PantryItemInput {
  name: string;
  category: string;
  quantity: number;
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
   * Tekli malzeme ekler
   */
  async addPantryItem(kitchenId: number, data: PantryItemInput) {
    return await prisma.pantryItem.create({
      data: {
        kitchenId,
        name: data.name,
        category: data.category,
        quantity: data.quantity,
        initialQuantity: data.quantity, // Başlangıç miktarı = ilk miktar
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
}

export const pantryService = new PantryService();
export default pantryService;
