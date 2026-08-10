import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  DUPLICATE_SHARDS,
  FLUFFY_FRIENDS,
  FRIEND_BY_ID,
  type FluffyFriend,
  type Rarity,
} from "@/data/fluffyFriends";
import { DECO_BY_ID, type DecoSlot } from "@/data/cozyShop";
import { localDay, localDayBefore } from "@/lib/date";

/** What each well-being activity pays in Star Coins. */
export const REWARDS = {
  moodEntry: 10, // logging today's feeling (Daily Mood Pet)
  streakBonus: 50, // reaching a 7-day check-in streak
  gameRound: 30, // finishing a Life-Skill Game scenario
  understanding: 20, // completing a self-check (understanding your feelings)
  breathingSession: 10, // a full breathing session
  panicBoxGrounding: 10, // using a self-soothing grounding tool
} as const;

export const GACHA_COST = 100;
export const SHARDS_PER_TICKET = 50;
export const MAX_PLACED = 3;

/**
 * Star Coins, the Fluffy-Friends gacha, and the Cozy Shop.
 *
 * Deliberately kept apart from anything clinical. Rewarding a breathing session
 * or naming a feeling is fine — it celebrates self-care. Rewarding someone for
 * *reporting distress* (an SOS or a report to staff) would put a price on the
 * honesty the rest of the product depends on, so nothing here ever pays for that.
 */

export type EquippedSet = { hat?: string; face?: string; hold?: string };

export type PullResult = {
  friend: FluffyFriend;
  isNew: boolean;
  shardsGained: number;
};

type CheckInResult = { earned: number; streak: number; streakBonus: boolean };

type GamState = {
  coins: number;
  /** Source ids already paid out, so a repeated action can't pay twice. */
  claimed: string[];
  streak: number;
  lastCheckIn: string | null; // YYYY-MM-DD
  friends: Record<string, number>; // friendId → how many owned
  shards: number;
  decorations: string[]; // owned decoration ids
  equipped: Record<string, EquippedSet>; // friendId → what it's wearing
  placed: string[]; // friendIds shown wandering on the home garden
  pity: number; // pulls since the last rare-or-better

  earn: (amount: number, sourceId: string) => boolean;
  spend: (amount: number) => boolean;
  dailyMoodCheckIn: () => CheckInResult;
  pull: () => PullResult | null;
  buyDecoration: (id: string) => boolean;
  equip: (friendId: string, slot: DecoSlot, decoId: string | null) => void;
  togglePlaced: (friendId: string) => void;
  redeemShards: (friendId: string) => boolean;
};

const today = () => localDay();
const yesterday = () => localDayBefore();

/** 10% Super Rare, 30% Rare, 60% Common — with a soft pity so a long dry streak ends kindly. */
function rollRarity(pity: number): Rarity {
  const r = Math.random() * 100;
  let rarity: Rarity = r < 10 ? "superRare" : r < 40 ? "rare" : "common";
  if (pity >= 9 && rarity === "common") rarity = "rare"; // the 10th unlucky pull is guaranteed rare+
  return rarity;
}

function pickFriend(rarity: Rarity): FluffyFriend {
  const pool = FLUFFY_FRIENDS.filter((f) => f.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

export const useGachaStore = create<GamState>()(
  persist(
    (set, get) => ({
      coins: 0,
      claimed: [],
      streak: 0,
      lastCheckIn: null,
      friends: {},
      shards: 0,
      decorations: [],
      equipped: {},
      placed: [],
      pity: 0,

      earn: (amount, sourceId) => {
        if (get().claimed.includes(sourceId)) return false;
        const day = today();
        set((s) => ({
          coins: s.coins + amount,
          // Only today's per-day dedup keys can ever match again — prune the rest
          // so `claimed` can't grow without bound.
          claimed: [...s.claimed.filter((k) => k.endsWith(day) || !/:\d{4}-\d{2}-\d{2}$/.test(k)), sourceId],
        }));
        return true;
      },

      spend: (amount) => {
        if (get().coins < amount) return false;
        set((s) => ({ coins: s.coins - amount }));
        return true;
      },

      dailyMoodCheckIn: () => {
        const s = get();
        const day = today();
        if (s.lastCheckIn === day) {
          return { earned: 0, streak: s.streak, streakBonus: false };
        }
        const streak = s.lastCheckIn === yesterday() ? s.streak + 1 : 1;
        const streakBonus = streak > 0 && streak % 7 === 0;
        const earned = REWARDS.moodEntry + (streakBonus ? REWARDS.streakBonus : 0);
        set({ coins: s.coins + earned, streak, lastCheckIn: day });
        return { earned, streak, streakBonus };
      },

      pull: () => {
        const s = get();
        if (s.coins < GACHA_COST) return null;

        const rarity = rollRarity(s.pity);
        const friend = pickFriend(rarity);
        const isNew = !s.friends[friend.id];
        const shardsGained = isNew ? 0 : DUPLICATE_SHARDS[rarity];

        set({
          coins: s.coins - GACHA_COST,
          pity: rarity === "common" ? s.pity + 1 : 0,
          friends: { ...s.friends, [friend.id]: (s.friends[friend.id] ?? 0) + 1 },
          shards: s.shards + shardsGained,
        });
        return { friend, isNew, shardsGained };
      },

      buyDecoration: (id) => {
        const s = get();
        const deco = DECO_BY_ID[id];
        if (!deco || s.decorations.includes(id) || s.coins < deco.price) return false;
        set({ coins: s.coins - deco.price, decorations: [...s.decorations, id] });
        return true;
      },

      equip: (friendId, slot, decoId) => {
        const s = get();
        // Only equip a decoration you own that fits the slot; null clears it.
        if (decoId && (!s.decorations.includes(decoId) || DECO_BY_ID[decoId]?.slot !== slot)) return;
        const current = s.equipped[friendId] ?? {};
        const next: EquippedSet = { ...current };
        if (decoId) next[slot] = decoId;
        else delete next[slot];
        set({ equipped: { ...s.equipped, [friendId]: next } });
      },

      togglePlaced: (friendId) => {
        const s = get();
        if (!s.friends[friendId]) return; // can only place a friend you own
        if (s.placed.includes(friendId)) {
          set({ placed: s.placed.filter((id) => id !== friendId) });
        } else if (s.placed.length < MAX_PLACED) {
          set({ placed: [...s.placed, friendId] });
        }
      },

      redeemShards: (friendId) => {
        const s = get();
        const friend = FRIEND_BY_ID[friendId];
        if (!friend || friend.rarity !== "superRare" || s.shards < SHARDS_PER_TICKET) return false;
        if (s.friends[friendId]) return false; // a ticket only ever grants a friend you don't have yet
        set({
          shards: s.shards - SHARDS_PER_TICKET,
          friends: { ...s.friends, [friendId]: 1 },
        });
        return true;
      },
    }),
    {
      name: "swb.gacha",
      // Persist only data — never the action functions.
      partialize: (s) => ({
        coins: s.coins,
        claimed: s.claimed,
        streak: s.streak,
        lastCheckIn: s.lastCheckIn,
        friends: s.friends,
        shards: s.shards,
        decorations: s.decorations,
        equipped: s.equipped,
        placed: s.placed,
        pity: s.pity,
      }),
    },
  ),
);
