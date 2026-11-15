"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "@/i18n/navigation";
import { LeafIcon } from "@/icons";
import { GROCERY_PRODUCTS } from "@/data/groceryData";
import type { GroceryProduct } from "@/types/grocery";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
}

const URDU_SUGGESTIONS = [
  "تازہ پھل اور سبزیوں کے ریٹ",
  "خالص دودھ، مکھن اور ڈیری",
  "تازہ ساورڈو بریڈ اور بیکری",
  "تازہ مرغی اور گوشت کی قیمت",
  "ڈیلیوری ٹائمنگ اور فری شپنگ",
  "ڈسکاؤنٹ کوڈ اور بچت آفرز",
];

const ENGLISH_SUGGESTIONS = [
  "Fresh Fruits & Vegetables Prices",
  "Fresh Milk, Butter & Dairy Items",
  "Artisan Sourdough & Bakery",
  "Fresh Boneless Chicken Breast",
  "Delivery Time & Free Shipping",
  "Discount Promo Code FRESH20",
];

const INITIAL_URDU_MESSAGE =
  "السلام علیکم! سوپر بیریو گروسری میں خوش آمدید۔ میں آپ کا اے آئی وائس اسسٹنٹ ہوں۔ آپ مجھ سے کسی بھی پھل، سبزی، دودھ، بیکری، قیمتوں یا ڈیلیوری کے بارے میں لائیو پوچھ سکتے ہیں یا بول کر بات کر سکتے ہیں۔";

const isUrduText = (str: string) => /[\u0600-\u06FF]/.test(str);

