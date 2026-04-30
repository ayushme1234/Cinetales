"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Loader2, X, Bot } from "lucide-react";

interface Props {
  title: string;
  mediaType: "movie" | "tv";
  year?: string;
  overview?: string;
}

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What's this actually about?",
  "Will I cry?",
  "Is it scary?",
  "Spoiler: how does it end?",
  "What should I watch first?",
  "Best scene?",
];

export function AIChat({ title, mediaType, year, overview }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, busy]);

  async function send(msg: string) {
    if (!msg.trim() || busy) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: msg }];
    setMessages(next);
    setBusy(true);

    // Add empty assistant message that we'll stream into
    setMessages([...next, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          mediaType,
          year,
          overview,
          history: messages,
          message: msg,
        }),
      });
      if (!res.ok || !res.body) throw new Error("chat failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((curr) => {
          const copy = [...curr];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch {
      setMessages((curr) => {
        const copy = [...curr];
        copy[copy.length - 1] = {
          role: "assistant",
          content: "AI hiccupped. Try again?",
        };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open AI chat"
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-electric px-5 py-3 font-bold uppercase tracking-wider text-cream brut hover:brightness-110"
        >
          <Bot size={20} />
          <span className="hidden sm:inline">Ask AI</span>
          <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-acid" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed inset-x-3 bottom-3 z-40 flex max-h-[80vh] flex-col rounded-3xl bg-cream brut sm:bottom-5 sm:right-5 sm:left-auto sm:w-[420px] scale-in">
          <header className="flex items-center justify-between gap-2 border-b-[2.5px] border-ink p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-acid brut-soft">
                <Bot size={18} />
              </span>
              <div>
                <div className="font-bold leading-none">Ask CineTales AI</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-ink/50">
                  about · {title}
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="grid h-9 w-9 place-items-center rounded-lg brut-soft hover:bg-electric hover:text-cream"
            >
              <X size={16} />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <>
                <div className="rounded-2xl bg-acid p-4 brut-soft">
                  <p className="text-sm font-medium">
                    Hey! I'm Llama, running on Groq. Ask me anything about{" "}
                    <span className="font-bold">{title}</span> — I'll keep it spoiler-free unless
                    you ask otherwise.
                  </p>
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-ink/50">
                  Try one of these:
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      disabled={busy}
                      className="rounded-full bg-cream px-3 py-1.5 text-xs font-bold brut-soft hover:bg-tangerine"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl bg-cobalt px-4 py-2.5 text-sm text-cream brut-soft"
                    : "mr-auto max-w-[90%] rounded-2xl bg-cream px-4 py-2.5 text-sm leading-relaxed brut-soft"
                }
              >
                {m.content || (
                  <span className="inline-flex items-center gap-1 text-ink/50">
                    <Loader2 size={12} className="animate-spin" /> thinking...
                  </span>
                )}
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t-[2.5px] border-ink p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 1000))}
              placeholder={busy ? "thinking..." : "Ask anything..."}
              disabled={busy}
              className="flex-1 rounded-xl border-[2.5px] border-ink bg-cream px-3 py-2 text-sm font-medium outline-none focus:bg-acid disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || busy}
              className="grid h-10 w-10 place-items-center rounded-xl bg-electric text-cream brut-soft disabled:opacity-40"
              aria-label="Send"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
