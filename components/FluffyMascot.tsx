"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";

/**
 * FluffyMascot — the real, image-based น้องปุย.
 *
 * Unlike <FluffyBuddy /> (which draws the character from CSS shapes), this renders
 * the actual illustrated PNG and brings it to life with Framer Motion: it idles
 * with a gentle float + breath, wiggles and grows on hover, and squishes like a
 * plush toy when tapped. A soft ground shadow breathes in sync with the float.
 *
 * One pink source image is recoloured for the Daily-Mood-Pet moods via CSS
 * filters, so we never need seven copies of the artwork.
 *
 * Requires the artwork at: public/assets/fluffy-mascot.png (transparent PNG).
 */

export type MoodColor =
  | "pink"
  | "blue"
  | "yellow"
  | "green"
  | "orange"
  | "red"
  | "gray";

/**
 * Hue-rotate the pink fur toward each mood while keeping the fluffy shading.
 * The base artwork sits around a rose hue (~335°); if your PNG reads warmer or
 * cooler, nudge these degrees until each mood lands right.
 */
const MOOD_FILTERS: Record<MoodColor, string> = {
  pink: "none",
  red: "hue-rotate(20deg) saturate(1.3)",
  orange: "hue-rotate(50deg) saturate(1.25) brightness(1.05)",
  yellow: "hue-rotate(80deg) saturate(1.2) brightness(1.12)",
  green: "hue-rotate(150deg) saturate(0.9)",
  blue: "hue-rotate(245deg) saturate(0.95)",
  gray: "saturate(0.2) brightness(1.05)",
};

const MASCOT_SRC = "/assets/fluffy-mascot.png";

/** Idle float + breath on the outer wrapper (kept off the interaction layer so
 *  hover/tap never fight the loop). */
const floatVariants: Variants = {
  float: {
    y: [0, -8, 0],
    scaleY: [1, 1.02, 0.99, 1],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
};

/** The shadow shrinks as the character floats up, grows as it settles. */
const shadowVariants: Variants = {
  float: {
    scaleX: [1, 0.82, 1],
    opacity: [0.5, 0.32, 0.5],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
};

/** Interaction layer: soft-spring hover wiggle + plush squish on tap. */
const bodyVariants: Variants = {
  rest: { scaleX: 1, scaleY: 1, rotate: 0 },
  hover: {
    scaleX: 1.05,
    scaleY: 1.05,
    rotate: [-2, 2, -2, 0],
    transition: {
      rotate: { duration: 0.6, repeat: Infinity, ease: "easeInOut" },
      default: { type: "spring", stiffness: 300, damping: 14 },
    },
  },
  tap: {
    scaleX: 1.15,
    scaleY: 0.85,
    transition: { type: "spring", stiffness: 500, damping: 12 },
  },
};

export type FluffyMascotProps = {
  /** Recolour the pink fur for the mood pet. */
  moodColor?: MoodColor;
  /** Character width & height in px. */
  size?: number;
  /** Tap handler — makes the mascot an interactive button. */
  onClick?: () => void;
  /** Idle float + ground shadow. Turn OFF when a parent drives the motion
   *  (e.g. the breathing coach scales the whole mascot per phase). */
  floating?: boolean;
  className?: string;
};

export function FluffyMascot({
  moodColor = "pink",
  size = 200,
  onClick,
  floating = true,
  className,
}: FluffyMascotProps) {
  const [imgOk, setImgOk] = useState(true);
  const interactive = typeof onClick === "function";
  const gestures = floating || interactive; // wiggle/squish only when it makes sense
  const filter = MOOD_FILTERS[moodColor] ?? MOOD_FILTERS.pink;

  // Room under the character for the floating shadow (none when parent-controlled).
  const shadowBand = floating ? Math.round(size * 0.16) : 0;

  return (
    <div
      className={["relative select-none", className ?? ""].filter(Boolean).join(" ")}
      style={{ width: size, height: size + shadowBand }}
    >
      {/* Ground shadow — breathes with the float (only in floating mode) */}
      {floating && (
        <motion.div
          aria-hidden="true"
          className="absolute left-1/2 -translate-x-1/2 rounded-[50%] bg-rose-950/25 blur-md"
          style={{ bottom: 0, width: size * 0.58, height: shadowBand * 0.7 }}
          variants={shadowVariants}
          animate="float"
        />
      )}

      {/* Floating wrapper (idle loop only) */}
      <motion.div
        className="absolute inset-x-0 top-0 flex justify-center"
        style={{ transformOrigin: "50% 100%" }}
        variants={floatVariants}
        animate={floating ? "float" : undefined}
      >
        {/* Interaction layer (hover / tap) */}
        <motion.div
          role={interactive ? "button" : undefined}
          tabIndex={interactive ? 0 : undefined}
          aria-label={interactive ? "น้องปุย" : undefined}
          aria-hidden={interactive ? undefined : true}
          onClick={onClick}
          onKeyDown={
            interactive
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick?.();
                  }
                }
              : undefined
          }
          variants={bodyVariants}
          initial="rest"
          animate="rest"
          whileHover={gestures ? "hover" : undefined}
          whileTap={gestures ? "tap" : undefined}
          className={[
            "relative grid place-items-center",
            interactive ? "cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-200 rounded-full" : "",
          ].join(" ")}
          style={{ width: size, height: size, transformOrigin: "50% 100%" }}
        >
          {imgOk ? (
            <Image
              src={MASCOT_SRC}
              alt="น้องปุย มาสคอตขนปุยสีชมพู"
              width={size}
              height={size}
              priority
              draggable={false}
              className="pointer-events-none h-full w-full object-contain"
              style={{ filter, transition: "filter 0.5s ease" }}
              onError={() => setImgOk(false)}
            />
          ) : (
            // Dev placeholder only — shows until public/assets/fluffy-mascot.png exists.
            // (Deliberately a neutral blob, not a CSS re-creation of the character.)
            <div
              className="grid h-[86%] w-[86%] place-items-center rounded-full bg-pink-200 text-center text-[0.7rem] font-medium text-pink-700 shadow-inner"
              style={{ filter }}
            >
              วางไฟล์รูปที่
              <br />
              /assets/fluffy-mascot.png
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default FluffyMascot;
