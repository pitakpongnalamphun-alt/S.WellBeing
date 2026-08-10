"use client";

import type { CSSProperties } from "react";
import { Sparkles } from "lucide-react";

/**
 * น้องปุย — the app's shared fluffy mascot.
 *
 * One character, many moods and many colours. The breathing coach, the life-skill
 * game and the mood tracker all render this so the buddy feels like the same friend
 * everywhere. `size` is a single px value; the face scales with it via an em-based
 * layout. `gradient`/`ink`/`glowColor` recolour the whole character (default: pink).
 *
 * Opt-in extras (default off, so existing screens are untouched): `arms` gives the
 * raised, waiting-for-a-hug paws, `feet` the little stubby legs, and `animated`
 * makes the whole body breathe while the arms wave — the "ขยับได้" look.
 */
export type FluffyExpression =
  | "happy"
  | "hug"
  | "content"
  | "concerned"
  | "sad"
  | "surprised"
  | "angry"
  | "fearful"
  | "weary"
  | "disgusted"
  | "breatheIn"
  | "breatheHold"
  | "breatheOut"
  | "sleepy";

type MouthType = "bigSmile" | "smile" | "calm" | "openSmile" | "o" | "flat" | "frown" | "soft";
type BrowType = "angry" | "worried" | "raised";
type FaceSpec = {
  eyes: "open" | "closed";
  mouth: MouthType;
  brows?: BrowType;
  tear?: boolean;
  sweat?: boolean;
  sparkle?: boolean;
};

const FACES: Record<FluffyExpression, FaceSpec> = {
  // core moods
  happy: { eyes: "open", mouth: "bigSmile", sparkle: true },
  hug: { eyes: "open", mouth: "openSmile" }, // arms-out, gentle open smile (the reference look)
  content: { eyes: "open", mouth: "smile" },
  concerned: { eyes: "open", mouth: "flat" },
  sad: { eyes: "open", mouth: "frown", tear: true },
  // emotion-wheel faces (7-colour set)
  surprised: { eyes: "open", mouth: "o", brows: "raised" },
  angry: { eyes: "open", mouth: "frown", brows: "angry" },
  fearful: { eyes: "open", mouth: "o", brows: "worried", sweat: true },
  weary: { eyes: "closed", mouth: "soft", brows: "worried" },
  disgusted: { eyes: "open", mouth: "soft", brows: "angry" },
  // breathing phases
  breatheIn: { eyes: "open", mouth: "o" },
  breatheHold: { eyes: "open", mouth: "smile" },
  breatheOut: { eyes: "closed", mouth: "calm" }, // relaxed, relieved exhale
  sleepy: { eyes: "closed", mouth: "smile" },
};

const DEFAULT_GRADIENT = "linear-gradient(to bottom right, #fbcfe8, #f9a8d4, #fda4af)"; // pink-200 → pink-300 → rose-300
const DEFAULT_INK = "#5b1a2b"; // deep rosy-maroon — reads as glossy dark eyes
const DEFAULT_GLOW = "rgba(244,114,182,0.42)";

/** Arms & feet stay in น้องปุย's pink family (only ever used on the pink default). */
const LIMB_GRADIENT = "linear-gradient(160deg, #fcd6ec, #f9a8d4)";
const FOOT_GRADIENT = "linear-gradient(180deg, #f9a8d4, #f584bd)";

const FLUFFY_CSS = `
@keyframes fb-morph {
  0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  25%      { border-radius: 50% 50% 55% 45% / 55% 45% 60% 40%; }
  50%      { border-radius: 40% 60% 45% 55% / 45% 55% 40% 60%; }
  75%      { border-radius: 55% 45% 60% 40% / 40% 60% 50% 50%; }
}
@keyframes fb-glow {
  0%, 100% { box-shadow: 0 0.5em 2.4em 0.2em var(--fb-glow); }
  50%      { box-shadow: 0 0.5em 3.6em 0.7em var(--fb-glow); }
}
@keyframes fb-breathe {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.05); }
}
@keyframes fb-arm-left {
  0%, 100% { transform: rotate(-24deg); }
  50%      { transform: rotate(-38deg); }
}
@keyframes fb-arm-right {
  0%, 100% { transform: rotate(24deg); }
  50%      { transform: rotate(38deg); }
}
.fb-blob {
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  animation: fb-morph 9s ease-in-out infinite;
  box-shadow: 0 0.5em 2.4em 0.2em var(--fb-glow);
}
.fb-blob.fb-glowing {
  animation: fb-morph 9s ease-in-out infinite, fb-glow 2.6s ease-in-out infinite;
}
.fb-anim {
  animation: fb-breathe 5.5s ease-in-out infinite;
  transform-origin: 50% 92%;
}
.fb-anim .fb-arm-left { animation: fb-arm-left 3.6s ease-in-out infinite; }
.fb-anim .fb-arm-right { animation: fb-arm-right 3.6s ease-in-out infinite; }
`;