export default function GroceryAIVoiceBot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<"ur-PK" | "en-US">("ur-PK");
  const [selectedVoice, setSelectedVoice] = useState<
    "ur-PK-AsadNeural" | "ur-PK-UzmaNeural"
  >("ur-PK-AsadNeural");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text: INITIAL_URDU_MESSAGE,
      timestamp: "Just now",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Live product catalog — includes custom products from localStorage
  const [liveProducts, setLiveProducts] =
    useState<GroceryProduct[]>(GROCERY_PRODUCTS);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const autoSendTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // Re-sync whenever admin adds/deletes a product
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

  // Initialize Speech Recognition with live real-time input typing
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
        rec.interimResults = true; // Live typing into input in real-time!
        rec.lang = selectedLang;

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
            // Live-type the spoken words directly into the input field!
            setInputValue(liveTranscript);
          }

          if (isFinal && liveTranscript.trim()) {
            const finalQuery = liveTranscript.trim();
            // Allow the user to see their words written inside the input box,
            // then send it automatically after 750ms
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
  }, [selectedLang]);

  // Update speech recognition language on toggle
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = selectedLang;
    }
  }, [selectedLang]);

  // Fallback to browser SpeechSynthesis
  const fallbackWebSpeech = useCallback(
    (text: string) => {
      if (
        !voiceEnabled ||
        typeof window === "undefined" ||
        !("speechSynthesis" in window)
      )
        return;
      window.speechSynthesis.cancel();
      const clean = text
        .replace(/[*_#`~>•€]/g, "")
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
        .trim();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = selectedLang;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [voiceEnabled, selectedLang],
  );

  // High Quality Edge-TTS Audio Playback (Pakistani Voice: Asad / Uzma)
  const speakText = useCallback(
    async (text: string) => {
      if (!voiceEnabled || typeof window === "undefined") {
        return;
      }

      // Stop any existing playing audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      try {
        setIsSpeaking(true);
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            voice:
              selectedLang === "ur-PK"
                ? selectedVoice
                : "en-US-AriaNeural",
            lang: selectedLang,
          }),
        });

        if (!res.ok) {
          throw new Error("Edge-TTS endpoint returned an error");
        }

        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;

        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          fallbackWebSpeech(text);
        };

        await audio.play();
      } catch (err) {
        console.warn("[Edge-TTS audio playback error, falling back]:", err);
        fallbackWebSpeech(text);
      }
    },
    [voiceEnabled, selectedVoice, selectedLang, fallbackWebSpeech],
  );

  // Toggle voice mute
  const toggleVoice = () => {
    if (isSpeaking) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    }
    setVoiceEnabled(!voiceEnabled);
  };

  // Toggle speech recognition (mic)
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(
        "Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.",
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (isSpeaking) {
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current.currentTime = 0;
        }
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
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
    if (autoSendTimeoutRef.current) {
      clearTimeout(autoSendTimeoutRef.current);
      autoSendTimeoutRef.current = null;
    }
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

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
        .slice(-10)
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
          language: selectedLang,
          // ✅ Pass the live product catalog so AI is grounded in real store data
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
        (selectedLang === "ur-PK"
          ? "جی بالکل، سوپر بیریو میں تمام تازہ گروسری آئٹمز دستیاب ہیں! کسی بھی آئٹم کی قیمت جاننے کے لیے پوچھ سکتے ہیں۔"
          : "Yes, all fresh groceries are in stock at SuperBarrio! Feel free to ask about any price or product.");

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
        text:
          selectedLang === "ur-PK"
            ? "معذرت، رابطہ نہیں ہو سکا۔ براہ کرم دوبارہ کوشش کیجیے۔"
            : "Sorry, network error. Please try again.",
        timestamp: "Now",
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

  const activeSuggestions =
    selectedLang === "ur-PK" ? URDU_SUGGESTIONS : ENGLISH_SUGGESTIONS;

  return (
    <>
      {/* ─── 1. FLOATING PILL BUTTON (Bottom-Left) ─── */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="hidden md:block fixed bottom-8 start-8 z-40"
        >
          <button
            onClick={() => {
              setIsOpen(true);
              if (messages.length === 1 && voiceEnabled) {
                speakText(messages[0].text);
              }
            }}
            className="group flex items-center gap-2.5 sm:gap-3.5 rounded-full bg-gray-950/95 p-2 sm:px-4 sm:py-3 shadow-[0_12px_32px_rgba(0,0,0,0.45)] border border-gray-800/80 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-emerald-500/50 hover:shadow-[0_12px_36px_rgba(16,185,129,0.25)]"
            aria-label="Open SuperBarrio AI Voice Assistant"
          >
            {/* Website Brand Logo Icon (Leaf with Emerald Green gradient) */}
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/30">
              <LeafIcon className="h-5 w-5" />
              {/* Online pulsing dot */}
              <span className="absolute -top-0.5 -end-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full border border-gray-950 bg-emerald-400" />
              </span>
            </div>

            {/* Labels - hidden on mobile for clean circular FAB, expanded on sm+ */}
            <div className="hidden sm:block text-start pe-2">
              <div className="flex items-center gap-1.5">
                <span className="font-outfit text-xs font-black tracking-wider text-white uppercase">
                  SuperBarrio AI
                </span>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400">
                  اردو Voice
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online • Live Chat & Voice
              </div>
            </div>
          </button>
        </motion.div>
      )}

      {/* ─── 2. FLOATING VOICE BOT WINDOW (Bottom-Left Drawer/Modal) ─── */}
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

            {/* ── Top Header ── */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5 bg-gradient-to-r from-[#12221b] to-[#0c1813]">
              <div className="flex items-center gap-2.5">
                {/* Logo / Bot Avatar */}
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/30">
                  <LeafIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-outfit text-xs font-black tracking-wider text-white uppercase">
                      SuperBarrio AI
                    </h3>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {isSpeaking
                        ? "بول رہا ہے..."
                        : isListening
                        ? "سن رہا ہے..."
                        : "آن لائن"}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400">
                    گروسری وائس اور لائیو اسسٹنٹ
                  </p>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-1.5">
                {/* Language Switcher Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    const nextLang =
                      selectedLang === "ur-PK" ? "en-US" : "ur-PK";
                    setSelectedLang(nextLang);
                  }}
                  title="Switch Language"
                  className="rounded-lg bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 text-[10px] font-bold text-emerald-300 transition-all hover:bg-emerald-500/30"
                >
                  {selectedLang === "ur-PK" ? "UR اردو" : "EN English"}
                </button>

                {/* Voice Gender Toggle (Asad / Uzma) in Urdu mode */}
                {selectedLang === "ur-PK" && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedVoice((prev) =>
                        prev === "ur-PK-AsadNeural"
                          ? "ur-PK-UzmaNeural"
                          : "ur-PK-AsadNeural",
                      );
                    }}
                    title="Change Voice (Asad / Uzma)"
                    className="rounded-lg bg-white/10 px-2 py-0.5 text-[10px] font-medium text-gray-300 transition-all hover:bg-white/20"
                  >
                    {selectedVoice === "ur-PK-AsadNeural"
                      ? "اسد"
                      : "عظمیٰ"}
                  </button>
                )}

                {/* Speaker Toggle */}
                <button
                  type="button"
                  onClick={toggleVoice}
                  title={voiceEnabled ? "Mute Voice" : "Enable Voice"}
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                    voiceEnabled
                      ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                      : "bg-white/10 text-gray-400 hover:bg-white/20"
                  }`}
                >
                  {voiceEnabled ? (
                    <svg
                      className="h-3.5 w-3.5"
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
                      className="h-3.5 w-3.5"
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
                    if (currentAudioRef.current) {
                      currentAudioRef.current.pause();
                      currentAudioRef.current.currentTime = 0;
                    }
                    if ("speechSynthesis" in window) {
                      window.speechSynthesis.cancel();
                    }
                    setIsSpeaking(false);
                    if (isListening && recognitionRef.current) {
                      recognitionRef.current.stop();
                    }
                    setIsOpen(false);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-gray-300 transition-colors hover:bg-white/20 hover:text-white"
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
                    ? "نیچرل اردو آواز میں بول رہا ہے..."
                    : isListening
                    ? "آپ کی آواز سنی جا رہی ہے... بولتے رہیے"
                    : selectedLang === "ur-PK"
                    ? "مائیک دبا کر اردو میں بولیں یا لکھیں"
                    : "Speak or type in English"}
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
              {messages.map((msg) => {
                const isUrdu = isUrduText(msg.text);
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === "user"
                        ? "flex-row-reverse"
                        : "flex-row"
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
                      dir={isUrdu ? "rtl" : "ltr"}
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm ${
                        isUrdu ? "text-right font-sans" : "text-left"
                      } ${
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
                );
              })}

              {/* Quick Action Suggestion Chips (Shown on initial state) */}
              {messages.length <= 2 && (
                <div className="pt-2">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300/80">
                    {selectedLang === "ur-PK"
                      ? "فوری سوالات (تجویز کردہ)"
                      : "Quick Suggestions"}
                  </p>
                  <div className="flex flex-wrap gap-1.5" dir={selectedLang === "ur-PK" ? "rtl" : "ltr"}>
                    {activeSuggestions.map((suggestion, idx) => (
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
                      ? "Listening... Click to stop"
                      : "Click to speak in Urdu (مائیک دبائیں)"
                  }
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl transition-all ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50"
                      : "bg-white/10 text-gray-300 hover:bg-emerald-500/20 hover:text-emerald-400"
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
                  dir={selectedLang === "ur-PK" ? "rtl" : "ltr"}
                  onChange={(e) => {
                    if (autoSendTimeoutRef.current) {
                      clearTimeout(autoSendTimeoutRef.current);
                      autoSendTimeoutRef.current = null;
                    }
                    setInputValue(e.target.value);
                  }}
                  placeholder={
                    isListening
                      ? selectedLang === "ur-PK"
                        ? "بولتے رہیے، آواز یہاں لکھی جا رہی ہے..."
                        : "Listening... Speaking is being typed..."
                      : selectedLang === "ur-PK"
                      ? "پھل، دودھ، قیمت یا ڈیلیوری کے بارے میں پوچھیں..."
                      : "Ask about fruits, milk, prices, delivery..."
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
                  title="Send message"
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

              {/* Subtitle / Disclaimer */}
              <p className="mt-2 text-center text-[10px] text-gray-400/80">
                {selectedLang === "ur-PK"
                  ? "سوپر بیریو اے آئی وائس اسسٹنٹ • قدرتی پاکستانی آواز میں جواب"
                  : "SuperBarrio AI Voice Assistant • Natural voice responses"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
