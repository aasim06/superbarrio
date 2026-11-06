export interface GroceryProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  unit: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  sku?: string;
  expiryDate?: string;
  badge?: string;
  emoji: string;
  imageUrl?: string;
  description: string;
  origin?: string;
}

export interface CartItem extends GroceryProduct {
  quantity: number;
}

export interface DeliverySlot {
  id: string;
  day: string;
  timeRange: string;
}

export interface CustomerOrder {
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
  deliverySlot: string;
  paymentMethod: "cod" | "card" | "wallet";
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: "placed" | "packing" | "on_the_way" | "delivered";
  createdAt: string;
}
