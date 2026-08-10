"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, Check, ShieldAlert } from "lucide-react";

import { SpinnerIcon } from "@/components/icons";
import { policies, POLICY_VERSION } from "@/lib/consent/policy";
import { saveConsent } from "@/lib/consent/record";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ROLE_HOME, type Role } from "@/lib/roles";

import { PolicySection } from "./PolicySection";
import { DeclinedNotice } from "./DeclinedNotice";

/** Treat the last few pixels as read — exact equality never fires on subpixel layouts. */
const SCROLL_EPSILON = 24;

export function ConsentScreen({ role }: { role: Role }) {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const policy = policies[locale];

  const [read, setRead] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [nudge, setNudge] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const checkboxRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollable = el.scrollHeight - el.clientHeight;
    // A document that fits without scrolling has already been shown in full.
    if (scrollable <= SCROLL_EPSILON) {
      setProgress(1);
      setRead(true);
      return;
    }

    const ratio = Math.min(1, el.scrollTop / scrollable);
    setProgress(ratio);
    if (el.scrollTop >= scrollable - SCROLL_EPSILON) setRead(true);
  }, []);

  // Re-measure on mount and on resize: a wider window reflows the text and can
  // turn a scrolling document into a non-scrolling one.
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, locale]);

  function jumpToEnd() {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }

  async function handleAccept() {
    if (!read) {
      setNudge(t.consent.mustRead);
      jumpToEnd();
      return;
    }
    if (!agreed) {
      setNudge(t.consent.mustTick);
      checkboxRef.current?.focus();
      return;
    }

    setNudge(null);
    setSaving(true);
    try {
      saveConsent({
        policyVersion: POLICY_VERSION,
        role,
        acceptedAt: new Date().toISOString(),
        readIn: locale,
      });
      router.push(ROLE_HOME[role]);
    } finally {
      setSaving(false);
    }
  }

  if (declined) {
    return <DeclinedNotice onReconsider={() => setDeclined(false)} />;
  }

  const blocked = !read || !agreed;

  return (
    <main className="flex min-h-dvh flex-col items-center bg-role-page px-4 py-6 sm:px-6 sm:py-10">
      <div className="animate-rise flex w-full max-w-[36rem] flex-1 flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-neutral-200 shadow-[0_24px_60px_-32px_rgba(15,32,25,0.4)]">
        {/* -- Masthead ---------------------------------------------------- */}
        <header className="border-b border-neutral-200 px-6 pb-5 pt-6 sm:px-8">
          <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-role-hint">
            {t.consent.eyebrow}
          </p>
          <h1 className="font-display th:leading-snug mt-2 text-[1.5rem] font-bold leading-tight text-role-heading sm:text-[1.75rem]">
            {policy.title}
          </h1>
          <p className="mt-1.5 text-[0.84rem] text-ink-soft">{policy.act}</p>

          <p className="mt-3 text-[0.8rem] text-ink-mute">
            {t.consent.forRole}{" "}
            <span className="font-medium text-ink">{t.roles[role].title}</span>
          </p>
        </header>

        {/* -- Policy body -------------------------------------------------
            tabIndex makes the region scrollable from the keyboard; without it
            someone who cannot use a pointer can never reach the end, and so can
            never enable the button. */}
        <div className="relative min-h-0 flex-1">
          <div
            ref={scrollRef}
            onScroll={measure}
            tabIndex={0}
            role="region"
            aria-label={t.consent.regionLabel}
            className="h-full max-h-[46vh] overflow-y-auto px-6 py-5 focus-visible:outline-none sm:max-h-[52vh] sm:px-8"
          >
            <p className="text-[0.86rem] leading-relaxed text-ink-soft">
              {policy.standfirst}
            </p>
            <p className="mt-3 text-[0.88rem] leading-relaxed text-ink">
              {policy.operator}
            </p>

            {/* Sensitive-data callout. Mental health data sits under PDPA s.26
                and carries a higher bar than the rest — saying so plainly is
                part of consent being informed. */}
            <p className="mt-4 flex gap-2.5 rounded-xl bg-amber-50 p-3.5 text-[0.82rem] leading-relaxed text-amber-900 ring-1 ring-amber-200/70">
              <ShieldAlert
                className="mt-px size-4 shrink-0 text-amber-600"
                aria-hidden="true"
              />
              <span>{t.consent.sensitiveNotice}</span>
            </p>

            <div className="mt-6 space-y-5">
              {policy.sections.map((section) => (
                <PolicySection key={section.no} section={section} />
              ))}
            </div>

            <p className="mt-6 rounded-xl bg-neutral-50 p-4 text-[0.85rem] leading-relaxed text-ink ring-1 ring-neutral-200">
              {policy.affirmation}
            </p>

            <div ref={endRef} aria-hidden="true" className="h-px" />
          </div>

          {/* Fade marking more content below. Purely a hint — it disappears
              once there is nothing left to read. */}
          {!read ? (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-white to-transparent"
              aria-hidden="true"
            />
          ) : null}
        </div>

        {/* -- Reading progress --------------------------------------------
            The rail reports how much of the document has actually been on
            screen. It is the one thing standing between a person and a legal
            commitment, so it gets to be the visible mechanism. */}
        <div className="border-t border-neutral-200 px-6 pt-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              aria-label={t.consent.regionLabel}
            >
              <div
                className="h-full rounded-full bg-role-heading transition-[width] duration-150 ease-out"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            {read ? (
              <span className="flex items-center gap-1.5 text-[0.78rem] font-medium text-value-safe">
                <Check className="size-3.5" aria-hidden="true" />
                {t.consent.progressRead}
              </span>
            ) : (
              <button
                type="button"
                onClick={jumpToEnd}
                className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-[0.78rem] text-ink-soft transition-colors hover:text-ink"
              >
                <ArrowDown className="size-3.5" aria-hidden="true" />
                {t.consent.jumpToEnd}
              </button>
            )}
          </div>
        </div>

        {/* -- Consent ------------------------------------------------------ */}
        <div className="px-6 pb-6 pt-4 sm:px-8">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl p-1">
            <input
              ref={checkboxRef}
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                if (e.target.checked) setNudge(null);
              }}
              className="mt-0.5 size-[1.15rem] shrink-0 accent-role-heading"
            />
            <span className="text-[0.84rem] leading-relaxed text-ink">
              {t.consent.checkbox}
            </span>
          </label>

          {/* Announced, not merely shown — the reason a button did nothing has
              to reach someone who cannot see the button. */}
          <p role="status" aria-live="polite" className="min-h-5 pt-2">
            {nudge ? (
              <span className="text-[0.8rem] text-danger">{nudge}</span>
            ) : null}
          </p>

          {/* Stacked, the primary action sits at the bottom — nearest the
              thumb, and last in reading order after the choice to decline.
              Side by side, it takes the right. */}
          <div className="mt-1 flex flex-col-reverse gap-3 sm:flex-row-reverse">
            {/* aria-disabled, not disabled: a disabled button cannot be focused,
                so the person never hears why it will not proceed. */}
            <button
              type="button"
              onClick={handleAccept}
              aria-disabled={blocked || saving}
              aria-busy={saving || undefined}
              className={[
                "flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5",
                "text-[0.9rem] font-medium text-white transition-all duration-200 sm:flex-1",
                blocked
                  ? "cursor-not-allowed bg-neutral-300"
                  : "bg-role-heading shadow-[0_10px_24px_-12px_rgba(20,83,45,0.9)] hover:brightness-110 active:translate-y-px",
              ].join(" ")}
            >
              {saving ? (
                <>
                  <SpinnerIcon className="size-4 animate-spin" />
                  {t.consent.accepting}
                </>
              ) : (
                t.consent.accept
              )}
            </button>

            <button
              type="button"
              onClick={() => setDeclined(true)}
              className="rounded-2xl border border-neutral-300 px-5 py-3.5 text-[0.9rem] font-medium text-ink-soft transition-colors hover:border-neutral-400 hover:text-ink sm:flex-1"
            >
              {t.consent.decline}
            </button>
          </div>

          <p className="mt-3.5 text-center text-[0.75rem] leading-relaxed text-ink-mute">
            {policy.declineNote}
          </p>
        </div>
      </div>
    </main>
  );
}
