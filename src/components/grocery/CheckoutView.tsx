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
  CreditCardIcon,
  DollarLineIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  CartIcon,
  LeafIcon,
  FruitIcon,
  BoltIcon,
  EsFlagIcon,
} from "@/icons";
import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/utils/currency";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";

// Zod Validation Schema for Spain Checkout Form
const spainCheckoutSchema = z.object({
  fullName: z
    .string()
    .min(3, "Por favor, introduce tu nombre y apellidos completos."),
  email: z
    .string()
    .email("Introduce una dirección de correo electrónico válida (p. ej. maria@email.es)."),
  phone: z
    .string()
    .refine(
      (val) => val.replace(/\D/g, "").length === 9,
      "El teléfono móvil debe tener exactamente 9 dígitos de España (p. ej. 612 345 678).",
    ),
  street: z
    .string()
    .min(4, "Introduce la calle, avenida o plaza y el número exterior."),
  apartment: z.string().optional(),
  postalCode: z
    .string()
    .refine(
      (val) => /^[0-9]{5}$/.test(val.trim()),
      "El código postal debe contener exactamente 5 dígitos numéricos (p. ej. 28013).",
    ),
  city: z
    .string()
    .min(2, "Introduce tu ciudad o municipio de residencia."),
  province: z
    .string()
    .min(2, "Selecciona una provincia de España."),
  notes: z.string().optional(),
});

