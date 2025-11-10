export interface MarketItem {
  id: number;
  kitchenId: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  status: 'PENDING' | 'DONE';
  createdAt: string;
  updatedAt: string;
}

export interface MarketItemInput {
  name: string;
  category: string;
  quantity: number;
  unit: string;
}
