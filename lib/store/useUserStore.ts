import { create } from "zustand";
import { persist } from "zustand/middleware";

import { fetchMyProfile, upsertMyProfile } from "@/lib/data/profileRepo";
import { getClient, isSupabaseConfigured } from "@/lib/supabase/client";

import { useCasesStore } from "./useCasesStore";
import { useChatStore } from "./useChatStore";
import { useMoodDiaryStore } from "./useMoodDiaryStore";
import { useMyAssessStore } from "./useMyAssessStore";

/** Identity established by SSO (step 1). `email`/`name` may be absent for some
 *  providers — Google supplies both, and the onboarding form prefills from them. */
export type Session = {
  provider: string;
  email: string | null;
  name: string | null;
};

/** School data linked during onboarding, after a role is chosen (step 3).
 *  `username` carries the person's REAL full name (ชื่อ-นามสกุล) — it is what
 *  the consent-share card and the SOS board show to staff, so it must be the
 *  name a teacher can actually look up, not a handle. */
export type SchoolProfile = {
  username: string;
  studentId: string;
};

type UserState = {
  session: Session | null;
  profile: SchoolProfile | null;
  /** False until the persisted store has rehydrated — see the note below. */
  ready: boolean;
  setReady: () => void;
  signIn: (provider: string, email?: string, name?: string) => void;
  completeProfile: (username: string, studentId: string) => void;
  /**
   * ดึงโปรไฟล์ของตัวเองจากเซิร์ฟเวอร์ถ้าในเครื่องยังว่าง — คนที่เคยกรอกไว้แล้ว
   * เปลี่ยนเครื่องหรือล้างเบราว์เซอร์จะไม่ต้องกรอกชื่อ-รหัสนักเรียนใหม่
   * เขียนทับของในเครื่องไม่ได้เด็ดขาด เพราะอาจกำลังพิมพ์อยู่พอดี
   */
  syncFromServer: () => Promise<void>;
  signOut: () => void;
};

/**
 * The auth journey: sign in → choose a role → link school data.
 *
 *   session === null            → not signed in (show SSO login)
 *   session, profile === null   → signed in; pick a role, then onboard
 *   session, profile            → onboarded (skip straight to consent)
 *
 * Role is carried through the URL (?role=), not stored here — it is chosen
 * fresh each visit and the consent record is its lasting home.
 *
 * `ready` guards the hydration gap: on first paint the store holds its default
 * (signed out), and redirecting off that value would bounce a signed-in person
 * back to login for one frame. Route guards wait for `ready` first.
 *
 * This is a client-side stand-in for a real session. Nothing sensitive lives
 * here — mood entries, reports, and assessments stay server-side behind RLS.
 * Before production, session and profile move to the server (SSO callback +
 * a profile row), and these route guards become middleware.
 */
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      session: null,
      profile: null,
      ready: false,
      setReady: () => set({ ready: true }),
      signIn: (provider, email, name) =>
        set({ session: { provider, email: email ?? null, name: name ?? null } }),
      completeProfile: (username, studentId) => {
        const profile = { username, studentId };
        set({ profile });
        // เก็บไว้ฝั่งเซิร์ฟเวอร์ด้วย (RLS: เจ้าของเท่านั้น) เพื่อให้ข้ามเครื่องได้
        // และให้ใบนัดที่ครูสร้างให้ ใช้รหัสนักเรียนนี้เดินทางกลับมาหาเจ้าตัวได้
        void upsertMyProfile(profile);
      },

      syncFromServer: async () => {
        if (!isSupabaseConfigured()) return;
        if (get().profile) return; // ในเครื่องมีแล้ว — ห้ามทับ
        const remote = await fetchMyProfile();
        if (!remote || get().profile) return;
        set({ profile: remote });
      },
      signOut: () => {
        // เครื่องโรงเรียนใช้ร่วมกัน — ข้อมูลส่วนตัวทุกชุดต้องหายไปพร้อมการออกจากระบบ
        useMyAssessStore.getState().clear();
        useMoodDiaryStore.getState().clear();
        useChatStore.getState().clear();
        useCasesStore.getState().clear();
        void getClient()?.auth.signOut();
        set({ session: null, profile: null });
      },
    }),
    {
      name: "swb.user",
      // Persist the journey only; `ready` is a runtime flag, not stored state.
      partialize: ({ session, profile }) =>
        ({ session, profile }) as Partial<UserState>,
      // Fires whether or not anything was stored, so this always unblocks.
      onRehydrateStorage: () => (state) => state?.setReady(),
    },
  ),
);
