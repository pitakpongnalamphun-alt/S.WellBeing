"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import {
  useStaffSession,
  useStaffSessionStore,
} from "@/lib/store/useStaffSessionStore";

/**
 * Gates the admin side on a signed-in staff member. Like the consent guard it
 * renders nothing until it knows — a page that paints and then redirects has
 * already shown staff-only data. Waits for the persisted session to rehydrate
 * (`ready`) so a signed-in staff member is never bounced back to login on the
 * first frame.
 *
 * Client-side by design (the session lives in browser storage); production moves
 * this to real auth checked in middleware.
 */
export function StaffGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const ready = useStaffSessionStore((s) => s.ready);
  // Gate on a *resolvable* identity, not the raw id — a stale/removed staffId in
  // storage must send the person back to login, not into a half-broken admin.
  const staff = useStaffSession();

  useEffect(() => {
    if (ready && !staff) router.replace("/staff-login");
  }, [ready, staff, router]);

  if (!ready || !staff) return null;

  return <>{children}</>;
}

export default StaffGuard;
