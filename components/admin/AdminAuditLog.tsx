"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  Eye,
  Lock,
  PencilLine,
  RefreshCw,
  Search,
  User,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { AUDIT_ACTION_LABEL, useAuditStore } from "@/lib/store/useAuditStore";
import { useStaffSession } from "@/lib/store/useStaffSessionStore";
import { downloadCsv } from "@/lib/csv";
import { localDay } from "@/lib/date";
import { cn } from "@/lib/utils";

const DAY_MS = 24 * 60 * 60 * 1000;
type RangeId = "all" | "today" | "7d" | "30d";
const RANGES: { id: RangeId; label: string }[] = [
  { id: "all", label: "ทั้งหมด" },
  { id: "today", label: "วันนี้" },
  { id: "7d", label: "7 วัน" },
  { id: "30d", label: "30 วัน" },
];

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

/** Icon + tint per action, so the trail is scannable at a glance. */
const ACTION_VIS: Record<string, { Icon: LucideIcon; cls: string }> = {
  view_contact: { Icon: Eye, cls: "bg-lavender-50 text-lavender-700" },
  change_status: { Icon: RefreshCw, cls: "bg-amber-50 text-amber-700" },
  assign_case: { Icon: UserCheck, cls: "bg-mint-50 text-mint-700" },
  edit_note: { Icon: PencilLine, cls: "bg-slate-100 text-slate-600" },
};
const DEFAULT_VIS = { Icon: Eye, cls: "bg-lavender-50 text-lavender-700" };

