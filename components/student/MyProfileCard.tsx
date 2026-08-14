"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Check,
  Eye,
  EyeOff,
  Hash,
  IdCard,
  Pencil,
  ShieldCheck,
  User,
} from "lucide-react";

import { TextField } from "@/components/ui/TextField";
import { useUserStore } from "@/lib/store/useUserStore";

/**
 * บัตรของฉัน — ข้อมูลที่นักเรียนกรอกไว้ตอนสมัคร กับสิทธิ์ที่มีเหนือข้อมูลนั้น
 *
 * สองอย่างที่ตั้งใจออกแบบให้ต่างจากหน้าโปรไฟล์ทั่วไป
 *
 * 1. ชื่อจริงกับรหัสนักเรียนถูกปิดไว้ก่อน ต้องแตะถึงจะเห็น
 *    แอปนี้มีปุ่ม "ออกด่วน" อยู่ทุกหน้า แปลว่าเราคิดเรื่องคนแอบมองจอมาตั้งแต่ต้นแล้ว
 *    การเอาชื่อจริงขึ้นเต็มจอในหน้าที่เด็กเปิดบ่อย จะขัดกับสิ่งที่ปุ่มนั้นพยายามทำ
 *
 * 2. มีบล็อกบอกตรง ๆ ว่า "ครูเห็นชื่อนี้เมื่อไหร่บ้าง"
 *    ความไม่รู้ว่าใครเห็นอะไร คือเหตุผลที่เด็กไม่กล้าใช้ระบบ และการเดาเอาเองมักเดาผิด
 *    ไปทางกลัวเกินจริง — เด็กจำนวนหนึ่งไม่กล้าแม้แต่จะบันทึกอารมณ์ เพราะคิดว่าครูเห็น
 *
 * แก้ไขได้ด้วย เพราะก่อนหน้านี้กรอกรหัสผิดแล้วแก้ไม่ได้เลยทั้งชีวิต (หน้า onboarding
 * เด้งออกทันทีเมื่อมีโปรไฟล์แล้ว) ซึ่งแปลว่าใบนัดที่ครูสร้างให้เดินทางกลับมาไม่ถึงเจ้าตัว
 */

/** ปิดตรงกลางไว้ เหลือหัวท้ายพอให้เจ้าตัวรู้ว่าใช่ของตัวเอง */
function mask(value: string): string {
  const v = value.trim();
  if (!v) return "—";
  return v
    .split(/\s+/)
    .map((word) => (word.length <= 1 ? word : word[0] + "•".repeat(Math.min(word.length - 1, 5))))
    .join(" ");
}

const SEEN_WHEN = [
  { seen: true, text: "เมื่อแจ้งเหตุแบบระบุตัวตน" },
  { seen: true, text: "เมื่อกดขอความช่วยเหลือฉุกเฉิน (SOS)" },
  { seen: true, text: "เมื่อนัดพูดคุยกับครู" },
  { seen: false, text: "เมื่อแจ้งเหตุแบบไม่ระบุตัวตน" },
  { seen: false, text: "เมื่อบันทึกอารมณ์ คุยกับน้องปุย หรือทำแบบประเมิน" },
];

