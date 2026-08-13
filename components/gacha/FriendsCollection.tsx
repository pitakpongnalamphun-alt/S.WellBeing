"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Ticket, X } from "lucide-react";

import { DecoSprite } from "@/components/gacha/DecoSprite";
import { FriendAvatar } from "@/components/gacha/FriendAvatar";
import {
  FLUFFY_FRIENDS,
  FRIEND_BY_ID,
  PUY_FRIEND,
  RARITY_META,
  type FluffyFriend,
  type Rarity,
} from "@/data/fluffyFriends";
import { DECORATIONS, DECO_SLOTS } from "@/data/cozyShop";
import {
  MAX_PLACED,
  SHARDS_PER_TICKET,
  useGachaStore,
  type EquippedSet,
} from "@/lib/store/useGachaStore";

const RARITY_ORDER: Rarity[] = ["common", "rare", "superRare"];
const EASE = [0.4, 0, 0.2, 1] as [number, number, number, number];
const SOFT = { duration: 0.3, ease: EASE };

const EMPTY_COUNTS: Record<string, number> = {};
const EMPTY_EQUIP: Record<string, EquippedSet> = {};
const EMPTY_LIST: string[] = [];

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function FriendsCollection({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // --- store reads (guarded until rehydrated) ---
  const friendsRaw = useGachaStore((s) => s.friends);
  const shardsRaw = useGachaStore((s) => s.shards);
  const decorationsRaw = useGachaStore((s) => s.decorations);
  const equippedRaw = useGachaStore((s) => s.equipped);
  const placedRaw = useGachaStore((s) => s.placed);
  const equip = useGachaStore((s) => s.equip);
  const togglePlaced = useGachaStore((s) => s.togglePlaced);
  const redeemShards = useGachaStore((s) => s.redeemShards);

  const friends = mounted ? friendsRaw : EMPTY_COUNTS;
  const shards = mounted ? shardsRaw : 0;
  const decorations = mounted ? decorationsRaw : EMPTY_LIST;
  const equipped = mounted ? equippedRaw : EMPTY_EQUIP;
  const placed = mounted ? placedRaw : EMPTY_LIST;

  // --- local ui state ---
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [celebrate, setCelebrate] = useState<FluffyFriend | null>(null);

  useEffect(() => {
    if (!celebrate) return;
    const t = setTimeout(() => setCelebrate(null), 2400);
    return () => clearTimeout(t);
  }, [celebrate]);

  // นับเฉพาะตัวที่อยู่ในพูลกาชาจริง — ปุยแต่งตัวได้แต่ไม่ใช่ของสะสม ถ้านับรวมเข้ามา
  // ตัวเลขจะกลายเป็น 16/15 และแถบความคืบหน้าจะล้นกรอบ
  const ownedCount = FLUFFY_FRIENDS.filter((f) => (friends[f.id] ?? 0) > 0).length;
  const canRedeem = shards >= SHARDS_PER_TICKET;
  const superRares = FLUFFY_FRIENDS.filter((f) => f.rarity === "superRare");

  const selectedFriend = selectedId ? FRIEND_BY_ID[selectedId] : null;
  const selectedEquip: EquippedSet = selectedId ? equipped[selectedId] ?? {} : {};
  const selectedPlaced = selectedId ? placed.includes(selectedId) : false;
  const gardenFull = placed.length >= MAX_PLACED;

  const openFriend = (id: string) => {
    if ((friends[id] ?? 0) > 0) setSelectedId(id);
  };

  const doRedeem = (id: string) => {
    if (redeemShards(id)) {
      setShowPicker(false);
      setCelebrate(FRIEND_BY_ID[id]);
    }
  };

  return (
    <div className={cx("w-full", className)}>
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-b from-violet-50 to-white p-5 ring-1 ring-slate-100 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-700">แก๊งเพื่อนปุยของฉัน</h2>
            <p className="mt-0.5 text-sm text-slate-400">แตะเพื่อนที่ปลดล็อกแล้วเพื่อแต่งตัวให้น้อง 💕</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1.5 text-sm font-semibold text-violet-700">
            <Sparkles className="h-4 w-4" />
            {mounted ? shards : "—"}
          </span>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>สะสมแล้ว</span>
            <span>{mounted ? ownedCount : "—"}/15</span>
          </div>
          <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-violet-100">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-300 to-fuchsia-300"
              initial={false}
              animate={{ width: `${(mounted ? ownedCount : 0) / 15 * 100}%` }}
              transition={SOFT}
            />
          </div>
        </div>
      </div>

      {/* Shard redeem */}
      <div className="mt-4">
        {canRedeem ? (
          <div className="rounded-3xl bg-gradient-to-b from-amber-50 to-white p-4 ring-1 ring-amber-100 shadow-sm">
            <button
              onClick={() => setShowPicker((v) => !v)}
              className="flex w-full items-center gap-3 text-left"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-600">
                <Ticket className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-bold text-amber-700">
                  แลกตั๋วเลือกเพื่อน Super Rare
                </span>
                <span className="block text-xs text-amber-500">
                  ใช้ {SHARDS_PER_TICKET} เศษดาว · เลือกน้องที่อยากได้เลย
                </span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                <Sparkles className="h-3.5 w-3.5" />
                {shards}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {showPicker && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={SOFT}
                  className="overflow-hidden"
                >
                  <div className="mt-3 grid grid-cols-4 gap-2 pt-1">
                    {superRares.map((f) => {
                      // A ticket only grants a friend you don't have yet — owned
                      // ones are shown as already-collected, not tappable.
                      const owned = (friends[f.id] ?? 0) > 0;
                      return (
                        <button
                          key={f.id}
                          disabled={owned}
                          onClick={() => doRedeem(f.id)}
                          className={cx(
                            "relative flex flex-col items-center gap-1 rounded-2xl p-2 shadow-sm transition",
                            owned
                              ? "cursor-default bg-slate-50 ring-1 ring-slate-100"
                              : "bg-white ring-1 ring-amber-100 active:scale-95",
                          )}
                        >
                          {owned && (
                            <span className="absolute right-1 top-1 z-10 rounded-full bg-emerald-400 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
                              มีแล้ว
                            </span>
                          )}
                          <FriendAvatar friend={f} size={44} unowned={!owned} />
                          <span
                            className={cx(
                              "line-clamp-1 text-[10px] font-medium",
                              owned ? "text-slate-300" : "text-slate-500",
                            )}
                          >
                            {f.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-500">
                <Sparkles className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-600">สะสมเศษดาวไว้แลกเพื่อน Super Rare</p>
                <p className="text-xs text-slate-400">
                  {mounted ? `อีก ${SHARDS_PER_TICKET - shards} เศษดาวจะแลกได้` : "กำลังโหลด…"}
                </p>
              </div>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-violet-100">
              <motion.div
                className="h-full rounded-full bg-violet-300"
                initial={false}
                animate={{ width: `${Math.min(1, shards / SHARDS_PER_TICKET) * 100}%` }}
                transition={SOFT}
              />
            </div>
          </div>
        )}
      </div>

      {/* ปุยอยู่บนสุดและปลดล็อกเสมอ — ตัวที่นักเรียนคุยด้วยทุกวันไม่ควรถูกล็อกไว้หลังการสุ่ม */}
      <button
        onClick={() => openFriend(PUY_FRIEND.id)}
        className="mt-5 flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm ring-1 ring-rose-100 transition active:scale-[0.99]"
      >
        <FriendAvatar
          friend={PUY_FRIEND}
          size={54}
          equipped={equipped[PUY_FRIEND.id]}
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-slate-700">แต่งตัวให้น้องปุย</span>
          <span className="block text-xs text-slate-400">{PUY_FRIEND.desc}</span>
        </span>
      </button>

      {/* Rarity sections */}
      <div className="mt-5 space-y-6">
        {RARITY_ORDER.map((rarity) => {
          const meta = RARITY_META[rarity];
          const group = FLUFFY_FRIENDS.filter((f) => f.rarity === rarity);
          return (
            <section key={rarity}>
              <div className="mb-3 flex items-center gap-2">
                <span className={cx("rounded-full px-2.5 py-1 text-xs font-bold", meta.chip)}>
                  {meta.label}
                </span>
                <span className="text-xs text-slate-300">
                  {mounted ? group.filter((f) => (friends[f.id] ?? 0) > 0).length : 0}/{group.length}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {group.map((f) => {
                  const count = friends[f.id] ?? 0;
                  const owned = count > 0;
                  return (
                    <button
                      key={f.id}
                      disabled={!owned}
                      onClick={() => openFriend(f.id)}
                      className={cx(
                        "relative flex flex-col items-center gap-1.5 rounded-2xl p-3 transition",
                        owned
                          ? "bg-white ring-1 ring-slate-100 shadow-sm active:scale-95"
                          : "bg-slate-50/70 ring-1 ring-slate-100 cursor-default",
                      )}
                    >
                      {count > 1 && (
                        <span className="absolute right-1.5 top-1.5 z-10 rounded-full bg-violet-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                          ×{count}
                        </span>
                      )}
                      <FriendAvatar
                        friend={f}
                        size={64}
                        equipped={equipped[f.id]}
                        unowned={!owned}
                      />
                      <span
                        className={cx(
                          "line-clamp-1 text-[11px] font-medium",
                          owned ? "text-slate-600" : "text-slate-300",
                        )}
                      >
                        {owned ? f.name : "???"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Decorator modal */}
      <AnimatePresence>
        {selectedFriend && selectedId && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/30 p-3 backdrop-blur-sm sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={SOFT}
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-3xl bg-gradient-to-b from-violet-50 to-white p-5 shadow-xl ring-1 ring-slate-100"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={SOFT}
              onClick={(e) => e.stopPropagation()}
            >
              {/* header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-700">{selectedFriend.name}</h3>
                  <p className="mt-0.5 text-xs text-slate-400">{selectedFriend.desc}</p>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-slate-400 ring-1 ring-slate-100 transition active:scale-95"
                  aria-label="ปิด"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* big preview */}
              <div className="mt-3 grid place-items-center rounded-3xl bg-white/70 py-5 ring-1 ring-slate-100">
                <FriendAvatar friend={selectedFriend} size={120} equipped={selectedEquip} />
              </div>

              {/* slots */}
              <div className="mt-4 space-y-4">
                {DECO_SLOTS.map(({ slot, label, emoji }) => {
                  const ownedDecos = DECORATIONS.filter(
                    (d) => d.slot === slot && decorations.includes(d.id),
                  );
                  const current = selectedEquip[slot];
                  return (
                    <div key={slot}>
                      <p className="mb-1.5 text-xs font-semibold text-slate-500">
                        {emoji} {label}
                      </p>
                      {ownedDecos.length === 0 ? (
                        <p className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-400">
                          ยังไม่มีของหมวดนี้ ไปที่ร้านค้าได้นะ
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => equip(selectedId, slot, null)}
                            className={cx(
                              "rounded-full px-3 py-1.5 text-xs font-medium transition active:scale-95",
                              !current
                                ? "bg-violet-500 text-white shadow-sm"
                                : "bg-white text-slate-400 ring-1 ring-slate-100",
                            )}
                          >
                            ถอด
                          </button>
                          {ownedDecos.map((d) => {
                            const on = current === d.id;
                            return (
                              <button
                                key={d.id}
                                onClick={() => equip(selectedId, slot, on ? null : d.id)}
                                title={d.name}
                                className={cx(
                                  "grid h-9 w-9 place-items-center rounded-full text-lg transition active:scale-95",
                                  on
                                    ? "bg-violet-100 ring-2 ring-violet-300"
                                    : "bg-white ring-1 ring-slate-100",
                                )}
                              >
                                <DecoSprite id={d.id} size={26} fallback={d.emoji} />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* garden toggle */}
              <div className="mt-5">
                <button
                  onClick={() => togglePlaced(selectedId)}
                  disabled={!selectedPlaced && gardenFull}
                  className={cx(
                    "w-full rounded-full px-4 py-2.5 text-sm font-semibold transition active:scale-95",
                    selectedPlaced
                      ? "bg-emerald-500 text-white shadow-sm"
                      : gardenFull
                        ? "cursor-not-allowed bg-slate-100 text-slate-300"
                        : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
                  )}
                >
                  {selectedPlaced ? "อยู่ในสวนแล้ว 🌿 (แตะเพื่อเอาออก)" : "วางไว้ในสวน 🌿"}
                </button>
                {!selectedPlaced && gardenFull && (
                  <p className="mt-1.5 text-center text-xs text-slate-400">
                    สวนเต็มแล้ว (สูงสุด {MAX_PLACED} ตัว)
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Redeem celebration */}
      <AnimatePresence>
        {celebrate && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/30 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={SOFT}
            onClick={() => setCelebrate(null)}
          >
            <motion.div
              className="flex flex-col items-center gap-3 rounded-3xl bg-gradient-to-b from-amber-50 to-white px-8 py-7 text-center shadow-xl ring-1 ring-amber-100"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={SOFT}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500">
                <Sparkles className="h-4 w-4" /> ยินดีต้อนรับน้องใหม่!
              </span>
              <FriendAvatar friend={celebrate} size={104} />
              <p className="text-base font-bold text-slate-700">{celebrate.name}</p>
              <p className="max-w-[16rem] text-xs text-slate-400">{celebrate.desc}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FriendsCollection;
