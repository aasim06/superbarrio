"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Building2, ArrowLeft, Scale, Shield, FileCheck, CheckCircle } from "lucide-react";

export default function AvisoLegalPage() {
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
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-outfit text-2xl font-black text-gray-900 dark:text-white sm:text-3xl">
              {isEs ? "Aviso Legal y Datos Identificativos" : "Legal Notice"}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isEs
                ? "Conforme al artículo 10 de la Ley 34/2002 de Servicios de la Sociedad de la Información (LSSI-CE)"
                : "In compliance with Article 10 of Spanish Law 34/2002 (LSSI-CE)"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-10 space-y-8 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
        {/* Section 1: Datos Identificativos */}
        <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-emerald-950/60 dark:bg-[#071910]">
          <h2 className="font-outfit text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>1. Datos del Titular de la Web</span>
          </h2>
          <p>
            En cumplimiento del deber de información contemplado en el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se facilitan a continuación los datos del titular:
          </p>
          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-emerald-950 dark:bg-[#05130b] space-y-1.5 text-[11px]">
            <p><strong>Titular:</strong> SuperBarrio España S.L.</p>
            <p><strong>Número de Identificación Fiscal (NIF / CIF):</strong> B-87654321</p>
            <p><strong>Domicilio Social:</strong> Calle Gran Vía, 28, 28013 Madrid, España</p>
            <p><strong>Datos Registrales:</strong> Registro Mercantil de Madrid, Tomo 34.567, Folio 89, Sección 8, Hoja M-621840</p>
            <p><strong>Actividad Mercantil:</strong> Comercio al por menor y distribución online de productos de alimentación, bebidas y droguería a domicilio (CNAE 4711 / 4791)</p>
            <p><strong>Email de contacto:</strong> <a href="mailto:hola@superbarrio.es" className="text-emerald-600 underline">hola@superbarrio.es</a></p>
            <p><strong>Teléfono / WhatsApp de atención:</strong> +34 612 345 678</p>
          </div>
        </section>

        {/* Section 2: Objeto y Ámbito */}
        <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-emerald-950/60 dark:bg-[#071910]">
          <h2 className="font-outfit text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>2. Condiciones de Acceso y Uso del Servicio</span>
          </h2>
          <p>
            El presente Aviso Legal regula el acceso, navegación y uso del sitio web de SuperBarrio. La condición de usuario se adquiere mediante la navegación por el portal y atribuye la aceptación plena y sin reservas de todas y cada una de las disposiciones incluidas en este aviso.
          </p>
          <p>
            El usuario se compromete a hacer un uso adecuado de los contenidos y servicios (tales como la selección de productos de cesta, realización de pedidos, y solicitud de asistencia vía chatbot/WhatsApp), no empleándolos para incurrir en actividades ilícitas o contrarias a la buena fe y al orden público.
          </p>
        </section>

        {/* Section 3: Propiedad Intelectual */}
        <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-emerald-950/60 dark:bg-[#071910]">
          <h2 className="font-outfit text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>3. Propiedad Intelectual e Industrial</span>
          </h2>
          <p>
            Todos los contenidos del portal (incluyendo, a título enunciativo, marcas comerciales, logotipos, denominaciones de fantasía "SuperBarrio", software, código fuente, fotografías de productos, textos y diseño gráfico) son propiedad de SuperBarrio España S.L. o de terceros que han autorizado legítimamente su uso, estando protegidos por la legislación española e internacional sobre propiedad intelectual e industrial.
          </p>
        </section>

        {/* Section 4: Precios e IVA */}
        <section className="space-y-3 rounded-2xl border border-emerald-500/20 bg-emerald-50/30 p-5 dark:border-emerald-950 dark:bg-[#05130b]">
          <h2 className="font-outfit text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>4. Precios, Impuestos (IVA) y Moneda</span>
          </h2>
          <p className="text-[11px] text-gray-600 dark:text-gray-400">
            De conformidad con la normativa de consumo española y la Ley General Tributaria, todos los precios mostrados en el catálogo de SuperBarrio se expresan en <strong>Euros (€)</strong> e <strong>incluyen el Impuesto sobre el Valor Añadido (IVA)</strong> correspondiente según la naturaleza de cada alimento: 4% (superreducido: pan, huevos, leche, harina), 10% (reducido: alimentación general, aceites, carnes, frutas) y 21% (general: refrescos, bebidas alcohólicas y droguería).
          </p>
        </section>

        {/* Section 5: Legislación y Jurisdicción */}
        <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-emerald-950/60 dark:bg-[#071910]">
          <h2 className="font-outfit text-base font-bold text-gray-900 dark:text-white">
            5. Legislación Aplicable y Fuero Judicial
          </h2>
          <p>
            Las relaciones establecidas entre SuperBarrio España S.L. y los usuarios de la plataforma se regirán por la normativa española vigente. Para la resolución de cualquier controversia o discrepancia, las partes se someten a los <strong>Juzgados y Tribunales de la ciudad de Madrid (España)</strong>, sin perjuicio de los fueros imperativos aplicables a consumidores y usuarios según el Real Decreto Legislativo 1/2007.
          </p>
        </section>
      </div>
    </div>
  );
}
