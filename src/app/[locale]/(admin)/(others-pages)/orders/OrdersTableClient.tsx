"use client";

import React, { useState, useMemo, useEffect } from "react";
import { CustomerOrder, CartItem } from "@/types/grocery";
import Badge from "@/components/ui/badge/Badge";
import { formatPrice } from "@/utils/currency";
import { EyeIcon, TimeIcon } from "@/icons";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";
import CustomSelect, { CustomSelectOption } from "@/components/ui/dropdown/CustomSelect";
import Pagination from "@/components/tables/Pagination";

interface OrdersTableClientProps {
  initialOrders: CustomerOrder[];
}

const ORDER_STATUS_OPTIONS: CustomSelectOption[] = [
  {
    value: "placed",
    label: "New Order",
    sublabel: "Pending fulfillment",
  },
  {
    value: "packing",
    label: "Packing",
    sublabel: "Order being prepared",
  },
  {
    value: "on_the_way",
    label: "On The Way",
    sublabel: "Out for delivery",
  },
  {
    value: "delivered",
    label: "Delivered",
    sublabel: "Order completed",
  },
];

const STATUS_TABS = [
  { key: "all", label: "All Orders" },
  { key: "placed", label: "New Orders" },
  { key: "packing", label: "Packing" },
  { key: "on_the_way", label: "On The Way" },
  { key: "delivered", label: "Delivered" },
] as const;

