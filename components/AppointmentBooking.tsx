"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  Check,
  Clock,
  Lock,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  COUNSELOR_BY_ID,
  ROLE_META,
  ROLE_ORDER,
  type Counselor,
  type CounselorRole,
} from "@/data/counselors";
import { useStaffAccountsStore } from "@/lib/store/useStaffAccountsStore";
import {
  FORMAT_META,
  STATUS_META,
  useAppointmentStore,
  type Appointment,
  type AppointmentFormat,
} from "@/lib/store/useAppointmentStore";
import { localDay } from "@/lib/date";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------ date helpers */

const THAI_DOW = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const THAI_MON = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

/** Next `n` weekdays (skips Sat/Sun), keyed by local date. */
function upcomingWeekdays(n: number) {
  const out: { iso: string; dow: number; dayNum: number; mon: string }[] = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 0; out.length < n && i < 40; i += 1) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue;
    out.push({ iso: localDay(d), dow, dayNum: d.getDate(), mon: THAI_MON[d.getMonth()] });
  }
  return out;
}

function dateLabel(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return `${THAI_DOW[d.getDay()]} ${d.getDate()} ${THAI_MON[d.getMonth()]}`;
}

const TIMES = ["12:15", "12:45", "15:30", "16:00", "16:30", "17:00"];

/* ------------------------------------------------- live people to book with */

/** Blurb for accounts added after the hand-written counselor list. */
const ROLE_BLURB: Record<CounselorRole, string> = {
  psychologist: "รับฟังเรื่องความรู้สึกอย่างเป็นความลับ",
  counselor: "ปรึกษาเรื่องเรียน อนาคต และเรื่องในโรงเรียน",
  admin: "ช่วยเรื่องการใช้งานแอปและบัญชี",
};

const accountToCounselor = (a: {
  id: string; name: string; role: CounselorRole; title: string; emoji: string;
}): Counselor => ({
  id: a.id,
  name: a.name,
  role: a.role,
  title: a.title,
  emoji: a.emoji,
  blurb: COUNSELOR_BY_ID[a.id]?.blurb ?? ROLE_BLURB[a.role],
});

/**
 * The picker reads the LIVE staff-accounts store, so a teacher added on the
 * admin side is bookable immediately and a deactivated one stops appearing.
 *
 * ดึงทะเบียนกลางจากเซิร์ฟเวอร์ด้วย — ครูที่ผู้ดูแลระบบเพิ่มจากเครื่องอื่นต้องโผล่ใน
 * รายชื่อบนมือถือนักเรียน ไม่ใช่เห็นแต่รายชื่อเริ่มต้นที่ติดมากับแอป
 */
function usePickableCounselors(): Counselor[] {
  const accounts = useStaffAccountsStore((s) => s.accounts);
  const syncFromServer = useStaffAccountsStore((s) => s.syncFromServer);
  useEffect(() => {
    void syncFromServer();
  }, [syncFromServer]);
  return useMemo(
    () => accounts.filter((a) => a.active).map(accountToCounselor),
    [accounts],
  );
}

/** Resolve any counselorId for display — old bookings may point at accounts
 *  that were deactivated or at legacy static ids. */
function useCounselorResolver(): (id: string) => Counselor | undefined {
  const accounts = useStaffAccountsStore((s) => s.accounts);
  return useMemo(() => {
    const byId: Record<string, Counselor> = {};
    for (const a of accounts) byId[a.id] = accountToCounselor(a);
    return (id: string) => byId[id] ?? COUNSELOR_BY_ID[id];
  }, [accounts]);
}

/** Deterministic mock availability, stable across renders. */
function slotTaken(counselorId: string, iso: string, time: string) {
  const s = counselorId + iso + time;
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 4 === 0; // ~25% already booked
}

/* ------------------------------------------------------------ chrome */

const inputClass =
  "w-full rounded-2xl border border-neutral-300 bg-white px-3.5 py-3 text-[0.9rem] text-ink placeholder:text-ink-mute focus:border-mint-400 focus:outline-none focus:ring-4 focus:ring-mint-100";

