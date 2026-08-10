import type { CSSProperties } from "react";

export type Expression = "joy" | "spark" | "calm" | "ache" | "storm";

type Silhouette = "dome" | "wave" | "arch" | "slab" | "ripple";

export type BlobSpec = {
  key: Expression;
  /** Each character owns a body shape; the silhouette is part of the identity. */
  shape: Silhouette;
  cx: number;
  /** Highest point of the body, in scene units. */
  top: number;
  /** Lowest point. Pushing this past the frame is intended — they sit in it. */
  bottom: number;
  rx: number;
  /** Centre of the face. Sits high on the body, not at its midpoint. */
  faceY: number;
  /** Design-token colour, e.g. `var(--color-joy)`. */
  color: string;
  /** Seconds of offset so the five never breathe in lockstep. */
  delay: number;
};

/* -- Palette --------------------------------------------------------------- */

const PUPIL = "#14110F";
const FEATURE = "#14110F"; // brows, closed eyes, line mouths
const SCLERA = "#FFFFFF";
const SCLERA_WARM = "#F8E8DD"; // the red one's eyes are cream, not white
const LIP = "#A8481F"; // joy's mouth rim
const THROAT = "#5E2C1C"; // spark's open mouth
const TEETH = "#FFFFFF";

/* -- Bodies ----------------------------------------------------------------
   Each returns a closed path. Sides run straight to `bottom` because every
   body is clipped by the frame — the silhouette lives entirely in its top edge.
   -------------------------------------------------------------------------- */

type Body = (cx: number, top: number, bottom: number, rx: number) => string;

/**
 * Cubic control points that peak at exactly `top`: for a symmetric curve the
 * apex sits at (y0 + 3·yc) / 4, so yc = (4·top − y0) / 3.
 */
function apexControl(top: number, y0: number) {
  return (4 * top - y0) / 3;
}

const BODIES: Record<Silhouette, Body> = {
  /** A broad hill. Joy takes up the most room of the five. */
  dome(cx, top, bottom, rx) {
    const y0 = top + (bottom - top) * 0.46;
    const yc = apexControl(top, y0);
    return `M ${cx - rx} ${bottom} L ${cx - rx} ${y0} C ${cx - rx} ${yc} ${cx + rx} ${yc} ${cx + rx} ${y0} L ${cx + rx} ${bottom} Z`;
  },

  /** Rounded, with one shoulder higher than the other — spark leans forward. */
  wave(cx, top, bottom, rx) {
    const h = bottom - top;
    return [
      `M ${cx - rx} ${bottom}`,
      `L ${cx - rx} ${top + h * 0.42}`,
      `C ${cx - rx} ${top + h * 0.1} ${cx - rx * 0.6} ${top - h * 0.02} ${cx - rx * 0.1} ${top + h * 0.01}`,
      `C ${cx + rx * 0.34} ${top + h * 0.03} ${cx + rx * 0.78} ${top + h * 0.06} ${cx + rx} ${top + h * 0.34}`,
      `L ${cx + rx} ${bottom}`,
      "Z",
    ].join(" ");
  },

  /** Tall and narrow with a semicircular cap. Calm stands upright. */
  arch(cx, top, bottom, rx) {
    const y0 = top + rx * 0.92;
    const yc = apexControl(top, y0);
    return `M ${cx - rx} ${bottom} L ${cx - rx} ${y0} C ${cx - rx} ${yc} ${cx + rx} ${yc} ${cx + rx} ${y0} L ${cx + rx} ${bottom} Z`;
  },

  /** A rounded square. Ache is the only one with corners. */
  slab(cx, top, bottom, rx) {
    const r = rx * 0.52;
    return [
      `M ${cx - rx} ${bottom}`,
      `L ${cx - rx} ${top + r}`,
      `Q ${cx - rx} ${top} ${cx - rx + r} ${top}`,
      `L ${cx + rx - r} ${top}`,
      `Q ${cx + rx} ${top} ${cx + rx} ${top + r}`,
      `L ${cx + rx} ${bottom}`,
      "Z",
    ].join(" ");
  },

  /** Three soft crests. Storm is the only body that is visibly agitated. */
  ripple(cx, top, bottom, rx) {
    const h = bottom - top;
    return [
      `M ${cx - rx} ${bottom}`,
      `L ${cx - rx} ${top + h * 0.36}`,
      `C ${cx - rx} ${top + h * 0.12} ${cx - rx * 0.72} ${top + h * 0.01} ${cx - rx * 0.42} ${top + h * 0.11}`,
      `C ${cx - rx * 0.2} ${top + h * 0.19} ${cx - rx * 0.08} ${top + h * 0.02} ${cx + rx * 0.16} ${top + h * 0.02}`,
      `C ${cx + rx * 0.44} ${top + h * 0.02} ${cx + rx * 0.6} ${top + h * 0.18} ${cx + rx * 0.84} ${top + h * 0.12}`,
      `C ${cx + rx * 0.94} ${top + h * 0.09} ${cx + rx} ${top + h * 0.2} ${cx + rx} ${top + h * 0.34}`,
      `L ${cx + rx} ${bottom}`,
      "Z",
    ].join(" ");
  },
};

/* -- Face parts ------------------------------------------------------------
   Drawn in a local space centred on (0,0) and sized for a body of rx 70, then
   scaled to fit. A face never needs to know how big its blob is.
   -------------------------------------------------------------------------- */

type Eye = { x: number; y: number; r: number; px: number; py: number };

