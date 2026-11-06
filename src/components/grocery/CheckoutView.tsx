"use client";

import React, { useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useGroceryCart } from "@/context/GroceryCartContext";
import {
  SPAIN_PROVINCES,
  TOP_SPAIN_CITIES,
  getSpainDeliverySlots,
  SpainDeliverySlot,
} from "@/data/spainCheckoutData";
import { CustomerOrder, PaymentMethod } from "@/types/grocery";
import {
  WhatsAppIcon,
  CartIcon,
  CreditCardIcon,
  DollarLineIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
} from "@/icons";
import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/utils/currency";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const CheckoutView: React.FC = () => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("checkout");
  const isEs = locale === "es";

  const {
    cart,
    subtotal,
    deliveryFee,
    discountAmount,
    promoCode,
    applyPromoCode,
    removePromoCode,
    total,
    updateQuantity,
    removeFromCart,
    clearCart,
    freeDeliveryThreshold,
    amountNeededForFreeDelivery,
  } = useGroceryCart();

  // Delivery Form State (Spanish Address)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    apartment: "",
    postalCode: "",
    city: "Madrid",
    province: "Madrid",
    notes: "",
    saveData: true,
    createAccount: false,
  });

  // Delivery Slots (Spain timing)
  const slots: SpainDeliverySlot[] = React.useMemo(
    () => getSpainDeliverySlots(locale),
    [locale],
  );

  // Pick first available slot by default
  const defaultSlot =
    slots.find((s) => !s.disabled)?.id || "tomorrow-morning";
  const [selectedSlot, setSelectedSlot] = useState<string>(defaultSlot);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  // Promo code in checkout
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isCouponShaking, setIsCouponShaking] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  // Load saved address from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tailgrocery_saved_address");
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const res = applyPromoCode(couponInput);
    if (res.success) {
      toast.success(res.message, { icon: "🎉" });
      setCouponError("");
      setCouponInput("");
    } else {
      setCouponError(res.message);
      setIsCouponShaking(true);
      setTimeout(() => setIsCouponShaking(false), 500);
      toast.error(res.message);
    }
  };

  const handleRemoveCoupon = () => {
    removePromoCode();
    toast.info("Código promocional eliminado.");
  };

  // Validation
  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error(isEs ? "Por favor, introduce tu nombre completo." : "Please enter your full name.");
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error(isEs ? "Introduce un correo electrónico válido." : "Please enter a valid email address.");
      return false;
    }
    // Clean phone number
    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (cleanPhone.length < 9) {
      toast.error(
        isEs
          ? "Introduce un número de teléfono válido de España (9 dígitos)."
          : "Please enter a valid 9-digit Spanish phone number.",
      );
      return false;
    }
    if (!formData.street.trim()) {
      toast.error(isEs ? "Introduce tu calle y número." : "Please enter your street address and number.");
      return false;
    }
    if (!formData.postalCode.trim() || formData.postalCode.length !== 5) {
      toast.error(
        isEs
          ? "El código postal debe tener exactamente 5 dígitos (p. ej. 28013)."
          : "Postal code must have 5 digits (e.g. 28013).",
      );
      return false;
    }
    if (!formData.city.trim()) {
      toast.error(isEs ? "Introduce tu ciudad o municipio." : "Please enter your city.");
      return false;
    }
    return true;
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (cart.length === 0) {
      toast.error(isEs ? "Tu cesta está vacía." : "Your basket is empty.");
      return;
    }

    setIsSubmitting(true);

    // Save address if opted
    if (formData.saveData) {
      try {
        localStorage.setItem(
          "tailgrocery_saved_address",
          JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            street: formData.street,
            apartment: formData.apartment,
            postalCode: formData.postalCode,
            city: formData.city,
            province: formData.province,
          }),
        );
      } catch {
        // Ignore
      }
    }

    const chosenSlotObj = slots.find((s) => s.id === selectedSlot);
    const chosenSlotLabel = chosenSlotObj
      ? `${chosenSlotObj.dayLabel} - ${chosenSlotObj.timeRange}`
      : "Entrega Inmediata";

    const fullStreetAddress = `${formData.street}${
      formData.apartment ? `, ${formData.apartment}` : ""
    }, ${formData.postalCode} ${formData.city} (${formData.province})`;

    const newOrder: CustomerOrder = {
      orderId: `ES-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: formData.fullName,
      email: formData.email,
      phone: `+34 ${formData.phone}`,
      address: fullStreetAddress,
      streetAddress: formData.street,
      apartment: formData.apartment,
      postalCode: formData.postalCode,
      city: formData.city,
      province: formData.province,
      notes: formData.notes,
      deliverySlot: chosenSlotLabel,
      paymentMethod,
      items: cart,
      subtotal,
      discount: discountAmount,
      promoCode: promoCode || undefined,
      deliveryFee,
      total,
      status: "placed",
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = localStorage.getItem("tailgrocery_orders");
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(newOrder);
      localStorage.setItem("tailgrocery_orders", JSON.stringify(list));
      localStorage.setItem("tailgrocery_last_order", JSON.stringify(newOrder));
    } catch {
      // Ignore
    }

    setIsSuccess(true);
    setTimeout(() => {
      clearCart();
      router.push(`/grocery/order-success?orderId=${newOrder.orderId}`);
    }, 900);
  };

  const getWhatsAppOrderUrl = () => {
    let msg = `*🛒 Nuevo Pedido en SuperBarrio España*\n\n`;
    cart.forEach((item, index) => {
      msg += `${index + 1}. *${item.name}* (${item.unit}) x ${item.quantity} = ${formatPrice(item.price * item.quantity, locale)}\n`;
    });
    msg += `\n*Subtotal:* ${formatPrice(subtotal, locale)}`;
    if (discountAmount > 0) {
      msg += `\n*Descuento (${promoCode}):* -${formatPrice(discountAmount, locale)}`;
    }
    msg += `\n*Gastos de Envío:* ${deliveryFee === 0 ? "GRATIS" : formatPrice(deliveryFee, locale)}`;
    msg += `\n*Total a Pagar:* ${formatPrice(total, locale)}\n\n`;
    if (formData.fullName) msg += `*Cliente:* ${formData.fullName}\n`;
    if (formData.phone) msg += `*Teléfono:* +34 ${formData.phone}\n`;
    if (formData.street) {
      msg += `*Dirección:* ${formData.street}${formData.apartment ? `, ${formData.apartment}` : ""}, ${formData.postalCode} ${formData.city} (${formData.province})\n`;
    }
    const chosenSlotObj = slots.find((s) => s.id === selectedSlot);
    if (chosenSlotObj) {
      msg += `*Franja de entrega:* ${chosenSlotObj.dayLabel} (${chosenSlotObj.timeRange})\n`;
    }
    msg += `\n¡Por favor confirmen la disponibilidad y hora de entrega! Muchas gracias.`;

    return `https://wa.me/34612345678?text=${encodeURIComponent(msg)}`;
  };

  // If cart is empty
  if (cart.length === 0 && !isSubmitting && !isSuccess) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
          <CartIcon className="h-10 w-10" />
        </div>
        <h2 className="mt-5 font-outfit text-2xl font-black text-gray-900 dark:text-white">
          {t("emptyTitle")}
        </h2>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {t("emptySubtitle")}
        </p>
        <Link
          href="/grocery"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-3.5 text-xs font-black text-white shadow-lg shadow-emerald-600/30 transition hover:scale-105 active:scale-95"
        >
          <span>← {t("startShopping")}</span>
        </Link>
      </div>
    );
  }

  // Calculate 10% food VAT (IVA) included in Spain
  const vatAmount = Number((total - total / 1.1).toFixed(2));

  return (
    <div className="mx-auto w-full max-w-[1920px] px-4 py-6 sm:px-6 md:py-10 lg:px-8 xl:px-10">
      {/* 1. Top Navigation & Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between pb-4">
          <Link
            href="/grocery"
            className="group inline-flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>
            <span>{t("backToStore")}</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 dark:text-emerald-400/60">
            <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
            <span className="hidden sm:inline">{t("secureCheckout")}</span>
            <span className="sm:hidden">SSL 256-Bit</span>
          </div>
        </div>

        {/* Animated 4-Step Checkout Progress Stepper */}
        <div className="relative mx-auto max-w-3xl pt-2">
          <div className="absolute top-1/2 start-0 end-0 -translate-y-1/2 h-1 bg-gray-200 dark:bg-emerald-950/80 -z-0 rounded-full" />
          <motion.div
            initial={{ width: "25%" }}
            animate={{ width: "66%" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute top-1/2 start-0 -translate-y-1/2 h-1 bg-gradient-to-r from-emerald-500 to-green-500 -z-0 rounded-full"
          />

          <div className="relative z-10 flex items-center justify-between">
            {/* Step 1: Cesta */}
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-black text-white shadow-md">
                ✓
              </div>
              <span className="mt-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                {t("stepper.basket")}
              </span>
            </div>

            {/* Step 2: Datos y Entrega (Active) */}
            <div className="flex flex-col items-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-xs font-black text-white shadow-lg ring-4 ring-emerald-500/20">
                2
              </div>
              <span className="mt-1.5 text-[11px] font-black text-emerald-700 dark:text-emerald-300">
                {t("stepper.delivery")}
              </span>
            </div>

            {/* Step 3: Pago */}
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-emerald-500/60 bg-white text-xs font-black text-emerald-600 dark:bg-[#071910] dark:text-emerald-400 shadow-xs">
                3
              </div>
              <span className="mt-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                {t("stepper.payment")}
              </span>
            </div>

            {/* Step 4: Confirmación */}
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-xs font-bold text-gray-400 dark:border-emerald-950 dark:bg-gray-800">
                4
              </div>
              <span className="mt-1.5 text-[11px] font-medium text-gray-400 dark:text-gray-500">
                {t("stepper.confirmation")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Order Summary Accordion Bar */}
      <div className="lg:hidden mb-6">
        <button
          type="button"
          onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
          className="flex w-full items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-50/80 px-4 py-3.5 text-xs font-bold text-emerald-900 shadow-xs backdrop-blur-md dark:border-emerald-950/80 dark:bg-[#071d12] dark:text-emerald-200"
        >
          <div className="flex items-center gap-2">
            <CartIcon className="h-4 w-4 text-emerald-600" />
            <span>
              {isMobileSummaryOpen ? "Ocultar resumen" : "Ver resumen del pedido"} ({cart.length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-outfit text-sm font-black text-emerald-700 dark:text-emerald-300">
              {formatPrice(total, locale)}
            </span>
            <span className="text-xs">{isMobileSummaryOpen ? "▲" : "▼"}</span>
          </div>
        </button>

        <AnimatePresence>
          {isMobileSummaryOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-md dark:border-emerald-950/80 dark:bg-[#071910]"
            >
              <div className="divide-y divide-gray-100 dark:divide-emerald-950/60 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2.5 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-9 w-9 rounded-lg object-cover"
                      />
                      <div className="truncate">
                        <span className="font-bold text-gray-900 dark:text-white truncate block">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {item.quantity} x {formatPrice(item.price, locale)}
                        </span>
                      </div>
                    </div>
                    <span className="font-outfit font-black text-gray-900 dark:text-white">
                      {formatPrice(item.price * item.quantity, locale)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Form & Sticky Summary Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Delivery Form, Slots, Payment (7 Columns) */}
        <div className="space-y-6 lg:col-span-7">
          <form onSubmit={handleSubmitOrder} className="space-y-6">
            {/* Section 1: Spain Delivery Address & Contact */}
            <div className="rounded-3xl border border-gray-200/80 bg-white p-5 sm:p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] backdrop-blur-sm dark:border-emerald-950/60 dark:bg-[#071910]/70">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-emerald-950/60">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-xs font-black text-emerald-600 shadow-xs dark:bg-emerald-950/60 dark:text-emerald-400">
                  1
                </span>
                <div>
                  <h3 className="font-outfit text-base sm:text-lg font-black tracking-tight text-gray-900 dark:text-white">
                    {t("deliverySection.title")}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-emerald-300/70">
                    {t("deliverySection.subtitle")}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("deliverySection.fullName")}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder={t("deliverySection.fullNamePlaceholder")}
                    className="mt-1.5 w-full rounded-2xl border border-gray-200/80 bg-gray-50/70 px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-800 placeholder-gray-400 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-emerald-950 dark:bg-[#05130b] dark:text-white"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("deliverySection.email")}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder={t("deliverySection.emailPlaceholder")}
                    className="mt-1.5 w-full rounded-2xl border border-gray-200/80 bg-gray-50/70 px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-800 placeholder-gray-400 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-emerald-950 dark:bg-[#05130b] dark:text-white"
                  />
                </div>

                {/* Phone (+34 Spain) */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("deliverySection.phone")}
                  </label>
                  <div className="relative mt-1.5 flex items-center">
                    <span className="absolute start-3.5 inline-flex items-center gap-1.5 text-xs font-black text-gray-500 dark:text-emerald-400">
                      <span>🇪🇸</span>
                      <span>+34</span>
                    </span>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone: e.target.value.replace(/[^0-9\s]/g, ""),
                        })
                      }
                      placeholder={t("deliverySection.phonePlaceholder")}
                      className="w-full rounded-2xl border border-gray-200/80 bg-gray-50/70 py-2.5 pe-4 ps-20 text-xs sm:text-sm font-semibold text-gray-800 placeholder-gray-400 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-emerald-950 dark:bg-[#05130b] dark:text-white"
                    />
                  </div>
                  <p className="mt-1 text-[11px] font-medium text-gray-400 dark:text-emerald-400/60">
                    {t("deliverySection.phoneHelp")}
                  </p>
                </div>

                {/* Street & Number */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("deliverySection.street")}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.street}
                    onChange={(e) =>
                      setFormData({ ...formData, street: e.target.value })
                    }
                    placeholder={t("deliverySection.streetPlaceholder")}
                    className="mt-1.5 w-full rounded-2xl border border-gray-200/80 bg-gray-50/70 px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-800 placeholder-gray-400 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-emerald-950 dark:bg-[#05130b] dark:text-white"
                  />
                </div>

                {/* Floor / Apartment */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("deliverySection.apartment")}
                  </label>
                  <input
                    type="text"
                    value={formData.apartment}
                    onChange={(e) =>
                      setFormData({ ...formData, apartment: e.target.value })
                    }
                    placeholder={t("deliverySection.apartmentPlaceholder")}
                    className="mt-1.5 w-full rounded-2xl border border-gray-200/80 bg-gray-50/70 px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-800 placeholder-gray-400 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-emerald-950 dark:bg-[#05130b] dark:text-white"
                  />
                </div>

                {/* Postal Code (5 Digits) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("deliverySection.postalCode")}
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    required
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        postalCode: e.target.value.replace(/\D/g, "").slice(0, 5),
                      })
                    }
                    placeholder={t("deliverySection.postalCodePlaceholder")}
                    className="mt-1.5 w-full rounded-2xl border border-gray-200/80 bg-gray-50/70 px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-800 placeholder-gray-400 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-emerald-950 dark:bg-[#05130b] dark:text-white"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("deliverySection.city")}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder={t("deliverySection.cityPlaceholder")}
                    className="mt-1.5 w-full rounded-2xl border border-gray-200/80 bg-gray-50/70 px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-800 placeholder-gray-400 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-emerald-950 dark:bg-[#05130b] dark:text-white"
                  />
                </div>

                {/* Province Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("deliverySection.province")}
                  </label>
                  <select
                    value={formData.province}
                    onChange={(e) =>
                      setFormData({ ...formData, province: e.target.value })
                    }
                    className="mt-1.5 w-full rounded-2xl border border-gray-200/80 bg-gray-50/70 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-800 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-emerald-950 dark:bg-[#05130b] dark:text-white"
                  >
                    {SPAIN_PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick City Suggestions */}
                <div className="sm:col-span-2 flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-gray-400">
                    {t("deliverySection.quickCities")}
                  </span>
                  {TOP_SPAIN_CITIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          city: c,
                          province: c,
                        }))
                      }
                      className="rounded-xl border border-emerald-500/20 bg-emerald-50/60 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 transition hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/40 dark:text-emerald-300"
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {/* Delivery Instructions */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("deliverySection.instructions")}
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder={t("deliverySection.instructionsPlaceholder")}
                    className="mt-1.5 w-full rounded-2xl border border-gray-200/80 bg-gray-50/70 px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-800 placeholder-gray-400 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-emerald-950 dark:bg-[#05130b] dark:text-white"
                  />
                </div>

                {/* Checkboxes: Save Data & Guest Account */}
                <div className="sm:col-span-2 space-y-2 pt-2 border-t border-gray-100 dark:border-emerald-950/60">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.saveData}
                      onChange={(e) =>
                        setFormData({ ...formData, saveData: e.target.checked })
                      }
                      className="h-4 w-4 rounded-md border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{t("deliverySection.saveData")}</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.createAccount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          createAccount: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded-md border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{t("deliverySection.createAccount")}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Section 2: Preferred Delivery Slot (Spain Timing) */}
            <div className="rounded-3xl border border-gray-200/80 bg-white p-5 sm:p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] backdrop-blur-sm dark:border-emerald-950/60 dark:bg-[#071910]/70">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-emerald-950/60">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-xs font-black text-emerald-600 shadow-xs dark:bg-emerald-950/60 dark:text-emerald-400">
                  2
                </span>
                <div>
                  <h3 className="font-outfit text-base sm:text-lg font-black tracking-tight text-gray-900 dark:text-white">
                    {t("slotSection.title")}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-emerald-300/70">
                    {t("slotSection.subtitle")}
                  </p>
                </div>
              </div>

              {/* Slot Grid */}
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {slots.map((slot) => {
                  const isChecked = selectedSlot === slot.id;
                  const isDisabled = slot.disabled;

                  return (
                    <label
                      key={slot.id}
                      onClick={() => !isDisabled && setSelectedSlot(slot.id)}
                      className={`relative flex items-center justify-between rounded-2xl border p-4 transition-all select-none ${
                        isDisabled
                          ? "opacity-45 bg-gray-100/60 border-gray-200 cursor-not-allowed dark:bg-gray-900/40 dark:border-emerald-950/40"
                          : isChecked
                          ? "cursor-pointer border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/25 dark:border-emerald-500 dark:bg-emerald-950/40"
                          : "cursor-pointer border-gray-200/80 bg-white hover:border-emerald-300 dark:border-emerald-950 dark:bg-[#05130b]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[11px] font-black uppercase tracking-wider ${
                              slot.dayType === "today"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {slot.dayLabel}
                          </span>
                          {slot.periodLabel && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 dark:bg-emerald-950/80 dark:text-emerald-300">
                              {slot.periodLabel}
                            </span>
                          )}
                        </div>
                        <span className="mt-1 block font-outfit text-sm font-black text-gray-900 dark:text-white">
                          {slot.timeRange}
                        </span>
                        {isDisabled && (
                          <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400">
                            {t("slotSection.passed")}
                          </span>
                        )}
                      </div>

                      <input
                        type="radio"
                        name="deliverySlot"
                        disabled={isDisabled}
                        checked={isChecked}
                        onChange={() => setSelectedSlot(slot.id)}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                      />
                    </label>
                  );
                })}
              </div>

              <p className="mt-3 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                ⚡ {t("slotSection.expressNotice")}
              </p>
            </div>

            {/* Section 3: Spain Payment Methods */}
            <div className="rounded-3xl border border-gray-200/80 bg-white p-5 sm:p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] backdrop-blur-sm dark:border-emerald-950/60 dark:bg-[#071910]/70">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-emerald-950/60">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-xs font-black text-emerald-600 shadow-xs dark:bg-emerald-950/60 dark:text-emerald-400">
                  3
                </span>
                <div>
                  <h3 className="font-outfit text-base sm:text-lg font-black tracking-tight text-gray-900 dark:text-white">
                    {t("paymentSection.title")}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-emerald-300/70">
                    {t("paymentSection.subtitle")}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {/* 1. Credit / Debit Card (Visa, Mastercard) */}
                <label
                  onClick={() => setPaymentMethod("card")}
                  className={`flex cursor-pointer items-start justify-between rounded-2xl border p-4.5 transition-all ${
                    paymentMethod === "card"
                      ? "border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/40"
                      : "border-gray-200/80 bg-white hover:border-gray-300 dark:border-emerald-950 dark:bg-[#05130b]"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs dark:bg-emerald-950/60 dark:text-emerald-400">
                      <CreditCardIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-outfit text-sm font-black text-gray-900 dark:text-white">
                          {t("paymentSection.card")}
                        </span>
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-black text-blue-700 dark:bg-gray-800 dark:text-blue-400">
                          VISA
                        </span>
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-black text-red-600 dark:bg-gray-800 dark:text-red-400">
                          Mastercard
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {t("paymentSection.cardDesc")}
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                </label>

                {/* 2. Bizum (Famous Spain mobile instant payment) */}
                <label
                  onClick={() => setPaymentMethod("bizum")}
                  className={`flex cursor-pointer items-start justify-between rounded-2xl border p-4.5 transition-all ${
                    paymentMethod === "bizum"
                      ? "border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/40"
                      : "border-gray-200/80 bg-white hover:border-gray-300 dark:border-emerald-950 dark:bg-[#05130b]"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#00A99D]/10 text-[#00A99D] font-black text-xs shadow-xs">
                      bizum
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-outfit text-sm font-black text-gray-900 dark:text-white">
                          {t("paymentSection.bizum")}
                        </span>
                        <span className="rounded-full bg-[#00A99D]/15 px-2 py-0.5 text-[10px] font-bold text-[#00A99D]">
                          Popular en España
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {t("paymentSection.bizumDesc")}
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "bizum"}
                    onChange={() => setPaymentMethod("bizum")}
                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                </label>

                {/* 3. PayPal */}
                <label
                  onClick={() => setPaymentMethod("paypal")}
                  className={`flex cursor-pointer items-start justify-between rounded-2xl border p-4.5 transition-all ${
                    paymentMethod === "paypal"
                      ? "border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/40"
                      : "border-gray-200/80 bg-white hover:border-gray-300 dark:border-emerald-950 dark:bg-[#05130b]"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#003087]/10 text-[#003087] font-black text-xs shadow-xs dark:bg-blue-950 dark:text-blue-300">
                      PayPal
                    </div>
                    <div>
                      <span className="font-outfit text-sm font-black text-gray-900 dark:text-white">
                        {t("paymentSection.paypal")}
                      </span>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {t("paymentSection.paypalDesc")}
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "paypal"}
                    onChange={() => setPaymentMethod("paypal")}
                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                </label>

                {/* 4. Apple Pay / Google Pay */}
                <label
                  onClick={() => setPaymentMethod("apple_google")}
                  className={`flex cursor-pointer items-start justify-between rounded-2xl border p-4.5 transition-all ${
                    paymentMethod === "apple_google"
                      ? "border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/40"
                      : "border-gray-200/80 bg-white hover:border-gray-300 dark:border-emerald-950 dark:bg-[#05130b]"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-800 font-bold text-xs shadow-xs dark:bg-gray-800 dark:text-white">
                       / G
                    </div>
                    <div>
                      <span className="font-outfit text-sm font-black text-gray-900 dark:text-white">
                        {t("paymentSection.appleGoogle")}
                      </span>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {t("paymentSection.appleGoogleDesc")}
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "apple_google"}
                    onChange={() => setPaymentMethod("apple_google")}
                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                </label>

                {/* 5. Efectivo contra entrega (Cash on Delivery) */}
                <label
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex cursor-pointer items-start justify-between rounded-2xl border p-4.5 transition-all ${
                    paymentMethod === "cod"
                      ? "border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/40"
                      : "border-gray-200/80 bg-white hover:border-gray-300 dark:border-emerald-950 dark:bg-[#05130b]"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-xs dark:bg-amber-950/60 dark:text-amber-400">
                      <DollarLineIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="font-outfit text-sm font-black text-gray-900 dark:text-white">
                        {t("paymentSection.cod")}
                      </span>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {t("paymentSection.codDesc")}
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                </label>
              </div>
            </div>

            {/* Desktop Place Order Button */}
            <div className="hidden lg:block pt-2">
              <motion.button
                type="submit"
                disabled={isSubmitting || isSuccess}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 py-4 text-center font-outfit text-base font-black text-white shadow-xl shadow-emerald-600/35 transition-all duration-200 hover:shadow-2xl hover:shadow-emerald-600/45 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>{t("summary.processing")}</span>
                  </span>
                ) : isSuccess ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>¡Pedido Realizado con Éxito!</span>
                  </span>
                ) : (
                  <span>
                    {t("summary.placeOrder")} • {formatPrice(total, locale)}
                  </span>
                )}
              </motion.button>
            </div>

            {/* Secondary WhatsApp Checkout Button (Clean Outline Style) */}
            <div className="pt-2">
              <a
                href={getWhatsAppOrderUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-[#25D366]/40 bg-white py-3.5 text-xs font-black text-[#128C7E] shadow-xs transition-all hover:border-[#25D366] hover:bg-[#25D366]/10 dark:bg-[#071910] dark:text-emerald-300"
              >
                <WhatsAppIcon className="h-4 w-4 fill-current transition-transform group-hover:scale-110" />
                <span>{t("summary.orderViaWhatsApp")}</span>
              </a>
              <p className="mt-1 text-center text-[11px] font-medium text-gray-400">
                {t("summary.whatsAppSubtitle")}
              </p>
            </div>
          </form>
        </div>

        {/* Right Column: Sticky Order Summary (5 Columns) */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 rounded-3xl border border-gray-200/80 bg-white p-6 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.08)] backdrop-blur-sm dark:border-emerald-950/60 dark:bg-[#071910]/80">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-emerald-950/60">
              <h3 className="font-outfit text-base font-black text-gray-900 dark:text-white">
                {t("summary.title")}
              </h3>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-black text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                {t("summary.itemsCount", { count: cart.length })}
              </span>
            </div>

            {/* Free Delivery Tracker ($25 threshold) */}
            <div className="my-4 rounded-2xl border border-emerald-500/30 bg-emerald-50/60 p-3.5 dark:border-emerald-950/80 dark:bg-emerald-950/30">
              <div className="flex items-center justify-between text-xs font-bold">
                {amountNeededForFreeDelivery === 0 ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>{t("summary.freeDeliveryGoal")}</span>
                  </span>
                ) : (
                  <span className="text-gray-700 dark:text-gray-300">
                    {t("summary.freeDeliveryLeft", {
                      amount: formatPrice(amountNeededForFreeDelivery, locale),
                    })}
                  </span>
                )}
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-emerald-200/70 dark:bg-gray-800">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(
                      100,
                      Math.round((subtotal / freeDeliveryThreshold) * 100),
                    )}%`,
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Items list with Quantity Controls */}
            <div className="max-h-60 overflow-y-auto pe-1 divide-y divide-gray-100 dark:divide-emerald-950/60">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="truncate">
                      <h5 className="font-bold text-gray-900 dark:text-white truncate">
                        {item.name}
                      </h5>
                      <span className="text-[11px] text-gray-500 dark:text-emerald-300/60">
                        {item.unit} • {formatPrice(item.price, locale)}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="flex items-center rounded-xl border border-gray-200/80 bg-gray-50/80 dark:border-emerald-950 dark:bg-emerald-950/40">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="flex h-7 w-6 items-center justify-center font-black text-gray-600 hover:bg-gray-200/60 hover:text-emerald-600 dark:text-gray-300"
                      >
                        -
                      </button>
                      <span className="w-5 text-center font-black text-gray-900 dark:text-white text-[11px]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="flex h-7 w-6 items-center justify-center font-black text-gray-600 hover:bg-gray-200/60 hover:text-emerald-600 dark:text-gray-300"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-outfit font-black text-gray-900 dark:text-white min-w-14 text-end">
                      {formatPrice(item.price * item.quantity, locale)}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-rose-500 transition px-1"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Box with Shake Animation on Error */}
            <div className="mt-5 border-t border-gray-100 pt-4 dark:border-emerald-950/60">
              {discountAmount > 0 ? (
                <div className="flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <div className="flex items-center gap-2">
                    <span>🎉</span>
                    <span className="font-black">
                      {promoCode} (20% OFF)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="font-bold text-rose-500 hover:underline"
                  >
                    ✕ Eliminar
                  </button>
                </div>
              ) : (
                <motion.form
                  onSubmit={handleApplyCoupon}
                  animate={
                    isCouponShaking
                      ? { x: [0, -8, 8, -6, 6, 0] }
                      : { x: 0 }
                  }
                  transition={{ duration: 0.4 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder={t("summary.promoPlaceholder")}
                      className="flex-1 rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-gray-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-emerald-950 dark:bg-[#05130b] dark:text-white"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-xs transition hover:bg-emerald-700"
                    >
                      {t("summary.apply")}
                    </button>
                  </div>
                  {couponError && (
                    <span className="block text-[11px] font-bold text-rose-500">
                      {couponError}
                    </span>
                  )}
                </motion.form>
              )}
            </div>

            {/* Financial Breakdown */}
            <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-xs font-semibold text-gray-600 dark:border-emerald-950/60 dark:text-gray-400">
              <div className="flex justify-between">
                <span>{t("summary.subtotal")}</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatPrice(subtotal, locale)}
                </span>
              </div>

              {discountAmount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold"
                >
                  <span>{t("summary.discount")} (20%)</span>
                  <span>-{formatPrice(discountAmount, locale)}</span>
                </motion.div>
              )}

              <div className="flex justify-between">
                <span>{t("summary.delivery")}</span>
                <span className="font-bold">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {t("summary.free")}
                    </span>
                  ) : (
                    formatPrice(deliveryFee, locale)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-gray-400">
                <span>{t("summary.vatIncluded")}</span>
                <span>{formatPrice(vatAmount, locale)}</span>
              </div>

              {/* Total Row */}
              <div className="flex items-baseline justify-between border-t border-gray-200/80 pt-3 dark:border-emerald-950/80">
                <span className="font-outfit text-sm font-black text-gray-900 dark:text-white">
                  {t("summary.total")}
                </span>
                <motion.span
                  key={total}
                  initial={{ scale: 0.85 }}
                  animate={{ scale: 1 }}
                  className="font-outfit text-2xl font-black text-emerald-600 dark:text-emerald-400"
                >
                  {formatPrice(total, locale)}
                </motion.span>
              </div>
            </div>

            {/* Satisfaction Guarantee */}
            <div className="mt-5 rounded-2xl bg-gray-50/80 p-3 text-[11px] font-medium text-gray-500 dark:bg-[#05130b] dark:text-emerald-400/70">
              🛡️ {t("summary.guarantee")}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Place Order Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gray-200/90 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur-xl dark:border-emerald-950/90 dark:bg-[#071910]/95">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase">
              {t("summary.total")}
            </span>
            <span className="font-outfit text-lg font-black text-emerald-600 dark:text-emerald-400">
              {formatPrice(total, locale)}
            </span>
          </div>

          <button
            type="button"
            disabled={isSubmitting || isSuccess}
            onClick={handleSubmitOrder}
            className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 py-3.5 text-center font-outfit text-sm font-black text-white shadow-lg shadow-emerald-600/30 transition active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>{t("summary.processing")}</span>
            ) : isSuccess ? (
              <span>✓ ¡Éxito!</span>
            ) : (
              <span>{t("summary.placeOrder")}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutView;
