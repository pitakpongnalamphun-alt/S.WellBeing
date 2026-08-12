import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  DEFAULT_STAFF_ACCOUNTS,
  type StaffAccount,
} from "@/data/staff";
import { deleteStaff, fetchStaffRoster, upsertStaff } from "@/lib/data/staffRepo";

/**
 * The mutable list of staff accounts. Seeded from DEFAULT_STAFF_ACCOUNTS and
 * persisted locally so the tech admin's add/edit/deactivate changes survive a
 * refresh. This is the single source of truth for "who can sign in and as what
 * role" — the login screen verifies against it, and `useStaffSession` resolves
 * the signed-in identity from it.
 *
 * บัญชีที่ "มีอีเมล" จะถูกเขียนขึ้นตาราง staff บนเซิร์ฟเวอร์ด้วย เพราะอีเมลคือสิ่งที่
 * RLS ใช้ตัดสินสิทธิ์ — ถ้าไม่เขียนขึ้นไป ครูที่ผู้ดูแลระบบเพิ่งเพิ่มจะล็อกอิน Google
 * ไม่ผ่าน (findStaffByEmail หาไม่เจอ) ทั้งที่หน้าจอบอกว่าเพิ่มบัญชีสำเร็จแล้ว
 *
 * บัญชีที่ไม่มีอีเมลยังใช้ได้เหมือนเดิมในโหมดสาธิต (รหัสผ่านเก็บในเครื่อง) —
 * production ย้ายไปใช้ auth จริงทั้งหมด โดยผู้อ่าน identity ไม่ต้องแก้อะไร
 */

export type NewStaffInput = Omit<StaffAccount, "id">;

/** A staff row as the server knows it — no passcode; Google is the credential. */
export type ServerStaffInput = Omit<StaffAccount, "passcode">;

/**
 * รหัสผ่านสำรองที่เดาไม่ได้ สำหรับบัญชีที่ใช้ Google ล็อกอิน
 * ห้ามเว้นว่างเด็ดขาด — verifyStaff เทียบสตริงตรง ๆ รหัสว่างจะแมตช์ช่องว่างที่ใครก็พิมพ์ได้
 */
function ssoPasscode(): string {
  return `sso-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e12).toString(36)}`;
}

type StaffAccountsState = {
  accounts: StaffAccount[];
  /** False until the persisted store has rehydrated. */
  ready: boolean;
  setReady: () => void;
  add: (input: NewStaffInput) => StaffAccount;
  update: (id: string, patch: Partial<Omit<StaffAccount, "id">>) => void;
  remove: (id: string) => void;
  /** ดึงทะเบียนครูจากเซิร์ฟเวอร์มารวมกับของในเครื่อง (หน้าบัญชีเจ้าหน้าที่เรียกตอนเปิด) */
  syncFromServer: () => Promise<void>;
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
    (set, get) => ({
      accounts: DEFAULT_STAFF_ACCOUNTS,
      ready: false,
      setReady: () => set({ ready: true }),

      add: (input) => {
        const acct: StaffAccount = {
          ...input,
          // บัญชีที่ผูกอีเมลไว้ไม่จำเป็นต้องตั้งรหัสผ่าน แต่ต้องไม่ปล่อยให้ว่าง
          passcode: input.passcode.trim() || ssoPasscode(),
          email: input.email?.trim().toLowerCase() || undefined,
          id: makeId(),
        };
        set((s) => ({ accounts: [...s.accounts, acct] }));
        void upsertStaff({ ...acct, email: acct.email ?? "" });
        return acct;
      },

      update: (id, patch) => {
        const merged = { ...get().accounts.find((a) => a.id === id), ...patch } as StaffAccount;
        if (patch.email !== undefined) {
          merged.email = patch.email?.trim().toLowerCase() || undefined;
        }
        set((s) => ({
          accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...merged } : a)),
        }));
        if (merged.id) void upsertStaff({ ...merged, email: merged.email ?? "" });
      },

      remove: (id) => {
        set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) }));
        void deleteStaff(id);
      },

      syncFromServer: async () => {
        const roster = await fetchStaffRoster();
        if (roster === null) return;
        set((s) => {
          const byId = new Map(s.accounts.map((a) => [a.id, a]));
          for (const r of roster) {
            const local = byId.get(r.id);
            // เซิร์ฟเวอร์เป็นเจ้าของข้อมูลตัวตน ส่วนรหัสผ่านสาธิตในเครื่องคงไว้
            byId.set(r.id, { ...r, passcode: local?.passcode ?? ssoPasscode() });
          }
          // ไม่ลบบัญชีที่มีแต่ในเครื่อง — แยกไม่ออกว่า "ถูกลบบนเซิร์ฟเวอร์" หรือ
          // "เป็นบัญชีสาธิตที่ไม่เคยขึ้นเซิร์ฟเวอร์" การลบผิดตัวคือการล็อกครูออกจากระบบ
          return { accounts: [...byId.values()] };
        });
      },

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
          return { accounts: [...s.accounts, { ...server, passcode: ssoPasscode() }] };
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
  const code = passcode.trim();
  // รหัสว่างไม่ผ่านเสมอ ต่อให้บัญชีนั้นมีรหัสว่างด้วยความผิดพลาด — ไม่งั้นแค่กด
  // "เข้าสู่ระบบ" โดยไม่พิมพ์อะไรเลยก็สวมเป็นครูคนนั้นได้
  if (!code) return false;
  const a = useStaffAccountsStore.getState().accounts.find((x) => x.id === id);
  return !!a && a.active && a.passcode === code;
}
