import { CustomerOrder, CartItem } from "@/types/grocery";
import { GROCERY_PRODUCTS } from "./groceryData";

// Initial realistic seeded orders for SuperBarrio
export const SEEDED_ORDERS: CustomerOrder[] = [
  {
    orderId: "ES-9841",
    customerName: "María García Fernández",
    phone: "+34 612 345 678",
    address: "Calle Gran Vía, 28, 3º B",
    streetAddress: "Calle Gran Vía, 28",
    apartment: "3º B",
    postalCode: "28013",
    city: "Madrid",
    province: "Madrid",
    notes: "Dejar en portería si no estoy",
    deliverySlot: "Hoy - 17:00 - 20:00 (Tarde)",
    paymentMethod: "bizum",
    items: [
      { ...GROCERY_PRODUCTS[0], quantity: 2 }, // Tomatoes
      { ...GROCERY_PRODUCTS[1], quantity: 1 }, // Bananas
      { ...GROCERY_PRODUCTS[4], quantity: 2 }, // Milk
      { ...GROCERY_PRODUCTS[5], quantity: 1 }, // Eggs
    ] as CartItem[],
    subtotal: 13.2,
    deliveryFee: 0,
    total: 13.2,
    status: "delivered",
    createdAt: "2026-11-04T02:25:00.000Z",
  },
  {
    orderId: "ES-9842",
    customerName: "Carlos Rodríguez López",
    phone: "+34 685 412 963",
    address: "Passeig de Gràcia, 45, 2º 1ª",
    streetAddress: "Passeig de Gràcia, 45",
    apartment: "2º 1ª",
    postalCode: "08007",
    city: "Barcelona",
    province: "Barcelona",
    notes: "Llamar al telefonillo 2º 1ª",
    deliverySlot: "Hoy - 20:00 - 22:00 (Noche)",
    paymentMethod: "card",
    items: [
      { ...GROCERY_PRODUCTS[9], quantity: 2 }, // Chicken
      { ...GROCERY_PRODUCTS[10], quantity: 1 }, // Olive Oil
      { ...GROCERY_PRODUCTS[11], quantity: 1 }, // Rice
    ] as CartItem[],
    subtotal: 28.55,
    deliveryFee: 0,
    total: 28.55,
    status: "on_the_way",
    createdAt: "2026-11-04T02:42:00.000Z",
  },
  {
    orderId: "ES-9843",
    customerName: "Sofía Martínez Ruiz",
    phone: "+34 647 852 369",
    address: "Calle Colón, 14, 4º A",
    streetAddress: "Calle Colón, 14",
    apartment: "4º A",
    postalCode: "46004",
    city: "Valencia",
    province: "Valencia",
    deliverySlot: "Mañana - 09:00 - 12:00 (Mañana)",
    paymentMethod: "paypal",
    items: [
      { ...GROCERY_PRODUCTS[8], quantity: 2 }, // Croissants
      { ...GROCERY_PRODUCTS[12], quantity: 2 }, // Orange Juice
      { ...GROCERY_PRODUCTS[7], quantity: 1 }, // Yogurt
      { ...GROCERY_PRODUCTS[2], quantity: 1 }, // Apples
    ] as CartItem[],
    subtotal: 22.0,
    deliveryFee: 2.5,
    total: 24.5,
    status: "packing",
    createdAt: "2026-11-04T02:52:00.000Z",
  },
  {
    orderId: "ES-9844",
    customerName: "Alejandro Hernández Navarro",
    phone: "+34 693 147 258",
    address: "Calle Sierpes, 62, 1º B",
    streetAddress: "Calle Sierpes, 62",
    apartment: "1º B",
    postalCode: "41004",
    city: "Sevilla",
    province: "Sevilla",
    deliverySlot: "Mañana - 12:00 - 15:00 (Mediodía)",
    paymentMethod: "cod",
    items: [
      { ...GROCERY_PRODUCTS[6], quantity: 1 }, // Cheese
      { ...GROCERY_PRODUCTS[15], quantity: 2 }, // Almonds
      { ...GROCERY_PRODUCTS[14], quantity: 3 }, // Chips
      { ...GROCERY_PRODUCTS[13], quantity: 4 }, // Water
    ] as CartItem[],
    subtotal: 25.55,
    deliveryFee: 0,
    total: 25.55,
    status: "placed",
    createdAt: "2026-11-04T02:57:00.000Z",
  },
  {
    orderId: "ES-9845",
    customerName: "Isabella Torres Moreno",
    phone: "+34 621 789 456",
    address: "Calle Larios, 8, 5º D",
    streetAddress: "Calle Larios, 8",
    apartment: "5º D",
    postalCode: "29015",
    city: "Málaga",
    province: "Málaga",
    deliverySlot: "Hoy - 17:00 - 20:00 (Tarde)",
    paymentMethod: "bizum",
    items: [
      { ...GROCERY_PRODUCTS[2], quantity: 2 }, // Apples
      { ...GROCERY_PRODUCTS[4], quantity: 3 }, // Milk
    ] as CartItem[],
    subtotal: 13.75,
    deliveryFee: 2.5,
    total: 16.25,
    status: "delivered",
    createdAt: "2026-11-04T01:25:00.000Z",
  },
  {
    orderId: "ES-9846",
    customerName: "David Morales Gil",
    phone: "+34 674 123 987",
    address: "Paseo de la Independencia, 19, 3º C",
    streetAddress: "Paseo de la Independencia, 19",
    apartment: "3º C",
    postalCode: "50004",
    city: "Zaragoza",
    province: "Zaragoza",
    deliverySlot: "Mañana - 17:00 - 20:00 (Tarde)",
    paymentMethod: "cod",
    items: [
      { ...GROCERY_PRODUCTS[9], quantity: 3 }, // Chicken
      { ...GROCERY_PRODUCTS[10], quantity: 1 }, // Olive Oil
      { ...GROCERY_PRODUCTS[11], quantity: 2 }, // Rice
    ] as CartItem[],
    subtotal: 40.7,
    deliveryFee: 0,
    total: 40.7,
    status: "delivered",
    createdAt: "2026-11-04T00:20:00.000Z",
  },
  {
    orderId: "ES-9847",
    customerName: "Camila Flores Sanz",
    phone: "+34 639 852 147",
    address: "Gran Vía de les Corts Catalanes, 580",
    streetAddress: "Gran Vía de les Corts Catalanes, 580",
    apartment: "Principal 2ª",
    postalCode: "08011",
    city: "Barcelona",
    province: "Barcelona",
    deliverySlot: "Hoy - 20:00 - 22:00 (Noche)",
    paymentMethod: "apple_google",
    items: [
      { ...GROCERY_PRODUCTS[5], quantity: 2 }, // Eggs
      { ...GROCERY_PRODUCTS[8], quantity: 1 }, // Croissants
      { ...GROCERY_PRODUCTS[12], quantity: 1 }, // Juice
    ] as CartItem[],
    subtotal: 14.15,
    deliveryFee: 2.5,
    total: 16.65,
    status: "delivered",
    createdAt: "2026-11-03T23:00:00.000Z",
  },
  {
    orderId: "ES-9848",
    customerName: "Mateo Sánchez Vidal",
    phone: "+34 615 963 852",
    address: "Calle de Alcalá, 112, 1º Izq",
    streetAddress: "Calle de Alcalá, 112",
    apartment: "1º Izq",
    postalCode: "28009",
    city: "Madrid",
    province: "Madrid",
    deliverySlot: "Mañana - 09:00 - 12:00 (Mañana)",
    paymentMethod: "card",
    items: [
      { ...GROCERY_PRODUCTS[3], quantity: 2 }, // Broccoli
      { ...GROCERY_PRODUCTS[0], quantity: 3 }, // Tomatoes
    ] as CartItem[],
    subtotal: 9.75,
    deliveryFee: 2.5,
    total: 12.25,
    status: "delivered",
    createdAt: "2026-11-03T21:00:00.000Z",
  },
];

