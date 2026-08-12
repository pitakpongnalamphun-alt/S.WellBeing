"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CalendarPlus,
  Check,
  Clock,
  Search,
  TriangleAlert,
  X,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import {
  FORMAT_META,
  STATUS_META,
  type Appointment,
  type AppointmentFormat,
  type AppointmentStatus,
  useAppointmentStore,
} from "@/lib/store/useAppointmentStore";
import { COUNSELOR_BY_ID } from "@/data/counselors";
import { useStaffSession } from "@/lib/store/useStaffSessionStore";
import { useStaffAccountsStore } from "@/lib/store/useStaffAccountsStore";
import type { StaffAccount } from "@/data/staff";
import { localDay } from "@/lib/date";
import { cn } from "@/lib/utils";

const STATUS_ORDER: AppointmentStatus[] = ["pending", "confirmed", "done", "cancelled"];
type Filter = "all" | AppointmentStatus;

const fmtDate = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("th-TH", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

/**
 * Bookable staff come from the LIVE accounts store (/admin/staff), not the
 * static counselor list — a newly added teacher must be bookable immediately,
 * and a deactivated one must stop receiving new appointments (old bookings
 * still resolve their name below).
 */
function useBookableStaff(): StaffAccount[] {
  const accounts = useStaffAccountsStore((s) => s.accounts);
  return useMemo(
    () => accounts.filter((a) => a.active && a.role !== "admin"),
    [accounts],
  );
}

/** Resolve a counselorId for display — live account first, legacy list second. */
function useResolveCounselor() {
  const accounts = useStaffAccountsStore((s) => s.accounts);
  return useMemo(() => {
    const byId = Object.fromEntries(accounts.map((a) => [a.id, a]));
    return (id: string): { name: string; title: string; emoji: string } | null => {
      const a = byId[id];
      if (a) return { name: a.name, title: a.title, emoji: a.emoji };
      const c = COUNSELOR_BY_ID[id];
      return c ? { name: c.name, title: c.title, emoji: c.emoji } : null;
    };
  }, [accounts]);
}

const FIELD_LABEL = "mb-1.5 block text-[0.74rem] font-medium text-ink-mute";
const FIELD_INPUT =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[0.85rem] text-ink placeholder:text-ink-mute focus:border-mint-400 focus:outline-none focus:ring-4 focus:ring-mint-100";

/**
 * Staff-side "book a session for a student". Unlike the student flow (which
 * asks and waits), a counsellor arranging a session owns the schedule, so the
 * booking is created already "confirmed".
 */
function NewAppointmentForm({
  defaultCounselorId,
  onCreated,
  onClose,
}: {
  defaultCounselorId: string;
  onCreated: (a: Appointment) => void;
  onClose: () => void;
}) {
  const book = useAppointmentStore((s) => s.book);
  const bookable = useBookableStaff();
  const [counselorId, setCounselorId] = useState(defaultCounselorId);
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [date, setDate] = useState(localDay());
  const [time, setTime] = useState("16:00");
  const [format, setFormat] = useState<AppointmentFormat>("onsite");
  const [topic, setTopic] = useState("");

  const canSave = name.trim().length > 0 && !!date && !!time && !!counselorId;

  // Every counselor/psychologist can legally be deactivated at once (only the
  // last ADMIN is lockout-protected) — say so instead of a dead disabled form.
  if (bookable.length === 0) {
    return (
      <Card className="border-l-4 border-l-amber-400 p-5">
        <p className="text-[0.88rem] font-medium text-ink">
          ยังไม่มีเจ้าหน้าที่ที่เปิดใช้งานให้เลือก
        </p>
        <p className="mt-1 text-[0.8rem] leading-relaxed text-ink-soft">
          เพิ่มหรือเปิดใช้งานบัญชีนักจิตวิทยา/ครูแนะแนวได้ที่หน้า “บัญชีเจ้าหน้าที่” ก่อน
          แล้วค่อยกลับมาสร้างนัดอีกครั้ง
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 rounded-lg px-3 py-2 text-[0.82rem] font-medium text-ink-mute transition hover:text-ink"
        >
          ปิดฟอร์ม
        </button>
      </Card>
    );
  }

  function submit() {
    if (!canSave) return;
    const appt = book(
      {
        counselorId,
        date,
        time,
        format,
        topic: topic.trim(),
        name: name.trim(),
        room: room.trim(),
      },
      "confirmed",
    );
    onCreated(appt);
  }

  return (
    <Card className="border-l-4 border-l-mint-500 p-5">
      <div className="mb-4 flex items-center gap-2">
        <CalendarPlus className="size-4 text-mint-600" aria-hidden="true" />
        <h2 className="text-[0.95rem] font-semibold text-ink">สร้างนัดใหม่ให้นักเรียน</h2>
      </div>

      {/* ใบนัดผูกกับ "บัญชีคนสร้าง" ตาม RLS — ใบที่ครูสร้างจึงไม่ไปโผล่ในแอปของนักเรียน
          ต้องบอกให้รู้ตรงนี้ ไม่ใช่ปล่อยให้เข้าใจว่าเด็กได้รับแจ้งอัตโนมัติแล้ว
          (จะให้ไปถึงเด็กได้ ต้องมีรหัสนักเรียนที่โรงเรียนยืนยัน ไม่ใช่รหัสที่เด็กพิมพ์เอง
          ไม่งั้นใครก็สวมรหัสเพื่อนเพื่อดูใบนัดของเพื่อนได้) */}
      <p className="mb-4 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-[0.78rem] leading-relaxed text-amber-800 ring-1 ring-amber-200">
        <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span>
          นัดที่สร้างจากหน้านี้ <span className="font-semibold">นักเรียนจะยังไม่เห็นในแอป</span> —
          แจ้งวันเวลาและรหัสนัดให้เขาโดยตรงด้วย
        </span>
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="na-counselor" className={FIELD_LABEL}>
            ผู้ให้คำปรึกษา
          </label>
          <select
            id="na-counselor"
            value={counselorId}
            onChange={(e) => setCounselorId(e.target.value)}
            className={FIELD_INPUT}
          >
            {bookable.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name} · {c.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className={FIELD_LABEL}>รูปแบบ</span>
          <div className="flex gap-1.5">
            {(Object.keys(FORMAT_META) as AppointmentFormat[]).map((f) => {
              const meta = FORMAT_META[f];
              const active = format === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  aria-pressed={active}
                  title={meta.hint}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1 rounded-xl px-2 py-2 text-[0.74rem] font-medium ring-1 transition",
                    active
                      ? "bg-mint-50 text-mint-700 ring-mint-300"
                      : "bg-white text-ink-soft ring-neutral-200 hover:text-ink",
                  )}
                >
                  <span aria-hidden="true">{meta.emoji}</span>
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="na-name" className={FIELD_LABEL}>
            ชื่อนักเรียน <span className="text-rose-500">*</span>
          </label>
          <input
            id="na-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ชื่อ / ชื่อเล่น"
            className={FIELD_INPUT}
          />
        </div>

        <div>
          <label htmlFor="na-room" className={FIELD_LABEL}>
            ห้องเรียน <span className="font-normal text-ink-mute">(ไม่บังคับ)</span>
          </label>
          <input
            id="na-room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="เช่น ม.4/2"
            className={FIELD_INPUT}
          />
        </div>

        <div>
          <label htmlFor="na-date" className={FIELD_LABEL}>
            วันที่
          </label>
          <input
            id="na-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={FIELD_INPUT}
          />
        </div>

        <div>
          <label htmlFor="na-time" className={FIELD_LABEL}>
            เวลา
          </label>
          <input
            id="na-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={FIELD_INPUT}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="na-topic" className={FIELD_LABEL}>
            เรื่องที่จะคุย <span className="font-normal text-ink-mute">(ไม่บังคับ)</span>
          </label>
          <textarea
            id="na-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder="บันทึกหัวข้อ / บริบทของนัดนี้…"
            className={cn(FIELD_INPUT, "resize-none")}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-3 py-2 text-[0.82rem] font-medium text-ink-mute transition hover:text-ink"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={!canSave}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[0.84rem] font-medium transition",
            canSave
              ? "bg-mint-700 text-white hover:bg-mint-600"
              : "cursor-not-allowed bg-neutral-100 text-ink-mute",
          )}
        >
          <Check className="size-3.5" aria-hidden="true" /> สร้างนัด (ยืนยันแล้ว)
        </button>
      </div>
      <p className="mt-2 text-right text-[0.7rem] text-ink-mute">
        นัดที่สร้างโดยเจ้าหน้าที่จะอยู่ในสถานะ “ยืนยันแล้ว” ทันที
      </p>
    </Card>
  );
}

function AppointmentCard({ a }: { a: Appointment }) {
  const setStatus = useAppointmentStore((s) => s.setStatus);
  const reschedule = useAppointmentStore((s) => s.reschedule);
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(a.date);
  const [time, setTime] = useState(a.time);

  const resolveCounselor = useResolveCounselor();
  const counselor = resolveCounselor(a.counselorId);
  const fmt = FORMAT_META[a.format];
  const st = STATUS_META[a.status];
  const closed = a.status === "done" || a.status === "cancelled";

  function saveReschedule() {
    if (!date || !time) return;
    reschedule(a.id, date, time);
    setEditing(false);
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.92rem] font-bold text-ink">
            {a.name || "—"}
            {a.room ? <span className="text-ink-mute"> · {a.room}</span> : null}
          </p>
          <p className="mt-0.5 text-[0.8rem] text-ink-soft">
            {counselor ? `${counselor.emoji} ${counselor.name} · ${counselor.title}` : a.counselorId}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.72rem] font-medium ring-1 ${st.tint}`}
        >
          <span className={`size-1.5 rounded-full ${st.dot}`} />
          {st.label}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.82rem] text-ink-soft">
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="size-3.5 text-ink-mute" aria-hidden="true" />
          {fmtDate(a.date)} · {a.time} น.
        </span>
        <span>
          {fmt.emoji} {fmt.label}
        </span>
        <span className="font-mono text-[0.74rem] text-ink-mute">{a.code}</span>
      </div>

      {a.topic && (
        <p className="mt-2 rounded-xl bg-neutral-50 p-3 text-[0.82rem] leading-relaxed text-ink">
          {a.topic}
        </p>
      )}

      {/* reschedule form */}
      {editing && (
        <div className="mt-3 flex flex-wrap items-end gap-2 rounded-xl bg-mint-50 p-3 ring-1 ring-mint-200/70">
          <label className="text-[0.74rem] font-medium text-ink-soft">
            วันที่
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-[0.82rem] text-ink focus:border-mint-400 focus:outline-none focus:ring-4 focus:ring-mint-100"
            />
          </label>
          <label className="text-[0.74rem] font-medium text-ink-soft">
            เวลา
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 block rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-[0.82rem] text-ink focus:border-mint-400 focus:outline-none focus:ring-4 focus:ring-mint-100"
            />
          </label>
          <button
            type="button"
            onClick={saveReschedule}
            className="rounded-lg bg-mint-700 px-3 py-1.5 text-[0.78rem] font-medium text-white transition hover:bg-mint-600"
          >
            บันทึกเวลาใหม่ (ยืนยันด้วย)
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg px-2.5 py-1.5 text-[0.78rem] font-medium text-ink-mute hover:text-ink"
          >
            ยกเลิก
          </button>
        </div>
      )}

      {/* actions */}
      {!closed && !editing && (
        <div className="mt-3 flex flex-wrap gap-2">
          {a.status === "pending" && (
            <button
              type="button"
              onClick={() => setStatus(a.id, "confirmed")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-mint-700 px-3 py-1.5 text-[0.78rem] font-medium text-white transition hover:bg-mint-600"
            >
              <Check className="size-3.5" aria-hidden="true" /> ยืนยันนัด
            </button>
          )}
          {a.status === "confirmed" && (
            <button
              type="button"
              onClick={() => setStatus(a.id, "done")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-600 px-3 py-1.5 text-[0.78rem] font-medium text-white transition hover:bg-slate-500"
            >
              <Check className="size-3.5" aria-hidden="true" /> เสร็จสิ้น
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setDate(a.date);
              setTime(a.time);
              setEditing(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[0.78rem] font-medium text-ink-soft ring-1 ring-neutral-200 transition hover:text-ink hover:ring-neutral-300"
          >
            <Clock className="size-3.5" aria-hidden="true" /> เลื่อนเวลา
          </button>
          <button
            type="button"
            onClick={() => setStatus(a.id, "cancelled")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[0.78rem] font-medium text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50"
          >
            <X className="size-3.5" aria-hidden="true" /> ยกเลิก
          </button>
        </div>
      )}
    </Card>
  );
}

export function AdminAppointmentsBoard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const appointments = useAppointmentStore((s) => s.appointments);
  const myId = useStaffSession()?.id;
  const resolveCounselor = useResolveCounselor();
  const [filter, setFilter] = useState<Filter>("all");
  const [mine, setMine] = useState(false);
  const [q, setQ] = useState("");
  const [visible, setVisible] = useState(8);
  useEffect(() => setVisible(8), [filter, mine, q]);
  const bookable = useBookableStaff();
  const [creating, setCreating] = useState(false);
  const [justCreated, setJustCreated] = useState<Appointment | null>(null);
  const defaultCounselor =
    myId && bookable.some((c) => c.id === myId) ? myId : bookable[0]?.id ?? "";

  // Only count appointments booked to the signed-in counsellor when "ของฉัน" is on.
  const scope = useMemo(
    () => (mine && myId ? appointments.filter((a) => a.counselorId === myId) : appointments),
    [appointments, mine, myId],
  );

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: scope.length,
      pending: 0,
      confirmed: 0,
      done: 0,
      cancelled: 0,
    };
    for (const a of scope) c[a.status] += 1;
    return c;
  }, [scope]);

  const qq = q.trim().toLowerCase();
  const shown = scope
    .filter((a) => filter === "all" || a.status === filter)
    .filter(
      (a) =>
        !qq ||
        [a.name, a.code, a.topic, resolveCounselor(a.counselorId)?.name ?? ""].some((v) =>
          v.toLowerCase().includes(qq),
        ),
    );

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "ทั้งหมด" },
    ...STATUS_ORDER.map((s) => ({ id: s, label: STATUS_META[s].label })),
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display th:leading-snug text-[1.6rem] font-bold text-ink">
            จัดการนัดพูดคุย
          </h1>
          <p className="mt-1 text-[0.88rem] text-ink-soft">
            ยืนยัน เลื่อนเวลา ปิดนัด หรือสร้างนัดใหม่ให้นักเรียน
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setJustCreated(null);
            setCreating((v) => !v);
          }}
          aria-expanded={creating}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[0.86rem] font-medium transition",
            creating
              ? "bg-neutral-100 text-ink-soft hover:text-ink"
              : "bg-mint-700 text-white hover:bg-mint-600",
          )}
        >
          <CalendarPlus className="size-4" aria-hidden="true" />
          {creating ? "ปิดฟอร์ม" : "สร้างนัด"}
        </button>
      </header>

      {creating && (
        <NewAppointmentForm
          defaultCounselorId={defaultCounselor}
          onCreated={(a) => {
            setJustCreated(a);
            setCreating(false);
            setFilter("all");
            setMine(false);
          }}
          onClose={() => setCreating(false)}
        />
      )}

      {justCreated && (
        <Card className="flex items-center gap-3 border-l-4 border-l-mint-500 bg-mint-50/50 p-4">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-mint-100 text-mint-700">
            <Check className="size-4" aria-hidden="true" />
          </span>
          <p className="min-w-0 flex-1 text-[0.85rem] text-ink">
            สร้างนัดให้ <span className="font-medium">{justCreated.name}</span> แล้ว · รหัส{" "}
            <span className="font-mono">{justCreated.code}</span> · {fmtDate(justCreated.date)}{" "}
            {justCreated.time} น.
            <span className="mt-0.5 block text-[0.76rem] text-ink-soft">
              อย่าลืมแจ้งนักเรียนโดยตรง — ใบนัดที่ครูสร้างยังไม่ขึ้นในแอปของเขา
            </span>
          </p>
          <button
            type="button"
            onClick={() => setJustCreated(null)}
            aria-label="ปิดข้อความ"
            className="shrink-0 rounded-lg p-1 text-ink-mute transition hover:bg-neutral-100 hover:text-ink"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {filters.map(({ id, label }) => {
          const active = filter === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.82rem] font-medium ring-1 transition",
                active
                  ? "bg-ink text-white ring-ink"
                  : "bg-white text-ink-soft ring-neutral-200 hover:text-ink",
              )}
            >
              {label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-[0.68rem] tabular-nums",
                  active ? "bg-white/20" : "bg-neutral-100 text-ink-mute",
                )}
              >
                {mounted ? counts[id] : 0}
              </span>
            </button>
          );
        })}

        {myId && (
          <button
            type="button"
            onClick={() => setMine((m) => !m)}
            aria-pressed={mine}
            className={cn(
              "ml-auto inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.82rem] font-medium ring-1 transition",
              mine
                ? "bg-mint-600 text-white ring-mint-600"
                : "bg-white text-ink-soft ring-neutral-200 hover:text-ink",
            )}
          >
            เฉพาะของฉัน
          </button>
        )}
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-mute"
          aria-hidden="true"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ค้นหา: ชื่อนักเรียน รหัสนัด หัวข้อ หรือชื่อครู…"
          aria-label="ค้นหานัด"
          className="w-full rounded-full border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-[0.84rem] text-ink placeholder:text-ink-mute focus:border-mint-400 focus:outline-none focus:ring-4 focus:ring-mint-100"
        />
      </div>

      {!mounted ? (
        <p className="py-12 text-center text-[0.88rem] text-ink-mute">กำลังโหลด…</p>
      ) : shown.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-[0.9rem] font-medium text-ink">
            {scope.length === 0
              ? mine
                ? "ยังไม่มีนัดที่จองถึงคุณ"
                : "ยังไม่มีนัดเข้ามา"
              : "ไม่มีนัดในสถานะนี้"}
          </p>
          <p className="mt-1 text-[0.82rem] text-ink-soft">
            เมื่อนักเรียนจองเวลาพูดคุย นัดจะปรากฏที่นี่ให้ยืนยัน
          </p>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {shown.slice(0, visible).map((a) => (
              <AppointmentCard key={a.id} a={a} />
            ))}
          </div>
          {shown.length > visible && (
            <button
              type="button"
              onClick={() => setVisible((v) => v + 8)}
              className="mx-auto block rounded-full bg-white px-5 py-2.5 text-[0.84rem] font-medium text-ink-soft ring-1 ring-neutral-200 transition hover:text-ink hover:ring-neutral-300"
            >
              แสดงเพิ่ม (เหลืออีก {shown.length - visible} นัด)
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default AdminAppointmentsBoard;