export default function OrdersTableClient({ initialOrders }: OrdersTableClientProps) {
  const [orders, setOrders] = useState<CustomerOrder[]>(initialOrders);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesFilter = filter === "all" || o.status === filter;
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        o.orderId.toLowerCase().includes(term) ||
        o.customerName.toLowerCase().includes(term) ||
        o.phone.includes(term) ||
        (o.city && o.city.toLowerCase().includes(term));
      return matchesFilter && matchesSearch;
    });
  }, [orders, filter, search]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const getStatusBadge = (status: CustomerOrder["status"]) => {
    switch (status) {
      case "delivered":
        return (
          <Badge color="success" className="whitespace-nowrap px-2.5 py-0.5">
            Delivered
          </Badge>
        );
      case "on_the_way":
        return (
          <Badge color="info" className="whitespace-nowrap px-2.5 py-0.5">
            On The Way
          </Badge>
        );
      case "packing":
        return (
          <Badge color="warning" className="whitespace-nowrap px-2.5 py-0.5">
            Packing
          </Badge>
        );
      case "placed":
      default:
        return (
          <Badge color="primary" className="whitespace-nowrap px-2.5 py-0.5">
            New Order
          </Badge>
        );
    }
  };

  const handleStatusUpdate = (orderId: string, newStatus: CustomerOrder["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.orderId === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    toast.success(`Order ${orderId} status updated to "${newStatus.replace(/_/g, " ")}"`);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-xl">
          {STATUS_TABS.map((tab) => {
            const count = tabCounts[tab.key] || 0;
            const isActive = filter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full lg:w-72">
          <input
            type="text"
            placeholder="Search by ID, name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <table className="w-full min-w-[980px] divide-y divide-gray-200 dark:divide-gray-800 text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/40 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3.5 whitespace-nowrap">Order ID</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Customer</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Slot / Time</th>
              <th className="px-4 py-3.5">Items</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Total</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Method</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/70 text-gray-700 dark:text-gray-300">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-sm font-medium">No orders match the selected criteria.</p>
                    <p className="text-xs text-gray-400 mt-1">Try clearing search or changing the status filter.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => {
                const allItemsSummary = order.items
                  .map((it) => `${it.name} (x${it.quantity})`)
                  .join(", ");

                return (
                  <tr
                    key={order.orderId}
                    className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    {/* Order ID - Never broken across lines */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-mono font-bold text-xs text-brand-600 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-500/15 px-2.5 py-1 rounded-md inline-block tracking-wider">
                        {order.orderId}
                      </span>
                    </td>

                    {/* Customer Info */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {order.customerName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {order.phone}
                      </div>
                      {order.email && (
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate max-w-[170px]" title={order.email}>
                          {order.email}
                        </div>
                      )}
                    </td>

                    {/* Delivery Slot */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300">
                        <TimeIcon className="size-3 text-gray-400 shrink-0" />
                        <span>{order.deliverySlot}</span>
                      </span>
                    </td>

                    {/* Items - Compact Badge UI with Tooltip */}
                    <td className="px-4 py-3.5">
                      <div className="max-w-[280px]" title={allItemsSummary}>
                        <div className="flex flex-wrap items-center gap-1">
                          {order.items.slice(0, 2).map((it, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-md truncate max-w-[130px]"
                            >
                              {it.name.split(" ")[0]} {it.name.split(" ")[1] || ""} (x{it.quantity})
                            </span>
                          ))}
                          {order.items.length > 2 && (
                            <span className="inline-flex items-center text-[10px] font-bold bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded-md">
                              +{order.items.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Total Price */}
                    <td className="px-4 py-3.5 whitespace-nowrap font-bold text-gray-900 dark:text-white">
                      {formatPrice(order.total)}
                    </td>

                    {/* Payment Method */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="uppercase text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        {order.paymentMethod}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>

                    {/* Action Button */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-brand-600 transition shadow-xs"
                      >
                        <EyeIcon className="size-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredOrders.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(p) => setCurrentPage(p)}
      />

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          className="m-4 max-w-[650px]"
        >
          <div className="relative w-full max-w-[650px] rounded-3xl bg-white p-6 lg:p-7 dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <div className="flex items-center gap-3">
                  <h4 className="text-xl font-bold font-mono text-gray-900 dark:text-white">
                    {selectedOrder.orderId}
                  </h4>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString("es-ES")}
                </p>
              </div>

              {/* Status Switcher Dropdown */}
              <div className="flex items-center gap-2 min-w-[170px]">
                <CustomSelect
                  options={ORDER_STATUS_OPTIONS}
                  value={selectedOrder.status}
                  onChange={(val) =>
                    handleStatusUpdate(
                      selectedOrder.orderId,
                      val as CustomerOrder["status"]
                    )
                  }
                />
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 text-xs border-b border-gray-100 dark:border-gray-800">
              <div>
                <span className="font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Customer & Contact
                </span>
                <p className="font-bold text-gray-900 dark:text-white text-sm">
                  {selectedOrder.customerName}
                </p>
                <p className="text-gray-600 dark:text-gray-300 font-mono mt-0.5">
                  {selectedOrder.phone}
                </p>
                {selectedOrder.email && (
                  <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                    {selectedOrder.email}
                  </p>
                )}
              </div>

              <div>
                <span className="font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Delivery Destination
                </span>
                <p className="text-gray-800 dark:text-gray-200">
                  {selectedOrder.address || selectedOrder.streetAddress}
                </p>
                <p className="text-gray-500 mt-0.5">
                  {selectedOrder.city} {selectedOrder.postalCode ? `(${selectedOrder.postalCode})` : ""}
                </p>
                <p className="text-brand-600 dark:text-brand-400 font-medium mt-1">
                  Slot: {selectedOrder.deliverySlot}
                </p>
                {selectedOrder.notes && (
                  <p className="text-gray-400 italic mt-1 bg-gray-50 dark:bg-gray-800/60 p-1.5 rounded">
                    Note: "{selectedOrder.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="py-4">
              <span className="font-semibold text-gray-400 uppercase tracking-wider text-xs block mb-2">
                Order Items ({selectedOrder.items.length})
              </span>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {selectedOrder.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="size-6 rounded-full bg-brand-50 dark:bg-brand-500/20 text-brand-600 font-bold flex items-center justify-center text-[10px]">
                        x{it.quantity}
                      </span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {it.name}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white font-mono">
                      {formatPrice(it.price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Summary */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 text-xs space-y-1.5">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal:</span>
                <span className="font-mono">{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery Dispatch Fee:</span>
                <span className="font-mono">
                  {selectedOrder.deliveryFee === 0 ? "FREE" : formatPrice(selectedOrder.deliveryFee)}
                </span>
              </div>
              {selectedOrder.discount ? (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount:</span>
                  <span className="font-mono">-{formatPrice(selectedOrder.discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-800">
                <span>Total Amount:</span>
                <span className="text-base text-brand-600 dark:text-brand-400 font-mono">
                  {formatPrice(selectedOrder.total)}
                </span>
              </div>
            </div>

            {/* Modal Close Button */}
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
