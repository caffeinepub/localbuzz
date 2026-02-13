// Canonical list of shop categories for customer feed filtering
export const SHOP_CATEGORIES = [
  'Grocery',
  'Clothing',
  'Electronics',
  'Medical',
  'Food',
  'Other',
] as const;

export type ShopCategory = typeof SHOP_CATEGORIES[number];
