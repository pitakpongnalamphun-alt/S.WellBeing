"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Download,
  Lock,
  MapPin,
  Phone,
  Search,
  ShieldAlert,
  Unlock,
  User,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import {
  CASE_STATUS_META,
  CASE_STATUS_ORDER,
  isOpenStatus,
  slaState,
  type CaseStatus,
  type SafeCase,
  useCasesStore,
} from "@/lib/store/useCasesStore";
import { TRIAGE_BAND_META, triageScore } from "@/lib/insights/triage";
import { useAuditStore } from "@/lib/store/useAuditStore";
import { useStaffSession } from "@/lib/store/useStaffSessionStore";
import { useStaffAccountsStore } from "@/lib/store/useStaffAccountsStore";
import { COUNSELOR_BY_ID } from "@/data/counselors";
import type { StaffAccount } from "@/data/staff";
import { downloadCsv } from "@/lib/csv";
import { localDay } from "@/lib/date";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

/**
 * Assignees come from the LIVE staff-accounts store (the /admin/staff page),
 * not the static counselor list — an account added there must be assignable
 * here the same minute, and a deactivated one must drop out of the picker
 * while cases already assigned to it still show who holds them.
 */
function useAssignees(): StaffAccount[] {
  const accounts = useStaffAccountsStore((s) => s.accounts);
  return useMemo(
    () => accounts.filter((a) => a.active && a.role !== "admin"),
    [accounts],
  );
}

/** Best-effort name for an assignee id no longer in the active picker. */
function useResolveStaffName(): (id: string) => string {
  const accounts = useStaffAccountsStore((s) => s.accounts);
  return useMemo(() => {
    const byId = Object.fromEntries(accounts.map((a) => [a.id, a.name]));
    return (id: string) =>
      byId[id] ?? COUNSELOR_BY_ID[id]?.name ?? "บัญชีเดิม (ถูกลบไปแล้ว)";
  }, [accounts]);
}

/**
 * Label for an assignee who fell out of the active picker — say WHY, because
 * "deactivated" is a lie for an account that was promoted to admin or removed.
 */
function useMissingAssigneeLabel(): (id: string) => string {
  const accounts = useStaffAccountsStore((s) => s.accounts);
  return useMemo(() => {
    const byId = Object.fromEntries(accounts.map((a) => [a.id, a]));
    return (id: string) => {
      const a = byId[id];
      if (a && !a.active) return `${a.name} (บัญชีถูกปิดใช้งาน)`;
      if (a && a.role === "admin") return `${a.name} (ย้ายไปเป็นผู้ดูแลระบบ)`;
      if (!a && COUNSELOR_BY_ID[id]) return `${COUNSELOR_BY_ID[id].name} (ไม่อยู่ในระบบแล้ว)`;
      if (!a) return "บัญชีเดิม (ถูกลบไปแล้ว)";
      return a.name;
    };
  }, [accounts]);
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
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

function SlaChip({ c, now }: { c: SafeCase; now: number }) {
  const sla = slaState(c, now);
  const map: Record<string, { cls: string; label: string }> = {
    on_track: {
      cls: "bg-amber-50 text-amber-700 ring-amber-200",
      label: `⏳ รับใน ${fmtDur(sla.remainingMs)}`,
    },
    overdue: {
      cls: "bg-risk-high-bg text-risk-high ring-risk-high/30 font-bold",
      label: `⏰ เกิน SLA ${fmtDur(-sla.remainingMs)}`,
    },
    met: { cls: "bg-mint-50 text-mint-700 ring-mint-200", label: "✓ รับตรงเวลา" },
    missed: { cls: "bg-slate-100 text-slate-500 ring-slate-200", label: "รับช้ากว่ากำหนด" },
  };
  const m = map[sla.state];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[0.7rem] font-medium ring-1",
        m.cls,
      )}
    >
      {m.label}
    </span>
  );
}

/**
 * Rule-based priority score (lib/insights/triage) — shown only while a case is
 * open. The tooltip lists every factor, so the ranking is explainable at a
 * glance and never reads as a black box.
 */
