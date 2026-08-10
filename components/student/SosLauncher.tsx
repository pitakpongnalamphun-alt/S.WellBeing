"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

/**
 * A small, always-visible SOS on the home screen — a compact red pill tucked
 * above the tab bar on the right, clear of the centred แจ้งเหตุ button.
 *
 * It links to /sos rather than firing an alert: a one-tap emergency send gets
 * pressed by accident, and a student whose first experience of the button is a
 * false alarm won't touch it again — which is exactly when it matters. The zone
 * picker and "who gets told" copy live on /sos.
 *
 * Colour is the `risk-high` token (a deep red), not a bright red-500: white text
 * on red-500 fails 4.5:1, and an SOS label that's hard to read defeats the point.
 */
export function SosLauncher() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20 px-4">
      <div className="mx-auto flex max-w-md justify-end">
        <Link
          href="/sos"
          aria-label="ขอความช่วยเหลือด่วน SOS"
          className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-risk-high px-3.5 py-2 text-[0.82rem] font-bold text-white shadow-[0_8px_20px_-6px_rgba(180,50,31,0.55)] ring-1 ring-white/40 transition-all duration-200 hover:brightness-110 active:scale-95"
        >
          <ShieldAlert className="size-4 animate-pulse" aria-hidden="true" />
          SOS
        </Link>
      </div>
    </div>
  );
}
