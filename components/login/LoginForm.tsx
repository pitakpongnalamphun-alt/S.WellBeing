"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "@/components/icons";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextField } from "@/components/ui/TextField";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useUserStore } from "@/lib/store/useUserStore";
import { validateCredentials, type FieldErrors } from "@/lib/validation";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { SocialAuthButtons } from "./SocialAuthButtons";

/**
 * Replace with the real call. Kept as a prop-free seam so the form stays a
 * presentation concern and the transport can change without touching it.
 */
async function signInRequest(credentials: { email: string; password: string }) {
  await new Promise((resolve) => setTimeout(resolve, 1100));
  // eslint-disable-next-line no-console
  console.info("sign-in requested for", credentials.email);
}

export function LoginForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const signIn = useUserStore((s) => s.signIn);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found = validateCredentials({ email, password }, t);
    setErrors(found);

    // Send focus to the first problem so keyboard users aren't hunting.
    if (found.email) {
      emailRef.current?.focus();
      return;
    }
    if (found.password) {
      passwordRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await signInRequest({ email: email.trim(), password });
      // Record the session so the onboarding step downstream has an identity
      // to attach the school data to.
      signIn("email", email.trim());
      router.push("/role-selection");
    } finally {
      setSubmitting(false);
    }
  }

  /** Once a field has been flagged, clear the flag as soon as it's edited. */
  function clearError(field: keyof FieldErrors) {
    setErrors((current) =>
      current[field] ? { ...current, [field]: undefined } : current,
    );
  }

  return (
    <section className="relative flex flex-col bg-surface px-7 py-9 sm:px-11 lg:px-16 lg:py-12">
      <div className="flex justify-end">
        <LanguageSwitcher />
      </div>

      <div className="mx-auto my-auto w-full max-w-[25rem] py-6 sm:py-10 lg:py-14">
        <header className="text-center">
          <h2 className="font-display text-[2.15rem] font-semibold leading-tight text-ink th:leading-[1.45] sm:text-[2.4rem]">
            {t.welcome}
          </h2>
          <p className="mt-2.5 text-[0.94rem] text-ink-soft">{t.welcomeSub}</p>
        </header>

        <form onSubmit={handleSubmit} noValidate className="mt-9 space-y-5">
          <TextField
            ref={emailRef}
            label={t.emailLabel}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t.emailPlaceholder}
            icon={<MailIcon className="size-[1.15rem]" />}
            value={email}
            error={errors.email}
            onChange={(event) => {
              setEmail(event.target.value);
              clearError("email");
            }}
          />

          <div>
            <TextField
              ref={passwordRef}
              label={t.passwordLabel}
              type={revealed ? "text" : "password"}
              autoComplete="current-password"
              placeholder={t.passwordPlaceholder}
              icon={<LockIcon className="size-[1.15rem]" />}
              value={password}
              error={errors.password}
              onChange={(event) => {
                setPassword(event.target.value);
                clearError("password");
              }}
              action={
                <button
                  type="button"
                  onClick={() => setRevealed((value) => !value)}
                  aria-label={revealed ? t.hidePassword : t.showPassword}
                  aria-pressed={revealed}
                  className="rounded-xl p-3 text-ink-mute transition-colors duration-200 hover:text-ink"
                >
                  {revealed ? (
                    <EyeOffIcon className="size-[1.15rem]" />
                  ) : (
                    <EyeIcon className="size-[1.15rem]" />
                  )}
                </button>
              }
            />

            <div className="mt-1 flex justify-end">
              {/* py-1 keeps the hit area at the 24px minimum (WCAG 2.5.8). */}
              <a
                href="/help"
                className="inline-block rounded py-1 text-[0.84rem] text-ink-soft underline-offset-4 transition-colors duration-200 hover:text-accent hover:underline"
              >
                {t.forgot}
              </a>
            </div>
          </div>

          <PrimaryButton loading={submitting} loadingLabel={t.submitting}>
            {t.submit}
          </PrimaryButton>
        </form>

        <div className="my-7 flex items-center gap-4" role="separator">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[0.82rem] text-ink-mute">{t.divider}</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <SocialAuthButtons
          onProvider={(provider) => {
            // Social sign-in shares the same seam: record the session, then
            // hand off to role selection.
            signIn(provider);
            router.push("/role-selection");
          }}
          onGoogleVerified={({ email, name }) => {
            // อีเมลนี้ผ่านการตรวจ ID token กับ Google แล้วฝั่งเซิร์ฟเวอร์ —
            // เดินเส้นทางเดิมต่อ (เลือกบทบาท → ผูกข้อมูลโรงเรียน → consent)
            // ชื่อจาก Google ติดไปด้วย เพื่อให้ฟอร์มชื่อ-นามสกุลเติมให้ล่วงหน้า
            signIn("google", email, name ?? undefined);
            router.push("/role-selection");
          }}
        />

        <p className="mt-8 text-center text-[0.88rem] text-ink-soft">
          {t.noAccount}{" "}
          <a
            href="/signup"
            className="inline-block rounded py-1 font-medium text-accent underline-offset-4 transition-colors duration-200 hover:underline"
          >
            {t.signUp}
          </a>
        </p>
      </div>
    </section>
  );
}
