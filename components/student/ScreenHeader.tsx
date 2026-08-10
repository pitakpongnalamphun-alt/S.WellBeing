"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

/** Title row for a feature screen, with a back control sized for a thumb. */
export function ScreenHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const router = useRouter();

  return (
    <header className="pt-1">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="ย้อนกลับ"
        className="-ml-2.5 mb-1 inline-flex min-h-11 items-center gap-1 rounded-xl px-2.5 text-[0.82rem] text-ink-soft transition-colors hover:text-ink"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        ย้อนกลับ
      </button>

      <h1 className="font-display th:leading-snug text-[1.4rem] font-bold text-ink">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-1 text-[0.85rem] leading-relaxed text-ink-soft">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
