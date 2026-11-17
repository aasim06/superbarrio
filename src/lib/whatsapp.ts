/**
 * WhatsApp Baileys Connection Manager
 *
 * Manages a singleton WhatsApp Web connection using @whiskeysockets/baileys.
 * Provides QR code generation, connection state tracking, and message sending.
 */

import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  ConnectionState,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import path from "path";
import QRCode from "qrcode";

// ─── Types ───────────────────────────────────────────────────────────
export type WhatsAppStatus =
  | "disconnected"
  | "connecting"
  | "qr"
  | "connected"
  | "error";

export interface WhatsAppState {
  status: WhatsAppStatus;
  qrCode: string | null; // data URI for the QR image
  user: {
    id: string;
    name: string;
  } | null;
  error: string | null;
}

type Listener = (state: WhatsAppState) => void;

// ─── Singleton ───────────────────────────────────────────────────────
let sock: WASocket | null = null;
let currentState: WhatsAppState = {
  status: "disconnected",
  qrCode: null,
  user: null,
  error: null,
};
const listeners = new Set<Listener>();

const AUTH_DIR = path.join(process.cwd(), ".whatsapp-auth");

function broadcast(state: WhatsAppState) {
  currentState = state;
  listeners.forEach((fn) => fn(state));
}

// ─── Public API ──────────────────────────────────────────────────────

/** Subscribe to state changes; returns an unsubscribe function. */
export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  // Immediately send the current state so new subscribers get the latest
  fn(currentState);
  return () => {
    listeners.delete(fn);
  };
}

/** Return the current snapshot without subscribing. */
export function getState(): WhatsAppState {
  return currentState;
}

/** Start or restart the WhatsApp connection. */
export async function connect(): Promise<void> {
  // If already connected do nothing
  if (currentState.status === "connected" && sock) return;

  // Clean up any previous socket
  if (sock) {
    try {
      sock.end(undefined);
    } catch {
      /* ignore */
    }
    sock = null;
  }

  broadcast({
    status: "connecting",
    qrCode: null,
    user: null,
    error: null,
  });

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { state: authState, saveCreds } =
      await useMultiFileAuthState(AUTH_DIR);

    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      auth: authState,
      printQRInTerminal: false,
      browser: ["SMBURIO Admin", "Chrome", "1.0.0"],
      generateHighQualityLinkPreview: false,
    });

    // ── Connection updates ──────────────────────────────────────────
    sock.ev.on("connection.update", async (update: Partial<ConnectionState>) => {
      const { connection, lastDisconnect, qr } = update;

      // QR received → convert to data URI
      if (qr) {
        try {
          const dataUri = await QRCode.toDataURL(qr, {
            width: 320,
            margin: 2,
            color: { dark: "#1a1a2e", light: "#ffffff" },
          });
          broadcast({
            status: "qr",
            qrCode: dataUri,
            user: null,
            error: null,
          });
        } catch {
          /* QR generation error – next one will come */
        }
      }

      if (connection === "close") {
        const boom = lastDisconnect?.error as Boom | undefined;
        const statusCode = boom?.output?.statusCode;
        const shouldReconnect =
          statusCode !== DisconnectReason.loggedOut;

        if (shouldReconnect) {
          // Retry after a short delay
          setTimeout(() => connect(), 3000);
        } else {
          // Logged out — clear state
          broadcast({
            status: "disconnected",
            qrCode: null,
            user: null,
            error: "Logged out from WhatsApp",
          });
          sock = null;
        }
      } else if (connection === "open") {
        const me = sock?.user;
        broadcast({
          status: "connected",
          qrCode: null,
          user: me
            ? {
                id: me.id,
                name: me.name ?? me.id.split("@")[0],
              }
            : null,
          error: null,
        });
      }
    });

    // ── Persist credentials on update ───────────────────────────────
    sock.ev.on("creds.update", saveCreds);
  } catch (err) {
    broadcast({
      status: "error",
      qrCode: null,
      user: null,
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
}

/** Disconnect and optionally log out (clear credentials). */
export async function disconnect(logout = false): Promise<void> {
  if (sock) {
    try {
      if (logout) {
        await sock.logout();
      } else {
        sock.end(undefined);
      }
    } catch {
      /* ignore */
    }
    sock = null;
  }

  // If logging out, remove auth files
  if (logout) {
    const fs = await import("fs/promises");
    try {
      await fs.rm(AUTH_DIR, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }

  broadcast({
    status: "disconnected",
    qrCode: null,
    user: null,
    error: null,
  });
}

/** Send a text message to a given phone number (international format e.g. 34632250561 or +34632250561). */
export async function sendWhatsAppMessage(
  toPhone: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  if (!sock || currentState.status !== "connected") {
    return { success: false, error: "WhatsApp socket is not connected" };
  }

  try {
    const cleanNumber = toPhone.replace(/^00/, "").replace(/\D/g, "");
    if (!cleanNumber) {
      return { success: false, error: "Invalid phone number" };
    }
    const jid = `${cleanNumber}@s.whatsapp.net`;
    await sock.sendMessage(jid, { text });
    return { success: true };
  } catch (err) {
    console.error("sendWhatsAppMessage error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send WhatsApp message",
    };
  }
}