// Helper to safely get orders from localStorage
export function getLocalStorageOrders(): CustomerOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("tailgrocery_orders");
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Combine localStorage orders with seeded orders
export function getAllGroceryOrders(): CustomerOrder[] {
  const localOrders = getLocalStorageOrders();
  const existingIds = new Set(localOrders.map((o) => o.orderId));
  const combined = [...localOrders];

  SEEDED_ORDERS.forEach((seeded) => {
    if (!existingIds.has(seeded.orderId)) {
      combined.push(seeded);
    }
  });

  return combined;
}

// Update order status in localStorage & trigger update event
export function updateOrderStatusInStorage(
  orderId: string,
  newStatus: CustomerOrder["status"],
): CustomerOrder[] {
  if (typeof window === "undefined") return [];

  const all = getAllGroceryOrders();
  const updated = all.map((o) =>
    o.orderId === orderId ? { ...o, status: newStatus } : o,
  );

  try {
    localStorage.setItem("tailgrocery_orders", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("grocery-orders-updated"));
  } catch {
    // Ignore
  }

  return updated;
}

// Generate a random new customer order for quick testing/demo
export function simulateNewOrder(): CustomerOrder {
  const randomNames = [
    "Lucia Ramirez",
    "Esteban Navarro",
    "Valeria Cruz",
    "Gabriel Mendoza",
    "Elena Ortiz",
    "Ricardo Morales",
  ];
  const randomCities = [
    "Madrid",
    "Barcelona",
    "Valencia",
    "Sevilla",
    "Zaragoza",
    "Málaga",
  ];
  const randomStreets = [
    "Calle Gran Vía",
    "Passeig de Gràcia",
    "Calle de Alcalá",
    "Calle Colón",
    "Calle Sierpes",
    "Calle Larios",
  ];
  const randomPayment: Array<"card" | "bizum" | "paypal" | "apple_google" | "cod"> = [
    "card",
    "bizum",
    "paypal",
    "apple_google",
    "cod",
  ];
  const randomSlots = [
    "Hoy - 17:00 - 20:00 (Tarde)",
    "Hoy - 20:00 - 22:00 (Noche)",
    "Mañana - 09:00 - 12:00 (Mañana)",
    "Mañana - 12:00 - 15:00 (Mediodía)",
  ];

  const randomItemsCount = Math.floor(Math.random() * 3) + 2;
  const pickedItems: CartItem[] = [];
  const shuffled = [...GROCERY_PRODUCTS].sort(() => 0.5 - Math.random());

  for (let i = 0; i < randomItemsCount; i++) {
    const prod = shuffled[i];
    pickedItems.push({
      ...prod,
      quantity: Math.floor(Math.random() * 2) + 1,
    });
  }

  const subtotal = pickedItems.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0,
  );
  const deliveryFee = subtotal >= 25 ? 0 : 2.5;
  const total = Number((subtotal + deliveryFee).toFixed(2));
  const chosenCity = randomCities[Math.floor(Math.random() * randomCities.length)];
  const chosenStreet = randomStreets[Math.floor(Math.random() * randomStreets.length)];
  const streetNum = Math.floor(Math.random() * 120) + 1;
  const aptNum = `${Math.floor(Math.random() * 6) + 1}º ${["A", "B", "C", "D"][Math.floor(Math.random() * 4)]}`;

  const newOrder: CustomerOrder = {
    orderId: `ES-${Math.floor(100000 + Math.random() * 900000)}`,
    customerName: randomNames[Math.floor(Math.random() * randomNames.length)],
    phone: `+34 6${Math.floor(10 + Math.random() * 89)} ${Math.floor(100 + Math.random() * 899)} ${Math.floor(100 + Math.random() * 899)}`,
    address: `${chosenStreet}, ${streetNum}, ${aptNum}, ${chosenCity}`,
    streetAddress: `${chosenStreet}, ${streetNum}`,
    apartment: aptNum,
    postalCode: "28013",
    city: chosenCity,
    province: chosenCity,
    deliverySlot: randomSlots[Math.floor(Math.random() * randomSlots.length)],
    paymentMethod:
      randomPayment[Math.floor(Math.random() * randomPayment.length)],
    items: pickedItems,
    subtotal: Number(subtotal.toFixed(2)),
    deliveryFee,
    total,
    status: "placed",
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const existing = getLocalStorageOrders();
      existing.unshift(newOrder);
      localStorage.setItem("tailgrocery_orders", JSON.stringify(existing));
      window.dispatchEvent(new CustomEvent("grocery-orders-updated"));
    } catch {
      // Ignore
    }
  }

  return newOrder;
}

