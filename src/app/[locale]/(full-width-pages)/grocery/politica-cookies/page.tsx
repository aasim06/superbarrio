"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Cookie, ShieldCheck, ArrowLeft, Settings, CheckCircle2, AlertCircle } from "lucide-react";
import { openCookieSettings } from "@/components/grocery/CookieConsentBanner";

export default function PoliticaCookiesPage() {
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
            <Cookie className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-outfit text-2xl font-black text-gray-900 dark:text-white sm:text-3xl">
              {isEs ? "Política de Cookies" : "Cookie Policy"}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isEs
                ? "Actualizado conforme a las directrices de la AEPD y el RGPD (UE 2016/679)"
                : "Compliant with Spanish AEPD guidelines and EU GDPR 2016/679"}
            </p>
          </div>
        </div>

        {/* Quick action bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-white p-4 dark:border-emerald-900/60 dark:bg-[#05130b]">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{isEs ? "Puedes modificar tus consentimientos en cualquier momento:" : "You can change your consent at any time:"}</span>
          </div>
          <button
            type="button"
            onClick={openCookieSettings}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>{isEs ? "Abrir Panel de Cookies" : "Open Cookie Settings"}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-10 space-y-8 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
        {/* Section 1 */}
        <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-emerald-950/60 dark:bg-[#071910]">
          <h2 className="font-outfit text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>1. ¿Qué son las Cookies?</span>
          </h2>
          <p>
            Una cookie es un pequeño fichero de texto que los sitios web descargan en su dispositivo (ordenador, tablet o smartphone) al visitarlos. Las cookies permiten a una página web, entre otras cosas, almacenar y recuperar información sobre los hábitos de navegación de un usuario o de su equipo y, dependiendo de la información que contengan y de la forma en que utilice su equipo, pueden utilizarse para reconocer al usuario.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-emerald-950/60 dark:bg-[#071910]">
          <h2 className="font-outfit text-base font-bold text-gray-900 dark:text-white">
            2. Tipos de Cookies que Utiliza SuperBarrio
          </h2>
          <p>
            En cumplimiento del artículo 22 de la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), y de la Guía sobre el uso de cookies de la Agencia Española de Protección de Datos (AEPD), le informamos de las categorías de cookies empleadas en este sitio:
          </p>

          <div className="space-y-4 pt-2">
            {/* Category A */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/40 p-4 dark:border-emerald-950 dark:bg-[#05130b]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-800 dark:text-emerald-300">A. Cookies Técnicas y Estrictamente Necesarias</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Exentas de consentimiento
                </span>
              </div>
              <p className="mt-2 text-[11px] text-gray-600 dark:text-gray-400">
                Son aquellas que permiten al usuario la navegación a través de la página web y la utilización de las diferentes opciones o servicios que en ella existen: controlar el tráfico y la comunicación de datos, identificar la sesión, acceder al carrito de compra de supermercado, realizar el proceso de compra de un pedido, gestionar el pago y almacenar contenidos.
              </p>
            </div>

            {/* Category B */}
            <div className="rounded-xl border border-gray-200 p-4 dark:border-emerald-950">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-white">B. Cookies Analíticas y de Medición</span>
                <span className="text-[10px] font-semibold text-gray-500">Requieren consentimiento</span>
              </div>
              <p className="mt-2 text-[11px] text-gray-600 dark:text-gray-400">
                Permiten al responsable de las mismas el seguimiento y análisis del comportamiento de los usuarios en los sitios web. La información recogida mediante este tipo de cookies se utiliza en la medición de la actividad del supermercado para introducir mejoras en función del análisis de los datos de uso que hacen los usuarios del servicio.
              </p>
            </div>

            {/* Category C */}
            <div className="rounded-xl border border-gray-200 p-4 dark:border-emerald-950">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-white">C. Cookies de Personalización y Preferencias</span>
                <span className="text-[10px] font-semibold text-gray-500">Requieren consentimiento</span>
              </div>
              <p className="mt-2 text-[11px] text-gray-600 dark:text-gray-400">
                Permiten recordar información para que el usuario acceda al servicio con determinadas características que pueden diferenciar su experiencia de la de otros usuarios (por ejemplo, el idioma de navegación o la zona de entrega en Madrid/España).
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Table of Cookies */}
        <section className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-emerald-950/60 dark:bg-[#071910]">
          <h2 className="font-outfit text-base font-bold text-gray-900 dark:text-white">
            3. Cuadro Detallado de Cookies Empleadas
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-emerald-950 text-gray-900 dark:text-white font-bold">
                  <th className="py-2.5 px-3">Cookie</th>
                  <th className="py-2.5 px-3">Tipo / Titular</th>
                  <th className="py-2.5 px-3">Finalidad</th>
                  <th className="py-2.5 px-3">Duración</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-emerald-950/60 text-gray-600 dark:text-gray-400">
                <tr>
                  <td className="py-2.5 px-3 font-mono font-semibold text-emerald-700 dark:text-emerald-400">sb_cookie_consent</td>
                  <td className="py-2.5 px-3">Técnica (Propia)</td>
                  <td className="py-2.5 px-3">Registra y almacena el consentimiento o rechazo de cookies del usuario.</td>
                  <td className="py-2.5 px-3">1 año</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-semibold text-emerald-700 dark:text-emerald-400">sb_cart_storage</td>
                  <td className="py-2.5 px-3">Técnica (Propia)</td>
                  <td className="py-2.5 px-3">Mantiene los alimentos y productos añadidos a la cesta de compra durante la sesión.</td>
                  <td className="py-2.5 px-3">Sesión / 30 días</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-semibold text-emerald-700 dark:text-emerald-400">NEXT_LOCALE</td>
                  <td className="py-2.5 px-3">Técnica (Propia)</td>
                  <td className="py-2.5 px-3">Guarda la preferencia lingüística del usuario (Español o Inglés).</td>
                  <td className="py-2.5 px-3">1 año</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-semibold text-emerald-700 dark:text-emerald-400">theme-mode</td>
                  <td className="py-2.5 px-3">Personalización (Propia)</td>
                  <td className="py-2.5 px-3">Guarda la preferencia de modo oscuro / claro de la interfaz.</td>
                  <td className="py-2.5 px-3">Persistente</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-semibold text-emerald-700 dark:text-emerald-400">sb_admin_session</td>
                  <td className="py-2.5 px-3">Técnica (Propia)</td>
                  <td className="py-2.5 px-3">Mantiene la sesión de los administradores y gestores del supermercado.</td>
                  <td className="py-2.5 px-3">7 días</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Browser Management */}
        <section className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-emerald-950/60 dark:bg-[#071910]">
          <h2 className="font-outfit text-base font-bold text-gray-900 dark:text-white">
            4. ¿Cómo Administrar o Desactivar Cookies en su Navegador?
          </h2>
          <p>
            Usted puede permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la configuración de las opciones de su navegador de Internet. En caso de que no permita la instalación de cookies esenciales en su navegador, es posible que no pueda acceder a algunas de las secciones de nuestro supermercado online (como tramitar el pago o completar el pedido).
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[11px]">
            <li><strong>Google Chrome:</strong> Configuración &gt; Privacidad y seguridad &gt; Cookies y otros datos de sitios.</li>
            <li><strong>Mozilla Firefox:</strong> Opciones &gt; Privacidad y Seguridad &gt; Cookies y datos del sitio.</li>
            <li><strong>Apple Safari:</strong> Preferencias &gt; Privacidad &gt; Bloquear todas las cookies.</li>
            <li><strong>Microsoft Edge:</strong> Configuración &gt; Permisos de sitios &gt; Cookies y datos guardados.</li>
          </ul>
        </section>

        {/* Section 5: Legal Contact */}
        <section className="rounded-2xl border border-emerald-500/20 bg-emerald-50/30 p-5 dark:border-emerald-950 dark:bg-[#05130b] flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-gray-900 dark:text-white font-outfit">Contacto sobre Privacidad</h4>
            <p className="text-[11px] text-gray-600 dark:text-gray-400">
              Para cualquier consulta sobre nuestra política de cookies y protección de datos, puede escribirnos a{" "}
              <a href="mailto:privacidad@superbarrio.es" className="font-semibold text-emerald-600 underline">
                privacidad@superbarrio.es
              </a>{" "}
              o contactar con SuperBarrio España S.L. en Calle Gran Vía, 28, 28013 Madrid, España.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
