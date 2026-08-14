import { Phone, ShieldAlert, Siren } from "lucide-react";
import Link from "next/link";

import { CRISIS_HOTLINES } from "@/lib/wellai/crisis";
import { cn } from "@/lib/utils";

export type ChatRole = "user" | "assistant";
export type MessageKind = "reply" | "crisis" | "unconfigured";

export type Message = {
  id: string;
  role: ChatRole;
  content: string;
  kind: MessageKind;
  /** True while text is still streaming in. Empty + streaming shows the dots. */
  streaming?: boolean;
};

/** Three-dot typing indicator — shown while น้องอุ่น is composing a reply. */
export function TypingDots() {
  return (
    <span
      className="flex items-center gap-1 px-1 py-1"
      role="status"
      aria-label="น้องอุ่นกำลังพิมพ์"
    >
      {[0, 160, 320].map((delay) => (
        <span
          key={delay}
          className="size-1.5 animate-bounce rounded-full bg-ink-mute"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

/** A crisis reply: a calm alert with the hotlines as real, tappable call buttons. */
function CrisisBubble({ content }: { content: string }) {
  const lead = content.split("\n")[0];
  const closing = content.split("\n").slice(-1)[0];

  return (
    <div className="max-w-[92%] rounded-2xl rounded-bl-md bg-rose-50 p-4 ring-1 ring-rose-200">
      <span className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-rose-700">
        <ShieldAlert className="size-4" aria-hidden="true" />
        ขอส่งต่อให้คนที่ช่วยได้ทันที
      </span>
      <p className="mt-2 text-[0.9rem] leading-relaxed text-ink">{lead}</p>

      <div className="mt-3 space-y-2">
        {CRISIS_HOTLINES.map((h) => (
          <a
            key={h.tel}
            href={`tel:${h.tel}`}
            className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-rose-200 transition-colors hover:bg-rose-50"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-rose-100">
              <Phone className="size-4 text-rose-600" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-[0.86rem] font-semibold text-ink">
                {h.number}
              </span>
              <span className="block text-[0.72rem] text-ink-mute">
                {h.label}
              </span>
            </span>
          </a>
        ))}
      </div>

      <p className="mt-3 text-[0.84rem] leading-relaxed text-ink-soft">
        {closing}
      </p>

      {/*
        ทางลัดไปหาคนจริงในโรงเรียน — วางไว้ให้กดได้ทันทีในจังหวะที่ด่านฉุกเฉินทำงาน
        แต่ไม่ยิงแจ้งเตือนให้เอง 2 เหตุผล:
        1) ครูเวรที่ได้รับแจ้งต้องรู้ว่าเด็กอยู่ตรงไหนถึงจะไปหาได้ ซึ่งห้องแชทไม่รู้ —
           หน้า /sos ถามสถานที่ก่อนส่ง การยิงแจ้งแบบไม่มีสถานที่คือแจ้งเตือนที่ตามหาใครไม่ได้
        2) ถ้าสิ่งที่พิมพ์ในห้องแชทถูกส่งต่อให้ครูโดยอัตโนมัติ เด็กจะเรียนรู้ว่าที่นี่ไม่ปลอดภัย
           ที่จะพูดความจริง แล้วเราจะไม่ได้ยินอะไรอีกเลย ซึ่งอันตรายกว่า
      */}
      <Link
        href="/sos"
        className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-[0.86rem] font-semibold text-white transition-colors hover:bg-rose-700"
      >
        <Siren className="size-4" aria-hidden="true" />
        แจ้งครูเวรให้มาหาตอนนี้
      </Link>
    </div>
  );
}

export function MessageBubble({ message }: { message: Message }) {
  if (message.kind === "crisis") {
    return (
      <div className="flex justify-start">
        <CrisisBubble content={message.content} />
      </div>
    );
  }

  if (message.kind === "unconfigured") {
    return (
      <div className="flex justify-center">
        <p className="max-w-[92%] rounded-xl bg-amber-50 px-3.5 py-2.5 text-center text-[0.8rem] leading-relaxed text-amber-900 ring-1 ring-amber-200/70">
          {message.content}
        </p>
      </div>
    );
  }

  const isUser = message.role === "user";
  const waiting = message.streaming && !message.content;

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[0.9rem] leading-relaxed",
          isUser
            ? "rounded-br-md bg-mint-100 text-ink"
            : "rounded-bl-md bg-white text-ink shadow-[0_2px_14px_-6px_rgba(15,32,25,0.22)] ring-1 ring-neutral-100",
        )}
      >
        {waiting ? <TypingDots /> : message.content}
        {message.streaming && message.content ? (
          <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-ink-mute align-middle" />
        ) : null}
      </div>
    </div>
  );
}
