"use client";

import { useRef, useState, type FormEvent } from "react";
import { IdCard, User, UserCheck } from "lucide-react";

import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextField } from "@/components/ui/TextField";
import type { Role } from "@/lib/roles";

/**
 * The last onboarding step: link the person's REAL full name and school ID to
 * the already-verified SSO identity, once a role has been chosen. Because the
 * role is known here, the ID field names itself correctly — a student's number
 * and a staff member's number are not the same thing.
 *
 * The name must be the ชื่อ-นามสกุล a teacher can look up (it is what the
 * consent-share card and the SOS board display), so the form asks for exactly
 * that — and prefills from the Google account's name when one came through.
 *
 * This is supplementary data used to match a person to their school record,
 * not a credential — so it can be a plain form.
 */

const MIN_NAME = 2;
const MIN_ID = 4;

type Errors = { username?: string; studentId?: string };

export function ProfileCompletionScreen({
  role,
  email,
  initialName,
  onComplete,
}: {
  role: Role;
  /** The SSO account being linked, shown for context when the provider gives one. */
  email?: string;
  /** Name supplied by the SSO provider (e.g. Google) — editable, not trusted. */
  initialName?: string;
  onComplete: (data: { username: string; studentId: string }) => void;
}) {
  const [username, setUsername] = useState(initialName?.trim() ?? "");
  const [studentId, setStudentId] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const usernameRef = useRef<HTMLInputElement>(null);
  const idRef = useRef<HTMLInputElement>(null);

  const isStudent = role === "student";
  const roleLabel = isStudent ? "นักเรียน" : "ผู้ดูแลระบบ";
  const idLabel = isStudent ? "รหัสประจำตัวนักเรียน" : "รหัสประจำตัวบุคลากร";

  function validate(): Errors {
    const next: Errors = {};

    const trimmedName = username.trim();
    if (!trimmedName) next.username = "กรุณากรอกชื่อ-นามสกุล";
    else if (trimmedName.length < MIN_NAME) next.username = "ชื่อสั้นเกินไป";

    const trimmedId = studentId.trim();
    if (!trimmedId) next.studentId = `กรุณากรอก${idLabel}`;
    else if (trimmedId.length < MIN_ID) next.studentId = "รหัสสั้นเกินไป";
    // รหัสนักเรียนเป็นตัวเลขล้วน — กันเลขศูนย์นำหน้าหายและพิมพ์ผิดตั้งแต่ต้นทาง
    // (รหัสบุคลากรอาจมีตัวอักษรนำหน้า จึงบังคับเฉพาะนักเรียน)
    else if (isStudent && !/^\d+$/.test(trimmedId))
      next.studentId = "รหัสนักเรียนต้องเป็นตัวเลขเท่านั้น";

    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate();
    setErrors(found);

    if (found.username) {
      usernameRef.current?.focus();
      return;
    }
    if (found.studentId) {
      idRef.current?.focus();
      return;
    }

    setSubmitting(true);
    // TODO: PATCH /api/profile — attach name + ID (and the chosen role) to the
    // signed-in account, server-side, then mark onboarding complete.
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    onComplete({ username: username.trim(), studentId: studentId.trim() });
  }

  function clearError(field: keyof Errors) {
    setErrors((current) =>
      current[field] ? { ...current, [field]: undefined } : current,
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-linear-to-b from-mint-50 to-lavender-50 px-5 py-10">
      <div className="w-full max-w-[26rem]">
        <div className="rounded-3xl bg-white p-6 shadow-[0_24px_60px_-32px_rgba(15,32,25,0.35)] ring-1 ring-neutral-200/70 sm:p-7">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-lavender-100">
            <UserCheck className="size-6 text-lavender-600" aria-hidden="true" />
          </span>

          <h1 className="mt-4 text-[1.4rem] font-bold leading-snug text-ink">
            ยืนยันข้อมูลของคุณ
          </h1>
          <p className="mt-2 text-[0.88rem] leading-relaxed text-ink-soft">
            กรุณากรอกข้อมูลเพิ่มเติมเพื่อเข้าสู่พื้นที่ปลอดภัย
          </p>

          {/* Role + linked account, so the person knows which identity this
              attaches to before they type. */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-mint-100 px-3 py-1 text-[0.76rem] font-medium text-mint-700">
              {roleLabel}
            </span>
            {email ? (
              <span className="inline-flex max-w-full items-center rounded-full bg-neutral-100 px-3 py-1 text-[0.76rem] text-ink-soft">
                <span className="truncate">{email}</span>
              </span>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <TextField
              ref={usernameRef}
              label="ชื่อ-นามสกุล"
              type="text"
              autoComplete="name"
              placeholder="ชื่อจริงและนามสกุล เช่น สมชาย ใจดี"
              icon={<User className="size-[1.15rem]" aria-hidden="true" />}
              value={username}
              error={errors.username}
              onChange={(e) => {
                setUsername(e.target.value);
                clearError("username");
              }}
            />

            <TextField
              ref={idRef}
              label={idLabel}
              type="text"
              inputMode={isStudent ? "numeric" : "text"}
              autoComplete="off"
              placeholder={isStudent ? "เช่น 12345" : "กรอกรหัสประจำตัวของคุณ"}
              icon={<IdCard className="size-[1.15rem]" aria-hidden="true" />}
              value={studentId}
              error={errors.studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                clearError("studentId");
              }}
            />

            <div className="pt-1">
              <PrimaryButton loading={submitting} loadingLabel="กำลังยืนยัน">
                ยืนยันข้อมูล
              </PrimaryButton>
            </div>
          </form>

          <p className="mt-4 text-center text-[0.74rem] leading-relaxed text-ink-mute">
            ข้อมูลนี้ใช้เพื่อจับคู่บัญชีกับข้อมูลของโรงเรียน และเห็นเฉพาะครูแนะแนว
          </p>
        </div>
      </div>
    </div>
  );
}
