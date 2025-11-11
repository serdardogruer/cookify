export interface PantryItem {
  id: number;
  kitchenId: number;
  name: string;
  category: string;
  quantity: number;
  initialQuantity: number;
  minQuantity?: number;
  unit: string;
  expiryDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PantryItemInput {
  name: string;
  category: string;
  quantity: number;
  minQuantity?: number;
  unit: string;
  expiryDate?: string;
}