// Staggered entrance animation variants (with reduced-motion awareness)
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Shimmer Skeleton Loader when cart is hydrating
export const CheckoutSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando proceso de compra"
      className="mx-auto w-full max-w-[1920px] px-4 py-6 sm:px-6 md:py-10 lg:px-8 xl:px-10 animate-pulse"
    >
      {/* Stepper Skeleton */}
      <div className="mb-8">
        <div className="flex items-center justify-between pb-4">
          <div className="h-4 w-28 rounded-lg bg-gray-200 dark:bg-emerald-950/60" />
          <div className="h-4 w-44 rounded-lg bg-gray-200 dark:bg-emerald-950/60" />
        </div>
        <div className="relative mx-auto max-w-3xl pt-2">
          <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-emerald-950/60" />
          <div className="flex justify-between pt-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-emerald-950/60" />
                <div className="h-3 w-16 rounded-md bg-gray-200 dark:bg-emerald-950/60" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Form Column Skeleton */}
        <div className="space-y-6 lg:col-span-7">
          {/* Card 1: Address */}
          <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-emerald-950/70 dark:bg-[#071910]">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-emerald-950/60">
              <div className="h-8 w-8 rounded-xl bg-gray-200 dark:bg-emerald-950/60" />
              <div className="space-y-1.5">
                <div className="h-5 w-48 rounded-md bg-gray-200 dark:bg-emerald-950/60" />
                <div className="h-3 w-64 rounded-md bg-gray-100 dark:bg-emerald-950/40" />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="h-11 rounded-2xl bg-gray-100 dark:bg-[#05130b]" />
              <div className="h-11 rounded-2xl bg-gray-100 dark:bg-[#05130b]" />
              <div className="sm:col-span-2 h-11 rounded-2xl bg-gray-100 dark:bg-[#05130b]" />
              <div className="sm:col-span-2 h-11 rounded-2xl bg-gray-100 dark:bg-[#05130b]" />
              <div className="h-11 rounded-2xl bg-gray-100 dark:bg-[#05130b]" />
              <div className="h-11 rounded-2xl bg-gray-100 dark:bg-[#05130b]" />
            </div>
          </div>

          {/* Card 2: Slots */}
          <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-emerald-950/70 dark:bg-[#071910]">
            <div className="h-5 w-44 rounded-md bg-gray-200 dark:bg-emerald-950/60 mb-4" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-18 rounded-2xl bg-gray-100 dark:bg-[#05130b]" />
              ))}
            </div>
          </div>

          {/* Card 3: Payment */}
          <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-emerald-950/70 dark:bg-[#071910]">
            <div className="h-5 w-44 rounded-md bg-gray-200 dark:bg-emerald-950/60 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-gray-100 dark:bg-[#05130b]" />
              ))}
            </div>
          </div>
        </div>

        {/* Summary Column Skeleton */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-emerald-950/70 dark:bg-[#071910] space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-emerald-950/60">
              <div className="h-5 w-36 rounded-md bg-gray-200 dark:bg-emerald-950/60" />
              <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-emerald-950/60" />
            </div>
            <div className="h-12 rounded-2xl bg-gray-100 dark:bg-[#05130b]" />
            <div className="space-y-3 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-gray-200 dark:bg-emerald-950/60" />
                    <div className="space-y-1">
                      <div className="h-4 w-32 rounded-md bg-gray-200 dark:bg-emerald-950/60" />
                      <div className="h-3 w-20 rounded-md bg-gray-100 dark:bg-emerald-950/40" />
                    </div>
                  </div>
                  <div className="h-4 w-14 rounded-md bg-gray-200 dark:bg-emerald-950/60" />
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-100 dark:border-emerald-950/60 space-y-2.5">
              <div className="flex justify-between">
                <div className="h-4 w-20 rounded bg-gray-200 dark:bg-emerald-950/60" />
                <div className="h-4 w-14 rounded bg-gray-200 dark:bg-emerald-950/60" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-emerald-950/60" />
                <div className="h-4 w-14 rounded bg-gray-200 dark:bg-emerald-950/60" />
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-emerald-950/60">
                <div className="h-6 w-24 rounded bg-gray-200 dark:bg-emerald-950/60" />
                <div className="h-7 w-24 rounded bg-gray-200 dark:bg-emerald-950/60" />
              </div>
            </div>
            <div className="h-14 rounded-2xl bg-gray-200 dark:bg-emerald-950/60" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const CheckoutView: React.FC = () => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("checkout");
  const isEs = locale === "es";
  const shouldReduceMotion = useReducedMotion();

  const {
    cart,
    isLoaded,
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

  // Per-field Zod validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Delivery Slots (Spain timing)
  const slots: SpainDeliverySlot[] = React.useMemo(
    () => getSpainDeliverySlots(locale),
    [locale],
  );

  // Pick first available slot by default
  const defaultSlot =
    slots.find((s) => !s.disabled)?.id || "tomorrow-morning";
  const [selectedSlot, setSelectedSlot] = useState<string>(defaultSlot);

  const allTodayPassed = React.useMemo(
    () => slots.filter((s) => s.dayType === "today").every((s) => s.disabled),
    [slots],
  );

  const [selectedDay, setSelectedDay] = useState<"today" | "tomorrow">(
    defaultSlot.startsWith("today") ? "today" : "tomorrow",
  );

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

  const handleFieldChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for that field as user types
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const res = applyPromoCode(couponInput);
    if (res.success) {
      toast.success(res.message);
      setCouponError("");
      setCouponInput("");
    } else {
      setCouponError(res.message);
      if (!shouldReduceMotion) {
        setIsCouponShaking(true);
        setTimeout(() => setIsCouponShaking(false), 500);
      }
      toast.error(res.message);
    }
  };

  const handleRemoveCoupon = () => {
    removePromoCode();
    toast.info(isEs ? "Código promocional eliminado." : "Promo code removed.");
  };

  // Form Validation using Zod
  const validateWithZod = () => {
    const parseResult = spainCheckoutSchema.safeParse(formData);

    if (!parseResult.success) {
      const errorsMap: Record<string, string> = {};
      parseResult.error.issues.forEach((err) => {
        const fieldName = String(err.path[0] || "");
        if (fieldName && !errorsMap[fieldName]) {
          errorsMap[fieldName] = err.message;
        }
      });
      setFormErrors(errorsMap);

      // Trigger user toast with the first error message
      const firstError = Object.values(errorsMap)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return false;
    }

    setFormErrors({});
    return true;
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateWithZod()) return;

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
    }, 800);
  };

  const getWhatsAppOrderUrl = () => {
    let msg = `*Nuevo Pedido en SuperBarrio España*\n\n`;
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

  // If still hydrating from localStorage, show shimmering Skeleton Loader
  if (!isLoaded) {
    return <CheckoutSkeleton />;
  }

  // Friendly Empty Cart State with Animated Illustration
  if (cart.length === 0 && !isSubmitting && !isSuccess) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        {/* Friendly Grocery Basket Illustration with subtle floating particles */}
        <div className="relative mx-auto flex h-36 w-36 items-center justify-center">
          {/* Glowing backdrop halo */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-2xl dark:bg-emerald-500/15" />

          {/* Floating Fresh Veggie & Fruit Badges */}
          <motion.div
            animate={
              shouldReduceMotion
                ? {}
                : {
                    y: [-4, 6, -4],
                    rotate: [-3, 3, -3],
                  }
            }
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-1 -start-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-md border border-amber-200/60 dark:bg-amber-950/70 dark:border-amber-900/50 dark:text-amber-400"
            title="Frutas frescas"
          >
            <FruitIcon className="h-5 w-5" />
          </motion.div>

          <motion.div
            animate={
              shouldReduceMotion
                ? {}
                : {
                    y: [6, -4, 6],
                    rotate: [4, -4, 4],
                  }
            }
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-1 -end-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-md border border-emerald-200/60 dark:bg-emerald-950/70 dark:border-emerald-900/50 dark:text-emerald-400"
            title="Productos naturales"
          >
            <LeafIcon className="h-5 w-5" />
          </motion.div>

          {/* Center Shopping Basket */}
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white shadow-2xl shadow-emerald-600/30">
            <svg
              className="h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        </div>

        <h2 className="mt-6 font-outfit text-2xl font-black text-gray-900 dark:text-white sm:text-3xl">
          {t("emptyTitle")}
        </h2>
        <p className="mx-auto mt-2.5 max-w-md text-xs sm:text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-300">
          {t("emptySubtitle")}
        </p>

        {/* Primary Action Button */}
        <div className="mt-7 flex justify-center">
          <Link
            href="/grocery"
            className="group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-7 py-4 text-xs font-black text-white shadow-xl shadow-emerald-600/35 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-2xl hover:shadow-emerald-600/45"
          >
            <span className="transition-transform group-hover:-translate-x-1 font-bold">
              ←
            </span>
            <span>{t("startShopping")}</span>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate 10% food VAT (IVA) included in Spain
  const vatAmount = Number((total - total / 1.1).toFixed(2));

  return (
    <div className="mx-auto w-full max-w-[1920px] px-4 py-6 sm:px-6 md:py-10 lg:px-8 xl:px-10 pb-28 lg:pb-10">
      {/* 1. Top Navigation & Progress Stepper */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between pb-3 sm:pb-4">
          <Link
            href="/grocery"
            className="group inline-flex items-center gap-2 text-xs font-bold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>
            <span>{t("backToStore")}</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-emerald-400/70">
            <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
            <span className="hidden sm:inline">{t("secureCheckout")}</span>
            <span className="sm:hidden">SSL 256-Bit</span>
          </div>
        </div>

        {/* Animated 4-Step Checkout Progress Stepper */}
        <div className="relative mx-auto max-w-xl pt-1">
          <div className="absolute top-1/2 start-0 end-0 -translate-y-1/2 h-0.5 bg-gray-200 dark:bg-emerald-950/80 -z-0 rounded-full" />
          <motion.div
            initial={{ width: "25%" }}
            animate={{ width: "66%" }}
            transition={shouldReduceMotion ? { duration: 0.1 } : { duration: 0.6, ease: "easeOut" }}
            className="absolute top-1/2 start-0 -translate-y-1/2 h-0.5 bg-gradient-to-r from-emerald-500 to-green-500 -z-0 rounded-full"
          />

          <div className="relative z-10 flex items-center justify-between">
            {/* Step 1: Cesta */}
            <div className="flex flex-col items-center">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-emerald-600 text-[11px] sm:text-xs font-black text-white shadow-xs">
                ✓
              </div>
              <span className="mt-1 text-[10px] sm:text-[11px] font-bold text-emerald-700 dark:text-emerald-400 text-center truncate max-w-[64px] sm:max-w-none">
                {t("stepper.basket")}
              </span>
            </div>

            {/* Step 2: Entrega (Active) */}
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 text-[11px] sm:text-xs font-black text-white shadow-md shadow-emerald-600/35 ring-3 ring-emerald-500/25">
                2
              </div>
              <span className="mt-1 text-[10px] sm:text-[11px] font-black text-emerald-700 dark:text-emerald-300 text-center truncate max-w-[64px] sm:max-w-none">
                {t("stepper.delivery")}
              </span>
            </div>

            {/* Step 3: Pago */}
            <div className="flex flex-col items-center">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 border-emerald-500/70 bg-white text-[11px] sm:text-xs font-black text-emerald-600 dark:bg-[#071910] dark:text-emerald-400 shadow-2xs">
                3
              </div>
              <span className="mt-1 text-[10px] sm:text-[11px] font-semibold text-gray-500 dark:text-gray-400 text-center truncate max-w-[64px] sm:max-w-none">
                {t("stepper.payment")}
              </span>
            </div>

            {/* Step 4: Confirmación */}
            <div className="flex flex-col items-center">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-[11px] sm:text-xs font-bold text-gray-400 dark:border-emerald-950 dark:bg-gray-800">
                4
              </div>
              <span className="mt-1 text-[10px] sm:text-[11px] font-medium text-gray-400 dark:text-gray-500 text-center truncate max-w-[64px] sm:max-w-none">
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
          className="flex w-full items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-50/90 px-4 py-3.5 text-xs font-bold text-emerald-950 shadow-sm backdrop-blur-md dark:border-emerald-950/80 dark:bg-[#071d12] dark:text-emerald-200"
          aria-expanded={isMobileSummaryOpen}
        >
          <div className="flex items-center gap-2">
            <CartIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
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
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              className="mt-2 overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-4 shadow-md dark:border-emerald-950/80 dark:bg-[#071910]"
            >
              {/* Smart max-height for mobile list */}
              <div className="divide-y divide-gray-100 dark:divide-emerald-950/60 max-h-[360px] overflow-y-auto custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2.5 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-10 w-10 rounded-xl object-cover shrink-0"
                      />
                      <div className="truncate">
                        <span className="font-bold text-gray-900 dark:text-white truncate block">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-emerald-300/60">
                          {item.quantity} x {formatPrice(item.price, locale)} ({item.unit})
                        </span>
                      </div>
                    </div>
                    <span className="font-outfit font-black text-gray-900 dark:text-white ms-2">
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
        {/* Left Column: Delivery Form, Slots, Payment (7 Columns) with Staggered Entrance */}
        <motion.div
          variants={shouldReduceMotion ? {} : containerVariants}
          initial={shouldReduceMotion ? undefined : "hidden"}
          animate={shouldReduceMotion ? undefined : "visible"}
          className="space-y-6 lg:col-span-7"
        >
          <form onSubmit={handleSubmitOrder} noValidate className="space-y-6">
            {/* Section 1: Spain Delivery Address & Contact */}
            <motion.div
              variants={shouldReduceMotion ? {} : cardVariants}
              className="rounded-2xl sm:rounded-3xl border border-gray-200/80 bg-white p-4 sm:p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] backdrop-blur-sm dark:border-emerald-950/70 dark:bg-[#071910]"
            >
              <div className="flex items-center gap-3 pb-3 sm:pb-3.5 border-b border-gray-100 dark:border-emerald-950/60">
                <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-emerald-50 text-xs font-black text-emerald-600 shadow-xs dark:bg-emerald-950/60 dark:text-emerald-400">
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

              <div className="mt-4 grid grid-cols-1 gap-3 sm:gap-3.5 sm:grid-cols-2">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="checkout-fullName"
                    className="block text-xs font-bold text-gray-700 dark:text-gray-300"
                  >
                    {t("deliverySection.fullName")}
                  </label>
                  <input
                    id="checkout-fullName"
                    name="fullName"
                    type="text"
                    required
                    autoComplete="name"
                    aria-required="true"
                    aria-invalid={!!formErrors.fullName}
                    value={formData.fullName}
                    onChange={(e) =>
                      handleFieldChange("fullName", e.target.value)
                    }
                    placeholder={t("deliverySection.fullNamePlaceholder")}
                    className={`mt-1.5 w-full rounded-2xl border px-4 py-2.5 text-xs sm:text-sm font-semibold transition focus:bg-white focus:outline-none focus-visible:ring-2 dark:bg-[#05130b] dark:text-white ${
                      formErrors.fullName
                        ? "border-rose-400 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus-visible:ring-rose-500/20 dark:border-rose-800"
                        : "border-gray-200/80 bg-gray-50/70 text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus-visible:ring-emerald-500/30 dark:border-emerald-950 dark:placeholder-emerald-400/40"
                    }`}
                  />
                  {formErrors.fullName && (
                    <span className="mt-1 block text-[11px] font-bold text-rose-600 dark:text-rose-400">
                      ⚠ {formErrors.fullName}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="checkout-email"
                    className="block text-xs font-bold text-gray-700 dark:text-gray-300"
                  >
                    {t("deliverySection.email")}
                  </label>
                  <input
                    id="checkout-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    aria-required="true"
                    aria-invalid={!!formErrors.email}
                    value={formData.email}
                    onChange={(e) =>
                      handleFieldChange("email", e.target.value)
                    }
                    placeholder={t("deliverySection.emailPlaceholder")}
                    className={`mt-1.5 w-full rounded-2xl border px-4 py-2.5 text-xs sm:text-sm font-semibold transition focus:bg-white focus:outline-none focus-visible:ring-2 dark:bg-[#05130b] dark:text-white ${
                      formErrors.email
                        ? "border-rose-400 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus-visible:ring-rose-500/20 dark:border-rose-800"
                        : "border-gray-200/80 bg-gray-50/70 text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus-visible:ring-emerald-500/30 dark:border-emerald-950 dark:placeholder-emerald-400/40"
                    }`}
                  />
                  {formErrors.email && (
                    <span className="mt-1 block text-[11px] font-bold text-rose-600 dark:text-rose-400">
                      ⚠ {formErrors.email}
                    </span>
                  )}
                </div>

                {/* Phone (+34 Spain) */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="checkout-phone"
                    className="block text-xs font-bold text-gray-700 dark:text-gray-300"
                  >
                    {t("deliverySection.phone")}
                  </label>
                  <div className="relative mt-1.5 flex items-center">
                    <span className="absolute start-3.5 inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 dark:text-emerald-400">
                      <EsFlagIcon className="h-3.5 w-4.5 rounded-[3px] shadow-2xs object-cover" />
                      <span>+34</span>
                    </span>
                    <input
                      id="checkout-phone"
                      name="tel"
                      type="tel"
                      required
                      autoComplete="tel"
                      aria-required="true"
                      aria-invalid={!!formErrors.phone}
                      value={formData.phone}
                      onChange={(e) =>
                        handleFieldChange(
                          "phone",
                          e.target.value.replace(/[^0-9\s]/g, ""),
                        )
                      }
                      placeholder={t("deliverySection.phonePlaceholder")}
                      className={`w-full rounded-2xl border py-2.5 pe-4 ps-20 text-xs sm:text-sm font-semibold transition focus:bg-white focus:outline-none focus-visible:ring-2 dark:bg-[#05130b] dark:text-white ${
                        formErrors.phone
                          ? "border-rose-400 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus-visible:ring-rose-500/20 dark:border-rose-800"
                          : "border-gray-200/80 bg-gray-50/70 text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus-visible:ring-emerald-500/30 dark:border-emerald-950 dark:placeholder-emerald-400/40"
                      }`}
                    />
                  </div>
                  {formErrors.phone ? (
                    <span className="mt-1 block text-[11px] font-bold text-rose-600 dark:text-rose-400">
                      ⚠ {formErrors.phone}
                    </span>
                  ) : (
                    <p className="mt-1 text-[11px] font-medium text-gray-400 dark:text-emerald-400/60">
                      {t("deliverySection.phoneHelp")}
                    </p>
                  )}
                </div>

                {/* Street & Number */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="checkout-street"
                    className="block text-xs font-bold text-gray-700 dark:text-gray-300"
                  >
                    {t("deliverySection.street")}
                  </label>
                  <input
                    id="checkout-street"
                    name="street-address"
                    type="text"
                    required
                    autoComplete="street-address"
                    aria-required="true"
                    aria-invalid={!!formErrors.street}
                    value={formData.street}
                    onChange={(e) =>
                      handleFieldChange("street", e.target.value)
                    }
                    placeholder={t("deliverySection.streetPlaceholder")}
                    className={`mt-1.5 w-full rounded-2xl border px-4 py-2.5 text-xs sm:text-sm font-semibold transition focus:bg-white focus:outline-none focus-visible:ring-2 dark:bg-[#05130b] dark:text-white ${
                      formErrors.street
                        ? "border-rose-400 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus-visible:ring-rose-500/20 dark:border-rose-800"
                        : "border-gray-200/80 bg-gray-50/70 text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus-visible:ring-emerald-500/30 dark:border-emerald-950 dark:placeholder-emerald-400/40"
                    }`}
                  />
                  {formErrors.street && (
                    <span className="mt-1 block text-[11px] font-bold text-rose-600 dark:text-rose-400">
                      ⚠ {formErrors.street}
                    </span>
                  )}
                </div>

                {/* Floor / Apartment */}
                <div>
                  <label
                    htmlFor="checkout-apartment"
                    className="block text-xs font-bold text-gray-700 dark:text-gray-300"
                  >
                    {t("deliverySection.apartment")}
                  </label>
                  <input
                    id="checkout-apartment"
                    type="text"
                    value={formData.apartment}
                    onChange={(e) =>
                      handleFieldChange("apartment", e.target.value)
                    }
                    placeholder={t("deliverySection.apartmentPlaceholder")}
                    className="mt-1.5 w-full rounded-2xl border border-gray-200/80 bg-gray-50/70 px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-800 placeholder-gray-400 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 dark:border-emerald-950 dark:bg-[#05130b] dark:text-white dark:placeholder-emerald-400/40"
                  />
                </div>

                {/* Postal Code (5 Digits) */}
                <div>
                  <label
                    htmlFor="checkout-postalCode"
                    className="block text-xs font-bold text-gray-700 dark:text-gray-300"
                  >
                    {t("deliverySection.postalCode")}
                  </label>
                  <input
                    id="checkout-postalCode"
                    name="postal-code"
                    type="text"
                    maxLength={5}
                    required
                    autoComplete="postal-code"
                    aria-required="true"
                    aria-invalid={!!formErrors.postalCode}
                    value={formData.postalCode}
                    onChange={(e) =>
                      handleFieldChange(
                        "postalCode",
                        e.target.value.replace(/\D/g, "").slice(0, 5),
                      )
                    }
                    placeholder={t("deliverySection.postalCodePlaceholder")}
                    className={`mt-1.5 w-full rounded-2xl border px-4 py-2.5 text-xs sm:text-sm font-semibold transition focus:bg-white focus:outline-none focus-visible:ring-2 dark:bg-[#05130b] dark:text-white ${
                      formErrors.postalCode
                        ? "border-rose-400 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus-visible:ring-rose-500/20 dark:border-rose-800"
                        : "border-gray-200/80 bg-gray-50/70 text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus-visible:ring-emerald-500/30 dark:border-emerald-950 dark:placeholder-emerald-400/40"
                    }`}
                  />
                  {formErrors.postalCode && (
                    <span className="mt-1 block text-[11px] font-bold text-rose-600 dark:text-rose-400">
                      ⚠ {formErrors.postalCode}
                    </span>
                  )}
                </div>

                {/* City */}
                <div>
                  <label
                    htmlFor="checkout-city"
                    className="block text-xs font-bold text-gray-700 dark:text-gray-300"
                  >
                    {t("deliverySection.city")}
                  </label>
                  <input
                    id="checkout-city"
                    name="city"
                    type="text"
                    required
                    autoComplete="address-level2"
                    aria-required="true"
                    aria-invalid={!!formErrors.city}
                    value={formData.city}
                    onChange={(e) =>
                      handleFieldChange("city", e.target.value)
                    }
                    placeholder={t("deliverySection.cityPlaceholder")}
                    className={`mt-1.5 w-full rounded-2xl border px-4 py-2.5 text-xs sm:text-sm font-semibold transition focus:bg-white focus:outline-none focus-visible:ring-2 dark:bg-[#05130b] dark:text-white ${
                      formErrors.city
                        ? "border-rose-400 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus-visible:ring-rose-500/20 dark:border-rose-800"
                        : "border-gray-200/80 bg-gray-50/70 text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus-visible:ring-emerald-500/30 dark:border-emerald-950 dark:placeholder-emerald-400/40"
                    }`}
                  />
                  {formErrors.city && (
                    <span className="mt-1 block text-[11px] font-bold text-rose-600 dark:text-rose-400">
                      ⚠ {formErrors.city}
                    </span>
                  )}
                </div>

                {/* Province Dropdown */}
                <div>
                  <label
                    htmlFor="checkout-province"
                    className="block text-xs font-bold text-gray-700 dark:text-gray-300"
                  >
                    {t("deliverySection.province")}
                  </label>
                  <select
                    id="checkout-province"
                    name="province"
                    value={formData.province}
                    onChange={(e) =>
                      handleFieldChange("province", e.target.value)
                    }
                    className="mt-1.5 w-full rounded-2xl border border-gray-200/80 bg-gray-50/70 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-800 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 dark:border-emerald-950 dark:bg-[#05130b] dark:text-white"
                  >
                    {SPAIN_PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick City Suggestions */}
                <div className="sm:col-span-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 shrink-0">
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
                      className="shrink-0 rounded-lg border border-emerald-500/20 bg-emerald-50/70 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-emerald-800 transition hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-600"
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {/* Delivery Instructions */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="checkout-notes"
                    className="block text-xs font-bold text-gray-700 dark:text-gray-300"
                  >
                    {t("deliverySection.instructions")}
                  </label>
                  <input
                    id="checkout-notes"
                    type="text"
                    value={formData.notes}
                    onChange={(e) =>
                      handleFieldChange("notes", e.target.value)
                    }
                    placeholder={t("deliverySection.instructionsPlaceholder")}
                    className="mt-1.5 w-full rounded-2xl border border-gray-200/80 bg-gray-50/70 px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-800 placeholder-gray-400 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 dark:border-emerald-950 dark:bg-[#05130b] dark:text-white dark:placeholder-emerald-400/40"
                  />
                </div>

                {/* Checkboxes: Save Data & Guest Account */}
                <div className="sm:col-span-2 space-y-2 pt-2 border-t border-gray-100 dark:border-emerald-950/60">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300 select-none">
                    <input
                      type="checkbox"
                      checked={formData.saveData}
                      onChange={(e) =>
                        handleFieldChange("saveData", e.target.checked)
                      }
                      className="h-4 w-4 rounded-md border-gray-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                    />
                    <span>{t("deliverySection.saveData")}</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300 select-none">
                    <input
                      type="checkbox"
                      checked={formData.createAccount}
                      onChange={(e) =>
                        handleFieldChange("createAccount", e.target.checked)
                      }
                      className="h-4 w-4 rounded-md border-gray-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                    />
                    <span>{t("deliverySection.createAccount")}</span>
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Section 2: Preferred Delivery Slot with Day Tabs */}
            <motion.div
              variants={shouldReduceMotion ? {} : cardVariants}
              className="rounded-2xl sm:rounded-3xl border border-gray-200/80 bg-white p-4 sm:p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] backdrop-blur-sm dark:border-emerald-950/70 dark:bg-[#071910]"
            >
              <div className="flex items-center gap-3 pb-3 sm:pb-3.5 border-b border-gray-100 dark:border-emerald-950/60">
                <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-emerald-50 text-xs font-black text-emerald-600 shadow-xs dark:bg-emerald-950/60 dark:text-emerald-400">
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

              {/* Day Tab Switcher (Hoy vs Mañana) */}
              <div className="mt-3.5 flex rounded-xl bg-gray-100/90 p-1 dark:bg-[#05130b] border border-gray-200/60 dark:border-emerald-950/60">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDay("today");
                    const firstToday = slots.find((s) => s.dayType === "today" && !s.disabled);
                    if (firstToday) setSelectedSlot(firstToday.id);
                  }}
                  className={`flex-1 rounded-lg py-2 text-xs font-black transition-all ${
                    selectedDay === "today"
                      ? "bg-white text-emerald-700 shadow-xs dark:bg-emerald-900/60 dark:text-emerald-200"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  {t("slotSection.today")} {allTodayPassed ? `(${t("slotSection.passed")})` : ""}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDay("tomorrow");
                    const firstTomorrow = slots.find((s) => s.dayType === "tomorrow" && !s.disabled);
                    if (firstTomorrow) setSelectedSlot(firstTomorrow.id);
                  }}
                  className={`flex-1 rounded-lg py-2 text-xs font-black transition-all ${
                    selectedDay === "tomorrow"
                      ? "bg-white text-emerald-700 shadow-xs dark:bg-emerald-900/60 dark:text-emerald-200"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  {t("slotSection.tomorrow")}
                </button>
              </div>

              {/* 4 Slots for Selected Day in 2-Column Responsive Grid */}
              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {slots
                  .filter((s) => s.dayType === selectedDay)
                  .map((slot) => {
                    const isChecked = selectedSlot === slot.id;
                    const isDisabled = slot.disabled;

                    return (
                      <motion.div
                        key={slot.id}
                        whileHover={!isDisabled && !shouldReduceMotion ? { scale: 1.01 } : {}}
                        whileTap={!isDisabled && !shouldReduceMotion ? { scale: 0.99 } : {}}
                        onClick={() => !isDisabled && setSelectedSlot(slot.id)}
                        className={`relative flex items-center justify-between rounded-xl border p-3 transition-all duration-200 select-none ${
                          isDisabled
                            ? "opacity-45 bg-gray-100/60 border-gray-200 cursor-not-allowed dark:bg-gray-900/40 dark:border-emerald-950/40"
                            : isChecked
                            ? "cursor-pointer border-emerald-500 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/25 dark:border-emerald-500 dark:bg-emerald-950/40"
                            : "cursor-pointer border-gray-200/80 bg-white hover:border-emerald-300 dark:border-emerald-950 dark:bg-[#05130b] dark:hover:border-emerald-800"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-outfit text-sm font-black text-gray-900 dark:text-white">
                              {slot.timeRange}
                            </span>
                            {slot.periodLabel && (
                              <span className="rounded-md bg-emerald-100/70 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                                {slot.periodLabel}
                              </span>
                            )}
                          </div>
                          {isDisabled && (
                            <span className="mt-0.5 block text-[10px] font-bold text-rose-500 dark:text-rose-400">
                              {t("slotSection.passed")}
                            </span>
                          )}
                        </div>

                        {/* Custom Radio with Green Border & Check Icon */}
                        <div className="ms-2 flex h-5 w-5 shrink-0 items-center justify-center">
                          {isChecked ? (
                            <motion.div
                              initial={shouldReduceMotion ? { scale: 1 } : { scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 350, damping: 20 }}
                              className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs"
                            >
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </motion.div>
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-gray-300 dark:border-emerald-950 bg-white dark:bg-gray-800" />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
              </div>

              <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                <BoltIcon className="h-3.5 w-3.5 text-amber-500 fill-current shrink-0" />
                <span>{t("slotSection.expressNotice")}</span>
              </p>
            </motion.div>

            {/* Section 3: Spain Payment Methods */}
            <motion.div
              variants={shouldReduceMotion ? {} : cardVariants}
              className="rounded-2xl sm:rounded-3xl border border-gray-200/80 bg-white p-4 sm:p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] backdrop-blur-sm dark:border-emerald-950/70 dark:bg-[#071910]"
            >
              <div className="flex items-center gap-3 pb-3 sm:pb-3.5 border-b border-gray-100 dark:border-emerald-950/60">
                <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-emerald-50 text-xs font-black text-emerald-600 shadow-xs dark:bg-emerald-950/60 dark:text-emerald-400">
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

              <div className="mt-3.5 space-y-2.5">
                {/* 1. Credit / Debit Card (Visa, Mastercard) */}
                <motion.div
                  whileHover={shouldReduceMotion ? {} : { scale: 1.008 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.992 }}
                  onClick={() => setPaymentMethod("card")}
                  className={`flex cursor-pointer items-center justify-between rounded-xl sm:rounded-2xl border p-3 sm:p-3.5 transition-all duration-200 ${
                    paymentMethod === "card"
                      ? "border-emerald-500 bg-emerald-50/60 shadow-xs ring-2 ring-emerald-500/25 dark:border-emerald-500 dark:bg-emerald-950/40"
                      : "border-gray-200/80 bg-white hover:border-gray-300 dark:border-emerald-950 dark:bg-[#05130b]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-2xs dark:bg-emerald-950/60 dark:text-emerald-400">
                      <CreditCardIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1 pe-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-outfit text-sm font-black text-gray-900 dark:text-white">
                          {t("paymentSection.card")}
                        </span>
                        <span className="rounded-md bg-emerald-100/70 px-1.5 py-0.5 text-[9px] font-black text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                          VISA
                        </span>
                        <span className="rounded-md bg-amber-100/70 px-1.5 py-0.5 text-[9px] font-black text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                          Mastercard
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate sm:whitespace-normal">
                        {t("paymentSection.cardDesc")}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 ms-2">
                    {paymentMethod === "card" ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-gray-300 dark:border-emerald-950 bg-white dark:bg-gray-800" />
                    )}
                  </div>
                </motion.div>

                {/* 2. Bizum (Famous Spain mobile instant payment) */}
                <motion.div
                  whileHover={shouldReduceMotion ? {} : { scale: 1.008 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.992 }}
                  onClick={() => setPaymentMethod("bizum")}
                  className={`flex cursor-pointer items-center justify-between rounded-xl sm:rounded-2xl border p-3 sm:p-3.5 transition-all duration-200 ${
                    paymentMethod === "bizum"
                      ? "border-emerald-500 bg-emerald-50/60 shadow-xs ring-2 ring-emerald-500/25 dark:border-emerald-500 dark:bg-emerald-950/40"
                      : "border-gray-200/80 bg-white hover:border-gray-300 dark:border-emerald-950 dark:bg-[#05130b]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-[#00A99D]/10 text-[#00A99D] font-black text-xs shadow-2xs">
                      bizum
                    </div>
                    <div className="min-w-0 flex-1 pe-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-outfit text-sm font-black text-gray-900 dark:text-white">
                          {t("paymentSection.bizum")}
                        </span>
                        <span className="rounded-full bg-[#00A99D]/15 px-2 py-0.5 text-[9px] font-extrabold text-[#00A99D]">
                          España
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate sm:whitespace-normal">
                        {t("paymentSection.bizumDesc")}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 ms-2">
                    {paymentMethod === "bizum" ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-gray-300 dark:border-emerald-950 bg-white dark:bg-gray-800" />
                    )}
                  </div>
                </motion.div>

                {/* 3. PayPal */}
                <motion.div
                  whileHover={shouldReduceMotion ? {} : { scale: 1.008 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.992 }}
                  onClick={() => setPaymentMethod("paypal")}
                  className={`flex cursor-pointer items-center justify-between rounded-xl sm:rounded-2xl border p-3 sm:p-3.5 transition-all duration-200 ${
                    paymentMethod === "paypal"
                      ? "border-emerald-500 bg-emerald-50/60 shadow-xs ring-2 ring-emerald-500/25 dark:border-emerald-500 dark:bg-emerald-950/40"
                      : "border-gray-200/80 bg-white hover:border-gray-300 dark:border-emerald-950 dark:bg-[#05130b]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 font-black text-xs shadow-2xs dark:bg-blue-950/60 dark:text-blue-300">
                      PayPal
                    </div>
                    <div className="min-w-0 flex-1 pe-2">
                      <span className="font-outfit text-sm font-black text-gray-900 dark:text-white">
                        {t("paymentSection.paypal")}
                      </span>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate sm:whitespace-normal">
                        {t("paymentSection.paypalDesc")}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 ms-2">
                    {paymentMethod === "paypal" ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-gray-300 dark:border-emerald-950 bg-white dark:bg-gray-800" />
                    )}
                  </div>
                </motion.div>

                {/* 4. Apple Pay / Google Pay */}
                <motion.div
                  whileHover={shouldReduceMotion ? {} : { scale: 1.008 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.992 }}
                  onClick={() => setPaymentMethod("apple_google")}
                  className={`flex cursor-pointer items-center justify-between rounded-xl sm:rounded-2xl border p-3 sm:p-3.5 transition-all duration-200 ${
                    paymentMethod === "apple_google"
                      ? "border-emerald-500 bg-emerald-50/60 shadow-xs ring-2 ring-emerald-500/25 dark:border-emerald-500 dark:bg-emerald-950/40"
                      : "border-gray-200/80 bg-white hover:border-gray-300 dark:border-emerald-950 dark:bg-[#05130b]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-900 font-black text-xs shadow-2xs dark:bg-gray-800 dark:text-white">
                       / G
                    </div>
                    <div className="min-w-0 flex-1 pe-2">
                      <span className="font-outfit text-sm font-black text-gray-900 dark:text-white">
                        {t("paymentSection.appleGoogle")}
                      </span>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate sm:whitespace-normal">
                        {t("paymentSection.appleGoogleDesc")}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 ms-2">
                    {paymentMethod === "apple_google" ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-gray-300 dark:border-emerald-950 bg-white dark:bg-gray-800" />
                    )}
                  </div>
                </motion.div>

                {/* 5. Efectivo al recibir (Cash on Delivery) */}
                <motion.div
                  whileHover={shouldReduceMotion ? {} : { scale: 1.008 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.992 }}
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex cursor-pointer items-center justify-between rounded-xl sm:rounded-2xl border p-3 sm:p-3.5 transition-all duration-200 ${
                    paymentMethod === "cod"
                      ? "border-emerald-500 bg-emerald-50/60 shadow-xs ring-2 ring-emerald-500/25 dark:border-emerald-500 dark:bg-emerald-950/40"
                      : "border-gray-200/80 bg-white hover:border-gray-300 dark:border-emerald-950 dark:bg-[#05130b]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shadow-2xs dark:bg-amber-950/60 dark:text-amber-400">
                      <DollarLineIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1 pe-2">
                      <span className="font-outfit text-sm font-black text-gray-900 dark:text-white">
                        {t("paymentSection.cod")}
                      </span>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate sm:whitespace-normal">
                        {t("paymentSection.codDesc")}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 ms-2">
                    {paymentMethod === "cod" ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-gray-300 dark:border-emerald-950 bg-white dark:bg-gray-800" />
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Desktop Place Order Button (Brand Fresh Green Gradient) */}
            <div className="hidden lg:block pt-2">
              <motion.button
                type="submit"
                disabled={isSubmitting || isSuccess}
                whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 py-4.5 text-center font-outfit text-base font-black text-white shadow-xl shadow-emerald-600/35 transition-all duration-200 hover:shadow-2xl hover:shadow-emerald-600/45 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
            <div className="pt-1">
              <a
                href={getWhatsAppOrderUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-full items-center justify-center gap-2 rounded-xl border border-[#25D366]/50 bg-white py-2.5 px-3 text-xs font-black text-[#128C7E] shadow-2xs transition-all hover:border-[#25D366] hover:bg-[#25D366]/10 dark:bg-[#071910] dark:text-emerald-300"
              >
                <WhatsAppIcon className="h-4 w-4 fill-current transition-transform group-hover:scale-110" />
                <span>{t("summary.orderViaWhatsApp")}</span>
              </a>
              <p className="mt-1 text-center text-[10px] sm:text-[11px] font-medium text-gray-400">
                {t("summary.whatsAppSubtitle")}
              </p>
            </div>
          </form>
        </motion.div>

        {/* Right Column: Sticky Order Summary (5 Columns) */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 rounded-2xl sm:rounded-3xl border border-gray-200/80 bg-white p-4 sm:p-6 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.08)] backdrop-blur-sm dark:border-emerald-950/70 dark:bg-[#071910]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 sm:pb-3.5 border-b border-gray-100 dark:border-emerald-950/60">
              <h3 className="font-outfit text-base font-black text-gray-900 dark:text-white">
                {t("summary.title")}
              </h3>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-black text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                {t("summary.itemsCount", { count: cart.length })}
              </span>
            </div>

            {/* Free Delivery Tracker (25 € threshold) */}
            <div className="my-3 rounded-xl border border-emerald-500/30 bg-emerald-50/60 p-2.5 sm:p-3 dark:border-emerald-950/80 dark:bg-emerald-950/30">
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
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-emerald-200/70 dark:bg-gray-800">
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

            {/* Items list with Smart Height */}
            <div
              className={`divide-y divide-gray-100 dark:divide-emerald-950/60 ${
                cart.length > 5
                  ? "max-h-[340px] overflow-y-auto custom-scrollbar pe-1"
                  : "max-h-none"
              }`}
            >
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2.5 sm:py-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pe-2">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-emerald-950/60">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 truncate">
                      <h5 className="font-bold text-gray-900 dark:text-white truncate">
                        {item.name}
                      </h5>
                      <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-emerald-300/60">
                        {item.unit} • {formatPrice(item.price, locale)}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex shrink-0 items-center gap-1.5 ms-1">
                    <div className="flex items-center rounded-lg border border-gray-200/80 bg-gray-50/80 dark:border-emerald-950 dark:bg-emerald-950/40">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        aria-label={`Disminuir cantidad de ${item.name}`}
                        className="flex h-6 w-5 items-center justify-center font-black text-gray-600 hover:bg-gray-200/60 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-emerald-900/40"
                      >
                        -
                      </button>
                      <span className="w-4 text-center font-black text-gray-900 dark:text-white text-[10px]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        aria-label={`Aumentar cantidad de ${item.name}`}
                        className="flex h-6 w-5 items-center justify-center font-black text-gray-600 hover:bg-gray-200/60 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-emerald-900/40"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-outfit font-black text-xs text-gray-900 dark:text-white min-w-12 text-end">
                      {formatPrice(item.price * item.quantity, locale)}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Eliminar ${item.name} de la cesta`}
                      className="text-gray-400 hover:text-rose-500 transition px-1 text-xs"
                      title="Eliminar artículo"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Box with Green Apply Button & Shake on Error */}
            <div className="mt-4 border-t border-gray-100 pt-3.5 dark:border-emerald-950/60">
              {discountAmount > 0 ? (
                <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-black">
                      {promoCode} (20% OFF)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="font-bold text-rose-500 hover:underline text-[11px]"
                  >
                    ✕ Eliminar
                  </button>
                </div>
              ) : (
                <motion.form
                  onSubmit={handleApplyCoupon}
                  animate={
                    isCouponShaking && !shouldReduceMotion
                      ? { x: [0, -8, 8, -6, 6, 0] }
                      : { x: 0 }
                  }
                  transition={{ duration: 0.4 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <label htmlFor="checkout-coupon" className="sr-only">
                      {t("summary.promoPlaceholder")}
                    </label>
                    <input
                      id="checkout-coupon"
                      name="coupon"
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder={t("summary.promoPlaceholder")}
                      className="flex-1 rounded-xl border border-gray-200 bg-gray-50/70 px-3 py-2 text-xs font-black uppercase tracking-wider text-gray-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-emerald-950 dark:bg-[#05130b] dark:text-white"
                    />
                    {/* Brand Green Apply Button */}
                    <button
                      type="submit"
                      className="rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-3.5 py-2 text-xs font-black text-white shadow-md shadow-emerald-600/25 transition hover:from-emerald-700 hover:to-green-700 active:scale-95"
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
            <div className="mt-4 space-y-2 border-t border-gray-100 pt-3.5 text-xs font-semibold text-gray-600 dark:border-emerald-950/60 dark:text-gray-400">
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

              <div className="flex justify-between text-[11px] text-gray-400 dark:text-emerald-400/50">
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
                  initial={{ scale: shouldReduceMotion ? 1 : 0.85 }}
                  animate={{ scale: 1 }}
                  className="font-outfit text-2xl font-black text-emerald-600 dark:text-emerald-400"
                >
                  {formatPrice(total, locale)}
                </motion.span>
              </div>
            </div>

            {/* Satisfaction Guarantee */}
            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-gray-50/80 p-3 text-[11px] font-medium text-gray-600 dark:bg-[#05130b] dark:text-emerald-300/80">
              <ShieldCheckIcon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{t("summary.guarantee")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Place Order Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-gray-200/90 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl backdrop-blur-xl dark:border-emerald-950/90 dark:bg-[#071910]/95">
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
            className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 py-3.5 text-center font-outfit text-sm font-black text-white shadow-lg shadow-emerald-600/30 transition active:scale-95 disabled:opacity-50"
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
