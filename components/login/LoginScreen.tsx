"use client";

import { BrandMark } from "@/components/icons";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

import { BrandPanel } from "./BrandPanel";
import { LoginForm } from "./LoginForm";

export function LoginScreen() {
  const { t } = useLanguage();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-9 px-4 py-8 sm:px-6 sm:py-10">
      <div
        className={[
          // Stacked, the card stays a narrow app-shaped column — stretching it
          // to a tablet's full width ruins both line length and the scene aspect.
          "animate-rise w-full max-w-[34rem] overflow-hidden lg:max-w-[73rem]",
          "rounded-[2rem] bg-surface lg:rounded-[2.5rem]",
          "shadow-[0_40px_90px_-50px_rgba(23,36,30,0.45)]",
          "ring-1 ring-line/60",
        ].join(" ")}
      >
        {/* The form side is given the extra width — it holds the interaction. */}
        <div className="grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)]">
          <BrandPanel />
          <LoginForm />
        </div>
      </div>

      <footer className="flex flex-col items-center gap-4 text-center">
        <p className="text-[0.86rem] leading-relaxed text-ink-soft">
          {t.footer.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
        <BrandMark className="size-7 text-ink-mute" />
      </footer>
    </main>
  );
}