const STEPS = [
  { n: 1, label: "คนที่คุย" },
  { n: 2, label: "วันเวลา" },
  { n: 3, label: "รายละเอียด" },
  { n: 4, label: "ยืนยัน" },
] as const;

type Tab = "book" | "mine";

/* ============================================================================
   Component
   ========================================================================== */

export function AppointmentBooking({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const appointments = useAppointmentStore((s) => s.appointments);
  const book = useAppointmentStore((s) => s.book);
  const cancel = useAppointmentStore((s) => s.cancel);
  const people = usePickableCounselors();
  const resolve = useCounselorResolver();

  const activeCount = mounted
    ? appointments.filter((a) => a.status === "pending" || a.status === "confirmed").length
    : 0;

  const [tab, setTab] = useState<Tab>("book");

  // --- wizard state ---
  const [step, setStep] = useState(1);
  const [counselorId, setCounselorId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [format, setFormat] = useState<AppointmentFormat>("onsite");
  const [topic, setTopic] = useState("");
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [booked, setBooked] = useState<Appointment | null>(null);

  const dates = useMemo(() => upcomingWeekdays(14), []);

  // Availability is per-person, so switching who you'll see invalidates the
  // chosen slot — clear the date/time when the counselor changes.
  function pickCounselor(id: string) {
    setCounselorId(id);
    setDate(null);
    setTime(null);
  }

  function resetWizard() {
    setStep(1);
    setCounselorId(null);
    setDate(null);
    setTime(null);
    setFormat("onsite");
    setTopic("");
    setName("");
    setRoom("");
    setBooked(null);
  }

  const canAdvance =
    step === 1
      ? counselorId !== null
      : step === 2
        ? date !== null && Boolean(time) // "" (day just changed, no slot yet) must not pass
        : step === 3
          ? name.trim().length > 0
          : true;

  function submit() {
    if (!counselorId || !date || !time || !name.trim()) return;
    if (slotTaken(counselorId, date, time)) return; // backstop: slot no longer free for this person
    const appt = book({ counselorId, date, time, format, topic: topic.trim(), name: name.trim(), room: room.trim() });
    setBooked(appt);
  }

  /* ---- render ---- */

  return (
    <div className={cn("mx-auto w-full max-w-md", className)}>
      {/* Header */}
      <header className="mb-4 flex items-center gap-2">
        <CalendarDays className="size-5 text-mint-600" aria-hidden="true" />
        <div>
          <h1 className="font-display th:leading-snug text-[1.3rem] font-bold text-ink">นัดพูดคุย</h1>
          <p className="text-[0.8rem] text-ink-soft">จองเวลากับคนที่พร้อมรับฟังเธอ</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="mb-5 flex rounded-full bg-slate-100 p-1 text-sm font-semibold">
        {([
          ["book", "นัดใหม่"],
          ["mine", "นัดของฉัน"],
        ] as [Tab, string][]).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              if (id === "book" && booked) resetWizard(); // don't re-show a stale success card
              setTab(id);
            }}
            aria-pressed={tab === id}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 transition",
              tab === id ? "bg-white text-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-600",
            )}
          >
            {label}
            {id === "mine" && activeCount > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-mint-500 text-[0.68rem] font-bold text-white">
                {activeCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "book"
        ? booked
          ? <SuccessCard appt={booked} resolve={resolve} onViewMine={() => { resetWizard(); setTab("mine"); }} onAgain={resetWizard} />
          : (
            <BookWizard
              step={step}
              setStep={setStep}
              canAdvance={canAdvance}
              onSubmit={submit}
              people={people}
              resolve={resolve}
              counselorId={counselorId}
              setCounselorId={pickCounselor}
              dates={dates}
              date={date}
              setDate={setDate}
              time={time}
              setTime={setTime}
              format={format}
              setFormat={setFormat}
              topic={topic}
              setTopic={setTopic}
              name={name}
              setName={setName}
              room={room}
              setRoom={setRoom}
            />
          )
        : <MyAppointments mounted={mounted} appointments={appointments} resolve={resolve} onCancel={cancel} onBook={() => setTab("book")} />}
    </div>
  );
}

