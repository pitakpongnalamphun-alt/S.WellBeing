"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, Moon, Phone, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { ScreenHeader } from "@/components/student/ScreenHeader";
import { LocationPicker } from "@/components/shared/LocationPicker";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Place } from "@/data/locations";
import { useSosStore } from "@/lib/store/useSosStore";
import { useUserStore } from "@/lib/store/useUserStore";
import { cn } from "@/lib/utils";

/* ============================================================================
   ขอความช่วยเหลือด่วน — two modes.

   1) "ในเวลาเรียน": staff are on campus, so we alert the duty teacher and tell
      them where the student is (the location-picker flow).
   2) "นอกเวลา": staff aren't around, so an in-app alert to a teacher would sit
      unread. Instead we hand the student the outside 24-hour hotlines to call.

   The mode auto-selects from the clock (Mon–Fri 07:30–16:30 = school hours) but
   the student can always switch — they might be off-campus at noon, or on-campus
   after dark. The time check runs AFTER mount so the server and first client
   paint agree (no hydration mismatch); it defaults to the school flow until then.
   ========================================================================== */

type Mode = "school" | "external";

/** School hours: Mon–Fri 07:30–16:30. Outside this → default to the hotline mode. */
function isSchoolHours(d: Date): boolean {
  const day = d.getDay(); // 0 = Sun … 6 = Sat
  if (day === 0 || day === 6) return false;
  const mins = d.getHours() * 60 + d.getMinutes();
  return mins >= 7 * 60 + 30 && mins < 16 * 60 + 30;
}

/* -- Outside-hours hotlines -------------------------------------------------
   Grouped by what's happening, most urgent first. Each is a tap-to-call. */
type Tone = "danger" | "listen" | "care";
type Hotline = { tel: string; name: string; note: string };
type Group = { heading: string; tone: Tone; items: Hotline[] };

const HOTLINE_GROUPS: Group[] = [
  {
    heading: "อยากมีคนรับฟัง / รู้สึกแย่มาก",
    tone: "listen",
    items: [
      { tel: "1323", name: "สายด่วนสุขภาพจิต", note: "ฟรี ตลอด 24 ชั่วโมง" },
      { tel: "02-113-6789", name: "สะมาริตันส์", note: "รับฟัง เป็นความลับ · ทุกวัน 12:00–22:00" },
      { tel: "1387", name: "สายเด็ก (Childline)", note: "สำหรับเยาวชนต่ำกว่า 18 · 24 ชม." },
    ],
  },
  {
    heading: "อันตรายถึงชีวิต / ฉุกเฉิน",
    tone: "danger",
    items: [
      { tel: "1669", name: "การแพทย์ฉุกเฉิน", note: "เจ็บป่วยหรือบาดเจ็บฉุกเฉิน" },
      { tel: "191", name: "ตำรวจ", note: "ตกอยู่ในอันตรายตอนนี้" },
    ],
  },
  {
    heading: "ถูกทำร้าย / ไม่ปลอดภัยที่บ้าน",
    tone: "care",
    items: [
      { tel: "1300", name: "ศูนย์ช่วยเหลือสังคม", note: "ตลอด 24 ชั่วโมง" },
    ],
  },
  {
    heading: "เรื่องสารเสพติด / อยากเลิกยา",
    tone: "care",
    items: [
      { tel: "1165", name: "สายด่วนบำบัดยาเสพติด", note: "ปรึกษาและประเมินตัวเอง" },
    ],
  },
];

const TONE: Record<Tone, { card: string; badge: string; title: string }> = {
  danger: {
    card: "bg-risk-high-bg ring-risk-high/30",
    badge: "bg-risk-high text-white",
    title: "text-risk-high",
  },
  listen: {
    card: "bg-sky-50 ring-sky-200",
    badge: "bg-white text-sky-600",
    title: "text-sky-700",
  },
  care: {
    card: "bg-white ring-neutral-200",
    badge: "bg-neutral-100 text-ink-soft",
    title: "text-ink",
  },
};

