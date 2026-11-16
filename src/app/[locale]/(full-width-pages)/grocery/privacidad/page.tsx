"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { ShieldCheck, ArrowLeft, Lock, FileText, CheckCircle2, UserCheck, AlertTriangle } from "lucide-react";

export default function PrivacidadPage() {
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
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-outfit text-2xl font-black text-gray-900 dark:text-white sm:text-3xl">
              {isEs ? "Política de Privacidad y Protección de Datos (RGPD)" : "Privacy Policy & GDPR"}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isEs
                ? "Conforme al Reglamento General de Protección de Datos (RGPD UE 2016/679) y LOPDGDD 3/2018 (España)"
                : "In compliance with EU GDPR 2016/679 and Spanish LOPDGDD 3/2018"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-10 space-y-8 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
        {/* Section 1: Responsable */}
        <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-emerald-950/60 dark:bg-[#071910]">
          <h2 className="font-outfit text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>1. Responsable del Tratamiento de sus Datos</span>
          </h2>
          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-emerald-950 dark:bg-[#05130b] space-y-1.5 text-[11px]">
            <p><strong>Razón Social:</strong> SuperBarrio España S.L.</p>
            <p><strong>NIF / CIF:</strong> B-87654321</p>
            <p><strong>Domicilio Social:</strong> Calle Gran Vía, 28, 28013 Madrid, España</p>
            <p><strong>Registro Mercantil:</strong> Inscrita en el Registro Mercantil de Madrid, Tomo 34.567, Folio 89, Hoja M-621840</p>
            <p><strong>Correo electrónico de contacto RGPD:</strong> <a href="mailto:privacidad@superbarrio.es" className="text-emerald-600 underline">privacidad@superbarrio.es</a></p>
            <p><strong>Teléfono de atención:</strong> +34 612 345 678</p>
          </div>
        </section>

        {/* Section 2: Finalidad */}
        <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-emerald-950/60 dark:bg-[#071910]">
          <h2 className="font-outfit text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>2. ¿Con qué Finalidad Tratamos sus Datos Personales?</span>
          </h2>
          <p>
            En SuperBarrio tratamos la información que nos facilitan los clientes con las siguientes finalidades:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[11px]">
            <li>
              <strong>Gestión y entrega de pedidos de supermercado:</strong> Tramitar la cesta de la compra, coordinar el reparto express refrigerado hasta su domicilio particular o establecimiento, y enviar notificaciones sobre el estado de la entrega.
            </li>
            <li>
              <strong>Facturación y contabilidad legal:</strong> Emisión de facturas simplificadas, albaranes de entrega y facturas completas requeridas por la normativa tributaria española (Agencia Tributaria - AEAT).
            </li>
            <li>
              <strong>Gestión de pagos y prevención del fraude:</strong> Tramitación segura de cobros mediante TPV virtual bancario, Bizum o cobro en efectivo contra entrega.
            </li>
            <li>
              <strong>Atención al cliente:</strong> Responder a sus consultas por WhatsApp, teléfono o email respecto a incidencias, devoluciones o productos de la tienda.
            </li>
            <li>
              <strong>Comunicaciones comerciales y promociones:</strong> Solo si usted lo ha autorizado expresamente (por ejemplo al suscribirse al boletín de ofertas o cupones locales).
            </li>
          </ul>
        </section>

        {/* Section 3: Base Jurídica */}
        <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-emerald-950/60 dark:bg-[#071910]">
          <h2 className="font-outfit text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>3. Base Jurídica que Legitima el Tratamiento</span>
          </h2>
          <p>
            El tratamiento de sus datos personales se fundamenta en las siguientes bases legales previstas en el Artículo 6 del RGPD:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[11px]">
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 dark:border-emerald-950 dark:bg-[#05130b]">
              <span className="font-bold text-emerald-700 dark:text-emerald-400">Ejecución del Contrato (Art. 6.1.b)</span>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Necesario para cumplir con el pedido de compra de alimentos y la entrega en su dirección.
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 dark:border-emerald-950 dark:bg-[#05130b]">
              <span className="font-bold text-emerald-700 dark:text-emerald-400">Obligación Legal (Art. 6.1.c)</span>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Cumplimiento de las obligaciones fiscales, contables y mercantiles ante la legislación española.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Conservación */}
        <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-emerald-950/60 dark:bg-[#071910]">
          <h2 className="font-outfit text-base font-bold text-gray-900 dark:text-white">
            4. Plazo de Conservación de los Datos
          </h2>
          <p>
            Los datos personales proporcionados se conservarán mientras se mantenga la relación comercial con el supermercado. Una vez finalizada la relación, los datos se mantendrán debidamente bloqueados a disposición exclusiva de Administraciones Públicas, Juzgados y Tribunales y la Agencia Tributaria para la atención de posibles responsabilidades nacidas del tratamiento, durante el plazo de prescripción legal establecido en la Ley General Tributaria y el Código de Comercio español (mínimo de 4 a 6 años).
          </p>
        </section>

        {/* Section 5: Destinatarios */}
        <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-emerald-950/60 dark:bg-[#071910]">
          <h2 className="font-outfit text-base font-bold text-gray-900 dark:text-white">
            5. Destinatarios y Cesión a Terceros
          </h2>
          <p>
            Sus datos no serán cedidos a terceros, salvo obligación legal o cuando sea estrictamente imprescindible para la ejecución del servicio contratado:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[11px]">
            <li>Empresas de mensajería y conductores de reparto local refrigerado adscritos a SuperBarrio.</li>
            <li>Entidades bancarias y pasarelas de pago seguro (Redsys, Bizum, Stripe) para procesar el abono de la compra.</li>
            <li>Agencia Estatal de Administración Tributaria (AEAT) en cumplimiento de obligaciones fiscales y facturación.</li>
          </ul>
        </section>

        {/* Section 6: Derechos ARCO */}
        <section className="space-y-4 rounded-2xl border border-emerald-500/30 bg-emerald-50/20 p-6 dark:border-emerald-950 dark:bg-[#05130b]">
          <h2 className="font-outfit text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>6. Sus Derechos de Protección de Datos (Derechos ARCO+)</span>
          </h2>
          <p>
            De conformidad con el RGPD y la Ley Orgánica 3/2018 (LOPDGDD), usted tiene derecho a ejercer los siguientes derechos en cualquier momento y de forma totalmente gratuita:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
            <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-emerald-950 dark:bg-[#071910]">
              <strong className="text-emerald-700 dark:text-emerald-400">Derecho de Acceso:</strong> Saber qué datos personales suyos estamos tratando.
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-emerald-950 dark:bg-[#071910]">
              <strong className="text-emerald-700 dark:text-emerald-400">Derecho de Rectificación:</strong> Solicitar la corrección de datos inexactos o incompletos.
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-emerald-950 dark:bg-[#071910]">
              <strong className="text-emerald-700 dark:text-emerald-400">Derecho de Supresión ("al Olvido"):</strong> Solicitar la eliminación de sus datos cuando ya no sean necesarios.
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-emerald-950 dark:bg-[#071910]">
              <strong className="text-emerald-700 dark:text-emerald-400">Derecho de Oposición:</strong> Oponerse al tratamiento de sus datos con fines comerciales o de perfilado.
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-emerald-950 dark:bg-[#071910]">
              <strong className="text-emerald-700 dark:text-emerald-400">Derecho de Portabilidad:</strong> Recibir sus datos en formato estructurado de uso común.
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-emerald-950 dark:bg-[#071910]">
              <strong className="text-emerald-700 dark:text-emerald-400">Derecho a la Limitación:</strong> Solicitar la limitación del tratamiento en casos específicos previstos por la ley.
            </div>
          </div>

          <div className="pt-2 text-[11px]">
            <p>
              Para ejercer cualquiera de estos derechos, basta con enviar una comunicación por escrito acreditando su identidad a:
            </p>
            <p className="mt-1 font-semibold text-emerald-700 dark:text-emerald-400">
              📧 Correo: <a href="mailto:privacidad@superbarrio.es" className="underline">privacidad@superbarrio.es</a> (Asunto: "Ejercicio Derechos RGPD")
            </p>
            <p className="mt-0.5">
              📮 Correo postal: SuperBarrio España S.L., Calle Gran Vía 28, 28013 Madrid, España.
            </p>
          </div>
        </section>

        {/* Section 7: AEPD */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-emerald-950/60 dark:bg-[#071910] flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-gray-900 dark:text-white font-outfit">Derecho a Reclamar ante la Autoridad de Control (AEPD)</h4>
            <p className="text-[11px] text-gray-600 dark:text-gray-400">
              Si considera que el tratamiento de sus datos personales infringe la normativa o que no hemos atendido debidamente sus derechos, tiene derecho a presentar una reclamación ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong> a través de su sede electrónica en{" "}
              <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline font-semibold">
                www.aepd.es
              </a>{" "}
              o por correo postal en C/ Jorge Juan, 6, 28001 Madrid.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
