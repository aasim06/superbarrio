import { NextResponse } from "next/server";
import { getOrders, getProducts } from "@/lib/firebase/db";

export interface StoreNotification {
  id: string;
  type: "order" | "low_stock" | "out_of_stock" | "delivery" | "customer";
  title: string;
  description: string;
  timeAgo: string;
  timestamp: number;
  link: string;
  unread: boolean;
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return "Just now";
  const now = Date.now();
  const past = new Date(dateStr).getTime();
  if (isNaN(past)) return "Recently";

  const diffMinutes = Math.floor((now - past) / (1000 * 60));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export async function GET() {
  try {
    const [orders, products] = await Promise.all([getOrders(), getProducts()]);

    const notifications: StoreNotification[] = [];

    // 1. Order Notifications (Latest 3 orders)
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);

    for (const order of recentOrders) {
      notifications.push({
        id: `notif-order-${order.orderId}`,
        type: "order",
        title: `New Order #${order.orderId}`,
        description: `${order.customerName} placed an order for €${order.total.toFixed(2)} via ${order.paymentMethod.toUpperCase()}`,
        timeAgo: formatRelativeTime(order.createdAt),
        timestamp: new Date(order.createdAt).getTime() || Date.now(),
        link: "/orders",
        unread: order.status === "placed",
      });
    }

    // 2. Out of Stock / Low Stock Notifications
    for (const prod of products) {
      const stock = prod.stockQuantity ?? 50;
      const isOut = !prod.inStock || stock === 0;
      const isLow = stock > 0 && stock <= (prod.lowStockThreshold ?? 10);

      if (isOut) {
        notifications.push({
          id: `notif-stock-out-${prod.id}`,
          type: "out_of_stock",
          title: "Out of Stock Alert",
          description: `"${prod.name}" is completely sold out in warehouse.`,
          timeAgo: "Stock Alert",
          timestamp: Date.now() - 1000 * 60 * 45,
          link: "/inventory",
          unread: true,
        });
      } else if (isLow) {
        notifications.push({
          id: `notif-stock-low-${prod.id}`,
          type: "low_stock",
          title: "Low Inventory Warning",
          description: `"${prod.name}" has only ${stock} units remaining.`,
          timeAgo: "Attention",
          timestamp: Date.now() - 1000 * 60 * 90,
          link: "/inventory",
          unread: true,
        });
      }
    }

    // 3. Delivery dispatch notification
    notifications.push({
      id: "notif-delivery-dispatch",
      type: "delivery",
      title: "Delivery Slots Active",
      description: "Express fulfillment windows ready for Zona Centro & Salamanca.",
      timeAgo: "Today",
      timestamp: Date.now() - 1000 * 60 * 120,
      link: "/delivery",
      unread: false,
    });

    // Sort by timestamp desc
    notifications.sort((a, b) => b.timestamp - a.timestamp);

    // Limit to top 6 notifications
    const limited = notifications.slice(0, 6);
    const unreadCount = limited.filter((n) => n.unread).length;

    return NextResponse.json({
      success: true,
      unreadCount,
      data: limited,
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate notifications" },
      { status: 500 }
    );
  }
}
