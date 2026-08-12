import { create } from "zustand";
import { persist } from "zustand/middleware";

import { INITIAL_CLOUDS, type CoreColor, type MoodCloud } from "@/data/cloudHugs";
import { fetchClouds, hugCloud, insertCloud } from "@/lib/data/cloudsRepo";
import { hasSession } from "@/lib/data/casesRepo";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { localDay } from "@/lib/date";

/**
 * The shared galaxy of anonymous mood clouds. Releasing (from the mood tracker)
 * and hugging (from the galaxy) both flow through here, so a cloud a student
 * lets go of genuinely appears for others to hug.
 *
 * เมฆอยู่บนเซิร์ฟเวอร์จริงแล้ว (ตาราง mood_clouds) เพื่อนจึงเห็นเมฆของกันข้ามเครื่อง
 * ได้จริง ๆ ไม่ใช่ต่างคนต่างเห็นแต่ของตัวเอง ตารางไม่มีคอลัมน์ผู้ส่ง — "เมฆของฉัน"
 * รู้ได้จากรายการ id ที่เก็บไว้ในเครื่องเจ้าตัวเท่านั้น เซิร์ฟเวอร์ไม่รู้ว่าใครปล่อยก้อนไหน
 *
 * กาแล็กซีเริ่มใหม่ทุกเดือน: ความรู้สึกหนัก ๆ ของเดือนที่แล้วไม่ควรลอยค้างให้เห็น
 * ไปเรื่อย ๆ และการรีเซ็ตยังคุมจำนวนเมฆไม่ให้ล้นจนทับกัน — เดือนใหม่ = ท้องฟ้าใหม่
 */

/** "2026-08-12" → "2026-08" */
const monthOf = (day: string = localDay()) => day.slice(0, 7);

/**
 * เมฆตั้งต้นสำหรับ "โหมดสาธิต" เท่านั้น (ยังไม่ได้ตั้งค่าฐานข้อมูล) — จอจะได้ไม่ว่างเปล่า
 * เมื่อเชื่อมเซิร์ฟเวอร์แล้วเมฆชุดนี้จะถูกแทนที่ด้วยของจริงตอนซิงก์ครั้งแรก และไม่เคย
 * ถูกเขียนขึ้นฐานข้อมูล — ท้องฟ้าจริงต้องไม่มีเมฆปลอมปนอยู่
 */
const seedFor = (month: string): MoodCloud[] =>
  isSupabaseConfigured() ? [] : INITIAL_CLOUDS.map((c) => ({ ...c, id: `${c.id}-${month}` }));

type CloudHugsState = {
  /** เดือนของกาแล็กซีชุดที่ถืออยู่ "YYYY-MM" */
  month: string;
  clouds: MoodCloud[];
  /** id ของเมฆที่เครื่องนี้ปล่อยเอง — ใช้ติดป้าย "ของฉัน" โดยไม่ต้องบอกเซิร์ฟเวอร์ว่าใครเป็นใคร */
  mineIds: string[];
  /** เมฆที่ปล่อยแล้วแต่ยังส่งขึ้นเซิร์ฟเวอร์ไม่สำเร็จ (คิวส่งซ้ำ) */
  pending: string[];
  /**
   * วันที่ปล่อยเมฆล่าสุด "YYYY-MM-DD" — ปล่อยได้วันละก้อน ให้ตรงกับที่บันทึกอารมณ์
   * ได้วันละครั้งอยู่แล้ว และกันการกดย้อนกลับในหน้าเช็คอินเพื่อปล่อยรัว ๆ ซึ่งจะทำให้
   * ท้องฟ้าของคนคนเดียวกลบเมฆของคนอื่นจนหาไม่เจอ
   */
  lastReleasedDay: string | null;
  /** ขึ้นเดือนใหม่แล้วล้างท้องฟ้าเริ่มใหม่ — เรียกตอนเปิดหน้าและก่อนปล่อยเมฆ */
  ensureMonth: () => void;
  /** วันนี้ยังปล่อยเมฆได้อีกไหม */
  canReleaseToday: () => boolean;
  /** ปล่อยเมฆนิรนามเข้ากาแล็กซี — คืน id หรือ null ถ้าวันนี้ปล่อยไปแล้ว */
  release: (tertiaryEmotion: string, coreColor: CoreColor) => string | null;
  hug: (id: string) => void;
  /** ดึงท้องฟ้าของเดือนนี้จากเซิร์ฟเวอร์ (หน้ากาแล็กซีเรียกเป็นระยะ) */
  syncFromServer: () => Promise<void>;
};

