import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** `flat` for content inside an already-elevated surface. */
  elevation?: "raised" | "flat";
};

export function Card({
  elevation = "raised",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white ring-1 ring-neutral-200/80",
        elevation === "raised" &&
          "shadow-[0_12px_28px_-20px_rgba(15,32,25,0.35)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  action,
  className,
}: {
  title: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3 p-4", className)}>
      <h2 className="th:leading-snug text-[0.95rem] font-semibold text-ink">
        {title}
      </h2>
      {action}
    </div>
  );
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("px-4 pb-4", className)}>{children}</div>;
}
