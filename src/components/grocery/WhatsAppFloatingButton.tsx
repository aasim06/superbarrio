"use client";

import React, { useState } from "react";
import { WhatsAppIcon } from "@/icons";
import { useGroceryCart } from "@/context/GroceryCartContext";
import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/utils/currency";

interface WhatsAppFloatingButtonProps {
  phoneNumber?: string;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({
  phoneNumber = "923001234567",
}) => {
  const t = useTranslations("grocery");
  const locale = useLocale();
  const { cart, total } = useGroceryCart();
  const [isHovered, setIsHovered] = useState(false);

  // Generate WhatsApp message based on cart state
  const generateWhatsAppUrl = () => {
    let message = `Hello SuperBarrio!\n`;
    if (cart.length > 0) {
      message += `I would like to order the items in my basket:\n\n`;
      cart.forEach((item, index) => {
        message += `${index + 1}. *${item.name}* (${item.unit}) x ${item.quantity} = ${formatPrice(item.price * item.quantity, locale)}\n`;
      });
      message += `\n*Total:* ${formatPrice(total, locale)}\n`;
      message += `\nPlease confirm availability and delivery time!`;
    } else {
      message += `I would like to place an order / have a question about fresh groceries.`;
    }

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="fixed bottom-6 end-6 z-40 flex items-center">
      <a
        href={generateWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center gap-2.5 rounded-full bg-[#25D366] p-3 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#20ba59] hover:shadow-xl sm:px-4 sm:py-3"
        aria-label="Order or chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        {/* Pulsing online badge */}
        <span className="absolute -top-1 -end-1 flex h-3.5 w-3.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
        </span>

        {/* WhatsApp Icon */}
        <WhatsAppIcon className="h-6 w-6 fill-current transition-transform duration-300 group-hover:rotate-12" />

        {/* Text Label */}
        <div className="hidden sm:block text-start">
          <span className="block text-[10px] font-medium leading-none text-emerald-100">
            WhatsApp
          </span>
          <span className="block text-xs font-bold leading-tight">
            {t("whatsappOrder")}
          </span>
        </div>

        {/* Floating Tooltip for mobile */}
        {isHovered && (
          <div className="absolute -top-10 end-0 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1 text-[11px] font-medium text-white shadow-md sm:hidden">
            {t("whatsappOrder")}
          </div>
        )}
      </a>
    </div>
  );
};

export default WhatsAppFloatingButton;

