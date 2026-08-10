"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sprout, ArrowRight } from "lucide-react";

import { FriendAvatar } from "@/components/gacha/FriendAvatar";
import { FRIEND_BY_ID } from "@/data/fluffyFriends";
import { useGachaStore } from "@/lib/store/useGachaStore";

/**
 * "สวนของฉัน" — a layered paper-cut valley the placed friends drift across.
 * Back to front: sky + sun → far/near mountains → hills → a winding river with
 * a sun-glint → a meadow "stage" with tiny flowers → trees framing the flanks →
 * the friends on top. Every coordinate is a constant so the server and first
 * client paint are byte-identical (no hydration mismatch); only three whisper-
 * slow motions play, and each rests on a pretty still when rAF is paused.
 */

/** Where each placed friend sits + how it drifts. Up to MAX_PLACED (3) spots. */
const SPOTS = [
  { left: "17%", top: "52%", drift: 9, bob: 10, rot: 3, delay: 0 },
  { left: "49%", top: "44%", drift: 7, bob: 12, rot: -3, delay: 0.8 },
  { left: "82%", top: "53%", drift: 8, bob: 10, rot: 2.5, delay: 1.5 },
] as const;

/** Deterministic flowers — only in the outer zones so the centre stage stays open. */
const FLOWERS = [
  { x: 24, y: 150, c: "#FCD34D" },
  { x: 54, y: 163, c: "#FBCFE8" },
  { x: 96, y: 145, c: "#FCD34D" },
  { x: 304, y: 149, c: "#FBCFE8" },
  { x: 334, y: 162, c: "#FCD34D" },
  { x: 368, y: 150, c: "#FBCFE8" },
] as const;

/** A soft rounded paper-cut tree: tan trunk + stacked canopy blobs with a highlight. */
function Tree({ x, groundY, h }: { x: number; groundY: number; h: number }) {
  const cr = h * 0.42;
  const topY = groundY - h;
  const trunkH = h * 0.42;
  return (
    <g>
      <rect x={x - 2} y={groundY - trunkH} width={4} height={trunkH} rx={2} fill="#C1A079" />
      <circle cx={x} cy={topY + cr} r={cr} fill="#52B98D" />
      <circle cx={x - cr * 0.55} cy={topY + cr * 1.35} r={cr * 0.8} fill="#7ECDAB" />
      <circle cx={x + cr * 0.35} cy={topY + cr * 0.7} r={cr * 0.45} fill="#A7F3D0" opacity={0.75} />
    </g>
  );
}