export function AdminAuditLog() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(0);
  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    // Tick like the other boards: the "วันนี้"/7d/30d boundaries must keep
    // moving in a long-lived tab, or a midnight-crossing export lies.
    const t = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const entries = useAuditStore((s) => s.entries);
  const logAccess = useAuditStore((s) => s.log);
  const auditSource = useAuditStore((s) => s.source);
  const syncAudit = useAuditStore((s) => s.syncFromServer);
  // ดึงของจริงจากตารางเขียนเพิ่มอย่างเดียวเมื่อเปิดหน้า — สำเนาในเครื่องเป็นแค่ทางสำรอง
  useEffect(() => {
    void syncAudit();
  }, [syncAudit]);
  const staffName = useStaffSession()?.name ?? "ผู้ดูแลระบบ";
  const [actor, setActor] = useState<string>("all");
  const [range, setRange] = useState<RangeId>("all");
  const [q, setQ] = useState("");
  const [visible, setVisible] = useState(15);
  useEffect(() => setVisible(15), [actor, range, q]);

  const actors = useMemo(
    () => [...new Set(entries.map((e) => e.actor))],
    [entries],
  );

  const shown = useMemo(() => {
    const nowMs = now || Date.now();
    const startOfToday = new Date(nowMs);
    startOfToday.setHours(0, 0, 0, 0);
    const from =
      range === "today"
        ? startOfToday.getTime()
        : range === "7d"
          ? nowMs - 7 * DAY_MS
          : range === "30d"
            ? nowMs - 30 * DAY_MS
            : 0;
    const qq = q.trim().toLowerCase();
    return entries
      .filter((e) => actor === "all" || e.actor === actor)
      .filter((e) => new Date(e.at).getTime() >= from)
      .filter(
        (e) =>
          !qq ||
          [
            e.actor,
            e.targetId,
            e.subject,
            e.detail ?? "",
            AUDIT_ACTION_LABEL[e.action] ?? e.action,
          ].some((v) => v.toLowerCase().includes(qq)),
      );
  }, [entries, actor, range, q, now]);

  function exportCsv() {
    if (shown.length === 0) return;
    downloadCsv(`audit-${localDay()}.csv`, [
      ["เวลา", "ผู้กระทำ", "การกระทำ", "เป้าหมาย", "นักเรียน", "รายละเอียด"],
      ...shown.map((e) => [
        fmt(e.at),
        e.actor,
        AUDIT_ACTION_LABEL[e.action] ?? e.action,
        `${e.targetType} ${e.targetId}`,
        e.subject,
        e.detail ?? "",
      ]),
    ]);
    // Exporting the trail is itself an access — it goes on the trail.
    logAccess({
      actor: staffName,
      action: "export_audit",
      targetType: "ไฟล์",
      targetId: `audit-${localDay()}.csv`,
      subject: `${shown.length} รายการ`,
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="font-display th:leading-snug text-[1.6rem] font-bold text-ink">
          บันทึกการเข้าถึงข้อมูล
        </h1>
        <p className="mt-1 text-[0.88rem] text-ink-soft">
          ใครเปิดดูข้อมูลระบุตัวตน หรือจัดการเคสของนักเรียนคนไหน เมื่อไร — ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล ม.37
        </p>
      </header>

      <Card className="flex items-start gap-3 border-l-4 border-l-mint-500 p-4">
        <Lock className="mt-0.5 size-4 shrink-0 text-mint-600" aria-hidden="true" />
        <p className="text-[0.82rem] leading-relaxed text-ink-soft">
          บันทึกนี้เขียนเพิ่มได้อย่างเดียว <span className="font-medium text-ink">แก้ไขหรือลบไม่ได้</span> —
          ทุกครั้งที่เจ้าหน้าที่เปิดดูข้อมูลติดต่อ เปลี่ยนสถานะ มอบหมาย หรือแก้บันทึกการติดตาม
          ระบบจะบันทึกไว้ที่นี่โดยอัตโนมัติ
          {mounted && (
            <span className="mt-1.5 block text-[0.76rem]">
              {auditSource === "server" ? (
                <span className="text-mint-700">
                  กำลังแสดงบันทึกจากฐานข้อมูล ซึ่งไม่มีสิทธิ์แก้ไขหรือลบให้ใครทั้งสิ้น
                </span>
              ) : (
                <span className="text-amber-700">
                  กำลังแสดงสำเนาในเครื่องนี้ (ยังไม่ได้เชื่อมฐานข้อมูล หรือยังไม่ได้ล็อกอินด้วยบัญชีผู้ดูแลระบบ)
                  — สำเนานี้ลบได้ด้วยการล้างข้อมูลเบราว์เซอร์
                </span>
              )}
            </span>
          )}
        </p>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        {RANGES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setRange(id)}
            aria-pressed={range === id}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[0.8rem] font-medium ring-1 transition",
              range === id
                ? "bg-ink text-white ring-ink"
                : "bg-white text-ink-soft ring-neutral-200 hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
        <span className="text-[0.8rem] text-ink-mute">
          <span className="font-semibold text-ink">{mounted ? shown.length : 0}</span> รายการ
        </span>

        <span className="ml-auto flex flex-wrap items-center gap-2">
          {mounted && actors.length > 1 && (
            <select
              value={actor}
              onChange={(e) => setActor(e.target.value)}
              aria-label="กรองตามผู้เข้าถึง"
              className="rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-[0.82rem] text-ink-soft focus:border-mint-400 focus:outline-none focus:ring-4 focus:ring-mint-100"
            >
              <option value="all">ผู้เข้าถึง: ทุกคน</option>
              {actors.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={exportCsv}
            disabled={!mounted || shown.length === 0}
            title="ส่งออกรายการตามตัวกรองปัจจุบัน (การส่งออกถูกบันทึกลง audit ด้วย)"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[0.82rem] font-medium text-ink-soft ring-1 ring-neutral-200 transition hover:text-ink hover:ring-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="size-3.5" aria-hidden="true" />
            ส่งออก CSV
          </button>
        </span>
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-mute"
          aria-hidden="true"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ค้นหา: ผู้กระทำ รหัสเคส ชื่อนักเรียน หรือชนิดการกระทำ…"
          aria-label="ค้นหาบันทึกการเข้าถึง"
          className="w-full rounded-full border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-[0.84rem] text-ink placeholder:text-ink-mute focus:border-mint-400 focus:outline-none focus:ring-4 focus:ring-mint-100"
        />
      </div>

      {!mounted ? (
        <p className="py-12 text-center text-[0.88rem] text-ink-mute">กำลังโหลด…</p>
      ) : shown.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-[0.9rem] font-medium text-ink">ยังไม่มีการเข้าถึงข้อมูล</p>
          <p className="mt-1 text-[0.82rem] text-ink-soft">
            เมื่อเจ้าหน้าที่เปิดดูข้อมูลติดต่อ เปลี่ยนสถานะ มอบหมาย หรือแก้บันทึกในหน้าจัดการเคส รายการจะปรากฏที่นี่
          </p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {shown.slice(0, visible).map((e) => {
            const { Icon, cls } = ACTION_VIS[e.action] ?? DEFAULT_VIS;
            return (
              <li
                key={e.id}
                className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-neutral-200"
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl",
                    cls,
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.86rem] text-ink">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <User className="size-3.5 text-ink-mute" aria-hidden="true" />
                      {e.actor}
                    </span>{" "}
                    <span className="text-ink-soft">
                      {AUDIT_ACTION_LABEL[e.action] ?? e.action}
                    </span>
                    {e.detail && (
                      <span className="text-ink-mute"> {e.detail}</span>
                    )}
                  </span>
                  <span className="block text-[0.74rem] text-ink-mute">
                    {e.targetType} {e.targetId} · นักเรียน: {e.subject}
                  </span>
                </span>
                <span className={cn("shrink-0 text-[0.74rem] tabular-nums text-ink-mute")}>
                  {fmt(e.at)}
                </span>
              </li>
            );
          })}
          {shown.length > visible && (
            <li>
              <button
                type="button"
                onClick={() => setVisible((v) => v + 15)}
                className="mx-auto block rounded-full bg-white px-5 py-2.5 text-[0.84rem] font-medium text-ink-soft ring-1 ring-neutral-200 transition hover:text-ink hover:ring-neutral-300"
              >
                แสดงเพิ่ม (เหลืออีก {shown.length - visible} รายการ)
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default AdminAuditLog;