function Brows({ type }: { type: BrowType }) {
  // rotate each brow so the pair points the right way: \ /  = angry, / \ = worried.
  const [l, r] = type === "angry" ? [16, -16] : type === "worried" ? [-16, 16] : [0, 0];
  const bar = (deg: number): CSSProperties => ({
    width: "0.95em",
    height: "0.22em",
    borderRadius: "1em",
    backgroundColor: "var(--fb-ink)",
    transform: `rotate(${deg}deg)`,
  });
  return (
    <div className="flex" style={{ gap: "1.55em", marginBottom: type === "raised" ? "-0.15em" : "-0.35em" }}>
      <span style={bar(l)} />
      <span style={bar(r)} />
    </div>
  );
}

function Mouth({ type }: { type: MouthType }) {
  const ink = { borderColor: "var(--fb-ink)" };
  const inkBg = { backgroundColor: "var(--fb-ink)" };
  switch (type) {
    case "bigSmile":
      return <span className="rounded-b-full" style={{ ...ink, width: "2em", height: "1em", borderBottomWidth: "0.32em" }} />;
    case "smile":
      return <span className="rounded-b-full" style={{ ...ink, width: "1.5em", height: "0.8em", borderBottomWidth: "0.3em" }} />;
    case "calm":
      // a small, soft smile — a relaxed, relieved exhale
      return <span className="rounded-b-full" style={{ ...ink, width: "1.15em", height: "0.5em", borderBottomWidth: "0.22em" }} />;
    case "openSmile":
      // little open happy mouth with a peeking tongue (the reference smile)
      return (
        <span
          className="relative overflow-hidden rounded-b-full rounded-t-[0.28em]"
          style={{ ...inkBg, width: "1.35em", height: "0.92em" }}
        >
          <span
            className="absolute rounded-full"
            style={{ backgroundColor: "#ff8aa6", width: "0.8em", height: "0.5em", left: "50%", bottom: "-0.14em", transform: "translateX(-50%)" }}
          />
        </span>
      );
    case "o":
      return <span className="rounded-full" style={{ ...ink, width: "1em", height: "1em", borderWidth: "0.26em" }} />;
    case "frown":
      return <span className="rounded-t-full" style={{ ...ink, width: "1.5em", height: "0.8em", borderTopWidth: "0.3em" }} />;
    case "soft":
      return <span className="rounded-full opacity-80" style={{ ...inkBg, width: "1.3em", height: "0.22em" }} />;
    case "flat":
    default:
      return <span className="rounded-full opacity-80" style={{ ...inkBg, width: "1.4em", height: "0.28em" }} />;
  }
}

/** A glossy open eye: dark, tall, with a big shine and a small secondary sparkle. */
function OpenEye() {
  return (
    <span
      className="relative overflow-hidden rounded-full"
      style={{ backgroundColor: "var(--fb-ink)", width: "1.25em", height: "1.5em" }}
    >
      {/* glossy top sheen (recolour-safe: white over the ink) */}
      <span
        className="absolute inset-0"
        style={{ backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.30), rgba(255,255,255,0) 55%)" }}
      />
      {/* main highlight */}
      <span className="absolute rounded-full bg-white" style={{ right: "0.16em", top: "0.14em", width: "0.5em", height: "0.5em" }} />
      {/* secondary sparkle */}
      <span className="absolute rounded-full bg-white/80" style={{ left: "0.2em", bottom: "0.26em", width: "0.24em", height: "0.24em" }} />
    </span>
  );
}

/** A raised, rounded paw (used on both sides; `side` flips the tilt). */
function Arm({ side, animated }: { side: "left" | "right"; animated: boolean }) {
  const left = side === "left";
  const style: CSSProperties = {
    position: "absolute",
    zIndex: 1,
    top: "1.5em",
    [left ? "left" : "right"]: "0.15em",
    width: "2.7em",
    height: "4.2em",
    borderRadius: left
      ? "52% 48% 46% 54% / 60% 60% 40% 40%"
      : "48% 52% 54% 46% / 60% 60% 40% 40%",
    background: LIMB_GRADIENT,
    transformOrigin: "50% 100%",
    transform: `rotate(${left ? -24 : 24}deg)`,
    boxShadow: "0 0.4em 1em rgba(215,90,150,0.28)",
  };
  return <span aria-hidden="true" className={left ? "fb-arm-left" : "fb-arm-right"} style={animated ? { ...style, transform: undefined } : style} />;
}

