"use client";

import React, { useState } from "react";
import { WhatsAppIcon } from "@/icons";
import { useGroceryCart } from "@/context/GroceryCartContext";
import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/utils/currency";
import { motion, useReducedMotion } from "framer-motion";

interface WhatsAppFloatingButtonProps {
  phoneNumber?: string;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({
  phoneNumber = "34612345678",
}) => {
  const t = useTranslations("grocery");
  const locale = useLocale();
  const { cart, total, discountAmount, promoCode } = useGroceryCart();
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Generate WhatsApp message based on cart state
  const generateWhatsAppUrl = () => {
    let message = `*¡Hola SuperBarrio España!*\n`;
    if (cart.length > 0) {
      message += `Me gustaría confirmar y realizar el siguiente pedido:\n\n`;
      cart.forEach((item, index) => {
        message += `${index + 1}. *${item.name}* (${item.unit}) x ${item.quantity} = ${formatPrice(item.price * item.quantity, locale)}\n`;
      });
      if (discountAmount > 0) {
        message += `\n*Código Descuento Aplicado:* ${promoCode} (-${formatPrice(discountAmount, locale)})`;
      }
      message += `\n*Total a Pagar:* ${formatPrice(total, locale)}\n`;
      message += `\n¡Por favor confirmen la disponibilidad y hora estimada de reparto! Muchas gracias.`;
    } else {
      message += `Hola, me gustaría hacer una consulta o pedido directo de alimentos frescos.`;
    }

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    // Positioned at bottom-22 on mobile to cleanly sit above the 64px mobile bottom nav, and bottom-8 on desktop
    <div className="fixed bottom-22 end-4 sm:bottom-8 sm:end-8 z-30 flex items-center">
      <motion.a
        href={generateWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={
          shouldReduceMotion
            ? {}
            : {
                scale: [1, 1.05, 1],
              }
        }
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={shouldReduceMotion ? {} : { scale: 1.08 }}
        whileTap={shouldReduceMotion ? {} : { scale: 0.94 }}
        className="group relative flex items-center gap-3 rounded-full bg-gradient-to-r from-[#25D366] to-[#1ebe5b] p-3.5 text-white shadow-[0_10px_25px_-5px_rgba(37,211,102,0.5)] transition-shadow duration-300 hover:shadow-[0_14px_30px_-5px_rgba(37,211,102,0.7)] sm:px-4.5 sm:py-3.5"
        aria-label="Pedir o consultar por WhatsApp / Chat on WhatsApp"
        title="WhatsApp SuperBarrio"
      >
        {/* Pulsing online badge */}
        <span className="absolute -top-1 -end-1 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-80" />
          <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
        </span>

        {/* WhatsApp Icon with tilt */}
        <WhatsAppIcon className="h-6 w-6 fill-current transition-transform duration-300 group-hover:rotate-12" />

        {/* Text Label */}
        <div className="hidden sm:block text-start">
          <span className="block text-[10px] font-bold tracking-wide uppercase text-emerald-100">
            WhatsApp
          </span>
          <span className="block font-outfit text-xs font-black leading-tight">
            {t("whatsappOrder")}
          </span>
        </div>

        {/* Floating Tooltip for mobile */}
        {isHovered && (
          <div className="absolute -top-10 end-0 whitespace-nowrap rounded-xl bg-gray-900 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg sm:hidden">
            {t("whatsappOrder")}
          </div>
        )}
      </motion.a>
    </div>
  );
};

export default WhatsAppFloatingButton;
