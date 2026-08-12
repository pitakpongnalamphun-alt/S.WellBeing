import { create } from "zustand";
import { persist } from "zustand/middleware";

import { hasSession } from "@/lib/data/casesRepo";
import { fetchMoodStats, insertMoodStat } from "@/lib/data/statsRepo";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { localDay } from "@/lib/date";

/**
 * Anonymous, aggregate mood signal for the school dashboard. One record per
 * daily check-in: {core emotion, tertiary "root" feeling, time} — and nothing
 * else. No student identity, no device link, no free text.
 *
 * The individual mood diary (the sticker book) stays private on the student's
 * device; this store keeps only de-identified data points so staff can read the
 * school's emotional climate in aggregate — never who felt what. Same privacy
 * shape as the anonymous reports and the assessment statistics.
 */

export type MoodRecord = {
  id: string;
  at: string; // ISO
  core: string; // CoreKey: yellow/purple/green/orange/red/gray/blue
  tertiary: string; // the specific root feeling, e.g. "โดดเดี่ยว"
};

type MoodStatsState = {
  records: MoodRecord[];
  /** Local day of the last recorded check-in — one record per day, matching the reward. */
  lastRecordedDay: string | null;
  /**
   * จุดข้อมูลที่เขียนลงเครื่องแล้วแต่ยังส่งขึ้นไม่สำเร็จ (เน็ตหลุด / ยังไม่ล็อกอิน)
   * ถ้าไม่มีคิวนี้ ความรู้สึกของวันนั้นจะหายจากสถิติโรงเรียนถาวร และเพราะกันวันละครั้ง
   * นักเรียนจะกดซ้ำให้ส่งใหม่ก็ไม่ได้ด้วย
   */
  pending: string[];
  record: (r: { core: string; tertiary: string }) => void;
  /** ส่งของที่ค้างคิวซ้ำ — StatsPush เรียกตอนเปิดแอปและตอนกลับมาที่แท็บ */
  flushPending: () => Promise<void>;
  /**
   * ดึงสถิติจากเซิร์ฟเวอร์มาแทนที่ของในเครื่อง — เรียกจากฝั่งแดชบอร์ดครูเท่านั้น
   * (StatsSync ใน layout ของแอดมิน) เพราะ RLS ให้เฉพาะเจ้าหน้าที่อ่านตารางนี้
   */
  syncFromServer: () => Promise<void>;
};

export const useMoodStatsStore = create<MoodStatsState>()(
  persist(
    (set, get) => ({
      records: [],
      lastRecordedDay: null,
      pending: [],

      record: (r) => {
        // Re-checking-in the same day must not inflate the aggregate — the coin
        // reward is already once-per-day, so the record is too.
        const today = localDay();
        if (get().lastRecordedDay === today) return;
        const rec: MoodRecord = {
          ...r,
          id: `md-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
          at: new Date().toISOString(),
        };
        set((s) => ({
          lastRecordedDay: today,
          records: [rec, ...s.records],
          pending: [...s.pending, rec.id],
        }));
        // ส่งขึ้นสถิติกลาง — เก็บแค่ {อารมณ์, เวลา} ไม่มีคอลัมน์ผู้ส่งให้สาวกลับ
        void insertMoodStat(rec).then((ok) => {
          if (ok || !isSupabaseConfigured()) {
            set((s) => ({ pending: s.pending.filter((p) => p !== rec.id) }));
          }
        });
      },

      flushPending: async () => {
        if (!isSupabaseConfigured() || get().pending.length === 0) return;
        if (!(await hasSession())) return;
        for (const id of [...get().pending]) {
          const rec = get().records.find((x) => x.id === id);
          if (!rec) {
            set((s) => ({ pending: s.pending.filter((p) => p !== id) }));
            continue;
          }
          if (await insertMoodStat(rec)) {
            set((s) => ({ pending: s.pending.filter((p) => p !== id) }));
          }
        }
      },

      syncFromServer: async () => {
        if (!isSupabaseConfigured()) return;
        // ยังไม่ล็อกอิน = RLS คืน 0 แถวเสมอ ห้ามเอาไปแทนที่ของในเครื่อง
        if (!(await hasSession())) return;
        const remote = await fetchMoodStats();
        if (remote === null) return;
        // ของที่ยังส่งไม่ขึ้นต้องไม่ถูกลบทิ้งตอนดึงของจริงมาแทน (กันซ้ำด้วย id)
        const remoteIds = new Set(remote.map((r) => r.id));
        const stillPending = get().pending;
        const localOnly = get().records.filter(
          (r) => stillPending.includes(r.id) && !remoteIds.has(r.id),
        );
        set({ records: [...localOnly, ...remote] });
      },
    }),
    {
      name: "swb.moodstats",
      partialize: (s) => ({
        records: s.records,
        lastRecordedDay: s.lastRecordedDay,
        pending: s.pending,
      }),
    },
  ),
);
