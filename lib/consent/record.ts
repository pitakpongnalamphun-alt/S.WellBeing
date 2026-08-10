import type { Role } from "@/lib/roles";

import { POLICY_VERSION } from "./policy";

const STORAGE_KEY = "swb.consent";

/**
 * What was agreed, by whom, to which version, and when. PDPA puts the burden
 * of proof on the controller, so a consent record has to be specific enough to
 * stand up later — "the user clicked yes" is not a record.
 */
export type ConsentRecord = {
  policyVersion: string;
  role: Role;
  /** ISO 8601, UTC. */
  acceptedAt: string;
  /** Locale the policy was actually displayed in when accepted. */
  readIn: string;
};

/**
 * Browser storage is a stand-in so the flow runs end to end. Real consent must
 * be written server-side against the account: local storage is per-device,
 * clearable by the person it is meant to bind, and unavailable to any audit.
 * Replace both functions with API calls before this goes near real students.
 */
export function loadConsent(): ConsentRecord | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;
    // A record against an older policy is not consent to the current one.
    return parsed.policyVersion === POLICY_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

export function saveConsent(record: ConsentRecord): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

export function clearConsent(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}
