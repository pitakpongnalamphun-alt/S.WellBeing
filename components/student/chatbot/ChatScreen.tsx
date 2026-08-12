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
  CalendarDays,
  RotateCcw,
  Send,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import { Puy, type PuyExpression } from "@/components/Puy";
import { CRISIS_MESSAGE, detectCrisis } from "@/lib/wellai/crisis";
import { useChatStore } from "@/lib/store/useChatStore";
import { cn } from "@/lib/utils";

import { MessageBubble, type Message } from "./MessageBubble";

let counter = 0;
const nextId = () => `m${counter++}`;

/**
 * ปุ่มเริ่มบทสนทนา — ไม่ได้มีไว้ให้สะดวก แต่มีไว้บอกว่า "เรื่องแค่นี้ก็เล่าได้"
 *
 * เด็กที่กดเข้ามาแล้วเจอกล่องเปล่ามักปิดทิ้ง เพราะไม่รู้ว่าเรื่องของตัวเอง "ใหญ่พอ"
 * หรือเปล่า ปุ่มพวกนี้ตอบคำถามนั้นให้ก่อนที่เขาจะต้องถาม
 *
 * "ไม่รู้จะเริ่มยังไง" คือปุ่มที่จำเป็นที่สุดในห้าปุ่ม — มันอนุญาตให้เด็กที่ยังไม่มีคำพูด
 * ได้เริ่มโดยไม่ต้องมีคำพูด ห้ามตัดออกเวลาปรับรายการนี้
 *
 * กดแล้วส่งเป็นข้อความของนักเรียนเอง ไม่ใช่เมนูที่กดแล้วได้คำตอบสำเร็จรูป —
 * บทสนทนาต้องยังเป็นของเขา
 */
const STARTERS = [
  "วันนี้เหนื่อยมาก",
  "อยากระบายเฉย ๆ",
  "ทะเลาะกับเพื่อน",
  "ที่บ้านกดดัน",
  "ไม่รู้จะเริ่มยังไง",
];

/** จำนวนข้อความล่าสุดที่ส่งเป็นบริบทให้โมเดล — บทสนทนายาวไม่ได้แปลว่าต้องส่งทั้งหมด */
const HISTORY_TURNS = 20;

/** คุยกันกี่ตาแล้วปุยถึงจะชวนไปหาคนจริง */
const NUDGE_AFTER = 6;

