"use client";

import { SECTORS, type EmotionKey, type Intensity } from "@/lib/plutchik";

/**
 * The viewBox is wider than the wheel so the sector names have room outside
 * the outermost ring. Sizing the box to the wheel alone clips them.
 */
const SIZE = 320;
const PAD = 46;
const BOX = SIZE + PAD * 2;
const C = BOX / 2;
/** Ring boundaries, centre outward: intense → mild. */
const RADII = [46, 82, 118, 150];

type Selection = { emotion: EmotionKey; intensity: Intensity } | null;

function polar(angleDeg: number, r: number) {
  // -90 puts 0° at the top rather than at three o'clock.
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
}

/** Annular wedge between two radii, spanning `sweep` degrees around `angle`. */
function wedge(angle: number, rInner: number, rOuter: number, sweep: number) {
  const a0 = angle - sweep / 2;
  const a1 = angle + sweep / 2;
  const [x0, y0] = polar(a0, rInner);
  const [x1, y1] = polar(a1, rInner);
  const [x2, y2] = polar(a1, rOuter);
  const [x3, y3] = polar(a0, rOuter);
  return [
    `M ${x0} ${y0}`,
    `A ${rInner} ${rInner} 0 0 1 ${x1} ${y1}`,
    `L ${x2} ${y2}`,
    `A ${rOuter} ${rOuter} 0 0 0 ${x3} ${y3}`,
    "Z",
  ].join(" ");
}

/**
 * The wheel. Each of the eight sectors is split into three rings; the innermost
 * ring is the most intense, matching Plutchik's own drawing where intensity
 * rises toward the centre.
 *
 * Every wedge is a real <button> inside <foreignObject>-free SVG — they carry
 * their own labels, so the whole control is operable and readable without
 * sight. The picture is the affordance, not the interface.
 */
export function PlutchikWheel({
  value,
  onChange,
}: {
  value: Selection;
  onChange: (next: NonNullable<Selection>) => void;
}) {
  const sweep = 360 / SECTORS.length;

  return (
    <svg
      viewBox={`0 0 ${BOX} ${BOX}`}
      className="mx-auto block w-full max-w-[21rem]"
      role="group"
      aria-label="เลือกอารมณ์และระดับความเข้ม"
    >
      {SECTORS.map((sector) =>
        ([3, 2, 1] as Intensity[]).map((intensity) => {
          // intensity 3 is the innermost band
          const idx = 3 - intensity;
          const rInner = RADII[idx];
          const rOuter = RADII[idx + 1];
          const selected =
            value?.emotion === sector.key && value.intensity === intensity;
          const label = sector.labels[intensity - 1];

          return (
            <g key={`${sector.key}-${intensity}`} className="group">
              <path
                d={wedge(sector.angle, rInner, rOuter, sweep - 1.5)}
                fill={sector.hue}
                // Mild bands sit lighter, so the ramp reads as intensity.
                opacity={selected ? 1 : 0.32 + intensity * 0.16}
                stroke={selected ? "#14110F" : "transparent"}
                strokeWidth={selected ? 2.5 : 0}
                className="cursor-pointer transition-opacity duration-150 group-hover:opacity-95"
                onClick={() => onChange({ emotion: sector.key, intensity })}
                role="radio"
                aria-checked={selected}
                aria-label={label}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onChange({ emotion: sector.key, intensity });
                  }
                }}
              />
            </g>
          );
        }),
      )}

      {/* Sector names, outside the outermost ring. */}
      {SECTORS.map((sector) => {
        const [x, y] = polar(sector.angle, RADII[3] + 18);
        // Anchor by side so labels grow away from the wheel, not across it.
        const anchor =
          Math.abs(sector.angle % 180) < 1
            ? "middle"
            : sector.angle < 180
              ? "start"
              : "end";
        return (
          <text
            key={sector.key}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize={11}
            className="font-sans fill-ink-soft"
            aria-hidden="true"
          >
            {sector.labels[1]}
          </text>
        );
      })}
    </svg>
  );
}
