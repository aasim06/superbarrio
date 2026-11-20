"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "@/i18n/navigation";
import { useGroceryCart } from "@/context/GroceryCartContext";
import { LeafIcon } from "@/icons";
import { GROCERY_PRODUCTS } from "@/data/groceryData";
import type { GroceryProduct } from "@/types/grocery";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
}

// Single Fixed Voice: Elvira (Natural Spain Spanish - Microsoft Edge-TTS)
const FIXED_VOICE = "es-ES-ElviraNeural";
const FIXED_LANG = "es-ES";

const SPANISH_SUGGESTIONS = [
  "Plátanos de Canarias Ecológicos",
  "Manzanas Royal Gala Crujientes",
  "Zanahorias de Huerta Lavadas",
  "Mandarinas Clemenules de Valencia",
  "Plazos de Entrega Exprés y Envío Gratis",
  "Cupón de Descuento FRESH20",
];

const INITIAL_SPANISH_MESSAGE =
  "¡Hola! Te damos la bienvenida a SuperBarrio, tu supermercado de frutas y verduras frescas de la huerta en España. Soy tu asistente virtual por voz. Puedes preguntarme precios, disponibilidad, ofertas activas o plazos de entrega a domicilio.";

export default function GroceryAIVoiceBot() {
  const pathname = usePathname();
  const { totalItems } = useGroceryCart();
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text: INITIAL_SPANISH_MESSAGE,
      timestamp: "Ahora",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [hasCookieConsent, setHasCookieConsent] = useState(true);

  // Live product catalog — includes custom products from localStorage
  const [liveProducts, setLiveProducts] =
    useState<GroceryProduct[]>(GROCERY_PRODUCTS);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const activeTtsAbortRef = useRef<AbortController | null>(null);
  const autoSendTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioUnlockedRef = useRef<boolean>(false);

  // Mobile Web Audio Unlocker (Primes mobile audio policy on first user gesture)
  const unlockAudioContext = useCallback(() => {
    if (audioUnlockedRef.current || typeof window === "undefined") return;
    try {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === "suspended") {
          ctx.resume();
        }
      }
      audioUnlockedRef.current = true;
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const checkConsent = () => {
      try {
        const consent = localStorage.getItem("sb_cookie_consent");
        setHasCookieConsent(!!consent);
      } catch {
        setHasCookieConsent(true);
      }
    };
    checkConsent();
    window.addEventListener("sb_cookie_consent_updated", checkConsent);
    return () =>
      window.removeEventListener("sb_cookie_consent_updated", checkConsent);
  }, []);

  // Load & keep the product catalog in sync (picks up localStorage custom products)
  useEffect(() => {
    function loadProducts() {
      try {
        const raw =
          typeof window !== "undefined"
            ? localStorage.getItem("tailgrocery_custom_products")
            : null;
        const custom: GroceryProduct[] = raw ? JSON.parse(raw) : [];
        const customIds = new Set(custom.map((p) => p.id));
        const merged = [
          ...custom,
          ...GROCERY_PRODUCTS.filter((p) => !customIds.has(p.id)),
        ];
        setLiveProducts(merged);
      } catch {
        setLiveProducts(GROCERY_PRODUCTS);
      }
    }

    loadProducts();

    window.addEventListener("grocery-products-updated", loadProducts);
    return () =>
      window.removeEventListener("grocery-products-updated", loadProducts);
  }, []);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Clean and stop any active audio playback and pending TTS requests
  const stopAllAudio = useCallback(() => {
    if (activeTtsAbortRef.current) {
      activeTtsAbortRef.current.abort();
      activeTtsAbortRef.current = null;
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = "";
      currentAudioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
      if (autoSendTimeoutRef.current) {
        clearTimeout(autoSendTimeoutRef.current);
      }
    };
  }, [stopAllAudio]);

  // Initialize Speech Recognition in Spanish (es-ES)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSpeechRec =
        "webkitSpeechRecognition" in window || "SpeechRecognition" in window;

      if (hasSpeechRec) {
        const SpeechRec =
          (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition;
        const rec = new SpeechRec();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = FIXED_LANG;

        rec.onstart = () => {
          setIsListening(true);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        rec.onerror = (err: any) => {
          console.warn("Speech recognition error:", err);
          setIsListening(false);
        };

        rec.onresult = (event: any) => {
          let liveTranscript = "";
          let isFinal = false;

          for (let i = 0; i < event.results.length; ++i) {
            liveTranscript += event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              isFinal = true;
            }
          }

          if (liveTranscript) {
            setInputValue(liveTranscript);
          }

          if (isFinal && liveTranscript.trim()) {
            const finalQuery = liveTranscript.trim();
            if (autoSendTimeoutRef.current) {
              clearTimeout(autoSendTimeoutRef.current);
            }
            autoSendTimeoutRef.current = setTimeout(() => {
              handleSendMessage(finalQuery);
            }, 750);
          }
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  // Fallback to browser SpeechSynthesis (Client-side)
  const fallbackWebSpeech = useCallback(
    (text: string) => {
      if (
        !voiceEnabled ||
        typeof window === "undefined" ||
        !("speechSynthesis" in window)
      ) {
        setIsSpeaking(false);
        return;
      }
      window.speechSynthesis.cancel();
      const clean = text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/[_#`~>•]/g, "")
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
        .replace(/(\d+)[,.](\d{2})\s*€/g, "$1 euros con $2 céntimos")
        .replace(/(\d+)\s*€/g, "$1 euros")
        .trim();

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = FIXED_LANG;
      utterance.rate = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [voiceEnabled],
  );

  // High Quality Free Microsoft Edge-TTS Audio Playback (Single Natural Voice: Elvira)
  const speakText = useCallback(
    async (text: string) => {
      if (!voiceEnabled || typeof window === "undefined") {
        return;
      }

      // 1. Instantly stop any previous speech & abort any in-flight TTS fetch
      stopAllAudio();
      unlockAudioContext();

      const clean = text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/[_#`~>•]/g, "")
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
        .replace(/(\d+)[,.](\d{2})\s*€/g, "$1 euros con $2 céntimos")
        .replace(/(\d+)\s*€/g, "$1 euros")
        .trim();

      const abortController = new AbortController();
      activeTtsAbortRef.current = abortController;

      try {
        setIsSpeaking(true);
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortController.signal,
          body: JSON.stringify({
            text: clean,
            voice: FIXED_VOICE,
            lang: FIXED_LANG,
          }),
        });

        if (!res.ok) {
          throw new Error("Edge-TTS endpoint returned an error");
        }

        const blob = await res.blob();

        // Check if aborted while downloading
        if (abortController.signal.aborted) {
          return;
        }

        const audioUrl = URL.createObjectURL(blob);
        audioUrlRef.current = audioUrl;

        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;

        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => {
          setIsSpeaking(false);
          if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
          }
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          fallbackWebSpeech(clean);
        };

        await audio.play();
      } catch (err: any) {
        if (err.name === "AbortError") {
          return; // Intentionally aborted for next message
        }
        console.warn("[Edge-TTS audio playback error, falling back]:", err);
        fallbackWebSpeech(clean);
      }
    },
    [voiceEnabled, fallbackWebSpeech, stopAllAudio, unlockAudioContext],
  );

  // Welcome speech trigger
  const playWelcomeSpeech = useCallback(() => {
    if (!voiceEnabled || typeof window === "undefined") return;
    speakText(INITIAL_SPANISH_MESSAGE);
  }, [voiceEnabled, speakText]);

  // Toggle voice mute
  const toggleVoice = () => {
    if (isSpeaking) {
      stopAllAudio();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  // Toggle speech recognition (mic)
  const toggleListening = () => {
    unlockAudioContext();
    if (!recognitionRef.current) {
      alert(
        "El reconocimiento de voz está disponible en Google Chrome y Microsoft Edge.",
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (isSpeaking) {
        stopAllAudio();
      }
      try {
        recognitionRef.current.start();
      } catch {
        recognitionRef.current.stop();
      }
    }
  };

  // Send message to API
  const handleSendMessage = async (textToSend?: string) => {
    unlockAudioContext();
    if (autoSendTimeoutRef.current) {
      clearTimeout(autoSendTimeoutRef.current);
      autoSendTimeoutRef.current = null;
    }
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    // Immediately stop any previous audio or in-flight TTS
    stopAllAudio();

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const historyContext = messages
        .filter((m) => m.id !== "welcome-1")
        .slice(-8)
        .map((m) => ({
          role: m.sender === "user" ? "user" : "model",
          text: m.text,
        }));

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: query,
          history: historyContext,
          language: FIXED_LANG,
          products: liveProducts.map((p) => ({
            id: p.id,
            name: p.name,
            nameEn: p.nameEn,
            category: p.category,
            price: p.price,
            originalPrice: p.originalPrice,
            unit: p.unit,
            unitEn: p.unitEn,
            inStock: p.inStock,
            badge: p.badge,
            badgeEn: p.badgeEn,
            description: p.description,
            descriptionEn: p.descriptionEn,
            rating: p.rating,
            reviewsCount: p.reviewsCount,
            emoji: p.emoji,
          })),
        }),
      });

      const data = await response.json();
      const answer =
        data?.answer ||
        "¡Por supuesto! En SuperBarrio disponemos de una excelente selección de frutas y verduras frescas de huerta con reparto rápido en 25 minutos. ¿Deseas consultar algún producto o precio en particular?";

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: answer,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botMsg]);
      speakText(answer);
    } catch {
      const errorMsg: Message = {
        id: `bot-err-${Date.now()}`,
        sender: "bot",
        text: "Lo sentimos, no hemos podido conectar en este momento. Por favor, inténtalo de nuevo.",
        timestamp: "Ahora",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Hide on checkout / order success to avoid distraction
  if (pathname.includes("/checkout") || pathname.includes("/order-success")) {
    return null;
  }

  return (
    <>
      {/* ─── 1. FLOATING CIRCULAR BUTTON (Bottom-Left Circle, matching WhatsApp on right) ─── */}
      {!isOpen && hasCookieConsent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className={`fixed z-40 transition-all duration-300 ${
            totalItems > 0
              ? "bottom-[calc(62px+env(safe-area-inset-bottom,0px)+54px)]"
              : "bottom-[calc(3.75rem+env(safe-area-inset-bottom)+12px)]"
          } start-3 sm:start-4 md:bottom-8 md:start-8`}
        >
          <button
            onClick={() => {
              unlockAudioContext();
              setIsOpen(true);
              if (voiceEnabled) {
                playWelcomeSpeech();
              }
            }}
            className="group relative flex h-[52px] w-[52px] sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-[0_10px_25px_-5px_rgba(16,185,129,0.55)] border-2 border-emerald-300/40 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:shadow-[0_14px_30px_-5px_rgba(16,185,129,0.75)] active:scale-95 select-none"
            aria-label="Abrir Asistente por Voz de SuperBarrio"
            title="SuperBarrio AI • Asistente por Voz"
          >
            {/* Pulsing online badge */}
            <span className="absolute -top-1 -end-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-80" />
              <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-[#0d1612] bg-emerald-400" />
            </span>

            {/* Brand Logo Icon */}
            <LeafIcon className="h-6 w-6 text-white drop-shadow-sm transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />

            {/* Tooltip on desktop hover */}
            <div className="hidden sm:group-hover:flex absolute -top-10 start-0 whitespace-nowrap rounded-xl bg-gray-950/95 border border-emerald-500/30 px-3 py-1.5 text-[11px] font-bold text-white shadow-xl pointer-events-none items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>SuperBarrio AI • Asistente por Voz</span>
            </div>
          </button>
        </motion.div>
      )}

      {/* ─── 2. FLOATING VOICE BOT WINDOW (Clean & Professional) ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-6 sm:start-6 z-50 flex w-full sm:w-[410px] max-h-[92vh] h-[580px] flex-col rounded-t-[32px] sm:rounded-3xl bg-[#0d1612]/95 border-t sm:border border-emerald-900/50 shadow-[0_-10px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl text-white overflow-hidden"
          >
            {/* Native Mobile Bottom Sheet Grab Handle */}
            <div className="sm:hidden flex justify-center pt-2 pb-0.5 bg-gradient-to-r from-[#12221b] to-[#0c1813]">
              <div className="h-1.5 w-12 rounded-full bg-emerald-800/60" />
            </div>

            {/* ── Top Header (Clean, Zero Clutter) ── */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5 bg-gradient-to-r from-[#12221b] to-[#0c1813]">
              <div className="flex items-center gap-3">
                {/* Logo / Bot Avatar */}
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/30">
                  <LeafIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-outfit text-xs font-black tracking-wider text-white uppercase">
                      SuperBarrio AI
                    </h3>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-semibold text-emerald-400 border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {isSpeaking
                        ? "Hablando..."
                        : isListening
                        ? "Escuchando..."
                        : "En línea"}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400">
                    Asistente inteligente por voz • Supermercado
                  </p>
                </div>
              </div>

              {/* Right Controls: Only Sound & Close (Clean & Sleek) */}
              <div className="flex items-center gap-2">
                {/* Speaker Toggle */}
                <button
                  type="button"
                  onClick={toggleVoice}
                  title={voiceEnabled ? "Silenciar voz" : "Activar voz"}
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                    voiceEnabled
                      ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                      : "bg-white/10 text-gray-400 hover:bg-white/20 border border-white/10"
                  }`}
                >
                  {voiceEnabled ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l4-4m0 0l-4-4m4 4H13"
                      />
                    </svg>
                  )}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    stopAllAudio();
                    if (isListening && recognitionRef.current) {
                      recognitionRef.current.stop();
                    }
                    setIsOpen(false);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-gray-300 transition-colors hover:bg-white/20 hover:text-white border border-white/10"
                  title="Cerrar asistente"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* ── Voice Waveform Bar ── */}
            <div className="flex items-center justify-between border-b border-white/5 bg-emerald-950/40 px-4 py-2 text-xs font-medium text-emerald-300">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px]">
                  {isSpeaking
                    ? "Hablando con voz natural de España..."
                    : isListening
                    ? "Escuchando tu voz... Habla ahora"
                    : "Pulsa el micro para hablar en español o escribe"}
                </span>
              </div>

              {/* Animated Equalizer Waveform */}
              <div className="flex items-center gap-0.5">
                {[0.4, 0.9, 0.5, 1.2, 0.7, 1.4, 0.6, 0.9].map((height, i) => (
                  <span
                    key={i}
                    className={`w-0.5 rounded-full bg-emerald-400 transition-all duration-150 ${
                      isSpeaking || isListening
                        ? "animate-pulse"
                        : "opacity-40"
                    }`}
                    style={{
                      height:
                        isSpeaking || isListening
                          ? `${height * 12}px`
                          : "4px",
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* ── Chat Messages Body ── */}
            <div className="flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-4 space-y-3.5 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Bot Avatar */}
                  {msg.sender === "bot" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-sm shadow-emerald-500/30">
                      <LeafIcon className="h-4 w-4" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm text-left ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-tr-xs"
                        : "bg-white/10 text-gray-100 rounded-tl-xs border border-white/5 backdrop-blur-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed">
                      {msg.text}
                    </p>
                    <span className="mt-1 block text-[9px] opacity-60 text-end">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {/* Quick Action Suggestion Chips (Grounded in real catalog) */}
              {messages.length <= 2 && (
                <div className="pt-2">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300/80">
                    Sugerencias Rápidas
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SPANISH_SUGGESTIONS.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(suggestion)}
                        className="rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5 text-[11px] text-gray-200 transition-all hover:bg-emerald-500/20 hover:border-emerald-400/50 hover:text-white active:scale-95 text-start"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Typing / Loading Indicator */}
              {isLoading && (
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-xs">
                    <LeafIcon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl bg-white/10 px-3 py-2">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Footer Input Area ── */}
            <div className="border-t border-white/10 p-3 bg-[#0a110e]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                {/* Voice Mic Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  title={
                    isListening
                      ? "Escuchando... Haz clic para detener"
                      : "Hablar por micrófono en español"
                  }
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl transition-all ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50"
                      : "bg-white/10 text-gray-300 hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/10"
                  }`}
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                </button>

                {/* Text Input with Real-time Speech-to-Text Live Typing */}
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    if (autoSendTimeoutRef.current) {
                      clearTimeout(autoSendTimeoutRef.current);
                      autoSendTimeoutRef.current = null;
                    }
                    setInputValue(e.target.value);
                  }}
                  placeholder={
                    isListening
                      ? "Escuchando... Tu voz se transcribe aquí..."
                      : "Pregunta por frutas, verduras, precios, ofertas..."
                  }
                  className={`flex-1 rounded-2xl bg-white/10 px-3.5 py-2 text-xs text-white placeholder-gray-400 border transition-all ${
                    isListening
                      ? "border-emerald-400/90 ring-2 ring-emerald-500/40 bg-emerald-950/20 shadow-md shadow-emerald-500/20"
                      : "border-white/10 focus:border-emerald-400/80"
                  } focus:outline-none`}
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                  title="Enviar consulta"
                >
                  <svg
                    className="h-4 w-4 rotate-45 -mt-0.5 -ms-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </form>

              {/* Subtitle / Attribution */}
              <p className="mt-2 text-center text-[10px] text-gray-400/80">
                SuperBarrio AI Voice Assistant • Voz oficial en español
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
