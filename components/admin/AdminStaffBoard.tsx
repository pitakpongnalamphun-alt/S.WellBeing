"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Pencil,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import {
  STAFF_ROLE_META,
  STAFF_ROLE_ORDER,
  type StaffAccount,
  type StaffRole,
} from "@/data/staff";
import { useStaffAccountsStore } from "@/lib/store/useStaffAccountsStore";
import { useStaffSessionStore } from "@/lib/store/useStaffSessionStore";
import { cn } from "@/lib/utils";

const FIELD_LABEL = "mb-1.5 block text-[0.74rem] font-medium text-ink-mute";
const FIELD_INPUT =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[0.85rem] text-ink placeholder:text-ink-mute focus:border-mint-400 focus:outline-none focus:ring-4 focus:ring-mint-100";

function RoleSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: StaffRole;
  onChange: (r: StaffRole) => void;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as StaffRole)}
      className={FIELD_INPUT}
    >
      {STAFF_ROLE_ORDER.map((r) => (
        <option key={r} value={r}>
          {STAFF_ROLE_META[r].label}
        </option>
      ))}
    </select>
  );
}

/* -------------------------------------------------------------- add form */

function AddStaffForm({ onClose }: { onClose: () => void }) {
  const add = useStaffAccountsStore((s) => s.add);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("🙂");
  const [role, setRole] = useState<StaffRole>("counselor");
  const [passcode, setPasscode] = useState("");

  const canSave = name.trim().length > 0 && passcode.trim().length > 0;

  function submit() {
    if (!canSave) return;
    add({
      name: name.trim(),
      title: title.trim() || STAFF_ROLE_META[role].label,
      emoji: emoji.trim() || "🙂",
      role,
      passcode: passcode.trim(),
      active: true,
    });
    onClose();
  }

  return (
    <Card className="border-l-4 border-l-mint-500 p-5">
      <div className="mb-4 flex items-center gap-2">
        <UserPlus className="size-4 text-mint-600" aria-hidden="true" />
        <h2 className="text-[0.95rem] font-semibold text-ink">เพิ่มบัญชีเจ้าหน้าที่</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 grid grid-cols-[auto_1fr] gap-3">
          <div>
            <label htmlFor="as-emoji" className={FIELD_LABEL}>
              อีโมจิ
            </label>
            <input
              id="as-emoji"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              maxLength={4}
              className={cn(FIELD_INPUT, "w-16 text-center text-lg")}
            />
          </div>
          <div>
            <label htmlFor="as-name" className={FIELD_LABEL}>
              ชื่อ <span className="text-rose-500">*</span>
            </label>
            <input
              id="as-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น ครูสมชาย"
              className={FIELD_INPUT}
            />
          </div>
        </div>

        <div>
          <label htmlFor="as-role" className={FIELD_LABEL}>
            บทบาท
          </label>
          <RoleSelect id="as-role" value={role} onChange={setRole} />
        </div>

        <div>
          <label htmlFor="as-title" className={FIELD_LABEL}>
            ตำแหน่ง <span className="font-normal text-ink-mute">(ไม่บังคับ)</span>
          </label>
          <input
            id="as-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น ครูแนะแนว"
            className={FIELD_INPUT}
          />
        </div>

        <div>
          <label htmlFor="as-pass" className={FIELD_LABEL}>
            รหัสผ่าน <span className="text-rose-500">*</span>
          </label>
          <input
            id="as-pass"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="เช่น 4821"
            className={FIELD_INPUT}
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
          <Check className="size-3.5" aria-hidden="true" /> เพิ่มบัญชี
        </button>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------- one row */

function StaffRow({
  account,
  isSelf,
  lastActiveAdmin,
}: {
  account: StaffAccount;
  isSelf: boolean;
  /** This is the only active admin — protect it from lockout. */
  lastActiveAdmin: boolean;
}) {
  const update = useStaffAccountsStore((s) => s.update);
  const remove = useStaffAccountsStore((s) => s.remove);

  const [editing, setEditing] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [name, setName] = useState(account.name);
  const [title, setTitle] = useState(account.title);
  const [emoji, setEmoji] = useState(account.emoji);
  const [role, setRole] = useState<StaffRole>(account.role);
  const [passcode, setPasscode] = useState(account.passcode);

  const roleMeta = STAFF_ROLE_META[account.role];
  // Turning off (or removing) yourself or the last admin would lock the door.
  const lockDisable = account.active && (isSelf || lastActiveAdmin);
  const lockRemove = isSelf || lastActiveAdmin;

  function startEdit() {
    setName(account.name);
    setTitle(account.title);
    setEmoji(account.emoji);
    setRole(account.role);
    setPasscode(account.passcode);
    setEditing(true);
  }
  // Demoting the only admin would lock everyone out of staff management.
  const demotingLastAdmin = lastActiveAdmin && role !== "admin";

  function saveEdit() {
    if (!name.trim() || !passcode.trim() || demotingLastAdmin) return;
    update(account.id, {
      name: name.trim(),
      title: title.trim() || STAFF_ROLE_META[role].label,
      emoji: emoji.trim() || "🙂",
      role,
      passcode: passcode.trim(),
    });
    setEditing(false);
  }

  if (editing) {
    const canSave =
      name.trim().length > 0 && passcode.trim().length > 0 && !demotingLastAdmin;
    return (
      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2 grid grid-cols-[auto_1fr] gap-3">
            <div>
              <label htmlFor={`e-emoji-${account.id}`} className={FIELD_LABEL}>
                อีโมจิ
              </label>
              <input
                id={`e-emoji-${account.id}`}
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={4}
                className={cn(FIELD_INPUT, "w-16 text-center text-lg")}
              />
            </div>
            <div>
              <label htmlFor={`e-name-${account.id}`} className={FIELD_LABEL}>
                ชื่อ
              </label>
              <input
                id={`e-name-${account.id}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={FIELD_INPUT}
              />
            </div>
          </div>
          <div>
            <label htmlFor={`e-role-${account.id}`} className={FIELD_LABEL}>
              บทบาท
            </label>
            <RoleSelect id={`e-role-${account.id}`} value={role} onChange={setRole} />
          </div>
          <div>
            <label htmlFor={`e-title-${account.id}`} className={FIELD_LABEL}>
              ตำแหน่ง
            </label>
            <input
              id={`e-title-${account.id}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={FIELD_INPUT}
            />
          </div>
          <div>
            <label htmlFor={`e-pass-${account.id}`} className={FIELD_LABEL}>
              รหัสผ่าน
            </label>
            <input
              id={`e-pass-${account.id}`}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className={FIELD_INPUT}
            />
          </div>
        </div>
        {demotingLastAdmin ? (
          <p className="mt-2 text-[0.74rem] font-medium text-rose-600">
            ต้องเหลือผู้ดูแลระบบที่เปิดใช้งานอย่างน้อยหนึ่งคน — เปลี่ยนบทบาทนี้ไม่ได้
          </p>
        ) : (
          role !== account.role &&
          isSelf && (
            <p className="mt-2 text-[0.74rem] text-amber-700">
              การเปลี่ยนบทบาทของตัวเองอาจทำให้คุณเข้าบางหน้าไม่ได้ในทันที
            </p>
          )
        )}
        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg px-3 py-1.5 text-[0.8rem] font-medium text-ink-mute transition hover:text-ink"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={saveEdit}
            disabled={!canSave}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[0.8rem] font-medium transition",
              canSave
                ? "bg-mint-700 text-white hover:bg-mint-600"
                : "cursor-not-allowed bg-neutral-100 text-ink-mute",
            )}
          >
            <Check className="size-3.5" aria-hidden="true" /> บันทึก
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-4", !account.active && "opacity-70")}>
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-neutral-100 text-xl">
          {account.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[0.92rem] font-bold text-ink">{account.name}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[0.66rem] font-medium",
                roleMeta.tint,
              )}
            >
              {roleMeta.label}
            </span>
            {isSelf && (
              <span className="rounded-full bg-mint-50 px-2 py-0.5 text-[0.66rem] font-medium text-mint-700 ring-1 ring-mint-200">
                คุณ
              </span>
            )}
            {!account.active && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.66rem] font-medium text-slate-500">
                ปิดใช้งาน
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[0.76rem] text-ink-mute">{account.title}</p>
        </div>

        {/* passcode */}
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-50 px-2.5 py-1.5 ring-1 ring-neutral-200">
          <KeyRound className="size-3.5 text-ink-mute" aria-hidden="true" />
          <span className="font-mono text-[0.8rem] text-ink">
            {reveal ? account.passcode : "••••"}
          </span>
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? "ซ่อนรหัส" : "แสดงรหัส"}
            className="text-ink-mute transition hover:text-ink"
          >
            {reveal ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </button>
        </div>
      </div>

      {/* actions */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={startEdit}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[0.78rem] font-medium text-ink-soft ring-1 ring-neutral-200 transition hover:text-ink hover:ring-neutral-300"
        >
          <Pencil className="size-3.5" aria-hidden="true" /> แก้ไข
        </button>

        <button
          type="button"
          disabled={lockDisable}
          title={lockDisable ? "ต้องมีผู้ดูแลระบบที่เปิดใช้งานอย่างน้อยหนึ่งคน" : undefined}
          onClick={() => update(account.id, { active: !account.active })}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[0.78rem] font-medium ring-1 transition",
            lockDisable
              ? "cursor-not-allowed bg-neutral-50 text-ink-mute ring-neutral-200"
              : account.active
                ? "bg-white text-amber-700 ring-amber-200 hover:bg-amber-50"
                : "bg-mint-700 text-white ring-mint-700 hover:bg-mint-600",
          )}
        >
          {account.active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
        </button>

        {confirming ? (
          <span className="inline-flex items-center gap-2">
            <span className="text-[0.76rem] text-ink-mute">ลบบัญชีนี้?</span>
            <button
              type="button"
              onClick={() => remove(account.id)}
              className="rounded-lg bg-rose-500 px-3 py-1.5 text-[0.76rem] font-semibold text-white transition hover:bg-rose-600"
            >
              ยืนยันลบ
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-lg px-2 py-1.5 text-[0.76rem] font-medium text-ink-mute hover:text-ink"
            >
              ไม่
            </button>
          </span>
        ) : (
          <button
            type="button"
            disabled={lockRemove}
            title={
              lockRemove
                ? isSelf
                  ? "ลบบัญชีที่กำลังใช้งานอยู่ไม่ได้"
                  : "ต้องเหลือผู้ดูแลระบบที่เปิดใช้งานอย่างน้อยหนึ่งคน"
                : undefined
            }
            onClick={() => setConfirming(true)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[0.78rem] font-medium ring-1 transition",
              lockRemove
                ? "cursor-not-allowed bg-neutral-50 text-ink-mute ring-neutral-200"
                : "bg-white text-rose-600 ring-rose-200 hover:bg-rose-50",
            )}
          >
            <Trash2 className="size-3.5" aria-hidden="true" /> ลบ
          </button>
        )}
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------- board */

export function AdminStaffBoard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const accounts = useStaffAccountsStore((s) => s.accounts);
  const myId = useStaffSessionStore((s) => s.staffId);
  const [adding, setAdding] = useState(false);

  const activeAdmins = accounts.filter((a) => a.role === "admin" && a.active).length;
  const sorted = [...accounts].sort(
    (a, b) => Number(b.active) - Number(a.active),
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display th:leading-snug text-[1.6rem] font-bold text-ink">
            บัญชีเจ้าหน้าที่
          </h1>
          <p className="mt-1 text-[0.88rem] text-ink-soft">
            เพิ่ม แก้ไข เปิด/ปิดการใช้งาน และตั้งรหัสผ่านของผู้ที่เข้าใช้ฝั่งเจ้าหน้าที่
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          aria-expanded={adding}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[0.86rem] font-medium transition",
            adding
              ? "bg-neutral-100 text-ink-soft hover:text-ink"
              : "bg-mint-700 text-white hover:bg-mint-600",
          )}
        >
          <UserPlus className="size-4" aria-hidden="true" />
          {adding ? "ปิดฟอร์ม" : "เพิ่มเจ้าหน้าที่"}
        </button>
      </header>

      <Card className="flex items-start gap-3 border-l-4 border-l-amber-400 p-4">
        <KeyRound className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden="true" />
        <p className="text-[0.8rem] leading-relaxed text-ink-soft">
          นี่เป็นระบบสาธิต — รหัสผ่านถูกเก็บในเครื่องนี้เท่านั้น (ยังไม่ปลอดภัยแบบใช้งานจริง)
          ในระบบจริงจะย้ายไปเป็นการยืนยันตัวตนฝั่งเซิร์ฟเวอร์
        </p>
      </Card>

      {adding && <AddStaffForm onClose={() => setAdding(false)} />}

      {!mounted ? (
        <p className="py-12 text-center text-[0.88rem] text-ink-mute">กำลังโหลด…</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((a) => (
            <StaffRow
              key={a.id}
              account={a}
              isSelf={a.id === myId}
              lastActiveAdmin={a.role === "admin" && a.active && activeAdmins === 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminStaffBoard;
