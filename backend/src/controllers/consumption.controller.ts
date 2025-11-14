import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Kategori bazlı ortalama tüketim (kişi başı)
const consumptionPatterns: { [key: string]: { [key: string]: number } } = {
  soup: {
    'Soğan': 50,      // gram
    'Havuç': 50,
    'Patates': 100,
    'Domates': 50,
  },
  meat: {
    'Soğan': 100,
    'Domates': 150,
    'Biber': 50,
    'Et': 150,
  },
  pasta: {
    'Makarna': 100,
    'Domates': 100,
    'Soğan': 50,
  },
  fried: {
    'Patates': 200,
    'Yağ': 50,
  },
  dessert: {
    'Süt': 100,
    'Şeker': 50,
    'Un': 50,
  },
  salad: {
    'Domates': 100,
    'Salatalık': 100,
    'Soğan': 30,
  },
  other: {
    'Soğan': 50,
    'Domates': 50,
    'Yağ': 20,
  },
};

export const consumptionController = {
  async logConsumption(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { category, servings } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      // Kullanıcının mutfağını bul
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { kitchenId: true },
      });

      if (!user?.kitchenId) {
        return res.status(404).json({
          success: false,
          error: { code: 3002, message: 'Kitchen not found' },
        });
      }

      // Kategori bazlı malzeme tüketimini hesapla
      const pattern = consumptionPatterns[category] || {};
      const updates: any[] = [];

      for (const [ingredientName, amountPerPerson] of Object.entries(pattern)) {
        const totalAmount = amountPerPerson * servings;

        // Dolaptaki malzemeyi bul
        const pantryItem = await prisma.pantryItem.findFirst({
          where: {
            kitchenId: user.kitchenId,
            name: {
              contains: ingredientName,
            },
          },
        });

        if (pantryItem && pantryItem.quantity > 0) {
          // Birimi kontrol et ve dönüştür
          let consumeAmount = totalAmount;
          
          if (pantryItem.unit.toLowerCase().includes('kg')) {
            consumeAmount = totalAmount / 1000; // gram'dan kg'a
          }

          const newQuantity = Math.max(0, pantryItem.quantity - consumeAmount);

          await prisma.pantryItem.update({
            where: { id: pantryItem.id },
            data: { quantity: newQuantity },
          });

          updates.push({
            name: pantryItem.name,
            consumed: consumeAmount,
            unit: pantryItem.unit,
          });
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          category,
          servings,
          updates,
        },
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to log consumption',
        },
      });
    }
  },
};
