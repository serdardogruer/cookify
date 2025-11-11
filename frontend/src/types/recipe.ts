export interface Recipe {
  id: number;
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
  userId: number;
  user: {
    id: number;
    name: string;
    profileImage?: string;
  };
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  tags: RecipeTag[];
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredient {
  id: number;
  recipeId: number;
  name: string;
  quantity: number;
  unit: string;
  order: number;
}

export interface RecipeInstruction {
  id: number;
  recipeId: number;
  stepNumber: number;
  instruction: string;
  image?: string;
}

export interface RecipeTag {
  id: number;
  recipeId: number;
  tag: string;
}

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
