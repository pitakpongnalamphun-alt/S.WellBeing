"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlarmClock,
  ArrowRight,
  CalendarHeart,
  CheckCircle2,
  FolderKanban,
  Inbox,
  ScrollText,
  ShieldAlert,
  Siren,
  Sparkles,
  User,
  Users,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import {
  CASE_STATUS_META,
  isOpenStatus,
  slaState,
  useCasesStore,
} from "@/lib/store/useCasesStore";
import { TRIAGE_BAND_META, triageScore } from "@/lib/insights/triage";
import { useSosStore } from "@/lib/store/useSosStore";
import { useAppointmentStore } from "@/lib/store/useAppointmentStore";
import { useStaffSession } from "@/lib/store/useStaffSessionStore";
import { STAFF_ROLE_META } from "@/data/staff";
import { canAccess, canSeeStudentData } from "@/lib/adminAccess";
import { cn } from "@/lib/utils";

/* ============================================================================
   ภาพรวม — mission control, not a pile of cards. Reading order = priority:

     1. ต้องทำตอนนี้ — ONE queue of everything urgent (SOS, overdue SLA,
        waiting cases, unconfirmed appointments), each row with its own CTA.
        Quiet day → a calm green "nothing pending" instead of empty silence.
     2. Clickable KPI tiles — numbers that go somewhere.
     3. งานของฉัน + แจ้งเหตุล่าสุด (with triage chips) + anonymous signal.

   The tech admin (no student data by RBAC) gets the same tiles plus system
   shortcuts — never the queue or case rows.
   ========================================================================== */

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const within = (iso: string, now: number, ms: number) =>
  now - new Date(iso).getTime() < ms;

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

