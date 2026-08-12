"use client";

import { BrandMark, OpenBookIcon } from "@/components/icons";
import { SerenityScene } from "@/components/illustration/SerenityScene";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

/**
 * The left half: who this is, what it's for, and the illustration that carries
 * the promise. Nothing here is interactive except the characters, which name
 * themselves on hover.
 */
export function BrandPanel() {
  const { t } = useLanguage();

  return (
    <section className="@container relative flex min-w-0 flex-col overflow-hidden bg-linear-to-b from-panel to-panel-deep">
      <div className="px-6 pt-7 sm:px-11 sm:pt-9 lg:px-12 lg:pt-12">
        <div className="flex items-center gap-3">
          <BrandMark className="size-9 shrink-0 text-ink" />
          <span className="text-[0.78rem] font-medium uppercase tracking-[0.22em] text-ink">
            {t.brand}
          </span>
        </div>

        <h1 className="font-display mt-5 text-[1.78rem] font-semibold leading-[1.06] text-ink th:leading-[1.3] sm:mt-8 sm:text-[3rem] lg:mt-10 lg:text-[3.2rem]">
          {t.headline.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>

        <p className="mt-4 max-w-[19rem] text-[0.9rem] leading-relaxed text-ink-soft sm:mt-5 sm:text-[0.94rem]">
          {t.tagline}
        </p>
      </div>

      {/* ห้ามย่อต่ำกว่า 78cqw: ฉากตรึงขอบล่าง (xMidYMax slice) การลดความสูงจึงตัด
          "จากด้านบน" ซึ่งเป็นที่อยู่ของดวงอาทิตย์ (ขอบบน y=22) และยอดเขา (y=80)
          ในระบบพิกัด 600x470 — ที่ 52cqw ตัดไป 158 หน่วย ภูเขาหายทั้งแถบ
          ต่ำสุดที่ยังเห็นครบคือ 76cqw ส่วน 78cqw คือสัดส่วนจริงของฉาก

          78cqw is the scene's own 470/600 aspect measured against this panel's
          width — not the viewport's, which is twice the panel in two-column
          mode and equal to it in one. A fixed height goes short-and-wide on
          some breakpoint and `slice` crops the sunrise away. `flex-1` then
          absorbs whatever extra height the form side dictates; the scene is
          bottom-anchored, so that surplus becomes sky. */}
      <div className="relative mt-5 min-h-[min(78cqw,560px)] flex-1 sm:mt-8 lg:mt-10">
        <SerenityScene
          emotions={t.emotions}
          className="absolute inset-0 size-full"
        />
      </div>

      {/* Reassurance, not instruction. On a phone it costs a screenful of
          scrolling before the form, and the footer already says as much. */}
      <div className="hidden items-start gap-4 px-8 py-8 sm:flex sm:px-11 lg:px-12 lg:py-10">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line/80 bg-surface/60 text-ink">
          <OpenBookIcon className="size-5" />
        </span>
        <p className="max-w-[15rem] text-[0.86rem] leading-relaxed text-ink-soft">
          {t.note}
        </p>
      </div>
    </section>
  );
}
