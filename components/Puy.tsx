"use client";

import { useId } from "react";

/**
 * น้องปุย — เวอร์ชันตามอาร์ตบอร์ด (ลูกพีชสีชมพู ต้นอ่อนบนหัว ตาโตเป็นเงา แก้มชมพู
 * อุ้งมือกลม ๆ และหัวใจจาง ๆ ที่พุง) ใช้ในหน้าคุยกับ AI
 *
 * ทำไมไม่แก้ FluffyBuddy ให้เป็นตัวนี้ไปเลย: FluffyBuddy เป็นก้อนกลมเปลี่ยนสีได้ 14 สีหน้า
 * ที่ใช้อยู่ในโค้ชหายใจ เกม และมู้ดเพ็ต — เปลี่ยนรูปทรงมันคือเปลี่ยนทุกหน้าจอพร้อมกัน
 * โดยที่ไม่มีใครขอ ตัวนี้จึงเป็นคอมโพเนนต์แยกที่มีเฉพาะสีหน้าที่ห้องแชทใช้จริง
 *
 * สีหน้าผูกกับ "สถานะที่รู้จริง" เท่านั้น ไม่ใช่การเดาอารมณ์ของนักเรียน
 */

export type PuyExpression =
  /** เปิดหน้าเข้ามา — ยิ้มอ้าปาก ทักทาย */
  | "greet"
  /** กำลังฟัง — ยิ้มบาง ๆ ตาเปิด */
  | "listen"
  /** มองลง ตั้งใจฟังตอนนักเรียนพิมพ์ และตอนปุยกำลังเรียบเรียงคำตอบ */
  | "think"
  /** ด่านฉุกเฉินทำงาน — คิ้วห่วง ไม่ยิ้ม และไม่ขยับ */
  | "worry"
  /** ส่งกำลังใจ — กอดหัวใจ (ใช้ในการ์ดชวนไปคุยกับครู) */
  | "cheer";

const INK = "#4A2340";
const LEAF = "#BEE99A";
const LEAF_DARK = "#96CE72";

/** ลูกพีช — ยอดมนสั้น ๆ แล้วบานออกเป็นก้อนกลมอ้วน (ไม่ใช่กรวยแหลม) */
const BODY =
  "M96,33 C99,25 106,25 108,33 C126,52 176,78 176,128 C176,173 143,200 100,200 C57,200 24,173 24,128 C24,78 80,52 96,33 Z";

const EYE_Y = 118;
const EYE_L = 76;
const EYE_R = 124;

const PUY_CSS = `
@keyframes puy-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-4%); }
}
@keyframes puy-blink {
  0%, 92%, 100% { transform: scaleY(1); }
  95%           { transform: scaleY(0.08); }
}
.puy-float { animation: puy-float 4.2s ease-in-out infinite; }
.puy-eyes  { transform-box: fill-box; transform-origin: center; }
.puy-eyes.puy-blinking { animation: puy-blink 6.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .puy-float, .puy-eyes.puy-blinking { animation: none; }
}
`;

type FaceSpec = {
  eye: "open" | "down" | "happy";
  mouth: "open" | "smile" | "soft" | "flat";
  arm: "side" | "hold";
  belly: boolean;
  brows?: boolean;
  heart?: boolean;
};

const FACES: Record<PuyExpression, FaceSpec> = {
  greet: { eye: "open", mouth: "open", arm: "side", belly: true },
  listen: { eye: "open", mouth: "smile", arm: "side", belly: true },
  think: { eye: "down", mouth: "soft", arm: "side", belly: true },
  worry: { eye: "open", mouth: "flat", arm: "side", belly: true, brows: true },
  cheer: { eye: "happy", mouth: "open", arm: "hold", belly: false, heart: true },
};

