import { GroceryProduct, DeliverySlot } from "@/types/grocery";

export const GROCERY_CATEGORIES = [
  { id: "all", name: "All Items", icon: "all" },
  { id: "fruits-vegetables", name: "Fruits & Vegetables", icon: "fruits-vegetables" },
  { id: "dairy-eggs", name: "Dairy & Eggs", icon: "dairy-eggs" },
  { id: "bakery", name: "Bakery & Breads", icon: "bakery" },
  { id: "meat-poultry", name: "Meat & Poultry", icon: "meat-poultry" },
  { id: "pantry-cooking", name: "Pantry & Spices", icon: "pantry-cooking" },
  { id: "beverages", name: "Drinks & Juices", icon: "beverages" },
  { id: "snacks", name: "Snacks & Munchies", icon: "snacks" },
];

export const GROCERY_PRODUCTS: GroceryProduct[] = [
  {
    id: "g-01",
    name: "Farm Fresh Red Tomatoes",
    category: "fruits-vegetables",
    price: 1.85,
    originalPrice: 2.4,
    unit: "1 kg",
    rating: 4.8,
    reviewsCount: 124,
    inStock: true,
    badge: "23% OFF",
    emoji: "",
    imageUrl:
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80",
    description: "Hand-picked organic farm red tomatoes, rich in flavor and lycopene.",
    origin: "Local Farm",
  },
  {
    id: "g-02",
    name: "Organic Cavendish Bananas",
    category: "fruits-vegetables",
    price: 1.5,
    originalPrice: 1.9,
    unit: "1 Dozen",
    rating: 4.9,
    reviewsCount: 210,
    inStock: true,
    badge: "Bestseller",
    emoji: "",
    imageUrl:
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80",
    description: "Naturally ripened sweet bananas packed with energy and potassium.",
    origin: "Fresh Groves",
  },
  {
    id: "g-03",
    name: "Crisp Royal Gala Apples",
    category: "fruits-vegetables",
    price: 3.2,
    originalPrice: 4.0,
    unit: "1 kg",
    rating: 4.7,
    reviewsCount: 88,
    inStock: true,
    badge: "Fresh Arrival",
    emoji: "",
    imageUrl:
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80",
    description: "Crunchy sweet apples imported directly from premium orchards.",
    origin: "Imported",
  },
  {
    id: "g-04",
    name: "Fresh Green Broccoli Crowns",
    category: "fruits-vegetables",
    price: 2.1,
    unit: "500 g",
    rating: 4.6,
    reviewsCount: 65,
    inStock: true,
    emoji: "",
    imageUrl:
      "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=600&auto=format&fit=crop&q=80",
    description: "Nutritious pesticide-free green broccoli crowns, ideal for healthy salads.",
    origin: "Hydroponic Farm",
  },
  {
    id: "g-05",
    name: "Crunchy Farm Carrots",
    category: "fruits-vegetables",
    price: 1.25,
    originalPrice: 1.6,
    unit: "1 kg",
    rating: 4.8,
    reviewsCount: 142,
    inStock: true,
    badge: "20% OFF",
    emoji: "",
    imageUrl:
      "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80",
    description: "Sweet, vitamin-rich orange carrots freshly washed and graded.",
    origin: "Local Farm",
  },
  {
    id: "g-06",
    name: "Full Cream Pure Farm Milk",
    category: "dairy-eggs",
    price: 2.45,
    unit: "1 Liter",
    rating: 4.9,
    reviewsCount: 340,
    inStock: true,
    badge: "Pure Daily",
    emoji: "",
    imageUrl:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80",
    description: "Homogenized and pasteurized pure cow's milk with 3.5% natural fat.",
    origin: "Valley Dairy",
  },
  {
    id: "g-07",
    name: "Golden Farm Brown Eggs",
    category: "dairy-eggs",
    price: 3.1,
    originalPrice: 3.6,
    unit: "Pack of 12",
    rating: 4.9,
    reviewsCount: 298,
    inStock: true,
    badge: "15% OFF",
    emoji: "",
    imageUrl:
      "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80",
    description: "Free-range pasture-raised brown eggs with rich golden yolks.",
    origin: "Free Range Farms",
  },
  {
    id: "g-08",
    name: "Artisanal Cheddar Cheese Block",
    category: "dairy-eggs",
    price: 4.8,
    unit: "250 g",
    rating: 4.7,
    reviewsCount: 54,
    inStock: true,
    emoji: "",
    imageUrl:
      "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=600&auto=format&fit=crop&q=80",
    description: "Aged sharp white cheddar cheese, smooth texture and rich flavor.",
    origin: "Artisan Creamery",
  },
  {
    id: "g-09",
    name: "Authentic Greek Natural Yogurt",
    category: "dairy-eggs",
    price: 2.9,
    originalPrice: 3.5,
    unit: "450 g",
    rating: 4.8,
    reviewsCount: 110,
    inStock: true,
    emoji: "",
    imageUrl:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80",
    description: "Thick, high-protein traditional strained natural yogurt.",
    origin: "Pure Dairy",
  },
  {
    id: "g-10",
    name: "Artisan Sourdough Loaf",
    category: "bakery",
    price: 3.75,
    unit: "500 g",
    rating: 4.9,
    reviewsCount: 180,
    inStock: true,
    badge: "Baked Today",
    emoji: "",
    imageUrl:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
    description: "Crispy crust and airy crumb slow-fermented artisan sourdough.",
    origin: "Baker's Hearth",
  },
  {
    id: "g-11",
    name: "Flaky French Butter Croissants",
    category: "bakery",
    price: 4.2,
    originalPrice: 5.0,
    unit: "Pack of 4",
    rating: 4.8,
    reviewsCount: 92,
    inStock: true,
    badge: "16% OFF",
    emoji: "",
    imageUrl:
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80",
    description: "Golden flaky layered breakfast croissants made with real butter.",
    origin: "French Bakery",
  },
  {
    id: "g-12",
    name: "Fresh Boneless Chicken Breast",
    category: "meat-poultry",
    price: 6.9,
    originalPrice: 8.0,
    unit: "1 kg",
    rating: 4.9,
    reviewsCount: 260,
    inStock: true,
    badge: "100% Halal",
    emoji: "",
    imageUrl:
      "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&auto=format&fit=crop&q=80",
    description: "Hormone-free, tender and lean trimmed skinless chicken breast.",
    origin: "Certified Halal Farm",
  },
  {
    id: "g-13",
    name: "Premium Extra Virgin Olive Oil",
    category: "pantry-cooking",
    price: 9.5,
    originalPrice: 11.5,
    unit: "500 ml",
    rating: 4.9,
    reviewsCount: 175,
    inStock: true,
    badge: "Cold Pressed",
    emoji: "",
    imageUrl:
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80",
    description: "First cold-pressed unrefined extra virgin olive oil with low acidity.",
    origin: "Mediterranean",
  },
  {
    id: "g-14",
    name: "Royal Long-Grain Basmati Rice",
    category: "pantry-cooking",
    price: 8.2,
    originalPrice: 9.8,
    unit: "5 kg",
    rating: 4.8,
    reviewsCount: 310,
    inStock: true,
    badge: "Aged 2 Years",
    emoji: "",
    imageUrl:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
    description: "Aromatic extra-long grain aged basmati rice for fragrant biryani and pilaf.",
    origin: "Delta del Ebro, España",
  },
  {
    id: "g-15",
    name: "Cold-Pressed Valencia Orange Juice",
    category: "beverages",
    price: 3.4,
    unit: "1 Liter",
    rating: 4.8,
    reviewsCount: 89,
    inStock: true,
    badge: "No Added Sugar",
    emoji: "",
    imageUrl:
      "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80",
    description: "100% pure squeezed citrus juice, pulp-rich with natural Vitamin C.",
    origin: "Fresh Orchards",
  },
  {
    id: "g-16",
    name: "Roasted Lightly Salted Almonds",
    category: "snacks",
    price: 5.6,
    originalPrice: 6.8,
    unit: "300 g",
    rating: 4.9,
    reviewsCount: 145,
    inStock: true,
    badge: "18% OFF",
    emoji: "",
    imageUrl:
      "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&auto=format&fit=crop&q=80",
    description: "Crunchy slow-roasted California almonds with a touch of sea salt.",
    origin: "Premium Dry Fruits",
  },
  {
    id: "g-17",
    name: "CrunchyBites Plantain Chips - Lightly Salted",
    category: "snacks",
    price: 2.8,
    originalPrice: 3.5,
    unit: "100 g",
    rating: 4.9,
    reviewsCount: 168,
    inStock: true,
    badge: "Bestseller",
    emoji: "🍌",
    imageUrl:
      "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=600&auto=format&fit=crop&q=80",
    description:
      "Crispy all-natural golden plantain chips, lightly sea salted. No artificial preservatives.",
    origin: "CrunchyBites Artisanal",
  },
  {
    id: "g-18",
    name: "CrunchyBites Spicy Roasted Peanuts",
    category: "snacks",
    price: 2.2,
    originalPrice: 2.9,
    unit: "100 g",
    rating: 4.8,
    reviewsCount: 194,
    inStock: true,
    badge: "High Protein",
    emoji: "🥜",
    imageUrl:
      "https://images.unsplash.com/photo-1569460275917-763435165c01?w=600&auto=format&fit=crop&q=80",
    description:
      "Slow-roasted golden peanuts dusted in mild red chili spice and Himalayan sea salt. 100% real nuts.",
    origin: "CrunchyBites Artisanal",
  },
  {
    id: "g-19",
    name: "CrunchyBites Deluxe Mixed Nuts",
    category: "snacks",
    price: 4.5,
    originalPrice: 5.5,
    unit: "100 g",
    rating: 5.0,
    reviewsCount: 215,
    inStock: true,
    badge: "Chef's Pick",
    emoji: "🌰",
    imageUrl:
      "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&auto=format&fit=crop&q=80",
    description:
      "Gourmet medley of California whole almonds, crunchy cashews, walnuts and sea-salted roasted peanuts.",
    origin: "CrunchyBites Artisanal",
  },
];

