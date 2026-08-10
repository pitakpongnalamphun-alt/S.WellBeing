"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { ArrowRightIcon, SpinnerIcon } from "@/components/icons";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  loading?: boolean;
  /** Announced while `loading` — the label itself must not change mid-action. */
  loadingLabel?: string;
};

export function PrimaryButton({
  children,
  loading = false,
  loadingLabel,
  disabled,
  className,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[
        "group relative flex w-full items-center justify-center gap-2 rounded-2xl",
        "bg-action py-4 text-[0.95rem] font-medium tracking-wide text-canvas",
        "shadow-[0_10px_28px_-14px_rgba(21,32,27,0.85)]",
        "transition-all duration-200 hover:bg-ink hover:shadow-[0_14px_32px_-14px_rgba(21,32,27,0.9)]",
        "active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60",
        className ?? "",
      ].join(" ")}
      {...props}
    >
      {loading ? (
        <>
          <SpinnerIcon className="size-5 animate-spin" />
          <span>{loadingLabel ?? children}</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          {/* The arrow leans forward on hover — the only motion on this button. */}
          <ArrowRightIcon className="absolute right-6 size-5 transition-transform duration-300 group-hover:translate-x-1" />
        </>
      )}
    </button>
  );
}