export function MyProfileCard() {
  const profile = useUserStore((s) => s.profile);
  const completeProfile = useUserStore((s) => s.completeProfile);

  const [mounted, setMounted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => setMounted(true), []);

  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState<string | null>(null);

  function startEdit() {
    setName(profile?.username ?? "");
    setStudentId(profile?.studentId ?? "");
    setError(null);
    setEditing(true);
  }

  function save(e: FormEvent) {
    e.preventDefault();
    const n = name.trim();
    const id = studentId.trim();
    if (!n || !id) {
      setError("กรอกให้ครบทั้งสองช่องนะ");
      return;
    }
    completeProfile(n, id);
    setEditing(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  }

  // ก่อน rehydrate เสร็จ สโตร์ยังว่าง — โครงว่างดีกว่าการวาด "—" แล้วกระพริบเป็นชื่อ
  if (!mounted) {
    return <div className="h-32 animate-pulse rounded-2xl bg-panel/40" aria-hidden="true" />;
  }

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200/80">
      <div className="flex items-center gap-2">
        <IdCard className="size-[1.15rem] text-ink-soft" aria-hidden="true" />
        <h2 className="text-[0.95rem] font-bold text-ink">ข้อมูลของฉัน</h2>
        {!editing ? (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            aria-pressed={revealed}
            className="ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-full px-2.5 text-[0.76rem] text-ink-soft transition-colors hover:text-ink"
          >
            {revealed ? (
              <>
                <EyeOff className="size-3.5" aria-hidden="true" />
                ซ่อน
              </>
            ) : (
              <>
                <Eye className="size-3.5" aria-hidden="true" />
                ดู
              </>
            )}
          </button>
        ) : null}
      </div>

      {editing ? (
        <form onSubmit={save} className="mt-3 space-y-3" noValidate>
          <TextField
            label="ชื่อ-นามสกุล"
            icon={<User className="size-[1.05rem]" />}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ชื่อจริงและนามสกุล เช่น สมชาย ใจดี"
            autoComplete="name"
          />
          <TextField
            label="รหัสนักเรียน"
            icon={<Hash className="size-[1.05rem]" />}
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="เช่น 12345"
            inputMode="numeric"
            error={error ?? undefined}
          />
          <p className="text-[0.74rem] leading-relaxed text-ink-mute">
            ใช้ชื่อจริงนะ เพราะครูใช้ชื่อนี้หาเราเจอตอนที่เราขอความช่วยเหลือ
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="min-h-11 flex-1 rounded-2xl bg-panel/60 text-[0.86rem] font-medium text-ink-soft transition-colors hover:text-ink"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="min-h-11 flex-1 rounded-2xl bg-mint-700 text-[0.86rem] font-semibold text-white transition-colors hover:bg-mint-600"
            >
              บันทึก
            </button>
          </div>
        </form>
      ) : (
        <>
          <dl className="mt-3 space-y-1.5">
            <div className="flex items-baseline gap-3">
              <dt className="w-16 shrink-0 text-[0.78rem] text-ink-mute">ชื่อ</dt>
              <dd className="min-w-0 flex-1 break-words text-[0.9rem] font-medium text-ink">
                {revealed ? profile?.username || "—" : mask(profile?.username ?? "")}
              </dd>
            </div>
            <div className="flex items-baseline gap-3">
              <dt className="w-16 shrink-0 text-[0.78rem] text-ink-mute">รหัส</dt>
              <dd className="min-w-0 flex-1 break-words text-[0.9rem] font-medium tabular-nums text-ink">
                {revealed ? profile?.studentId || "—" : mask(profile?.studentId ?? "")}
              </dd>
            </div>
          </dl>

          <div className="mt-3.5 rounded-xl bg-panel/40 p-3">
            <p className="flex items-center gap-1.5 text-[0.78rem] font-semibold text-ink">
              <ShieldCheck className="size-3.5 text-ink-soft" aria-hidden="true" />
              ครูเห็นชื่อนี้เมื่อไหร่
            </p>
            <ul className="mt-2 space-y-1">
              {SEEN_WHEN.map((row) => (
                <li key={row.text} className="flex items-start gap-2 text-[0.76rem] leading-relaxed">
                  <span
                    className={`mt-0.5 shrink-0 font-bold ${row.seen ? "text-amber-600" : "text-mint-600"}`}
                    aria-hidden="true"
                  >
                    {row.seen ? "เห็น" : "ไม่เห็น"}
                  </span>
                  <span className="text-ink-soft">{row.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={startEdit}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-panel/60 text-[0.86rem] font-medium text-ink transition-colors hover:bg-panel"
          >
            {saved ? (
              <>
                <Check className="size-4 text-mint-600" aria-hidden="true" />
                บันทึกแล้ว
              </>
            ) : (
              <>
                <Pencil className="size-4" aria-hidden="true" />
                แก้ไขข้อมูล
              </>
            )}
          </button>
        </>
      )}
    </section>
  );
}
