"use client";

import { Heart, Shield, Users, type LucideIcon } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

type Value = {
  key: "safe" | "care" | "connect";
  Icon: LucideIcon;
  /** Token pair: icon colour and its pastel chip. */
  color: string;
  chip: string;
};

const VALUES: Value[] = [
  {
    key: "safe",
    Icon: Shield,
    color: "text-value-safe",
    chip: "bg-value-safe-bg",
  },
  {
    key: "care",
    Icon: Heart,
    color: "text-value-care",
    chip: "bg-value-care-bg",
  },
  {
    key: "connect",
    Icon: Users,
    color: "text-value-connect",
    chip: "bg-value-connect-bg",
  },
];

/**
 * The three promises the service makes, stated before it asks anything of you.
 * Presentational: `aria-hidden` on the icons, and the words carry the meaning.
 */
export function CoreValues() {
  const { t } = useLanguage();

  return (
    <ul className="flex items-start justify-center gap-8 sm:gap-14">
      {VALUES.map(({ key, Icon, color, chip }) => (
        <li key={key} className="flex w-20 flex-col items-center gap-2.5">
          <span
            className={`flex size-14 items-center justify-center rounded-2xl ${chip}`}
          >
            <Icon className={`size-6 ${color}`} strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="text-center text-[0.82rem] font-medium text-role-sub">
            {t.roles.values[key]}
          </span>
        </li>
      ))}
    </ul>
  );
}
