"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";

import { GoogleSignInButton } from "@/components/login/GoogleSignInButton";
import { STAFF_ROLE_META } from "@/data/staff";
import {
  fetchPublicRoster,
  findStaffByEmail,
  type PublicStaff,
} from "@/lib/data/staffRepo";
import { useStaffSessionStore } from "@/lib/store/useStaffSessionStore";
import {
  useStaffAccountsStore,
  verifyStaff,
} from "@/lib/store/useStaffAccountsStore";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { saveConsent } from "@/lib/consent/record";
import { POLICY_VERSION } from "@/lib/consent/policy";
import { cn } from "@/lib/utils";

export function StaffLoginScreen() {
  const router = useRouter();
  const signIn = useStaffSessionStore((s) => s.signIn);

  // Persisted accounts may differ from the defaults, so only render the picker
  // after mount to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const accounts = useStaffAccountsStore((s) => s.accounts);
  const staffList = accounts.filter((a) => a.active);

  // ทะเบียนที่โชว์ในหน้านี้ — null = ยังไม่ได้ผล/ดึงไม่สำเร็จ (ไม่ต้องโชว์อะไร)
  const [roster, setRoster] = useState<PublicStaff[] | null>(null);
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    void fetchPublicRoster().then(setRoster);
  }, []);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /** ยอมรับนโยบายและเข้าแดชบอร์ด — ใช้ร่วมกันทั้งทางรหัสผ่านและทาง Google */
  function enterDashboard(staffId: string) {
    signIn(staffId);
    // Staff accept the same policy at sign-in, so the admin routes' consent
    // guard passes straight through to the dashboard.
    saveConsent({
      policyVersion: POLICY_VERSION,
      role: "admin",
      acceptedAt: new Date().toISOString(),
      readIn: "th",
    });
    router.replace("/admin/dashboard");
  }

  function submit() {
    setError(null);
    if (!selectedId) {
      setError("เลือกชื่อของคุณก่อน");
      return;
    }
    if (!verifyStaff(selectedId, passcode)) {
      setError("รหัสผ่านไม่ถูกต้อง ลองใหม่อีกครั้ง");
      return;
    }
    setSubmitting(true);
    enterDashboard(selectedId);
  }

  /**
   * ล็อกอินด้วย Google — ทางหลักเมื่อเชื่อมฐานข้อมูลแล้ว เพราะ RLS ตัดสินสิทธิ์
   * จากอีเมลที่ Google ยืนยัน ไม่ใช่รหัสผ่านที่เก็บไว้ในเครื่อง
   */
  async function googleSignIn(email: string) {
    setError(null);
    setSubmitting(true);
    const staff = await findStaffByEmail(email);
    if (!staff) {
      setSubmitting(false);
      setError(
        `บัญชี ${email} ยังไม่ได้รับสิทธิ์เจ้าหน้าที่ — ให้ผู้ดูแลระบบเพิ่มอีเมลนี้ในหน้า "บัญชีเจ้าหน้าที่" ก่อน`,
      );
      return;
    }
    // ทะเบียนจริงอยู่ฝั่งเซิร์ฟเวอร์ — สะท้อนลง store ในเครื่องก่อนเข้า เพราะ
    // useStaffSession ยัง resolve ตัวตนจาก store นี้ (เจ้าหน้าที่ที่มีแต่ใน
    // เซิร์ฟเวอร์จะล็อกอินผ่านแล้วเด้งกลับ ถ้าไม่มีแถวนี้ในเครื่อง)
    useStaffAccountsStore.getState().upsertFromServer({
      id: staff.id,
      email: staff.email,
      name: staff.name,
      role: staff.role,
      title: staff.title,
      emoji: staff.emoji,
      active: staff.active,
    });
    enterDashboard(staff.id);
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
        <h1 className="font-display th:leading-snug text-[1.4rem] font-bold text-ink">
          เข้าสู่ระบบเจ้าหน้าที่
        </h1>
        <p className="mt-1 text-[0.85rem] text-ink-soft">
          {isSupabaseConfigured()
            ? "เข้าสู่ระบบด้วยบัญชี Google ของโรงเรียน"
            : "เลือกชื่อของคุณ แล้วใส่รหัสผ่านของโรงเรียน"}
        </p>

        {/* ทางหลักเมื่อเชื่อมฐานข้อมูลแล้ว — สิทธิ์ทั้งหมดตัดสินจากอีเมลที่ Google ยืนยัน */}
        {isSupabaseConfigured() && (
          <div className="mt-4">
            <GoogleSignInButton
              onVerified={({ email }) => void googleSignIn(email)}
              onDemo={() => setError("ยังตั้งค่าการล็อกอินด้วย Google ไม่สำเร็จ — แจ้งผู้ดูแลระบบให้ตรวจการตั้งค่า")}
            />
            {error && (
              <p className="mt-2 text-[0.8rem] font-medium text-rose-600">{error}</p>
            )}
            <p className="mt-4 text-center text-[0.74rem] leading-relaxed text-ink-mute">
              สิทธิ์ทั้งหมดตัดสินจากอีเมลที่ Google ยืนยัน — ถ้าเข้าไม่ได้
              ให้ผู้ดูแลระบบเพิ่มอีเมลของคุณในหน้า “บัญชีเจ้าหน้าที่” ก่อน
            </p>

            {/* ทะเบียนจริงจากเซิร์ฟเวอร์ (view staff_public — ไม่มีอีเมล)
                โชว์เพื่อให้ครูรู้ว่าตัวเองถูกเพิ่มไว้แล้วหรือยังก่อนกดล็อกอิน
                เห็นรายชื่อไม่ได้แปลว่าเข้าได้ กุญแจคืออีเมลซึ่งไม่ถูกฉายออกมา */}
            {roster !== null && roster.length > 0 && (
              <div className="mt-5 border-t border-neutral-200 pt-4">
                <p className="mb-2 text-[0.76rem] font-medium text-ink-soft">
                  บัญชีเจ้าหน้าที่ในระบบ ({roster.length})
                </p>
                <ul className="space-y-1.5">
                  {roster.map((s) => {
                    const meta = STAFF_ROLE_META[s.role];
                    return (
                      <li
                        key={s.id}
                        className="flex items-center gap-2.5 rounded-xl bg-neutral-50 px-3 py-2"
                      >
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-base">
                          {s.emoji}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[0.84rem] font-semibold text-ink">
                            {s.name}
                          </span>
                          <span className="block truncate text-[0.7rem] text-ink-mute">
                            {s.title}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[0.66rem] font-medium",
                            meta.tint,
                          )}
                        >
                          {meta.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-2.5 text-[0.7rem] leading-relaxed text-ink-mute">
                  ล็อกอินด้วยบัญชี Google ที่ผูกกับชื่อของคุณเท่านั้น — รายชื่อนี้ไม่แสดงอีเมล
                </p>
              </div>
            )}
          </div>
        )}

        {/* โหมดสาธิตเท่านั้น — เชื่อมฐานข้อมูลแล้วต้องไม่มีประตูนี้ให้เห็นหรือให้กด
            (verifyStaff ปฏิเสธซ้ำอีกชั้นในสโตร์ ซ่อนแต่ UI ไม่พอ) */}
        {!isSupabaseConfigured() && (
          <>
          <ul className="mt-4 space-y-2">
            {!mounted ? (
              <li className="py-6 text-center text-[0.84rem] text-ink-mute">กำลังโหลด…</li>
            ) : staffList.length === 0 ? (
              <li className="py-6 text-center text-[0.84rem] text-ink-mute">
                ยังไม่มีบัญชีเจ้าหน้าที่ที่เปิดใช้งาน
              </li>
            ) : (
              staffList.map((s) => {
              const active = selectedId === s.id;
              const roleMeta = STAFF_ROLE_META[s.role];
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(s.id);
                      setError(null);
                    }}
                    aria-pressed={active}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition",
                      active
                        ? "border-mint-400 bg-mint-50"
                        : "border-neutral-200 hover:border-neutral-300",
                    )}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-neutral-100 text-xl">
                      {s.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.92rem] font-bold text-ink">{s.name}</span>
                      <span className="block text-[0.74rem] text-ink-mute">{s.title}</span>
                    </span>
                    <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[0.68rem] font-medium", roleMeta.tint)}>
                      {roleMeta.label}
                    </span>
                  </button>
                </li>
              );
              })
            )}
          </ul>

          <label className="mt-4 block">
            <span className="mb-1.5 flex items-center gap-1.5 text-[0.82rem] font-medium text-ink">
              <LockKeyhole className="size-4 text-ink-mute" aria-hidden="true" />
              รหัสผ่าน
            </span>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="••••"
              className="w-full rounded-2xl border border-neutral-300 bg-white px-3.5 py-3 text-[0.95rem] tracking-widest text-ink placeholder:tracking-normal placeholder:text-ink-mute focus:border-mint-400 focus:outline-none focus:ring-4 focus:ring-mint-100"
            />
          </label>

          {error && (
            <p className="mt-2 text-[0.8rem] font-medium text-rose-600">{error}</p>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="mt-4 w-full rounded-2xl bg-mint-700 py-3.5 text-[0.95rem] font-medium text-white transition hover:bg-mint-600 disabled:opacity-60"
          >
            เข้าสู่ระบบ
          </button>
          </>
        )}

        <p className="mt-4 text-center text-[0.78rem] text-ink-mute">
          เป็นนักเรียน?{" "}
          <Link href="/login" className="font-medium text-mint-700 hover:underline">
            เข้าสู่ระบบที่นี่
          </Link>
        </p>
      </div>
    </div>
  );
}

export default StaffLoginScreen;
