"use client";

import React, { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  getAllGroceryOrders,
  SEEDED_ORDERS,
  simulateNewOrder,
  updateOrderStatusInStorage,
} from "@/data/groceryAdminStore";
import { CustomerOrder } from "@/types/grocery";
import {
  BoxIcon,
  FlameIcon,
  SearchIcon,
} from "@/icons";
import { useLocale } from "next-intl";
import { formatPrice } from "@/utils/currency";

export default function RecentOrders() {
  const locale = useLocale();
  const [orders, setOrders] = useState<CustomerOrder[]>(SEEDED_ORDERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  const refreshOrders = () => {
    setCurrentTime(Date.now());
    setOrders(getAllGroceryOrders());
  };

  useEffect(() => {
    refreshOrders();

    const handleUpdate = () => {
      refreshOrders();
    };

    window.addEventListener("grocery-orders-updated", handleUpdate);
    return () => {
      window.removeEventListener("grocery-orders-updated", handleUpdate);
    };
  }, []);

  const handleStatusChange = (
    orderId: string,
    newStatus: CustomerOrder["status"],
  ) => {
    updateOrderStatusInStorage(orderId, newStatus);
    refreshOrders();
  };

  const handleSimulate = () => {
    simulateNewOrder();
    refreshOrders();
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      order.orderId.toLowerCase().includes(term) ||
      order.customerName.toLowerCase().includes(term) ||
      order.phone.toLowerCase().includes(term) ||
      order.city.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: CustomerOrder["status"]) => {
    switch (status) {
      case "placed":
        return <Badge color="info">Placed</Badge>;
      case "packing":
        return <Badge color="warning">Packing</Badge>;
      case "on_the_way":
        return <Badge color="primary">On the Way</Badge>;
      case "delivered":
        return <Badge color="success">Delivered</Badge>;
      default:
        return <Badge color="light">{status}</Badge>;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    if (!currentTime) return "Recently";
    const diffMs = currentTime - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(isoString).toLocaleDateString();
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs sm:p-6 dark:border-gray-800 dark:bg-gray-900">
      {/* Header with Title & Action Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Live Grocery Orders Management
            </h3>
            <span
              suppressHydrationWarning
              className="flex h-5 items-center rounded-full bg-emerald-100 px-2 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
            >
              {orders.length} Total
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Real-time customer dispatch from SuperBarrio storefront
          </p>
        </div>

        {/* Simulate Order Button */}
        <button
          type="button"
          onClick={handleSimulate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-bold text-white shadow-theme-xs transition hover:bg-brand-600 active:scale-95"
          title="Simulate a new incoming customer order"
        >
          <FlameIcon className="h-4 w-4" />
          <span>+ Simulate Customer Order</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            { id: "all", label: "All" },
            { id: "placed", label: "Placed" },
            { id: "packing", label: "Packing" },
            { id: "on_the_way", label: "On the Way" },
            { id: "delivered", label: "Delivered" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === tab.id
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400">
            <SearchIcon className="h-3.5 w-3.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order, customer, phone..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-1.5 pe-3 ps-9 text-xs text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="mt-4 overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="border-b border-gray-100 dark:border-gray-800">
              <TableCell isHeader className="py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400">
                Order ID & Time
              </TableCell>
              <TableCell isHeader className="py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400">
                Customer & Address
              </TableCell>
              <TableCell isHeader className="py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400">
                Items
              </TableCell>
              <TableCell isHeader className="py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400">
                Slot & Payment
              </TableCell>
              <TableCell isHeader className="py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400">
                Total
              </TableCell>
              <TableCell isHeader className="py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400">
                Status Action
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell className="py-8 text-center text-sm text-gray-500 dark:text-gray-400" colSpan={6}>
                  No grocery orders found matching this filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow
                  key={order.orderId}
                  className="border-b border-gray-50 transition hover:bg-gray-50/60 dark:border-gray-800/60 dark:hover:bg-gray-850/50"
                >
                  {/* Order ID & Time */}
                  <TableCell className="py-3.5">
                    <div>
                      <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                        {order.orderId}
                      </span>
                      <span
                        suppressHydrationWarning
                        className="block text-[11px] text-gray-400"
                      >
                        {formatRelativeTime(order.createdAt)}
                      </span>
                    </div>
                  </TableCell>

                  {/* Customer & Address */}
                  <TableCell className="py-3.5">
                    <div>
                      <span className="block text-xs font-bold text-gray-800 dark:text-white">
                        {order.customerName}
                      </span>
                      <span className="block text-[11px] text-gray-500 dark:text-gray-400">
                        {order.phone} • {order.city}
                      </span>
                      <span className="block text-[10px] text-gray-400 truncate max-w-[180px]">
                        {order.address}
                      </span>
                    </div>
                  </TableCell>

                  {/* Items Summary with View Breakdown button */}
                  <TableCell className="py-3.5">
                    <div>
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                      >
                        <BoxIcon className="h-3.5 w-3.5" />
                        <span>{order.items.length} items</span>
                      </button>
                      <span className="block text-[10px] text-gray-400 truncate max-w-[160px]">
                        {order.items.map((i) => i.name).join(", ")}
                      </span>
                    </div>
                  </TableCell>

                  {/* Slot & Payment */}
                  <TableCell className="py-3.5">
                    <div>
                      <span className="block text-[11px] font-medium text-gray-700 dark:text-gray-300">
                        {order.deliverySlot.split("(")[0]}
                      </span>
                      <span className="inline-block uppercase text-[10px] font-bold text-gray-500 dark:text-gray-400">
                        {order.paymentMethod === "cod"
                          ? "Cash (COD)"
                          : order.paymentMethod === "card"
                          ? "Bank Card"
                          : "Wallet"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Total */}
                  <TableCell className="py-3.5">
                    <span className="text-xs font-black text-gray-900 dark:text-white">
                      {formatPrice(order.total, locale)}
                    </span>
                  </TableCell>

                  {/* Status Action Dropdown */}
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(order.status)}

                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(
                            order.orderId,
                            e.target.value as CustomerOrder["status"],
                          )
                        }
                        className="rounded-lg border border-gray-200 bg-white py-1 ps-2 pe-6 text-[11px] font-medium text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        title="Change order status"
                      >
                        <option value="placed">Placed</option>
                        <option value="packing">Packing</option>
                        <option value="on_the_way">On the Way</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Order Items Modal / Popover */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white">
                  Order Details: {selectedOrder.orderId}
                </h4>
                <p className="text-xs text-gray-500">
                  Customer: {selectedOrder.customerName} ({selectedOrder.phone})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
              {selectedOrder.items.map((it) => (
                <div key={it.id} className="flex items-center justify-between py-2 text-xs">
                  <div className="flex items-center gap-2">
                    {it.imageUrl && (
                      <img
                        src={it.imageUrl}
                        alt={it.name}
                        className="h-8 w-8 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {it.name}
                      </span>
                      <span className="block text-[10px] text-gray-400">
                        {it.unit} • x{it.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatPrice(it.price * it.quantity, locale)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-gray-100 pt-3 text-xs dark:border-gray-800">
              <div className="flex justify-between py-1 text-gray-500">
                <span>Subtotal:</span>
                <span>{formatPrice(selectedOrder.subtotal, locale)}</span>
              </div>
              <div className="flex justify-between py-1 text-gray-500">
                <span>Delivery:</span>
                <span>
                  {selectedOrder.deliveryFee === 0
                    ? "FREE"
                    : formatPrice(selectedOrder.deliveryFee, locale)}
                </span>
              </div>
              <div className="flex justify-between py-1 text-sm font-bold text-gray-900 dark:text-white">
                <span>Total:</span>
                <span className="text-brand-600 dark:text-brand-400">
                  {formatPrice(selectedOrder.total, locale)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="mt-5 w-full rounded-xl bg-gray-900 py-2.5 text-xs font-bold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
