"use client";

import React, { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { CustomerOrder } from "@/types/grocery";
import Badge from "@/components/ui/badge/Badge";
import { WhatsAppIcon, BoxIcon, TruckIcon, HomeIcon, MapPinIcon } from "@/icons";
import { useLocale } from "next-intl";
import { formatPrice } from "@/utils/currency";

export const OrderSuccessView: React.FC = () => {
  const locale = useLocale();
  const isEs = locale === "es";
  const [order, setOrder] = useState<CustomerOrder | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("tailgrocery_last_order");
      if (stored) {
        const parsed = JSON.parse(stored);
        queueMicrotask(() => setOrder(parsed));
      }
    } catch {
      // Ignore
    }
  }, []);

  const orderId = order?.orderId || "ES-583921";
  const items = order?.items || [];
  const total = order?.total || 24.5;
  const address = order?.address || "Calle Gran Vía, 28, 3º B, 28013 Madrid";
  const slot = order?.deliverySlot || "Hoy - 17:00 - 20:00 (Tarde)";

  const getPaymentMethodLabel = () => {
    switch (order?.paymentMethod) {
      case "bizum":
        return "Bizum";
      case "card":
        return isEs ? "Tarjeta Bancaria" : "Credit/Debit Card";
      case "paypal":
        return "PayPal";
      case "apple_google":
        return "Apple Pay / Google Pay";
      case "cod":
      default:
        return isEs ? "Efectivo al recibir" : "Cash on Delivery";
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 md:py-14">
      {/* Success Card */}
      <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xl sm:p-10 text-center dark:border-emerald-950/60 dark:bg-[#071910]">
        {/* Animated Green Badge */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60 dark:bg-emerald-950/60 dark:text-emerald-400 dark:ring-emerald-950/30">
          <svg
            className="h-10 w-10 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <div className="mt-4">
          <Badge variant="light" color="success" size="md">
            {isEs ? "✓ Pedido Confirmado en España" : "✓ Order Confirmed in Spain"}
          </Badge>
        </div>

        <h1 className="mt-3 font-outfit text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
          {isEs ? "¡Muchas gracias! Tu compra está en marcha." : "Thank you! Your order is placed."}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          {isEs
            ? "Hemos recibido tu pedido en SuperBarrio España. Nuestro equipo está seleccionando a mano los productos más frescos para ti."
            : "We have received your grocery order at SuperBarrio Spain. Our warehouse team is currently hand-picking the freshest items for you."}
        </p>

        {/* Order Details Banner */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-gray-100 bg-gray-50/80 p-4 text-xs dark:border-emerald-950/60 dark:bg-[#05130b]">
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">
              {isEs ? "Número de Pedido" : "Order ID"}
            </span>
            <span className="font-black text-gray-900 dark:text-white">
              #{orderId}
            </span>
          </div>
          <span className="text-gray-300 dark:text-gray-700 hidden sm:inline">|</span>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">
              {isEs ? "Franja de Entrega" : "Estimated Arrival"}
            </span>
            <span className="font-black text-emerald-600 dark:text-emerald-400">
              {slot}
            </span>
          </div>
          <span className="text-gray-300 dark:text-gray-700 hidden sm:inline">|</span>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">
              {isEs ? "Método y Total" : "Payment & Total"}
            </span>
            <span className="font-black text-gray-900 dark:text-white">
              {getPaymentMethodLabel()} ({formatPrice(total, locale)})
            </span>
          </div>
        </div>

        {/* Live Delivery Tracker Timeline */}
        <div className="mt-8 border-t border-gray-100 pt-8 dark:border-emerald-950/60 text-start">
          <h3 className="font-outfit text-sm font-black text-gray-900 dark:text-white">
            {isEs ? "Estado en Vivo del Envío" : "Live Order Status"}
          </h3>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
            {/* Step 1 */}
            <div className="flex flex-col items-start gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-black text-white shadow-xs">
                ✓
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  {isEs ? "Pedido Recibido" : "Order Placed"}
                </h4>
                <p className="text-[11px] text-gray-400">
                  {isEs ? "Confirmado en sistema" : "Received at system"}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-start gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-black text-white shadow-xs ring-4 ring-emerald-500/20 animate-pulse">
                <BoxIcon className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {isEs ? "Preparando en Almacén" : "Packing Items"}
                </h4>
                <p className="text-[11px] text-gray-400">
                  {isEs ? "Control de calidad activo" : "Quality check active"}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-start gap-2 opacity-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <TruckIcon className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-white">
                  {isEs ? "En Reparto Isotérmico" : "On the Way"}
                </h4>
                <p className="text-[11px] text-gray-400">
                  {isEs ? "Cadena de frío" : "Rider assigned"}
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-start gap-2 opacity-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <HomeIcon className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-white">
                  {isEs ? "Entregado en Casa" : "Delivered"}
                </h4>
                <p className="text-[11px] text-gray-400">
                  {isEs ? "En tu puerta" : "At your doorstep"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Address Details */}
        <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 text-start text-xs dark:border-emerald-950/60 dark:bg-[#05130b]">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-bold text-gray-700 dark:text-gray-300">
              <MapPinIcon className="h-4 w-4 text-emerald-600" />
              <span>{isEs ? "Dirección de entrega en España:" : "Delivering to:"}</span>
            </span>
            <span className="text-gray-700 dark:text-gray-300 font-semibold">{address}</span>
          </div>
          {items.length > 0 && (
            <div className="mt-3 border-t border-gray-200/80 pt-3 dark:border-emerald-950/60">
              <span className="block font-bold text-gray-700 dark:text-gray-300 mb-2">
                {isEs ? `Artículos del Pedido (${items.length}):` : `Order Items (${items.length}):`}
              </span>
              <div className="flex flex-wrap gap-2">
                {items.map((it) => (
                  <span
                    key={it.id}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-800 dark:border-emerald-950 dark:bg-[#071910] dark:text-gray-200"
                  >
                    {it.imageUrl && (
                      <img
                        src={it.imageUrl}
                        alt={it.name}
                        className="h-4 w-4 rounded object-cover"
                        loading="lazy"
                      />
                    )}
                    <span>
                      {it.quantity}x {it.name}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/grocery"
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-3.5 text-xs font-black text-white shadow-lg shadow-emerald-600/30 transition hover:scale-105 active:scale-95 sm:w-auto"
          >
            ← {isEs ? "Seguir Comprando" : "Order More Groceries"}
          </Link>
          <Link
            href="/dashboard"
            className="w-full rounded-2xl border border-gray-200 bg-white px-6 py-3.5 text-xs font-bold text-gray-700 shadow-xs transition hover:bg-gray-50 sm:w-auto dark:border-emerald-950 dark:bg-[#071910] dark:text-gray-200 dark:hover:bg-emerald-950/60"
          >
            {isEs ? "Panel de Control" : "Go to Admin Dashboard"}
          </Link>
        </div>

        {/* WhatsApp Spain Support Link */}
        <div className="mt-5 flex justify-center">
          <a
            href={`https://wa.me/34612345678?text=${encodeURIComponent(
              `¡Hola SuperBarrio España! He realizado el pedido #${orderId}. ¿Podrían actualizarme sobre el estado del reparto?`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-[#25D366]/10 px-4 py-2.5 text-xs font-bold text-[#128C7E] transition hover:bg-[#25D366] hover:text-white dark:bg-[#25D366]/20 dark:text-emerald-300 dark:hover:bg-[#25D366] dark:hover:text-white"
          >
            <WhatsAppIcon className="h-4 w-4 fill-current" />
            <span>{isEs ? "Atención al Cliente por WhatsApp (+34)" : "Track / Chat on WhatsApp"}</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessView;
