import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface RecipeInput {
  title: string;
  description?: string;
  image?: string;
  video?: string;
  prepTime?: number;
  cookTime?: number;
  servings: number;
  difficulty: string;
  category?: string;
  cuisine?: string;
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
    order: number;
  }[];
  instructions: {
    stepNumber: number;
    instruction: string;
    image?: string;
  }[];
  tags?: string[];
}

export class RecipeService {
  /**
   * Tüm tarifleri listeler (son eklenenler önce)
   */
  async getAllRecipes(limit?: number, search?: string) {
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
        { cuisine: { contains: search } },
      ];
    }

    return await prisma.recipe.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        ingredients: {
          orderBy: { order: 'asc' },
        },
        instructions: {
          orderBy: { stepNumber: 'asc' },
        },
        tags: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Tarif detayı
   */
  async getRecipeById(id: number) {
    return await prisma.recipe.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        ingredients: {
          orderBy: { order: 'asc' },
        },
        instructions: {
          orderBy: { stepNumber: 'asc' },
        },
        tags: true,
      },
    });
  }

  /**
   * Kullanıcının tarifleri
   */
  async getUserRecipes(userId: number) {
    return await prisma.recipe.findMany({
      where: { userId },
      include: {
        ingredients: {
          orderBy: { order: 'asc' },
        },
        tags: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Tarif ekle
   */
  async createRecipe(userId: number, data: RecipeInput) {
    return await prisma.recipe.create({
      data: {
        title: data.title,
        description: data.description,
        image: data.image,
        video: data.video,
        prepTime: data.prepTime,
        cookTime: data.cookTime,
        servings: data.servings,
        difficulty: data.difficulty,
        category: data.category,
        cuisine: data.cuisine,
        userId,
        ingredients: {
          create: data.ingredients,
        },
        instructions: {
          create: data.instructions,
        },
        tags: {
          create: data.tags?.map((tag) => ({ tag })) || [],
        },
      },
      include: {
        ingredients: true,
        instructions: true,
        tags: true,
      },
    });
  }

  /**
   * Tarif güncelle
   */
  async updateRecipe(id: number, userId: number, data: Partial<RecipeInput>) {
    // Tarif sahibi kontrolü
    const recipe = await prisma.recipe.findFirst({
      where: { id, userId },
    });

    if (!recipe) {
      throw new Error('Tarif bulunamadı veya yetkiniz yok');
    }

    // Önce ilişkili verileri sil
    await prisma.recipeIngredient.deleteMany({ where: { recipeId: id } });
    await prisma.recipeInstruction.deleteMany({ where: { recipeId: id } });
    await prisma.recipeTag.deleteMany({ where: { recipeId: id } });

    // Sonra güncelle
    return await prisma.recipe.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        image: data.image,
        video: data.video,
        prepTime: data.prepTime,
        cookTime: data.cookTime,
        servings: data.servings,
        difficulty: data.difficulty,
        category: data.category,
        cuisine: data.cuisine,
        ingredients: data.ingredients
          ? {
              create: data.ingredients,
            }
          : undefined,
        instructions: data.instructions
          ? {
              create: data.instructions,
            }
          : undefined,
        tags: data.tags
          ? {
              create: data.tags.map((tag) => ({ tag })),
            }
          : undefined,
      },
      include: {
        ingredients: true,
        instructions: true,
        tags: true,
      },
    });
  }

  /**
   * Tarif sil
   */
  async deleteRecipe(id: number, userId: number) {
    // Tarif sahibi kontrolü
    const recipe = await prisma.recipe.findFirst({
      where: { id, userId },
    });

    if (!recipe) {
      throw new Error('Tarif bulunamadı veya yetkiniz yok');
    }

    return await prisma.recipe.delete({
      where: { id },
    });
  }

  /**
   * Tarif ara
   */
  async searchRecipes(query: string, filters?: {
    difficulty?: string;
    category?: string;
    cuisine?: string;
    maxPrepTime?: number;
  }) {
    const where: any = {
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
        { category: { contains: query } },
        { cuisine: { contains: query } },
      ],
    };

    if (filters?.difficulty) {
      where.difficulty = filters.difficulty;
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.cuisine) {
      where.cuisine = filters.cuisine;
    }

    if (filters?.maxPrepTime) {
      where.prepTime = { lte: filters.maxPrepTime };
    }

    return await prisma.recipe.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        ingredients: {
          orderBy: { order: 'asc' },
        },
        tags: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const recipeService = new RecipeService();
export default recipeService;
