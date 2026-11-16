import { NextRequest, NextResponse } from "next/server";
import { EdgeTTS } from "node-edge-tts";

export const dynamic = "force-dynamic";

// In-memory LRU cache to serve repeated audio synthesis in 0ms without hitting Microsoft servers
const audioCache = new Map<string, Buffer>();
const MAX_CACHE_SIZE = 120;

/**
 * SuperBarrio Edge-TTS Route
 * Provides natural Pakistani Urdu voice synthesis using Microsoft Edge-TTS (100% Free)
 * Voices: ur-PK-AsadNeural (Male) / ur-PK-UzmaNeural (Female)
 */
export async function POST(req: NextRequest) {
  try {
    const {
      text,
      voice = "ur-PK-AsadNeural",
      lang = "ur-PK",
    } = await req.json();

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 },
      );
    }

    // Clean text for speech: strip emojis, symbols, markdown markers
    const cleanText = text
      .replace(/[*_#`~>•]/g, "")
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) {
      return NextResponse.json(
        { error: "No printable text found" },
        { status: 400 },
      );
    }

    const selectedVoice = voice || "ur-PK-AsadNeural";
    const selectedLang = lang || "ur-PK";
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

    const tts = new EdgeTTS({
      voice: selectedVoice,
      lang: selectedLang,
      outputFormat: "audio-24khz-48kbitrate-mono-mp3",
    });

    const chunks: Buffer[] = [];
    try {
      for await (const chunk of tts.streamAudio(cleanText)) {
        if (
          chunk &&
          (Buffer.isBuffer(chunk) ||
            chunk instanceof Uint8Array ||
            (chunk as any).byteLength !== undefined)
        ) {
          chunks.push(Buffer.from(chunk as any));
        }
      }
    } catch (streamErr) {
      console.error("[TTS] streamAudio error:", streamErr);
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
  } catch (error) {
    console.error("[Edge-TTS API Error]:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "TTS Generation failed",
      },
      { status: 500 },
    );
  }
}

