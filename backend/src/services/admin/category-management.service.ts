import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateCategoryDto {
  name: string;
  icon?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  icon?: string;
}

const categoryManagementService = {
  async getAllCategories() {
    try {
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: {
              ingredients: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      return categories;
    } catch (error) {
      console.error('Get all categories error:', error);
      throw error;
    }
  },

  async getCategoryById(id: number) {
    try {
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          ingredients: true,
          _count: {
            select: {
              ingredients: true,
            },
          },
        },
      });

      if (!category) {
        throw new Error('Category not found');
      }

      return category;
    } catch (error) {
      console.error('Get category by ID error:', error);
      throw error;
    }
  },

  async createCategory(data: CreateCategoryDto) {
    try {
      const category = await prisma.category.create({
        data: {
          name: data.name,
          icon: data.icon || null,
        },
      });

      return category;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('Category with this name already exists');
      }
      console.error('Create category error:', error);
      throw error;
    }
  },

  async updateCategory(id: number, data: UpdateCategoryDto) {
    try {
      const category = await prisma.category.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.icon !== undefined && { icon: data.icon }),
        },
      });

      return category;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('Category with this name already exists');
      }
      if (error.code === 'P2025') {
        throw new Error('Category not found');
      }
      console.error('Update category error:', error);
      throw error;
    }
  },

  async deleteCategory(id: number) {
    try {
      // Önce kullanım kontrolü yap
      const usage = await this.checkCategoryUsage(id);

      if (!usage.canDelete) {
        throw new Error(
          `Cannot delete category. It has ${usage.usageCount} ingredients.`
        );
      }

      await prisma.category.delete({
        where: { id },
      });

      return { success: true, message: 'Category deleted successfully' };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error('Category not found');
      }
      console.error('Delete category error:', error);
      throw error;
    }
  },

  async checkCategoryUsage(id: number) {
    try {
      const ingredientCount = await prisma.ingredient.count({
        where: { categoryId: id },
      });

      return {
        canDelete: ingredientCount === 0,
        usageCount: ingredientCount,
      };
    } catch (error) {
      console.error('Check category usage error:', error);
      throw error;
    }
  },

  async getCategoryStats() {
    try {
      const [totalCategories, categoriesWithIngredients] = await Promise.all([
        prisma.category.count(),
        prisma.category.count({
          where: {
            ingredients: {
              some: {},
            },
          },
        }),
      ]);

      return {
        totalCategories,
        categoriesWithIngredients,
        emptyCategories: totalCategories - categoriesWithIngredients,
      };
    } catch (error) {
      console.error('Get category stats error:', error);
      throw error;
    }
  },
};

export { categoryManagementService };
