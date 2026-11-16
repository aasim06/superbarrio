"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Cookie, Settings, Check, X, Lock, ExternalLink } from "lucide-react";

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: string;
}

const STORAGE_KEY = "sb_cookie_consent";
const CONSENT_VERSION = "1.0";

/**
 * Dispatch an event to reopen cookie preferences from any button (e.g. footer)
 */
export function openCookieSettings() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-cookie-settings"));
  }
}

export default function CookieConsentBanner() {
  const locale = useLocale();
  const isEs = locale === "es";

  const [hasLoaded, setHasLoaded] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Preference switches
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: CookiePreferences = JSON.parse(stored);
        if (parsed.version === CONSENT_VERSION) {
          setAnalyticsEnabled(!!parsed.analytics);
          setMarketingEnabled(!!parsed.marketing);
          setShowBanner(false);
        } else {
          setShowBanner(true);
        }
      } else {
        const timer = setTimeout(() => setShowBanner(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      setShowBanner(true);
    } finally {
      setHasLoaded(true);
    }

    const handleOpenModal = () => {
      setShowModal(true);
    };

    window.addEventListener("open-cookie-settings", handleOpenModal);
    return () => {
      window.removeEventListener("open-cookie-settings", handleOpenModal);
    };
  }, []);

  const saveConsent = (prefs: { analytics: boolean; marketing: boolean }) => {
    const payload: CookiePreferences = {
      necessary: true,
      analytics: prefs.analytics,
      marketing: prefs.marketing,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      const cookieVal = encodeURIComponent(JSON.stringify(payload));
      document.cookie = `sb_cookie_consent=${cookieVal}; path=/; max-age=31536000; SameSite=Lax`;
      window.dispatchEvent(new CustomEvent("sb_cookie_consent_updated"));
    } catch (e) {
      console.warn("Could not save cookie preferences", e);
    }

    setAnalyticsEnabled(prefs.analytics);
    setMarketingEnabled(prefs.marketing);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleAcceptAll = () => {
    saveConsent({ analytics: true, marketing: true });
  };

  const handleRejectAll = () => {
    saveConsent({ analytics: false, marketing: false });
  };

  const handleSavePreferences = () => {
    saveConsent({ analytics: analyticsEnabled, marketing: marketingEnabled });
  };

  if (!hasLoaded) return null;

  return (
    <>
      {/* 1. Mobile Backdrop: Prevents awkward collision with MobileBottomNav / Floating Cart Bar */}
      <AnimatePresence>
        {showBanner && !showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[95] bg-black/45 backdrop-blur-xs md:hidden"
          />
        )}
      </AnimatePresence>

      {/* 2. First Layer Banner Container: Perfectly Centered on Desktop, Native Bottom Sheet on Mobile */}
      <AnimatePresence>
        {showBanner && !showModal && (
          <div className="fixed inset-x-0 bottom-0 z-[100] pointer-events-none flex items-end justify-center p-0 md:p-6">
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.98 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              role="dialog"
              aria-label={isEs ? "Aviso de Cookies y Privacidad" : "Cookie and Privacy Notice"}
              className="pointer-events-auto cookie-banner-responsive rounded-t-[28px] md:rounded-3xl border-t md:border border-emerald-500/30 bg-white/98 p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(0,0,0,0.35)] md:shadow-2xl backdrop-blur-2xl dark:border-emerald-800/70 dark:bg-[#071910]/98 md:p-6"
            >
              {/* Mobile handle indicator */}
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-300 dark:bg-emerald-900/80 md:hidden" />

              <div className="flex items-start gap-3.5 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  <Cookie className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white font-outfit truncate">
                      {isEs ? "Control de Cookies y Privacidad (RGPD / AEPD)" : "Cookie & Privacy Consent (GDPR)"}
                    </h3>
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      España
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs leading-relaxed text-gray-600 dark:text-gray-300 line-clamp-3 sm:line-clamp-none">
                    {isEs
                      ? "En SuperBarrio usamos cookies técnicas obligatorias para la compra y el reparto seguro. Con tu permiso, también usamos cookies analíticas y de ofertas personalizadas para mejorar tu experiencia."
                      : "At SuperBarrio we use mandatory technical cookies for shopping and delivery. With your consent, we also use analytical and personalization cookies."}
                  </p>
                  <div className="pt-0.5 text-[11px]">
                    <Link
                      href="/grocery/politica-cookies"
                      className="inline-flex items-center gap-1 font-semibold text-emerald-600 underline hover:text-emerald-700 dark:text-emerald-400"
                    >
                      <span>{isEs ? "Política de Cookies" : "Cookie Policy"}</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </Link>
                    <span className="mx-1.5 text-gray-400">·</span>
                    <Link
                      href="/grocery/privacidad"
                      className="inline-flex items-center gap-1 font-semibold text-emerald-600 underline hover:text-emerald-700 dark:text-emerald-400"
                    >
                      <span>{isEs ? "Aviso RGPD" : "GDPR Notice"}</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Responsive for both Mobile and Desktop */}
              <div className="mt-4 flex flex-col gap-2 pt-3 border-t border-gray-100 dark:border-emerald-950/70 sm:flex-row sm:items-center sm:justify-end sm:gap-2.5">
                {/* Primary Button on Mobile goes first or last */}
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="w-full sm:w-auto order-1 sm:order-3 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-95"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{isEs ? "Aceptar todas" : "Accept all"}</span>
                </button>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2.5 order-2">
                  <button
                    type="button"
                    onClick={handleRejectAll}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-gray-300 bg-gray-100 px-3 py-2 text-[11px] sm:text-xs font-semibold text-gray-800 transition hover:bg-gray-200 active:scale-95 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-gray-200 dark:hover:bg-emerald-950"
                  >
                    <span>{isEs ? "Rechazar no esenciales" : "Reject non-essential"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-[11px] sm:text-xs font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <Settings className="h-3 w-3 text-gray-500" />
                    <span>{isEs ? "Configurar" : "Customize"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Second Layer: Cookie Configuration Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/65 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-emerald-500/30 bg-white p-6 shadow-2xl dark:border-emerald-800/80 dark:bg-[#071910] sm:p-7"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-emerald-950/80">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-outfit text-base font-bold text-gray-900 dark:text-white">
                      {isEs ? "Panel de Configuración de Cookies" : "Cookie Preferences Center"}
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      SuperBarrio España S.L. · Cumplimiento RGPD & LSSI-CE
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-emerald-950 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Description */}
              <p className="mt-4 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                {isEs
                  ? "Puedes activar o desactivar libremente cada categoría de cookies según tus preferencias. Las cookies técnicas no se pueden desactivar ya que son imprescindibles para que puedas comprar y recibir tus pedidos."
                  : "You can freely enable or disable each category of cookies according to your preferences. Technical cookies cannot be disabled as they are essential for supermarket shopping."}
              </p>

              {/* Cookie Categories */}
              <div className="mt-5 space-y-4">
                {/* 1. Necessary (Always Active) */}
                <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 dark:border-emerald-950 dark:bg-[#05130b]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white font-outfit">
                        {isEs ? "1. Cookies Técnicas y Obligatorias" : "1. Strictly Necessary Cookies"}
                      </h4>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {isEs ? "Siempre Activas" : "Always Active"}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                    {isEs
                      ? "Imprescindibles para autenticación, gestión del carrito de la compra en tiempo real, selección de idioma (€/ES) y prevención de fraude en los pagos."
                      : "Essential for authentication, real-time shopping cart management, language preference (€/ES), and checkout security."}
                  </p>
                </div>

                {/* 2. Analytical Cookies */}
                <div className="rounded-2xl border border-gray-200 p-4 transition hover:border-emerald-300 dark:border-emerald-950 dark:hover:border-emerald-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white font-outfit">
                        {isEs ? "2. Cookies de Análisis y Rendimiento" : "2. Analytical & Performance Cookies"}
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        {isEs ? "Medición anónima de tráfico" : "Anonymous traffic telemetry"}
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={analyticsEnabled}
                        onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-700" />
                    </label>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                    {isEs
                      ? "Nos ayudan a saber qué productos son los más buscados y cómo navegan los usuarios para optimizar la velocidad de la tienda online."
                      : "Help us understand which grocery items are most popular and optimize store loading speed."}
                  </p>
                </div>

                {/* 3. Personalization & Marketing Cookies */}
                <div className="rounded-2xl border border-gray-200 p-4 transition hover:border-emerald-300 dark:border-emerald-950 dark:hover:border-emerald-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white font-outfit">
                        {isEs ? "3. Cookies de Personalización y Ofertas" : "3. Personalization & Marketing Cookies"}
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        {isEs ? "Cupones y recomendaciones locales" : "Coupons & local recommendations"}
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={marketingEnabled}
                        onChange={(e) => setMarketingEnabled(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-700" />
                    </label>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                    {isEs
                      ? "Permiten recordar tu franja horaria preferida de reparto, avisarte de descuentos en productos que compras a menudo y ofertas de temporada."
                      : "Allows remembering preferred delivery slots and notifying you of discounts on everyday items."}
                  </p>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-emerald-950/80">
                <Link
                  href="/grocery/politica-cookies"
                  onClick={() => setShowModal(false)}
                  className="text-xs text-emerald-600 underline dark:text-emerald-400"
                >
                  {isEs ? "Ver desglose detallado de cookies" : "View detailed cookie list"}
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSavePreferences}
                    className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-50 active:scale-95 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-gray-200"
                  >
                    {isEs ? "Guardar mi selección" : "Save selection"}
                  </button>
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-95"
                  >
                    {isEs ? "Aceptar todas" : "Accept all"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
