import { CustomerOrder } from "@/types/grocery";
import { formatPrice } from "@/utils/currency";

export const SUPERBARRIO_WHATSAPP_NUMBER = "34632250561";

/**
 * 1. Client -> Company WhatsApp Message
 * Contains all items added to cart, name, phone, full address, pricing breakdown, and delivery request.
 */
export function formatClientToCompanyOrderMessage(
  order: CustomerOrder,
  locale = "es"
): string {
  const isEs = locale === "es";
  const dateStr = new Date(order.createdAt || Date.now()).toLocaleString(
    isEs ? "es-ES" : "en-US",
    { dateStyle: "short", timeStyle: "short" }
  );

  let msg = `🛍️ *NUEVO PEDIDO EN SUPERBARRIO ESPAÑA*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🔖 *Nº de Pedido:* #${order.orderId}\n`;
  msg += `📅 *Fecha:* ${dateStr}\n\n`;

  msg += `👤 *DATOS DEL CLIENTE:*\n`;
  msg += `• *Nombre:* ${order.customerName || "Cliente"}\n`;
  msg += `• *Teléfono:* ${order.phone}\n`;
  if (order.email) msg += `• *Email:* ${order.email}\n`;
  msg += `📍 *Dirección de Entrega:*\n${order.address}\n`;
  if (order.notes) msg += `📝 *Notas:* ${order.notes}\n`;
  msg += `\n🛒 *PRODUCTOS DEL PEDIDO (${order.items?.length || 0} artículos):*\n`;

  (order.items || []).forEach((item, idx) => {
    const itemName = (isEs ? item.name : item.nameEn) || item.name;
    const itemUnit = (isEs ? item.unit : item.unitEn) || item.unit;
    const lineTotal = formatPrice(item.price * item.quantity, locale);
    msg += `${idx + 1}. *${itemName}* (${itemUnit}) x ${item.quantity} = ${lineTotal}\n`;
  });

  msg += `\n💰 *RESUMEN DE PAGO:*\n`;
  msg += `• *Subtotal:* ${formatPrice(order.subtotal, locale)}\n`;
  if (order.discount && order.discount > 0) {
    msg += `• *Descuento${order.promoCode ? ` (${order.promoCode})` : ""}:* -${formatPrice(order.discount, locale)}\n`;
  }
  msg += `• *Gastos de Envío:* ${order.deliveryFee === 0 ? (isEs ? "GRATIS" : "FREE") : formatPrice(order.deliveryFee, locale)}\n`;
  msg += `💳 *TOTAL A PAGAR:* ${formatPrice(order.total, locale)}\n`;
  msg += `💵 *Método de Pago:* ${order.paymentMethod ? order.paymentMethod.toUpperCase() : "CONTRA REEMBOLSO"}\n`;
  msg += `⚡ *Franja de Entrega:* ${order.deliverySlot || (isEs ? "Entrega Express (25-35 min)" : "Express Delivery")}\n\n`;

  msg += isEs
    ? `¡Por favor confirmen la disponibilidad y hora estimada de llegada! Muchas gracias.`
    : `Please confirm availability and estimated arrival time! Thank you.`;

  return msg;
}

/**
 * 2. Company -> Client WhatsApp Message ("Thanks for your order!")
 * Professional confirmation and gratitude message from SuperBarrio to the customer.
 */
export function formatCompanyToClientThanksMessage(
  order: CustomerOrder,
  locale = "es"
): string {
  const isEs = locale === "es";

  let msg = `🌿 *¡GRACIAS POR TU PEDIDO EN SUPERBARRIO!* 🌿\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `¡Hola *${order.customerName || "estimado/a cliente"}*! 👋\n\n`;
  msg += isEs
    ? `Hemos recibido tu pedido con éxito y nuestro equipo ya está preparando tus alimentos frescos de primera calidad. 🍎🥦🥖\n\n`
    : `We have successfully received your order and our team is already packing your premium fresh produce. 🍎🥦🥖\n\n`;

  msg += `🔖 *Nº de Pedido:* #${order.orderId}\n`;
  msg += `📍 *Dirección de Entrega:* ${order.address}\n`;
  msg += `⚡ *Tiempo Estimado de Entrega:* 25-35 minutos\n`;
  msg += `💳 *Total a Pagar:* ${formatPrice(order.total, locale)} (${order.paymentMethod ? order.paymentMethod.toUpperCase() : "CONTRA REEMBOLSO"})\n\n`;

  msg += isEs
    ? `🛵 *Tu repartidor SuperBarrio saldrá en breve hacia tu dirección.*\n\n`
    : `🛵 *Your SuperBarrio express courier will depart shortly to your address.*\n\n`;

  msg += isEs
    ? `Si necesitas modificar algo o tienes alguna pregunta sobre tu entrega, puedes responder directamente a este mensaje de WhatsApp o llamarnos al +34 632 250 561.\n\n`
    : `If you need to make any changes or have questions about delivery, feel free to reply directly to this chat or call us at +34 632 250 561.\n\n`;

  msg += isEs
    ? `¡Muchas gracias por confiar en SuperBarrio España! 💚`
    : `Thank you for shopping with SuperBarrio Spain! 💚`;

  return msg;
}

/**
 * Generates direct wa.me URL for the client to send their order to the company
 */
export function getClientToCompanyWhatsAppUrl(
  order: CustomerOrder,
  companyPhone = SUPERBARRIO_WHATSAPP_NUMBER,
  locale = "es"
): string {
  const cleanPhone = companyPhone.replace(/^00/, "").replace(/\D/g, "");
  const msg = formatClientToCompanyOrderMessage(order, locale);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}

/**
 * Generates direct wa.me URL for the company to reply to the client with the thank-you confirmation
 */
export function getCompanyToClientWhatsAppUrl(
  order: CustomerOrder,
  locale = "es"
): string {
  const cleanPhone = (order.phone || "").replace(/^00/, "").replace(/\D/g, "");
  const msg = formatCompanyToClientThanksMessage(order, locale);
  return cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}` : "";
}
