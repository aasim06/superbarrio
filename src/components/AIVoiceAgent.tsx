"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// 1. APNE NAYE PROJECT KI INFORMATION YAHAN EDIT KAREIN (Customizable Knowledge)
// ─────────────────────────────────────────────────────────────────────────────
const BUSINESS_CONFIG = {
  botName: "SuperBarrio AI",
  businessName: "SuperBarrio Store",
  welcomeMessage:
    "السلام علیکم! میں آپ کا AI Voice Assistant ہوں۔ آپ مجھ سے بول کر یا لکھ کر ہماری پروڈکٹس، قیمتوں، ڈلیوری یا کسی بھی چیز کے بارے میں پوچھ سکتے ہیں۔",
  welcomeMessageEn:
    "Hello! I am your AI Voice Assistant. You can speak or type to ask about our products, prices, delivery, or services.",
  supportPhone: "+34 632 250 561",
  deliveryInfo:
    "ہماری ایکسپریس ڈلیوری صرف 25 منٹ سے 2 گھنٹے میں ہوتی ہے۔ €25 سے زیادہ کے آرڈر پر ڈلیوری بالکل مفت ہے!",
  discountInfo:
    "ابھی چیک آؤٹ پر پرومو کوڈ FRESH20 لگائیں اور 20% فوری رعایت پائیں۔",
  // Apne products ya services ki list yahan add karein:
  products: [
    { name: "تازہ لال ٹماٹر (Tomatoes)", price: "€2.10 / kg", category: "سبزیاں", inStock: true },
    { name: "کینری کے میٹھے کیلے (Bananas)", price: "€1.85 / kg", category: "پھل", inStock: true },
    { name: "خالص فارم فل کریم دودھ (Milk)", price: "€1.45 / L", category: "ڈیری", inStock: true },
    { name: "دیسی فارم کے انڈے (Eggs 12x)", price: "€2.95 / pack", category: "ڈیری", inStock: true },
    { name: "بغیر ہڈی کا چکن بریسٹ (Chicken)", price: "€6.80 / kg", category: "گوشت", inStock: true },
    { name: "روایتی ساورڈو بریڈ (Sourdough Bread)", price: "€3.20 / pc", category: "بیکری", inStock: true },
    { name: "پریمیم ایکسٹرا ورجن زیتون کا تیل (Olive Oil)", price: "€8.50 / bottle", category: "پینٹری", inStock: true },
    { name: "باسمتی چاول (Basmati Rice)", price: "€3.90 / kg", category: "پینٹری", inStock: true },
  ],
};

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
}

