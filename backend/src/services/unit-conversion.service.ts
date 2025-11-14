import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UnitConversionService {
  /**
   * İki birim arasında dönüşüm yapar
   */
  async convert(
    quantity: number,
    fromUnit: string,
    toUnit: string,
    ingredientName?: string
  ): Promise<{ quantity: number; unit: string } | null> {
    // Aynı birim ise dönüşüm yapma
    if (fromUnit.toLowerCase() === toUnit.toLowerCase()) {
      return { quantity, unit: fromUnit };
    }

    // Birim normalizasyonu
    const normalizedFrom = this.normalizeUnit(fromUnit);
    const normalizedTo = this.normalizeUnit(toUnit);

    // Direkt dönüşüm var mı kontrol et
    const directConversion = await prisma.unitConversion.findFirst({
      where: {
        unitFrom: normalizedFrom,
        unitTo: normalizedTo,
      },
    });

    if (directConversion) {
      return {
        quantity: quantity * directConversion.multiplier,
        unit: toUnit,
      };
    }

    // Ters dönüşüm var mı kontrol et
    const reverseConversion = await prisma.unitConversion.findFirst({
      where: {
        unitFrom: normalizedTo,
        unitTo: normalizedFrom,
      },
    });

    if (reverseConversion) {
      return {
        quantity: quantity / reverseConversion.multiplier,
        unit: toUnit,
      };
    }

    // İki aşamalı dönüşüm: yemek kaşığı → gr → kg veya su bardağı → ml → litre
    let intermediateUnit: string | null = null;
    if (normalizedTo === 'kg') intermediateUnit = 'gr';
    if (normalizedTo === 'litre') intermediateUnit = 'ml';

    if (intermediateUnit) {
      // 1. Adım: from → intermediate
      const step1 = await prisma.unitConversion.findFirst({
        where: {
          unitFrom: normalizedFrom,
          unitTo: intermediateUnit,
        },
      });

      if (step1) {
        const intermediateQty = quantity * step1.multiplier;

        // 2. Adım: intermediate → to
        const step2 = await prisma.unitConversion.findFirst({
          where: {
            unitFrom: intermediateUnit,
            unitTo: normalizedTo,
          },
        });

        if (step2) {
          return {
            quantity: intermediateQty * step2.multiplier,
            unit: toUnit,
          };
        }
      }
    }

    // Adet → Gram dönüşümü (malzeme bazlı)
    if (normalizedFrom === 'adet' && (normalizedTo === 'gr' || normalizedTo === 'kg')) {
      if (ingredientName) {
        const ingredient = await prisma.ingredient.findFirst({
          where: { name: ingredientName },
        });

        // @ts-ignore - Prisma type cache issue
        if (ingredient?.averageWeightPerUnit) {
          // @ts-ignore
          const gramsPerUnit = ingredient.averageWeightPerUnit;
          const totalGrams = quantity * gramsPerUnit;

          if (normalizedTo === 'kg') {
            return { quantity: totalGrams / 1000, unit: 'kg' };
          }
          return { quantity: totalGrams, unit: 'gr' };
        }
      }
    }

    // Gram/Kg → Adet dönüşümü (malzeme bazlı)
    if ((normalizedFrom === 'gr' || normalizedFrom === 'kg') && normalizedTo === 'adet') {
      if (ingredientName) {
        const ingredient = await prisma.ingredient.findFirst({
          where: { name: ingredientName },
        });

        // @ts-ignore - Prisma type cache issue
        if (ingredient?.averageWeightPerUnit) {
          // @ts-ignore
          const gramsPerUnit = ingredient.averageWeightPerUnit;
          let totalGrams = quantity;

          if (normalizedFrom === 'kg') {
            totalGrams = quantity * 1000;
          }

          return { quantity: totalGrams / gramsPerUnit, unit: 'adet' };
        }
      }
    }

    // Dönüşüm bulunamadı
    return null;
  }

  /**
   * Birim normalizasyonu (küçük harf, Türkçe karakter düzeltme)
   */
  private normalizeUnit(unit: string): string {
    const normalized = unit.toLowerCase().trim();

    // Yaygın varyasyonları normalize et
    const unitMap: { [key: string]: string } = {
      'gram': 'gr',
      'g': 'gr',
      'kilogram': 'kg',
      'kilo': 'kg',
      'mililitre': 'ml',
      'lt': 'litre',
      'l': 'litre',
      'ad': 'adet',
      'adet': 'adet',
      'çay kaşığı': 'çay kaşığı',
      'tatlı kaşığı': 'tatlı kaşığı',
      'yemek kaşığı': 'yemek kaşığı',
      'su bardağı': 'su bardağı',
      'çay bardağı': 'çay bardağı',
      'kahve fincanı': 'kahve fincanı',
      'kupa': 'kupa',
      'cup': 'kupa',
      'tutam': 'tutam',
      'avuç': 'avuç',
      'dilim': 'dilim',
      'diş': 'diş',
      'yaprak': 'yaprak',
    };

    return unitMap[normalized] || normalized;
  }

  /**
   * İki malzemeyi birleştirmeye çalışır (birim dönüştürme ile)
   */
  async tryMergeItems(
    existingItem: { quantity: number; unit: string },
    newItem: { quantity: number; unit: string; name: string }
  ): Promise<{ quantity: number; unit: string } | null> {
    // Aynı birim ise direkt topla
    if (existingItem.unit.toLowerCase() === newItem.unit.toLowerCase()) {
      return {
        quantity: existingItem.quantity + newItem.quantity,
        unit: existingItem.unit,
      };
    }

    // Yeni malzemeyi mevcut malzemenin birimine dönüştür
    const converted = await this.convert(
      newItem.quantity,
      newItem.unit,
      existingItem.unit,
      newItem.name
    );

    if (converted) {
      return {
        quantity: existingItem.quantity + converted.quantity,
        unit: existingItem.unit,
      };
    }

    // Dönüştürülemedi
    return null;
  }
}

export const unitConversionService = new UnitConversionService();
export default unitConversionService;
