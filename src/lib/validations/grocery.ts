import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Product name must be at least 2 characters"),
  nameEn: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  price: z.number().positive("Price must be greater than 0"),
  originalPrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  unit: z.string().min(1, "Unit is required"),
  unitEn: z.string().optional(),
  rating: z.number().min(0).max(5).default(5),
  reviewsCount: z.number().int().min(0).default(0),
  inStock: z.boolean().default(true),
  stockQuantity: z.number().int().min(0).default(50),
  lowStockThreshold: z.number().int().min(0).default(10),
  sku: z.string().optional(),
  expiryDate: z.string().optional(),
  badge: z.string().optional(),
  badgeEn: z.string().optional(),
  emoji: z.string().optional().default(""),
  imageUrl: z.string().min(1, "Product image is required"),
  description: z.string().optional().default(""),
  descriptionEn: z.string().optional(),
  origin: z.string().optional().default("SuperBarrio Fresh"),
  originEn: z.string().optional(),
});

export type ProductInput = z.infer<typeof ProductSchema>;

export const OrderItemInputSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export const CreateOrderSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email().optional().or(z.literal("")),
  customerUid: z.string().optional(),
  phone: z.string().min(7, "Valid phone number is required"),
  address: z.string().min(5, "Full address is required"),
  streetAddress: z.string().min(3, "Street address is required"),
  apartment: z.string().optional().default(""),
  postalCode: z.string().min(3, "Postal code is required"),
  city: z.string().min(2, "City is required"),
  province: z.string().min(2, "Province is required"),
  notes: z.string().optional().default(""),
  deliverySlot: z.string().min(1, "Delivery slot selection is required"),
  paymentMethod: z.enum(["bizum", "card", "cod", "paypal", "apple_google", "wallet", "khata"]),
  items: z.array(OrderItemInputSchema).min(1, "Cart cannot be empty"),
  couponCode: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export const CouponSchema = z.object({
  code: z.string().min(3, "Coupon code must be at least 3 characters").transform((v) => v.toUpperCase().trim()),
  discountPercent: z.number().min(1).max(100),
  minOrderAmount: z.number().min(0).default(0),
  expiryDate: z.string().optional(),
  active: z.boolean().default(true),
});

export type CouponInput = z.infer<typeof CouponSchema>;

export const CategorySchema = z.object({
  id: z
    .string()
    .min(2, "Code/ID must be at least 2 characters")
    .regex(/^[a-z0-9-_]+$/, "ID can only contain lowercase letters, numbers, hyphens, and underscores"),
  name: z.string().min(2, "Category name in Spanish must be at least 2 characters"),
  nameEn: z.string().optional().default(""),
  icon: z.string().default("all"),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type CategoryInput = z.infer<typeof CategorySchema>;
