"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { ShoppingBag, ArrowLeft, Truck, RefreshCw, CreditCard, ShieldCheck } from "lucide-react";

export default function TerminosPage() {
  const locale = useLocale();
  const isEs = locale === "es";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back button */}
      <Link
        href="/grocery"
        className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{isEs ? "Volver a la tienda" : "Back to grocery store"}</span>
      </Link>

      {/* Header */}
      <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-50/60 to-white p-6 dark:border-emerald-950/80 dark:from-emerald-950/30 dark:to-[#071910] sm:p-8">
        <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-outfit text-2xl font-black text-gray-900 dark:text-white sm:text-3xl">
              {isEs ? "Términos y Condiciones de Compra" : "Terms & Conditions"}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isEs
                ? "Condiciones generales de contratación y entrega a domicilio de supermercado"
                : "General sales terms and home delivery conditions"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-10 space-y-8 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
        {/* Section 1 */}
        <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-emerald-950/60 dark:bg-[#071910]">
          <h2 className="font-outfit text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>1. Objeto del Servicio</span>
          </h2>
          <p>
            Las presentes Condiciones Generales de Contratación regulan la compraventa a distancia de productos de alimentación, bebidas, productos frescos de huerta y droguería a través del supermercado online SuperBarrio, operado por SuperBarrio España S.L.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-emerald-950/60 dark:bg-[#071910]">
          <h2 className="font-outfit text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>2. Envíos, Plazos de Entrega y Cadena de Frío</span>
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[11px]">
            <li>
              <strong>Tiempo de entrega:</strong> Los repartos express se realizan en un tiempo estimado de 25 a 30 minutos desde la confirmación del pedido, dentro del radio operativo de reparto de nuestras tiendas.
            </li>
            <li>
              <strong>Cadena de frío garantizada:</strong> Todos los alimentos refrigerados (lácteos, carnes, pescados) y congelados se transportan en cajas isotérmicas y vehículos refrigerados cumpliendo la normativa higiénico-sanitaria española y comunitaria.
            </li>
            <li>
              <strong>Gastos de envío:</strong> El envío es <strong>gratuito</strong> en pedidos iguales o superiores a 25,00€. Para pedidos inferiores, se aplicará una tarifa estándar de entrega express indicada en la pantalla de pago antes de confirmar la compra.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-emerald-950/60 dark:bg-[#071910]">
          <h2 className="font-outfit text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>3. Formas de Pago Seguras</span>
          </h2>
          <p>
            SuperBarrio ofrece métodos de pago adaptados a los hábitos del consumidor en España:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
            <div className="rounded-xl border border-gray-200 p-3 dark:border-emerald-950">
              <strong className="text-emerald-700 dark:text-emerald-400">Bizum:</strong> Pago instantáneo mediante el número de teléfono autorizado.
            </div>
            <div className="rounded-xl border border-gray-200 p-3 dark:border-emerald-950">
              <strong className="text-emerald-700 dark:text-emerald-400">Tarjeta Bancaria (TPV):</strong> Visa, Mastercard y Apple Pay mediante protocolo seguro 3D Secure con encriptación SSL de 256 bits.
            </div>
            <div className="rounded-xl border border-gray-200 p-3 dark:border-emerald-950">
              <strong className="text-emerald-700 dark:text-emerald-400">Efectivo al Repartidor:</strong> Pago en metálico contra entrega del pedido.
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-emerald-950/60 dark:bg-[#071910]">
          <h2 className="font-outfit text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>4. Política de Devoluciones y Productos Perecederos</span>
          </h2>
          <p>
            De conformidad con el <strong>artículo 103, letra d) del Real Decreto Legislativo 1/2007</strong> (Ley General para la Defensa de los Consumidores y Usuarios de España), el derecho de desistimiento no es aplicable al suministro de bienes que puedan deteriorarse o caducar con rapidez (tales como alimentos frescos, frutas, verduras, carnes, pescados, lácteos y panadería).
          </p>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/40 p-4 dark:border-emerald-950 dark:bg-[#05130b] text-[11px]">
            <strong className="text-emerald-800 dark:text-emerald-300">Garantía de Frescura 100% SuperBarrio:</strong>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              No obstante lo anterior, si al recibir su pedido cualquier alimento llega defectuoso, golpeado, en mal estado o no se corresponde con lo solicitado, nos comprometemos a su reposición inmediata gratuita o al reembolso íntegro del importe en un plazo máximo de 24 horas tras notificárnoslo con una fotografía por WhatsApp o al email <span className="font-semibold text-emerald-700 dark:text-emerald-400">hola@superbarrio.es</span>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