export default function AIVoiceAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<"ur-PK" | "en-US">("ur-PK");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: BUSINESS_CONFIG.welcomeMessage,
      time: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const autoSendTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto scroll
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // ─────────────────────────────────────────────────────────────────────────
  // 2. SPEECH RECOGNITION (MIC - STT)
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRec =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;

      if (SpeechRec) {
        const rec = new SpeechRec();
        rec.continuous = false;
        rec.interimResults = true; // Live typing
        rec.lang = language;

        rec.onstart = () => setIsListening(true);
        rec.onend = () => setIsListening(false);
        rec.onerror = () => setIsListening(false);

        rec.onresult = (event: any) => {
          let liveText = "";
          let isFinal = false;

          for (let i = 0; i < event.results.length; i++) {
            liveText += event.results[i][0].transcript;
            if (event.results[i].isFinal) isFinal = true;
          }

          if (liveText) setInput(liveText);

          if (isFinal && liveText.trim()) {
            if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current);
            autoSendTimerRef.current = setTimeout(() => {
              handleSend(liveText.trim());
            }, 700);
          }
        };

        recognitionRef.current = rec;
      }
    }
  }, [language]);

  // Update mic lang
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  // ─────────────────────────────────────────────────────────────────────────
  // 3. VOICE PLAYBACK (TTS - Edge-TTS with WebSpeech fallback)
  // ─────────────────────────────────────────────────────────────────────────
  const speakVoice = useCallback(
    async (text: string) => {
      if (!soundEnabled || typeof window === "undefined") return;

      // Stop previous sounds
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      const clean = text
        .replace(/[*_#`~>•€]/g, "")
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
        .trim();

      // Attempt 1: Try Edge-TTS backend endpoint (if exists)
      try {
        setIsSpeaking(true);
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: clean,
            voice: language === "ur-PK" ? "ur-PK-AsadNeural" : "en-US-AriaNeural",
            lang: language,
          }),
        });

        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          currentAudioRef.current = audio;

          audio.onended = () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(url);
          };
          audio.onerror = () => {
            setIsSpeaking(false);
            fallbackSpeech(clean);
          };

          await audio.play();
          return;
        }
      } catch {
        // Fallback to browser SpeechSynthesis
      }

      // Attempt 2: Browser native Web Speech Synthesis (100% Client-Side)
      fallbackSpeech(clean);
    },
    [soundEnabled, language]
  );

  const fallbackSpeech = (text: string) => {
    if (!soundEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = language === "ur-PK" ? "ur-PK" : "en-US";
    utter.rate = 0.95;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 4. INTELLIGENT LOCAL AI BRAIN (Zero-Dependency & Offline Capable)
  // ─────────────────────────────────────────────────────────────────────────
  const generateLocalAnswer = (query: string): string => {
    const q = query.toLowerCase().trim();

    // Salam / Greetings
    if (/\bsalam\b|سلام|hello|hi\b|hey|kia hal|kya hal|kaise ho|کیسے ہو|کیا حال/.test(q)) {
      return language === "ur-PK"
        ? `وعلیکم السلام! ${BUSINESS_CONFIG.businessName} میں خوش آمدید۔ بتائیے آج آپ کے لیے کیا تازہ سامان نکالیں؟`
        : `Hello! Welcome to ${BUSINESS_CONFIG.businessName}. How may I help you with your order today?`;
    }

    // Delivery / Shipping
    if (/delivery|shipping|ڈیلیوری|kitni der|کتنی دیر|charges|time|ٹائم/.test(q)) {
      return BUSINESS_CONFIG.deliveryInfo;
    }

    // Discount / Offers / Promos
    if (/discount|offer|ڈسکاؤنٹ|promo|code|کوڈ|رعایت|bachat|fresh20|sale/.test(q)) {
      return BUSINESS_CONFIG.discountInfo;
    }

    // Phone / Contact / WhatsApp
    if (/phone|contact|number|whatsapp|فون|نمبر|رابطہ/.test(q)) {
      return `آپ ہمارے کسٹمر سپورٹ یا واٹس ایپ پر براہ راست رابطہ کر سکتے ہیں: ${BUSINESS_CONFIG.supportPhone}`;
    }

    // All Items / Catalog listing
    if (/sub item|sab item|tamam|list|all products|catalog|تمام|کیا کیا|سب کچھ/.test(q)) {
      const items = BUSINESS_CONFIG.products.map((p) => `${p.name} (${p.price})`).join("، ");
      return `ہمارے پاس یہ آئٹمز دستیاب ہیں: ${items}۔ آپ کسی بھی آئٹم کی قیمت یا تفصیل پوچھ سکتے ہیں۔`;
    }

    // Search inside products
    for (const prod of BUSINESS_CONFIG.products) {
      const pName = prod.name.toLowerCase();
      // Simple word match
      const words = q.split(/\s+/).filter((w) => w.length > 2);
      for (const w of words) {
        if (pName.includes(w)) {
          return `جی بالکل! ${prod.name} اسٹاک میں موجود ہے۔ اس کی قیمت ${prod.price} ہے۔ کیا میں اسے آپ کے لیے آرڈر میں نوٹ کر لوں؟`;
        }
      }
    }

    // Default polite response
    return language === "ur-PK"
      ? `جی میں نے آپ کی بات سمجھ لی ہے۔ ${BUSINESS_CONFIG.businessName} میں تازہ پھل، سبزیاں، دودھ، انڈے، چکن اور بیکری آئٹمز دستیاب ہیں۔ آپ کسی مخصوص چیز کا ریٹ یا ڈلیوری ٹائم پوچھ سکتے ہیں!`
      : `Thank you for asking! We have fresh vegetables, fruits, dairy, bakery, and meats in stock. Feel free to ask about any price, discount, or delivery!`;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 5. SEND MESSAGE HANDLER
  // ─────────────────────────────────────────────────────────────────────────
  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || isLoading) return;

    if (autoSendTimerRef.current) {
      clearTimeout(autoSendTimerRef.current);
      autoSendTimerRef.current = null;
    }

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let botAnswer = "";

    // Step A: Agar project mein /api/gemini mojud ho to pehle usay call karein
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          history: messages.slice(-6).map((m) => ({
            role: m.sender === "user" ? "user" : "model",
            text: m.text,
          })),
          language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.answer) botAnswer = data.answer;
      }
    } catch {
      // API call failed ya endpoint nahi hai -> Fallback to Local Brain
    }

    // Step B: Agar Gemini endpoint nahi hai to Local Smart Engine se jawab lein
    if (!botAnswer) {
      botAnswer = generateLocalAnswer(textToSend);
    }

    const botMsg: Message = {
      id: `b-${Date.now()}`,
      sender: "bot",
      text: botAnswer,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, botMsg]);
    setIsLoading(false);
    speakVoice(botAnswer);
  };

  // Toggle mic
  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Mic Chrome ya Microsoft Edge browser mein chalta hai.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (currentAudioRef.current) currentAudioRef.current.pause();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        recognitionRef.current.stop();
      }
    }
  };

  // Toggle mute
  const toggleSound = () => {
    if (isSpeaking) {
      if (currentAudioRef.current) currentAudioRef.current.pause();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setSoundEnabled(!soundEnabled);
  };

  return (
    <>
      {/* ─── FLOATING LAUNCHER PILL (Bottom-Right / Left) ─── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-emerald-600 px-4 py-3 text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-emerald-700 active:scale-95"
          style={{ boxShadow: "0 10px 25px -5px rgba(5, 150, 105, 0.5)" }}
          aria-label="Open AI Voice Assistant"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
          <span className="text-sm font-bold tracking-wide">AI Voice Assistant</span>
        </button>
      )}

      {/* ─── CHAT & VOICE WINDOW MODAL ─── */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col h-[540px] w-[370px] max-w-[calc(100vw-32px)] rounded-3xl bg-white shadow-2xl border border-gray-200/80 overflow-hidden font-sans transition-all duration-300 animate-in fade-in zoom-in-95"
          style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 px-4 py-3.5 text-white">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
                <span className="text-lg">🤖</span>
                {isSpeaking && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-sm font-extrabold tracking-tight leading-tight">
                  {BUSINESS_CONFIG.botName}
                </h4>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  {isSpeaking ? (
                    <span className="text-amber-200 font-medium">🔊 بول رہا ہے...</span>
                  ) : isListening ? (
                    <span className="text-red-200 font-medium animate-pulse">🔴 سن رہا ہے...</span>
                  ) : (
                    <span>آن لائن • لائیو اسسٹنٹ</span>
                  )}
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1.5">
              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === "ur-PK" ? "en-US" : "ur-PK")}
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 transition"
                title="Change Language"
              >
                {language === "ur-PK" ? "اردو" : "EN"}
              </button>

              {/* Sound Mute/Unmute */}
              <button
                onClick={toggleSound}
                className={`p-1.5 rounded-lg border border-white/20 transition ${
                  soundEnabled ? "bg-white/15 hover:bg-white/25" : "bg-red-500/40 text-red-100"
                }`}
                title={soundEnabled ? "Mute Voice" : "Unmute Voice"}
              >
                {soundEnabled ? "🔊" : "🔇"}
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-white transition"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick Suggestions Strip */}
          <div className="bg-emerald-50/70 border-b border-emerald-100/60 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-emerald-800 whitespace-nowrap">تجویز:</span>
            {["ٹماٹر کے ریٹ", "دودھ کا ریٹ", "ڈلیوری چارجز", "ڈسکاؤنٹ کوڈ"].map((pill, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(pill)}
                className="text-[11px] font-medium whitespace-nowrap px-2.5 py-0.5 rounded-full bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-600 hover:text-white transition shadow-2xs"
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8faf9]">
            {messages.map((m) => {
              const isBot = m.sender === "bot";
              return (
                <div key={m.id} className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`relative max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                      isBot
                        ? "bg-white text-gray-800 border border-gray-200/80 rounded-tl-xs"
                        : "bg-emerald-600 text-white rounded-tr-xs"
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <span
                        className={`text-[9px] ${
                          isBot ? "text-gray-400" : "text-emerald-200"
                        }`}
                      >
                        {m.time}
                      </span>
                      {isBot && (
                        <button
                          onClick={() => speakVoice(m.text)}
                          className="text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold"
                          title="Replay Voice"
                        >
                          🔊 سنیں
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl w-fit">
                <span className="animate-spin inline-block">⏳</span>
                <span>AI سوچ رہا ہے...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Sound Wave Animation (When Bot is Speaking) */}
          {isSpeaking && (
            <div className="bg-emerald-900/90 text-white px-4 py-1.5 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5 items-end h-3">
                  <span className="w-1 bg-amber-400 animate-bounce h-3 rounded-full"></span>
                  <span className="w-1 bg-amber-300 animate-bounce [animation-delay:0.15s] h-2 rounded-full"></span>
                  <span className="w-1 bg-amber-200 animate-bounce [animation-delay:0.3s] h-3 rounded-full"></span>
                </div>
                <span>AI بول رہا ہے (Listen)...</span>
              </div>
              <button
                onClick={toggleSound}
                className="text-[10px] underline text-emerald-200 hover:text-white"
              >
                روکیں
              </button>
            </div>
          )}

          {/* Input & Mic Bar */}
          <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={isListening ? "سن رہا ہوں، بولیے..." : "یہاں لکھیں یا مائیک دبائیں..."}
              className="flex-1 text-xs border border-gray-200 rounded-full px-3.5 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition bg-gray-50 focus:bg-white"
            />

            {/* Mic Button */}
            <button
              onClick={toggleMic}
              className={`p-2.5 rounded-full transition-all duration-200 shadow-md ${
                isListening
                  ? "bg-red-500 text-white animate-pulse ring-4 ring-red-200 scale-105"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95"
              }`}
              title={isListening ? "Stop Mic" : "Start Speaking (Mic)"}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </button>

            {/* Send Button */}
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-full bg-gray-900 text-white hover:bg-black disabled:opacity-40 transition shadow-sm"
              title="Send Message"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
