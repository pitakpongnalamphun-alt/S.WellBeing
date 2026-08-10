"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, ShieldAlert, User, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Tab = {
  href: string;
  label: string;
  Icon: LucideIcon;
  /** แจ้งเหตุ stands out by colour, not size. */
  hero?: boolean;
  /** Extra paths that light this tab (SOS is the urgent lane of แจ้งเหตุ). */
  match?: string[];
};

/**
 * Four equal-sized items — บ้าน / สำรวจ / แจ้งเหตุ / บุคคล. แจ้งเหตุ is the key
 * safety action, but it stands out by COLOUR (a warm coral) alone: same
 * footprint as its neighbours, no raised button. The coral text/icon is dark
 * enough to pass contrast on white at this small label size.
 */
const TABS: Tab[] = [
  { href: "/dashboard", label: "บ้าน", Icon: Home },
  { href: "/explore", label: "สำรวจ", Icon: Compass },
  {
    href: "/report",
    label: "แจ้งเหตุ",
    Icon: ShieldAlert,
    hero: true,
    match: ["/report", "/sos"],
  },
  { href: "/me", label: "บุคคล", Icon: User },
];

const HERO_COLOR = "#bd4620"; // coral label — dark enough for contrast on white
const HERO_CIRCLE = "#d8452a"; // the red circle around the แจ้งเหตุ icon

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="เมนูหลัก"
      className="sticky bottom-0 z-30 border-t border-neutral-200 bg-white/95 backdrop-blur-sm"
    >
      <ul className="mx-auto flex max-w-md">
        {TABS.map(({ href, label, Icon, hero, match }) => {
          const active = match ? match.includes(pathname) : pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                aria-label={hero ? "แจ้งเหตุ ขอความช่วยเหลือ" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 py-2",
                  "text-[0.68rem] transition-colors",
                  hero
                    ? "font-semibold"
                    : active
                      ? "text-mint-700"
                      : "text-ink-mute hover:text-ink-soft",
                )}
                style={hero ? { color: HERO_COLOR } : undefined}
              >
                {hero ? (
                  // Circle sized to the same 20px footprint as the other tabs'
                  // icons, so this tab stays exactly their size — the red disc is
                  // the only difference.
                  <span
                    className="flex size-5 items-center justify-center rounded-full shadow-sm"
                    style={{ backgroundColor: HERO_CIRCLE }}
                  >
                    <Icon
                      className="size-3.5 text-white"
                      strokeWidth={2.4}
                      aria-hidden="true"
                    />
                  </span>
                ) : (
                  <Icon
                    className="size-5"
                    strokeWidth={active ? 2.4 : 1.8}
                    aria-hidden="true"
                  />
                )}
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      {/* Clears the home indicator on iOS. */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
