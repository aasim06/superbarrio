"use client";

import React, { useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useGroceryCart } from "@/context/GroceryCartContext";
import { CustomerOrder, CartItem } from "@/types/grocery";
import { formatPrice } from "@/utils/currency";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  CreditCard,
  LogIn,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { OrdersSkeleton } from "@/components/grocery/GrocerySkeleton";

export default function CustomerOrdersPage() {
  const { user, setIsAuthModalOpen } = useCustomerAuth();
  const { addToCart, setIsCartOpen } = useGroceryCart();
  const locale = useLocale();
  const router = useRouter();

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load customer orders from localStorage and API
  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        let allOrders: CustomerOrder[] = [];

        // 1. LocalStorage orders
        const local = localStorage.getItem("tailgrocery_orders");
        if (local) {
          try {
            allOrders = JSON.parse(local);
          } catch {
            allOrders = [];
          }
        }

        // 2. Fetch server orders from API
        try {
          const res = await fetch("/api/orders");
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            // Merge with local orders, avoiding duplicates by orderId
            const ids = new Set(allOrders.map((o) => o.orderId));
            json.data.forEach((serverOrder: CustomerOrder) => {
              if (!ids.has(serverOrder.orderId)) {
                allOrders.push(serverOrder);
              }
            });
          }
        } catch {
          // ignore network issue, use local
        }

        // 3. Filter orders belonging to this user (by email or customerName, or all if guest created them in this browser)
        if (user && user.email) {
          const userOrders = allOrders.filter(
            (o) =>
              (o.email && o.email.toLowerCase() === user.email.toLowerCase()) ||
              (o.customerName && user.displayName && o.customerName.toLowerCase() === user.displayName.toLowerCase())
          );

          // If no email-specific orders found yet, display all local session orders so they see what they just ordered!
          setOrders(userOrders.length > 0 ? userOrders : allOrders);
        } else {
          setOrders(allOrders);
        }

        if (allOrders.length > 0) {
          setSelectedOrder(allOrders[0]);
        }
      } catch (err) {
        console.error("Error loading customer orders:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  const handleReorder = (items: CartItem[]) => {
    items.forEach((item) => {
      addToCart(item, item.quantity);
    });
    toast.success("Items added back to your cart!");
    setIsCartOpen(true);
  };

  const getStatusBadge = (status?: string) => {
    const st = (status || "placed").toLowerCase();
    if (st === "delivered") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Delivered
        </span>
      );
    }
    if (st === "dispatching" || st === "out_for_delivery" || st === "en_camino") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
          <Truck className="h-3.5 w-3.5 animate-pulse" />
          Out for Delivery
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
        <Clock className="h-3.5 w-3.5" />
        Preparing Order
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-[#04130b] text-gray-900 dark:text-white pb-20 pt-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Navigation Breadcrumb / Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/60 pb-4 dark:border-emerald-950/60">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 dark:border-emerald-950 dark:bg-[#071910] dark:text-gray-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                My Orders & Deliveries
              </h1>
              <p className="text-xs text-gray-500 dark:text-emerald-300/70">
                {user ? `Tracking account: ${user.email}` : "Order history in this browser"}
              </p>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-2 rounded-2xl bg-white p-2 px-3 shadow-xs border border-gray-200 dark:border-emerald-950 dark:bg-[#071910]">
              <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-emerald-500 shrink-0">
                <img
                  src={user.photoURL || "/images/user/user-01.jpg"}
                  alt={user.displayName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold leading-tight">{user.displayName}</p>
                <p className="text-[10px] text-emerald-600 font-semibold dark:text-emerald-400">
                  {user.points || 250} Reward Points
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Not logged in prompt banner */}
        {!user && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 p-4 text-white shadow-md">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-amber-300 shrink-0" />
              <div>
                <h4 className="text-sm font-bold">Sign in with your Google Account</h4>
                <p className="text-xs text-emerald-100">
                  Save all past grocery invoices, sync repeat orders, and earn VIP cashback points.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-emerald-800 shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In Now</span>
            </button>
          </div>
        )}

        {/* Main Content */}
        {isLoading ? (
          <OrdersSkeleton />
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="rounded-3xl border border-gray-200/80 bg-white p-12 text-center shadow-xs dark:border-emerald-950/60 dark:bg-[#071910]">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-bold">No orders found yet</h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-gray-500 dark:text-emerald-300/70">
              You haven't placed any grocery orders yet. Choose from our fresh farm produce and get delivery in 20 minutes!
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-3 text-xs font-bold text-white shadow-md transition-all hover:from-emerald-700 hover:to-green-700 hover:shadow-lg"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Start Shopping Now</span>
            </Link>
          </div>
        ) : (
          /* Orders Grid */
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Orders List (Left Column) */}
            <div className="space-y-4 lg:col-span-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-emerald-400">
                Order History ({orders.length})
              </h3>
              <div className="space-y-3">
                {orders.map((item) => {
                  const isSelected = selectedOrder?.orderId === item.orderId;
                  const dateStr = item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString(locale, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Recent Order";

                  return (
                    <motion.div
                      key={item.orderId}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setSelectedOrder(item)}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? "border-emerald-500 bg-white shadow-md dark:border-emerald-500 dark:bg-[#071910]"
                          : "border-gray-200/70 bg-white/70 hover:border-gray-300 dark:border-emerald-950/60 dark:bg-[#071910]/70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                          #{item.orderId}
                        </span>
                        {getStatusBadge(item.status)}
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">{dateStr}</span>
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          {formatPrice(item.total, locale)}
                        </span>
                      </div>

                      <div className="mt-2 text-[11px] text-gray-500 dark:text-emerald-300/60 flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" />
                        <span>{item.items?.length || 0} items ordered</span>
                        <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Selected Order Details (Right Column) */}
            <div className="lg:col-span-7">
              {selectedOrder ? (
                <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-emerald-950/60 dark:bg-[#071910]">
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 dark:border-emerald-950/60">
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase">
                        Order Details
                      </span>
                      <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                        Order #{selectedOrder.orderId}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReorder(selectedOrder.items || [])}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors dark:bg-emerald-950/40 dark:text-emerald-300 cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Re-order Items</span>
                      </button>
                    </div>
                  </div>

                  {/* Delivery Status Timeline */}
                  <div className="my-5 rounded-2xl bg-emerald-50/50 p-4 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                    <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-3 flex items-center gap-1.5">
                      <Truck className="h-4 w-4 text-emerald-600" />
                      Live Order Tracker:
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="flex flex-col items-center">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <span className="mt-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                          Placed
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                          <Package className="h-4 w-4" />
                        </div>
                        <span className="mt-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                          Packing
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs animate-pulse">
                          <Truck className="h-4 w-4" />
                        </div>
                        <span className="mt-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                          On Route
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-gray-500 dark:bg-gray-800">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <span className="mt-1 text-[10px] font-medium text-gray-400">
                          Delivered
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items Ordered List */}
                  <div className="space-y-3 border-b border-gray-100 pb-4 dark:border-emerald-950/60">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Items in this delivery
                    </h4>
                    <div className="divide-y divide-gray-100 dark:divide-emerald-950/40">
                      {(selectedOrder.items || []).map((prod) => (
                        <div key={prod.id} className="flex items-center justify-between py-2.5">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 overflow-hidden rounded-xl bg-gray-100 dark:bg-emerald-950 shrink-0">
                              <img
                                src={prod.imageUrl || "/images/user/owner.png"}
                                alt={prod.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900 dark:text-white">
                                {prod.nameEn || prod.name}
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-emerald-300/60">
                                {prod.quantity} × {formatPrice(prod.price, locale)} / {prod.unit}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-extrabold text-gray-900 dark:text-white">
                            {formatPrice(prod.price * prod.quantity, locale)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery & Customer Info */}
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 border-b border-gray-100 pb-4 dark:border-emerald-950/60 text-xs">
                    <div>
                      <p className="font-bold text-gray-500 dark:text-gray-400 uppercase text-[10px]">
                        Delivery Address
                      </p>
                      <p className="mt-1 font-semibold text-gray-800 dark:text-white flex items-start gap-1">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{selectedOrder.address || "Spain Delivery Address"}</span>
                      </p>
                      {selectedOrder.deliverySlot && (
                        <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                          Slot: {selectedOrder.deliverySlot}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-500 dark:text-gray-400 uppercase text-[10px]">
                        Payment & Customer
                      </p>
                      <p className="mt-1 font-semibold text-gray-800 dark:text-white">
                        {selectedOrder.customerName}
                      </p>
                      <p className="text-[11px] text-gray-500">{selectedOrder.phone}</p>
                      <p className="mt-1 font-medium capitalize text-emerald-700 dark:text-emerald-400">
                        Method: {selectedOrder.paymentMethod || "Card"}
                      </p>
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="mt-4 space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span>
                      <span>{formatPrice(selectedOrder.subtotal, locale)}</span>
                    </div>
                    {selectedOrder.discount ? (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span>Discount {selectedOrder.promoCode ? `(${selectedOrder.promoCode})` : ""}</span>
                        <span>-{formatPrice(selectedOrder.discount, locale)}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between text-gray-500">
                      <span>Delivery Fee</span>
                      <span>{selectedOrder.deliveryFee ? formatPrice(selectedOrder.deliveryFee, locale) : "Free"}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-100 pt-2 text-sm font-extrabold text-gray-900 dark:text-white dark:border-emerald-950/60">
                      <span>Total Paid</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {formatPrice(selectedOrder.total, locale)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
