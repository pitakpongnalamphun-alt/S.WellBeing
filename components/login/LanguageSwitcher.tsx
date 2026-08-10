"use client";

import { useEffect, useRef, useState } from "react";

import { CheckIcon, ChevronDownIcon, GlobeIcon } from "@/components/icons";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/dictionaries";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Dismiss on outside click and on Escape — both are expected of a menu.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function choose(next: Locale) {
    setLocale(next);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.languageLabel}
        className={[
          "flex items-center gap-2 rounded-full border border-line bg-surface",
          "py-2.5 pl-3.5 pr-3 text-[0.85rem] text-ink-soft",
          "transition-colors duration-200 hover:border-ink-mute/50 hover:text-ink",
        ].join(" ")}
      >
        <GlobeIcon className="size-[1.05rem] text-ink-mute" />
        <span>{LOCALE_LABELS[locale]}</span>
        <ChevronDownIcon
          className={`size-4 text-ink-mute transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label={t.languageLabel}
          className={[
            "absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-2xl",
            "border border-line bg-surface p-1.5",
            "shadow-[0_18px_40px_-20px_rgba(23,36,30,0.35)]",
          ].join(" ")}
        >
          {LOCALES.map((code) => {
            const selected = code === locale;
            return (
              <li key={code} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => choose(code)}
                  className={[
                    "flex w-full items-center justify-between rounded-xl px-3 py-2",
                    "text-[0.875rem] transition-colors duration-150",
                    selected
                      ? "bg-panel/70 text-ink"
                      : "text-ink-soft hover:bg-panel/50 hover:text-ink",
                  ].join(" ")}
                >
                  {LOCALE_LABELS[code]}
                  {selected ? <CheckIcon className="size-4 text-accent" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
