"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

/**
 * Built on <dialog> so the browser supplies the modal semantics that are
 * tedious and easy to get wrong by hand: focus trapping, inertness of the page
 * behind, Escape to close, and the top layer (no z-index arms race).
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // `cancel` is Escape. Let React own the open state rather than the DOM.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClick={(e) => {
        // Clicks land on the dialog itself only when they hit the backdrop.
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-[min(30rem,calc(100vw-2rem))] rounded-3xl bg-white p-0",
        "backdrop:bg-ink/35 backdrop:backdrop-blur-[2px]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 p-5 pb-3">
        <h2 className="th:leading-snug text-[1.05rem] font-semibold text-ink">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-m-1.5 rounded-xl p-1.5 text-ink-mute transition-colors hover:bg-neutral-100 hover:text-ink"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="px-5 pb-5 text-[0.9rem] leading-relaxed text-ink-soft">
        {children}
      </div>

      {footer ? (
        <div className="flex flex-col-reverse gap-2.5 border-t border-neutral-200 p-4 sm:flex-row-reverse">
          {footer}
        </div>
      ) : null}
    </dialog>
  );
}
