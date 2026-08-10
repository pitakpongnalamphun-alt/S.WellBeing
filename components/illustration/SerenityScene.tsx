import { EmotionBlob, type BlobSpec } from "./EmotionBlob";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Sunrise over a still lake, with the five tracked emotions gathered on the
 * shore. Drawn rather than photographed: a photo would fix one mood, and the
 * point is that all five belong in the same landscape.
 *
 * Scene space is 600 × 520 — close to the aspect of the slot it fills, so the
 * `slice` fit crops only a sliver. It is anchored bottom-centre, which means
 * any crop eats empty sky and never the characters.
 */

const SCENE_W = 600;
const SCENE_H = 470;
const HORIZON = 172;

/**
 * Back to front, and every one of them runs off the bottom of the frame —
 * they are standing in the scene, not arranged on it. Overlap is deliberate:
 * feelings crowd each other.
 */
const BLOBS: BlobSpec[] = [
  {
    key: "spark",
    shape: "wave",
    cx: 240,
    top: 240,
    bottom: 520,
    rx: 88,
    faceY: 314,
    color: "var(--color-spark)",
    delay: 0,
  },
  {
    key: "calm",
    shape: "arch",
    cx: 445,
    top: 275,
    bottom: 520,
    rx: 78,
    faceY: 337,
    color: "var(--color-calm)",
    delay: 1.6,
  },
  {
    key: "joy",
    shape: "dome",
    cx: 78,
    top: 252,
    bottom: 530,
    rx: 100,
    faceY: 317,
    color: "var(--color-joy)",
    delay: 0.8,
  },
  {
    key: "ache",
    shape: "slab",
    cx: 295,
    top: 350,
    bottom: 535,
    rx: 90,
    faceY: 410,
    color: "var(--color-ache)",
    delay: 2.4,
  },
  {
    key: "storm",
    shape: "ripple",
    cx: 500,
    top: 362,
    bottom: 535,
    rx: 100,
    faceY: 418,
    color: "var(--color-storm)",
    delay: 3.2,
  },
];

type SerenitySceneProps = {
  emotions: Dictionary["emotions"];
  className?: string;
};

export function SerenityScene({ emotions, className }: SerenitySceneProps) {
  return (
    <svg
      viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
      preserveAspectRatio="xMidYMax slice"
      className={className}
      role="img"
      aria-label="Sunrise over a lake, with five characters showing different feelings gathered on the shore."
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F9F4EA" />
          <stop offset="100%" stopColor="#F1EADD" />
        </linearGradient>

        <radialGradient id="sunGlow">
          <stop offset="0%" stopColor="var(--color-sky-glow)" stopOpacity="0.85" />
          <stop offset="55%" stopColor="var(--color-sky-glow)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--color-sky-glow)" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="sunDisc">
          <stop offset="0%" stopColor="#FEF6E7" />
          <stop offset="100%" stopColor="var(--color-sun)" />
        </radialGradient>

        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-water)" />
          <stop offset="100%" stopColor="var(--color-water-deep)" />
        </linearGradient>

        <linearGradient id="shore" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EEE8DC" />
          <stop offset="100%" stopColor="var(--color-shore)" />
        </linearGradient>

        {/* Haze at the waterline — the layer that sells depth. */}
        <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F7F2E8" stopOpacity="0" />
          <stop offset="100%" stopColor="#F7F2E8" stopOpacity="0.72" />
        </linearGradient>
      </defs>

      {/* -- Sky ------------------------------------------------------------ */}
      <rect width={SCENE_W} height={HORIZON} fill="url(#sky)" />
      {/* Disc top at y=22, bottom at y=106 — it clears the highest ridge (88)
          by enough to read as a whole sun, and dips behind it just enough to
          read as sunrise rather than midday. */}
      <circle cx="432" cy="64" r="118" fill="url(#sunGlow)" />
      <circle cx="432" cy="64" r="42" fill="url(#sunDisc)" />

      {/* -- Ridges, far to near -------------------------------------------- */}
      <path
        d="M0 118 C 72 96 136 80 210 90 C 286 100 330 88 410 92 C 480 96 538 108 600 116 L600 172 L0 172 Z"
        fill="var(--color-ridge-far)"
        opacity="0.55"
      />
      <path
        d="M0 146 C 82 130 148 116 230 126 C 310 134 370 86 442 94 C 508 101 556 122 600 132 L600 172 L0 172 Z"
        fill="var(--color-ridge-mid)"
        opacity="0.78"
      />
      <path
        d="M0 165 C 98 152 172 163 260 158 C 348 153 410 142 484 149 C 534 153 570 160 600 164 L600 172 L0 172 Z"
        fill="var(--color-ridge-near)"
        opacity="0.85"
      />
      <rect y="135" width={SCENE_W} height={HORIZON - 135} fill="url(#mist)" />

      {/* -- Lake ------------------------------------------------------------ */}
      <rect
        y={HORIZON}
        width={SCENE_W}
        height={SCENE_H - HORIZON}
        fill="url(#water)"
      />
      {/* The sun's reflection, broken into strokes so the water reads still-but-alive. */}
      <g stroke="#F6E6CE" strokeLinecap="round" opacity="0.5">
        <path d="M376 190 h116" strokeWidth="3" />
        <path d="M396 206 h76" strokeWidth="2.5" opacity="0.8" />
        <path d="M370 224 h58" strokeWidth="2" opacity="0.6" />
        <path d="M418 242 h48" strokeWidth="2" opacity="0.45" />
      </g>
      <g stroke="#FFFFFF" strokeLinecap="round" strokeWidth="2" opacity="0.18">
        <path d="M46 202 h78" />
        <path d="M140 228 h58" />
        <path d="M30 254 h48" />
      </g>

      {/* -- Shore ----------------------------------------------------------- */}
      <path
        d={`M0 320 C 132 310 306 352 ${SCENE_W} 410 L${SCENE_W} ${SCENE_H} L0 ${SCENE_H} Z`}
        fill="url(#shore)"
      />

      {/* -- The five -------------------------------------------------------- */}
      {BLOBS.map((spec) => (
        <EmotionBlob key={spec.key} spec={spec} label={emotions[spec.key]} />
      ))}
    </svg>
  );
}
