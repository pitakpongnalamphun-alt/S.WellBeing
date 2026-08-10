"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { loadConsent, type ConsentRecord } from "@/lib/consent/record";
import type { Role } from "@/lib/roles";

const ConsentContext = createContext<ConsentRecord | null>(null);

/**
 * Wrap anything that handles personal data. If there is no consent on file for
 * the current policy version, nothing renders and the person goes back to the
 * consent screen — a page that loads and *then* redirects has already shown
 * data it had no permission to show.
 *
 * The record reaches descendants through context rather than a render prop:
 * these pages are Server Components, and a function cannot cross the
 * server/client boundary.
 *
 * This is a client-side guard because the record lives in browser storage. Once
 * consent moves server-side, check it in middleware instead — a client guard is
 * a courtesy to the user, not a control against anyone determined.
 */
export function ConsentGuard({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const router = useRouter();
  const [record, setRecord] = useState<ConsentRecord | null>(null);

  useEffect(() => {
    const found = loadConsent();
    if (found && found.role === role) {
      setRecord(found);
    } else {
      router.replace(`/consent?role=${role}`);
    }
  }, [role, router]);

  if (!record) return null;

  return (
    <ConsentContext.Provider value={record}>{children}</ConsentContext.Provider>
  );
}

export function useConsentRecord(): ConsentRecord {
  const record = useContext(ConsentContext);
  if (!record) {
    throw new Error("useConsentRecord must be used inside <ConsentGuard>.");
  }
  return record;
}