// Compute dynamic aggregate metrics for SuperBarrio
export function computeGroceryDashboardMetrics(orders: CustomerOrder[]) {
  const baseRevenue = 48290.5;
  const baseOrdersCount = 1842;
  const baseCustomersCount = 1280;

  const ordersRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalRevenue = baseRevenue + ordersRevenue;
  const totalOrders = baseOrdersCount + orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 26.2;

  // Active status counts
  const statusCounts = {
    placed: orders.filter((o) => o.status === "placed").length,
    packing: orders.filter((o) => o.status === "packing").length,
    on_the_way: orders.filter((o) => o.status === "on_the_way").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  // Category revenue breakdown (percentage & estimated amounts)
  const categoryBreakdown = [
    {
      id: "fruits-vegetables",
      name: "Fruits & Vegetables",
      share: 35,
      revenue: totalRevenue * 0.35,
      color: "#10b981", // emerald
      itemsCount: 4,
    },
    {
      id: "dairy-eggs",
      name: "Dairy & Eggs",
      share: 24,
      revenue: totalRevenue * 0.24,
      color: "#f59e0b", // amber
      itemsCount: 4,
    },
    {
      id: "bakery",
      name: "Bakery & Breads",
      share: 16,
      revenue: totalRevenue * 0.16,
      color: "#ea580c", // orange
      itemsCount: 1,
    },
    {
      id: "meat-poultry",
      name: "Meat & Poultry",
      share: 12,
      revenue: totalRevenue * 0.12,
      color: "#ef4444", // red
      itemsCount: 1,
    },
    {
      id: "pantry-cooking",
      name: "Pantry & Spices",
      share: 8,
      revenue: totalRevenue * 0.08,
      color: "#8b5cf6", // purple
      itemsCount: 2,
    },
    {
      id: "beverages",
      name: "Drinks & Juices",
      share: 3,
      revenue: totalRevenue * 0.03,
      color: "#06b6d4", // cyan
      itemsCount: 2,
    },
    {
      id: "snacks",
      name: "Snacks & Munchies",
      share: 2,
      revenue: totalRevenue * 0.02,
      color: "#ec4899", // pink
      itemsCount: 2,
    },
  ];

  // Top selling products with live stock info
  const topProducts = [
    {
      id: "g-01",
      name: "Farm Fresh Red Tomatoes",
      category: "Fruits & Vegetables",
      unit: "1 kg",
      price: 1.85,
      unitsSold: 940,
      revenue: 1739.0,
      stock: 45,
      status: "In Stock",
      imageUrl: GROCERY_PRODUCTS[0]?.imageUrl,
    },
    {
      id: "g-02",
      name: "Organic Cavendish Bananas",
      category: "Fruits & Vegetables",
      unit: "1 Dozen",
      price: 1.5,
      unitsSold: 1220,
      revenue: 1830.0,
      stock: 28,
      status: "In Stock",
      imageUrl: GROCERY_PRODUCTS[1]?.imageUrl,
    },
    {
      id: "g-05",
      name: "Full Cream Pure Farm Milk",
      category: "Dairy & Eggs",
      unit: "1 Liter",
      price: 2.45,
      unitsSold: 880,
      revenue: 2156.0,
      stock: 14,
      status: "Low Stock",
      imageUrl: GROCERY_PRODUCTS[4]?.imageUrl,
    },
    {
      id: "g-06",
      name: "Golden Farm Brown Eggs",
      category: "Dairy & Eggs",
      unit: "Pack of 12",
      price: 3.1,
      unitsSold: 640,
      revenue: 1984.0,
      stock: 36,
      status: "In Stock",
      imageUrl: GROCERY_PRODUCTS[5]?.imageUrl,
    },
    {
      id: "g-09",
      name: "Flaky French Butter Croissants",
      category: "Bakery",
      unit: "Pack of 4",
      price: 4.2,
      unitsSold: 410,
      revenue: 1722.0,
      stock: 18,
      status: "In Stock",
      imageUrl: GROCERY_PRODUCTS[8]?.imageUrl,
    },
    {
      id: "g-10",
      name: "Fresh Boneless Chicken Breast",
      category: "Meat & Poultry",
      unit: "1 kg",
      price: 6.9,
      unitsSold: 320,
      revenue: 2208.0,
      stock: 8,
      status: "Low Stock",
      imageUrl: GROCERY_PRODUCTS[9]?.imageUrl,
    },
  ];

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    activeCustomers: baseCustomersCount + Math.floor(orders.length * 0.8),
    onTimeDeliveryRate: 98.6,
    avgDeliveryMinutes: 24,
    statusCounts,
    categoryBreakdown,
    topProducts,
  };
}

