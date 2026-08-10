"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

import { SpinnerIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type Variant = "primary" | "soft" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-mint-700 text-white hover:bg-mint-600 active:translate-y-px shadow-[0_10px_24px_-14px_rgba(12,92,63,0.9)]",
  soft: "bg-mint-100 text-mint-700 hover:bg-mint-200 active:translate-y-px",
  outline:
    "border border-neutral-300 text-ink-soft hover:border-neutral-400 hover:text-ink",
  ghost: "text-ink-soft hover:bg-neutral-100 hover:text-ink",
  danger:
    "bg-risk-high text-white hover:brightness-110 active:translate-y-px shadow-[0_10px_24px_-14px_rgba(180,50,31,0.9)]",
};

const SIZES: Record<Size, string> = {
  // min-h keeps every size at or above the 44px comfortable touch target.
  sm: "min-h-11 px-3.5 text-[0.84rem] rounded-xl gap-1.5",
  md: "min-h-12 px-5 text-[0.9rem] rounded-2xl gap-2",
  lg: "min-h-14 px-6 text-[0.95rem] rounded-2xl gap-2.5",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        // aria-disabled rather than disabled: a disabled button leaves the tab
        // order, so nobody using a keyboard learns why it does nothing.
        aria-disabled={disabled || loading || undefined}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200",
          VARIANTS[variant],
          SIZES[size],
          fullWidth && "w-full",
          (disabled || loading) && "pointer-events-none opacity-55",
          className,
        )}
        {...props}
      >
        {loading ? <SpinnerIcon className="size-4 animate-spin" /> : null}
        {children}
      </button>
    );
  },
);