export const useCloudHugsStore = create<CloudHugsState>()(
  persist(
    (set, get) => ({
      month: monthOf(),
      clouds: [],
      mineIds: [],
      pending: [],
      lastReleasedDay: null,

      ensureMonth: () => {
        const now = monthOf();
        if (get().month === now) return;
        // ล้างเฉพาะท้องฟ้า — lastReleasedDay ไม่ต้องแตะ วันใหม่ก็ปล่อยได้เองอยู่แล้ว
        set({ month: now, clouds: seedFor(now), mineIds: [], pending: [] });
      },

      canReleaseToday: () => get().lastReleasedDay !== localDay(),

      release: (tertiaryEmotion, coreColor) => {
        get().ensureMonth();
        const today = localDay();
        if (get().lastReleasedDay === today) return null;
        const id = `me-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const cloud: MoodCloud = { id, tertiaryEmotion, coreColor, hugsReceived: 0, mine: true };
        // ขึ้นจอก่อนเสมอ แล้วค่อยส่ง — ปล่อยเมฆแล้วต้องเห็นทันทีแม้เน็ตจะช้า
        set((s) => ({
          clouds: [cloud, ...s.clouds],
          mineIds: [...s.mineIds, id],
          pending: [...s.pending, id],
          lastReleasedDay: today,
        }));
        void insertCloud(cloud, get().month).then((ok) => {
          if (ok || !isSupabaseConfigured()) {
            set((s) => ({ pending: s.pending.filter((p) => p !== id) }));
          }
        });
        return id;
      },

      hug: (id) => {
        set((s) => ({
          clouds: s.clouds.map((c) => (c.id === id ? { ...c, hugsReceived: c.hugsReceived + 1 } : c)),
        }));
        // นับจริงฝั่งเซิร์ฟเวอร์ผ่าน RPC (ตารางไม่เปิดให้ UPDATE ตรง ๆ)
        void hugCloud(id);
      },

      syncFromServer: async () => {
        if (!isSupabaseConfigured()) return;
        // ยังไม่ล็อกอิน = RLS คืน 0 แถวเสมอ ห้ามเอาไปแทนที่ของในเครื่อง
        if (!(await hasSession())) return;
        get().ensureMonth();
        const month = get().month;

        // 1) ส่งเมฆที่ค้างคิวขึ้นก่อน — เมฆของนักเรียนต้องไปถึงเพื่อนให้ได้
        for (const id of [...get().pending]) {
          const c = get().clouds.find((x) => x.id === id);
          if (c && (await insertCloud(c, month))) {
            set((s) => ({ pending: s.pending.filter((p) => p !== id) }));
          }
        }

        // 2) ดึงท้องฟ้าจริงมาแทน — ของที่ยังส่งไม่ขึ้นต้องคงอยู่บนจอ
        const remote = await fetchClouds(month);
        if (remote === null) return;
        const mine = new Set(get().mineIds);
        const remoteIds = new Set(remote.map((r) => r.id));
        const stillPending = get().pending;
        const localOnly = get().clouds.filter(
          (c) => stillPending.includes(c.id) && !remoteIds.has(c.id),
        );
        set({
          clouds: [
            ...localOnly,
            ...remote.map((c) => (mine.has(c.id) ? { ...c, mine: true } : c)),
          ],
        });
      },
    }),
    {
      name: "swb.cloudhugs",
      partialize: (s) => ({
        clouds: s.clouds,
        month: s.month,
        mineIds: s.mineIds,
        pending: s.pending,
        lastReleasedDay: s.lastReleasedDay,
      }),
      // เมฆตั้งต้นของโหมดสาธิตต้องรอจนรู้ว่าตั้งค่าฐานข้อมูลไว้ไหม (env อ่านได้ตอนรันเท่านั้น)
      onRehydrateStorage: () => (state) => {
        if (state && state.clouds.length === 0 && state.pending.length === 0) {
          state.clouds = seedFor(state.month);
        }
      },
    },
  ),
);