function TriageChip({ c, now }: { c: SafeCase; now: number }) {
  if (!isOpenStatus(c.status)) return null;
  const t = triageScore(c, now);
  const meta = TRIAGE_BAND_META[t.band];
  return (
    <span
      title={t.factors.join(" · ")}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[0.7rem] font-medium ring-1",
        meta.tint,
      )}
    >
      {meta.label} · {t.score}
    </span>
  );
}

type Filter = "all" | CaseStatus;
type Assignee = "all" | "unassigned" | string;

function CaseCard({ c, now }: { c: SafeCase; now: number }) {
  const setStatus = useCasesStore((s) => s.setStatus);
  const setNote = useCasesStore((s) => s.setNote);
  const assign = useCasesStore((s) => s.assign);
  const logAccess = useAuditStore((s) => s.log);
  const actor = useStaffSession()?.name ?? "ผู้ดูแลระบบ";
  const assignees = useAssignees();
  const resolveStaffName = useResolveStaffName();
  const missingLabel = useMissingAssigneeLabel();
  // A case can point at an account that was later deactivated/removed — keep
  // showing who holds it instead of silently rendering "unassigned".
  const assigneeMissing =
    !!c.assignedTo && !assignees.some((a) => a.id === c.assignedTo);
  const [draft, setDraft] = useState(c.note);
  const [saved, setSaved] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const dirty = draft !== c.note;

  // PDPA §37: revealing a student's identity is a logged access event.
  function revealContact() {
    logAccess({
      actor,
      action: "view_contact",
      targetType: "เคส",
      targetId: c.id,
      subject: c.contact.name || "(ไม่ระบุชื่อ)",
    });
    setRevealed(true);
  }

  // Whose case this is — recorded on every logged action for accountability.
  const subject = c.contact.name || "(ไม่ระบุชื่อ)";

  function saveNote() {
    if (!dirty) return;
    setNote(c.id, draft);
    // Log THAT the note changed, never the note body — it can hold sensitive
    // detail, and the trail records who/when, not what was written.
    logAccess({ actor, action: "edit_note", targetType: "เคส", targetId: c.id, subject });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  // A status OR assignee change can drop this card out of a filtered view and
  // unmount it, which would lose an unsaved draft — so flush it first. Every
  // real change is written to the PDPA accountability log (ม.37).
  function changeStatus(st: CaseStatus) {
    if (st === c.status) return;
    if (dirty) setNote(c.id, draft);
    setStatus(c.id, st);
    logAccess({
      actor,
      action: "change_status",
      targetType: "เคส",
      targetId: c.id,
      subject,
      detail: `→ ${CASE_STATUS_META[st].label}`,
    });
  }
  function changeAssignee(assigneeId: string) {
    if (assigneeId === (c.assignedTo ?? "")) return;
    if (dirty) setNote(c.id, draft);
    assign(c.id, assigneeId);
    const who = assigneeId ? resolveStaffName(assigneeId) : "เอาออกจากผู้รับผิดชอบ";
    logAccess({
      actor,
      action: "assign_case",
      targetType: "เคส",
      targetId: c.id,
      subject,
      detail: `→ ${who}`,
    });
  }

  return (
    <Card className="p-4">
      {/* header */}
      <div className="flex flex-wrap items-center gap-2">
        {c.expectation === "urgent" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-risk-high-bg px-2.5 py-1 text-[0.72rem] font-bold text-risk-high">
            <ShieldAlert className="size-3.5" aria-hidden="true" /> ด่วน
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-lavender-100 px-2.5 py-1 text-[0.72rem] font-medium text-lavender-700">
            ⏳ ขอเวลาเตรียมใจ
          </span>
        )}
        {c.sensitive && (
          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[0.72rem] font-medium text-rose-600 ring-1 ring-rose-200">
            อ่อนไหว
          </span>
        )}
        <span className="text-[0.9rem] font-bold text-ink">{c.categoryLabel}</span>
        <span className="ml-auto font-mono text-[0.74rem] text-ink-mute">{c.id}</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[0.72rem] text-ink-mute">แจ้งเมื่อ {fmt(c.createdAt)}</p>
        <span className="flex flex-wrap items-center gap-1.5">
          <TriageChip c={c} now={now} />
          <SlaChip c={c} now={now} />
        </span>
      </div>

      {/* contact — identity is masked until a logged reveal (PDPA §37) */}
      <div className="mt-3">
        {revealed ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.82rem] text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <User className="size-3.5 text-ink-mute" aria-hidden="true" />
              {c.contact.name || "—"}
              {c.contact.room ? ` · ${c.contact.room}` : ""}
            </span>
            {c.contact.phone && (
              <a
                href={`tel:${c.contact.phone}`}
                className="inline-flex items-center gap-1.5 text-mint-700 hover:underline"
              >
                <Phone className="size-3.5" aria-hidden="true" />
                {c.contact.phone}
              </a>
            )}
            <span className="inline-flex items-center gap-1 text-[0.7rem] text-ink-mute">
              <Unlock className="size-3" aria-hidden="true" /> เปิดดูแล้ว · บันทึกการเข้าถึงไว้
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={revealContact}
            className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-50 px-3 py-1.5 text-[0.8rem] font-medium text-ink-soft ring-1 ring-neutral-200 transition hover:text-ink hover:ring-neutral-300"
          >
            <Lock className="size-3.5 text-ink-mute" aria-hidden="true" />
            ดูข้อมูลติดต่อผู้แจ้ง
            <span className="text-[0.68rem] font-normal text-ink-mute">
              · บันทึกการเข้าถึง (PDPA ม.37)
            </span>
          </button>
        )}
        {c.location && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[0.82rem] text-ink-soft">
            <MapPin className="size-3.5 text-ink-mute" aria-hidden="true" />
            {c.location.th}
          </p>
        )}
      </div>

      {/* story */}
      <div className="mt-3 space-y-1.5 rounded-xl bg-neutral-50 p-3 text-[0.82rem] leading-relaxed text-ink-soft">
        <p className="whitespace-pre-wrap text-ink">{c.incident}</p>
        {c.victim && (
          <p>
            <span className="text-ink-mute">ผู้ถูกกระทำ:</span> {c.victim}
          </p>
        )}
        {c.perpetrator && (
          <p>
            <span className="text-ink-mute">ผู้กระทำ:</span> {c.perpetrator}
          </p>
        )}
      </div>

      {/* assignee + status */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[0.72rem] font-medium text-ink-mute">ผู้รับผิดชอบ</p>
          <select
            value={c.assignedTo ?? ""}
            onChange={(e) => changeAssignee(e.target.value)}
            aria-label="มอบหมายผู้รับผิดชอบ"
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[0.82rem] text-ink focus:border-mint-400 focus:outline-none focus:ring-4 focus:ring-mint-100"
          >
            <option value="">— ยังไม่มอบหมาย</option>
            {assigneeMissing && c.assignedTo && (
              <option value={c.assignedTo}>{missingLabel(c.assignedTo)}</option>
            )}
            {assignees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.emoji} {a.name} · {a.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="mb-1.5 text-[0.72rem] font-medium text-ink-mute">สถานะ</p>
          <div className="flex flex-wrap gap-1.5">
            {CASE_STATUS_ORDER.map((st) => {
              const meta = CASE_STATUS_META[st];
              const active = c.status === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => changeStatus(st)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.76rem] font-medium ring-1 transition",
                    active
                      ? meta.tint
                      : "bg-white text-ink-mute ring-neutral-200 hover:text-ink hover:ring-neutral-300",
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", active ? meta.dot : "bg-neutral-300")} />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* follow-up note */}
      <div className="mt-3">
        <p className="mb-1.5 text-[0.72rem] font-medium text-ink-mute">บันทึกการติดตาม</p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          placeholder="สรุปการติดต่อ / การดูแล…"
          className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[0.82rem] text-ink placeholder:text-ink-mute focus:border-mint-400 focus:outline-none focus:ring-4 focus:ring-mint-100"
        />
        <div className="mt-1.5 flex justify-end">
          <button
            type="button"
            onClick={saveNote}
            disabled={!dirty}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[0.78rem] font-medium transition",
              saved && !dirty
                ? "bg-mint-100 text-mint-700"
                : dirty
                  ? "bg-mint-700 text-white hover:bg-mint-600"
                  : "cursor-not-allowed bg-neutral-100 text-ink-mute",
            )}
          >
            {saved && !dirty ? (
              <>
                <Check className="size-3.5" aria-hidden="true" /> บันทึกแล้ว
              </>
            ) : (
              "บันทึก"
            )}
          </button>
        </div>
      </div>
    </Card>
  );
}

