"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// 1. INFORMACIÓN Y BASE DE CONOCIMIENTO (SuperBarrio AI - España)
// ─────────────────────────────────────────────────────────────────────────────
const BUSINESS_CONFIG = {
  botName: "SuperBarrio AI",
  businessName: "SuperBarrio Supermercado",
  welcomeMessage:
    "¡Hola! Bienvenido a SuperBarrio. Soy tu asistente virtual inteligente. Puedes hablarme o escribirme para consultar productos, precios, ofertas o entregas a domicilio.",
  welcomeMessageEn:
    "Hello! Welcome to SuperBarrio. I am your smart virtual assistant. You can speak or type to ask about our fresh products, prices, offers, or home deliveries.",
  supportPhone: "+34 632 250 561",
  supportEmail: "pedidos@superbarrio.es",
  scheduleInfo:
    "Nuestro horario es de lunes a sábado de 09:00 a 21:30 horas ininterrumpidamente, y domingos de 10:00 a 15:00 horas.",
  deliveryInfo:
    "Realizamos entrega exprés en 25 minutos a 2 horas en toda el área local. ¡El envío es totalmente gratuito en compras superiores a 25€! Para pedidos menores, el coste de envío es de solo 2,50€.",
  discountInfo:
    "Introduce el cupón FRESH20 en la pantalla de pago y consigue un 20% de descuento directo en tu compra de hoy.",
  b2bInfo:
    "Disponemos de servicio exclusivo para hostelería, bares y hoteles: suministro diario, albarán de entrega con firma y factura mensual consolidada a 15 o 30 días de crédito.",
  products: [
    { name: "Aceite de Oliva Virgen Extra 5L", price: "38,50 €", category: "Despensa", inStock: true, keywords: ["aceite", "oliva", "virgen"] },
    { name: "Tomates maduros de huerta", price: "2,10 € / kg", category: "Frutas y Verduras", inStock: true, keywords: ["tomate", "tomates", "ensalada"] },
    { name: "Plátanos dulces de Canarias", price: "1,85 € / kg", category: "Frutas y Verduras", inStock: true, keywords: ["plátano", "platano", "plátanos", "banana"] },
    { name: "Leche Entera fresca de Granja", price: "1,45 € / L", category: "Lácteos", inStock: true, keywords: ["leche", "entera", "lácteos"] },
    { name: "Huevos Camperos Granjas España (12 uds)", price: "2,95 € / docena", category: "Lácteos", inStock: true, keywords: ["huevo", "huevos", "camperos"] },
    { name: "Pechuga de Pollo limpia y fresca", price: "6,80 € / kg", category: "Carnicería", inStock: true, keywords: ["pollo", "pechuga", "carne"] },
    { name: "Pan rústico artesano de masa madre", price: "3,20 € / ud", category: "Panadería", inStock: true, keywords: ["pan", "masa madre", "barra"] },
    { name: "Arroz Basmati Premium Imperial 1kg", price: "3,90 € / kg", category: "Despensa", inStock: true, keywords: ["arroz", "basmati"] },
    { name: "Cerveza Alhambra Especial (lata 33cl)", price: "0,75 € / ud", category: "Bebidas", inStock: true, keywords: ["cerveza", "alhambra", "bebida"] },
    { name: "Agua Mineral Natural Sierra 1.5L", price: "0,65 € / ud", category: "Bebidas", inStock: true, keywords: ["agua", "mineral", "botella"] },
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
  const [language, setLanguage] = useState<"es-ES" | "en-US">("es-ES");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: BUSINESS_CONFIG.welcomeMessage,
      time: "Ahora",
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
  // 2. RECONOCIMIENTO DE VOZ POR MICRÓFONO (STT - Speech to Text)
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRec =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;

      if (SpeechRec) {
        const rec = new SpeechRec();
        rec.continuous = false;
        rec.interimResults = true;
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

  // Actualizar idioma del micrófono
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  // ─────────────────────────────────────────────────────────────────────────
  // 3. SÍNTESIS DE VOZ NATURAL (TTS - Microsoft Edge-TTS con voz española)
  // ─────────────────────────────────────────────────────────────────────────
  const speakVoice = useCallback(
    async (text: string) => {
      if (!soundEnabled || typeof window === "undefined") return;

      // Detener audios anteriores
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

      // Intento 1: Edge-TTS endpoint (/api/tts) con voz natural de España
      try {
        setIsSpeaking(true);
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: clean,
            voice: language === "es-ES" ? "es-ES-ElviraNeural" : "en-US-AriaNeural",
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
        // Fallback a SpeechSynthesis del navegador
      }

      // Intento 2: Web Speech Synthesis del navegador (100% Client-Side)
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
    utter.lang = language === "es-ES" ? "es-ES" : "en-US";
    utter.rate = 1.0;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 4. MOTOR INTELIGENTE LOCAL (Respuestas rápidas en español nativo)
  // ─────────────────────────────────────────────────────────────────────────
  const generateLocalAnswer = (query: string): string => {
    const q = query.toLowerCase().trim();

    // Saludos / Buenos días
    if (/hola|buenos d[ií]as|buenas tardes|buenas noches|qu[eé] tal|c[oó]mo est[aá]s|hey|hello|hi\b/.test(q)) {
      return language === "es-ES"
        ? `¡Hola! Muy buenas. Bienvenido a ${BUSINESS_CONFIG.businessName}. ¿En qué producto o servicio te puedo orientar hoy?`
        : `Hello! Welcome to ${BUSINESS_CONFIG.businessName}. How can I assist you with your order today?`;
    }

    // Entregas / Reparto a domicilio / Plazos
    if (/env[ií]o|entrega|reparto|domicilio|cu[aá]nto tarda|tiempo|portes|transporte|delivery|shipping/.test(q)) {
      return BUSINESS_CONFIG.deliveryInfo;
    }

    // Descuentos / Promociones / Cupones
    if (/descuento|oferta|rebaja|cup[oó]n|promo|c[oó]digo|fresh20|promoci[oó]n|discount/.test(q)) {
      return BUSINESS_CONFIG.discountInfo;
    }

    // Teléfono / Contacto / WhatsApp / Email
    if (/tel[eé]fono|contacto|llamar|whatsapp|email|correo|atenci[oó]n|phone|contact/.test(q)) {
      return `Puedes contactar con nosotros en cualquier momento por WhatsApp o teléfono al ${BUSINESS_CONFIG.supportPhone}, o mediante correo electrónico a ${BUSINESS_CONFIG.supportEmail}.`;
    }

    // Horarios de apertura
    if (/horario|abierto|cerrado|abren|cierran|domingo|s[aá]bado|abren hoy/.test(q)) {
      return BUSINESS_CONFIG.scheduleInfo;
    }

    // B2B / Hostelería / Bares / Hoteles / Crédito
    if (/hosteler[ií]a|hotel|bar|restaurante|cr[eé]dito|albar[aá]n|factura|b2b|pago mensual|khata/.test(q)) {
      return BUSINESS_CONFIG.b2bInfo;
    }

    // Catálogo general / Lista completa
    if (/cat[aá]logo|qu[eé] tienen|qu[eé] vend[eé]is|lista|productos|todo lo que hay/.test(q)) {
      const items = BUSINESS_CONFIG.products.map((p) => `${p.name} (${p.price})`).join(", ");
      return `Disponemos de una amplia variedad de productos frescos de calidad: ${items}. ¿Deseas consultar algún artículo en particular?`;
    }

    // Búsqueda específica en productos
    for (const prod of BUSINESS_CONFIG.products) {
      const matchedKeyword = prod.keywords?.some((k) => q.includes(k));
      const matchedName = prod.name.toLowerCase().includes(q) || q.includes(prod.name.toLowerCase().split(" ")[0]);

      if (matchedKeyword || matchedName) {
        return `Sí, tenemos disponible ${prod.name} en nuestra sección de ${prod.category}. Su precio actual es de ${prod.price}. ¿Te gustaría que lo añadamos a tu cesta de la compra?`;
      }
    }

    // Respuesta educada por defecto
    return language === "es-ES"
      ? `He recibido tu consulta. En ${BUSINESS_CONFIG.businessName} disponemos de frutas y verduras frescas de huerta, carnes selectas, lácteos de granja, panadería y bodega con entrega rápida en 25 minutos. ¿Te gustaría consultar el precio de algún producto concreto?`
      : `Thank you for asking! In ${BUSINESS_CONFIG.businessName} we stock fresh local produce, dairy, bakery, meat, and beverages with 25-minute fast delivery. Feel free to ask about any price, discount, or schedule!`;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 5. ENVÍO DE MENSAJES Y CONEXIÓN
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

    // Paso A: Intentar conexión con Gemini si está configurado en /api/gemini
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
      // Si la API falla, usamos el motor local
    }

    // Paso B: Motor inteligente local en español
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

  // Activar / Desactivar Micrófono
  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("El micrófono por voz es compatible con navegadores Google Chrome y Microsoft Edge.");
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

  // Activar / Silenciar Sonido
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
      {/* ─── BOTÓN FLOTANTE INFERIOR ─── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-emerald-600 px-4 py-3 text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-emerald-700 active:scale-95 cursor-pointer"
          style={{ boxShadow: "0 10px 25px -5px rgba(5, 150, 105, 0.5)" }}
          aria-label="Abrir Asistente Virtual"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
          <span className="text-sm font-bold tracking-wide">Asistente por Voz</span>
        </button>
      )}

      {/* ─── VENTANA MODAL DE CHAT Y VOZ ─── */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col h-[540px] w-[370px] max-w-[calc(100vw-32px)] rounded-3xl bg-white shadow-2xl border border-gray-200/80 overflow-hidden font-sans transition-all duration-300 animate-in fade-in zoom-in-95 dark:bg-gray-900 dark:border-gray-800"
          style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
        >
          {/* Encabezado */}
          <div className="flex items-center justify-between bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 px-4 py-3.5 text-white">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
                <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
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
                    <span className="text-amber-200 font-medium">Hablando...</span>
                  ) : isListening ? (
                    <span className="text-red-200 font-medium animate-pulse">Escuchando...</span>
                  ) : (
                    <span>En línea • Asistente Virtual</span>
                  )}
                </p>
              </div>
            </div>

            {/* Botones del encabezado */}
            <div className="flex items-center gap-1.5">
              {/* Selector de idioma */}
              <button
                onClick={() => setLanguage(language === "es-ES" ? "en-US" : "es-ES")}
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 transition cursor-pointer"
                title="Cambiar idioma"
              >
                {language === "es-ES" ? "ES" : "EN"}
              </button>

              {/* Silenciar / Activar sonido */}
              <button
                onClick={toggleSound}
                className={`p-1.5 rounded-lg border border-white/20 transition cursor-pointer text-xs ${
                  soundEnabled ? "bg-white/15 hover:bg-white/25 text-white" : "bg-red-500/40 text-red-100"
                }`}
                title={soundEnabled ? "Silenciar voz" : "Activar voz"}
              >
                {soundEnabled ? "🔊" : "🔇"}
              </button>

              {/* Botón Cerrar */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-white transition cursor-pointer text-xs font-bold"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Barra de sugerencias rápidas */}
          <div className="bg-emerald-50/70 border-b border-emerald-100/60 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar dark:bg-gray-800/60 dark:border-gray-700">
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 whitespace-nowrap">
              Sugerencias:
            </span>
            {[
              "Aceite de oliva",
              "Coste de envío",
              "Código descuento",
              "Horario tienda",
            ].map((pill, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(pill)}
                className="text-[11px] font-medium whitespace-nowrap px-2.5 py-0.5 rounded-full bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-600 hover:text-white transition shadow-2xs dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 cursor-pointer"
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Área de mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8faf9] dark:bg-gray-950">
            {messages.map((m) => {
              const isBot = m.sender === "bot";
              return (
                <div key={m.id} className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`relative max-w-[84%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                      isBot
                        ? "bg-white text-gray-800 border border-gray-200/80 rounded-tl-xs dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200"
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
                          className="text-[10px] text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 font-semibold cursor-pointer"
                          title="Volver a escuchar"
                        >
                          Repetir
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl w-fit dark:bg-emerald-950/50 dark:text-emerald-300">
                <span className="animate-spin inline-block">⏳</span>
                <span>Consultando con el asistente...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Animación de onda sonora (cuando habla el bot) */}
          {isSpeaking && (
            <div className="bg-emerald-950 text-white px-4 py-1.5 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5 items-end h-3">
                  <span className="w-1 bg-amber-400 animate-bounce h-3 rounded-full"></span>
                  <span className="w-1 bg-amber-300 animate-bounce [animation-delay:0.15s] h-2 rounded-full"></span>
                  <span className="w-1 bg-amber-200 animate-bounce [animation-delay:0.3s] h-3 rounded-full"></span>
                </div>
                <span>SuperBarrio AI hablando...</span>
              </div>
              <button
                onClick={toggleSound}
                className="text-[10px] underline text-emerald-200 hover:text-white cursor-pointer"
              >
                Pausar
              </button>
            </div>
          )}

          {/* Barra de entrada y micrófono */}
          <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 dark:bg-gray-900 dark:border-gray-800">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={
                isListening
                  ? "Escuchando, habla ahora..."
                  : "Escribe tu consulta o pulsa el micro..."
              }
              className="flex-1 text-xs border border-gray-200 rounded-full px-3.5 py-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition bg-gray-50 focus:bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />

            {/* Botón de micrófono */}
            <button
              onClick={toggleMic}
              className={`p-2.5 rounded-full transition-all duration-200 shadow-md cursor-pointer ${
                isListening
                  ? "bg-red-500 text-white animate-pulse ring-4 ring-red-200 scale-105"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95"
              }`}
              title={isListening ? "Detener micrófono" : "Hablar por micrófono"}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </button>

            {/* Botón Enviar */}
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-full bg-gray-900 text-white hover:bg-black disabled:opacity-40 transition shadow-sm cursor-pointer dark:bg-emerald-600 dark:hover:bg-emerald-700"
              title="Enviar mensaje"
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
