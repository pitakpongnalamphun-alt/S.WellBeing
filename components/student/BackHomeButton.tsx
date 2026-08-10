"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/** The three top-level tabs — reachable from the bottom bar, so no back arrow. */
const TAB_ROOTS = new Set(["/", "/dashboard", "/explore", "/me"]);

/**
 * A back-to-home arrow shown on deep feature screens. The three tab roots reach
 * each other through the bottom bar, so they don't get one. Lives in the shell
 * so each feature page gets it for free.
 */
export function BackHomeButton() {
  const pathname = usePathname();
  if (TAB_ROOTS.has(pathname)) return null;

  return (
    <Link
      href="/dashboard"
      aria-label="กลับหน้าแรก"
      className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-500 shadow-sm ring-1 ring-slate-200 backdrop-blur transition hover:text-slate-700 active:scale-95"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      หน้าแรก
    </Link>
  );
}

export default BackHomeButton;