export function AdminCasesBoard() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(0);
  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const cases = useCasesStore((s) => s.cases);
  const staff = useStaffSession();
  const myId = staff?.id;
  const assignees = useAssignees();
  const resolveStaffName = useResolveStaffName();
  const logAccess = useAuditStore((s) => s.log);
  const [filter, setFilter] = useState<Filter>("all");
  const [assignee, setAssignee] = useState<Assignee>("all");
  const [byScore, setByScore] = useState(false);
  const [q, setQ] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  // New filter/search → back to page one, so results are never hidden above.
  useEffect(() => setVisible(PAGE_SIZE), [filter, assignee, q, byScore]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: cases.length,
      pending: 0,
      in_progress: 0,
      resolved: 0,
      followup: 0,
    };
    for (const k of cases) c[k.status] += 1;
    return c;
  }, [cases]);

  const shown = useMemo(() => {
    const priority = (c: SafeCase) => {
      if (c.status !== "pending") return 2;
      return slaState(c, now).state === "overdue" ? 0 : 1;
    };
    // Triage-sort: open cases by score (desc), closed cases after by recency.
    const score = new Map(cases.map((c) => [c.id, triageScore(c, now).score]));
    const openRank = (c: SafeCase) => (isOpenStatus(c.status) ? 0 : 1);
    const qq = q.trim().toLowerCase();
    return cases
      .filter((c) => filter === "all" || c.status === filter)
      .filter((c) =>
        assignee === "all"
          ? true
          : assignee === "unassigned"
            ? !c.assignedTo
            : assignee === "mine"
              ? !!myId && c.assignedTo === myId
              : c.assignedTo === assignee,
      )
      .filter(
        (c) =>
          !qq ||
          // Deliberately NOT c.contact.name: that field is masked behind the
          // logged reveal (PDPA ม.37) — search must not become an unlogged
          // identity oracle over the very field the reveal flow gates.
          [c.id, c.categoryLabel, c.note, c.location?.th ?? ""].some((v) =>
            v.toLowerCase().includes(qq),
          ),
      )
      .sort((a, b) =>
        byScore
          ? openRank(a) - openRank(b) ||
            // Score orders the OPEN group only — closed cases have no visible
            // chip, so they fall back to recency like everywhere else.
            (isOpenStatus(a.status)
              ? (score.get(b.id) ?? 0) - (score.get(a.id) ?? 0)
              : 0) ||
            b.createdAt.localeCompare(a.createdAt) ||
            a.id.localeCompare(b.id)
          : priority(a) - priority(b) ||
            b.createdAt.localeCompare(a.createdAt) ||
            a.id.localeCompare(b.id),
      );
  }, [cases, filter, assignee, now, myId, byScore, q]);

  // Export the CURRENT filtered view — a data-minimised summary only (no
  // incident text, no contact details), and the export itself is audited.
  function exportCsv() {
    if (shown.length === 0) return;
    downloadCsv(`cases-${localDay()}.csv`, [
      ["รหัสเคส", "วันที่แจ้ง", "หมวด", "ความเร่งด่วน", "สถานะ", "ผู้รับผิดชอบ", "สถานที่"],
      ...shown.map((c) => [
        c.id,
        fmt(c.createdAt),
        c.categoryLabel,
        c.expectation === "urgent" ? "ด่วน" : "ขอเวลาเตรียมใจ",
        CASE_STATUS_META[c.status].label,
        c.assignedTo ? resolveStaffName(c.assignedTo) : "-",
        c.location?.th ?? "-",
      ]),
    ]);
    logAccess({
      actor: staff?.name ?? "ผู้ดูแลระบบ",
      action: "export_cases",
      targetType: "ไฟล์",
      targetId: `cases-${localDay()}.csv`,
      subject: `${shown.length} เคส (สรุปย่อ ไม่มีเนื้อหา/ข้อมูลติดต่อ)`,
    });
  }

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "ทั้งหมด" },
    ...CASE_STATUS_ORDER.map((s) => ({ id: s, label: CASE_STATUS_META[s].label })),
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display th:leading-snug text-[1.6rem] font-bold text-ink">
            จัดการเคส
          </h1>
          <p className="mt-1 text-[0.88rem] text-ink-soft">
            มอบหมายผู้รับผิดชอบ ติดตาม SLA และดูแลจนถึงปิดเคส
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={!mounted || shown.length === 0}
          title="ส่งออกรายการตามตัวกรองปัจจุบัน — สรุปย่อเท่านั้น ไม่มีเนื้อหาและข้อมูลติดต่อ (บันทึกการส่งออกลง audit)"
          className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-[0.82rem] font-medium text-ink-soft ring-1 ring-neutral-200 transition hover:text-ink hover:ring-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="size-4" aria-hidden="true" />
          ส่งออก CSV
        </button>
      </header>

      {/* status filter + assignee filter */}
      <div className="flex flex-wrap items-center gap-2">
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

        <button
          type="button"
          onClick={() => setByScore((v) => !v)}
          aria-pressed={byScore}
          title="เรียงเคสที่เปิดอยู่ตามคะแนนความเร่งด่วน (มาก → น้อย)"
          className={cn(
            "ml-auto inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.82rem] font-medium ring-1 transition",
            byScore
              ? "bg-mint-600 text-white ring-mint-600"
              : "bg-white text-ink-soft ring-neutral-200 hover:text-ink",
          )}
        >
          เรียงตามคะแนน
        </button>

        <select
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          aria-label="กรองตามผู้รับผิดชอบ"
          className="rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-[0.82rem] text-ink-soft focus:border-mint-400 focus:outline-none focus:ring-4 focus:ring-mint-100"
        >
          <option value="all">ผู้รับผิดชอบ: ทุกคน</option>
          {myId && <option value="mine">เคสของฉัน</option>}
          <option value="unassigned">ยังไม่มอบหมาย</option>
          {assignees.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* text search — id, name, category, place, note */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-mute"
          aria-hidden="true"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ค้นหา: รหัสเคส หมวด สถานที่ หรือบันทึกการติดตาม…"
          aria-label="ค้นหาเคส"
          className="w-full rounded-full border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-[0.84rem] text-ink placeholder:text-ink-mute focus:border-mint-400 focus:outline-none focus:ring-4 focus:ring-mint-100"
        />
      </div>

      {!mounted ? (
        <p className="py-12 text-center text-[0.88rem] text-ink-mute">กำลังโหลด…</p>
      ) : shown.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-[0.9rem] font-medium text-ink">
            {cases.length === 0 ? "ยังไม่มีเคสเข้ามา" : "ไม่มีเคสตามเงื่อนไขนี้"}
          </p>
          <p className="mt-1 text-[0.82rem] text-ink-soft">
            เมื่อนักเรียนแจ้งเหตุแบบระบุตัวตน เคสจะปรากฏที่นี่ทันที
          </p>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {shown.slice(0, visible).map((c) => (
              <CaseCard key={c.id} c={c} now={now} />
            ))}
          </div>
          {shown.length > visible && (
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="mx-auto block rounded-full bg-white px-5 py-2.5 text-[0.84rem] font-medium text-ink-soft ring-1 ring-neutral-200 transition hover:text-ink hover:ring-neutral-300"
            >
              แสดงเพิ่ม (เหลืออีก {shown.length - visible} เคส)
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default AdminCasesBoard;
