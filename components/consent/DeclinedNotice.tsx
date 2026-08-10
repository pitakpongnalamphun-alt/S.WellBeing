"use client";

import Link from "next/link";
import { Info } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

/**
 * Declining is a legitimate answer, not an error. It gets a plain statement of
 * what did and did not happen, and two ways forward — no scolding, no dead end.
 */
export function DeclinedNotice({ onReconsider }: { onReconsider: () => void }) {
  const { t } = useLanguage();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-role-page px-5 py-10">
      <div className="animate-rise w-full max-w-[26rem] text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-neutral-100">
          <Info className="size-6 text-ink-soft" aria-hidden="true" />
        </span>

        <h1 className="font-display th:leading-snug mt-5 text-[1.4rem] font-bold text-ink">
          {t.consent.declinedTitle}
        </h1>
        <p className="mt-3 text-[0.88rem] leading-relaxed text-ink-soft">
          {t.consent.declinedBody}
        </p>

        <div className="mt-7 flex flex-col gap-3">
          <button
            type="button"
            onClick={onReconsider}
            className="rounded-2xl bg-role-heading px-5 py-3.5 text-[0.9rem] font-medium text-white transition-all duration-200 hover:brightness-110 active:translate-y-px"
          >
            {t.consent.declinedBack}
          </button>
          <Link
            href="/role-selection"
            className="rounded-2xl border border-neutral-300 px-5 py-3.5 text-[0.9rem] font-medium text-ink-soft transition-colors hover:border-neutral-400 hover:text-ink"
          >
            {t.consent.changeRole}
          </Link>
        </div>
      </div>
    </main>
  );
}