/* ============================================================================
   Booking wizard
   ========================================================================== */

type WizardProps = {
  step: number;
  setStep: (n: number) => void;
  canAdvance: boolean;
  onSubmit: () => void;
  people: Counselor[];
  resolve: (id: string) => Counselor | undefined;
  counselorId: string | null;
  setCounselorId: (id: string) => void;
  dates: { iso: string; dow: number; dayNum: number; mon: string }[];
  date: string | null;
  setDate: (iso: string) => void;
  time: string | null;
  setTime: (t: string) => void;
  format: AppointmentFormat;
  setFormat: (f: AppointmentFormat) => void;
  topic: string;
  setTopic: (s: string) => void;
  name: string;
  setName: (s: string) => void;
  room: string;
  setRoom: (s: string) => void;
};

function BookWizard(p: WizardProps) {
  const counselor = p.counselorId ? (p.resolve(p.counselorId) ?? null) : null;
  const isLast = p.step === 4;

  return (
    <div>
      {/* Stepper */}
      <ol className="mb-5 flex items-center">
        {STEPS.map((s, i) => {
          const done = s.n < p.step;
          const active = s.n === p.step;
          return (
            <li key={s.n} className={cn("flex items-center", i < STEPS.length - 1 && "flex-1")}>
              <div className="flex flex-col items-center gap-1">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-[0.72rem] font-bold transition-colors",
                    active && "bg-mint-600 text-white",
                    done && "bg-mint-100 text-mint-700",
                    !active && !done && "bg-neutral-100 text-ink-mute",
                  )}
                >
                  {done ? <Check className="size-3.5" aria-hidden="true" /> : s.n}
                </span>
                <span className={cn("text-[0.64rem] font-medium", active ? "text-ink" : "text-ink-mute")}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span className={cn("mx-1 -mt-4 h-0.5 flex-1 rounded-full", done ? "bg-mint-400" : "bg-neutral-200")} />
              )}
            </li>
          );
        })}
      </ol>

      {/* Step body */}
      <div key={p.step} className="animate-rise">
        {p.step === 1 && (
          <StepCounselor people={p.people} counselorId={p.counselorId} onPick={p.setCounselorId} />
        )}
        {p.step === 2 && (
          <StepWhen
            counselorId={p.counselorId!}
            dates={p.dates}
            date={p.date}
            setDate={p.setDate}
            time={p.time}
            setTime={p.setTime}
          />
        )}
        {p.step === 3 && (
          <StepDetails
            format={p.format}
            setFormat={p.setFormat}
            topic={p.topic}
            setTopic={p.setTopic}
            name={p.name}
            setName={p.setName}
            room={p.room}
            setRoom={p.setRoom}
          />
        )}
        {p.step === 4 && counselor && (
          <StepConfirm counselor={counselor} date={p.date!} time={p.time!} format={p.format} topic={p.topic} name={p.name} room={p.room} />
        )}
      </div>

      {/* Footer nav */}
      <div className="mt-6 flex items-center gap-3">
        {p.step > 1 ? (
          <button
            type="button"
            onClick={() => p.setStep(p.step - 1)}
            className="flex min-h-12 items-center gap-1.5 rounded-2xl border border-neutral-300 px-4 text-[0.88rem] font-medium text-ink-soft transition hover:border-neutral-400 hover:text-ink"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            ย้อนกลับ
          </button>
        ) : (
          <span className="min-h-12" />
        )}

        {isLast ? (
          <button
            type="button"
            onClick={p.onSubmit}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-mint-700 px-4 text-[0.9rem] font-medium text-white shadow-[0_10px_24px_-14px_rgba(12,92,63,0.9)] transition hover:bg-mint-600"
          >
            ยืนยันการนัด
            <ShieldCheck className="size-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => p.canAdvance && p.setStep(p.step + 1)}
            aria-disabled={!p.canAdvance}
            className={cn(
              "flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl px-4 text-[0.9rem] font-medium text-white transition-all",
              p.canAdvance
                ? "bg-mint-700 shadow-[0_10px_24px_-14px_rgba(12,92,63,0.9)] hover:bg-mint-600"
                : "cursor-not-allowed bg-neutral-300",
            )}
          >
            ถัดไป
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

/* -- Step 1: choose who ---------------------------------------------------- */

function StepCounselor({
  people: allPeople,
  counselorId,
  onPick,
}: {
  people: Counselor[];
  counselorId: string | null;
  onPick: (id: string) => void;
}) {
  return (
    <div className="space-y-5">
      <p className="text-[0.85rem] text-ink-soft">อยากคุยกับใครดี? เลือกคนที่ตรงกับเรื่องของเธอที่สุด</p>
      {ROLE_ORDER.map((role: CounselorRole) => {
        const meta = ROLE_META[role];
        const people = allPeople.filter((c) => c.role === role);
        if (people.length === 0) return null;
        return (
          <div key={role}>
            <div className="mb-2 flex items-center gap-2">
              <span className={cn("grid size-8 place-items-center rounded-xl text-lg", meta.tint)} aria-hidden="true">
                {meta.emoji}
              </span>
              <div>
                <p className="text-[0.82rem] font-bold text-ink">{meta.label}</p>
                <p className="text-[0.7rem] text-ink-mute">{meta.desc}</p>
              </div>
            </div>
            <div className="space-y-2">
              {people.map((c) => {
                const selected = counselorId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onPick(c.id)}
                    aria-pressed={selected}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border-2 bg-white p-3.5 text-left transition active:scale-[0.99]",
                      selected ? cn("ring-2 ring-offset-1", meta.ring, "border-transparent") : "border-neutral-200 hover:border-neutral-300",
                    )}
                  >
                    <span className={cn("grid size-11 shrink-0 place-items-center rounded-full text-xl", meta.soft)} aria-hidden="true">
                      {c.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-[0.9rem] font-bold text-ink">{c.name}</span>
                        <span className={cn("rounded-full px-2 py-0.5 text-[0.66rem] font-semibold", meta.soft, meta.ink)}>{c.title}</span>
                      </span>
                      <span className="mt-0.5 block text-[0.74rem] leading-snug text-ink-mute">{c.blurb}</span>
                    </span>
                    {selected && (
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-mint-600">
                        <Check className="size-3.5 text-white" aria-hidden="true" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* -- Step 2: when ---------------------------------------------------------- */

function StepWhen({
  counselorId,
  dates,
  date,
  setDate,
  time,
  setTime,
}: {
  counselorId: string;
  dates: { iso: string; dow: number; dayNum: number; mon: string }[];
  date: string | null;
  setDate: (iso: string) => void;
  time: string | null;
  setTime: (t: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-[0.85rem] font-medium text-ink">เลือกวัน</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {dates.map((d) => {
            const selected = date === d.iso;
            return (
              <button
                key={d.iso}
                type="button"
                onClick={() => {
                  setDate(d.iso);
                  setTime(""); // clear time when day changes
                }}
                aria-pressed={selected}
                className={cn(
                  "flex min-w-[3.6rem] shrink-0 flex-col items-center gap-0.5 rounded-2xl border-2 px-2 py-2.5 transition active:scale-95",
                  selected ? "border-transparent bg-mint-600 text-white ring-2 ring-mint-400 ring-offset-1" : "border-neutral-200 bg-white text-ink hover:border-neutral-300",
                )}
              >
                <span className={cn("text-[0.68rem] font-medium", selected ? "text-white/80" : "text-ink-mute")}>{THAI_DOW[d.dow]}</span>
                <span className="text-[1.1rem] font-bold leading-none">{d.dayNum}</span>
                <span className={cn("text-[0.62rem]", selected ? "text-white/80" : "text-ink-mute")}>{d.mon}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[0.85rem] font-medium text-ink">เลือกเวลา</p>
        {!date ? (
          <p className="rounded-2xl bg-slate-50 px-3.5 py-3 text-[0.8rem] text-ink-mute">เลือกวันก่อนนะ แล้วเวลาว่างจะขึ้นให้เลือก</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {TIMES.map((t) => {
              const taken = slotTaken(counselorId, date, t);
              const selected = time === t;
              return (
                <button
                  key={t}
                  type="button"
                  disabled={taken}
                  onClick={() => setTime(t)}
                  aria-pressed={selected}
                  className={cn(
                    "flex items-center justify-center gap-1 rounded-xl border py-2.5 text-[0.82rem] font-semibold transition active:scale-95",
                    taken
                      ? "cursor-not-allowed border-neutral-100 bg-neutral-50 text-neutral-300 line-through"
                      : selected
                        ? "border-transparent bg-mint-600 text-white"
                        : "border-neutral-200 bg-white text-ink hover:border-mint-300",
                  )}
                >
                  <Clock className="size-3.5" aria-hidden="true" />
                  {t}
                </button>
              );
            })}
          </div>
        )}
        <p className="mt-2 text-[0.72rem] text-ink-mute">เวลาที่มีขีดฆ่าคือถูกจองแล้ว ลองเลือกช่องอื่นได้นะ</p>
      </div>
    </div>
  );
}

/* -- Step 3: details ------------------------------------------------------- */

function StepDetails({
  format,
  setFormat,
  topic,
  setTopic,
  name,
  setName,
  room,
  setRoom,
}: {
  format: AppointmentFormat;
  setFormat: (f: AppointmentFormat) => void;
  topic: string;
  setTopic: (s: string) => void;
  name: string;
  setName: (s: string) => void;
  room: string;
  setRoom: (s: string) => void;
}) {
  const formats = Object.keys(FORMAT_META) as AppointmentFormat[];
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-[0.85rem] font-medium text-ink">อยากเจอแบบไหน</p>
        <div className="grid grid-cols-3 gap-2">
          {formats.map((f) => {
            const meta = FORMAT_META[f];
            const selected = format === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                aria-pressed={selected}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl border-2 p-2.5 text-center transition active:scale-95",
                  selected ? "border-mint-400 bg-mint-50 ring-2 ring-mint-200" : "border-neutral-200 bg-white hover:border-neutral-300",
                )}
              >
                <span className="text-xl" aria-hidden="true">{meta.emoji}</span>
                <span className="text-[0.72rem] font-semibold leading-tight text-ink">{meta.label}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-[0.72rem] text-ink-mute">{FORMAT_META[format].hint}</p>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-[0.85rem] font-medium text-ink">ชื่อ / ชื่อเล่น</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="เพื่อให้รู้ว่าใครมาพบ" className={inputClass} />
      </label>

      <label className="block">
        <span className="mb-1.5 flex items-center gap-2 text-[0.85rem] font-medium text-ink">
          ห้องเรียน <span className="text-[0.72rem] font-normal text-ink-mute">(ไม่บังคับ)</span>
        </span>
        <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="เช่น ม.4/2" className={inputClass} />
      </label>

      <label className="block">
        <span className="mb-1.5 flex items-center gap-2 text-[0.85rem] font-medium text-ink">
          เรื่องที่อยากคุย <span className="text-[0.72rem] font-normal text-ink-mute">(ไม่บังคับ)</span>
        </span>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="บอกคร่าว ๆ ได้ ถ้ายังไม่อยากบอกตอนนี้ก็ข้ามได้นะ"
          className={cn(inputClass, "resize-none")}
        />
      </label>

      <p className="flex items-start gap-2 rounded-2xl bg-lavender-50 p-3 text-[0.74rem] leading-relaxed text-ink-soft ring-1 ring-lavender-200/70">
        <Lock className="mt-0.5 size-3.5 shrink-0 text-lavender-600" aria-hidden="true" />
        สิ่งที่เธอเล่าจะเห็นเฉพาะคนที่เธอนัดเท่านั้น และเก็บเป็นความลับ
      </p>
    </div>
  );
}

/* -- Step 4: confirm ------------------------------------------------------- */

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <span className="text-[0.8rem] text-ink-mute">{label}</span>
      <span className="text-right text-[0.86rem] font-medium text-ink">{value}</span>
    </div>
  );
}

function StepConfirm({
  counselor: c,
  date,
  time,
  format,
  topic,
  name,
  room,
}: {
  counselor: Counselor;
  date: string;
  time: string;
  format: AppointmentFormat;
  topic: string;
  name: string;
  room: string;
}) {
  const meta = ROLE_META[c.role];
  return (
    <div className="space-y-3">
      <p className="text-[0.85rem] text-ink-soft">ตรวจดูอีกครั้งก่อนยืนยันนะ</p>
      <div className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
        <div className="mb-1 flex items-center gap-3 border-b border-neutral-100 pb-3">
          <span className={cn("grid size-11 place-items-center rounded-full text-xl", meta.soft)} aria-hidden="true">{c.emoji}</span>
          <div>
            <p className="text-[0.92rem] font-bold text-ink">{c.name}</p>
            <p className="text-[0.72rem] text-ink-mute">{c.title}</p>
          </div>
        </div>
        <div className="divide-y divide-neutral-100">
          <SummaryRow label="วันเวลา" value={<>{dateLabel(date)} · {time} น.</>} />
          <SummaryRow label="รูปแบบ" value={<>{FORMAT_META[format].emoji} {FORMAT_META[format].label}</>} />
          <SummaryRow label="ผู้นัด" value={room ? `${name} (${room})` : name} />
          {topic && <SummaryRow label="เรื่องที่อยากคุย" value={topic} />}
        </div>
      </div>
      <p className="text-center text-[0.74rem] text-ink-mute">กดยืนยันแล้ว {c.name}จะได้รับคำขอและตอบกลับเพื่อยืนยันเวลา</p>
    </div>
  );
}

/* ============================================================================
   Success
   ========================================================================== */

function SuccessCard({
  appt,
  resolve,
  onViewMine,
  onAgain,
}: {
  appt: Appointment;
  resolve: (id: string) => Counselor | undefined;
  onViewMine: () => void;
  onAgain: () => void;
}) {
  const c = resolve(appt.counselorId) ?? {
    name: "ผู้ให้คำปรึกษา",
    role: "counselor" as CounselorRole,
  };
  // Move focus to the confirmation + let screen readers announce it (the wizard
  // that had focus just unmounted).
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);
  return (
    <div className="space-y-5 text-center" role="status" aria-live="polite">
      <div>
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-mint-100">
          <Check className="size-8 text-mint-600" aria-hidden="true" />
        </span>
        <h2 ref={headingRef} tabIndex={-1} className="font-display th:leading-snug mt-4 text-[1.4rem] font-bold text-ink focus:outline-none">ส่งคำขอนัดแล้ว</h2>
        <p className="mt-1.5 text-[0.86rem] leading-relaxed text-ink-soft">
          {c.name}จะได้รับคำขอของเธอ และตอบกลับเพื่อยืนยันเวลาเร็ว ๆ นี้
        </p>
      </div>

      <div className="rounded-2xl bg-lavender-50 p-4 text-left ring-1 ring-lavender-200/70">
        <p className="text-[0.72rem] text-ink-mute">รหัสนัดหมาย</p>
        <p className="font-display text-[1.3rem] font-bold tracking-wider text-lavender-700">{appt.code}</p>
        <p className="mt-1.5 text-[0.8rem] text-ink-soft">{dateLabel(appt.date)} · {appt.time} น. · {FORMAT_META[appt.format].label}</p>
      </div>

      <div className="flex flex-col gap-2.5">
        <button type="button" onClick={onViewMine} className="rounded-2xl bg-mint-700 py-3.5 text-[0.9rem] font-medium text-white transition hover:bg-mint-600">
          ดูนัดของฉัน
        </button>
        <button type="button" onClick={onAgain} className="rounded-2xl border border-neutral-300 py-3.5 text-[0.9rem] font-medium text-ink-soft transition hover:border-neutral-400 hover:text-ink">
          นัดเพิ่มอีก
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
   My appointments
   ========================================================================== */

function MyAppointments({
  mounted,
  appointments,
  resolve,
  onCancel,
  onBook,
}: {
  mounted: boolean;
  appointments: Appointment[];
  resolve: (id: string) => Counselor | undefined;
  onCancel: (id: string) => void;
  onBook: () => void;
}) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  if (!mounted) {
    return <p className="py-10 text-center text-[0.85rem] text-ink-mute">กำลังโหลด…</p>;
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-slate-50 px-6 py-12 text-center ring-1 ring-slate-100">
        <span className="grid size-14 place-items-center rounded-2xl bg-white text-2xl shadow-sm" aria-hidden="true">🗓️</span>
        <div>
          <p className="text-[0.92rem] font-semibold text-ink">ยังไม่มีนัดหมาย</p>
          <p className="mt-1 text-[0.8rem] text-ink-mute">เมื่อไหร่ที่อยากคุยกับใคร กดนัดได้เลยนะ</p>
        </div>
        <button type="button" onClick={onBook} className="inline-flex items-center gap-1.5 rounded-full bg-mint-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-mint-500">
          <CalendarPlus className="size-4" aria-hidden="true" />
          นัดใหม่
        </button>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {appointments.map((a) => {
        const c = resolve(a.counselorId);
        // A persisted appointment may point at a counselor removed in a later
        // release — render a safe fallback instead of crashing the whole list.
        if (!c) {
          return (
            <li key={a.id} className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200 shadow-sm">
              <p className="text-[0.86rem] font-medium text-ink">นัดหมาย · {a.code}</p>
              <p className="mt-0.5 text-[0.78rem] text-ink-soft">{dateLabel(a.date)} · {a.time} น.</p>
              <p className="mt-1 text-[0.74rem] text-ink-mute">ไม่พบข้อมูลผู้ให้คำปรึกษาแล้ว</p>
            </li>
          );
        }
        const meta = ROLE_META[c.role];
        const status = STATUS_META[a.status];
        const canCancel = a.status === "pending" || a.status === "confirmed";
        const confirming = confirmingId === a.id;
        return (
          <li key={a.id} className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200 shadow-sm">
            <div className="flex items-start gap-3">
              <span className={cn("grid size-11 shrink-0 place-items-center rounded-full text-xl", meta.soft)} aria-hidden="true">{c.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[0.9rem] font-bold text-ink">{c.name}</p>
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.66rem] font-semibold ring-1", status.tint)}>
                    <span className={cn("size-1.5 rounded-full", status.dot)} />
                    {status.label}
                  </span>
                </div>
                <p className="mt-0.5 text-[0.78rem] text-ink-soft">
                  {dateLabel(a.date)} · {a.time} น. · {FORMAT_META[a.format].emoji} {FORMAT_META[a.format].label}
                </p>
                {a.topic && <p className="mt-1 line-clamp-2 text-[0.74rem] text-ink-mute">“{a.topic}”</p>}
                <p className="mt-1 text-[0.68rem] text-ink-mute">รหัส {a.code}</p>
              </div>
            </div>

            {canCancel && (
              <div className="mt-3 flex justify-end border-t border-neutral-100 pt-3">
                {confirming ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[0.74rem] text-ink-mute">ยกเลิกนัดนี้?</span>
                    <button
                      type="button"
                      autoFocus
                      onClick={() => { onCancel(a.id); setConfirmingId(null); }}
                      className="rounded-full bg-rose-500 px-3 py-1.5 text-[0.74rem] font-semibold text-white transition hover:bg-rose-600"
                    >
                      ยืนยันยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(null)}
                      className="rounded-full px-2 py-1.5 text-[0.74rem] font-medium text-ink-mute hover:text-ink"
                    >
                      ไม่
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingId(a.id)}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[0.74rem] font-medium text-rose-500 transition hover:bg-rose-50"
                  >
                    <X className="size-3.5" aria-hidden="true" />
                    ยกเลิกนัด
                  </button>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default AppointmentBooking;
