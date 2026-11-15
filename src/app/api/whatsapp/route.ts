/**
 * WhatsApp SSE API Route
 *
 * GET  → Server-Sent Events stream for real-time QR/status updates
 * POST → Control actions (connect / disconnect / logout)
 */

import { connect, disconnect, subscribe, getState } from "@/lib/whatsapp";

// Force dynamic — this route must never be cached
export const dynamic = "force-dynamic";

// ─── GET: SSE stream ─────────────────────────────────────────────────
export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Helper to push an SSE event
      const send = (data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
          );
        } catch {
          /* stream closed */
        }
      };

      // Subscribe — immediately receives current state, then updates
      const unsubscribe = subscribe((state) => {
        send(state);
      });

      // Keep-alive ping every 25 s so proxies don't close the conn
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          clearInterval(keepAlive);
        }
      }, 25_000);

      // Clean up when the client disconnects
      const cancel = () => {
        unsubscribe();
        clearInterval(keepAlive);
      };

      // The ReadableStream cancel callback
      (controller as unknown as { _cancel: () => void })._cancel = cancel;
    },

    cancel() {
      // Triggered when the client closes the connection
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // for nginx proxies
    },
  });
}

// ─── POST: actions ───────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body?.action as string;

    switch (action) {
      case "connect":
        await connect();
        return Response.json({
          ok: true,
          message: "Connecting…",
          state: getState(),
        });

      case "disconnect":
        await disconnect(false);
        return Response.json({
          ok: true,
          message: "Disconnected",
          state: getState(),
        });

      case "logout":
        await disconnect(true);
        return Response.json({
          ok: true,
          message: "Logged out & credentials cleared",
          state: getState(),
        });

      case "status":
        return Response.json({ ok: true, state: getState() });

      default:
        return Response.json(
          { ok: false, error: `Unknown action: ${action}` },
          { status: 400 },
        );
    }
  } catch (err) {
    return Response.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