export function ChatScreen() {
  const ready = useChatStore((s) => s.ready);
  const messages = useChatStore((s) => s.messages);
  const append = useChatStore((s) => s.append);
  const clearChat = useChatStore((s) => s.clear);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  /** ฟองที่กำลังสตรีมอยู่ — เก็บในหน้าจอ ไม่เขียนลงเครื่องทีละตัวอักษร */
  const [pending, setPending] = useState<Message | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [nudgeClosed, setNudgeClosed] = useState(false);
  const [stageGone, setStageGone] = useState(false);
  const [mounted, setMounted] = useState(false);

  // หน้านี้ถูก prerender ตอน build โดยที่ยังไม่มีบทสนทนา ส่วนในเครื่องจริงอาจมีของเก่า
  // อยู่แล้วตั้งแต่ก่อน React จะ hydrate — ถ้า render ของเก่าตั้งแต่จังหวะแรก
  // มาร์กอัปสองฝั่งจะไม่ตรงกัน จึงรอให้ mount ก่อนค่อยแสดงอะไรก็ตามที่มาจากสโตร์
  useEffect(() => setMounted(true), []);
  const hydrated = mounted && ready;

  const started = hydrated && messages.length > 0;

  // Once the emergency protocol fires, normal conversation stops: the input is
  // locked and the student is pointed at real help, per the spec.
  //
  // บทสนทนาถูกเก็บลงเครื่องแล้ว ล็อกนี้จึงอยู่ข้ามการรีเฟรชด้วย — เจตนา: เด็กที่กลับ
  // เข้ามาหลังเจอด่านฉุกเฉินจะเห็นเบอร์สายด่วนก่อนเสมอ และปลดล็อกได้ด้วยปุ่ม
  // "เริ่มใหม่" ที่อยู่ตรงนั้นเลย
  const emergency = hydrated && messages.some((m) => m.kind === "crisis");
  const userTurns = hydrated ? messages.filter((m) => m.role === "user").length : 0;
  const showNudge = !emergency && !nudgeClosed && userTurns >= NUDGE_AFTER;

  const endRef = useRef<HTMLDivElement>(null);
  /** เพิ่งส่งข้อความในรอบนี้จริง ๆ หรือแค่กลับเข้ามาเจอของเก่า */
  const sentThisSession = useRef(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending, showNudge]);

  // ฉากเปิดย่อตัวลงก่อน แล้วค่อยถอดออกจากหน้า — ระหว่างนั้นปุ่มเริ่มบทสนทนาถูกปิด
  // ไว้ด้วย ไม่งั้นมันยังโฟกัสด้วยคีย์บอร์ดได้ทั้งที่มองไม่เห็นแล้ว
  useEffect(() => {
    if (!started) {
      setStageGone(false);
      return;
    }
    // เพิ่งพิมพ์เอง → ให้ฉากเปิดย่อขึ้นไปให้เห็น
    // กลับเข้ามาเจอบทสนทนาเก่า → เก็บทันที ไม่ต้องเล่นแอนิเมชันที่ไม่มีใครสั่ง
    const t = setTimeout(
      () => setStageGone(true),
      sentThisSession.current ? 480 : 0,
    );
    return () => clearTimeout(t);
  }, [started]);

  /**
   * สีหน้าของปุยผูกกับ "สถานะที่รู้จริง" เท่านั้น ไม่ใช่การเดาอารมณ์ของนักเรียน —
   * ถ้าเดาผิด เด็กที่เพิ่งเล่าเรื่องหนักแล้วเจอปุยยิ้มแป้น จะรู้สึกแย่กว่าไม่มีหน้าเลย
   */
  const expression: PuyExpression = emergency
    ? "worry" // คิ้วห่วง ไม่ยิ้ม และหยุดขยับทั้งตัว
    : sending || input.trim()
      ? "think" // มองลง — ตั้งใจฟังตอนนักเรียนพิมพ์ และตอนปุยกำลังเรียบเรียงคำตอบ
      : started
        ? "listen"
        : "greet";

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || sending || emergency) return;

    setInput("");
    sentThisSession.current = true;
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
    // ฟองว่าง ๆ ที่ยังสตรีม → จุดสามจุดจะขึ้นจนกว่าตัวอักษรแรกจะมา
    setPending({
      id: botId,
      role: "assistant",
      kind: "reply",
      content: "",
      streaming: true,
    });

    let acc = "";
    let kind: Message["kind"] = "reply";
    try {
      // อ่านจากสโตร์ตรง ๆ ไม่ใช่ค่าที่ปิดทับมาตอน render — ข้อความที่เพิ่ง append
      // ไปเมื่อกี้ยังไม่อยู่ใน closure นี้
      const history = useChatStore
        .getState()
        .messages.filter((m) => m.kind === "reply")
        .slice(-HISTORY_TURNS)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      kind = (res.headers.get("X-WellAI-Type") as Message["kind"] | null) ?? "reply";

      if (!res.body) throw new Error("no body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setPending((p) => (p ? { ...p, content: acc, kind } : p));
      }
    } catch {
      acc = "ขอโทษนะ ตอนนี้ปุยเชื่อมต่อไม่ได้ ลองอีกครั้งได้ไหม";
      kind = "reply";
    } finally {
      // เขียนลงเครื่องครั้งเดียวตอนจบ ไม่ใช่ทุกตัวอักษร
      append({ id: botId, role: "assistant", kind, content: acc });
      setPending(null);
      setSending(false);
    }
  }

  function reset() {
    clearChat();
    setPending(null);
    setInput("");
    setConfirmClear(false);
    setNudgeClosed(false);
    sentThisSession.current = false;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-linear-to-b from-mint-50/40 to-lavender-50/50">
      {/* Header — ปุยตัวเล็กจะปรากฏตรงนี้หลังฉากเปิดย่อตัวลงไปแล้ว */}
      <header className="flex items-center gap-3 border-b border-neutral-200/80 pb-3 pt-1">
        <Link
          href="/dashboard"
          aria-label="ย้อนกลับ"
          className="-ml-1.5 rounded-xl p-1.5 text-ink-soft transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </Link>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center transition-all duration-500",
            started ? "scale-100 opacity-100" : "scale-75 opacity-0",
          )}
          aria-hidden="true"
        >
          <Puy expression={expression} size={32} float={false} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.95rem] font-bold leading-tight text-ink">
            น้องปุย
          </span>
          <span className="block text-[0.72rem] text-ink-mute">
            {emergency
              ? "หยุดคุยไว้ก่อนเพื่อความปลอดภัย"
              : sending
                ? "ปุยกำลังคิดอยู่…"
                : "กำลังฟังอยู่"}
          </span>
        </span>

        {/* ปุ่มลบต้องเห็นได้ตลอด ไม่ใช่ซ่อนในเมนู — บทสนทนาถูกเก็บไว้ในเครื่องนี้ */}
        {started ? (
          <button
            type="button"
            onClick={() => (confirmClear ? reset() : setConfirmClear(true))}
            onBlur={() => setConfirmClear(false)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[0.75rem] font-medium transition-colors",
              confirmClear
                ? "bg-rose-100 text-rose-700"
                : "text-ink-mute hover:text-ink",
            )}
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            {confirmClear ? "กดอีกครั้งเพื่อลบ" : "ลบบทสนทนา"}
          </button>
        ) : null}
      </header>

      {/* Messages */}
      <div
        className="flex-1 space-y-3 overflow-y-auto py-4"
        aria-live="polite"
        aria-label="บทสนทนากับน้องปุย"
      >
        <p className="mx-auto max-w-[90%] rounded-xl bg-white/70 px-3 py-2 text-center text-[0.72rem] leading-relaxed text-ink-mute ring-1 ring-neutral-200">
          น้องปุยเป็น AI ไม่ใช่นักจิตวิทยา หากต้องการความช่วยเหลือด่วน โทร 1323
        </p>

        {!stageGone ? (
          <div
            className={cn(
              "overflow-hidden transition-all duration-500 ease-out",
              started
                ? "max-h-0 -translate-y-2 opacity-0"
                : "max-h-[30rem] translate-y-0 opacity-100",
            )}
          >
            <div className="flex flex-col items-center gap-3 px-2 pb-2 pt-6 text-center">
              <Puy expression={expression} size={116} />
              <h1 className="font-display th:leading-snug mt-1 text-[1.05rem] font-bold text-ink">
                วันนี้อยากเล่าอะไรให้ปุยฟังไหม
              </h1>
              <p className="max-w-[22rem] text-[0.82rem] leading-relaxed text-ink-mute">
                ไม่ต้องเรียบเรียงก็ได้ พิมพ์มามั่ว ๆ ปุยอ่านออก
              </p>
              <div className="mt-1 flex flex-wrap justify-center gap-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={started}
                    onClick={() => void send(s)}
                    className="rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 text-[0.8rem] text-ink-soft transition-colors hover:border-mint-400 hover:text-ink"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {hydrated
          ? messages.map((m) => <MessageBubble key={m.id} message={m} />)
          : null}
        {pending ? <MessageBubble message={pending} /> : null}

        {/* ปุยไม่เคยแข่งกับคนจริง — คุยกันมาหลายตาแล้วก็ชวนไปหาคนที่ช่วยได้จริง */}
        {showNudge ? (
          <div className="mx-auto flex max-w-[92%] items-start gap-3 rounded-2xl bg-lavender-50 p-3.5 ring-1 ring-lavender-200">
            <span className="mt-0.5 shrink-0" aria-hidden="true">
              <Puy expression="cheer" size={34} float={false} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[0.84rem] leading-relaxed text-ink">
                ปุยฟังต่อได้เรื่อย ๆ นะ แต่ถ้าเรื่องนี้หนักจริง ๆ
                คนที่ช่วยได้จริงคือคนที่อยู่ตรงหน้า
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <Link
                  href="/appointments"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-lavender-600 px-3 py-1.5 text-[0.78rem] font-semibold text-white transition-colors hover:bg-lavender-700"
                >
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  ดูเวลาที่คุยกับครูได้
                </Link>
                <button
                  type="button"
                  onClick={() => setNudgeClosed(true)}
                  className="rounded-xl px-2.5 py-1.5 text-[0.78rem] text-ink-mute transition-colors hover:text-ink"
                >
                  ไว้ก่อน
                </button>
              </div>
            </div>
          </div>
        ) : null}

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
          className="border-t border-neutral-200/80 pb-1 pt-3"
        >
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="พิมพ์สิ่งที่อยากเล่า…"
              aria-label="พิมพ์ข้อความถึงน้องปุย"
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
          </div>
          {/* พูดความจริงเรื่องความจำไว้ตรงนี้ ไม่ปล่อยให้เดาเอาเองจากความอบอุ่นของตัวละคร */}
          <p className="pt-2 text-center text-[0.68rem] leading-relaxed text-ink-mute">
            ปุยจำบทสนทนานี้ได้เฉพาะในเครื่องนี้ ไม่ถูกส่งให้ครูหรือใครทั้งนั้น
          </p>
        </form>
      )}
    </div>
  );
}
