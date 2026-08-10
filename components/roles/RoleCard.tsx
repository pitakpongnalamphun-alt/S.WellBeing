"use client";

import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

import { CardBackdrop } from "./CardBackdrop";

type RoleCardProps = {
  href: string;
  Icon: LucideIcon;
  title: string;
  /** English sub-label under the title. */
  surface: string;
  description: string;
  /** Accessible name for the whole card — the arrow alone says nothing. */
  action: string;
  variant: "student" | "admin";
};

/**
 * One role, as a single link. The entire card is the target rather than a
 * button tucked inside it: there is exactly one thing to do here, and a
 * 100%-width tap area is the most forgiving way to offer it.
 */
export function RoleCard({
  href,
  Icon,
  title,
  surface,
  description,
  action,
  variant,
}: RoleCardProps) {
  // Lighter at the top-left, near-solid at the bottom-right: the backdrop
  // stays visible where there is no text, and the copy still clears 4.5:1.
  const overlay =
    variant === "student"
      ? "from-card-student-from/62 via-card-student-from/86 to-card-student-to/96"
      : "from-card-admin-from/62 via-card-admin-from/86 to-card-admin-to/96";

  return (
    <Link
      href={href}
      aria-label={action}
      className={[
        "group relative block overflow-hidden rounded-2xl",
        "shadow-[0_12px_30px_-14px_rgba(15,32,25,0.45)]",
        "transition-[transform,box-shadow] duration-300 ease-out",
        "hover:-translate-y-1 hover:shadow-[0_20px_44px_-16px_rgba(15,32,25,0.55)]",
        "focus-visible:outline-2 focus-visible:outline-offset-3",
        "focus-visible:outline-role-heading",
        "active:translate-y-0",
      ].join(" ")}
    >
      <CardBackdrop variant={variant} />

      {/* Diagonal wash. The lighter corner is what lets the backdrop show. */}
      <span
        className={`absolute inset-0 bg-linear-to-br ${overlay} transition-opacity duration-300 group-hover:opacity-[0.94]`}
        aria-hidden="true"
      />

      <span className="relative flex h-full items-center gap-4 p-5 sm:gap-5 sm:p-6">
        <span
          className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/18 ring-1 ring-white/25 backdrop-blur-[2px] sm:size-16"
          aria-hidden="true"
        >
          <Icon className="size-7 text-white sm:size-8" strokeWidth={1.8} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
            <span className="text-[1.15rem] font-semibold text-white sm:text-[1.3rem]">
              {title}
            </span>
            <span className="text-[0.82rem] font-light text-white/75">
              {surface}
            </span>
          </span>
          <span className="mt-1.5 block text-[0.85rem] leading-relaxed text-white/85">
            {description}
          </span>
        </span>

        <ChevronRight
          className="size-5 shrink-0 text-white/80 transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}
