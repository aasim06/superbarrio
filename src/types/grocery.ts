export interface GroceryCategory {
  id: string;
  name: string;
  nameEn?: string;
  icon: string;
  status?: "active" | "inactive";
}

export interface GroceryProduct {
  id: string;
  name: string;
  nameEn?: string;
  category: string;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  unit: string;
  unitEn?: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  sku?: string;
  expiryDate?: string;
  badge?: string;
  badgeEn?: string;
  emoji: string;
  imageUrl?: string;
  description: string;
  descriptionEn?: string;
  origin?: string;
  originEn?: string;
}

export interface CartItem extends GroceryProduct {
  quantity: number;
}

export interface DeliverySlot {
  id: string;
  day: string;
  timeRange: string;
}

export type PaymentMethod =
  | "card"
  | "bizum"
  | "paypal"
  | "apple_google"
  | "cod"
  | "wallet"
  | "khata";

export interface CustomerOrder {
  orderId: string;
  customerName: string;
  email?: string;
  customerUid?: string;
  phone: string;
  address: string;
  streetAddress?: string;
  apartment?: string;
  postalCode?: string;
  city: string;
  province?: string;
  notes?: string;
  deliverySlot: string;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  subtotal: number;
  discount?: number;
  promoCode?: string;
  deliveryFee: number;
  total: number;
  status: "placed" | "packing" | "on_the_way" | "delivered";
  createdAt: string;
}
