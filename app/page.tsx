
"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "You" | "Chahat";
  text: string;
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const value = message.trim();

    if (!value || loading) return;

    setMessages((current) => [
      ...current,
      { role: "You", text: value },
    ]);

    setMessage("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: value }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || `Request failed (${response.status})`
        );
      }

      setMessages((current) => [
        ...current,
        {
          role: "Chahat",
          text: data.reply || "I couldn't generate a response. Try again.",
        },
      ]);
    } catch (err) {
      const reason =
        err instanceof Error
          ? err.message
          : "Unknown connection error.";

      setError(reason);

      setMessages((current) => [
        ...current,
        {
          role: "Chahat",
          text: "I couldn't complete your request. Check the error below and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#08080c] text-white flex items-center justify-center p-4 sm:p-6">
      <section className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#101016] shadow-2xl">
        <header className="border-b border-white/10 p-6 sm:p-8">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-2xl font-bold shadow-lg">
            C
          </div>

          <p className="text-xs font-medium tracking-[0.3em] text-violet-300">
            PERSONAL AI ASSISTANT
          </p>

          <h1 className="mt-3 text-5xl font-bold tracking-tight sm:text-6xl">
            Chahat<span className="text-violet-400">.</span>
          </h1>

          <p className="mt-3 text-sm text-zinc-400">
            Your ideas. Your assistant. One conversation.
          </p>

          <div className="mt-5 flex items-center gap-2 text-xs text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Assistant interface ready
          </div>
        </header>

        <div className="flex min-h-[320px] max-h-[55vh] flex-col gap-5 overflow-y-auto p-5 sm:p-7">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/10 text-2xl">
                ✦
              </div>

              <h2 className="text-xl font-semibold">
                Welcome to Chahat
              </h2>

              <p className="mt-2 max-w-sm text-sm text-zinc-500">
                Start a conversation, ask a question, or work through an idea.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {[
                  "Introduce yourself",
                  "Help me plan my day",
                  "Teach me something new",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setMessage(suggestion)}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:border-violet-400/50 hover:bg-violet-500/10"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((item, index) => (
              <div
                key={`${index}-${item.role}`}
                className={`flex flex-col ${
                  item.role === "You" ? "items-end" : "items-start"
                }`}
              >
                <span className="mb-2 text-xs text-zinc-500">
                  {item.role}
                </span>

                <div
                  className={`max-w-[90%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[80%] ${
                    item.role === "You"
                      ? "rounded-br-sm bg-violet-600 text-white"
                      : "rounded-bl-sm border border-white/10 bg-[#1a1a24] text-zinc-200"
                  }`}
                >
                  {item.text}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="text-sm text-violet-300 animate-pulse">
              Chahat is thinking...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {error && (
          <div className="mx-5 mb-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300 sm:mx-7">
            Error: {error}
          </div>
        )}

        <form
          className="border-t border-white/10 p-4 sm:p-6"
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage();
          }}
        >
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#08080c] p-2 focus-within:border-violet-400/50">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Message Chahat..."
              aria-label="Message Chahat"
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
            />

            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>

          <p className="mt-3 text-center text-xs text-zinc-600">
            Chahat AI · Responses may occasionally be inaccurate.
          </p>
        </form>
      </section>
    </main>
  );
}
