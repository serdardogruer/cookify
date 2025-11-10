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
    // Türkçe karakterleri normalize et
    const normalizeText = (text: string) => {
      return text
        .toLowerCase()
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c');
    };

    const normalizedQuery = normalizeText(query);

    // Tüm malzemeleri al ve JavaScript'te filtrele
    const allIngredients = await prisma.ingredient.findMany({
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    });

    // Filtreleme: hem normal hem normalize edilmiş metinle ara
    const filtered = allIngredients.filter((ingredient) => {
      const nameLower = ingredient.name.toLowerCase();
      const nameNormalized = normalizeText(ingredient.name);
      const queryLower = query.toLowerCase();

      return (
        nameLower.includes(queryLower) ||
        nameNormalized.includes(normalizedQuery) ||
        nameLower.startsWith(queryLower) ||
        nameNormalized.startsWith(normalizedQuery)
      );
    });

    // Önce başlangıçta eşleşenleri, sonra içinde eşleşenleri göster
    const sorted = filtered.sort((a, b) => {
      const aNameLower = a.name.toLowerCase();
      const bNameLower = b.name.toLowerCase();
      const queryLower = query.toLowerCase();

      const aStarts = aNameLower.startsWith(queryLower);
      const bStarts = bNameLower.startsWith(queryLower);

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      return a.name.localeCompare(b.name, 'tr');
    });

    return sorted.slice(0, limit);
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