function Eyes({ kind, iris }: { kind: FaceSpec["eye"]; iris: string }) {
  if (kind === "happy") {
    return (
      <>
        {[EYE_L, EYE_R].map((cx) => (
          <path
            key={cx}
            d={`M${cx - 17},${EYE_Y + 6} q17,-20 34,0`}
            fill="none"
            stroke={INK}
            strokeWidth={6}
            strokeLinecap="round"
          />
        ))}
      </>
    );
  }
  if (kind === "down") {
    // ตาแป้นลงมา = มองลง ตั้งใจฟัง (ไม่ใช้เปลือกตาหนา ๆ พาด เพราะกลายเป็นคิ้วโกรธ)
    return (
      <>
        {[EYE_L, EYE_R].map((cx) => (
          <g key={cx}>
            <ellipse cx={cx} cy={EYE_Y + 10} rx={17} ry={11} fill={INK} />
            <circle cx={cx + 5.5} cy={EYE_Y + 6} r={4.6} fill="#fff" />
          </g>
        ))}
      </>
    );
  }
  return (
    <>
      {[EYE_L, EYE_R].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy={EYE_Y} rx={17} ry={21} fill={`url(#${iris})`} />
          <circle cx={cx + 5.5} cy={EYE_Y - 8} r={6} fill="#fff" />
          <circle cx={cx - 6} cy={EYE_Y + 7} r={3.2} fill="#fff" opacity={0.9} />
        </g>
      ))}
    </>
  );
}

function Mouth({ kind }: { kind: FaceSpec["mouth"] }) {
  const Y = 150;
  if (kind === "open") {
    return (
      <>
        <path d={`M89.5,${Y - 3} a10.5,10.5 0 0 0 21,0 Z`} fill={INK} />
        <ellipse cx={100} cy={Y + 3.6} rx={5.8} ry={3.4} fill="#FF7A9E" />
      </>
    );
  }
  const d =
    kind === "smile"
      ? `M90,${Y - 6} q10,11 20,0`
      : kind === "soft"
        ? `M92,${Y - 3} q8,7 16,0`
        : // ห่วง — ปากคว่ำลงนิดเดียว ไม่ถึงกับร้องไห้
          `M92,${Y + 1} q8,-6 16,0`;
  return (
    <path
      d={d}
      fill="none"
      stroke={INK}
      strokeWidth={kind === "smile" ? 5 : 4.5}
      strokeLinecap="round"
    />
  );
}

function Paws({ kind, limb }: { kind: FaceSpec["arm"]; limb: string }) {
  const spec: [number, number, number][] =
    kind === "hold"
      ? [
          [64, 172, 36],
          [136, 172, -36],
        ]
      : [
          [29, 159, 24],
          [171, 159, -24],
        ];
  return (
    <>
      {spec.map(([cx, cy, rot]) => (
        <ellipse
          key={cx}
          cx={cx}
          cy={cy}
          rx={12.5}
          ry={16}
          fill={`url(#${limb})`}
          transform={`rotate(${rot} ${cx} ${cy})`}
        />
      ))}
    </>
  );
}

function Heart({
  cx,
  cy,
  s,
  fill,
  opacity = 1,
}: {
  cx: number;
  cy: number;
  s: number;
  fill: string;
  opacity?: number;
}) {
  const d = `M0,${3 * s} C${-5 * s},${-1 * s} ${-4.4 * s},${-5 * s} 0,${-3 * s} C${4.4 * s},${-5 * s} ${5 * s},${-1 * s} 0,${3 * s} Z`;
  return (
    <path d={d} transform={`translate(${cx} ${cy})`} fill={fill} opacity={opacity} />
  );
}

export type PuyProps = {
  expression?: PuyExpression;
  /** ความกว้างเป็น px (สูง = กว้าง × 1.07 ตามสัดส่วนตัว) */
  size?: number;
  /** ลอยขึ้นลงเบา ๆ — ปิดได้สำหรับตัวเล็กบนแถบหัวที่ไม่ควรดึงสายตา */
  float?: boolean;
  className?: string;
};

