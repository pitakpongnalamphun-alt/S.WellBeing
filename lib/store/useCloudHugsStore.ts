import { create } from "zustand";
import { persist } from "zustand/middleware";

import { INITIAL_CLOUDS, type CoreColor, type MoodCloud } from "@/data/cloudHugs";

/**
 * The shared galaxy of anonymous mood clouds. Releasing (from the mood tracker)
 * and hugging (from the galaxy) both flow through here, so a cloud a student
 * lets go of genuinely appears for others to hug. Persisted locally for the demo;
 * a real build would sync this to the server behind auth.
 */
type CloudHugsState = {
  clouds: MoodCloud[];
  /** Send an anonymous cloud into the galaxy; returns its id. */
  release: (tertiaryEmotion: string, coreColor: CoreColor) => string;
  hug: (id: string) => void;
};

export const useCloudHugsStore = create<CloudHugsState>()(
  persist(
    (set) => ({
      clouds: INITIAL_CLOUDS,

      release: (tertiaryEmotion, coreColor) => {
        const id = `me-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        set((s) => ({
          clouds: [{ id, tertiaryEmotion, coreColor, hugsReceived: 0, mine: true }, ...s.clouds],
        }));
        return id;
      },

      hug: (id) =>
        set((s) => ({
          clouds: s.clouds.map((c) => (c.id === id ? { ...c, hugsReceived: c.hugsReceived + 1 } : c)),
        })),
    }),
    {
      name: "swb.cloudhugs",
      partialize: (s) => ({ clouds: s.clouds }),
    },
  ),
);