function CallCard({ hotline, tone }: { hotline: Hotline; tone: Tone }) {
  const t = TONE[tone];
  return (
    <a
      href={`tel:${hotline.tel}`}
      className={cn(
        "flex items-center gap-3 rounded-2xl p-3.5 ring-1 transition active:scale-[0.99]",
        t.card,
      )}
    >
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          t.badge,
        )}
      >
        <Phone className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block text-[0.92rem] font-bold", t.title)}>
          {hotline.name}
        </span>
        <span className="mt-0.5 block text-[0.78rem]">
          <span className={cn("font-bold", t.title)}>โทร {hotline.tel}</span>
          <span className="text-ink-soft"> · {hotline.note}</span>
        </span>
      </span>
    </a>
  );
}

/* -- The mode switcher ------------------------------------------------------ */
function ModeToggle({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
}) {
  return (
    <div className="flex rounded-full bg-slate-100 p-1 text-sm font-semibold">
      {(
        [
          ["school", "ในเวลาเรียน", Clock],
          ["external", "นอกเวลา", Moon],
        ] as [Mode, string, typeof Clock][]
      ).map(([id, label, Icon]) => {
        const active = mode === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={active}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 transition",
              active
                ? "bg-white text-slate-700 shadow-sm"
                : "text-slate-400 hover:text-slate-600",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * The school-mode flow is a small state machine designed against accidental and
 * prank presses WITHOUT slowing a real emergency:
 *
 *   form → countdown (5s, big cancel) → sent (can withdraw "กดผิด") → cancelled
 *
 * While this device's alert is still active, revisiting the page resumes the
 * "sent" screen instead of letting the button be spammed into duplicate alerts.
 */
type Phase = "form" | "countdown" | "sent" | "cancelled";
const COUNTDOWN_SECONDS = 5;

export default function SosPage() {
  const [mode, setMode] = useState<Mode>("school");
  const [mounted, setMounted] = useState(false);

  // Resolve the time-based default after mount (hydration-safe).
  useEffect(() => {
    setMounted(true);
    setMode(isSchoolHours(new Date()) ? "school" : "external");
  }, []);

  // School-mode flow state.
  const [place, setPlace] = useState<Place | null>(null);
  const [phase, setPhase] = useState<Phase>("form");
  const [count, setCount] = useState(COUNTDOWN_SECONDS);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const [moving, setMoving] = useState(false);
  const raiseSos = useSosStore((s) => s.raise);
  const cancelSos = useSosStore((s) => s.cancel);
  const updateSosPlace = useSosStore((s) => s.updatePlace);
  const alerts = useSosStore((s) => s.alerts);
  const lastRaisedId = useSosStore((s) => s.lastRaisedId);
  const profileName = useUserStore((s) => s.profile?.username);

  // The alert this device raised, if it's still live — spam guard + resume.
  const myActive = mounted
    ? (alerts.find((a) => a.id === lastRaisedId && a.status === "active") ?? null)
    : null;
  // เหตุเดียวกันแต่ไม่กรองสถานะ — ใช้ตอบคำถามที่คนกดปุ่มอยากรู้ที่สุดว่า
  // "มีคนเห็นหรือยัง" SosSync ดึงของจริงมาเป็นระยะ พอครูกดรับเรื่องหน้านี้จึงเปลี่ยนเอง
  const myAlert = mounted
    ? (alerts.find((a) => a.id === lastRaisedId) ?? null)
    : null;
  useEffect(() => {
    if (myActive && phase === "form") setPhase("sent");
  }, [myActive, phase]);

  // The armed press. Set when the countdown starts, cleared ONLY by an explicit
  // cancel — whoever finds it armed (the tick, a visibility change, or the
  // unmount cleanup) sends it. An emergency button fails toward sending, never
  // toward silence: locking the phone or navigating away mid-countdown must
  // not swallow the alert.
  const pendingRef = useRef<{ place: Place; name?: string } | null>(null);

  function fireSend() {
    const p = pendingRef.current;
    if (!p) return;
    pendingRef.current = null;
    raiseSos(p.place, p.name);
    setConfirmWithdraw(false);
    setMoving(false);
    setPhase("sent");
  }

  // Wall-clock countdown: the deadline is an absolute timestamp, so a browser
  // that throttles/suspends timers in a hidden tab can only DELAY the check —
  // the moment anything runs again past the deadline, the alert goes out.
  useEffect(() => {
    if (phase !== "countdown" || deadline === null) return;
    const check = () => {
      const remaining = deadline - Date.now();
      if (remaining <= 0) fireSend();
      else setCount(Math.max(1, Math.ceil(remaining / 1000)));
    };
    check();
    const t = window.setInterval(check, 250);
    document.addEventListener("visibilitychange", check);
    return () => {
      window.clearInterval(t);
      document.removeEventListener("visibilitychange", check);
      // Unmounting mid-countdown (e.g. bottom-nav navigation) without an
      // explicit cancel: the press stands — send now rather than never.
      fireSend();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, deadline]);

  function startCountdown() {
    if (!place) return;
    pendingRef.current = { place, name: profileName?.trim() || undefined };
    setCount(COUNTDOWN_SECONDS);
    setDeadline(Date.now() + COUNTDOWN_SECONDS * 1000);
    setPhase("countdown");
  }

  function cancelCountdown() {
    pendingRef.current = null;
    setDeadline(null);
    setPhase("form");
  }

  function withdraw() {
    if (myActive) cancelSos(myActive.id);
    setConfirmWithdraw(false);
    setPhase("cancelled");
  }

  // -- Countdown: the deliberate-action gate ---------------------------------
  if (mode === "school" && phase === "countdown") {
    return (
      <div className="space-y-5">
        <ScreenHeader title="กำลังส่ง SOS" />
        <Card className="border-l-4 border-l-risk-high p-6 text-center">
          <p className="text-[0.9rem] text-ink-soft">จะส่งแจ้งเตือนถึงครูเวรใน</p>
          <p
            className="mt-2 text-[3rem] font-bold tabular-nums leading-none text-risk-high"
            role="timer"
            aria-live="polite"
          >
            {count}
          </p>
          <p className="mt-2 text-[0.82rem] text-ink-mute">
            📍 {place?.th} · ยังยกเลิกได้ ไม่มีอะไรถูกส่งไปตอนนี้
          </p>
        </Card>
        <Button fullWidth size="lg" variant="outline" onClick={cancelCountdown}>
          ยกเลิก — ฉันไม่ได้ตั้งใจกด
        </Button>
      </div>
    );
  }

  // -- Cancelled: gentle, guilt-free ----------------------------------------
  if (mode === "school" && phase === "cancelled") {
    return (
      <div className="space-y-5">
        <ScreenHeader title="ยกเลิกแล้ว" />
        <Card className="border-l-4 border-l-mint-500 p-5">
          <p className="text-[0.95rem] font-medium text-ink">ยกเลิกการแจ้งให้แล้ว</p>
          <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-soft">
            ไม่เป็นไรเลย ทุกคนกดพลาดกันได้ —
            และถ้าเกิดเหตุจริงเมื่อไหร่ กดใหม่ได้เสมอ ครูพร้อมไปหาเธอทันที
          </p>
        </Card>
        <Button fullWidth size="lg" variant="outline" onClick={() => setPhase("form")}>
          กลับไปหน้าแจ้งเหตุ
        </Button>
      </div>
    );
  }

  // -- Sent: teacher paged; the student can still withdraw a mistaken press --
  if (mode === "school" && phase === "sent") {
    const sentPlace = myActive?.place.th ?? place?.th;
    const ackAt = myAlert?.acknowledgedAt;
    const closed = myAlert?.status === "resolved";
    const ackTime = ackAt
      ? new Date(ackAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
      : null;
    return (
      <div className="space-y-5">
        <ScreenHeader title="ส่งแล้ว" />
        {/* สถานะจริงจากฝั่งครู ไม่ใช่ข้อความให้กำลังใจลอย ๆ — ตราบใดที่ยังไม่มีใคร
            กดรับเรื่อง หน้านี้ต้องไม่บอกว่า "มีคนกำลังไป" เพราะยังไม่จริง */}
        <Card
          className={cn(
            "border-l-4 p-5",
            closed ? "border-l-mint-500" : ackAt ? "border-l-mint-600" : "border-l-risk-high",
          )}
        >
          {closed ? (
            <>
              <p className="text-[0.95rem] font-medium text-ink">
                เจ้าหน้าที่ปิดเหตุนี้แล้ว
              </p>
              <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-soft">
                ถ้ายังไม่ปลอดภัย กดแจ้งใหม่ได้ทันที หรือโทร 1323 ได้ตลอดเวลา
              </p>
            </>
          ) : ackAt ? (
            <>
              <p className="flex items-center gap-2 text-[0.95rem] font-medium text-ink">
                <span className="size-2 animate-pulse rounded-full bg-mint-500" />
                {myAlert?.acknowledgedBy ?? "ครูเวร"} รับเรื่องแล้ว กำลังไปหาคุณ
              </p>
              <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-soft">
                อยู่ตรงนั้นก่อนถ้าปลอดภัย ที่
                <span className="font-medium text-ink"> {sentPlace}</span>
                {ackTime ? <span className="text-ink-mute"> · รับเรื่อง {ackTime} น.</span> : null}
              </p>
            </>
          ) : (
            <>
              <p className="text-[0.95rem] font-medium text-ink">
                ส่งถึงครูเวรแล้ว — กำลังรอครูกดรับเรื่อง
              </p>
              <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-soft">
                อยู่ตรงนั้นก่อนถ้าปลอดภัย ที่
                <span className="font-medium text-ink"> {sentPlace}</span>
                <span className="block text-ink-mute">
                  พอมีครูรับเรื่อง หน้านี้จะขึ้นชื่อครูที่กำลังไปหาคุณ
                </span>
              </p>
            </>
          )}
        </Card>

        <a
          href="tel:1323"
          className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-neutral-200"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-risk-high-bg">
            <Phone className="size-5 text-risk-high" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-[0.88rem] font-medium text-ink">
              สายด่วนสุขภาพจิต 1323
            </span>
            <span className="text-[0.76rem] text-ink-mute">
              ฟรี ตลอด 24 ชั่วโมง
            </span>
          </span>
        </a>

        {/* Situation changed ≠ mistake: moving updates the SAME live alert —
            no cancel, no gap with nothing active, no false-alarm label. */}
        {myActive && (
          <div className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
            {moving ? (
              <div className="space-y-2">
                <p className="text-[0.82rem] font-medium text-ink">ตอนนี้อยู่ตรงไหน</p>
                <LocationPicker
                  value={null}
                  onChange={(p) => {
                    if (p) updateSosPlace(myActive.id, p);
                    setMoving(false);
                  }}
                  placeholder="เลือกจุดใหม่ที่คุณอยู่"
                />
                <button
                  type="button"
                  onClick={() => setMoving(false)}
                  className="text-[0.76rem] font-medium text-ink-mute hover:text-ink"
                >
                  ไม่เปลี่ยนแล้ว
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setMoving(true)}
                className="w-full text-left text-[0.84rem] font-medium text-mint-700 hover:underline"
              >
                📍 ฉันย้ายจุดแล้ว — อัปเดตตำแหน่งให้ครู
              </button>
            )}
          </div>
        )}

        {/* Withdrawing a live alert takes TWO deliberate taps — a fumbled touch
            (or someone else's finger) must not silently kill an emergency. */}
        {myActive &&
          (confirmWithdraw ? (
            <div className="flex items-center justify-between gap-2 rounded-2xl bg-neutral-50 px-4 py-3 ring-1 ring-neutral-200">
              <span className="text-[0.8rem] text-ink">
                ยืนยันยกเลิก? ครูจะไม่ไปหาแล้วนะ
              </span>
              <span className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={withdraw}
                  className="rounded-lg bg-white px-3 py-1.5 text-[0.78rem] font-medium text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50"
                >
                  ยืนยัน
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmWithdraw(false)}
                  className="rounded-lg px-2.5 py-1.5 text-[0.78rem] font-medium text-ink-mute hover:text-ink"
                >
                  ไม่ใช่
                </button>
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmWithdraw(true)}
              className="w-full rounded-2xl bg-neutral-50 px-4 py-3 text-[0.82rem] text-ink-soft ring-1 ring-neutral-200 transition hover:text-ink"
            >
              ฉันกดผิด — ยกเลิกการแจ้งนี้
            </button>
          ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ScreenHeader title="ขอความช่วยเหลือ" />

      <ModeToggle mode={mode} onChange={setMode} />

      {mode === "school" ? (
        <div className="space-y-5">
          <p className="text-[0.85rem] leading-relaxed text-ink-soft">
            ครูเวรจะไปหาคุณ — บอกว่าตอนนี้คุณอยู่ตรงไหน (ใช้ตอนอยู่ในโรงเรียน)
          </p>

          <div>
            <p className="mb-2 text-[0.85rem] font-medium text-ink">
              ตอนนี้อยู่ตรงไหน
            </p>
            <LocationPicker
              value={place}
              onChange={setPlace}
              placeholder="ค้นหาหรือเลือกจุดที่คุณอยู่"
            />
          </div>

          <p className="rounded-xl bg-neutral-50 p-3.5 text-[0.78rem] leading-relaxed text-ink-soft ring-1 ring-neutral-200">
            ครูเวรและครูแนะแนวจะเห็นชื่อ จุดที่คุณอยู่ และเวลาที่คุณกดส่ง
            ข้อความนี้ไม่ถูกส่งให้นักเรียนคนอื่น
          </p>

          <Button
            fullWidth
            size="lg"
            variant="danger"
            disabled={!place}
            onClick={startCountdown}
          >
            ส่งแจ้งเตือน
          </Button>
          <p className="text-center text-[0.72rem] text-ink-mute">
            กดแล้วมีเวลานับถอยหลัง {COUNTDOWN_SECONDS} วินาทีให้ยกเลิกก่อนส่งจริง
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-[0.85rem] leading-relaxed text-ink-soft">
            ตอนนี้ครูอาจไม่อยู่ที่โรงเรียน — แต่มีสายด่วนที่พร้อมช่วยเธอ
            <span className="font-medium text-ink"> ตลอด 24 ชั่วโมง</span> กดเพื่อโทรได้เลย
          </p>

          {HOTLINE_GROUPS.map((group) => (
            <div key={group.heading} className="space-y-2">
              <p className="text-[0.8rem] font-semibold text-ink">
                {group.heading}
              </p>
              {group.items.map((hotline) => (
                <CallCard key={hotline.tel} hotline={hotline} tone={group.tone} />
              ))}
            </div>
          ))}

          {/* Non-urgent things route to the ticket a teacher reads next workday. */}
          <Link
            href="/report"
            className="flex items-center gap-3 rounded-2xl bg-mint-50 p-3.5 ring-1 ring-mint-200/70 transition active:scale-[0.99]"
          >
            <ShieldCheck className="size-5 shrink-0 text-mint-600" aria-hidden="true" />
            <span className="text-[0.8rem] leading-snug text-ink-soft">
              ถ้าเป็นเรื่องที่รอถึงพรุ่งนี้ได้ แจ้งครูผ่าน{" "}
              <span className="font-semibold text-mint-700">Safe-Ticket</span>{" "}
              ครูจะเห็นในวันทำการถัดไป
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
