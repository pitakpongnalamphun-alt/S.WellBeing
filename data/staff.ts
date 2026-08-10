/**
 * Staff accounts for the admin side — the seam between "who is logged in" and
 * everything that needs a real identity (audit log, case assignment, the
 * counsellor's own appointment queue).
 *
 * This is the CLIENT-SIDE demo version: an account list + a passcode. It is NOT
 * secure (the codes live in the browser) — for production this becomes a users
 * table and verification becomes a real auth call, but the shape consumers read
 * (StaffIdentity: id/name/role) stays the same, so nothing downstream changes.
 *
 * The list below is only the DEFAULT seed. At runtime the accounts live in
 * `useStaffAccountsStore` so the tech admin can add / edit / deactivate them; see
 * that store for the mutable source of truth and passcode verification.
 */

export type StaffRole = "psychologist" | "counselor" | "admin";

/** What the rest of the app sees — never the passcode. */
export type StaffIdentity = {
  id: string;
  name: string;
  role: StaffRole;
  title: string;
  emoji: string;
};

/** The full stored account, secret included. Lives in the accounts store. */
export type StaffAccount = StaffIdentity & {
  passcode: string;
  /** A deactivated account keeps its history but can no longer sign in. */
  active: boolean;
};

// ids match data/counselors.ts so a signed-in counsellor lines up with the
// appointments booked to them and the cases assigned to them.
export const DEFAULT_STAFF_ACCOUNTS: StaffAccount[] = [
  { id: "psy-pim", name: "คุณหมอพิม", role: "psychologist", title: "นักจิตวิทยาคลินิก", emoji: "💜", passcode: "1234", active: true },
  { id: "gc-aoy", name: "ครูอ้อย", role: "counselor", title: "ครูแนะแนว", emoji: "🌷", passcode: "2345", active: true },
  { id: "gc-jane", name: "ครูเจน", role: "counselor", title: "ครูแนะแนว", emoji: "🌻", passcode: "3456", active: true },
  { id: "admin-team", name: "ทีมผู้ดูแลระบบ", role: "admin", title: "ผู้ดูแลระบบ", emoji: "🛠️", passcode: "0000", active: true },
];

export const STAFF_ROLE_ORDER: StaffRole[] = ["psychologist", "counselor", "admin"];

export const STAFF_ROLE_META: Record<
  StaffRole,
  { label: string; tint: string }
> = {
  psychologist: { label: "นักจิตวิทยา", tint: "bg-lavender-100 text-lavender-700" },
  counselor: { label: "ครูแนะแนว", tint: "bg-mint-100 text-mint-700" },
  admin: { label: "ผู้ดูแลระบบ", tint: "bg-sky-100 text-sky-700" },
};

/** Drop the secret (and the active flag) for anything that only needs identity. */
export function toIdentity(a: StaffAccount): StaffIdentity {
  const { passcode: _passcode, active: _active, ...identity } = a;
  return identity;
}
