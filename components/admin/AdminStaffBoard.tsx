"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Pencil,
  Trash2,
  TriangleAlert,
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
import { hasSession } from "@/lib/data/casesRepo";
import { useStaffAccountsStore } from "@/lib/store/useStaffAccountsStore";
import { useStaffSessionStore } from "@/lib/store/useStaffSessionStore";
import { isSupabaseConfigured } from "@/lib/supabase/client";
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
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("🙂");
  const [role, setRole] = useState<StaffRole>("counselor");
  const [passcode, setPasscode] = useState("");

  // เชื่อมฐานข้อมูลแล้ว อีเมลคือ "บังคับ" เพราะเป็นกุญแจเดียวที่ใช้ล็อกอินได้จริง —
  // บัญชีที่ไม่มีอีเมลจะขึ้นเซิร์ฟเวอร์ไม่ได้และล็อกอินไม่ได้ กลายเป็นครูผีที่โผล่ใน
  // รายการให้นักเรียนจองนัดแต่ไม่มีตัวตน ส่วนโหมดสาธิตยังใช้รหัสผ่านเหมือนเดิม
  const dbMode = isSupabaseConfigured();
  const canSave =
    name.trim().length > 0 &&
    (dbMode ? email.trim().length > 0 : passcode.trim().length > 0);

  function submit() {
    if (!canSave) return;
    add({
      name: name.trim(),
      email: email.trim() || undefined,
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

        <div className="sm:col-span-2">
          <label htmlFor="as-email" className={FIELD_LABEL}>
            อีเมล Google ของโรงเรียน {dbMode && <span className="text-rose-500">*</span>}
          </label>
          <input
            id="as-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teacher@school.ac.th"
            className={FIELD_INPUT}
          />
          <p className="mt-1 text-[0.72rem] leading-relaxed text-ink-mute">
            {dbMode
              ? "อีเมลนี้คือสิ่งที่ระบบใช้ตัดสินสิทธิ์ตอนล็อกอิน — ต้องเป็นอีเมล Google ที่ครูคนนั้นใช้จริง"
              : "โหมดสาธิตยังไม่ต้องใส่ก็ได้ แต่ใส่ไว้จะพร้อมใช้ทันทีเมื่อเชื่อมฐานข้อมูล"}
          </p>
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

        <div className={dbMode ? "hidden" : undefined}>
          <label htmlFor="as-pass" className={FIELD_LABEL}>
            รหัสผ่าน{" "}
            {email.trim() ? (
              <span className="font-normal text-ink-mute">(ไม่บังคับ — ใช้ Google แทนได้)</span>
            ) : (
              <span className="text-rose-500">*</span>
            )}
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
  const [email, setEmail] = useState(account.email ?? "");
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
    setEmail(account.email ?? "");
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
      email: email.trim() || undefined,
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
          <div className="sm:col-span-2">
            <label htmlFor={`e-email-${account.id}`} className={FIELD_LABEL}>
              อีเมล Google ของโรงเรียน
            </label>
            <input
              id={`e-email-${account.id}`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teacher@school.ac.th"
              className={FIELD_INPUT}
            />
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
          {/* อีเมล = สิทธิ์จริง ถ้าไม่มีต้องบอกตรง ๆ ว่าคนนี้ยังล็อกอินด้วย Google ไม่ได้
              ไม่ใช่ปล่อยให้ผู้ดูแลระบบเข้าใจว่าเพิ่มบัญชีแล้วจบ */}
          {account.email ? (
            <p className="mt-1 inline-flex items-center gap-1.5 text-[0.74rem] text-ink-soft">
              <Mail className="size-3.5 shrink-0 text-ink-mute" aria-hidden="true" />
              <span className="break-all">{account.email}</span>
            </p>
          ) : (
            <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[0.72rem] font-medium text-amber-700 ring-1 ring-amber-200">
              <TriangleAlert className="size-3 shrink-0" aria-hidden="true" />
              ยังไม่ผูกอีเมล — ล็อกอินด้วย Google ไม่ได้
            </p>
          )}
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
  const syncFromServer = useStaffAccountsStore((s) => s.syncFromServer);

  // ทะเบียนกลางอยู่บนเซิร์ฟเวอร์ — ถ้าไม่ดึงมารวม หน้านี้จะโชว์แต่บัญชีในเครื่อง
  // แล้วผู้ดูแลระบบจะไม่มีวันเห็นครูที่ถูกเพิ่มจากเครื่องอื่น
  useEffect(() => {
    void syncFromServer();
  }, [syncFromServer]);

  // ล็อกอินด้วยรหัสผ่านสาธิต = ไม่มี session ⇒ RLS ปฏิเสธการเขียนทะเบียนกลาง
  // ต้องบอกให้รู้ ไม่ใช่ขึ้นว่า "ซิงก์แล้ว" ทั้งที่การแก้ไขไปไม่ถึงเซิร์ฟเวอร์
  const [linked, setLinked] = useState(false);
  useEffect(() => {
    void hasSession().then(setLinked);
  }, []);
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
          {mounted ? (
            <p
              className={cn(
                "mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.74rem] font-medium ring-1",
                linked
                  ? "bg-mint-50 text-mint-700 ring-mint-200"
                  : "bg-amber-50 text-amber-700 ring-amber-200",
              )}
            >
              {linked ? (
                <>
                  <Mail className="size-3.5" aria-hidden="true" />
                  ซิงก์กับทะเบียนกลาง — บัญชีที่ผูกอีเมลไว้ล็อกอินด้วย Google ได้ทุกเครื่อง
                </>
              ) : (
                <>
                  <TriangleAlert className="size-3.5" aria-hidden="true" />
                  {isSupabaseConfigured()
                    ? "ยังไม่ได้ล็อกอินด้วย Google — การแก้ไขจะบันทึกเฉพาะในเครื่องนี้"
                    : "โหมดสาธิต — บัญชีเก็บอยู่ในเครื่องนี้เท่านั้น"}
                </>
              )}
            </p>
          ) : null}
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
      ) : sorted.length === 0 ? (
        /* ไม่มีบัญชีตั้งต้นอีกแล้วเมื่อเชื่อมฐานข้อมูล — ว่างแปลว่าดึงทะเบียนยังไม่สำเร็จ
           (ยังไม่ล็อกอินด้วย Google / เน็ตหลุด) ต้องบอกตรง ๆ ไม่ใช่ปล่อยจอโล่ง */
        <p className="py-12 text-center text-[0.88rem] leading-relaxed text-ink-mute">
          {linked
            ? "ยังไม่มีบัญชีเจ้าหน้าที่ในทะเบียน — กด “เพิ่มเจ้าหน้าที่” เพื่อสร้างบัญชีแรก"
            : "ยังดึงทะเบียนจากเซิร์ฟเวอร์ไม่ได้ — ล็อกอินด้วย Google แล้วเปิดหน้านี้อีกครั้ง"}
        </p>
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
