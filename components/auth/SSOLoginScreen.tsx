"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft, Mail, MailCheck, ShieldCheck } from "lucide-react";

import { BrandMark, GoogleIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Step 1 of two-step auth: establish *who* the person is through a provider
 * that already verifies identity (Google) or a passwordless email link. School data (phone, ID) is linked afterwards, on ProfileCompletion —
 * so identity never rests on a phone number and an ID a classmate could guess.
 *
 * Passwordless by choice: a magic link beats a password for a teen audience —
 * nothing to forget, nothing to reuse, nothing to shoulder-surf.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Provider = "google" | "email";

function ProviderButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl",
        "border border-neutral-200 bg-white text-[0.9rem] font-medium text-ink",
        "transition-all duration-200 hover:border-neutral-300 hover:bg-neutral-50 active:translate-y-px",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

export function SSOLoginScreen({
  onAuthenticated,
}: {
  /** Fired once identity is established (mock — real SSO resolves server-side). */
  onAuthenticated: (provider: Provider, email?: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function sendMagicLink(event: FormEvent) {
    event.preventDefault();
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setError("รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }
    setError(null);
    setSending(true);
    // TODO: POST /api/auth/magic-link. In the real flow the person clicks the
    // emailed link and lands back authenticated; nothing advances here.
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    setSentTo(value);
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-linear-to-b from-mint-50 to-lavender-50 px-5 py-10">
      <div className="w-full max-w-[26rem]">
        {/* Branding */}
        <div className="mb-7 flex flex-col items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200/70">
            <BrandMark className="size-8 text-mint-700" />
          </span>
          <h1 className="mt-3 text-[1.3rem] font-bold tracking-tight text-mint-800">
            S.Well-Being
          </h1>
          <p className="mt-1 text-[0.82rem] text-ink-soft">
            พื้นที่ปลอดภัย เข้าใจทุกความรู้สึก
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-[0_24px_60px_-32px_rgba(15,32,25,0.35)] ring-1 ring-neutral-200/70 sm:p-7">
          {sentTo ? (
            /* Magic-link confirmation — a dead-end by design; the link is in
               the inbox, not on this screen. */
            <div className="text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-mint-100">
                <MailCheck className="size-7 text-mint-600" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-[1.2rem] font-bold text-ink">
                ส่งลิงก์แล้ว
              </h2>
              <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-soft">
                เราส่งลิงก์เข้าสู่ระบบไปที่{" "}
                <span className="font-medium text-ink">{sentTo}</span>{" "}
                เปิดอีเมลแล้วแตะลิงก์เพื่อเข้าสู่ระบบ
              </p>
              <button
                type="button"
                onClick={() => {
                  setSentTo(null);
                  setEmail("");
                }}
                className="mt-5 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[0.84rem] font-medium text-ink-soft transition-colors hover:text-ink"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                ใช้อีเมลอื่น
              </button>
            </div>
          ) : (
            <>
              <div className="mb-5 text-center">
                <h2 className="text-[1.35rem] font-bold text-ink">
                  ยินดีต้อนรับ
                </h2>
                <p className="mt-1.5 text-[0.86rem] text-ink-soft">
                  เข้าสู่ระบบเพื่อไปต่อ
                </p>
              </div>

              {/* Primary: identity providers */}
              <div className="space-y-3">
                <ProviderButton
                  icon={<GoogleIcon className="size-[1.15rem]" />}
                  label="เข้าสู่ระบบด้วย Google"
                  onClick={() => onAuthenticated("google")}
                />
              </div>

              <div className="my-5 flex items-center gap-4" role="separator">
                <span className="h-px flex-1 bg-neutral-200" />
                <span className="text-[0.78rem] text-ink-mute">หรือ</span>
                <span className="h-px flex-1 bg-neutral-200" />
              </div>

              {/* Alternative: passwordless email */}
              <form onSubmit={sendMagicLink} noValidate>
                <label htmlFor="sso-email" className="sr-only">
                  อีเมล
                </label>
                <div
                  className={cn(
                    "flex items-center rounded-2xl border bg-white transition-colors",
                    "focus-within:border-mint-400 focus-within:ring-4 focus-within:ring-mint-100",
                    error ? "border-rose-400" : "border-neutral-300",
                  )}
                >
                  <Mail
                    className="ml-3.5 size-[1.1rem] shrink-0 text-ink-mute"
                    aria-hidden="true"
                  />
                  <input
                    id="sso-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? "sso-email-error" : undefined}
                    placeholder="อีเมลของคุณ"
                    className="w-full bg-transparent px-3 py-3 text-[0.9rem] text-ink placeholder:text-ink-mute focus:outline-none"
                  />
                </div>
                {error ? (
                  <p
                    id="sso-email-error"
                    role="alert"
                    className="mt-1.5 text-[0.8rem] text-rose-600"
                  >
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={sending}
                  aria-busy={sending || undefined}
                  className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-mint-700 text-[0.9rem] font-medium text-white shadow-[0_10px_24px_-14px_rgba(12,92,63,0.9)] transition-colors hover:bg-mint-600 disabled:opacity-60"
                >
                  {sending ? "กำลังส่ง…" : "ส่งลิงก์เข้าสู่ระบบ"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mx-auto mt-5 flex max-w-[22rem] items-center justify-center gap-1.5 text-center text-[0.72rem] leading-relaxed text-ink-mute">
          <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
          เราดูแลข้อมูลของคุณอย่างเป็นความลับ ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล
        </p>
      </div>
    </div>
  );
}