export const DELIVERY_SLOTS: DeliverySlot[] = [
  { id: "slot-1", day: "Today", timeRange: "Express (25 - 35 mins)" },
  { id: "slot-2", day: "Today", timeRange: "Evening (05:00 PM - 07:00 PM)" },
  { id: "slot-3", day: "Today", timeRange: "Night (08:00 PM - 10:00 PM)" },
  { id: "slot-4", day: "Tomorrow", timeRange: "Morning (09:00 AM - 12:00 PM)" },
  { id: "slot-5", day: "Tomorrow", timeRange: "Afternoon (02:00 PM - 05:00 PM)" },
];


// Helper to get custom created products from localStorage
export function getCustomProducts(): GroceryProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("tailgrocery_custom_products");
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Get all products (custom products + default seed catalog)
export function getAllProducts(): GroceryProduct[] {
  const custom = getCustomProducts();
  const customIds = new Set(custom.map((p) => p.id));
  return [...custom, ...GROCERY_PRODUCTS.filter((p) => !customIds.has(p.id))];
}

// Save or update a product
export function saveProduct(product: GroceryProduct): GroceryProduct[] {
  if (typeof window === "undefined") return GROCERY_PRODUCTS;
  const custom = getCustomProducts();
  const existingIdx = custom.findIndex((p) => p.id === product.id);
  let updated: GroceryProduct[];
  if (existingIdx >= 0) {
    updated = [...custom];
    updated[existingIdx] = product;
  } else {
    updated = [product, ...custom];
  }
  try {
    localStorage.setItem("tailgrocery_custom_products", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("grocery-products-updated"));
  } catch (e) {
    console.error("Failed to save product", e);
  }
  return getAllProducts();
}

// Bulk save products (e.g. from CSV import)
export function saveBulkProducts(newProducts: GroceryProduct[]): GroceryProduct[] {
  if (typeof window === "undefined") return GROCERY_PRODUCTS;
  const custom = getCustomProducts();
  const existingIds = new Set(newProducts.map((p) => p.id));
  const remaining = custom.filter((p) => !existingIds.has(p.id));
  const updated = [...newProducts, ...remaining];
  try {
    localStorage.setItem("tailgrocery_custom_products", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("grocery-products-updated"));
  } catch (e) {
    console.error("Failed to save bulk products", e);
  }
  return getAllProducts();
}

// Delete a custom product
export function deleteProduct(productId: string): GroceryProduct[] {
  if (typeof window === "undefined") return GROCERY_PRODUCTS;
  const custom = getCustomProducts().filter((p) => p.id !== productId);
  try {
    localStorage.setItem("tailgrocery_custom_products", JSON.stringify(custom));
    window.dispatchEvent(new CustomEvent("grocery-products-updated"));
  } catch (e) {
    console.error("Failed to delete product", e);
  }
  return getAllProducts();
}
