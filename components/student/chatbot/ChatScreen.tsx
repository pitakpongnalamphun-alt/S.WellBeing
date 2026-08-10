"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  ArrowLeft,
  MessageCircleHeart,
  RotateCcw,
  Send,
} from "lucide-react";
import Link from "next/link";

import { CRISIS_MESSAGE, detectCrisis } from "@/lib/wellai/crisis";
import { cn } from "@/lib/utils";

import { MessageBubble, type Message } from "./MessageBubble";

let counter = 0;
const nextId = () => `m${counter++}`;

const greeting = (): Message => ({
  id: nextId(),
  role: "assistant",
  kind: "reply",
  content:
    "สวัสดี เราคือ Well.AI ผู้ช่วยพูดคุยที่พร้อมรับฟังคุณเสมอนะ 💚 วันนี้มีอะไรอยากเล่าให้ฟังไหม",
});

export function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(() => [greeting()]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  // Once the emergency protocol fires, normal conversation stops: the input is
  // locked and the student is pointed at real help, per the spec.
  const emergency = messages.some((m) => m.kind === "crisis");

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  function append(message: Message) {
    setMessages((prev) => [...prev, message]);
  }

  function reset() {
    setMessages([greeting()]);
    setInput("");
  }


  async function send() {
    const text = input.trim();
    if (!text || sending || emergency) return;

    setInput("");
    append({ id: nextId(), role: "user", kind: "reply", content: text });

    // Safety-critical path runs on the client too: an instant, network-free
    // response so a student in crisis never waits on a round trip.
    if (detectCrisis(text)) {
      append({
        id: nextId(),
        role: "assistant",
        kind: "crisis",
        content: CRISIS_MESSAGE,
      });
      return;
    }

    setSending(true);
    const botId = nextId();
    // Empty streaming bubble → the typing dots show until the first token.
    append({
      id: botId,
      role: "assistant",
      kind: "reply",
      content: "",
      streaming: true,
    });

    try {
      const history = [
        ...messages,
        { role: "user" as const, content: text },
      ].map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const kind =
        (res.headers.get("X-WellAI-Type") as Message["kind"] | null) ?? "reply";

      if (!res.body) throw new Error("no body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === botId ? { ...m, content: acc, kind } : m)),
        );
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId ? { ...m, content: acc, kind, streaming: false } : m,
        ),
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId
            ? {
                ...m,
                content: "ขอโทษนะ ตอนนี้เชื่อมต่อไม่ได้ ลองอีกครั้งได้ไหม",
                streaming: false,
              }
            : m,
        ),
      );
    } finally {
      setSending(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send();
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-linear-to-b from-mint-50/40 to-lavender-50/50">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-neutral-200/80 pb-3 pt-1">
        <Link
          href="/dashboard"
          aria-label="ย้อนกลับ"
          className="-ml-1.5 rounded-xl p-1.5 text-ink-soft transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </Link>
        <span className="flex size-9 items-center justify-center rounded-full bg-mint-100">
          <MessageCircleHeart className="size-5 text-mint-700" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.95rem] font-bold leading-tight text-ink">
            Well.AI
          </span>
          <span className="block text-[0.72rem] text-ink-mute">
            พื้นที่ปลอดภัยของคุณ
          </span>
        </span>
      </header>

      {/* Messages */}
      <div
        className="flex-1 space-y-3 overflow-y-auto py-4"
        aria-live="polite"
        aria-label="บทสนทนากับ Well.AI"
      >
        <p className="mx-auto max-w-[90%] rounded-xl bg-white/70 px-3 py-2 text-center text-[0.72rem] leading-relaxed text-ink-mute ring-1 ring-neutral-200">
          Well.AI เป็น AI ไม่ใช่นักจิตวิทยา หากต้องการความช่วยเหลือด่วน โทร 1323
        </p>
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <div ref={endRef} />
      </div>

      {/* Composer — locked once the emergency protocol has fired. */}
      {emergency ? (
        <div className="flex items-center justify-between gap-3 border-t border-neutral-200/80 pb-1 pt-3">
          <p className="text-[0.78rem] leading-relaxed text-ink-soft">
            เราหยุดบทสนทนาไว้ก่อนเพื่อความปลอดภัย ลองโทรสายด่วนด้านบนนะ
          </p>
          <button
            type="button"
            onClick={reset}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-neutral-300 px-3 py-2 text-[0.8rem] font-medium text-ink-soft transition-colors hover:text-ink"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            เริ่มใหม่
          </button>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="flex items-end gap-2 border-t border-neutral-200/80 pb-1 pt-3"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="พิมพ์สิ่งที่อยากเล่า…"
            aria-label="พิมพ์ข้อความถึง Well.AI"
            className="max-h-32 min-h-[2.75rem] flex-1 resize-none rounded-2xl border border-neutral-300 bg-white px-3.5 py-2.5 text-[0.9rem] text-ink placeholder:text-ink-mute focus:border-mint-400 focus:outline-none focus:ring-4 focus:ring-mint-100"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            aria-label="ส่งข้อความ"
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-2xl transition-all",
              !input.trim() || sending
                ? "cursor-not-allowed bg-neutral-200 text-ink-mute"
                : "bg-mint-700 text-white hover:bg-mint-600 active:translate-y-px",
            )}
          >
            <Send className="size-5" aria-hidden="true" />
          </button>
        </form>
      )}
    </div>
  );
}
