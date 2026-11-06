"use client";

import React, { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useGroceryCart } from "@/context/GroceryCartContext";
import { DELIVERY_SLOTS } from "@/data/groceryData";
import { CustomerOrder } from "@/types/grocery";
import Badge from "@/components/ui/badge/Badge";
import { WhatsAppIcon, CartIcon, DollarLineIcon, PhoneIcon, CreditCardIcon } from "@/icons";
import { useLocale } from "next-intl";
import { formatPrice } from "@/utils/currency";

export const CheckoutView: React.FC = () => {
  const router = useRouter();
  const locale = useLocale();
  const { cart, subtotal, deliveryFee, total, clearCart } = useGroceryCart();

  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    address: "",
    city: "Lahore",
    notes: "",
  });

  const [selectedSlot, setSelectedSlot] = useState(DELIVERY_SLOTS[0].id);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card" | "wallet">(
    "cod",
  );
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === "FRESH20") {
      const discount = Number((subtotal * 0.2).toFixed(2));
      setAppliedDiscount(discount);
      setCouponError("");
    } else {
      setCouponError("Invalid promo code. Try 'FRESH20'!");
    }
  };

  const finalTotal = Math.max(0, Number((total - appliedDiscount).toFixed(2)));

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.phone || !formData.address) {
      alert("Please fill in your name, phone number and delivery address.");
      return;
    }

    if (cart.length === 0) {
      alert("Your basket is empty! Please add groceries before checkout.");
      return;
    }

    setIsSubmitting(true);

    const chosenSlot =
      DELIVERY_SLOTS.find((s) => s.id === selectedSlot)?.timeRange || "Express";

    const newOrder: CustomerOrder = {
      orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: formData.customerName,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      notes: formData.notes,
      deliverySlot: chosenSlot,
      paymentMethod,
      items: cart,
      subtotal,
      deliveryFee,
      total: finalTotal,
      status: "placed",
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage for mock order tracking
    try {
      const existing = localStorage.getItem("tailgrocery_orders");
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(newOrder);
      localStorage.setItem("tailgrocery_orders", JSON.stringify(list));
      localStorage.setItem("tailgrocery_last_order", JSON.stringify(newOrder));
    } catch {
      // Ignore storage errors
    }

    // Clear cart and redirect
    clearCart();
    setTimeout(() => {
      router.push(`/grocery/order-success?orderId=${newOrder.orderId}`);
    }, 400);
  };

  if (cart.length === 0 && !isSubmitting) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-950/40">
          <CartIcon className="h-10 w-10" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Your basket is empty
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          You don&apos;t have any grocery items in your basket to checkout.
        </p>
        <Link
          href="/grocery"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-theme-xs hover:bg-brand-600"
        >
          <span>← Back to Grocery Store</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1920px] px-4 py-6 sm:px-6 md:py-10 lg:px-8 xl:px-10">
      {/* Top Back Link */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/grocery"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
        >
          <span>←</span>
          <span>Continue Shopping</span>
        </Link>
        <span className="text-xs text-gray-400">Secure Checkout</span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Form: Delivery, Slot & Payment (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          <form onSubmit={handleSubmitOrder} className="space-y-6">
            {/* 1. Delivery Details */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                  1
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Delivery Address & Contact
                </h3>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    placeholder="e.g. Asif Khan"
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="e.g. +92 300 1234567"
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Complete Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="House / Apartment #, Street, Block, Area"
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="e.g. Ring the bell, leave at door"
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* 2. Delivery Time Slot */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                  2
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Preferred Delivery Slot
                </h3>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {DELIVERY_SLOTS.map((slot) => {
                  const isChecked = selectedSlot === slot.id;
                  return (
                    <label
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition ${
                        isChecked
                          ? "border-brand-500 bg-brand-50/40 ring-2 ring-brand-500/20 dark:border-brand-500 dark:bg-brand-950/20"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700"
                      }`}
                    >
                      <div>
                        <span className="block text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                          {slot.day}
                        </span>
                        <span className="text-xs font-medium text-gray-800 dark:text-white">
                          {slot.timeRange}
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="deliverySlot"
                        checked={isChecked}
                        onChange={() => setSelectedSlot(slot.id)}
                        className="h-4 w-4 text-brand-600"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                  3
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Payment Method
                </h3>
              </div>

              <div className="mt-4 space-y-3">
                {/* Cash on Delivery */}
                <label
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                    paymentMethod === "cod"
                      ? "border-brand-500 bg-brand-50/40 ring-2 ring-brand-500/20 dark:border-brand-500 dark:bg-brand-950/20"
                      : "border-gray-200 dark:border-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      <DollarLineIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-gray-800 dark:text-white">
                        Cash on Delivery (COD)
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Pay in cash when groceries arrive at your door
                      </span>
                    </div>
                  </div>
                  <Badge variant="light" color="success" size="sm">
                    Recommended
                  </Badge>
                </label>

                {/* Mobile Wallet */}
                <label
                  onClick={() => setPaymentMethod("wallet")}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                    paymentMethod === "wallet"
                      ? "border-brand-500 bg-brand-50/40 ring-2 ring-brand-500/20 dark:border-brand-500 dark:bg-brand-950/20"
                      : "border-gray-200 dark:border-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      <PhoneIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-gray-800 dark:text-white">
                        EasyPaisa / JazzCash / Mobile Wallet
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Rider will present QR code or wallet prompt upon delivery
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    checked={paymentMethod === "wallet"}
                    onChange={() => setPaymentMethod("wallet")}
                    className="h-4 w-4 text-brand-600"
                  />
                </label>

                {/* Credit Card */}
                <label
                  onClick={() => setPaymentMethod("card")}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                    paymentMethod === "card"
                      ? "border-brand-500 bg-brand-50/40 ring-2 ring-brand-500/20 dark:border-brand-500 dark:bg-brand-950/20"
                      : "border-gray-200 dark:border-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      <CreditCardIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-gray-800 dark:text-white">
                        Credit / Debit Card (Visa, Mastercard)
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Pay securely with your bank card
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                    className="h-4 w-4 text-brand-600"
                  />
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-brand-500 py-4 text-center text-sm font-bold text-white shadow-theme-md transition hover:bg-brand-600 disabled:opacity-50"
            >
              {isSubmitting
                ? "Processing your Order..."
                : `Place Order • ${formatPrice(finalTotal, locale)}`}
            </button>

            {/* Complete via WhatsApp */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800" />
              </div>
              <span className="relative bg-white px-3 text-xs text-gray-400 dark:bg-gray-900">
                OR
              </span>
            </div>

            <a
              href={`https://wa.me/923001234567?text=${encodeURIComponent(
                `*New Grocery Order via WhatsApp - SuperBarrio*\n\n` +
                  cart
                    .map(
                      (item, i) =>
                        `${i + 1}. *${item.name}* (${item.unit}) x ${item.quantity} = ${formatPrice(item.price * item.quantity, locale)}`,
                    )
                    .join("\n") +
                  `\n\n*Total Amount:* ${formatPrice(finalTotal, locale)}` +
                  (formData.customerName ? `\n*Name:* ${formData.customerName}` : "") +
                  (formData.address ? `\n*Address:* ${formData.address}` : "") +
                  `\n\nPlease confirm my order!`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-[#25D366]/10 py-3 text-xs font-bold text-[#128C7E] transition hover:bg-[#25D366] hover:text-white dark:bg-[#25D366]/20 dark:text-emerald-300 dark:hover:bg-[#25D366] dark:hover:text-white"
            >
              <WhatsAppIcon className="h-4 w-4 fill-current" />
              <span>Complete Order via WhatsApp</span>
            </a>
          </form>
        </div>

        {/* Right Summary Box (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-base font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800">
              Basket Summary ({cart.length} items)
            </h3>

            {/* Items review */}
            <div className="mt-4 max-h-64 divide-y divide-gray-100 overflow-y-auto pe-1 dark:divide-gray-800">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2.5 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-base">{item.emoji}</span>
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {item.name}
                      </span>
                      <span className="block text-[11px] text-gray-500 dark:text-gray-400">
                        {item.quantity} x {formatPrice(item.price, locale)} ({item.unit})
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatPrice(item.price * item.quantity, locale)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code Input */}
            <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-800">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Have a Promo Code?
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Try FRESH20"
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs uppercase text-gray-800 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 dark:bg-brand-500 dark:hover:bg-brand-600"
                >
                  Apply
                </button>
              </div>
              {appliedDiscount > 0 && (
                <p className="mt-1.5 text-xs text-success-600 dark:text-success-400">
                  ✓ Code FRESH20 applied: -{formatPrice(appliedDiscount, locale)} off!
                </p>
              )}
              {couponError && (
                <p className="mt-1.5 text-xs text-error-500">{couponError}</p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-xs dark:border-gray-800">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatPrice(subtotal, locale)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Delivery Charge</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="font-semibold text-success-600">FREE</span>
                  ) : (
                    formatPrice(deliveryFee, locale)
                  )}
                </span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-success-600 dark:text-success-400">
                  <span>Promo Discount (20%)</span>
                  <span>-{formatPrice(appliedDiscount, locale)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold text-gray-900 dark:border-gray-800 dark:text-white">
                <span>Total to Pay</span>
                <span className="text-xl text-brand-600 dark:text-brand-400">
                  {formatPrice(finalTotal, locale)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutView;
