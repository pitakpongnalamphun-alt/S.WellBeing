"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  /** Leading affordance — sits inside the field, never interactive. */
  icon: ReactNode;
  /** Optional trailing control, e.g. the show-password toggle. */
  action?: ReactNode;
  error?: string;
};

/**
 * A labelled input with the error wired to `aria-describedby`, so assistive
 * tech reads the problem rather than just announcing "invalid".
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ label, icon, action, error, className, ...props }, ref) {
    const id = useId();
    const errorId = `${id}-error`;

    return (
      <div>
        <label
          htmlFor={id}
          className="mb-2 block text-[0.9rem] font-medium text-ink"
        >
          {label}
        </label>

        <div
          className={[
            "relative flex items-center rounded-2xl border bg-surface",
            "transition-colors duration-200",
            "focus-within:border-accent/45 focus-within:ring-4 focus-within:ring-accent/10",
            error ? "border-danger/60" : "border-line hover:border-line/80",
          ].join(" ")}
        >
          <span
            className="pointer-events-none absolute left-4 text-ink-mute"
            aria-hidden="true"
          >
            {icon}
          </span>

          <input
            ref={ref}
            id={id}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={[
              "w-full bg-transparent py-3.5 pl-12 text-[0.95rem] text-ink",
              // Full token, no opacity step — a faded placeholder drops below 4.5:1.
              "placeholder:text-ink-mute focus:outline-none",
              action ? "pr-12" : "pr-4",
              className ?? "",
            ].join(" ")}
            {...props}
          />

          {action ? <span className="absolute right-2">{action}</span> : null}
        </div>

        {error ? (
          <p id={errorId} role="alert" className="mt-1.5 text-[0.8rem] text-danger">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
