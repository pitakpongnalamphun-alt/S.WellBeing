export const ROLES = ["student", "admin"] as const;

export type Role = (typeof ROLES)[number];

/**
 * Where each role lands once consent is on file. Students get bare paths —
 * they are the ones typing on a phone; staff routes are prefixed so the two
 * route groups don't resolve to the same URLs.
 */
export const ROLE_HOME: Record<Role, string> = {
  student: "/dashboard",
  admin: "/admin/dashboard",
};

export function isRole(value: string | null): value is Role {
  return value !== null && ROLES.includes(value as Role);
}
