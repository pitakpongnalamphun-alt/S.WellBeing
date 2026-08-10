import type { StaffRole } from "@/data/staff";

/**
 * Role-based access for the admin side (PDPA data minimisation — each role sees
 * only what its job needs). Single source of truth: the sidebar hides links a
 * role can't use, and the route guard blocks direct-URL access to the same set.
 *
 * Model: clinical staff (นักจิตวิทยา + ครูแนะแนว) handle student care — cases,
 * appointments, SOS. The tech admin (ผู้ดูแลระบบ) runs the system and oversight —
 * the overview, aggregate analytics, and the access log — but never individual
 * student case data.
 */
const CLINICAL: StaffRole[] = ["psychologist", "counselor"];
const ALL: StaffRole[] = ["psychologist", "counselor", "admin"];

/** Path → roles allowed. Longest matching prefix wins. */
export const PAGE_ROLES: { path: string; roles: StaffRole[] }[] = [
  { path: "/admin/dashboard", roles: ALL },
  { path: "/admin/cases", roles: CLINICAL },
  { path: "/admin/analytics", roles: ALL },
  { path: "/admin/mood", roles: ALL },
  { path: "/admin/assessments", roles: ALL },
  { path: "/admin/insights", roles: ALL },
  { path: "/admin/guide", roles: ALL },
  { path: "/admin/sos", roles: CLINICAL },
  { path: "/admin/appointments", roles: CLINICAL },
  { path: "/admin/audit", roles: ["admin"] },
  { path: "/admin/staff", roles: ["admin"] },
];

/** Where each role lands — the first page it is allowed to see. */
export const ROLE_LANDING = "/admin/dashboard";

export function canAccess(pathname: string, role: StaffRole): boolean {
  const match = PAGE_ROLES.filter(
    (p) => pathname === p.path || pathname.startsWith(`${p.path}/`),
  ).sort((a, b) => b.path.length - a.path.length)[0];
  // Fail CLOSED: an admin route not in the matrix is denied, not opened. A page
  // added later that forgets to declare its roles must hide student data by
  // default, never expose it to every role. ROLE_LANDING (/admin/dashboard) is
  // always in the matrix, so a denied path bounces cleanly to the overview with
  // no redirect loop.
  return match ? match.roles.includes(role) : false;
}

/** True when a role may see individual student case/SOS/appointment data. */
export function canSeeStudentData(role: StaffRole): boolean {
  return role !== "admin";
}
