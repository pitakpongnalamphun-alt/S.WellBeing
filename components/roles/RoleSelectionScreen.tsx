"use client";

import { GraduationCap, ShieldCheck } from "lucide-react";

import { LanguageSwitcher } from "@/components/login/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

import { CoreValues } from "./CoreValues";
import { RoleCard } from "./RoleCard";

export function RoleSelectionScreen() {
  const { t } = useLanguage();

  return (
    <main className="flex min-h-dvh flex-col bg-role-page px-5 py-6 sm:px-6 sm:py-8">
      <div className="flex justify-end">
        <LanguageSwitcher />
      </div>

      {/* my-auto centres the column without trapping it: on a short viewport
          the content grows past centre and the page simply scrolls. */}
      <div className="animate-rise mx-auto my-auto flex w-full max-w-[30rem] flex-col items-center py-8">
        <header className="text-center">
          <h1 className="font-display text-[2.1rem] font-bold leading-none tracking-tight text-role-heading sm:text-[2.5rem]">
            S.Well-Being
          </h1>
          <p className="th:leading-relaxed mt-3 text-[0.92rem] text-role-sub">
            {t.roles.subtitle}
          </p>
        </header>

        <div className="mt-9 w-full">
          <CoreValues />
        </div>

        {/* Rules flanking the prompt, so it reads as a divider rather than a
            heading for the values above it. */}
        <div
          className="mt-10 flex w-full items-center gap-4"
          role="separator"
          aria-orientation="horizontal"
        >
          <span className="h-px flex-1 bg-neutral-200" />
          <span className="text-[0.84rem] text-role-hint">
            {t.roles.prompt}
          </span>
          <span className="h-px flex-1 bg-neutral-200" />
        </div>

        {/* Grid, not flex-col: `auto-rows-fr` gives both rows equal height, so
            a description that wraps to two lines in one language doesn't leave
            the pair ragged. A column flex box sizes rows to content instead. */}
        <div className="mt-6 grid w-full auto-rows-fr gap-4">
          {/* Role first, then onboarding collects the matching ID, then consent. */}
          <RoleCard
            href="/onboarding?role=student"
            variant="student"
            Icon={GraduationCap}
            title={t.roles.student.title}
            surface={t.roles.student.surface}
            description={t.roles.student.description}
            action={t.roles.student.action}
          />
          <RoleCard
            href="/onboarding?role=admin"
            variant="admin"
            Icon={ShieldCheck}
            title={t.roles.admin.title}
            surface={t.roles.admin.surface}
            description={t.roles.admin.description}
            action={t.roles.admin.action}
          />
        </div>

        <p className="mt-7 text-center text-[0.8rem] text-role-hint">
          {t.roles.footnote}
        </p>
      </div>
    </main>
  );
}