/** Two little stubby feet at the very bottom, in front of the body. */
function Feet() {
  const foot: CSSProperties = {
    position: "absolute",
    zIndex: 20,
    bottom: "-0.35em",
    width: "2.8em",
    height: "1.9em",
    borderRadius: "50% 50% 48% 48% / 62% 62% 42% 42%",
    background: FOOT_GRADIENT,
    boxShadow: "0 0.35em 0.7em rgba(215,90,150,0.25)",
  };
  return (
    <>
      <span aria-hidden="true" style={{ ...foot, left: "2.2em" }} />
      <span aria-hidden="true" style={{ ...foot, right: "2.2em" }} />
    </>
  );
}

export type FluffyBuddyProps = {
  expression?: FluffyExpression;
  /** Blob diameter in px (the face scales with it). */
  size?: number;
  /** Pulse the glow (used for the breathing HOLD phase). */
  glow?: boolean;
  /** Show the raised, waiting-for-a-hug paws. */
  arms?: boolean;
  /** Show the little stubby feet. */
  feet?: boolean;
  /** Breathe slowly and wave the arms (needs `arms` for the wave). */
  animated?: boolean;
  /** CSS background-image for the body (default: soft pink). */
  gradient?: string;
  /** Face colour for eyes and mouth (default: deep rosy-maroon). */
  ink?: string;
  /** Shadow / glow colour (default: soft pink). */
  glowColor?: string;
  className?: string;
};

export function FluffyBuddy({
  expression = "content",
  size = 96,
  glow = false,
  arms = false,
  feet = false,
  animated = false,
  gradient = DEFAULT_GRADIENT,
  ink = DEFAULT_INK,
  glowColor = DEFAULT_GLOW,
  className,
}: FluffyBuddyProps) {
  const f = FACES[expression];
  const containerStyle: CSSProperties = {
    width: size,
    height: size,
    fontSize: size / 10, // 1em = size / 10 → the whole face is proportional to the blob
  };
  (containerStyle as Record<string, string | number>)["--fb-ink"] = ink;
  (containerStyle as Record<string, string | number>)["--fb-glow"] = glowColor;

  return (
    <div
      className={["relative grid place-items-center", animated ? "fb-anim" : "", className ?? ""]
        .filter(Boolean)
        .join(" ")}
      style={containerStyle}
      aria-hidden="true"
    >
      <style>{FLUFFY_CSS}</style>

      {/* limbs sit behind (arms) / in front (feet) of the body */}
      {arms && <Arm side="left" animated={animated} />}
      {arms && <Arm side="right" animated={animated} />}
      {feet && <Feet />}

      {/* soft fluffy halo so the silhouette reads as fur, not a hard ball */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full"
        style={{ inset: "-0.3em", zIndex: 0, backgroundImage: gradient, filter: "blur(0.5em)", opacity: 0.55 }}
      />

      <div
        className={`fb-blob relative z-10 grid h-full w-full place-items-center overflow-hidden ${glow ? "fb-glowing" : ""}`}
        style={{ backgroundImage: gradient }}
      >
        {/* fluffy sheen */}
        <span
          className="pointer-events-none absolute rounded-full bg-white/50 blur-md"
          style={{ left: "20%", top: "16%", width: "2.8em", height: "2.8em" }}
        />
        {/* face */}
        <div className="relative flex flex-col items-center" style={{ gap: "0.5em" }}>
          {f.brows && <Brows type={f.brows} />}

          <div className="flex items-end" style={{ gap: "1.3em" }}>
            {[0, 1].map((i) =>
              f.eyes === "closed" ? (
                <span
                  key={i}
                  className="rounded-t-full"
                  style={{ borderColor: "var(--fb-ink)", width: "1.3em", height: "0.8em", borderTopWidth: "0.32em" }}
                />
              ) : (
                <OpenEye key={i} />
              ),
            )}
          </div>
          <Mouth type={f.mouth} />

          {/* blush cheeks (always rosy) */}
          <span
            className="pointer-events-none absolute rounded-full bg-rose-400/50 blur-[1.5px]"
            style={{ left: "-1.15em", bottom: "-0.1em", width: "1.6em", height: "1.1em" }}
          />
          <span
            className="pointer-events-none absolute rounded-full bg-rose-400/50 blur-[1.5px]"
            style={{ right: "-1.15em", bottom: "-0.1em", width: "1.6em", height: "1.1em" }}
          />

          {f.tear && (
            <span className="absolute rounded-full bg-sky-400/80" style={{ left: "18%", top: "38%", width: "0.6em", height: "0.75em" }} />
          )}
        </div>

        {f.sweat && (
          <span className="absolute rounded-full bg-sky-400/80" style={{ right: "1.7em", top: "1.5em", width: "0.6em", height: "0.78em" }} />
        )}
        {f.sparkle && (
          <Sparkles className="absolute text-amber-300" style={{ right: "0.9em", top: "0.7em", width: "1.3em", height: "1.3em" }} />
        )}
      </div>
    </div>
  );
}

export default FluffyBuddy;