function RoundEyes({ eyes, sclera = SCLERA }: { eyes: [Eye, Eye]; sclera?: string }) {
  return (
    <>
      {eyes.map((eye, i) => (
        <g key={i}>
          <circle cx={eye.x} cy={eye.y} r={eye.r} fill={sclera} />
          <circle cx={eye.px} cy={eye.py} r={eye.r * 0.66} fill={PUPIL} />
        </g>
      ))}
    </>
  );
}

function Face({ variant, uid }: { variant: Expression; uid: string }) {
  switch (variant) {
    /* Eyes shut in a grin, and a wide open smile rimmed in rust. The rim is
       what makes this mouth read as joyful rather than merely open. */
    case "joy":
      return (
        <>
          <g
            fill="none"
            stroke={FEATURE}
            strokeWidth={8}
            strokeLinecap="round"
          >
            <path d="M -36 -16 A 12 12 0 0 1 -12 -16" />
            <path d="M 12 -16 A 12 12 0 0 1 36 -16" />
          </g>
          <path d="M -31 3 A 31 26 0 0 0 31 3 Z" fill={LIP} />
          <path d="M -24 12 A 24 17 0 0 0 24 12 Z" fill={TEETH} />
        </>
      );

    /* Mismatched eyes — the asymmetry is the character, not an accident. */
    case "spark":
      return (
        <>
          <RoundEyes
            eyes={[
              { x: -21, y: -17, r: 16, px: -19, py: -16 },
              { x: 21, y: -20, r: 21, px: 23, py: -19 },
            ]}
          />
          <clipPath id={`${uid}-mouth`}>
            <path d="M -24 8 A 24 22 0 0 0 24 8 Z" />
          </clipPath>
          <path d="M -24 8 A 24 22 0 0 0 24 8 Z" fill={THROAT} />
          <rect
            x={-24}
            y={8}
            width={48}
            height={7}
            fill={TEETH}
            clipPath={`url(#${uid}-mouth)`}
          />
        </>
      );

    /* Both pupils drift the same way. Nothing is wrong; nothing is happening. */
    case "calm":
      return (
        <>
          <RoundEyes
            eyes={[
              { x: -19, y: -14, r: 17, px: -21, py: -12 },
              { x: 19, y: -14, r: 17, px: 17, py: -12 },
            ]}
          />
          <path
            d="M -14 20 L 14 20"
            stroke={FEATURE}
            strokeWidth={6}
            strokeLinecap="round"
          />
        </>
      );

    /* Sad. Two things carry it, and both have to be right: brows arched with
       the inner ends lifted and the outer tails falling away, and pupils rolled
       high enough that white shows underneath. Shorten the brows or centre the
       pupils and the whole face turns merely curious. No mouth — some feelings
       have nothing to say. */
    case "ache":
      return (
        <>
          <g fill="none" stroke={FEATURE} strokeWidth={4} strokeLinecap="round">
            <path d="M -34 -25 Q -24 -34 -10 -38" />
            <path d="M 34 -25 Q 24 -34 10 -38" />
          </g>
          <RoundEyes
            eyes={[
              { x: -20, y: -2, r: 19, px: -18, py: -8 },
              { x: 20, y: -2, r: 19, px: 22, py: -8 },
            ]}
          />
        </>
      );

    /* Heavy brows driving down toward the nose, and a deep frown. */
    case "storm":
      return (
        <>
          <RoundEyes
            sclera={SCLERA_WARM}
            eyes={[
              { x: -18, y: -8, r: 15, px: -15, py: -6 },
              { x: 18, y: -8, r: 15, px: 15, py: -6 },
            ]}
          />
          <g
            fill="none"
            stroke={FEATURE}
            strokeWidth={7.5}
            strokeLinecap="round"
          >
            <path d="M -35 -32 Q -22 -31 -7 -19" />
            <path d="M 35 -32 Q 22 -31 7 -19" />
            <path d="M -19 28 Q 0 11 19 28" strokeWidth={7.5} />
          </g>
        </>
      );
  }
}

/* -- Component ------------------------------------------------------------- */

type EmotionBlobProps = {
  spec: BlobSpec;
  /** Localised name, revealed on hover — naming a feeling is the whole product. */
  label: string;
};

export function EmotionBlob({ spec, label }: EmotionBlobProps) {
  const { key, shape, cx, top, bottom, rx, faceY, color, delay } = spec;

  const chipWidth = Math.max(64, label.length * 8.5 + 26);
  const chipY = top - 34;

  const breathing: CSSProperties = {
    animationDelay: `${delay}s`,
    transformBox: "fill-box",
    transformOrigin: "center",
  };

  return (
    <g className="group">
      <g className="animate-breathe" style={breathing}>
        <g className="transition-transform duration-500 ease-out group-hover:-translate-y-2">
          <path d={BODIES[shape](cx, top, bottom, rx)} fill={color} />
          {/* Faces are drawn for a body of rx 88 and scale from there, so a
              bigger character gets a bigger face — not a wider-set one. */}
          <g transform={`translate(${cx} ${faceY}) scale(${rx / 88})`}>
            <Face variant={key} uid={key} />
          </g>
        </g>
      </g>

      {/* Name chip. Decorative: the caption beneath the illustration already
          announces the cast in prose. */}
      <g
        className="pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      >
        <rect
          x={cx - chipWidth / 2}
          y={chipY}
          width={chipWidth}
          height={30}
          rx={15}
          fill="#FBF9F5"
          opacity={0.96}
        />
        <text
          x={cx}
          y={chipY + 20}
          textAnchor="middle"
          className="font-sans"
          fontSize={14}
          fontWeight={500}
          fill="var(--color-ink)"
        >
          {label}
        </text>
      </g>
    </g>
  );
}