export function Puy({
  expression = "listen",
  size = 120,
  float = true,
  className,
}: PuyProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (k: string) => `puy-${k}-${uid}`;
  const f = FACES[expression];
  // ตอนเจอเรื่องฉุกเฉิน ทุกอย่างต้องนิ่ง — ไม่กระพริบ ไม่ลอย
  const still = expression === "worry";

  return (
    <svg
      viewBox="0 0 200 214"
      width={size}
      height={Math.round(size * 1.07)}
      className={[float && !still ? "puy-float" : "", className]
        .filter(Boolean)
        .join(" ")}
      role="presentation"
      aria-hidden="true"
    >
      <style>{PUY_CSS}</style>
      <defs>
        <linearGradient id={id("body")} x1="0.2" y1="0" x2="0.75" y2="1">
          <stop offset="0" stopColor="#FFDCF0" />
          <stop offset="0.5" stopColor="#FFB7DF" />
          <stop offset="1" stopColor="#FF93C8" />
        </linearGradient>
        <radialGradient id={id("sheen")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="0.42" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("limb")} x1="0.1" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#FFBCE1" />
          <stop offset="1" stopColor="#FF8FC6" />
        </linearGradient>
        <radialGradient id={id("glow")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.52" stopColor="#FFA8D5" stopOpacity="0.42" />
          <stop offset="1" stopColor="#FFA8D5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("iris")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3E1B33" />
          <stop offset="1" stopColor="#6E3459" />
        </linearGradient>
        <linearGradient id={id("leaf")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D6F2BC" />
          <stop offset="1" stopColor={LEAF} />
        </linearGradient>
      </defs>

      <ellipse cx={100} cy={124} rx={99} ry={90} fill={`url(#${id("glow")})`} />

      {/* ต้นอ่อนบนหัว */}
      <path
        d="M103,34 C103,26 104,21 106,16"
        fill="none"
        stroke={LEAF_DARK}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <path
        d="M105,15 C112,4 129,4 133,11 C127,21 111,22 105,15 Z"
        fill={`url(#${id("leaf")})`}
      />
      <path d="M103,21 C97,13 85,14 83,21 C89,28 100,27 103,21 Z" fill={LEAF_DARK} />

      <path d={BODY} fill={`url(#${id("body")})`} />
      <ellipse
        cx={62}
        cy={82}
        rx={34}
        ry={24}
        fill={`url(#${id("sheen")})`}
        transform="rotate(-24 62 82)"
      />

      <Paws kind={f.arm} limb={id("limb")} />

      <ellipse cx={57} cy={148} rx={11} ry={6.5} fill="#FF7FBF" opacity={0.28} />
      <ellipse cx={143} cy={148} rx={11} ry={6.5} fill="#FF7FBF" opacity={0.28} />

      {/* คิ้วห่วง = ปลายด้านในยกสูงกว่าปลายด้านนอก กลับด้านเมื่อไหร่กลายเป็นคิ้วโกรธทันที */}
      {f.brows ? (
        <>
          <path
            d={`M55,${EYE_Y - 29} q15,-8 27,-3`}
            fill="none"
            stroke={INK}
            strokeWidth={4.2}
            strokeLinecap="round"
          />
          <path
            d={`M145,${EYE_Y - 29} q-15,-8 -27,-3`}
            fill="none"
            stroke={INK}
            strokeWidth={4.2}
            strokeLinecap="round"
          />
        </>
      ) : null}

      <g
        className={`puy-eyes${f.eye === "open" && !still ? " puy-blinking" : ""}`}
      >
        <Eyes kind={f.eye} iris={id("iris")} />
      </g>

      <Mouth kind={f.mouth} />

      {f.belly ? <Heart cx={100} cy={177} s={3.4} fill="#fff" opacity={0.5} /> : null}
      {f.heart ? <Heart cx={100} cy={184} s={5} fill="#FF6E9A" /> : null}
    </svg>
  );
}
