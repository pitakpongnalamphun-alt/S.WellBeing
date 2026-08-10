"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useStaffSession } from "@/lib/store/useStaffSessionStore";
import { canAccess, ROLE_LANDING } from "@/lib/adminAccess";

/**
 * Blocks a signed-in staff member from a route their role may not see — the
 * companion to hiding the link in the sidebar, so typing the URL directly is
 * caught too. Redirects to the overview (which every role can see) and renders
 * nothing meanwhile, so a disallowed page never flashes its data.
 *
 * Sits inside StaffGuard, so `staff` is already resolved; production would also
 * enforce this server-side in middleware.
 */
export function RoleGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const staff = useStaffSession();

  const blocked = !!staff && !canAccess(pathname, staff.role);

  useEffect(() => {
    if (blocked) router.replace(ROLE_LANDING);
  }, [blocked, router]);

  if (blocked) return null;
  return <>{children}</>;
}

export default RoleGuard;
