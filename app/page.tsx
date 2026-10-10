"use client";

import { useState } from "react";

type Message = {
  role: "You" | "Chahat";
  text: string;
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    const value = message.trim();

    if (!value || loading) return;

    setMessages((current) => [
      ...current,
      { role: "You", text: value },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: value }),
      });

      const data = await response.json();

      setMessages((current) => [
        ...current,
        {
          role: "Chahat",
          text: data.reply || "Something went wrong.",
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "Chahat",
          text: "I couldn't connect to my backend.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <section className="w-full max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
        <div className="mb-8">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl font-bold text-black">
            C
          </div>

          <p className="text-xs tracking-[0.3em] text-zinc-500">
            PERSONAL AI ASSISTANT
          </p>

          <h1 className="mt-2 text-6xl font-bold tracking-tight">
            Chahat
          </h1>

          <p className="mt-2 text-zinc-500">
            Your intelligent personal assistant.
          </p>
        </div>

        <div className="mb-4 min-h-64 rounded-2xl border border-zinc-800 bg-black p-5">
          {messages.length === 0 ? (
            <div className="flex min-h-52 items-center justify-center text-zinc-600">
              Start a conversation with Chahat.
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((item, index) => (
                <div key={index}>
                  <p className="text-xs text-zinc-500">{item.role}</p>
                  <p className="mt-1">{item.text}</p>
                </div>
              ))}

              {loading && (
                <p className="text-sm text-zinc-500">
                  Chahat is thinking...
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Talk to Chahat..."
            className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            className="rounded-xl bg-white px-6 font-semibold text-black disabled:opacity-50"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </section>
    </main>
  );
}        