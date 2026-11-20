import { NextRequest, NextResponse } from "next/server";
import { EdgeTTS } from "node-edge-tts";

export const dynamic = "force-dynamic";

// In-memory LRU cache to serve repeated audio synthesis in 0ms without hitting Microsoft servers
const audioCache = new Map<string, Buffer>();
const MAX_CACHE_SIZE = 120;

/**
 * SuperBarrio Edge-TTS Route
 * Provides natural Spanish (Spain) voice synthesis using Microsoft Edge-TTS (100% Free)
 * Voices: es-ES-ElviraNeural (Female - Spain) / es-ES-AlvaroNeural (Male - Spain)
 */
export async function POST(req: NextRequest) {
  try {
    const {
      text,
      voice = "es-ES-ElviraNeural",
      lang = "es-ES",
    } = await req.json();

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 },
      );
    }

    // Clean text for speech: strip markdown, currency symbols to natural words, emojis
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/[_#`~>•]/g, "")
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
      .replace(/(\d+)[,.](\d{2})\s*€/g, "$1 euros con $2 céntimos")
      .replace(/(\d+)\s*€/g, "$1 euros")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) {
      return NextResponse.json(
        { error: "No printable text found" },
        { status: 400 },
      );
    }

    const selectedVoice = voice || "es-ES-ElviraNeural";
    const selectedLang = lang || "es-ES";
    const cacheKey = `${selectedVoice}_${selectedLang}_${cleanText}`;

    // Instant return if previously synthesized
    if (audioCache.has(cacheKey)) {
      const cached = audioCache.get(cacheKey)!;
      return new Response(new Uint8Array(cached), {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": cached.length.toString(),
          "Cache-Control": "public, max-age=86400",
          "X-TTS-Cache": "HIT",
        },
      });
    }

    const chunks: Buffer[] = [];

    async function streamFromEdge(): Promise<Buffer[]> {
      const tts = new EdgeTTS({
        voice: selectedVoice,
        lang: selectedLang,
        outputFormat: "audio-24khz-48kbitrate-mono-mp3",
      });
      const collected: Buffer[] = [];
      for await (const chunk of tts.streamAudio(cleanText)) {
        if (
          chunk &&
          (Buffer.isBuffer(chunk) ||
            chunk instanceof Uint8Array ||
            (chunk as any).byteLength !== undefined)
        ) {
          collected.push(Buffer.from(chunk as any));
        }
      }
      return collected;
    }

    try {
      const result = await streamFromEdge();
      chunks.push(...result);
    } catch (streamErr) {
      console.warn("[TTS] Attempt 1 failed, retrying once...", streamErr);
      try {
        const retryResult = await streamFromEdge();
        chunks.push(...retryResult);
      } catch (retryErr) {
        console.error("[TTS] StreamAudio retry error:", retryErr);
      }
    }

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate audio chunks" },
        { status: 500 },
      );
    }

    const audioBuffer = Buffer.concat(chunks);

    // Save to cache
    if (audioCache.size >= MAX_CACHE_SIZE) {
      const firstKey = audioCache.keys().next().value;
      if (firstKey) audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, audioBuffer);

    return new Response(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "public, max-age=86400",
        "X-TTS-Cache": "MISS",
      },
    });
  } catch (err: any) {
    console.error("[TTS API Route Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Internal TTS server error" },
      { status: 500 },
    );
  }
}
