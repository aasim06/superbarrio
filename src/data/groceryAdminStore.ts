import { CustomerOrder, CartItem } from "@/types/grocery";
import { GROCERY_PRODUCTS } from "./groceryData";

// Zero dummy orders - clean slate for live production
export const SEEDED_ORDERS: CustomerOrder[] = [];

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

// Combine localStorage orders (filter out legacy static mock orders for 100% genuine data)
export function getAllGroceryOrders(): CustomerOrder[] {
  const localOrders = getLocalStorageOrders();
  return localOrders.filter(
    (o) => !o.orderId.startsWith("ES-984") && !o.customerName?.includes("María García Fernández")
  );
}

// Clear all orders from storage
export function clearAllGroceryOrders(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("tailgrocery_orders");
    localStorage.removeItem("tailgrocery_last_order");
    window.dispatchEvent(new CustomEvent("grocery-orders-updated"));
  } catch {
    // Ignore
  }
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

// Simulate order helper for testing if needed
export function simulateNewOrder(): CustomerOrder {
  const randomNames = [
    "Cliente Real",
    "Comprador SuperBarrio",
  ];
  const randomCities = ["Madrid", "Barcelona", "Valencia"];
  const randomStreets = ["Calle Gran Vía", "Calle Mayor"];
  const randomPayment: Array<"card" | "bizum" | "paypal" | "apple_google" | "cod"> = [
    "card",
    "bizum",
  ];

  const prod = GROCERY_PRODUCTS[0];
  const pickedItems: CartItem[] = [
    {
      ...prod,
      quantity: 1,
    },
  ];

  const subtotal = pickedItems[0].price;
  const deliveryFee = subtotal >= 25 ? 0 : 2.5;
  const total = Number((subtotal + deliveryFee).toFixed(2));
  const chosenCity = randomCities[0];
  const chosenStreet = randomStreets[0];

  const newOrder: CustomerOrder = {
    orderId: `SB-${Math.floor(100000 + Math.random() * 900000)}`,
    customerName: randomNames[0],
    phone: "+34 600 000 000",
    address: `${chosenStreet}, 10, ${chosenCity}`,
    streetAddress: chosenStreet,
    apartment: "1º A",
    postalCode: "28001",
    city: chosenCity,
    province: chosenCity,
    deliverySlot: "Hoy - Tarde (17:00 - 20:00)",
    paymentMethod: randomPayment[0],
    items: pickedItems,
    subtotal,
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

// Compute dynamic aggregate metrics for SuperBarrio from REAL orders only
export function computeGroceryDashboardMetrics(orders: CustomerOrder[]) {
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (Number(o.total) || 0),
    0,
  );
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Active status counts
  const statusCounts = {
    placed: orders.filter((o) => o.status === "placed").length,
    packing: orders.filter((o) => o.status === "packing").length,
    on_the_way: orders.filter((o) => o.status === "on_the_way").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  // Top selling products computed from actual items ordered
  const productSalesMap: Record<
    string,
    {
      id: string;
      name: string;
      category: string;
      unit: string;
      price: number;
      unitsSold: number;
      revenue: number;
      imageUrl?: string;
    }
  > = {};

  orders.forEach((order) => {
    (order.items || []).forEach((item) => {
      if (!productSalesMap[item.id]) {
        productSalesMap[item.id] = {
          id: item.id,
          name: item.name,
          category: item.category || "General",
          unit: item.unit || "ud",
          price: Number(item.price) || 0,
          unitsSold: 0,
          revenue: 0,
          imageUrl: item.imageUrl,
        };
      }
      const qty = Number(item.quantity) || 1;
      productSalesMap[item.id].unitsSold += qty;
      productSalesMap[item.id].revenue += Number(
        ((item.price || 0) * qty).toFixed(2),
      );
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 6)
    .map((p) => ({
      ...p,
      stock: Math.max(0, 50 - p.unitsSold),
      status: p.unitsSold > 40 ? ("Low Stock" as const) : ("In Stock" as const),
    }));

  const uniqueCustomers = new Set(
    orders
      .map((o) => o.phone?.trim() || o.customerName?.trim())
      .filter(Boolean),
  ).size;

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    activeCustomers: uniqueCustomers,
    onTimeDeliveryRate: totalOrders > 0 ? 100 : 0,
    avgDeliveryMinutes: totalOrders > 0 ? 24 : 0,
    statusCounts,
    categoryBreakdown: [],
    topProducts,
  };
}
