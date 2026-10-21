
"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState
} from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const suggestions = [
  "Introduce yourself",
  "Help me plan my day",
  "Teach me something new",
  "Explain a difficult topic in Hindi"
];

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    });
  }, [messages, loading]);

  async function sendMessage(
    event?: FormEvent<HTMLFormElement>,
    suggestedMessage?: string
  ) {
    event?.preventDefault();

    const text = (suggestedMessage ?? input).trim();

    if (!text || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content
          }))
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : `Request failed (${response.status})`
        );
      }

      if (typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("Chahat returned an empty response.");
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply
        }
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Connection failed. Please try again."
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <main className="min-h-screen bg-midnight px-3 py-4 text-white sm:px-6 sm:py-8">
      <section className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-panel shadow-2xl sm:min-h-[calc(100dvh-4rem)]">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xl font-bold shadow-lg shadow-violet-950/40">
              C
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Chahat<span className="text-violet-400"> AI</span>
              </h1>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Personal assistant
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (loading) return;
              setMessages([]);
              setError("");
              setInput("");
            }}
            disabled={loading || messages.length === 0}
            className="rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-300 transition hover:bg-white/5 disabled:opacity-40"
          >
            New chat
          </button>
        </header>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-6 sm:px-7">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-violet-400/20 bg-violet-500/10 text-4xl text-violet-300">
                ✦
              </div>

              <p className="text-xs font-medium tracking-[0.3em] text-violet-300">
                YOUR PERSONAL AI
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
                What&apos;s on your mind?
              </h2>

              <p className="mt-4 max-w-md text-sm leading-6 text-zinc-400">
                Ask questions, explore ideas, learn new skills,
                or plan your next move with Chahat.
              </p>

              <div className="mt-8 grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      void sendMessage(undefined, suggestion);
                    }}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left text-sm text-zinc-300 transition hover:border-violet-400/40 hover:bg-violet-500/[0.06] disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={`flex flex-col ${
                    message.role === "user"
                      ? "items-end"
                      : "items-start"
                  }`}
                >
                  <span className="mb-2 px-1 text-xs text-zinc-500">
                    {message.role === "user" ? "You" : "Chahat"}
                  </span>

                  <div
                    className={`max-w-[92%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-7 sm:max-w-[82%] ${
                      message.role === "user"
                        ? "rounded-br-sm bg-violet-600 text-white"
                        : "rounded-bl-sm border border-white/10 bg-[#191923] text-zinc-200"
                    }`}
                  >
                    {message.content}
                  </div>
                </article>
              ))}

              {loading && (
                <div className="flex items-center gap-3 self-start rounded-2xl border border-white/10 bg-[#191923] px-4 py-3 text-sm text-violet-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
                  Chahat is thinking...
                </div>
              )}
            </>
          )}

          <div ref={bottomRef} />
        </div>

        {error && (
          <div
            role="alert"
            className="mx-4 mb-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300 sm:mx-7"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={(event) => void sendMessage(event)}
          className="border-t border-white/10 p-4 sm:p-6"
        >
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#08080c] p-2 transition focus-within:border-violet-400/50">
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Message Chahat..."
              aria-label="Message Chahat"
              autoComplete="off"
              maxLength={8000}
              disabled={loading}
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-zinc-600 disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>

          <p className="mt-3 text-center text-xs text-zinc-600">
            Chahat AI can make mistakes. Verify important information.
          </p>
        </form>
      </section>
    </main>
  );
}
