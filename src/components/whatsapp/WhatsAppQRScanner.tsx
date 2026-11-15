"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { useTranslations } from "next-intl";

// ─── Types ───────────────────────────────────────────────────────────
type WhatsAppStatus =
  | "disconnected"
  | "connecting"
  | "qr"
  | "connected"
  | "error";

interface WhatsAppState {
  status: WhatsAppStatus;
  qrCode: string | null;
  user: { id: string; name: string } | null;
  error: string | null;
}

// ─── Component ───────────────────────────────────────────────────────
export default function WhatsAppQRScanner() {
  const t = useTranslations("whatsapp");

  const [state, setState] = useState<WhatsAppState>({
    status: "disconnected",
    qrCode: null,
    user: null,
    error: null,
  });
  const [loading, setLoading] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // ── SSE subscription ──────────────────────────────────────────────
  const startSSE = useCallback(() => {
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource("/api/whatsapp");
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data: WhatsAppState = JSON.parse(event.data);
        setState(data);
        setLoading(false);
      } catch {
        /* ignore parse errors */
      }
    };

    es.onerror = () => {
      // EventSource will auto-reconnect; we just update UI
      setState((prev) => ({
        ...prev,
        status: prev.status === "connected" ? "connected" : "error",
        error:
          prev.status === "connected"
            ? null
            : "Connection to server lost. Retrying…",
      }));
    };

    return () => {
      es.close();
    };
  }, []);

  useEffect(() => {
    const cleanup = startSSE();
    return cleanup;
  }, [startSSE]);

  // ── Actions ───────────────────────────────────────────────────────
  const sendAction = async (action: "connect" | "disconnect" | "logout") => {
    setLoading(true);
    try {
      await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
    } catch {
      setLoading(false);
    }
  };

  // ── Status badge ──────────────────────────────────────────────────
  const statusConfig: Record<
    WhatsAppStatus,
    { label: string; color: string; dot: string }
  > = {
    disconnected: {
      label: t("status.disconnected"),
      color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
      dot: "bg-gray-400",
    },
    connecting: {
      label: t("status.connecting"),
      color:
        "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400",
      dot: "bg-warning-500 animate-pulse",
    },
    qr: {
      label: t("status.waitingScan"),
      color:
        "bg-blue-light-50 text-blue-light-600 dark:bg-blue-light-500/10 dark:text-blue-light-400",
      dot: "bg-blue-light-500 animate-pulse",
    },
    connected: {
      label: t("status.connected"),
      color:
        "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400",
      dot: "bg-success-500",
    },
    error: {
      label: t("status.error"),
      color:
        "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400",
      dot: "bg-error-500",
    },
  };

  const badge = statusConfig[state.status];

  return (
    <div className="space-y-6">
      {/* ── Status Card ─────────────────────────────────────────────── */}
      <ComponentCard title={t("connectionStatus")}>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-theme-sm font-medium ${badge.color}`}
            >
              <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
              {badge.label}
            </span>

            {state.user && (
              <span className="text-theme-sm text-gray-600 dark:text-gray-300">
                {state.user.name}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {(state.status === "disconnected" || state.status === "error") && (
              <button
                disabled={loading}
                onClick={() => sendAction("connect")}
                className="inline-flex items-center gap-2 rounded-lg bg-success-500 px-4 py-2 text-theme-sm font-medium text-white transition hover:bg-success-600 disabled:opacity-50"
              >
                <WhatsAppSvg />
                {loading ? t("actions.connecting") : t("actions.connect")}
              </button>
            )}

            {state.status === "connected" && (
              <>
                <button
                  disabled={loading}
                  onClick={() => sendAction("disconnect")}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-theme-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {t("actions.disconnect")}
                </button>
                <button
                  disabled={loading}
                  onClick={() => sendAction("logout")}
                  className="inline-flex items-center gap-2 rounded-lg bg-error-500 px-4 py-2 text-theme-sm font-medium text-white transition hover:bg-error-600 disabled:opacity-50"
                >
                  {t("actions.logout")}
                </button>
              </>
            )}

            {(state.status === "connecting" || state.status === "qr") && (
              <button
                disabled={loading}
                onClick={() => sendAction("disconnect")}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-theme-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {t("actions.cancel")}
              </button>
            )}
          </div>
        </div>

        {/* Error message */}
        {state.error && (
          <div className="mt-4 rounded-lg bg-error-50 p-3 text-theme-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">
            {state.error}
          </div>
        )}
      </ComponentCard>

      {/* ── QR Code Card ────────────────────────────────────────────── */}
      <ComponentCard title={t("qrScanner")} desc={t("qrDesc")}>
        <div className="flex flex-col items-center justify-center py-8">
          {state.status === "qr" && state.qrCode ? (
            <div className="flex flex-col items-center gap-6">
              {/* QR Code */}
              <div className="rounded-2xl border-2 border-success-200 bg-white p-4 shadow-theme-md dark:border-success-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={state.qrCode}
                  alt="WhatsApp QR Code"
                  width={280}
                  height={280}
                  className="rounded-lg"
                />
              </div>

              {/* Instructions */}
              <div className="max-w-sm text-center">
                <h4 className="text-theme-sm font-semibold text-gray-800 dark:text-white/90">
                  {t("instructions.title")}
                </h4>
                <ol className="mt-3 space-y-2 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-100 text-theme-xs font-bold text-success-600 dark:bg-success-900/30 dark:text-success-400">
                      1
                    </span>
                    {t("instructions.step1")}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-100 text-theme-xs font-bold text-success-600 dark:bg-success-900/30 dark:text-success-400">
                      2
                    </span>
                    {t("instructions.step2")}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-100 text-theme-xs font-bold text-success-600 dark:bg-success-900/30 dark:text-success-400">
                      3
                    </span>
                    {t("instructions.step3")}
                  </li>
                </ol>
              </div>
            </div>
          ) : state.status === "connecting" ? (
            <div className="flex flex-col items-center gap-4">
              {/* Spinner */}
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-success-500" />
              <p className="text-theme-sm text-gray-500 dark:text-gray-400">
                {t("connectingMessage")}
              </p>
            </div>
          ) : state.status === "connected" ? (
            <div className="flex flex-col items-center gap-4">
              {/* Success check */}
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success-100 dark:bg-success-900/30">
                <svg
                  className="h-10 w-10 text-success-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="text-center">
                <h4 className="text-lg font-semibold text-success-600 dark:text-success-400">
                  {t("connectedTitle")}
                </h4>
                {state.user && (
                  <p className="mt-1 text-theme-sm text-gray-600 dark:text-gray-400">
                    {t("connectedAs", { name: state.user.name })}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {/* Disconnected placeholder */}
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <WhatsAppSvg className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-theme-sm text-gray-500 dark:text-gray-400">
                {t("disconnectedMessage")}
              </p>
            </div>
          )}
        </div>
      </ComponentCard>
    </div>
  );
}

// ─── Inline WhatsApp SVG (small, only used here) ─────────────────────
function WhatsAppSvg({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