export function HomeGarden({
  className,
  onOpenRewards,
}: {
  className?: string;
  onOpenRewards?: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduce = useReducedMotion();
  const play = mounted && !reduce; // ambient motion only after mount, honouring reduced-motion

  const placed = useGachaStore((s) => s.placed);
  const equipped = useGachaStore((s) => s.equipped);

  const friends = mounted
    ? placed.map((id) => FRIEND_BY_ID[id]).filter(Boolean)
    : [];
  const isEmpty = friends.length === 0;

  return (
    <section
      className={[
        "relative overflow-hidden rounded-3xl bg-emerald-50 ring-1 ring-emerald-100/70 shadow-sm",
        className ?? "",
      ]
        .join(" ")
        .trim()}
    >
      {/* ── Scenery (inline SVG, byte-identical every render) ─────────────── */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="hg-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ECFDF5" />
            <stop offset="55%" stopColor="#F0FDFA" />
            <stop offset="100%" stopColor="#EAF6FF" />
          </linearGradient>
          <radialGradient id="hg-sun">
            <stop offset="0%" stopColor="#FEF6DD" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FEF6DD" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hg-river" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#BFE6FB" />
            <stop offset="100%" stopColor="#A9DCF6" />
          </linearGradient>
          <linearGradient id="hg-meadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#74CCA6" />
            <stop offset="100%" stopColor="#5FBF95" />
          </linearGradient>
          <radialGradient id="hg-glint">
            <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FCD34D" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* sky */}
        <rect x="0" y="0" width="400" height="200" fill="url(#hg-sky)" />

        {/* sun (static — the calm anchor) */}
        <circle cx="340" cy="42" r="46" fill="url(#hg-sun)" />
        <circle cx="340" cy="42" r="19" fill="#FDE9B3" />

        {/* clouds */}
        <g fill="#F8FCFF" opacity="0.85">
          <ellipse cx="250" cy="36" rx="14" ry="8" />
          <ellipse cx="264" cy="31" rx="18" ry="11" />
          <ellipse cx="280" cy="36" rx="13" ry="8" />
        </g>
        <motion.g
          fill="#F8FCFF"
          opacity="0.85"
          animate={play ? { x: [0, 20, 0] } : undefined}
          transition={play ? { duration: 34, repeat: Infinity, ease: "easeInOut" } : undefined}
        >
          <ellipse cx="78" cy="48" rx="15" ry="9" />
          <ellipse cx="94" cy="42" rx="20" ry="12" />
          <ellipse cx="112" cy="48" rx="15" ry="9" />
        </motion.g>

        {/* far mountains (palest, furthest) */}
        <path
          d="M0,106 L0,92 Q40,66 80,90 Q120,74 165,90 Q205,72 250,90 Q295,74 340,90 Q372,96 400,92 L400,106 Z"
          fill="#C7E6EC"
          opacity="0.9"
        />
        <path
          d="M0,92 Q40,66 80,90 Q120,74 165,90 Q205,72 250,90 Q295,74 340,90 Q372,96 400,92"
          fill="none"
          stroke="#DEF1F3"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* near mountains */}
        <path
          d="M0,120 L0,108 Q60,88 120,108 Q180,120 240,106 Q300,92 360,110 L400,112 L400,120 Z"
          fill="#B7E1D6"
        />

        {/* mid hills (valley dip in the centre) */}
        <path
          d="M0,128 L0,118 Q50,106 110,118 Q160,126 220,120 Q290,110 340,120 L400,122 L400,128 Z"
          fill="#9FDCC2"
        />
        <path
          d="M0,118 Q50,106 110,118 Q160,126 220,120 Q290,110 340,120 L400,122"
          fill="none"
          stroke="#BCE8D6"
          strokeWidth="1.5"
        />

        {/* river (winds behind the meadow) */}
        <path
          d="M70,124 C120,108 175,120 220,115 C270,109 320,120 380,112 L380,122 C320,130 270,119 220,125 C175,130 120,118 70,134 Z"
          fill="url(#hg-river)"
        />
        <path
          d="M75,123 C123,109 176,120 221,115 C270,110 320,120 377,113"
          fill="none"
          stroke="#EAF7FF"
          strokeWidth="1.2"
          opacity="0.85"
        />
        {/* sun-glint on the water (the wow) */}
        <motion.g
          animate={play ? { x: [0, 3, 0], opacity: [0.45, 0.75, 0.45] } : undefined}
          transition={play ? { duration: 6, repeat: Infinity, ease: "easeInOut" } : undefined}
        >
          <ellipse cx="300" cy="119" rx="16" ry="4" fill="url(#hg-glint)" opacity="0.55" />
        </motion.g>

        {/* meadow (the friend stage) */}
        <path
          d="M0,200 L0,126 Q100,121 200,125 Q300,129 400,123 L400,200 Z"
          fill="url(#hg-meadow)"
        />
        <path
          d="M0,126 Q100,121 200,125 Q300,129 400,123"
          fill="none"
          stroke="#90D8BC"
          strokeWidth="2.5"
        />

        {/* flowers (outer zones only) */}
        {FLOWERS.map((f, i) => (
          <g key={i}>
            <circle cx={f.x} cy={f.y} r="2.4" fill={f.c} />
            <circle cx={f.x} cy={f.y} r="0.8" fill="#ffffff" />
          </g>
        ))}

        {/* trees framing the flanks (gentle sway) */}
        <motion.g
          style={{ transformBox: "fill-box", transformOrigin: "center bottom" }}
          animate={play ? { rotate: [-1, 1, -1] } : undefined}
          transition={play ? { duration: 8, repeat: Infinity, ease: "easeInOut" } : undefined}
        >
          <Tree x={22} groundY={128} h={22} />
          <Tree x={44} groundY={130} h={30} />
          <Tree x={62} groundY={129} h={20} />
        </motion.g>
        <motion.g
          style={{ transformBox: "fill-box", transformOrigin: "center bottom" }}
          animate={play ? { rotate: [1, -1, 1] } : undefined}
          transition={play ? { duration: 9, repeat: Infinity, ease: "easeInOut" } : undefined}
        >
          <Tree x={344} groundY={128} h={26} />
          <Tree x={366} groundY={129} h={20} />
        </motion.g>
      </svg>

      {/* ── header ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-1.5">
          <Sprout className="h-4 w-4 text-emerald-500" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-emerald-800">สวนของฉัน</h3>
        </div>
        {onOpenRewards && (
          <button
            type="button"
            onClick={onOpenRewards}
            className="group flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm backdrop-blur-sm transition active:scale-95 hover:bg-white"
          >
            ไปสะสมเพื่อน
            <ArrowRight
              className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      {/* ── the friends (on top of the scenery) ──────────────────────────── */}
      <div className="relative z-10 h-[146px]">
        {isEmpty ? (
          <div className="absolute inset-0 grid place-items-end justify-center px-6 pb-4">
            <p className="rounded-2xl bg-white/70 px-3 py-2 text-center text-xs leading-relaxed text-emerald-800 shadow-sm backdrop-blur-sm">
              ยังไม่มีเพื่อนมาอยู่ในสวนเลย 🌱 ไปหมุนกาชาแล้วเลือก
              &lsquo;วางไว้ในสวน&rsquo; กันเถอะ!
            </p>
          </div>
        ) : (
          friends.map((friend, i) => {
            const spot = SPOTS[i % SPOTS.length];
            return (
              <motion.div
                key={friend.id}
                className="absolute"
                style={{ left: spot.left, top: spot.top, x: "-50%", y: "-50%" }}
                animate={{
                  y: ["-50%", "calc(-50% - " + spot.bob + "px)", "-50%"],
                  x: [
                    "-50%",
                    "calc(-50% + " + spot.drift + "px)",
                    "calc(-50% - " + spot.drift + "px)",
                    "-50%",
                  ],
                  rotate: [0, spot.rot, -spot.rot, 0],
                }}
                transition={{
                  duration: 6 + i * 0.9,
                  ease: [0.4, 0, 0.2, 1],
                  repeat: Infinity,
                  repeatType: "loop",
                  delay: spot.delay,
                }}
              >
                <FriendAvatar
                  friend={friend}
                  equipped={equipped[friend.id]}
                  size={54}
                />
              </motion.div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default HomeGarden;