function fmtDur(ms: number): string {
  const totalMin = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h} ชม.${m > 0 ? ` ${m} น.` : ""}`;
  return `${m} น.`;
}

type ActionTone = "high" | "warn" | "info";
type ActionRow = {
  id: string;
  tone: ActionTone;
  icon: "sos" | "clock" | "inbox" | "calendar";
  text: string;
  sub: string;
  href: string;
  cta: string;
};

const TONE_STYLE: Record<ActionTone, { row: string; icon: string; cta: string }> = {
  high: {
    row: "bg-risk-high-bg ring-risk-high/25",
    icon: "bg-risk-high text-white",
    cta: "text-risk-high ring-risk-high/30 hover:bg-risk-high hover:text-white",
  },
  warn: {
    row: "bg-amber-50 ring-amber-200",
    icon: "bg-amber-400 text-white",
    cta: "text-amber-700 ring-amber-300 hover:bg-amber-400 hover:text-white",
  },
  info: {
    row: "bg-white ring-neutral-200",
    icon: "bg-neutral-100 text-ink-soft",
    cta: "text-mint-700 ring-mint-300 hover:bg-mint-600 hover:text-white",
  },
};

const ACTION_ICON = {
  sos: Siren,
  clock: AlarmClock,
  inbox: Inbox,
  calendar: CalendarHeart,
} as const;

export function AdminOverview() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(0);
  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const cases = useCasesStore((s) => s.cases);
  const anonymous = useCasesStore((s) => s.anonymous);
  const allAlerts = useSosStore((s) => s.alerts);
  const appointments = useAppointmentStore((s) => s.appointments);

  // Role split (PDPA data minimisation): clinical staff see individual case/SOS
  // rows; the tech admin sees only aggregate counts and the anonymous signal.
  const staff = useStaffSession();
  const clinical = !!staff && canSeeStudentData(staff.role);
  const myId = staff?.id;

  const alerts = useMemo(
    () => allAlerts.filter((a) => a.status !== "cancelled"),
    [allAlerts],
  );

  const computed = useMemo(() => {
    if (!now) return null;

    const activeAlerts = alerts.filter((a) => a.status === "active");
    const openCases = cases.filter((c) => isOpenStatus(c.status));
    const pendingCases = cases.filter((c) => c.status === "pending");
    const overdue = pendingCases.filter((c) => slaState(c, now).state === "overdue");
    const waiting = pendingCases.length - overdue.length;
    const pendingAppts = appointments.filter((a) => a.status === "pending");

    // The action queue — most urgent first, each row already knows its fix.
    const queue: ActionRow[] = [
      ...activeAlerts.map((a) => ({
        id: `sos-${a.id}`,
        tone: "high" as const,
        icon: "sos" as const,
        text: `SOS · ${a.place.th}`,
        sub: `${a.name || "ไม่ระบุชื่อ"} · ${fmt(a.createdAt)}`,
        href: "/admin/sos",
        cta: "ไปปิดเหตุ",
      })),
      ...overdue.slice(0, 3).map((c) => ({
        id: `ovd-${c.id}`,
        tone: "warn" as const,
        icon: "clock" as const,
        text: `เคสเกิน SLA · ${c.categoryLabel}`,
        sub: `${c.id} · เกินมา ${fmtDur(-slaState(c, now).remainingMs)}`,
        href: "/admin/cases",
        cta: "รับเคส",
      })),
      ...(waiting > 0
        ? [{
            id: "waiting",
            tone: "info" as const,
            icon: "inbox" as const,
            text: `เคสใหม่รอรับเรื่อง ${waiting} เคส`,
            sub: "ยังอยู่ในกำหนด SLA",
            href: "/admin/cases",
            cta: "ไปมอบหมาย",
          }]
        : []),
      ...(pendingAppts.length > 0
        ? [{
            id: "appts",
            tone: "info" as const,
            icon: "calendar" as const,
            text: `นัดพูดคุยรอยืนยัน ${pendingAppts.length} รายการ`,
            sub: "นักเรียนกำลังรอคำตอบ",
            href: "/admin/appointments",
            cta: "ไปยืนยัน",
          }]
        : []),
    ];

    const anonByCat = anonymous.reduce<Record<string, number>>((acc, a) => {
      acc[a.categoryLabel] = (acc[a.categoryLabel] ?? 0) + 1;
      return acc;
    }, {});

    return {
      queue,
      openCount: openCases.length,
      newReports:
        cases.filter((c) => within(c.createdAt, now, WEEK_MS)).length +
        anonymous.filter((a) => within(a.createdAt, now, WEEK_MS)).length,
      sosWeek: alerts.filter((a) => within(a.createdAt, now, WEEK_MS)).length,
      pendingApptCount: pendingAppts.length,
      recent: cases.slice(0, 5),
      myOpenCases: myId ? openCases.filter((c) => c.assignedTo === myId).length : 0,
      myPendingAppts: myId
        ? pendingAppts.filter((a) => a.counselorId === myId).length
        : 0,
      anonByCat,
      anonTotal: anonymous.length,
    };
  }, [cases, anonymous, alerts, appointments, now, myId]);

  const today = mounted
    ? new Date().toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long" })
    : "";

  const tiles = [
    {
      label: "เคสที่เปิดอยู่", value: computed?.openCount ?? 0, hint: "ยังไม่ปิด",
      href: "/admin/cases", Icon: FolderKanban, bubble: "bg-mint-100 text-mint-700",
    },
    {
      label: "แจ้งเหตุใหม่", value: computed?.newReports ?? 0, hint: "7 วันล่าสุด",
      href: "/admin/cases", Icon: Inbox, bubble: "bg-amber-100 text-amber-700",
    },
    {
      label: "SOS สัปดาห์นี้", value: computed?.sosWeek ?? 0, hint: "ไม่นับที่ยกเลิกเอง",
      href: "/admin/sos", Icon: Siren, bubble: "bg-rose-100 text-rose-600",
    },
    {
      label: "นัดรอยืนยัน", value: computed?.pendingApptCount ?? 0, hint: "รอครูตอบ",
      href: "/admin/appointments", Icon: CalendarHeart, bubble: "bg-lavender-100 text-lavender-700",
    },
  ];

  const shortcuts = [
    { href: "/admin/insights", label: "AI วิเคราะห์แนวโน้ม", Icon: Sparkles },
    { href: "/admin/staff", label: "บัญชีเจ้าหน้าที่", Icon: Users },
    { href: "/admin/audit", label: "บันทึกการเข้าถึง", Icon: ScrollText },
  ].filter(({ href }) => !!staff && canAccess(href, staff.role));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Greeting band — a soft gradient so the page opens warm, not clinical,
          plus a one-line read of the day so the first glance already answers
          "is anything waiting for me?" */}
      <header className="rounded-3xl bg-gradient-to-r from-mint-50 via-white to-lavender-50 p-5 ring-1 ring-neutral-200/70">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display th:leading-snug text-[1.6rem] font-bold text-ink">
              สวัสดี{staff ? ` ${staff.name}` : ""} 👋
            </h1>
            <p className="mt-1 text-[0.82rem] text-ink-mute">{today}</p>
            <p className="mt-2 text-[0.92rem] font-medium text-ink">
              {!mounted || !computed
                ? "กำลังโหลดสถานการณ์วันนี้…"
                : clinical
                  ? computed.queue.length > 0
                    ? `วันนี้มี ${computed.queue.length} เรื่องรอการดูแลของคุณ`
                    : "วันนี้ยังไม่มีเรื่องด่วน — จิบกาแฟ แล้วค่อยตามเคสเดิมได้เลย ☕"
                  : "ภาพรวมเชิงสถิติของโรงเรียนวันนี้"}
            </p>
          </div>
          {staff && (
            <span
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-[0.74rem] font-semibold",
                STAFF_ROLE_META[staff.role].tint,
              )}
            >
              {staff.emoji} {STAFF_ROLE_META[staff.role].label}
            </span>
          )}
        </div>
      </header>

      {/* ── 1 · ต้องทำตอนนี้ (clinical only — individual student data) ── */}
      {clinical && (
        <Card className="p-5">
          <h2 className="text-[0.95rem] font-semibold text-ink">ต้องทำตอนนี้</h2>
          {!mounted || !computed ? (
            <p className="py-4 text-[0.84rem] text-ink-mute">กำลังโหลด…</p>
          ) : computed.queue.length === 0 ? (
            <div className="mt-3 flex items-center gap-3 rounded-2xl bg-mint-50 p-4 ring-1 ring-mint-200/70">
              <CheckCircle2 className="size-5 shrink-0 text-mint-600" aria-hidden="true" />
              <p className="text-[0.86rem] text-ink">
                ไม่มีเรื่องค้างตอนนี้ — ทุกเหตุได้รับการดูแลแล้ว 💚
              </p>
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {computed.queue.map((q) => {
                const t = TONE_STYLE[q.tone];
                const Icon = ACTION_ICON[q.icon];
                return (
                  <li
                    key={q.id}
                    className={cn("flex items-center gap-3 rounded-2xl p-3 ring-1", t.row)}
                  >
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-xl",
                        t.icon,
                      )}
                    >
                      <Icon
                        className={cn("size-4", q.tone === "high" && "animate-pulse")}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.86rem] font-medium text-ink">
                        {q.text}
                      </span>
                      <span className="block truncate text-[0.72rem] text-ink-mute">{q.sub}</span>
                    </span>
                    <Link
                      href={q.href}
                      className={cn(
                        "shrink-0 rounded-lg bg-white px-3 py-1.5 text-[0.78rem] font-medium ring-1 transition",
                        t.cta,
                      )}
                    >
                      {q.cta}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}

      {/* tech admin — role note + system shortcuts instead of the queue */}
      {staff && !clinical && (
        <Card className="border-l-4 border-l-mint-400 p-4">
          <p className="text-[0.84rem] leading-relaxed text-ink-soft">
            คุณเข้าสู่ระบบในบทบาท
            <span className="font-medium text-ink"> ผู้ดูแลระบบ</span> —
            เห็นเฉพาะภาพรวมเชิงสถิติและสัญญาณแบบไม่ระบุตัวตน
            ไม่เห็นข้อมูลรายบุคคลของนักเรียน ตามการแบ่งสิทธิ์และหลักการเก็บข้อมูลเท่าที่จำเป็น
          </p>
          {shortcuts.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {shortcuts.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[0.8rem] font-medium text-ink-soft ring-1 ring-neutral-200 transition hover:text-ink hover:ring-neutral-300"
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ── 2 · numbers that go somewhere ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map(({ label, value, hint, href, Icon, bubble }) => {
          const linked = !!staff && canAccess(href, staff.role);
          const body = (
            <div className="flex items-center gap-3">
              <span
                className={cn("grid size-11 shrink-0 place-items-center rounded-2xl", bubble)}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center justify-between gap-1 text-[0.74rem] text-ink-mute">
                  <span className="truncate">{label}</span>
                  {linked && <ArrowRight className="size-3.5 shrink-0" aria-hidden="true" />}
                </p>
                <p className="text-[1.35rem] font-bold leading-tight tabular-nums text-ink">
                  {mounted && computed ? value : "—"}
                </p>
                <p className="truncate text-[0.68rem] text-ink-mute">{hint}</p>
              </div>
            </div>
          );
          return linked ? (
            <Link
              key={label}
              href={href}
              className="rounded-3xl bg-white p-4 ring-1 ring-neutral-200 transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-20px_rgba(15,32,25,0.4)] hover:ring-mint-300"
            >
              {body}
            </Link>
          ) : (
            <Card key={label} className="p-4">
              {body}
            </Card>
          );
        })}
      </div>

      {/* ── 3 · detail row: recent cases (wide) + my work / anon signal ── */}
      <div className="grid gap-3 lg:grid-cols-3">
        {clinical && (
          <Card className="p-5 lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[0.95rem] font-semibold text-ink">แจ้งเหตุล่าสุด</h2>
              <Link
                href="/admin/cases"
                className="flex items-center gap-1 text-[0.8rem] font-medium text-mint-700 hover:text-mint-600"
              >
                จัดการเคส
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>

            {!mounted || !computed ? (
              <p className="py-6 text-center text-[0.84rem] text-ink-mute">กำลังโหลด…</p>
            ) : computed.recent.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-[1.6rem]" aria-hidden="true">🌤️</p>
                <p className="mt-1 text-[0.88rem] font-medium text-ink">ยังไม่มีเคสเข้ามา</p>
                <p className="mt-0.5 text-[0.78rem] text-ink-mute">
                  เมื่อนักเรียนแจ้งเหตุแบบระบุตัวตน เคสจะปรากฏที่นี่ทันที
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {computed.recent.map((c) => {
                  const st = CASE_STATUS_META[c.status];
                  const open = isOpenStatus(c.status);
                  const tri = open ? triageScore(c, now) : null;
                  return (
                    <li key={c.id} className="flex items-center gap-3 py-2.5">
                      {c.expectation === "urgent" && (
                        <ShieldAlert
                          className="size-4 shrink-0 text-risk-high"
                          aria-hidden="true"
                        />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.88rem] font-medium text-ink">
                          {c.categoryLabel}
                        </span>
                        <span className="block text-[0.72rem] text-ink-mute">
                          {c.id} · {fmt(c.createdAt)}
                        </span>
                      </span>
                      {tri && (
                        <span
                          title={tri.factors.join(" · ")}
                          className={cn(
                            "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[0.68rem] font-medium ring-1",
                            TRIAGE_BAND_META[tri.band].tint,
                          )}
                        >
                          {TRIAGE_BAND_META[tri.band].label} · {tri.score}
                        </span>
                      )}
                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.72rem] font-medium ring-1",
                          st.tint,
                        )}
                      >
                        <span className={cn("size-1.5 rounded-full", st.dot)} />
                        {st.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        )}

        <div className={cn("space-y-3", clinical ? "" : "lg:col-span-3")}>
          {/* my work — only meaningful for the signed-in clinical person */}
          {clinical && (
            <Card className="p-5">
              <h2 className="flex items-center gap-1.5 text-[0.95rem] font-semibold text-ink">
                <User className="size-4 text-ink-mute" aria-hidden="true" />
                งานของฉัน
              </h2>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link
                    href="/admin/cases"
                    className="flex items-center justify-between rounded-xl bg-neutral-50 px-3.5 py-2.5 text-[0.84rem] text-ink transition hover:bg-neutral-100"
                  >
                    เคสที่ฉันดูแล (ยังเปิดอยู่)
                    <span className="font-bold tabular-nums">
                      {mounted && computed ? computed.myOpenCases : "—"}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/appointments"
                    className="flex items-center justify-between rounded-xl bg-neutral-50 px-3.5 py-2.5 text-[0.84rem] text-ink transition hover:bg-neutral-100"
                  >
                    นัดถึงฉันที่รอยืนยัน
                    <span className="font-bold tabular-nums">
                      {mounted && computed ? computed.myPendingAppts : "—"}
                    </span>
                  </Link>
                </li>
              </ul>
            </Card>
          )}

          {/* anonymous aggregate — no identity, no story, by design */}
          <Card className="p-5">
            <h2 className="text-[0.95rem] font-semibold text-ink">
              สัญญาณแบบไม่ระบุตัวตน
            </h2>
            <p className="mt-1 text-[0.76rem] text-ink-soft">
              นับเป็นสัญญาณเท่านั้น ไม่มีชื่อไม่มีเนื้อหา — ตามที่สัญญากับนักเรียน
            </p>
            {!mounted || !computed ? (
              <p className="py-4 text-[0.84rem] text-ink-mute">กำลังโหลด…</p>
            ) : computed.anonTotal === 0 ? (
              <p className="py-4 text-[0.84rem] text-ink-mute">ยังไม่มีข้อมูล</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(computed.anonByCat).map(([label, n]) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-[0.8rem] text-ink-soft"
                  >
                    {label}
                    <span className="font-bold tabular-nums text-ink">{n}</span>
                  </span>
                ))}
              </div>
            )}
            <Link
              href="/admin/insights"
              className="mt-3 inline-flex items-center gap-1 text-[0.78rem] font-medium text-mint-700 hover:text-mint-600"
            >
              <Sparkles className="size-3.5" aria-hidden="true" />
              ดู AI วิเคราะห์แนวโน้ม
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;
