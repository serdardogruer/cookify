export interface PantryItem {
  id: number;
  kitchenId: number;
  name: string;
  category: string;
  quantity: number;
  initialQuantity: number;
  unit: string;
  expiryDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PantryItemInput {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
}
