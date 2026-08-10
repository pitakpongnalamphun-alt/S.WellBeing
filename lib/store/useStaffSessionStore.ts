import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { toIdentity, type StaffIdentity } from "@/data/staff";
import { useStaffAccountsStore } from "./useStaffAccountsStore";

/**
 * The signed-in staff member. This is the single source of "who is using the
 * admin side" — audit logging, case assignment, and the counsellor's own
 * appointment queue all read the current identity through `useStaffSession`, so
 * swapping this client-side stand-in for real auth later touches only the login
 * screen and this store, not any consumer.
 *
 * Only the staff id is stored; the identity is always resolved fresh from the
 * account list, so a renamed account is never stale.
 */

type StaffSessionState = {
  staffId: string | null;
  /** False until the persisted store has rehydrated — guards the redirect race. */
  ready: boolean;
  setReady: () => void;
  signIn: (id: string) => void;
  signOut: () => void;
};

export const useStaffSessionStore = create<StaffSessionState>()(
  persist(
    (set) => ({
      staffId: null,
      ready: false,
      setReady: () => set({ ready: true }),
      signIn: (id) => set({ staffId: id }),
      signOut: () => set({ staffId: null }),
    }),
    {
      name: "swb.staffsession",
      partialize: ({ staffId }) => ({ staffId }) as Partial<StaffSessionState>,
      onRehydrateStorage: () => (state) => state?.setReady(),
    },
  ),
);

/** The resolved identity of the signed-in staff member (never the passcode). */
export function useStaffSession(): StaffIdentity | null {
  const id = useStaffSessionStore((s) => s.staffId);
  // Resolve against the live accounts store, so a rename / role change / removal
  // takes effect at once — and a removed or deactivated account resolves to null,
  // which sends the person back to login via StaffGuard.
  const account = useStaffAccountsStore((s) =>
    id ? s.accounts.find((a) => a.id === id && a.active) ?? null : null,
  );
  return useMemo(() => (account ? toIdentity(account) : null), [account]);
}
