"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

export default function GeminiChat() {
  const t = useTranslations("geminiChat");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    const prompt = input.trim();
    if (!prompt) return;
    setMessages((prev) => [...prev, { role: "user", text: prompt }]);
    setInput("");
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", text: t("error", { error: data.error }) }]);
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", text: t("error", { error: (e as Error).message }) }]);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">{t("title")}</h2>
      <div className="rounded-xl bg-white p-4 shadow-theme-md dark:bg-gray-800">
        <div className="flex flex-col gap-4">
          {/* Chat history */}
          <div className="max-h-64 overflow-y-auto space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-lg p-3 text-sm ${msg.role === "user" ? "bg-success-500 text-white" : "bg-gray-100 dark:bg-gray-700"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          {/* Input */}
          <div className="flex gap-2">
            <textarea
              ref={textareaRef}
              rows={2}
              className="flex-1 rounded-lg border border-gray-300 p-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900"
              placeholder={t("placeholder")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {t("send")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

