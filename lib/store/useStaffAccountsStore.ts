import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  DEFAULT_STAFF_ACCOUNTS,
  type StaffAccount,
} from "@/data/staff";

/**
 * The mutable list of staff accounts. Seeded from DEFAULT_STAFF_ACCOUNTS and
 * persisted locally so the tech admin's add/edit/deactivate changes survive a
 * refresh. This is the single source of truth for "who can sign in and as what
 * role" — the login screen verifies against it, and `useStaffSession` resolves
 * the signed-in identity from it.
 *
 * Client-only demo: passcodes live in this store (i.e. localStorage). Production
 * moves this to a users table behind real auth; consumers that read identities
 * won't change.
 */

export type NewStaffInput = Omit<StaffAccount, "id">;

/** A staff row as the server knows it — no passcode; Google is the credential. */
export type ServerStaffInput = Omit<StaffAccount, "passcode">;

type StaffAccountsState = {
  accounts: StaffAccount[];
  /** False until the persisted store has rehydrated. */
  ready: boolean;
  setReady: () => void;
  add: (input: NewStaffInput) => StaffAccount;
  update: (id: string, patch: Partial<Omit<StaffAccount, "id">>) => void;
  remove: (id: string) => void;
  /**
   * Mirror a server-verified staff member into this store, keeping the SERVER
   * id so case assignments and audit entries line up across machines. Without
   * this, a staff member who exists only in the server table signs in with
   * Google successfully and then bounces straight back to login, because
   * `useStaffSession` resolves identity from this store.
   */
  upsertFromServer: (server: ServerStaffInput) => void;
};

function makeId(): string {
  return `staff-${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;
}

export const useStaffAccountsStore = create<StaffAccountsState>()(
  persist(
    (set) => ({
      accounts: DEFAULT_STAFF_ACCOUNTS,
      ready: false,
      setReady: () => set({ ready: true }),

      add: (input) => {
        const acct: StaffAccount = { ...input, id: makeId() };
        set((s) => ({ accounts: [...s.accounts, acct] }));
        return acct;
      },

      update: (id, patch) =>
        set((s) => ({
          accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),

      remove: (id) =>
        set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) })),

      upsertFromServer: (server) =>
        set((s) => {
          const existing = s.accounts.find((a) => a.id === server.id);
          if (existing) {
            // Server wins on identity fields; the local passcode (if any) stays.
            return {
              accounts: s.accounts.map((a) =>
                a.id === server.id ? { ...a, ...server } : a,
              ),
            };
          }
          // A server-only account signs in with Google, never a passcode — but
          // verifyStaff compares strings directly, so the passcode must be
          // unguessable and NEVER empty (an empty one would match empty input).
          const passcode = `sso-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e12).toString(36)}`;
          return { accounts: [...s.accounts, { ...server, passcode }] };
        }),
    }),
    {
      name: "swb.staffaccounts",
      partialize: (s) => ({ accounts: s.accounts }),
      onRehydrateStorage: () => (state) => state?.setReady(),
    },
  ),
);

/**
 * Verify a passcode for a staff id — the only place the secret is read. A
 * deactivated account never passes, even with the right code.
 */
export function verifyStaff(id: string, passcode: string): boolean {
  const a = useStaffAccountsStore.getState().accounts.find((x) => x.id === id);
  return !!a && a.active && a.passcode === passcode.trim();
}
