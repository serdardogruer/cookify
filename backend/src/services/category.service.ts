import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CategoryService {
  /**
   * Tüm kategorileri listeler
   */
  async getAllCategories() {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Malzeme arama (autocomplete)
   */
  async searchIngredients(query: string, limit: number = 10) {
    return await prisma.ingredient.findMany({
      where: {
        name: {
          contains: query,
        },
      },
      include: {
        category: true,
      },
      take: limit,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Kategoriye göre malzeme önerileri
   */
  async getIngredientsByCategory(categoryId: number) {
    return await prisma.ingredient.findMany({
      where: { categoryId },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Popüler malzemeler (tüm malzemeler)
   */
  async getPopularIngredients(limit: number = 20) {
    return await prisma.ingredient.findMany({
      include: {
        category: true,
      },
      take: limit,
      orderBy: { name: 'asc' },
    });
  }
}

export const categoryService = new CategoryService();
export default categoryService;
