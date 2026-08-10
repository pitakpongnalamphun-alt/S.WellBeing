"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * เพื่อนปุยทั้ง 15 ตัว วาดมือเป็น SVG — แทนที่ emoji เดิมให้มีชีวิตชีวา
 * สไตล์เดียวกับน้องปุย (FluffyBuddy): ตัวกลมนุ่ม พาสเทล ตาดำแววมีไฮไลต์
 * แก้มแดง และแต่ละตัว "ดิ้น" ตามนิสัยของตัวเอง (กระต่ายกระดิกหู หมากระดิกหาง
 * สลอธแกว่งช้า ๆ ฯลฯ) — อนิเมชันทั้งหมดปิดอัตโนมัติเมื่อผู้ใช้ตั้ง reduced motion
 */

export const FRIEND_INK = "#4a3546";

/* ---------- shared animation vocabulary (ff-*) ---------- */
export const SPRITE_CSS = `
/* view-box: จุดหมุน (transform-origin) ที่ตั้งเป็น px อ้างพิกัด viewBox 0-100 ตรง ๆ
   (ห้ามใช้ fill-box — px จะถูกวัดจากมุมกล่องของชิ้นส่วนเอง ทำให้ตา "หล่น" ตอนกะพริบ) */
.ffs [class^="ff-"], .ffs [class*=" ff-"] { transform-box: view-box; transform-origin: center; }
/* ชิ้นเอฟเฟกต์ลอย (Zzz/ดาว/หัวใจ) ไม่ได้ตั้ง origin เอง — ให้ย่อ-ขยายรอบจุดกลางของตัวเอง */
.ffs .ff-drift { transform-box: fill-box; }
@keyframes ff-breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.035); } }
@keyframes ff-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2.5px); } }
@keyframes ff-bob-fast { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@keyframes ff-sway { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
@keyframes ff-sway-slow { 0%,100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
@keyframes ff-wiggle { 0%,100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
@keyframes ff-tail { 0%,100% { transform: rotate(-4deg); } 50% { transform: rotate(14deg); } }
@keyframes ff-ear { 0%,88%,100% { transform: rotate(0deg); } 92% { transform: rotate(-7deg); } 96% { transform: rotate(4deg); } }
@keyframes ff-flap { 0%,100% { transform: scaleX(1); } 50% { transform: scaleX(0.62); } }
@keyframes ff-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes ff-twinkle { 0%,100% { opacity: 0.35; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.15); } }
@keyframes ff-drift { 0% { opacity: 0; transform: translateY(2px) scale(0.6); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateY(-11px) scale(1.05); } }
@keyframes ff-blink { 0%, 91%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.12); } }
@keyframes ff-shimmer { 0%,100% { opacity: 0.4; } 50% { opacity: 0.95; } }
@keyframes ff-peek { 0%,100% { transform: translateY(0); } 50% { transform: translateY(2.5px); } }
@keyframes ff-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes ff-wingbeat { 0%,100% { transform: scaleX(1); } 50% { transform: scaleX(0.9); } }
@keyframes ff-tilt { 0%, 38% { transform: rotate(-4deg); } 50%, 88% { transform: rotate(4deg); } 100% { transform: rotate(-4deg); } }
.ff-breathe { animation: ff-breathe 5s ease-in-out infinite; transform-origin: 50% 90%; }
.ff-bob { animation: ff-bob 2.6s ease-in-out infinite; }
.ff-bob-fast { animation: ff-bob-fast 1.5s ease-in-out infinite; }
.ff-sway { animation: ff-sway 4s ease-in-out infinite; }
.ff-sway-slow { animation: ff-sway-slow 6s ease-in-out infinite; }
.ff-wiggle { animation: ff-wiggle 1.9s ease-in-out infinite; }
.ff-tail { animation: ff-tail 0.9s ease-in-out infinite; }
.ff-ear { animation: ff-ear 3.2s ease-in-out infinite; }
.ff-flap { animation: ff-flap 0.85s ease-in-out infinite; }
.ff-float { animation: ff-float 3.4s ease-in-out infinite; }
.ff-twinkle { animation: ff-twinkle 1.8s ease-in-out infinite; }
.ff-drift { animation: ff-drift 2.6s ease-in-out infinite; }
.ff-blink { animation: ff-blink 4.2s ease-in-out infinite; }
.ff-shimmer { animation: ff-shimmer 2.8s ease-in-out infinite; }
.ff-peek { animation: ff-peek 3s ease-in-out infinite; }
.ff-tilt { animation: ff-tilt 5s ease-in-out infinite; }
.ff-spin { animation: ff-spin 24s linear infinite; }
.ff-wingbeat { animation: ff-wingbeat 3.8s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .ffs * { animation: none !important; }
}
`;

/* ---------- shared face parts (ตาแวว/แก้มแดง/ปาก แบบเดียวกับน้องปุย) ---------- */

/** ตาดำกลมแวว มีไฮไลต์ใหญ่+เล็ก และกะพริบเป็นจังหวะ */
export function GEye({ cx, cy, r = 5, ink = FRIEND_INK, delay = 0 }: { cx: number; cy: number; r?: number; ink?: string; delay?: number }) {
  return (
    <g className="ff-blink" style={{ transformOrigin: `${cx}px ${cy}px`, animationDelay: `${delay}s` }}>
      <ellipse cx={cx} cy={cy} rx={r * 0.84} ry={r} fill={ink} />
      <circle cx={cx + r * 0.28} cy={cy - r * 0.32} r={r * 0.34} fill="#fff" />
      <circle cx={cx - r * 0.34} cy={cy + r * 0.3} r={r * 0.16} fill="#fff" opacity={0.85} />
    </g>
  );
}

/** ตาหลับสบาย (เส้นโค้งคว่ำ) */
export function SleepyEye({ cx, cy, w = 8, ink = FRIEND_INK }: { cx: number; cy: number; w?: number; ink?: string }) {
  return (
    <path
      d={`M ${cx - w / 2} ${cy} Q ${cx} ${cy + w * 0.55} ${cx + w / 2} ${cy}`}
      fill="none"
      stroke={ink}
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  );
}

/** แก้มแดงระเรื่อ — ตัวสีเข้ม (เช่นวาฬ) ส่งสี/ความทึบมาเองได้ไม่ให้ออกม่วงช้ำ */
export function Blush({
  cx,
  cy,
  r = 4,
  color = "#fb7185",
  opacity = 0.4,
}: {
  cx: number;
  cy: number;
  r?: number;
  color?: string;
  opacity?: number;
}) {
  return <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.62} fill={color} opacity={opacity} />;
}

/** ยิ้มเล็ก ๆ โค้งลง */
export function Smile({ cx, cy, w = 7, ink = FRIEND_INK }: { cx: number; cy: number; w?: number; ink?: string }) {
  return (
    <path
      d={`M ${cx - w / 2} ${cy} Q ${cx} ${cy + w * 0.6} ${cx + w / 2} ${cy}`}
      fill="none"
      stroke={ink}
      strokeWidth={2.4}
      strokeLinecap="round"
    />
  );
}

/* ---------- ตัวละคร ---------- */

/** 🐻 น้องหมีง่วง — หมีขนปุยนุ่มฟู กอดหมอนเน่าไม่ยอมปล่อย นั่งซบผ้าห่มพับ หลับปุ๋ยมี Zzz ลอย */
function Bear() {
  /** ขอบขนปุย — วงรีที่ขอบเป็นคลื่นเล็ก ๆ ซ้อนไว้หลังหัว/ตัว/หู ให้ได้ "รัศมีขนฟู" รอบตัวจริง ๆ */
  const fluffy = (cx: number, cy: number, rx: number, ry: number, bumps: number, amp: number): string => {
    const step = (Math.PI * 2) / bumps;
    let d = `M ${(cx + rx).toFixed(2)} ${cy.toFixed(2)}`;
    for (let i = 0; i < bumps; i += 1) {
      const mid = (i + 0.5) * step;
      const end = (i + 1) * step;
      d += ` Q ${(cx + Math.cos(mid) * (rx + amp)).toFixed(2)} ${(cy + Math.sin(mid) * (ry + amp)).toFixed(2)} ${(cx + Math.cos(end) * rx).toFixed(2)} ${(cy + Math.sin(end) * ry).toFixed(2)}`;
    }
    return `${d} Z`;
  };
  const headD =
    "M 50 15 C 64 15 74.6 24.2 75.8 36.7 C 77.1 49.5 66 58.4 50 58.4 C 34 58.4 22.9 49.5 24.2 36.7 C 25.4 24.2 36 15 50 15 Z";
  const bodyD =
    "M 50 47.7 C 64 47.7 74.4 56.6 75.8 68 C 77.2 80.4 67.4 88.2 50 88.2 C 32.6 88.2 22.8 80.4 24.2 68 C 25.6 56.6 36 47.7 50 47.7 Z";
  const shade = "#a97e51";
  const furLine = "#c49a6c";
  const furLite = "#fdf3e2";
  return (
    <g className="ff-sway" style={{ transformOrigin: "50px 92px", animationDuration: "6.6s" }}>
      <defs>
        <radialGradient id="ff-bear-fur" cx="0.36" cy="0.26" r="0.95">
          <stop offset="0%" stopColor="#f8e2c2" />
          <stop offset="55%" stopColor="#e4c095" />
          <stop offset="100%" stopColor="#c69663" />
        </radialGradient>
        <radialGradient id="ff-bear-head" cx="0.38" cy="0.28" r="0.92">
          <stop offset="0%" stopColor="#fceace" />
          <stop offset="58%" stopColor="#e9c99f" />
          <stop offset="100%" stopColor="#cb9d6c" />
        </radialGradient>
        <linearGradient id="ff-bear-halo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdf0dd" />
          <stop offset="100%" stopColor="#eed3b0" />
        </linearGradient>
        <linearGradient id="ff-bear-limb" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="#f4d8b0" />
          <stop offset="100%" stopColor="#d3a877" />
        </linearGradient>
        <radialGradient id="ff-bear-muzzle" cx="0.5" cy="0.32" r="0.82">
          <stop offset="0%" stopColor="#fffbf3" />
          <stop offset="100%" stopColor="#f2ddc0" />
        </radialGradient>
        <linearGradient id="ff-bear-earin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fad2cb" />
          <stop offset="100%" stopColor="#eeaaa6" />
        </linearGradient>
        <linearGradient id="ff-bear-pillow" x1="0.15" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#f6f6fe" />
          <stop offset="52%" stopColor="#e3e7fc" />
          <stop offset="100%" stopColor="#c3cdf5" />
        </linearGradient>
        <linearGradient id="ff-bear-blanket" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eaf9f1" />
          <stop offset="100%" stopColor="#bde5d3" />
        </linearGradient>
        <clipPath id="ff-bear-headclip">
          <path d={headD} />
        </clipPath>
        <clipPath id="ff-bear-bodyclip">
          <path d={bodyD} />
        </clipPath>
      </defs>

      {/* เงานุ่มใต้ตัว — ยึดน้ำหนักให้ตัวละครนั่งอยู่จริง */}
      <ellipse cx={50} cy={91.4} rx={28} ry={3.8} fill={shade} opacity={0.13} />

      {/* ผ้าห่มพับที่นั่งทับ — ขอบเป็นคลื่นนุ่ม + รอยด้ายปัก */}
      <path
        d="M 17.5 87 Q 23 82.6 29 85.6 Q 35 88.6 41 85.2 Q 47 81.8 53 85.2 Q 59 88.6 65 85.6 Q 71 82.6 82.5 87 L 82.5 90.4 Q 50 94.8 17.5 90.4 Z"
        fill="url(#ff-bear-blanket)"
      />
      <path
        d="M 20 89.2 q 3 .9 6 1.3 M 30.5 90.6 q 3 .5 6 .8 M 63.5 90.6 q 3 -.3 6 -.8 M 74 89.2 q 3 -.4 6 -1.3"
        stroke="#96d3b8" strokeWidth={0.9} fill="none" strokeLinecap="round" opacity={0.85}
      />
      <path d="M 21.5 85.6 l 1.6 1.6 M 23.1 85.6 l -1.6 1.6 M 77 85.6 l 1.6 1.6 M 78.6 85.6 l -1.6 1.6" stroke="#8fcdb2" strokeWidth={0.8} strokeLinecap="round" />

      {/* ---- ลำตัวปุย ---- */}
      <path d={fluffy(50, 68, 27, 21.4, 18, 3)} fill="url(#ff-bear-halo)" />
      <path d={bodyD} fill="url(#ff-bear-fur)" />
      <g clipPath="url(#ff-bear-bodyclip)">
        {/* แสงบนไหล่ซ้าย + เงาโค้งด้านขวาล่าง = ปริมาตรกลม */}
        <ellipse cx={38} cy={55} rx={16} ry={8.5} fill="#fff8ec" opacity={0.34} transform="rotate(-16 38 55)" />
        <ellipse cx={86} cy={84} rx={30} ry={26} fill={shade} opacity={0.2} />
        {/* เงาหัวทาบลงอก */}
        <ellipse cx={50} cy={54} rx={22} ry={6.4} fill={shade} opacity={0.22} />
        {/* แผงอกสีครีมนุ่ม */}
        <ellipse cx={50} cy={69} rx={17.5} ry={13.5} fill="#fbeed7" opacity={0.92} />
        <path
          d="M 36.4 63.2 q 2.4 1.8 2 4.2 M 42.6 60 q 2 2 1.4 4.4 M 57.4 60 q -2 2 -1.4 4.4 M 63.6 63.2 q -2.4 1.8 -2 4.2"
          stroke="#eed6b2" strokeWidth={1.1} fill="none" strokeLinecap="round"
        />
        {/* เส้นขนตามแนวลำตัว */}
        <path
          d="M 30.4 62 Q 27.6 66.4 28.2 71.4 M 34.6 56.8 Q 31.6 60.4 31 64.6 M 69.6 62 Q 72.4 66.4 71.8 71.4 M 65.4 56.8 Q 68.4 60.4 69 64.6 M 71.4 74 Q 73.8 77.6 73 81.4"
          stroke={furLine} strokeWidth={1.1} fill="none" strokeLinecap="round" opacity={0.55}
        />
        <path d="M 41.6 51.6 q 2 1.6 1.6 3.6 M 50 50.4 q 2.2 1.6 1.8 3.6 M 58.4 51.6 q 2 1.6 1.6 3.6" stroke={furLite} strokeWidth={1.1} fill="none" strokeLinecap="round" opacity={0.7} />
      </g>

      {/* ---- ขาหลังสองข้าง ฝ่าเท้าปุยหันเข้าหาเรา ขยับสลับจังหวะ ---- */}
      <g className="ff-wiggle" style={{ transformOrigin: "34px 74px", animationDuration: "5.6s" }}>
        <g transform="rotate(-16 28 81.5)">
          <ellipse cx={28} cy={81.5} rx={9.4} ry={7.6} fill="url(#ff-bear-halo)" />
          <ellipse cx={28} cy={81.5} rx={8.6} ry={6.9} fill="url(#ff-bear-limb)" />
          <ellipse cx={27.5} cy={83.4} rx={4.6} ry={3.4} fill="#f8dcc4" />
          <circle cx={22.6} cy={78.6} r={1.5} fill="#f8dcc4" />
          <circle cx={26.6} cy={77.2} r={1.6} fill="#f8dcc4" />
          <circle cx={30.6} cy={78} r={1.5} fill="#f8dcc4" />
          <path d="M 21.4 84.4 q -1.8 .6 -2.8 2 M 23.4 86.4 q -1.4 1.2 -1.8 2.8" stroke={furLine} strokeWidth={1} fill="none" strokeLinecap="round" opacity={0.6} />
        </g>
      </g>
      <g className="ff-wiggle" style={{ transformOrigin: "66px 74px", animationDuration: "5.6s", animationDelay: "2.8s" }}>
        <g transform="rotate(16 72 81.5)">
          <ellipse cx={72} cy={81.5} rx={9.4} ry={7.6} fill="url(#ff-bear-halo)" />
          <ellipse cx={72} cy={81.5} rx={8.6} ry={6.9} fill="url(#ff-bear-limb)" />
          <ellipse cx={72.5} cy={83.4} rx={4.6} ry={3.4} fill="#f8dcc4" />
          <circle cx={77.4} cy={78.6} r={1.5} fill="#f8dcc4" />
          <circle cx={73.4} cy={77.2} r={1.6} fill="#f8dcc4" />
          <circle cx={69.4} cy={78} r={1.5} fill="#f8dcc4" />
          <path d="M 78.6 84.4 q 1.8 .6 2.8 2 M 76.6 86.4 q 1.4 1.2 1.8 2.8" stroke={furLine} strokeWidth={1} fill="none" strokeLinecap="round" opacity={0.6} />
        </g>
      </g>

      {/* ---- หมอนเน่า + แขนที่โอบไว้ บีบกอดเบา ๆ เป็นจังหวะเดียวกัน ---- */}
      <g className="ff-breathe" style={{ transformOrigin: "50px 86px", animationDuration: "3.6s" }}>
        <g transform="rotate(-6 50 75.5)">
          {/* ป้ายผ้าเล็ก ๆ โผล่มุมบนขวา */}
          <g transform="rotate(26 66.2 65.4)">
            <rect x={63.8} y={63.4} width={5.2} height={3.6} rx={1.2} fill="#f6ead9" />
            <path d="M 65 64.4 h 2.8 M 65 65.8 h 2.2" stroke="#d9c3a6" strokeWidth={0.6} strokeLinecap="round" />
          </g>
          {/* ตัวหมอนนุ่ม ๆ มุมจีบ */}
          <path
            d="M 35 65.4 C 44.6 62.3 55.4 62.3 65 65.4 C 68 66.2 69 68.4 68.6 75.6 C 68.2 82.8 67 85.8 64.2 86.8 C 54.8 88.6 45.2 88.6 35.8 86.8 C 33 85.8 31.8 82.8 31.4 75.6 C 31 68.4 32 66.2 35 65.4 Z"
            fill="url(#ff-bear-pillow)"
          />
          <path
            d="M 35 65.4 C 44.6 62.3 55.4 62.3 65 65.4 C 68 66.2 69 68.4 68.6 75.6 C 68.2 82.8 67 85.8 64.2 86.8 C 54.8 88.6 45.2 88.6 35.8 86.8 C 33 85.8 31.8 82.8 31.4 75.6 C 31 68.4 32 66.2 35 65.4 Z"
            fill="none" stroke="#aebbec" strokeWidth={0.8} opacity={0.55}
          />
          {/* เงาบาง ๆ ใต้สันหมอน — บอกว่าหมอนพองขึ้นมาอยู่หน้าตัว */}
          <path d="M 35.6 65.6 C 44.9 62.7 55.1 62.7 64.4 65.6 C 63.2 67.8 57 68.8 50 68.8 C 43 68.8 36.8 67.8 35.6 65.6 Z" fill="#8e9fdb" opacity={0.16} />
          {/* รอยจีบมุมหมอน + ตะเข็บประรอบใบ */}
          <path d="M 34 67 q 2.8 1.9 4.4 4.2 M 66 67 q -2.8 1.9 -4.4 4.2 M 33.6 85.4 q 2.9 -1.9 4.5 -4.2 M 66.4 85.4 q -2.9 -1.9 -4.5 -4.2" stroke="#b7c3ef" strokeWidth={0.9} fill="none" strokeLinecap="round" opacity={0.7} />
          <path
            d="M 36.6 67.4 C 45.2 64.9 54.8 64.9 63.4 67.4 C 65.8 68 66.6 69.6 66.3 75.6 C 66 81.6 65 84.2 62.8 84.9 C 54.6 86.4 45.4 86.4 37.2 84.9 C 35 84.2 34 81.6 33.7 75.6 C 33.4 69.6 34.2 68 36.6 67.4 Z"
            fill="none" stroke="#b9c6ee" strokeWidth={0.8} strokeDasharray="2.2 2.6" opacity={0.7}
          />
          {/* แสงวูบบนผ้า */}
          <path className="ff-shimmer" d="M 36.8 71.4 Q 42.6 68.4 48.8 69.2" stroke="#ffffff" strokeWidth={2.8} fill="none" strokeLinecap="round" opacity={0.55} style={{ animationDuration: "4.2s" }} />
          {/* รอยปะรูปหัวใจ เย็บด้วยด้ายชมพู — ร่องรอยของหมอนที่ถูกรักมานาน */}
          <path
            d="M 59.5 76.4 C 56.3 74.2 54.2 72.3 54.2 70.1 C 54.2 68.3 55.6 67.2 57 67.2 C 58.1 67.2 58.9 67.8 59.5 68.7 C 60.1 67.8 60.9 67.2 62 67.2 C 63.4 67.2 64.8 68.3 64.8 70.1 C 64.8 72.3 62.7 74.2 59.5 76.4 Z"
            fill="#fbd6df" stroke="#ef9fb4" strokeWidth={1} strokeDasharray="2.2 1.8" strokeLinejoin="round"
          />
          <path d="M 48.6 79.6 l 2 2 M 50.6 79.6 l -2 2 M 52 83.8 l 1.6 1.6 M 53.6 83.8 l -1.6 1.6" stroke="#b9c6ee" strokeWidth={0.8} strokeLinecap="round" opacity={0.65} />
        </g>
        {/* แขนโอบ — เส้นเข้มรองใต้ให้ได้ขอบขนฟู แล้วทับด้วยไล่เฉดอ่อน */}
        <path d="M 30.6 60.5 Q 26.2 73.5 33.6 82.8" stroke="#e7cfa8" strokeWidth={12.6} fill="none" strokeLinecap="round" />
        <path d="M 30.6 60.5 Q 26.2 73.5 33.6 82.8" stroke="url(#ff-bear-limb)" strokeWidth={10.6} fill="none" strokeLinecap="round" />
        <path d="M 69.4 60.5 Q 73.8 73.5 66.4 82.8" stroke="#e7cfa8" strokeWidth={12.6} fill="none" strokeLinecap="round" />
        <path d="M 69.4 60.5 Q 73.8 73.5 66.4 82.8" stroke="url(#ff-bear-limb)" strokeWidth={10.6} fill="none" strokeLinecap="round" />
        <path d="M 28.6 65.4 Q 26.4 70.6 27.8 75.8" stroke="#fdf3e2" strokeWidth={1.6} fill="none" strokeLinecap="round" opacity={0.55} />
        <path d="M 30.4 66.4 Q 28 71.2 29.6 76.4 M 69.6 66.4 Q 72 71.2 70.4 76.4" stroke={furLine} strokeWidth={1} fill="none" strokeLinecap="round" opacity={0.45} />
        <path d="M 24.6 70.4 q -2.2 1 -3 2.8 M 25.4 77.4 q -2.4 .8 -3.4 2.6 M 75.4 70.4 q 2.2 1 3 2.8 M 74.6 77.4 q 2.4 .8 3.4 2.6" stroke="#dcbe94" strokeWidth={1.1} fill="none" strokeLinecap="round" />
        {/* อุ้งเท้าหน้าเกาะขอบหมอนไว้ */}
        <g transform="rotate(-14 38.5 84.2)">
          <ellipse cx={38.5} cy={84.2} rx={7.8} ry={6.4} fill="url(#ff-bear-halo)" />
          <ellipse cx={38.5} cy={84.2} rx={7} ry={5.7} fill="url(#ff-bear-limb)" />
          <ellipse cx={38.5} cy={85.6} rx={3.6} ry={2.6} fill="#f8dcc4" />
          <circle cx={34.6} cy={81.4} r={1.3} fill="#f8dcc4" />
          <circle cx={38.4} cy={80.4} r={1.35} fill="#f8dcc4" />
          <circle cx={42.2} cy={81.4} r={1.3} fill="#f8dcc4" />
        </g>
        <g transform="rotate(14 61.5 84.2)">
          <ellipse cx={61.5} cy={84.2} rx={7.8} ry={6.4} fill="url(#ff-bear-halo)" />
          <ellipse cx={61.5} cy={84.2} rx={7} ry={5.7} fill="url(#ff-bear-limb)" />
          <ellipse cx={61.5} cy={85.6} rx={3.6} ry={2.6} fill="#f8dcc4" />
          <circle cx={65.4} cy={81.4} r={1.3} fill="#f8dcc4" />
          <circle cx={61.6} cy={80.4} r={1.35} fill="#f8dcc4" />
          <circle cx={57.8} cy={81.4} r={1.3} fill="#f8dcc4" />
        </g>
      </g>

      {/* ---- หัว: ซบลงช้า ๆ แบบคนกำลังจะหลับ ---- */}
      <g className="ff-tilt" style={{ transformOrigin: "50px 58px", animationDuration: "7.2s" }}>
        <path d={fluffy(50, 36.7, 27, 22.9, 17, 3)} fill="url(#ff-bear-halo)" />
        {/* หูปุยสองข้าง กระดิกคนละจังหวะ */}
        <g className="ff-ear" style={{ transformOrigin: "31px 31px", animationDuration: "4.4s" }}>
          <path d={fluffy(28.5, 22.5, 10.4, 10.4, 10, 2.4)} fill="url(#ff-bear-halo)" />
          <circle cx={28.5} cy={22.5} r={9.4} fill="url(#ff-bear-head)" />
          <circle cx={27.8} cy={22} r={5.4} fill="url(#ff-bear-earin)" />
          <path d="M 24.8 19.2 q 1.6 -1.4 3.6 -1.6 M 24.2 22.6 q 1.2 -1 2.6 -1.2" stroke="#fbe4de" strokeWidth={0.9} fill="none" strokeLinecap="round" opacity={0.85} />
          <path d="M 22 15.4 q -1.4 -1.4 -1.6 -3 M 26.6 13 q -.6 -1.6 .2 -2.8 M 32.2 13.6 q .8 -1.4 2.2 -2" stroke="#f0d8b8" strokeWidth={1.7} fill="none" strokeLinecap="round" />
        </g>
        <g className="ff-ear" style={{ transformOrigin: "69px 31px", animationDuration: "4.4s", animationDelay: "1.4s" }}>
          <path d={fluffy(71.5, 22.5, 10.4, 10.4, 10, 2.4)} fill="url(#ff-bear-halo)" />
          <circle cx={71.5} cy={22.5} r={9.4} fill="url(#ff-bear-head)" />
          <circle cx={72.2} cy={22} r={5.4} fill="url(#ff-bear-earin)" />
          <path d="M 75.2 19.2 q -1.6 -1.4 -3.6 -1.6 M 75.8 22.6 q -1.2 -1 -2.6 -1.2" stroke="#fbe4de" strokeWidth={0.9} fill="none" strokeLinecap="round" opacity={0.85} />
          <path d="M 78 15.4 q 1.4 -1.4 1.6 -3 M 73.4 13 q .6 -1.6 -.2 -2.8 M 67.8 13.6 q -.8 -1.4 -2.2 -2" stroke="#f0d8b8" strokeWidth={1.7} fill="none" strokeLinecap="round" />
        </g>
        {/* ปอยขนกลางกระหม่อม โยกเบา ๆ */}
        <g className="ff-sway-slow" style={{ transformOrigin: "50px 18px", animationDuration: "4.8s" }}>
          <path
            d="M 46.4 18 Q 45.8 10.6 51.2 7 Q 49.4 11.2 50.2 14.8 Q 53.4 9.6 57.6 8.8 Q 53.8 12.4 53.2 18.4 Z"
            fill="#eaca9f" stroke="#eaca9f" strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round"
          />
          <path d="M 48.8 15.6 Q 48.2 12 50.4 9.6 M 52.6 16 Q 53.6 12.8 55.6 10.8" stroke="#fbeada" strokeWidth={0.9} fill="none" strokeLinecap="round" opacity={0.8} />
        </g>
        <path d={headD} fill="url(#ff-bear-head)" />
        <g clipPath="url(#ff-bear-headclip)">
          {/* แสงหน้าผากซ้ายบน + เงาขอบขวาล่าง + ขอบคางเข้ม = หัวกลมมีมิติ */}
          <ellipse cx={38} cy={23.5} rx={15} ry={8.6} fill="#fffaf0" opacity={0.4} transform="rotate(-18 38 23.5)" />
          <ellipse cx={82} cy={56} rx={26} ry={22} fill={shade} opacity={0.17} />
          <ellipse cx={50} cy={74} rx={32} ry={17} fill={shade} opacity={0.2} />
          {/* เส้นขนบนหัว — ฝั่งสว่างใช้สีอ่อน ฝั่งเงาใช้สีเข้ม */}
          <path
            d="M 33 27.4 q 2.6 -2.6 6 -3.4 M 40.6 22.2 q 2.8 -2.2 6.2 -2.6 M 49.8 20.6 q 3.2 -1.4 6.6 -.6 M 28.8 34 q 2.2 -2.8 5.2 -4"
            stroke={furLite} strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.75}
          />
          <path
            d="M 62 22.6 q 3.4 1 5.8 3.2 M 69 29.4 q 2.6 2 3.8 4.8 M 71.4 39.6 q 1.4 3 .6 6.2 M 27.4 41.4 q -1.2 3 -.4 6.2 M 66.2 50.4 q 2.2 2 2.6 4.8 M 33.4 50.4 q -2.2 2 -2.6 4.8"
            stroke={furLine} strokeWidth={1.1} fill="none" strokeLinecap="round" opacity={0.5}
          />
        </g>
        {/* ปอยขนแก้มยื่นพ้นขอบหน้า */}
        <path
          d="M 25.6 40.6 q -2.8 .6 -4.4 2.6 M 26.4 46.4 q -2.8 1 -4.2 3.2 M 74.4 40.6 q 2.8 .6 4.4 2.6 M 73.6 46.4 q 2.8 1 4.2 3.2"
          stroke="#eed3b0" strokeWidth={1.3} fill="none" strokeLinecap="round"
        />
        {/* ปากกระบอกครีมนุ่ม + ขอบขนรอบปาก */}
        <ellipse cx={50} cy={46.6} rx={13.4} ry={9.8} fill="#f6e3c8" opacity={0.85} />
        <ellipse cx={50} cy={46.4} rx={12.6} ry={9.1} fill="url(#ff-bear-muzzle)" />
        <path d="M 39.4 40.8 q 1.6 -2 4 -2.6 M 60.6 40.8 q -1.6 -2 -4 -2.6" stroke="#f5e2c6" strokeWidth={1.2} fill="none" strokeLinecap="round" />
        {/* จมูกกลมมนมีแสงสะท้อน */}
        <path
          d="M 46 41.6 Q 50 40.1 54 41.6 Q 55.3 43.2 53.6 45.1 Q 51.7 47 50 47 Q 48.3 47 46.4 45.1 Q 44.7 43.2 46 41.6 Z"
          fill="#5b4038"
        />
        <ellipse cx={48.2} cy={42.3} rx={1.7} ry={0.9} fill="#ffffff" opacity={0.4} transform="rotate(-14 48.2 42.3)" />
        <path d="M 50 47 L 50 49.6" stroke="#7b5a4c" strokeWidth={1.2} strokeLinecap="round" />
        {/* ยิ้มหลับ ๆ มุมปากกระดกนิด ๆ */}
        <Smile cx={50} cy={49.8} w={7.6} />
        <path d="M 46.2 49.9 q -1.3 -.5 -1.9 -1.5 M 53.8 49.9 q 1.3 -.5 1.9 -1.5" stroke={FRIEND_INK} strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.65} />
        {/* ตาหลับปุ๋ย + เปลือกตาหนา ๆ และคิ้วบางเบา */}
        <path d="M 33.2 33.8 Q 38.6 30 44 33.8 M 56 33.8 Q 61.4 30 66.8 33.8" stroke="#d9b184" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.75} />
        <SleepyEye cx={38.6} cy={35.4} w={10.4} />
        <SleepyEye cx={61.4} cy={35.4} w={10.4} />
        <path d="M 34.4 28.8 Q 38.6 26.8 42.8 28.4 M 57.2 28.4 Q 61.4 26.8 65.6 28.8" stroke={furLine} strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.6} />
        <Blush cx={31.4} cy={43} r={4.6} opacity={0.38} />
        <Blush cx={68.6} cy={43} r={4.6} opacity={0.38} />
      </g>

      {/* Zzz ลอยขึ้นข้างแก้ม */}
      <g fill={FRIEND_INK} fontFamily="ui-rounded, system-ui, sans-serif" fontWeight={700} opacity={0.72}>
        <text className="ff-drift" x={78.6} y={46} fontSize={13} style={{ animationDelay: "0s" }}>z</text>
        <text className="ff-drift" x={86} y={35.5} fontSize={9.6} style={{ animationDelay: "0.9s" }}>z</text>
        <text className="ff-drift" x={91.6} y={26} fontSize={7} style={{ animationDelay: "1.8s" }}>z</text>
      </g>
    </g>
  );
}

/** น้องกระต่ายนักฟัง — กึ่งเรียล: กะโหลกรีแก้มกว้าง ตาลูกแก้วน้ำตาลเข้มค่อนข้าง หูยาวตั้งคอยฟัง */
function Rabbit() {
  return (
    <g className="ff-bob" style={{ transformOrigin: "50px 85px" }}>
      <defs>
        <linearGradient id="ff-rabbit-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef9f4" />
          <stop offset="100%" stopColor="#f0e0d2" />
        </linearGradient>
        <linearGradient id="ff-rabbit-inner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbd3e6" />
          <stop offset="100%" stopColor="#f2aecd" />
        </linearGradient>
        <radialGradient id="ff-rabbit-iris" cx="0.38" cy="0.32" r="0.85">
          <stop offset="0%" stopColor="#7a5138" />
          <stop offset="45%" stopColor="#46291a" />
          <stop offset="100%" stopColor="#23130c" />
        </radialGradient>
      </defs>
      {/* หูซ้าย — เรียวยาวปลายสอบ กระดิกฟังก่อน */}
      <g className="ff-ear" style={{ transformOrigin: "39.5px 42px", animationDelay: "0s" }}>
        <path d="M 34 42 Q 31 24 37.5 8 Q 39.5 5.5 41.5 8 Q 46.5 24 45.5 42 Z" fill="url(#ff-rabbit-body)" />
        <path d="M 37 40 Q 35.5 26 39 13 Q 39.8 11.5 40.6 13 Q 43.5 26 43 40 Z" fill="url(#ff-rabbit-inner)" />
        <path d="M 34.7 33 Q 34.1 27 35 21.5 M 44.8 33 Q 45.3 27 44.6 21.5" stroke="#e9d5c3" strokeWidth={0.9} fill="none" strokeLinecap="round" />
      </g>
      {/* หูขวา — ปลายงอพับนิด ๆ กระดิกทีหลัง */}
      <g className="ff-ear" style={{ transformOrigin: "60.5px 42px", animationDelay: "0.4s" }}>
        <path d="M 55.8 42 Q 54.2 25 59.5 9.5 Q 61.5 5 65.5 7.5 Q 70 10.5 66.8 15.5 Q 63.8 20 64.8 28 Q 65.8 35 66.4 42 Z" fill="url(#ff-rabbit-body)" />
        <path d="M 58.6 40 Q 57.6 26 61 13.5 Q 62 11 64.2 12.4 Q 66.6 14.2 64.6 18 Q 62.6 22 63.3 29 Q 63.9 34.5 64 40 Z" fill="url(#ff-rabbit-inner)" />
        <path d="M 56.5 33 Q 56 27 56.8 21.5 M 65.8 33 Q 66.2 28 65.6 23.5" stroke="#e9d5c3" strokeWidth={0.9} fill="none" strokeLinecap="round" />
      </g>
      {/* ท่านั่งหมอบ — ลำตัว สะโพกหลังสองข้าง แผงอกสีอ่อน + เส้นขนอก */}
      <ellipse cx={50} cy={72} rx={23} ry={15.5} fill="url(#ff-rabbit-body)" />
      {/* สะโพกขาหลังพับ (ท่าหมอบ) — เติมรอยพับต้นขา + เท้าหลังยาวโผล่หน้าให้รู้ว่าเป็นขา */}
      <ellipse cx={30.5} cy={75} rx={7.5} ry={10} fill="#f3e2d2" />
      <path d="M 34.5 68.5 Q 29 74 31.5 82" stroke="#e0c9b2" strokeWidth={1.1} fill="none" strokeLinecap="round" />
      <ellipse cx={29.5} cy={84.5} rx={7} ry={3.4} fill="#f9ead9" />
      <path d="M 26.5 82.8 L 26.1 86.2 M 30 82.6 L 29.9 86.4" stroke="#dcc0a8" strokeWidth={1} strokeLinecap="round" />
      <ellipse cx={69.5} cy={75} rx={7.5} ry={10} fill="#f3e2d2" />
      <path d="M 65.5 68.5 Q 71 74 68.5 82" stroke="#e0c9b2" strokeWidth={1.1} fill="none" strokeLinecap="round" />
      <ellipse cx={70.5} cy={84.5} rx={7} ry={3.4} fill="#f9ead9" />
      <path d="M 73.5 82.8 L 73.9 86.2 M 70 82.6 L 70.1 86.4" stroke="#dcc0a8" strokeWidth={1} strokeLinecap="round" />
      <ellipse cx={50} cy={76.5} rx={12} ry={9} fill="#fffdf8" />
      <path d="M 45.8 72 Q 46.8 74 46 76 M 50.4 73 Q 51.4 75 50.6 77 M 54.4 72 Q 55.4 74 54.6 76" stroke="#f0dcc6" strokeWidth={1} fill="none" strokeLinecap="round" />
      {/* เท้าหน้าสองข้าง + เส้นนิ้ว */}
      <ellipse cx={42} cy={84.5} rx={6.2} ry={4.2} fill="#f9ead9" />
      <ellipse cx={58} cy={84.5} rx={6.2} ry={4.2} fill="#f9ead9" />
      <path d="M 40 82.6 L 39.8 86.2 M 44 82.6 L 44.2 86.2 M 56 82.6 L 55.8 86.2 M 60 82.6 L 60.2 86.2" stroke="#dcc0a8" strokeWidth={1} fill="none" strokeLinecap="round" />
      {/* หัวทรงกะโหลกกระต่าย — หน้าผากโค้ง แก้มกว้าง คางมนสอบ */}
      <path d="M 50 30.5 C 59.5 30.5 67.5 35.5 69.5 43.5 C 71 50 68.5 56.5 62.5 60.2 C 58.6 62.5 54.4 63.4 50 63.4 C 45.6 63.4 41.4 62.5 37.5 60.2 C 31.5 56.5 29 50 30.5 43.5 C 32.5 35.5 40.5 30.5 50 30.5 Z" fill="url(#ff-rabbit-body)" />
      {/* ขนกระหม่อม + ปุยขนแก้มสองข้าง */}
      <path d="M 45.6 31.6 Q 46.6 28.9 48.6 28.1 M 50.6 31.2 Q 51.6 28.7 53.6 28.3" stroke="#eeddc9" strokeWidth={1.1} fill="none" strokeLinecap="round" />
      <path d="M 31 52 Q 28.6 53 27.8 55.2 M 32.2 55.6 Q 30 56.7 29.4 58.6 M 69 52 Q 71.4 53 72.2 55.2 M 67.8 55.6 Q 70 56.7 70.6 58.6" stroke="#e9d5c3" strokeWidth={1} fill="none" strokeLinecap="round" />
      {/* วงขนสีครีมอ่อนรอบตา (ลายเฉพาะกระต่ายจริง) + ขนคิ้วบาง ๆ */}
      <ellipse cx={36.5} cy={45} rx={6} ry={6.6} fill="#fdf6ec" />
      <ellipse cx={63.5} cy={45} rx={6} ry={6.6} fill="#fdf6ec" />
      <path d="M 32.2 37.6 Q 34.4 36.4 36.8 36.8 M 63.2 36.8 Q 65.6 36.4 67.8 37.6" stroke="#eeddc9" strokeWidth={1} fill="none" strokeLinecap="round" />
      {/* ตากระต่ายจริง — ลูกแก้วน้ำตาลเอสเปรสโซเกือบทั้งดวง วางค่อนไปด้านข้าง รูม่านตาเข้มกว่านิดเดียว */}
      <g className="ff-blink" style={{ transformOrigin: "36.5px 45px" }}>
        <ellipse cx={36.5} cy={45} rx={4.3} ry={4.7} fill="#241811" />
        <circle cx={36.5} cy={45} r={3.9} fill="url(#ff-rabbit-iris)" />
        <circle cx={36.6} cy={45.3} r={2} fill="#150c07" />
        <circle cx={35.2} cy={43.4} r={1.05} fill="#fff" />
        <circle cx={38} cy={46.7} r={0.45} fill="#fff" opacity={0.75} />
        <path d="M 32.5 43.3 Q 36.5 40.5 40.5 43.1" stroke="#241811" strokeWidth={1.2} fill="none" strokeLinecap="round" />
      </g>
      <g className="ff-blink" style={{ transformOrigin: "63.5px 45px", animationDelay: "0.15s" }}>
        <ellipse cx={63.5} cy={45} rx={4.3} ry={4.7} fill="#241811" />
        <circle cx={63.5} cy={45} r={3.9} fill="url(#ff-rabbit-iris)" />
        <circle cx={63.4} cy={45.3} r={2} fill="#150c07" />
        <circle cx={62.2} cy={43.4} r={1.05} fill="#fff" />
        <circle cx={65} cy={46.7} r={0.45} fill="#fff" opacity={0.75} />
        <path d="M 59.5 43.1 Q 63.5 40.5 67.5 43.3" stroke="#241811" strokeWidth={1.2} fill="none" strokeLinecap="round" />
      </g>
      {/* ปากส่วนล่าง — เนินหนวดสองข้าง จุดโคนหนวด และหนวดเส้นบาง */}
      <ellipse cx={50} cy={55.5} rx={8.6} ry={6.2} fill="#fdf6ec" />
      <ellipse cx={46.2} cy={56.8} rx={3.6} ry={2.6} fill="#f6e8d8" />
      <ellipse cx={53.8} cy={56.8} rx={3.6} ry={2.6} fill="#f6e8d8" />
      <path d="M 44.6 55.9 l .01 0 M 46.4 56.7 l .01 0 M 45.4 57.7 l .01 0 M 55.4 55.9 l .01 0 M 53.6 56.7 l .01 0 M 54.6 57.7 l .01 0" stroke="#d9c0ac" strokeWidth={1} fill="none" strokeLinecap="round" />
      <path d="M 42.8 55.4 Q 34 53 27.4 53.8 M 43.2 57 Q 35 56.8 28.4 58.6 M 43.8 58.6 Q 36.4 60.4 30.6 63 M 57.2 55.4 Q 66 53 72.6 53.8 M 56.8 57 Q 65 56.8 71.6 58.6 M 56.2 58.6 Q 63.6 60.4 69.4 63" stroke="#d9c4b2" strokeWidth={0.9} fill="none" strokeLinecap="round" />
      {/* จมูกสามเหลี่ยมมนชมพู + ร่องจมูก — ขยับหยุกหยิกตลอดแบบกระต่ายจริง */}
      <g className="ff-wiggle" style={{ transformOrigin: "50px 52px", animationDuration: "1.1s" }}>
        <path d="M 47.5 50.1 Q 50 49.1 52.5 50.1 Q 53.4 51.1 52.6 52.5 Q 51.2 54.5 50 54.5 Q 48.8 54.5 47.4 52.5 Q 46.6 51.1 47.5 50.1 Z" fill="#e89bb4" />
        <path d="M 48.6 50.9 Q 48.2 51.4 48.5 51.9 M 51.4 50.9 Q 51.8 51.4 51.5 51.9" stroke="#c9748f" strokeWidth={0.7} fill="none" strokeLinecap="round" />
        <ellipse cx={48.9} cy={50.6} rx={0.9} ry={0.5} fill="#fff" opacity={0.4} />
        <path d="M 50 54.5 L 50 57.3" stroke="#c98f9f" strokeWidth={1} strokeLinecap="round" />
      </g>
      {/* ปากแยกรูปตัว Y จากร่องจมูก + แก้มแดงระเรื่อ */}
      <path d="M 50 57.3 Q 48 59.5 45.9 58.7 M 50 57.3 Q 52 59.5 54.1 58.7" stroke={FRIEND_INK} strokeWidth={1.4} fill="none" strokeLinecap="round" opacity={0.85} />
      <Blush cx={32.5} cy={53} r={3.6} opacity={0.35} />
      <Blush cx={67.5} cy={53} r={3.6} opacity={0.35} />
    </g>
  );
}

/** 🐱 น้องแมวกล่อง — แมวส้มแทบบี้กึ่งเรียล ตาเขียวรูม่านตาเส้นตั้ง โผล่จากกล่องพื้นที่ปลอดภัย */
function Cat() {
  const ink = FRIEND_INK;
  const stripe = "#e0873a";
  return (
    <g>
      <defs>
        <radialGradient id="ff-cat-fur" cx="50%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#fdba74" />
        </radialGradient>
        <radialGradient id="ff-cat-iris" cx="50%" cy="40%" r="62%">
          <stop offset="0%" stopColor="#b5cc7a" />
          <stop offset="55%" stopColor="#7fa054" />
          <stop offset="100%" stopColor="#55703a" />
        </radialGradient>
        <linearGradient id="ff-cat-box" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eec897" />
          <stop offset="100%" stopColor="#d9a96d" />
        </linearGradient>
      </defs>
      {/* หางลายปล้อง โผล่ข้างกล่อง */}
      <g className="ff-wiggle" style={{ transformOrigin: "82px 72.5px", animationDuration: "2.6s" }}>
        <path d="M82,72.5 C88.5,70.5 92.3,64.5 92.8,55.8" fill="none" stroke="#f9b46c" strokeWidth="5" strokeLinecap="round" />
        <circle cx="92.8" cy="55.8" r="2.5" fill={stripe} />
        <path d="M86.2,67.4 L89.4,70.5 M88.8,63.6 L92.8,65.4 M90.3,58.7 L94.6,59.4" stroke={stripe} strokeWidth="2.2" />
      </g>
      {/* กล่องกระดาษ (อยู่นิ่ง) เทปกาว + หัวใจวาดมือ */}
      <rect x="17" y="47.5" width="66" height="14" rx="2" fill="#b18354" />
      <rect x="17" y="47.5" width="66" height="4.5" rx="2" fill="#93683f" />
      <rect x="14" y="57" width="72" height="33" rx="2.5" fill="url(#ff-cat-box)" />
      <rect x="14" y="57" width="72" height="3.2" rx="1.6" fill="#f4d7a4" />
      <rect x="46.5" y="57" width="7" height="33" fill="#f7e6c2" opacity="0.9" />
      <path d="M69.2,72.4 C68.4,70.5 65.6,70.7 65.4,72.9 C65.2,75 67.6,76.7 69.2,77.9 C70.8,76.7 73.2,75 73,72.9 C72.8,70.7 70,70.5 69.2,72.4 Z" fill="none" stroke="#e2837f" strokeWidth="1.1" strokeLinecap="round" />
      {/* แมวโผล่หลบในกล่อง */}
      <g className="ff-peek">
        {/* หูแหลม ขนในหู (หูขวากระดิก) */}
        <path d="M32,27 C30.6,19.5 31.6,11.5 34.2,6.9 C39.4,9.7 44.3,14 46.6,19.2 C42,23.8 36.4,26.3 32,27 Z" fill="url(#ff-cat-fur)" />
        <path d="M34.6,23.4 C34,17.8 34.8,12.8 36.3,9.9 C39.8,12.1 43,15.4 44.6,18.9 C41.6,21.4 37.8,23 34.6,23.4 Z" fill="#f9c3b4" />
        <path d="M37.2,20.6 L36.4,14.8 M39.8,19.4 L39,14.4" stroke="#efa090" strokeWidth="0.6" strokeLinecap="round" />
        <g className="ff-ear" style={{ transformOrigin: "61px 22px" }}>
          <path d="M68,27 C69.4,19.5 68.4,11.5 65.8,6.9 C60.6,9.7 55.7,14 53.4,19.2 C58,23.8 63.6,26.3 68,27 Z" fill="url(#ff-cat-fur)" />
          <path d="M65.4,23.4 C66,17.8 65.2,12.8 63.7,9.9 C60.2,12.1 57,15.4 55.4,18.9 C58.4,21.4 62.2,23 65.4,23.4 Z" fill="#f9c3b4" />
          <path d="M62.8,20.6 L63.6,14.8 M60.2,19.4 L61,14.4" stroke="#efa090" strokeWidth="0.6" strokeLinecap="round" />
        </g>
        {/* หัวโหนกแก้มกว้าง + ปอยขนแก้ม + ขนกลางหัว */}
        <path d="M50,17.4 C40.2,17.4 31.8,22.4 29.6,31 C28.2,36.6 29.6,43.2 33.2,48.6 C37.2,54.6 43.2,56.6 50,56.6 C56.8,56.6 62.8,54.6 66.8,48.6 C70.4,43.2 71.8,36.6 70.4,31 C68.2,22.4 59.8,17.4 50,17.4 Z" fill="url(#ff-cat-fur)" />
        <path d="M29.8,38.4 L26.6,40.4 L29.4,41.7 L26.9,44.5 L30.4,44.9 Z M70.2,38.4 L73.4,40.4 L70.6,41.7 L73.1,44.5 L69.6,44.9 Z" fill="#fdba74" />
        <path d="M45.2,18.3 L44.5,15.8 M50,17.6 L50,15.1 M54.8,18.3 L55.5,15.8" stroke="#e8a35c" strokeWidth="0.8" strokeLinecap="round" />
        {/* ลายแทบบี้ ตัว M หน้าผาก + ลายแก้ม */}
        <path d="M50,18.4 C49.7,21 49.7,23.6 50,25.9 M45.3,18.9 C44.7,21.6 45.2,24.1 46.6,26.4 M54.7,18.9 C55.3,21.6 54.8,24.1 53.4,26.4 M41,20.6 C40.7,22.5 41.3,24.3 42.5,25.9 M59,20.6 C59.3,22.5 58.7,24.3 57.5,25.9" fill="none" stroke={stripe} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <path d="M29.9,35.6 Q32.8,35.1 35.2,36.1 M30.6,39.8 Q33.2,39.3 35.4,40.4 M70.1,35.6 Q67.2,35.1 64.8,36.1 M69.4,39.8 Q66.8,39.3 64.6,40.4" fill="none" stroke={stripe} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        {/* ตาแมวจริง ม่านตาเขียวทอง รูม่านตาแนวตั้ง */}
        <g className="ff-blink" style={{ transformOrigin: "40.5px 35px" }}>
          <path d="M35,34.4 Q40.3,29.4 46,36.2 Q40.7,40.6 35,34.4 Z" fill="url(#ff-cat-iris)" />
          <ellipse cx="40.6" cy="35.2" rx="1.3" ry="2.35" fill={ink} />
          <circle cx="39.3" cy="33.6" r="0.95" fill="#fff" />
          <circle cx="42.2" cy="36.6" r="0.45" fill="#fff" opacity="0.75" />
          <path d="M46,36.2 Q40.3,29.2 35,34.4 L33.5,33.3" fill="none" stroke={ink} strokeWidth="1" strokeLinecap="round" />
        </g>
        <g className="ff-blink" style={{ transformOrigin: "59.5px 35px", animationDelay: "0.15s" }}>
          <path d="M65,34.4 Q59.7,29.4 54,36.2 Q59.3,40.6 65,34.4 Z" fill="url(#ff-cat-iris)" />
          <ellipse cx="59.4" cy="35.2" rx="1.3" ry="2.35" fill={ink} />
          <circle cx="58.1" cy="33.6" r="0.95" fill="#fff" />
          <circle cx="61" cy="36.6" r="0.45" fill="#fff" opacity="0.75" />
          <path d="M54,36.2 Q59.7,29.2 65,34.4 L66.5,33.3" fill="none" stroke={ink} strokeWidth="1" strokeLinecap="round" />
        </g>
        {/* แก้มชมพู */}
        <Blush cx={34.2} cy={43.4} r={3.2} color="#f8879b" opacity={0.4} />
        <Blush cx={65.8} cy={43.4} r={3.2} color="#f8879b" opacity={0.4} />
        {/* แผ่นหนวด จมูกชมพู ปาก Y คว่ำ คาง จุดโคนหนวด เส้นหนวด */}
        <ellipse cx="46.2" cy="47.2" rx="4.3" ry="3.1" fill="#fef0dc" />
        <ellipse cx="53.8" cy="47.2" rx="4.3" ry="3.1" fill="#fef0dc" />
        <ellipse cx="50" cy="51.4" rx="2.3" ry="1.5" fill="#fef0dc" />
        <path d="M47.9,42.3 Q50,41.6 52.1,42.3 Q51.5,45.2 50,45.7 Q48.5,45.2 47.9,42.3 Z" fill="#ef9aa2" />
        <path d="M50,45.7 L50,47.7 M50,47.7 Q47.6,49.6 45.4,48.7 M50,47.7 Q52.4,49.6 54.6,48.7" fill="none" stroke={ink} strokeWidth="0.9" strokeLinecap="round" />
        <path d="M44.7,46.3 L44.7,46.35 M45.9,48 L45.9,48.05 M47.3,45.9 L47.3,45.95 M55.3,46.3 L55.3,46.35 M54.1,48 L54.1,48.05 M52.7,45.9 L52.7,45.95" stroke="#d78e54" strokeWidth="0.75" strokeLinecap="round" />
        <path d="M43.8,45.9 Q36.5,43.7 30.8,44.5 M43.9,47.3 Q36.5,47 30.2,48.5 M44.4,48.7 Q38,50.4 32.4,52.4 M56.2,45.9 Q63.5,43.7 69.2,44.5 M56.1,47.3 Q63.5,47 69.8,48.5 M55.6,48.7 Q62,50.4 67.6,52.4" fill="none" stroke="#fffdf6" strokeWidth="0.7" strokeLinecap="round" opacity="0.95" />
        {/* อกฟู + อุ้งเท้าเกาะขอบกล่อง มีเส้นนิ้ว */}
        <path d="M41.5,57 Q44,60.8 47.2,59.2 Q49.2,61.8 51.4,59.4 Q53.6,62 56,59 Q57.6,60.8 58.5,57 Z" fill="#fee9cf" />
        <rect x="35" y="55.8" width="10" height="7.4" rx="3.7" fill="url(#ff-cat-fur)" />
        <rect x="55" y="55.8" width="10" height="7.4" rx="3.7" fill="url(#ff-cat-fur)" />
        <path d="M38.3,59.8 L38.3,62.9 M41.7,59.8 L41.7,62.9 M58.3,59.8 L58.3,62.9 M61.7,59.8 L61.7,62.9" fill="none" stroke={stripe} strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
      </g>
    </g>
  );
}

/** น้องหมาใจดี — ลูกโกลเด้นกึ่งเรียล: กะโหลก-สันจมูกจริง ตาอัลมอนด์ม่านตาอำพัน */
function Dog() {
  return (
    <g className="ff-bob-fast" style={{ transformOrigin: "50px 85px" }}>
      <defs>
        <linearGradient id="ff-dog-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde8c4" />
          <stop offset="100%" stopColor="#f2c286" />
        </linearGradient>
        <linearGradient id="ff-dog-muzzle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdf4de" />
          <stop offset="100%" stopColor="#f3d5a0" />
        </linearGradient>
        <linearGradient id="ff-dog-ear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dfa75f" />
          <stop offset="100%" stopColor="#c08036" />
        </linearGradient>
        <radialGradient id="ff-dog-iris" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0%" stopColor="#d89c4b" />
          <stop offset="55%" stopColor="#9c6426" />
          <stop offset="100%" stopColor="#5f3a14" />
        </radialGradient>
      </defs>
      {/* หางฟูแกว่งรัว ๆ */}
      <g className="ff-tail" style={{ transformOrigin: "70px 72px" }}>
        <ellipse cx={78.5} cy={61} rx={6.5} ry={12.5} fill="url(#ff-dog-body)" transform="rotate(33 78.5 61)" />
        <circle cx={84} cy={51.5} r={4.6} fill="#fdedca" />
        <path d="M 73.5 66 Q 71 69 71.5 72 M 77.8 58 Q 75 60.5 74.6 64" stroke="#e8bd7d" strokeWidth={1.1} fill="none" strokeLinecap="round" />
      </g>
      {/* ลำตัว + แผงอกสีครีมอ่อน */}
      <ellipse cx={50} cy={69} rx={23.5} ry={17} fill="url(#ff-dog-body)" />
      <ellipse cx={50} cy={75.5} rx={12.5} ry={10} fill="#fdf2d9" />
      {/* ปลอกคอมินต์ + ป้ายดาวทองระยิบ */}
      <path d="M 33.5 59.5 Q 50 66.5 66.5 59.5 L 66.5 64.5 Q 50 71.5 33.5 64.5 Z" fill="#a7f3d0" />
      <g className="ff-twinkle" style={{ transformOrigin: "50px 71px" }}>
        <path d="M 50 67.6 l 1.2 2.5 2.7 .35 -2 1.9 .5 2.7 -2.4 -1.35 -2.4 1.35 .5 -2.7 -2 -1.9 2.7 -.35 Z" fill="#fbbf24" />
      </g>
      {/* อุ้งเท้าหน้า + เส้นนิ้ว */}
      <ellipse cx={38.5} cy={84} rx={6.6} ry={4.6} fill="#fbe0ae" />
      <ellipse cx={61.5} cy={84} rx={6.6} ry={4.6} fill="#fbe0ae" />
      <path d="M 36.5 81.6 L 36.3 85.4 M 40.5 81.6 L 40.7 85.4 M 59.5 81.6 L 59.3 85.4 M 63.5 81.6 L 63.7 85.4" stroke="#e2ae6f" strokeWidth={1} fill="none" strokeLinecap="round" />
      {/* หัวทรงกะโหลกจริง — หน้าผากโค้ง แก้มกว้าง คางสอบ */}
      <path d="M 50 18.5 C 60.5 18.5 69 24.5 71 33.5 C 72.6 41 70.4 48.6 64.6 53.4 C 60.4 56.8 55.4 58.4 50 58.4 C 44.6 58.4 39.6 56.8 35.4 53.4 C 29.6 48.6 27.4 41 29 33.5 C 31 24.5 39.5 18.5 50 18.5 Z" fill="url(#ff-dog-body)" />
      {/* ขนกระจุกบนกระหม่อม */}
      <path d="M 45 19.6 Q 45.8 16.2 48.2 15.2 M 50 19 Q 50.6 15.8 53 15 M 54.6 20 Q 56.4 17.4 58.8 17" stroke="#eec488" strokeWidth={1.2} fill="none" strokeLinecap="round" />
      {/* หูตูบพับข้างแก้ม มีเงาด้านใน (ข้างขวากระดิกช้า ๆ) */}
      <path d="M 34 22.8 Q 24.5 25.5 21.5 37 Q 19.8 45.5 24.4 51 Q 28.8 54.6 32.6 50.2 Q 36 45.5 36.4 35.5 Q 36.6 26.5 34 22.8 Z" fill="url(#ff-dog-ear)" />
      <path d="M 31.8 30 Q 27.6 34.5 26.6 44.5 Q 29.4 48.6 31.4 45.4 Q 33.4 40.5 33.2 32.5 Z" fill="#a96e28" opacity={0.45} />
      <g className="ff-wiggle" style={{ transformOrigin: "66px 24px", animationDuration: "3.6s" }}>
        <path d="M 66 22.8 Q 75.5 25.5 78.5 37 Q 80.2 45.5 75.6 51 Q 71.2 54.6 67.4 50.2 Q 64 45.5 63.6 35.5 Q 63.4 26.5 66 22.8 Z" fill="url(#ff-dog-ear)" />
        <path d="M 68.2 30 Q 72.4 34.5 73.4 44.5 Q 70.6 48.6 68.6 45.4 Q 66.6 40.5 66.8 32.5 Z" fill="#a96e28" opacity={0.45} />
      </g>
      {/* ลายคิ้วสีแทน */}
      <ellipse cx={38} cy={31.5} rx={3.8} ry={2} fill="#f0c184" opacity={0.85} />
      <ellipse cx={62} cy={31.5} rx={3.8} ry={2} fill="#f0c184" opacity={0.85} />
      {/* ตาหมาจริง — วงรีอัลมอนด์ ม่านตาอำพันเต็มตา รูม่านตากลม ขอบเปลือกตาบน */}
      <g className="ff-blink" style={{ transformOrigin: "38.5px 38.5px" }}>
        <ellipse cx={38.5} cy={38.5} rx={4.6} ry={3.8} fill="#33231a" />
        <ellipse cx={41.7} cy={39.2} rx={1} ry={1.5} fill="#efe6d8" opacity={0.7} />
        <circle cx={38.1} cy={38.6} r={3.15} fill="url(#ff-dog-iris)" />
        <circle cx={38.3} cy={38.9} r={1.55} fill="#1c120c" />
        <circle cx={37} cy={37.3} r={0.95} fill="#fff" />
        <circle cx={39.6} cy={40.2} r={0.42} fill="#fff" opacity={0.8} />
        <path d="M 34.2 37 Q 38.5 33.8 42.8 36.8" fill="none" stroke="#33231a" strokeWidth={1.3} strokeLinecap="round" />
      </g>
      <g className="ff-blink" style={{ transformOrigin: "61.5px 38.5px", animationDelay: "0.15s" }}>
        <ellipse cx={61.5} cy={38.5} rx={4.6} ry={3.8} fill="#33231a" />
        <ellipse cx={58.3} cy={39.2} rx={1} ry={1.5} fill="#efe6d8" opacity={0.7} />
        <circle cx={61.9} cy={38.6} r={3.15} fill="url(#ff-dog-iris)" />
        <circle cx={61.7} cy={38.9} r={1.55} fill="#1c120c" />
        <circle cx={60.6} cy={37.3} r={0.95} fill="#fff" />
        <circle cx={63.2} cy={40.2} r={0.42} fill="#fff" opacity={0.8} />
        <path d="M 57.2 36.8 Q 61.5 33.8 65.8 37" fill="none" stroke="#33231a" strokeWidth={1.3} strokeLinecap="round" />
      </g>
      {/* สันจมูกยื่น + รอยหักหน้าผาก (stop) + จมูกสามเหลี่ยมมนใหญ่ */}
      <ellipse cx={50} cy={50.5} rx={11} ry={8.5} fill="url(#ff-dog-muzzle)" />
      <path d="M 45.5 43.2 Q 50 41.6 54.5 43.2" fill="none" stroke="#eec08a" strokeWidth={1} strokeLinecap="round" />
      <path d="M 45.2 44.4 Q 50 42.8 54.8 44.4 Q 55.9 45.5 55 47.5 Q 52.8 51 50 51 Q 47.2 51 45 47.5 Q 44.1 45.5 45.2 44.4 Z" fill="#453029" />
      <path d="M 47.7 45.7 Q 47 46.5 47.7 47.4 M 52.3 45.7 Q 53 46.5 52.3 47.4" fill="none" stroke="#241812" strokeWidth={0.9} strokeLinecap="round" />
      <ellipse cx={47.8} cy={44.8} rx={1.5} ry={0.8} fill="#fff" opacity={0.3} />
      {/* ร่องจมูก + ปากอ้ายิ้ม + ลิ้นชมพู */}
      <path d="M 50 51 L 50 54" stroke="#c99a67" strokeWidth={1.1} strokeLinecap="round" />
      <path d="M 44.8 53.8 Q 50 55.6 55.2 53.8 Q 54.2 60.4 50 60.4 Q 45.8 60.4 44.8 53.8 Z" fill="#6d3a44" />
      <ellipse cx={50} cy={59} rx={3.3} ry={2.4} fill="#ff8aa6" />
      {/* แก้มแดงระเรื่อ + ขนแก้มฟู */}
      <Blush cx={33.5} cy={47.5} r={3.6} opacity={0.35} />
      <Blush cx={66.5} cy={47.5} r={3.6} opacity={0.35} />
      <path d="M 34.6 52.4 Q 32.4 53.6 31.6 55.6 M 65.4 52.4 Q 67.6 53.6 68.4 55.6" stroke="#eec488" strokeWidth={1.1} fill="none" strokeLinecap="round" />
    </g>
  );
}

/** 🦥 น้องสลอธชิล ๆ — สลอธสามนิ้วกึ่งเรียล หน้ากากคาดตา ตากึ่งหลับ เกาะกิ่งด้วยเล็บตะขอ */
function Sloth() {
  return (
    <g>
      <defs>
        <linearGradient id="ff-sloth-a-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#dcc7ab" />
          <stop offset="100%" stopColor="#b79b7c" />
        </linearGradient>
        <linearGradient id="ff-sloth-a-branch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b08a63" />
          <stop offset="100%" stopColor="#8f6b47" />
        </linearGradient>
        <radialGradient id="ff-sloth-a-face" cx="0.5" cy="0.42" r="0.75">
          <stop offset="0%" stopColor="#f4e9d6" />
          <stop offset="100%" stopColor="#e2cfae" />
        </radialGradient>
      </defs>
      {/* กิ่งไม้อยู่นิ่ง — ลายเปลือกไม้ + ใบมิ้นต์สองใบ */}
      <rect x={6} y={13} width={88} height={8} rx={4} fill="url(#ff-sloth-a-branch)" />
      <path d="M 13 16.2 q 7 1.6 13 .6 M 45 18.6 q 6 1.2 11 .2 M 74 15.8 q 6 1.4 11 .6" stroke="#7c5a3a" strokeWidth={0.9} fill="none" strokeLinecap="round" opacity={0.55} />
      <ellipse cx={14} cy={10.2} rx={5} ry={2.8} fill="#86efac" transform="rotate(-22 14 10.2)" />
      <ellipse cx={87} cy={9.8} rx={4.2} ry={2.5} fill="#a7f3d0" transform="rotate(18 87 9.8)" />
      {/* ทั้งตัวห้อยแกว่งช้า ๆ จากจุดเกาะ เหมือนลูกตุ้มไม่เร่งรีบ */}
      <g className="ff-sway-slow" style={{ transformOrigin: "50px 18px" }}>
        {/* แขนยาวกว่าลำตัว — เส้นเงาและปอยขนตามแขนแบบสลอธจริง */}
        <path d="M 33.5 18 Q 29.5 36 36.5 50.5" stroke="#c8ad8b" strokeWidth={8.6} fill="none" strokeLinecap="round" />
        <path d="M 66.5 18 Q 70.5 36 63.5 50.5" stroke="#c8ad8b" strokeWidth={8.6} fill="none" strokeLinecap="round" />
        <path d="M 36.9 23 Q 33.8 36 38.6 47 M 63.1 23 Q 66.2 36 61.4 47" stroke="#a98a67" strokeWidth={1.1} fill="none" strokeLinecap="round" opacity={0.7} />
        <path d="M 29.6 33 q -2.6 1.2 -3.4 3.4 M 31 42 q -2.4 1.4 -2.8 3.6 M 70.4 33 q 2.6 1.2 3.4 3.4 M 69 42 q 2.4 1.4 2.8 3.6" stroke="#b1946f" strokeWidth={1} fill="none" strokeLinecap="round" />
        {/* อุ้งมือ + เล็บตะขอยาวสามเล่ม เกี่ยวข้ามสันกิ่งไปฝั่งไกล เกาะแน่นแบบไม่ออกแรง */}
        <ellipse cx={33.5} cy={19.5} rx={5} ry={4.4} fill="#c8ad8b" />
        <ellipse cx={66.5} cy={19.5} rx={5} ry={4.4} fill="#c8ad8b" />
        <path d="M 29.6 21.8 Q 27.4 10.4 32.6 9.6 Q 35.4 9.6 34.6 13.8 M 33.2 22.4 Q 31.6 9 37 9.2 Q 39.6 9.6 38.6 13.4 M 36.8 22 Q 36 10 41 10.4 Q 43.4 11 42.4 14.2" stroke="#8a6c4e" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <path d="M 70.4 21.8 Q 72.6 10.4 67.4 9.6 Q 64.6 9.6 65.4 13.8 M 66.8 22.4 Q 68.4 9 63 9.2 Q 60.4 9.6 61.4 13.4 M 63.2 22 Q 64 10 59 10.4 Q 56.6 11 57.6 14.2" stroke="#8a6c4e" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        {/* ลำตัวทรงถุงนุ่มห้อยลง — ไหล่สอบ ก้นกลมตามแรงโน้มถ่วง */}
        <path d="M 50 42.5 C 58.5 42.5 64.5 47 66.5 54 C 69 62.5 68.5 72 62.5 77.5 C 58.5 81.2 54.5 82.6 50 82.6 C 45.5 82.6 41.5 81.2 37.5 77.5 C 31.5 72 31 62.5 33.5 54 C 35.5 47 41.5 42.5 50 42.5 Z" fill="url(#ff-sloth-a-body)" />
        {/* ปอยขนยาวแตกขอบตัว + เส้นขนช่วงพุง */}
        <path d="M 33.2 58 q -3 1 -4 3.2 M 34.6 68 q -2.8 1.4 -3.4 3.8 M 41 78.6 q -1.6 2.2 -1 4.4 M 47.6 82.4 q -.5 2.4 .5 4.2 M 66.8 58 q 3 1 4 3.2 M 65.4 68 q 2.8 1.4 3.4 3.8 M 59 78.6 q 1.6 2.2 1 4.4 M 54.4 82.4 q .5 2.4 -.5 4.2" stroke="#9b7b5b" strokeWidth={1.2} fill="none" strokeLinecap="round" />
        <path d="M 43 70 q 1 2.6 -.2 5 M 50 71.4 q 1 2.6 0 5.2 M 57 70 q -1 2.6 .2 5" stroke="#cbb08d" strokeWidth={1} fill="none" strokeLinecap="round" opacity={0.8} />
        {/* คราบตะไคร่เขียวจาง ๆ บนไหล่กับหลัง — เสน่ห์สลอธป่าตัวจริง */}
        <ellipse cx={36} cy={49} rx={4.6} ry={2.9} fill="#a8c8a0" opacity={0.3} transform="rotate(-24 36 49)" />
        <ellipse cx={65.5} cy={60} rx={4} ry={2.5} fill="#a8c8a0" opacity={0.26} transform="rotate(18 65.5 60)" />
        <ellipse cx={59.5} cy={75.5} rx={4.4} ry={2.6} fill="#a8c8a0" opacity={0.2} transform="rotate(-10 59.5 75.5)" />
        {/* กรอบขนหัวสีเข้มฟูรอบหน้า + แผ่นหน้าซีดกลม */}
        <ellipse cx={50} cy={52.5} rx={16.6} ry={13.8} fill="#ab8d68" />
        <path d="M 36.4 43.4 q -2 -1.6 -2.4 -3.8 M 43.6 39.6 q -.8 -1.8 -.2 -3.4 M 52 38.9 q .4 -2 2 -3.4 M 60 41.4 q 1.6 -1.8 3.8 -2.2 M 65.4 47.6 q 2.2 -.8 4.2 .2 M 34.4 49.6 q -2.2 -.6 -4.2 .4" stroke="#9b7b5b" strokeWidth={1.2} fill="none" strokeLinecap="round" />
        <ellipse cx={50} cy={53} rx={14.2} ry={11.8} fill="url(#ff-sloth-a-face)" />
        {/* ปื้นคาดตาสีน้ำตาลเข้ม ไหลเฉียงจากตาลงหาขมับ — ลายประจำสลอธสามนิ้ว */}
        <path d="M 46 48 Q 47.2 50.6 45.4 53.4 Q 42.4 57.8 37.8 59.9 Q 34.7 61 33.8 58.6 Q 33.1 56.3 35.5 53.1 Q 38.2 49.4 40.9 47.4 Q 44.7 45.1 46 48 Z" fill="#6e4f36" />
        <path d="M 54 48 Q 52.8 50.6 54.6 53.4 Q 57.6 57.8 62.2 59.9 Q 65.3 61 66.2 58.6 Q 66.9 56.3 64.5 53.1 Q 61.8 49.4 59.1 47.4 Q 55.3 45.1 54 48 Z" fill="#6e4f36" />
        {/* ตากระดุมกลมเล็ก เปลือกตาหนักปิดขอบบน — สายตาชิลกึ่งหลับกึ่งตื่น */}
        <g className="ff-blink" style={{ transformOrigin: "42.5px 51px" }}>
          <circle cx={42.5} cy={51} r={2.7} fill="#241811" />
          <circle cx={41.6} cy={51.5} r={0.6} fill="#fff" opacity={0.9} />
          <ellipse cx={42.5} cy={48.8} rx={3.1} ry={1.8} fill="#7a583c" />
          <path d="M 39.9 50.3 Q 42.5 49.2 45.1 50.3" stroke="#2a1a10" strokeWidth={1} fill="none" strokeLinecap="round" />
        </g>
        <g className="ff-blink" style={{ transformOrigin: "57.5px 51px", animationDelay: "0.15s" }}>
          <circle cx={57.5} cy={51} r={2.7} fill="#241811" />
          <circle cx={56.6} cy={51.5} r={0.6} fill="#fff" opacity={0.9} />
          <ellipse cx={57.5} cy={48.8} rx={3.1} ry={1.8} fill="#7a583c" />
          <path d="M 54.9 50.3 Q 57.5 49.2 60.1 50.3" stroke="#2a1a10" strokeWidth={1} fill="none" strokeLinecap="round" />
        </g>
        {/* จมูกแบนกว้างเล็ก + รอยยิ้มติดหน้าตลอดตามธรรมชาติสลอธ */}
        <path d="M 46.9 56.1 Q 50 55.2 53.1 56.1 Q 54.1 57.1 53.3 58.5 Q 51.7 60.2 50 60.2 Q 48.3 60.2 46.7 58.5 Q 45.9 57.1 46.9 56.1 Z" fill="#3e2c20" />
        <path d="M 48.3 57 Q 48 57.6 48.4 58.2 M 51.7 57 Q 52 57.6 51.6 58.2" stroke="#1f140c" strokeWidth={0.7} fill="none" strokeLinecap="round" />
        <ellipse cx={48.6} cy={56.4} rx={1} ry={0.5} fill="#fff" opacity={0.25} />
        <Smile cx={50} cy={62} w={7.5} />
        <path d="M 46.3 62 q -1.2 -.4 -1.8 -1.2 M 53.7 62 q 1.2 -.4 1.8 -1.2" stroke={FRIEND_INK} strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.7} />
        <Blush cx={42.5} cy={61.8} r={2.9} opacity={0.35} />
        <Blush cx={57.5} cy={61.8} r={2.9} opacity={0.35} />
        {/* เท้าจิ๋วห้อยต่องแต่ง ขยับเบา ๆ พร้อมเล็บสั้นชี้ลง */}
        <g className="ff-wiggle" style={{ transformOrigin: "41px 78px", animationDuration: "3.8s" }}>
          <ellipse cx={41} cy={80.8} rx={5.2} ry={3.9} fill="#c8ad8b" />
          <path d="M 38.6 83.4 q -.3 2.4 .9 3.6 M 41.4 84 q -.2 2.4 1 3.4" stroke="#8a6c4e" strokeWidth={1.6} fill="none" strokeLinecap="round" />
        </g>
        <g className="ff-wiggle" style={{ transformOrigin: "59px 78px", animationDuration: "3.8s", animationDelay: "1.9s" }}>
          <ellipse cx={59} cy={80.8} rx={5.2} ry={3.9} fill="#c8ad8b" />
          <path d="M 61.4 83.4 q .3 2.4 -.9 3.6 M 58.6 84 q .2 2.4 -1 3.4" stroke="#8a6c4e" strokeWidth={1.6} fill="none" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}

/** น้องนกฮูกนักปราชญ์ — ฮูกเขาใหญ่กึ่งเรียล: จานหน้า ตาอำพัน จะงอยงุ้ม ลายอกริ้ว แต่ยังกลมน่ากอดและใส่แว่นหนาเตอะ */
function Owl() {
  return (
    <g className="ff-bob" style={{ transformOrigin: "50px 85px", animationDuration: "3.4s" }}>
      <defs>
        <linearGradient id="ff-owl-b-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d8ccf0" />
          <stop offset="100%" stopColor="#a78bda" />
        </linearGradient>
        <linearGradient id="ff-owl-b-wing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b79ae0" />
          <stop offset="100%" stopColor="#8b6cc9" />
        </linearGradient>
        <radialGradient id="ff-owl-b-disc" cx="0.5" cy="0.42" r="0.75">
          <stop offset="0%" stopColor="#faf6ff" />
          <stop offset="100%" stopColor="#e6dbf6" />
        </radialGradient>
        <radialGradient id="ff-owl-b-iris" cx="0.38" cy="0.32" r="0.8">
          <stop offset="0%" stopColor="#f8e09a" />
          <stop offset="45%" stopColor="#f5cf6b" />
          <stop offset="100%" stopColor="#c8891f" />
        </radialGradient>
      </defs>
      {/* ลำตัวป้อมกลมสีลาเวนเดอร์ — เงาทรงเดียวกับแก๊งเพื่อนปุย */}
      <ellipse cx={50} cy={60} rx={25} ry={26} fill="url(#ff-owl-b-body)" />
      {/* อกซีด + ริ้วขนแนวตั้งสามแถวแบบฮูกเขาใหญ่ */}
      <ellipse cx={50} cy={68.5} rx={14.5} ry={14.5} fill="#f3eefb" />
      <path d="M 44 60.5 q -.8 3 .2 5.8 M 50 59.5 q .8 3.2 -.2 6.2 M 56 60.5 q .8 3 -.2 5.8" stroke="#8b6cc9" strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.75} />
      <path d="M 41.5 69 q -.6 2.8 .3 5.4 M 47 68.5 q .7 2.9 -.2 5.7 M 53 68.5 q -.7 2.9 .2 5.7 M 58.5 69 q .6 2.8 -.3 5.4" stroke="#8b6cc9" strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.7} />
      <path d="M 44.8 77.6 q -.5 2.3 .3 4.4 M 50.4 77.8 q .5 2.3 -.3 4.4 M 55.6 77.2 q .4 2.2 -.3 4.2" stroke="#9b7fd0" strokeWidth={1.1} fill="none" strokeLinecap="round" opacity={0.65} />
      {/* หนังสือชมพูเล่มโปรด — วาดก่อนแล้วให้ปีกขวาพับทับเป็นการหนีบ */}
      <g transform="rotate(18 77 70)">
        <rect x={70.5} y={61.5} width={12.5} height={16.5} rx={2.5} fill="#fda4af" />
        <line x1={73.4} y1={63.6} x2={73.4} y2={76} stroke="#ffe4e6" strokeWidth={1.4} strokeLinecap="round" />
      </g>
      {/* ปีกพับข้างซ้าย — ปลายขนบินซ้อนกัน 3 แถว */}
      <path d="M 30 45 C 24.5 50 22.8 58 24.4 66 C 25.8 73.5 29.5 78.5 34.5 80 C 37.5 74 38.2 64 36.6 56 C 35.4 50 33 46 30 45 Z" fill="url(#ff-owl-b-wing)" />
      <path d="M 25.2 61.5 q 3.2 2.8 6.2 .5 q 2.6 2 4.6 .3 M 26.4 69 q 3 2.8 5.8 .5 q 2.3 1.9 4 .3 M 28.8 75.8 q 2.8 2.6 5.2 .4" stroke="#7454ad" strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.85} />
      {/* ปีกพับข้างขวา — ทับสันหนังสือให้ดูหนีบแน่น */}
      <path d="M 70 45 C 75.5 50 77.2 58 75.6 66 C 74.2 73.5 70.5 78.5 65.5 80 C 62.5 74 61.8 64 63.4 56 C 64.6 50 67 46 70 45 Z" fill="url(#ff-owl-b-wing)" />
      <path d="M 74.8 61.5 q -3.2 2.8 -6.2 .5 q -2.6 2 -4.6 .3 M 73.6 69 q -3 2.8 -5.8 .5 q -2.3 1.9 -4 .3 M 71.2 75.8 q -2.8 2.6 -5.2 .4" stroke="#7454ad" strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.85} />
      {/* กิ่งไม้เกาะ + นิ้วเท้าขนฟู กรงเล็บเล็กเกี่ยวหน้ากิ่ง */}
      <rect x={26} y={86.5} width={48} height={5} rx={2.5} fill="#b08a63" />
      <path d="M 32 88.6 q 6 1.2 11 .4 M 57 88.8 q 6 1 10 .2" stroke="#8f6b47" strokeWidth={0.8} fill="none" strokeLinecap="round" opacity={0.6} />
      <ellipse cx={41.5} cy={84.8} rx={5.4} ry={3.6} fill="#e9def8" />
      <ellipse cx={58.5} cy={84.8} rx={5.4} ry={3.6} fill="#e9def8" />
      <path d="M 39.5 82.8 q -.5 1.4 -.1 2.8 M 43.5 82.8 q .5 1.4 .1 2.8 M 56.5 82.8 q -.5 1.4 -.1 2.8 M 60.5 82.8 q .5 1.4 .1 2.8" stroke="#c4aee6" strokeWidth={0.9} fill="none" strokeLinecap="round" />
      <path d="M 38.6 86.4 q -.2 2.6 -1.5 3.6 M 41.6 87 q 0 2.6 -1.1 3.7 M 44.6 86.4 q .3 2.5 1.3 3.5 M 55.4 86.4 q .2 2.6 1.5 3.6 M 58.4 87 q 0 2.6 1.1 3.7 M 61.4 86.4 q -.3 2.5 -1.3 3.5" stroke="#6b563f" strokeWidth={1.3} fill="none" strokeLinecap="round" />
      {/* ชุดหัวทั้งหมด — เอียงคอครุ่นคิดรอบฐานคอแบบนักปราชญ์ */}
      <g className="ff-tilt" style={{ transformOrigin: "50px 57px" }}>
        {/* จุกหูขนนกสองข้าง (ข้างซ้ายกระดิกเป็นครั้งคราว) */}
        <g className="ff-ear" style={{ transformOrigin: "34.5px 29px" }}>
          <path d="M 29.5 29.5 Q 25.8 19.5 29.8 11.5 Q 36.8 15.5 38.8 27 Q 34 30.5 29.5 29.5 Z" fill="url(#ff-owl-b-body)" />
          <path d="M 31.6 26.5 Q 29.8 20.5 31 14.8 M 34.9 27 Q 33.9 21 35 16.8" stroke="#8b6cc9" strokeWidth={1} fill="none" strokeLinecap="round" opacity={0.7} />
          <path d="M 28.5 13.6 q -.2 -2.2 .8 -3.6 M 31.5 12.6 q .3 -2 1.5 -3" stroke="#a78bda" strokeWidth={1.1} fill="none" strokeLinecap="round" />
        </g>
        <path d="M 70.5 29.5 Q 74.2 19.5 70.2 11.5 Q 63.2 15.5 61.2 27 Q 66 30.5 70.5 29.5 Z" fill="url(#ff-owl-b-body)" />
        <path d="M 68.4 26.5 Q 70.2 20.5 69 14.8 M 65.1 27 Q 66.1 21 65 16.8" stroke="#8b6cc9" strokeWidth={1} fill="none" strokeLinecap="round" opacity={0.7} />
        <path d="M 71.5 13.6 q .2 -2.2 -.8 -3.6 M 68.5 12.6 q -.3 -2 -1.5 -3" stroke="#a78bda" strokeWidth={1.1} fill="none" strokeLinecap="round" />
        {/* หัวกลม + เส้นขนสั้นบนกระหม่อมและท้ายทอย */}
        <circle cx={50} cy={38} r={20} fill="url(#ff-owl-b-body)" />
        <path d="M 44.5 20.4 q 1 -2.4 3 -3.2 M 50.4 19.4 q .6 -2.4 2.6 -3 M 56 20.6 q 1.6 -2 3.6 -2.4" stroke="#b79ae0" strokeWidth={1.1} fill="none" strokeLinecap="round" />
        <path d="M 31 33.5 q -2.2 .8 -3.3 2.4 M 69 33.5 q 2.2 .8 3.3 2.4" stroke="#b79ae0" strokeWidth={1.1} fill="none" strokeLinecap="round" />
        {/* จานหน้า (facial disc) ครีมลาเวนเดอร์ — บุ๋มเป็นรูปตัว V กลางหว่างตา */}
        <path d="M 50 35.8 C 46.5 31.5 39 30.5 34 34.5 C 29 38.5 27.8 45.5 31 50.5 C 34.5 56 42 58.8 50 58.8 C 58 58.8 65.5 56 69 50.5 C 72.2 45.5 71 38.5 66 34.5 C 61 30.5 53.5 31.5 50 35.8 Z" fill="url(#ff-owl-b-disc)" />
        {/* ขอบจานหน้า — ขีดขนสั้นแผ่รัศมีรอบวง */}
        <path d="M 34.3 34.6 l -2.3 -1.9 M 30.5 38.8 l -2.7 -1.1 M 29.3 44.3 l -2.9 -.2 M 30.5 49.6 l -2.6 1.1 M 33.7 53.8 l -2.1 1.9 M 38.5 56.8 l -1.4 2.3 M 44.4 58.4 l -.6 2.5 M 65.7 34.6 l 2.3 -1.9 M 69.5 38.8 l 2.7 -1.1 M 70.7 44.3 l 2.9 -.2 M 69.5 49.6 l 2.6 1.1 M 66.3 53.8 l 2.1 1.9 M 61.5 56.8 l 1.4 2.3 M 55.6 58.4 l .6 2.5 M 47.9 33.6 l -1 -2.3 M 52.1 33.6 l 1 -2.3" stroke="#8b6cc9" strokeWidth={1} fill="none" strokeLinecap="round" opacity={0.8} />
        {/* ตาฮูกจริง — ม่านตาอำพันทองเกือบเต็มดวง รูม่านตากลมโต ขอบตาเข้มบาง */}
        <g className="ff-blink" style={{ transformOrigin: "40.5px 43px" }}>
          <circle cx={40.5} cy={43} r={6.5} fill="#3a2a17" />
          <circle cx={40.5} cy={43} r={5.8} fill="url(#ff-owl-b-iris)" />
          <circle cx={40.5} cy={43.2} r={2.85} fill="#1a120a" />
          <circle cx={38.9} cy={41.3} r={1.2} fill="#fff" />
          <circle cx={42.7} cy={45.1} r={0.55} fill="#fff" opacity={0.8} />
        </g>
        <g className="ff-blink" style={{ transformOrigin: "59.5px 43px", animationDelay: "0.15s" }}>
          <circle cx={59.5} cy={43} r={6.5} fill="#3a2a17" />
          <circle cx={59.5} cy={43} r={5.8} fill="url(#ff-owl-b-iris)" />
          <circle cx={59.5} cy={43.2} r={2.85} fill="#1a120a" />
          <circle cx={57.9} cy={41.3} r={1.2} fill="#fff" />
          <circle cx={61.7} cy={45.1} r={0.55} fill="#fff" opacity={0.8} />
        </g>
        {/* แว่นกรอบหนาเตอะคู่ใจ — วงเลนส์เลาะขอบนอกดวงตาพอดี */}
        <circle cx={40.5} cy={43} r={8.4} fill="rgba(255,255,255,0.18)" stroke="#6d4fc0" strokeWidth={2.4} />
        <circle cx={59.5} cy={43} r={8.4} fill="rgba(255,255,255,0.18)" stroke="#6d4fc0" strokeWidth={2.4} />
        <path d="M 48.7 41.2 Q 50 39.8 51.3 41.2" stroke="#6d4fc0" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <path d="M 32.1 41.8 L 27.8 39.6 M 67.9 41.8 L 72.2 39.6" stroke="#6d4fc0" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        {/* จะงอยสั้นแหลมงุ้มลง — อยู่ต่ำหว่างตาในจานหน้าแบบฮูกจริง */}
        <path d="M 47.5 47.6 Q 50 46.6 52.5 47.6 Q 53.4 49.3 51.8 51.8 Q 50.7 53.6 50.1 54.4 Q 49.7 54.8 49.4 54.2 Q 47.5 51.2 46.9 49.4 Q 46.6 48.1 47.5 47.6 Z" fill="#e8b04b" />
        <path d="M 50.7 52.4 Q 50.5 53.6 49.9 54.4" stroke="#b57f22" strokeWidth={0.9} fill="none" strokeLinecap="round" />
        <ellipse cx={48.9} cy={48.3} rx={1.1} ry={0.55} fill="#fff" opacity={0.4} />
        {/* แก้มระเรื่อริมล่างของจานหน้า */}
        <Blush cx={33.8} cy={51.5} r={3} opacity={0.35} />
        <Blush cx={66.2} cy={51.5} r={3} opacity={0.35} />
      </g>
    </g>
  );
}

/** ☁️ น้องก้อนเมฆนุ่มนิ่ม — คิวมูลัสกึ่งเรียล: ฐานแบนติดเงา ยอดฟูซ้อนกันเป็นดอกกะหล่ำ
 *  ขอบบน-ซ้ายรับแดดจนเรืองขาว ปุยลูกหลงลอยคนละจังหวะ และรุ้งพาสเทลโผล่ใต้ฐานเป็น "ขา" */
function Cloud() {
  type Puff = { cx: number; cy: number; r: number; ry?: number };
  const star = "M 0 -4.4 Q 1 -1 4.4 0 Q 1 1 0 4.4 Q -1 1 -4.4 0 Q -1 -1 0 -4.4 Z";
  /* ยอดคิวมูลัสชั้นหลัง (ก้อนใหญ่ซ้อนกันเป็นดอกกะหล่ำ) */
  const back: Puff[] = [
    { cx: 38, cy: 47, r: 16 },
    { cx: 57, cy: 42, r: 19 },
    { cx: 70, cy: 50, r: 14 },
    { cx: 25, cy: 59, r: 13 },
    { cx: 78, cy: 58, r: 13 },
  ];
  /* พูหน้าที่แบกใบหน้า + ก้อนแบนหยักตรงฐาน (ฐานคิวมูลัสจริงแบนแต่ไม่เรียบกริบ) */
  const front: Puff[] = [
    { cx: 48, cy: 57, r: 16 },
    { cx: 31, cy: 68.5, r: 11, ry: 8.5 },
    { cx: 64, cy: 69, r: 9.5, ry: 8 },
  ];
  /* เส้นริมบน-ซ้ายของก้อน = ขอบที่รับแดดจนเรืองขาว */
  const rimArc = (p: Puff) =>
    `M ${(p.cx - p.r * 0.94).toFixed(1)} ${(p.cy - p.r * 0.34).toFixed(1)} A ${p.r} ${p.r} 0 0 1 ${(p.cx + p.r * 0.24).toFixed(1)} ${(p.cy - p.r * 0.97).toFixed(1)}`;
  /* ก้อนหน้าทิ้งเงาเสี้ยวไว้บนก้อนหลัง — วาดจานเงาก่อนแล้วให้ตัวก้อนบังทับ เหลือเสี้ยวที่ขอบล่าง
     (ก้อนแบนตรงฐานไม่ต้องมีเงาเสี้ยว จะได้กลืนเป็นเนื้อฐานเดียวกัน ไม่แยกเป็นลูกกลม ๆ) */
  const puffLayer = (list: Puff[]) =>
    list.map((p, i) => (
      <g key={`p${i}`}>
        {p.ry === undefined && (
          <circle cx={p.cx + 0.9} cy={p.cy + 2.1} r={p.r + 1.3} fill="#9dbde3" opacity={0.5} clipPath="url(#ff-cloud-a-clip)" />
        )}
        <ellipse
          cx={p.cx}
          cy={p.cy}
          rx={p.r}
          ry={p.ry ?? p.r}
          fill={`url(#ff-cloud-a-${p.ry === undefined ? "puff" : "base"})`}
        />
      </g>
    ));
  /* แถบรุ้งเป็นวงร่วมศูนย์กลาง ยอดโค้งซ่อนหลังเมฆ เหลือโผล่สองข้างเป็นขา */
  const bow = (r: number) => `M ${50 - r} 90 A ${r} ${r} 0 0 1 ${50 + r} 90`;
  const bands: { r: number; c: string }[] = [
    { r: 32, c: "#fda4af" },
    { r: 29.6, c: "#fdc08a" },
    { r: 27.2, c: "#fde68a" },
    { r: 24.8, c: "#b7efcd" },
    { r: 22.4, c: "#bae6fd" },
    { r: 20, c: "#ddd6fe" },
  ];
  return (
    <g className="ff-float" style={{ animationDuration: "4.8s" }}>
      <defs>
        {/* ก้อนปุยแต่ละก้อนไล่แสงของตัวเอง (objectBoundingBox) — สว่างบน-ซ้าย เงาล่าง-ขวา */}
        <radialGradient id="ff-cloud-a-puff" cx={0.36} cy={0.28} r={0.86}>
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#fbfdff" />
          <stop offset="76%" stopColor="#e9f2fc" />
          <stop offset="100%" stopColor="#c6d9f1" />
        </radialGradient>
        <radialGradient id="ff-cloud-a-base" cx={0.42} cy={0.2} r={0.9}>
          <stop offset="0%" stopColor="#f6faff" />
          <stop offset="60%" stopColor="#e1ecfa" />
          <stop offset="100%" stopColor="#bad1ee" />
        </radialGradient>
        {/* เงาสะสมใต้ท้องเมฆ ไล่ตามพิกัด viewBox ทำให้เงาทุกก้อนต่อเนื่องเป็นเนื้อเดียว */}
        <linearGradient id="ff-cloud-a-shade" gradientUnits="userSpaceOnUse" x1={0} y1={50} x2={0} y2={78}>
          <stop offset="0%" stopColor="#8fb2dd" stopOpacity={0} />
          <stop offset="58%" stopColor="#8db0dc" stopOpacity={0.2} />
          <stop offset="100%" stopColor="#6f97cd" stopOpacity={0.46} />
        </linearGradient>
        {/* แดดอุ่นสาดมุมบน-ซ้าย */}
        <radialGradient id="ff-cloud-a-sun" gradientUnits="userSpaceOnUse" cx={33} cy={30} r={44}>
          <stop offset="0%" stopColor="#fff3d2" stopOpacity={0.85} />
          <stop offset="45%" stopColor="#fffaf0" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>
        {/* ฟิล์มพาสเทลบาง ๆ ที่ค่อย ๆ เปลี่ยนสีตามเวลา */}
        <linearGradient id="ff-cloud-a-tint" gradientUnits="userSpaceOnUse" x1={14} y1={26} x2={88} y2={76}>
          <stop offset="0%" stopColor="#fbcfe8" stopOpacity={0.55} />
          <stop offset="45%" stopColor="#ddd6fe" stopOpacity={0.32} />
          <stop offset="100%" stopColor="#bae6fd" stopOpacity={0.55} />
        </linearGradient>
        {/* ไอฟุ้งรอบตัว + หมอกใต้ท้องเมฆ ให้ดูโปร่งลอยได้ */}
        <radialGradient id="ff-cloud-a-halo" gradientUnits="userSpaceOnUse" cx={50} cy={48} r={46}>
          <stop offset="0%" stopColor="#eaf4ff" stopOpacity={0.45} />
          <stop offset="52%" stopColor="#eaf4ff" stopOpacity={0.24} />
          <stop offset="100%" stopColor="#eaf4ff" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="ff-cloud-a-mist">
          <stop offset="0%" stopColor="#8fb2dd" stopOpacity={0.34} />
          <stop offset="100%" stopColor="#8fb2dd" stopOpacity={0} />
        </radialGradient>
        {/* clip = เงารวมของทุกก้อน ใช้กักเงา-แสง-ฟิล์มสีให้อยู่ในทรงเมฆ */}
        <clipPath id="ff-cloud-a-clip">
          <rect x={15} y={57} width={70} height={17} rx={8} />
          {[...back, ...front].map((p, i) => (
            <ellipse key={`k${i}`} cx={p.cx} cy={p.cy} rx={p.r} ry={p.ry ?? p.r} />
          ))}
        </clipPath>
      </defs>
      {/* ไอแสงรอบเมฆ */}
      <circle cx={50} cy={48} r={46} fill="url(#ff-cloud-a-halo)" />
      {/* ขารุ้งพาสเทลใต้ฐานเมฆ — เรืองสว่างช้า ๆ คนละจังหวะกับฟิล์มสีบนตัวเมฆ */}
      <g className="ff-shimmer" style={{ animationDuration: "7s" }} fill="none" strokeLinecap="round">
        <path d={bow(34.4)} stroke="#fff3d2" strokeWidth={4.5} opacity={0.35} />
        {bands.map((b) => (
          <path key={`b${b.r}`} d={bow(b.r)} stroke={b.c} strokeWidth={2.7} />
        ))}
      </g>
      {/* ตัวเมฆทั้งก้อน — โคลงช้า ๆ รอบจุดต่ำใต้ฐาน เหมือนถูกลมพัดไหล */}
      <g className="ff-sway" style={{ transformOrigin: "50px 88px", animationDuration: "8.5s" }}>
        {/* ปุยบางปลิวออกข้างซ้าย-ขวา พลิ้วคนละจังหวะ */}
        <g
          className="ff-sway-slow"
          style={{ transformOrigin: "26px 62px", animationDuration: "6.4s" }}
          fill="none"
          stroke="#ffffff"
          strokeLinecap="round"
        >
          <path d="M 24 61.5 Q 16 59.2 9 61.6" strokeWidth={3.2} opacity={0.55} />
          <path d="M 23 67.5 Q 15.5 67 10.5 69.4" strokeWidth={2.4} opacity={0.42} />
        </g>
        <g
          className="ff-sway-slow"
          style={{ transformOrigin: "76px 62px", animationDuration: "5.4s", animationDelay: "1.5s" }}
          fill="none"
          stroke="#ffffff"
          strokeLinecap="round"
        >
          <path d="M 78 60.5 Q 86 58.2 93 60.8" strokeWidth={3} opacity={0.55} />
          <path d="M 79 66.5 Q 86.5 66.2 91.5 68.6" strokeWidth={2.2} opacity={0.42} />
        </g>
        {/* หมอกเงาใต้ท้องเมฆ */}
        <ellipse cx={50} cy={75.5} rx={32} ry={7.5} fill="url(#ff-cloud-a-mist)" />
        {/* ฐานแบนแบบคิวมูลัส + ยอดฟูชั้นหลัง */}
        <rect x={15} y={57} width={70} height={17} rx={8} fill="url(#ff-cloud-a-base)" />
        {puffLayer(back)}
        {/* ขอบรับแดดของยอดหลัง (กักไว้ในทรงเมฆ) */}
        <g clipPath="url(#ff-cloud-a-clip)" fill="none" stroke="#ffffff" strokeLinecap="round" opacity={0.85}>
          <path d={rimArc(back[1])} strokeWidth={3} />
          <path d={rimArc(back[0])} strokeWidth={2.6} />
          <path d={rimArc(back[2])} strokeWidth={2.2} opacity={0.7} />
          <path d={rimArc(back[3])} strokeWidth={2.4} />
          <path d={rimArc(back[4])} strokeWidth={2.2} opacity={0.7} />
        </g>
        {/* พูหน้า + ก้อนหยักตรงฐาน วาดทับ = ได้ระนาบสะอาดไว้วางหน้า */}
        {puffLayer(front)}
        {/* ชั้นบรรยากาศรวม: ขอบรับแดดพูหน้า → เนื้อเมฆจาง ๆ → เงาท้อง → แดดอุ่น → ฟิล์มสี */}
        <g clipPath="url(#ff-cloud-a-clip)">
          <path d={rimArc(front[0])} fill="none" stroke="#ffffff" strokeWidth={2.6} strokeLinecap="round" opacity={0.8} />
          <g fill="#ffffff" opacity={0.3}>
            <ellipse cx={46} cy={36} rx={8} ry={3.4} transform="rotate(-16 46 36)" />
            <ellipse cx={63} cy={30} rx={5.4} ry={2.4} transform="rotate(-10 63 30)" />
            <ellipse cx={29} cy={53} rx={4.6} ry={2} transform="rotate(-24 29 53)" />
          </g>
          <g fill="#b9d2ee" opacity={0.24}>
            <ellipse cx={69} cy={62} rx={6.5} ry={3} transform="rotate(12 69 62)" />
            <ellipse cx={34} cy={68} rx={5.5} ry={2.4} transform="rotate(-8 34 68)" />
          </g>
          <rect x={0} y={38} width={100} height={42} fill="url(#ff-cloud-a-shade)" />
          <rect x={0} y={10} width={100} height={70} fill="url(#ff-cloud-a-sun)" />
          <g className="ff-shimmer" style={{ animationDuration: "5.4s", animationDelay: "1.3s" }}>
            <rect x={0} y={14} width={100} height={66} fill="url(#ff-cloud-a-tint)" />
          </g>
        </g>
        {/* หน้ายิ้มละมุนบนพูหน้า */}
        <GEye cx={43.5} cy={56.5} r={5.2} delay={0} />
        <GEye cx={56.5} cy={56.5} r={5.2} delay={0.15} />
        <Smile cx={50} cy={65.5} w={8} />
        <Blush cx={36} cy={62} r={4} opacity={0.32} />
        <Blush cx={64} cy={62} r={4} opacity={0.32} />
      </g>
      {/* ปุยลูกหลงสองกลุ่ม ลอยคนละความเร็ว */}
      <g className="ff-float" style={{ animationDuration: "5.6s", animationDelay: "1.1s" }} fill="url(#ff-cloud-a-puff)">
        <circle cx={12} cy={37} r={5.6} />
        <circle cx={6.8} cy={40} r={3.5} />
      </g>
      <g className="ff-float" style={{ animationDuration: "4.1s", animationDelay: "0.5s" }} fill="url(#ff-cloud-a-puff)">
        <circle cx={90} cy={41} r={4.6} />
        <circle cx={94} cy={44} r={2.8} />
      </g>
      {/* ละอองไอน้ำลอยขึ้นจากยอดเมฆ */}
      <circle className="ff-drift" cx={40} cy={24} r={1.7} fill="#ffffff" style={{ animationDelay: "0.2s" }} />
      <circle className="ff-drift" cx={52} cy={18} r={1.3} fill="#e0f2fe" style={{ animationDelay: "1.1s" }} />
      <circle className="ff-drift" cx={67} cy={21} r={1.5} fill="#ffffff" style={{ animationDelay: "1.9s" }} />
      {/* ประกายรอบตัว กะพริบสลับจังหวะ */}
      <g className="ff-twinkle" style={{ transformOrigin: "16px 22px" }}>
        <path d={star} transform="translate(16 22)" fill="#fde68a" />
      </g>
      <g className="ff-twinkle" style={{ transformOrigin: "86px 25px", animationDelay: "0.6s" }}>
        <path d={star} transform="translate(86 25) scale(0.8)" fill="#f9a8d4" />
      </g>
      <g className="ff-twinkle" style={{ transformOrigin: "92px 67px", animationDelay: "1.2s" }}>
        <path d={star} transform="translate(92 67) scale(0.62)" fill="#c4b5fd" />
      </g>
    </g>
  );
}

/** 🌠 น้องดาวตกขอพร — ดาวทองหนานุ่มมีมิติ หางประกายพลิ้วสามชั้น ป้ายคำขอห้อยแกว่ง */
function Star() {
  /* ประกายสี่แฉกใช้ซ้ำ — วาดรอบจุด (0,0) แล้วค่อย translate/scale */
  const spark = "M 0 -4 Q 0.9 -0.9 4 0 Q 0.9 0.9 0 4 Q -0.9 0.9 -4 0 Q -0.9 -0.9 0 -4 Z";
  /* ดาวห้าแฉกตัวหลัก — ศูนย์กลาง (56,45) รัศมีนอก 29 / รัศมีใน 13.5 */
  const starD =
    "M 56 16 L 63.9 34.1 L 83.6 36 L 68.8 49.2 L 73 68.5 L 56 58.5 L 39 68.5 L 43.2 49.2 L 28.4 36 L 48.1 34.1 Z";
  return (
    <g className="ff-float">
      <defs>
        <radialGradient id="ff-star-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fff6cf" stopOpacity={0.85} />
          <stop offset="45%" stopColor="#fcd34d" stopOpacity={0.34} />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="ff-star-body" cx="0.34" cy="0.24" r="0.88">
          <stop offset="0%" stopColor="#fffdf2" />
          <stop offset="30%" stopColor="#fdeba7" />
          <stop offset="66%" stopColor="#fac53f" />
          <stop offset="100%" stopColor="#e8940f" />
        </radialGradient>
        <linearGradient id="ff-star-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde9a4" />
          <stop offset="55%" stopColor="#f7bb2e" />
          <stop offset="100%" stopColor="#e08c0c" />
        </linearGradient>
        <linearGradient id="ff-star-tail-a" gradientUnits="userSpaceOnUse" x1={44} y1={42} x2={2} y2={66}>
          <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.85} />
          <stop offset="45%" stopColor="#fde68a" stopOpacity={0.5} />
          <stop offset="100%" stopColor="#fef3c7" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="ff-star-tail-b" gradientUnits="userSpaceOnUse" x1={48} y1={50} x2={4} y2={93}>
          <stop offset="0%" stopColor="#fcd34d" stopOpacity={0.95} />
          <stop offset="40%" stopColor="#fde68a" stopOpacity={0.62} />
          <stop offset="100%" stopColor="#fffbeb" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="ff-star-wisp" gradientUnits="userSpaceOnUse" x1={48} y1={46} x2={8} y2={90}>
          <stop offset="0%" stopColor="#fff7d6" stopOpacity={0.9} />
          <stop offset="60%" stopColor="#fde68a" stopOpacity={0.45} />
          <stop offset="100%" stopColor="#fde68a" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* แสงเรืองรอบตัว — เต้นช้ากว่าจังหวะอื่นให้เหมือนหายใจอยู่ในอากาศ */}
      <ellipse
        className="ff-shimmer"
        style={{ animationDuration: "3.6s" }}
        cx={56}
        cy={46}
        rx={40}
        ry={37}
        fill="url(#ff-star-glow)"
        opacity={0.7}
      />

      {/* หางชั้นบน — บางและกวาดไกล พลิ้วช้าที่สุด */}
      <g className="ff-sway-slow" style={{ transformOrigin: "41px 44px", animationDuration: "4.4s" }}>
        <path d="M 41 38 Q 28 42 16 50 Q 8 56 2 65 Q 12 60 24 55 Q 34 50 42 47 Z" fill="url(#ff-star-tail-a)" />
        <path
          d="M 40 42 Q 28 47 18 54 Q 11 59 6 66"
          fill="none"
          stroke="#fff7d6"
          strokeWidth={1.4}
          strokeLinecap="round"
          opacity={0.45}
        />
      </g>

      {/* หางชั้นหลัก — หนาสุด เรียวจนโปร่งใสที่ปลาย + ประกายลอยไปกับหาง */}
      <g className="ff-sway" style={{ transformOrigin: "47px 54px", animationDuration: "3.2s", animationDelay: "0.3s" }}>
        <path d="M 48 46 Q 34 55 22 67 Q 12 78 4 93 Q 14 82 26 73 Q 38 65 47 61 Z" fill="url(#ff-star-tail-b)" />
        <path
          d="M 45 53 Q 32 62 22 73 Q 15 80 10 88"
          fill="none"
          stroke="#fffbeb"
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.5}
        />
        <g className="ff-twinkle" style={{ transformOrigin: "30px 70px", animationDuration: "1.6s" }}>
          <path d={spark} transform="translate(30 70) scale(0.72)" fill="#fff7d6" />
        </g>
        <g className="ff-twinkle" style={{ transformOrigin: "18px 83px", animationDelay: "0.7s", animationDuration: "2.1s" }}>
          <path d={spark} transform="translate(18 83) scale(0.52)" fill="#fef3c7" />
        </g>
      </g>

      {/* เส้นประกายเรียวสองเส้น — จังหวะช้าคนละแบบ ทำให้หางดูสะบัดไม่ซ้ำรอบ */}
      <g className="ff-sway-slow" style={{ transformOrigin: "44px 50px", animationDuration: "5.6s", animationDelay: "0.9s" }}>
        <path d="M 45 44 Q 30 51 19 60 Q 11 67 5 76" fill="none" stroke="url(#ff-star-wisp)" strokeWidth={2.6} strokeLinecap="round" />
        <path d="M 47 58 Q 34 68 24 78 Q 17 85 13 92" fill="none" stroke="url(#ff-star-wisp)" strokeWidth={1.7} strokeLinecap="round" />
      </g>

      {/* เม็ดประกายหลุดจากหางลอยขึ้น — ทยอยขึ้นทีละเม็ดไม่พร้อมกัน */}
      <g fill="#fde68a">
        <path className="ff-drift" style={{ animationDelay: "0s" }} d={spark} transform="translate(33 66) scale(0.6)" />
        <circle className="ff-drift" style={{ animationDelay: "0.7s" }} cx={22} cy={78} r={1.5} fill="#fff7d6" />
        <path className="ff-drift" style={{ animationDelay: "1.3s" }} d={spark} transform="translate(13 88) scale(0.45)" fill="#fef3c7" />
        <circle className="ff-drift" style={{ animationDelay: "1.9s" }} cx={28} cy={85} r={1.2} />
      </g>

      {/* ตัวดาว — โคลงตัวช้า ๆ รอบใจกลาง แล้วเอียงหน้าตามทิศที่พุ่งไป */}
      <g className="ff-tilt" style={{ transformOrigin: "56px 45px", animationDuration: "6s" }}>
        <g transform="rotate(-10 56 45)">
          {/* เงาซ้อนเยื้องล่างขวา = ความหนาของตัวดาว */}
          <path
            d={starD}
            transform="translate(2.2 3)"
            fill="#cf7d0a"
            opacity={0.42}
            stroke="#cf7d0a"
            strokeWidth={9}
            strokeLinejoin="round"
          />
          {/* ตัวดาวอ้วนมน — ไล่เฉดจากขาวครีมมุมบนซ้ายไปอำพันเข้มมุมล่างขวา */}
          <path d={starD} fill="url(#ff-star-body)" stroke="url(#ff-star-rim)" strokeWidth={9} strokeLinejoin="round" />
          {/* rim-light เลาะสันขอบบน-ซ้าย ให้ขอบดูมนและมีแสงจับ */}
          <path
            d="M 43.2 49.2 L 28.4 36 L 48.1 34.1 L 56 16 L 63.9 34.1"
            fill="none"
            stroke="#fff8dd"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.55}
          />
          {/* แสงตกกระทบบนแฉกบน/ซ้าย/ขวา + เงาบนแฉกล่างสองข้าง (หมุนตามแกนแฉกจริง) */}
          <ellipse cx={56} cy={27} rx={3.4} ry={6.6} fill="#fff8dd" opacity={0.5} />
          <ellipse cx={37} cy={38.8} rx={6.6} ry={3} fill="#fff8dd" opacity={0.42} transform="rotate(18 37 38.8)" />
          <ellipse cx={75} cy={38.8} rx={6.6} ry={3} fill="#fff3c8" opacity={0.28} transform="rotate(-18 75 38.8)" />
          <ellipse cx={45.4} cy={59.6} rx={5.8} ry={3} fill="#c9790a" opacity={0.2} transform="rotate(-54 45.4 59.6)" />
          <ellipse cx={66.6} cy={59.6} rx={5.8} ry={3} fill="#c9790a" opacity={0.26} transform="rotate(54 66.6 59.6)" />
          {/* ริ้วแสงวาบบนผิวดาว — วูบคนละจังหวะกับแสงเรืองรอบตัว */}
          <path
            className="ff-shimmer"
            style={{ animationDuration: "2.4s", animationDelay: "0.5s" }}
            d="M 43 32.6 Q 37 34.6 33 37.2"
            fill="none"
            stroke="#fffbe8"
            strokeWidth={2.2}
            strokeLinecap="round"
            opacity={0.6}
          />
          {/* หน้าตาอบอุ่น — ตากะพริบเหลื่อมกันนิดเดียว */}
          <GEye cx={48.5} cy={43} r={5.2} delay={0} />
          <GEye cx={63.5} cy={43} r={5.2} delay={0.18} />
          <Smile cx={56} cy={51.5} w={8} />
          <Blush cx={45} cy={49.8} r={3.5} color="#f87171" opacity={0.4} />
          <Blush cx={67} cy={49.8} r={3.5} color="#f87171" opacity={0.4} />
          {/* ประกายปลายแฉกสามจุด กะพริบเหลื่อมกันเหมือนดาวมีชีพจร */}
          <g className="ff-twinkle" style={{ transformOrigin: "56px 12px", animationDuration: "1.7s" }}>
            <path d={spark} transform="translate(56 12) scale(0.6)" fill="#fffdf2" />
          </g>
          <g className="ff-twinkle" style={{ transformOrigin: "26px 34.5px", animationDelay: "0.6s", animationDuration: "2.2s" }}>
            <path d={spark} transform="translate(26 34.5) scale(0.5)" fill="#fff7d6" />
          </g>
          <g className="ff-twinkle" style={{ transformOrigin: "86px 34px", animationDelay: "1.1s", animationDuration: "1.9s" }}>
            <path d={spark} transform="translate(86 34) scale(0.55)" fill="#fff7d6" />
          </g>
          {/* ป้ายคำขอผูกไว้ที่แฉกล่างขวา — แกว่งเป็นจังหวะของตัวเอง */}
          <g className="ff-sway-slow" style={{ transformOrigin: "70px 64px", animationDuration: "3.8s", animationDelay: "0.5s" }}>
            <path d="M 70 64 Q 72.6 71 71.5 77.5" fill="none" stroke="#f6c65a" strokeWidth={1.3} strokeLinecap="round" />
            <g transform="translate(71.5 82) rotate(-8)">
              <path
                d="M 0 -5.4 L 1.6 -1.7 L 5.4 -1.4 L 2.5 1.3 L 3.4 5.2 L 0 3.1 L -3.4 5.2 L -2.5 1.3 L -5.4 -1.4 L -1.6 -1.7 Z"
                fill="#fff6cf"
                stroke="#f6c65a"
                strokeWidth={1.6}
                strokeLinejoin="round"
              />
              <circle cx={-1.2} cy={-0.8} r={0.9} fill="#ffffff" opacity={0.85} />
            </g>
          </g>
        </g>
      </g>

      {/* ดาวจิ๋วรอบเฟรม — กะพริบไล่กันเป็นฉากหลังท้องฟ้า */}
      <g className="ff-twinkle" style={{ transformOrigin: "13px 22px", animationDuration: "2.4s" }}>
        <path d={spark} transform="translate(13 22) scale(0.7)" fill="#fde68a" />
      </g>
      <g className="ff-twinkle" style={{ transformOrigin: "88px 15px", animationDelay: "0.8s", animationDuration: "2s" }}>
        <path d={spark} transform="translate(88 15) scale(0.55)" fill="#fff7d6" />
      </g>
      <g className="ff-twinkle" style={{ transformOrigin: "93px 60px", animationDelay: "1.4s", animationDuration: "2.7s" }}>
        <path d={spark} transform="translate(93 60) scale(0.48)" fill="#fcd34d" />
      </g>
    </g>
  );
}

/**
 * 🌱 น้องต้นอ่อนนักสู้ — กระถางดินเผาหน้ามุ่งมั่นกับต้นกล้าที่กำลังโต
 * เวอร์ชัน "สมจริงขึ้น": กระถางไล่เฉดแบบทรงกระบอก (สว่างซ้าย-เงาขวา) ขอบปากหนามีสันจับแสง
 * รอยวงจากแป้นหมุนและเม็ดทรายบนเนื้อดินเผา, ดินร่วนเป็นก้อนมีกรวด-มอส-เศษแร่
 * ต้นกล้ามีลำต้นเรียวสอบ ใบเลี้ยงคู่ล่าง ใบจริงสองใบพร้อมเส้นกลางใบ-เส้นแขนง
 * และยอดอ่อนที่ยังไม่คลี่ ทุกใบไหวคนละจังหวะเหมือนต้องลมอ่อน ๆ
 */
function Sprout() {
  // รูปทรงใบจริง — ใช้ทั้งเติมสีและเป็น clip ให้เส้นใบไม่ล้นขอบใบ
  const leafL = "M 48.6 38.4 C 38.4 39.8 25 34.8 16.2 23.6 C 28.6 20.4 41.6 25.8 48.6 34.4 Z";
  const leafR = "M 51.4 34.6 C 61.6 36 74.8 31.2 83.8 20.2 C 71.4 16.8 58.4 22.2 51.4 30.6 Z";
  return (
    <g>
      <defs>
        <linearGradient id="ff-sprout-clay" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#cf7c4d" />
          <stop offset="16%" stopColor="#efab7c" />
          <stop offset="42%" stopColor="#e2925f" />
          <stop offset="74%" stopColor="#c66f41" />
          <stop offset="100%" stopColor="#a45530" />
        </linearGradient>
        <linearGradient id="ff-sprout-rim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d9865b" />
          <stop offset="17%" stopColor="#f9bf91" />
          <stop offset="45%" stopColor="#eda06e" />
          <stop offset="76%" stopColor="#d27a4a" />
          <stop offset="100%" stopColor="#ac5c36" />
        </linearGradient>
        <linearGradient id="ff-sprout-rimtop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbcda3" />
          <stop offset="100%" stopColor="#df9560" />
        </linearGradient>
        <linearGradient id="ff-sprout-inner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38230f" />
          <stop offset="100%" stopColor="#7a5033" />
        </linearGradient>
        <radialGradient id="ff-sprout-soil" cx="0.42" cy="0.26" r="0.88">
          <stop offset="0%" stopColor="#7f5939" />
          <stop offset="58%" stopColor="#5b3d28" />
          <stop offset="100%" stopColor="#3d281a" />
        </radialGradient>
        <linearGradient id="ff-sprout-leaf-l" x1="1" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#c3f2a6" />
          <stop offset="42%" stopColor="#6fd889" />
          <stop offset="100%" stopColor="#2fa268" />
        </linearGradient>
        <linearGradient id="ff-sprout-leaf-r" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#c3f2a6" />
          <stop offset="42%" stopColor="#6fd889" />
          <stop offset="100%" stopColor="#2fa268" />
        </linearGradient>
        <linearGradient id="ff-sprout-stem" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#4a9950" />
          <stop offset="55%" stopColor="#69c56b" />
          <stop offset="100%" stopColor="#95df8a" />
        </linearGradient>
        <clipPath id="ff-sprout-clip-l">
          <path d={leafL} />
        </clipPath>
        <clipPath id="ff-sprout-clip-r">
          <path d={leafR} />
        </clipPath>
      </defs>
      {/* เงาทอดบนพื้น สองชั้นให้ขอบฟุ้ง — อยู่นอกกลุ่มที่โยก จะได้ไม่ลอย */}
      <ellipse cx={50} cy={90.6} rx={24} ry={3.5} fill="#6b4530" opacity={0.16} />
      <ellipse cx={50} cy={90.2} rx={13.5} ry={2.2} fill="#4a2c1e" opacity={0.18} />
      {/* กระถางทั้งใบโยกช้า ๆ รอบก้นกระถาง เหมือนหายใจตามลม */}
      <g className="ff-sway" style={{ transformOrigin: "50px 88.6px", animationDuration: "5.6s" }}>
        {/* ตัวกระถางทรงสอบ — ไล่เฉดแบบทรงกระบอก สว่างซ้าย เงาขวา */}
        <path d="M 32.2 58.2 L 67.8 58.2 L 64.4 82.4 Q 63.5 88.8 57 88.8 L 43 88.8 Q 36.5 88.8 35.6 82.4 Z" fill="url(#ff-sprout-clay)" />
        {/* ขอบขวาเข้ม + เงาใต้ปากกระถาง = ความหนาของดินเผา */}
        <path d="M 67.8 58.2 L 64.4 82.4 Q 63.5 88.8 57 88.8 L 54.6 88.8 Q 60.6 87.9 61.5 82 L 64.6 58.2 Z" fill="#8f4726" opacity={0.34} />
        <path d="M 32.2 58.2 L 67.8 58.2 L 67.4 61.6 Q 50 64.4 32.6 61.6 Z" fill="#8f4726" opacity={0.3} />
        {/* แถบแสงสะท้อนด้านซ้าย + รอยวงจากแป้นหมุนปั้น + เม็ดทรายในเนื้อดิน */}
        <path d="M 35 63.4 Q 34 73 36.2 82.6" stroke="#ffdcbb" strokeWidth={2.6} fill="none" strokeLinecap="round" opacity={0.34} />
        <path d="M 33.6 62.2 Q 50 64.6 66.4 62.2" stroke="#a45530" strokeWidth={0.8} fill="none" strokeLinecap="round" opacity={0.28} />
        <path d="M 36.4 81.4 Q 50 83.8 63.6 81.4" stroke="#a45530" strokeWidth={0.9} fill="none" strokeLinecap="round" opacity={0.3} />
        <path d="M 37.4 84.8 Q 50 87 62.6 84.8" stroke="#a45530" strokeWidth={0.8} fill="none" strokeLinecap="round" opacity={0.24} />
        <g fill="#fbe0c6" opacity={0.4}>
          <circle cx={34.8} cy={68.5} r={0.5} />
          <circle cx={36.2} cy={78.6} r={0.42} />
          <circle cx={50.5} cy={86.2} r={0.45} />
          <circle cx={43.4} cy={85.4} r={0.38} />
        </g>
        <g fill="#96471f" opacity={0.28}>
          <circle cx={65.2} cy={71.5} r={0.55} />
          <circle cx={63.6} cy={78.8} r={0.45} />
          <circle cx={57.8} cy={86.4} r={0.4} />
          <circle cx={35.6} cy={73.4} r={0.4} />
        </g>
        {/* หน้ามุ่งมั่นแต่ยังอ่อนโยน — คิ้วโค้งขึ้นเล็กน้อยให้ดูฮึบสู้ ไม่ดุ */}
        <path d="M 38.7 64.9 Q 42.6 62.6 46.5 64.9" stroke={FRIEND_INK} strokeWidth={1.5} fill="none" strokeLinecap="round" opacity={0.5} />
        <path d="M 53.5 64.9 Q 57.4 62.6 61.3 64.9" stroke={FRIEND_INK} strokeWidth={1.5} fill="none" strokeLinecap="round" opacity={0.5} />
        <GEye cx={42.6} cy={70.5} r={4.6} delay={0} />
        <GEye cx={57.4} cy={70.5} r={4.6} delay={0.15} />
        <Smile cx={50} cy={77.4} w={6.4} />
        <Blush cx={38} cy={75.4} r={3.1} />
        <Blush cx={62} cy={75.4} r={3.1} />
        {/* ขอบปากกระถางหนา — สันหน้า เงาใต้สัน หน้าบนรับแสง แล้วค่อยเจาะเป็นปากกระถาง */}
        <rect x={26.2} y={49.6} width={47.6} height={10.4} rx={3.2} fill="url(#ff-sprout-rim)" />
        <rect x={26.6} y={56.6} width={46.8} height={3.4} rx={1.7} fill="#8f4726" opacity={0.26} />
        <ellipse cx={50} cy={49.8} rx={23.8} ry={5.4} fill="url(#ff-sprout-rimtop)" />
        <path d="M 29.6 47.6 Q 50 44.4 70.4 47.6" stroke="#ffe0bd" strokeWidth={1} fill="none" strokeLinecap="round" opacity={0.45} />
        <ellipse cx={50} cy={50.2} rx={19.6} ry={4.3} fill="url(#ff-sprout-inner)" />
        <ellipse cx={33.4} cy={53.2} rx={3.4} ry={1.5} fill="#ffe0bd" opacity={0.35} />
        {/* ผิวดินร่วน — ก้อนดินหลายเฉด หลุมเงา กรวดมีไฮไลต์ เศษแร่ และคราบมอสจาง ๆ */}
        <path d="M 31 51 Q 34.2 48.6 39.8 48.2 Q 44.8 47.4 50.2 47.9 Q 55.8 47.5 61 48.7 Q 66.6 49.2 68.9 51.2 Q 62.6 54.4 50 54.4 Q 37.4 54.4 31 51 Z" fill="url(#ff-sprout-soil)" />
        <ellipse cx={37.8} cy={49.6} rx={3.4} ry={1.7} fill="#7d5738" opacity={0.9} />
        <ellipse cx={45.4} cy={48.4} rx={2.8} ry={1.5} fill="#8b6644" opacity={0.85} />
        <ellipse cx={56} cy={48.6} rx={3} ry={1.6} fill="#6b4931" opacity={0.9} />
        <ellipse cx={63.6} cy={50.2} rx={3.2} ry={1.7} fill="#583a26" opacity={0.9} />
        <ellipse cx={41.6} cy={51.8} rx={2.6} ry={1.2} fill="#38240f" opacity={0.45} />
        <ellipse cx={58.6} cy={52.2} rx={2.4} ry={1.1} fill="#38240f" opacity={0.4} />
        <ellipse cx={50} cy={53} rx={3} ry={1.2} fill="#8b6644" opacity={0.35} />
        <ellipse cx={34.6} cy={51.4} rx={1.8} ry={1.1} fill="#a99a8b" />
        <ellipse cx={34.3} cy={51} rx={0.8} ry={0.45} fill="#e2d8cd" opacity={0.85} />
        <ellipse cx={60.4} cy={51.4} rx={1.3} ry={0.85} fill="#9c8d7f" />
        <g fill="#d6c1a4" opacity={0.5}>
          <circle cx={43.6} cy={50.6} r={0.4} />
          <circle cx={53.4} cy={49.8} r={0.35} />
          <circle cx={47.4} cy={52.4} r={0.32} />
          <circle cx={65.6} cy={52} r={0.36} />
        </g>
        <ellipse cx={63.8} cy={51.8} rx={2} ry={0.85} fill="#7bbf6a" opacity={0.34} />
        <ellipse cx={38.6} cy={52.6} rx={1.7} ry={0.75} fill="#7bbf6a" opacity={0.28} />
        {/* ต้นจิ๋วที่เพิ่งงอกข้าง ๆ — สัญญาณว่ายังโตต่อได้อีก */}
        <g className="ff-wiggle" style={{ transformOrigin: "63.4px 48.6px", animationDuration: "4.8s", animationDelay: "0.8s" }}>
          <path d="M 63.4 48.8 L 63.6 44.6" stroke="#6cc46e" strokeWidth={0.8} strokeLinecap="round" fill="none" />
          <path d="M 63.5 45.8 Q 61 44.6 60.8 42.4 Q 63.4 42.4 63.7 45.2 Z" fill="#8fe08c" />
          <path d="M 63.7 45.2 Q 66.2 43.8 66.8 41.8 Q 64 41.6 63.6 44.4 Z" fill="#a9ea9c" />
        </g>
        {/* เงาโคนต้นบนผิวดิน ให้ลำต้นดูปักลงไปในดินจริง */}
        <ellipse cx={50} cy={48.6} rx={3.8} ry={1.3} fill="#33200f" opacity={0.4} />
        {/* ต้นกล้าทั้งต้นเอนตามลมช้า ๆ จากโคนดิน */}
        <g className="ff-sway-slow" style={{ transformOrigin: "50px 50px", animationDuration: "6.4s" }}>
          {/* ลำต้นเรียวสอบ + สันแสงซ้าย เงาขวา + ขนอ่อนบนลำต้น */}
          <path d="M 48.3 50 C 47.4 43 47.9 34 49 25.8 L 51.2 25.6 C 50.3 34 51.1 43 51.7 50 Z" fill="url(#ff-sprout-stem)" />
          <path d="M 49 48.6 C 48.3 42 48.7 34 49.6 26.8" stroke="#c2f0a8" strokeWidth={0.8} fill="none" strokeLinecap="round" opacity={0.6} />
          <path d="M 51.2 48.8 C 50.6 42 51.1 34.5 50.8 27.2" stroke="#3d8b4c" strokeWidth={0.7} fill="none" strokeLinecap="round" opacity={0.4} />
          <path d="M 47.6 44.6 q -1.7 -.5 -2.4 -1.8 M 52.4 39.6 q 1.7 -.5 2.4 -1.8 M 47.8 33.4 q -1.6 -.6 -2.1 -1.9" stroke="#9ee39a" strokeWidth={0.7} fill="none" strokeLinecap="round" />
          {/* ใบเลี้ยงคู่ล่าง — เล็ก มน ผิวเรียบ ไหวคนละจังหวะกับใบจริง */}
          <g className="ff-wiggle" style={{ transformOrigin: "48.9px 44.6px", animationDuration: "5s", animationDelay: "1.1s" }}>
            <path d="M 48.9 45.6 C 43 47.6 36 46.6 31.4 41.6 C 37 38.2 44.8 39.4 48.9 43.4 Z" fill="url(#ff-sprout-leaf-l)" stroke="#3fae72" strokeWidth={0.5} />
            <path d="M 47.9 44.8 C 43 45 38 43.6 32.8 41.4" stroke="#dcf8c4" strokeWidth={0.9} fill="none" strokeLinecap="round" opacity={0.75} />
          </g>
          <g className="ff-wiggle" style={{ transformOrigin: "51.1px 41.6px", animationDuration: "4.6s", animationDelay: "0.3s" }}>
            <path d="M 51.1 42.6 C 57 44.6 64 43.6 68.6 38.6 C 63 35.2 55.2 36.4 51.1 40.4 Z" fill="url(#ff-sprout-leaf-r)" stroke="#3fae72" strokeWidth={0.5} />
            <path d="M 52.1 41.8 C 57 42 62 40.6 67.2 38.4" stroke="#dcf8c4" strokeWidth={0.9} fill="none" strokeLinecap="round" opacity={0.75} />
          </g>
          {/* ใบจริงซ้าย — เงาพับใต้ใบ แสงพาดกลางใบ เส้นกลางใบและเส้นแขนงสี่คู่ */}
          <g className="ff-wiggle" style={{ transformOrigin: "48.6px 36.4px", animationDuration: "3.6s" }}>
            <path d={leafL} fill="url(#ff-sprout-leaf-l)" stroke="#3aa96c" strokeWidth={0.55} />
            <g clipPath="url(#ff-sprout-clip-l)">
              <path d="M 50 40.4 C 39 41.4 24 35.6 14 23.4 L 12 32 L 52 46 Z" fill="#2b9c62" opacity={0.26} />
              <ellipse cx={35} cy={28.6} rx={12} ry={3.6} fill="#eaffd6" opacity={0.32} transform="rotate(-22 35 28.6)" />
              <path d="M 47.8 36.3 C 39.6 35.6 28 31 17.6 23.8" stroke="#e2fbcb" strokeWidth={1.2} fill="none" strokeLinecap="round" />
              <g stroke="#d3f4b8" strokeWidth={0.7} fill="none" strokeLinecap="round" opacity={0.85}>
                <path d="M 45.4 35.8 q -2.4 2.6 -5.6 3.4 M 45.4 35.8 q -1.4 -2.6 -3.6 -4" />
                <path d="M 39.6 34.7 q -3 2.6 -6.6 3.4 M 39.6 34.7 q -1.8 -3 -5 -4.6" />
                <path d="M 31.9 31.8 q -2.6 2.4 -5.8 3 M 31.9 31.8 q -1.4 -2.8 -4.2 -4.2" />
                <path d="M 24.6 28.2 q -2.2 2 -5 2.4 M 24.6 28.2 q -1.2 -2.4 -3.4 -3.4" />
              </g>
            </g>
          </g>
          {/* ใบจริงขวา — ชูสูงกว่าอีกใบ ไหวช้ากว่าและเหลื่อมจังหวะ */}
          <g className="ff-wiggle" style={{ transformOrigin: "51.4px 32.6px", animationDuration: "4.2s", animationDelay: "0.6s" }}>
            <path d={leafR} fill="url(#ff-sprout-leaf-r)" stroke="#3aa96c" strokeWidth={0.55} />
            <g clipPath="url(#ff-sprout-clip-r)">
              <path d="M 50 36.6 C 61 37.6 76 31.8 86 19.6 L 88 28 L 48 42 Z" fill="#2b9c62" opacity={0.26} />
              <ellipse cx={65} cy={25.2} rx={12} ry={3.6} fill="#eaffd6" opacity={0.32} transform="rotate(22 65 25.2)" />
              <path d="M 52.2 32.5 C 60.4 31.8 72 27.2 82.4 20" stroke="#e2fbcb" strokeWidth={1.2} fill="none" strokeLinecap="round" />
              <g stroke="#d3f4b8" strokeWidth={0.7} fill="none" strokeLinecap="round" opacity={0.85}>
                <path d="M 54.6 32 q 2.4 2.6 5.6 3.4 M 54.6 32 q 1.4 -2.6 3.6 -4" />
                <path d="M 60.4 30.9 q 3 2.6 6.6 3.4 M 60.4 30.9 q 1.8 -3 5 -4.6" />
                <path d="M 68.1 28 q 2.6 2.4 5.8 3 M 68.1 28 q 1.4 -2.8 4.2 -4.2" />
                <path d="M 75.4 24.4 q 2.2 2 5 2.4 M 75.4 24.4 q 1.2 -2.4 3.4 -3.4" />
              </g>
            </g>
          </g>
          {/* ยอดอ่อนที่ยังไม่คลี่ — พยักหน้าเบา ๆ คนละจังหวะกับใบล่าง */}
          <g className="ff-tilt" style={{ transformOrigin: "50px 26.5px" }}>
            <path d="M 49.4 26.4 C 46.4 22.6 46.6 17.8 49.2 14.2 C 52 17.4 52.2 22.6 50.9 26.2 Z" fill="url(#ff-sprout-leaf-l)" stroke="#3fae72" strokeWidth={0.4} />
            <path d="M 50.6 26.2 C 52.9 23.4 55.4 21.4 57.9 20.8 C 57.3 24 54.5 26.4 51.3 27.1 Z" fill="#8fe08c" stroke="#4fbb7c" strokeWidth={0.35} />
            <path d="M 49.4 25.8 C 47.7 22.6 47.9 18.8 49.4 16" stroke="#e2fbcb" strokeWidth={0.85} fill="none" strokeLinecap="round" opacity={0.85} />
            <path d="M 51.6 26.2 C 53.4 24.4 55.2 23 57 22.2" stroke="#e2fbcb" strokeWidth={0.7} fill="none" strokeLinecap="round" opacity={0.7} />
            <path d="M 49.2 26.6 C 47.4 25.8 45.8 24.4 44.8 22.6 Q 47.8 22.8 49.6 24.8 Z" fill="#a9ea9c" stroke="#4fbb7c" strokeWidth={0.35} />
          </g>
        </g>
      </g>
      {/* ประกายรอบตัว + ละอองสีเขียวลอยขึ้น = พลังของการเติบโต */}
      <path className="ff-twinkle" style={{ transformOrigin: "12.5px 63px" }} fill="#fde68a"
        d="M 12.5 59.4 Q 12.5 63 16.1 63 Q 12.5 63 12.5 66.6 Q 12.5 63 8.9 63 Q 12.5 63 12.5 59.4 Z" />
      <path className="ff-twinkle" style={{ transformOrigin: "88px 57px", animationDelay: "0.7s" }} fill="#a7f3d0"
        d="M 88 54.2 Q 88 57 90.8 57 Q 88 57 88 59.8 Q 88 57 85.2 57 Q 88 57 88 54.2 Z" />
      <circle className="ff-drift" cx={21} cy={74} r={1.7} fill="#86efac" style={{ animationDelay: "0.2s" }} />
      <circle className="ff-drift" cx={79.5} cy={78} r={1.4} fill="#bbf7d0" style={{ animationDelay: "1.3s" }} />
    </g>
  );
}

/** 🦊 น้องจิ้งจอกสายรุ้ง — จิ้งจอกกึ่งเรียล ตาอำพันรูม่านตาตั้ง เส้นน้ำตา หางพู่สายรุ้งปลายขาว */
function Fox() {
  // เส้นขอบหางพู่ ใช้ทั้งเติมสีและ clip แถบสีรุ้ง
  const tailD =
    "M56 84 Q66 88 75 84 L79.5 86 L78 81.5 Q85 77.5 87.5 68 L91.5 66 L87.3 63 Q88.5 51 84 40 L87.6 37 L82.2 35.6 Q80 28.5 74 24.5 Q70.5 22.3 68 24.5 Q72.5 31 73 40 Q74 52 70 62 Q66.5 71.5 58 76.5 Q53.5 79.5 52 81 Z";
  return (
    <g>
      <defs>
        <linearGradient id="ff-fox-coat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdba74" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
        <radialGradient id="ff-fox-iris" cx="0.5" cy="0.4" r="0.68">
          <stop offset="0" stopColor="#f0b45a" />
          <stop offset="0.65" stopColor="#de9a3d" />
          <stop offset="1" stopColor="#c97b28" />
        </radialGradient>
        <clipPath id="ff-fox-tailclip">
          <path d={tailD} />
        </clipPath>
      </defs>
      <g className="ff-bob">
        {/* หางพู่สายรุ้ง โคนชมพู ไล่แถบพาสเทลตามความยาว ปลายขาว */}
        <g className="ff-wiggle" style={{ transformOrigin: "56px 83px", animationDuration: "2.6s" }}>
          <path d={tailD} fill="#fda4af" stroke="#f191a3" strokeWidth={0.7} strokeLinejoin="round" />
          <g clipPath="url(#ff-fox-tailclip)">
            <path d="M45 54 Q70 66 96 58 L96 74 Q70 80 45 70 Z" fill="#fde68a" />
            <path d="M45 41 Q70 51 96 44 L96 60 Q70 67 45 56 Z" fill="#a7f3d0" />
            <path d="M45 29 Q70 38 96 31 L96 46 Q70 52 45 43 Z" fill="#bae6fd" />
            <path d="M45 16 Q70 25 96 18 L96 33 Q70 39 45 31 Z" fill="#ddd6fe" />
            <circle cx={73} cy={27.5} r={6.2} fill="#fff7ed" />
          </g>
        </g>
        {/* ลำตัวท่านั่ง สะโพกกว้าง เส้นขาหลังจางๆ */}
        <path d="M31 87 Q27.5 68 37 58.5 Q43 53 50 53 Q57 53 63 58.5 Q72.5 68 69 87 Z" fill="url(#ff-fox-coat)" />
        <path d="M62.5 86 Q66.5 73 59 65.5 M37.5 86 Q33.5 73 41 65.5" fill="none" stroke="#ea6a12" strokeWidth={1} strokeLinecap="round" opacity={0.45} />
        {/* อกขาว ขอบล่างเป็นปุยขน */}
        <path d="M42.5 47 Q50 51 57.5 47 Q60.5 56 59 64.5 L55.8 62.8 L54.4 66.6 L50 64.2 L45.6 66.6 L44.2 62.8 L41 64.5 Q39.5 56 42.5 47 Z" fill="#fff7ed" />
        {/* ขาหน้าตรง ถุงเท้าเข้ม อุ้งเท้าเล็ก */}
        <rect x={44} y={60} width={4.6} height={23} rx={2.3} fill="#fb923c" />
        <rect x={51.4} y={60} width={4.6} height={23} rx={2.3} fill="#fb923c" />
        <rect x={43.7} y={72.5} width={5.2} height={12.5} rx={2.6} fill="#3f2a3a" />
        <rect x={51.1} y={72.5} width={5.2} height={12.5} rx={2.6} fill="#3f2a3a" />
        <ellipse cx={46.3} cy={85} rx={3.2} ry={2} fill="#3f2a3a" />
        <ellipse cx={53.7} cy={85} rx={3.2} ry={2} fill="#3f2a3a" />
        {/* หูสามเหลี่ยมใหญ่ หลังหูเข้ม ขนในหูสีอ่อน (หูขวาขยับ) */}
        <g>
          <path d="M30 27 L35 7.5 L47 20.5 Q40 21 30 27 Z" fill="url(#ff-fox-coat)" />
          <path d="M32.8 16.5 L35 7.5 L42.6 15.7 Q38 14.6 32.8 16.5 Z" fill="#3f2a3a" />
          <path d="M35.8 19.8 L37 15.2 M38.8 19.3 L40.6 15.8" fill="none" stroke="#fff7ed" strokeWidth={1.1} strokeLinecap="round" opacity={0.9} />
        </g>
        <g className="ff-ear" style={{ transformOrigin: "61.5px 23.5px" }}>
          <path d="M70 27 L65 7.5 L53 20.5 Q60 21 70 27 Z" fill="url(#ff-fox-coat)" />
          <path d="M67.2 16.5 L65 7.5 L57.4 15.7 Q62 14.6 67.2 16.5 Z" fill="#3f2a3a" />
          <path d="M64.2 19.8 L63 15.2 M61.2 19.3 L59.4 15.8" fill="none" stroke="#fff7ed" strokeWidth={1.1} strokeLinecap="round" opacity={0.9} />
        </g>
        {/* หัวจิ้งจอก แก้มขนฟูสอบลงปลายปากแหลม */}
        <path d="M36 20 Q50 12 64 20 Q70 24 72 30 L76 32.5 L71.5 35 Q71 38.5 67 41 L69.5 44.5 L64 44 Q57 48.5 50 49.5 Q43 48.5 36 44 L30.5 44.5 L33 41 Q29 38.5 28.5 35 L24 32.5 L28 30 Q30 24 36 20 Z" fill="url(#ff-fox-coat)" />
        {/* แก้มล่างสีครีมแบบจิ้งจอกจริง + แก้มแดง */}
        <path d="M33 42 Q35.5 36.8 43.5 37.6 Q44.8 42.5 41 46.2 Q35.5 45.6 33 42 Z" fill="#ffedd5" opacity={0.8} />
        <path d="M67 42 Q64.5 36.8 56.5 37.6 Q55.2 42.5 59 46.2 Q64.5 45.6 67 42 Z" fill="#ffedd5" opacity={0.8} />
        <Blush cx={33.2} cy={39.4} r={2.5} />
        <Blush cx={66.8} cy={39.4} r={2.5} />
        {/* ปลายปากขาว จมูกดำเล็ก ปากยิ้มบางๆ */}
        <path d="M50 37.5 Q43.5 38 41 43 Q44 48.5 50 49 Q56 48.5 59 43 Q56.5 38 50 37.5 Z" fill="#fff7ed" />
        <path d="M47.7 42.4 Q50 41.5 52.3 42.4 Q52.4 45 50 46.1 Q47.6 45 47.7 42.4 Z" fill="#33222e" />
        <Smile cx={50} cy={47.2} w={5.5} />
        {/* เส้นน้ำตาจิ้งจอก จากหัวตาลากลงข้างปาก */}
        <path d="M44.9 33.6 Q45.8 36.4 45 39.6 M55.1 33.6 Q54.2 36.4 55 39.6" fill="none" stroke="#8a5430" strokeWidth={0.9} strokeLinecap="round" opacity={0.42} />
        {/* ตาอัลมอนด์สีอำพัน รูม่านตาเป็นเส้นแนวตั้ง */}
        <g className="ff-blink" style={{ transformOrigin: "40.5px 32.5px", animationDelay: "0s" }}>
          <path d="M36.4 32.4 Q40.5 28.8 44.6 32.4 Q40.5 35.6 36.4 32.4 Z" fill="url(#ff-fox-iris)" />
          <ellipse cx={40.5} cy={32.3} rx={1} ry={1.6} fill="#2c1e29" />
          <path d="M34.9 31.1 L36.3 32.3 Q40.5 28.5 44.7 31.8" fill="none" stroke={FRIEND_INK} strokeWidth={1} strokeLinecap="round" />
          <circle cx={39.7} cy={31.4} r={0.65} fill="#ffffff" />
          <circle cx={41.5} cy={33.1} r={0.3} fill="#ffffff" opacity={0.85} />
        </g>
        <g className="ff-blink" style={{ transformOrigin: "59.5px 32.5px", animationDelay: "0.15s" }}>
          <path d="M55.4 32.4 Q59.5 28.8 63.6 32.4 Q59.5 35.6 55.4 32.4 Z" fill="url(#ff-fox-iris)" />
          <ellipse cx={59.5} cy={32.3} rx={1} ry={1.6} fill="#2c1e29" />
          <path d="M65.1 31.1 L63.7 32.3 Q59.5 28.5 55.3 31.8" fill="none" stroke={FRIEND_INK} strokeWidth={1} strokeLinecap="round" />
          <circle cx={58.7} cy={31.4} r={0.65} fill="#ffffff" />
          <circle cx={60.5} cy={33.1} r={0.3} fill="#ffffff" opacity={0.85} />
        </g>
      </g>
    </g>
  );
}

/** 🦋 น้องผีเสื้อนักเดินทาง — ผีเสื้อตุ๊กตาขนปุย: ตัวกลมนุ่มขอบขนฟู ปีกโปร่งซ้อนสามชั้น
 *  มีลายตาปีก เกล็ดระยิบ และกระพือแบบมีน้ำหนัก (ปีกล่างตามหลังปีกบนครึ่งจังหวะ) */
function Butterfly() {
  // เส้นปีกเขียนครั้งเดียวใช้ซ้ำ 2 ชั้น: ชั้นเบลอ = ขอบขนฟู, ชั้นสี = แผ่นปีกโปร่ง
  const foreL =
    "M 48 40 C 44 27 38 17 28 12.5 C 18 8 8 13 6.5 24 C 5 35 9 45 18 51 C 27 56 39 55.5 46 50.5 C 47.6 47.5 48.3 43.5 48 40 Z";
  const foreR =
    "M 52 40 C 56 27 62 17 72 12.5 C 82 8 92 13 93.5 24 C 95 35 91 45 82 51 C 73 56 61 55.5 54 50.5 C 52.4 47.5 51.7 43.5 52 40 Z";
  const hindL =
    "M 48 54 C 40 55.5 30 58 22.5 63.5 C 14.5 69.5 14 78.5 20.5 82.5 C 27 86.5 38 83.5 43.5 76 C 46.5 71.5 48.4 64 48 54 Z";
  const hindR =
    "M 52 54 C 60 55.5 70 58 77.5 63.5 C 85.5 69.5 86 78.5 79.5 82.5 C 73 86.5 62 83.5 56.5 76 C 53.5 71.5 51.6 64 52 54 Z";
  // ชั้นในของปีก (เยื่อบางกว่า) — ทำให้ปีกดูซ้อนกันหลายชั้นแทนที่จะแบน
  const foreLIn =
    "M 47.5 43 C 44.5 33 39 24.5 30.5 20.5 C 22.5 16.8 13.5 20 12.2 28.5 C 11 37 15 44 22 47.8 C 29 51.4 40 50.6 45.5 47 C 47 45.6 47.8 45 47.5 43 Z";
  const foreRIn =
    "M 52.5 43 C 55.5 33 61 24.5 69.5 20.5 C 77.5 16.8 86.5 20 87.8 28.5 C 89 37 85 44 78 47.8 C 71 51.4 60 50.6 54.5 47 C 53 45.6 52.2 45 52.5 43 Z";
  const hindLIn =
    "M 47.6 58 C 41.5 59 33.5 61.5 27 66 C 20.5 70.5 20 77 24.5 79.8 C 29.5 82.8 36.5 80 40.8 74.2 C 43.5 70.5 47.4 65 47.6 58 Z";
  const hindRIn =
    "M 52.4 58 C 58.5 59 66.5 61.5 73 66 C 79.5 70.5 80 77 75.5 79.8 C 70.5 82.8 63.5 80 59.2 74.2 C 56.5 70.5 52.6 65 52.4 58 Z";

  return (
    <g>
      <defs>
        <linearGradient id="ff-butterfly-fore" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff2fb" />
          <stop offset="45%" stopColor="#f6d3f0" />
          <stop offset="100%" stopColor="#cfc6fb" />
        </linearGradient>
        <linearGradient id="ff-butterfly-hind" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e7dcff" />
          <stop offset="100%" stopColor="#ffd7e8" />
        </linearGradient>
        <radialGradient id="ff-butterfly-fluff" cx="0.4" cy="0.28" r="0.82">
          <stop offset="0%" stopColor="#f4eeff" />
          <stop offset="55%" stopColor="#d6c6f7" />
          <stop offset="100%" stopColor="#a98fe4" />
        </radialGradient>
        <linearGradient id="ff-butterfly-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cbb8f7" />
          <stop offset="100%" stopColor="#9b84e2" />
        </linearGradient>
        {/* ฟุ้งขอบปีกให้เป็นขนนุ่ม ๆ ไม่ใช่ขอบคม */}
        <filter id="ff-butterfly-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={1.7} />
        </filter>
      </defs>

      {/* เงานุ่มใต้ตัว — อยู่นิ่งกับที่ ให้รู้ว่าลอยเหนือพื้น */}
      <ellipse cx={50} cy={94} rx={14} ry={2.6} fill="#8d78d8" opacity={0.14} />

      <g className="ff-float" style={{ animationDuration: "3.8s" }}>
        {/* ---------- ปีกล่าง: กระพือตามหลังปีกบนนิดหน่อย ให้รู้สึกว่าปีกมีน้ำหนัก ---------- */}
        <g className="ff-flap" style={{ transformOrigin: "50px 58px", animationDuration: "0.95s", animationDelay: "0.12s" }}>
          <g className="ff-bob" style={{ animationDuration: "0.95s", animationDelay: "0.12s" }}>
            <g filter="url(#ff-butterfly-soft)" opacity={0.5}>
              <path d={hindL} fill="#f8e6f6" stroke="#f8e6f6" strokeWidth={3.4} strokeLinejoin="round" />
              <path d={hindR} fill="#f8e6f6" stroke="#f8e6f6" strokeWidth={3.4} strokeLinejoin="round" />
            </g>
            <path d={hindL} fill="url(#ff-butterfly-hind)" opacity={0.88} />
            <path d={hindR} fill="url(#ff-butterfly-hind)" opacity={0.88} />
            <path d={hindLIn} fill="#fff7fc" opacity={0.42} />
            <path d={hindRIn} fill="#fff7fc" opacity={0.42} />
            {/* เส้นปีกแผ่ออกจากโคน */}
            <path
              d="M 47.5 57 Q 38 62 26 68 M 47.6 61 Q 39 67 24 74 M 47.4 65 Q 40 71 29 79 M 52.5 57 Q 62 62 74 68 M 52.4 61 Q 61 67 76 74 M 52.6 65 Q 60 71 71 79"
              stroke="#d3b7ea" strokeWidth={0.8} fill="none" strokeLinecap="round" opacity={0.5}
            />
            {/* ลายจุดครีมส้มบนปีกล่าง */}
            <circle cx={25} cy={72} r={3.2} fill="#fff6ec" opacity={0.85} />
            <circle cx={25} cy={72} r={1.7} fill="#ffcfa0" opacity={0.9} />
            <circle cx={75} cy={72} r={3.2} fill="#fff6ec" opacity={0.85} />
            <circle cx={75} cy={72} r={1.7} fill="#ffcfa0" opacity={0.9} />
            <circle cx={33} cy={79} r={1.8} fill="#ffffff" opacity={0.6} />
            <circle cx={67} cy={79} r={1.8} fill="#ffffff" opacity={0.6} />
            {/* ปอยขนริมปีกล่าง */}
            <path
              d="M 19 66.5 q -2.8 -0.4 -4.2 -2 M 15 74 q -3 0.6 -4.4 -0.4 M 17.6 81 q -2.4 2 -2.6 4.2 M 25 84 q -0.8 2.4 0.4 4 M 34 83 q 0.2 2.6 1.4 4 M 81 66.5 q 2.8 -0.4 4.2 -2 M 85 74 q 3 0.6 4.4 -0.4 M 82.4 81 q 2.4 2 2.6 4.2 M 75 84 q 0.8 2.4 -0.4 4 M 66 83 q -0.2 2.6 -1.4 4"
              stroke="#ffffff" strokeWidth={1.1} fill="none" strokeLinecap="round" opacity={0.75}
            />
            <circle className="ff-twinkle" style={{ transformOrigin: "22px 76px", animationDelay: "0.7s" }} cx={22} cy={76} r={1.3} fill="#ffffff" />
            <circle className="ff-twinkle" style={{ transformOrigin: "78px 76px", animationDelay: "1.2s" }} cx={78} cy={76} r={1.3} fill="#ffffff" />
          </g>
        </g>

        {/* ---------- ปีกบน: แผ่นใหญ่ ลายตาปีก เกล็ดระยิบ ---------- */}
        <g className="ff-flap" style={{ transformOrigin: "50px 46px", animationDuration: "0.95s" }}>
          <g className="ff-bob" style={{ animationDuration: "0.95s" }}>
            <g filter="url(#ff-butterfly-soft)" opacity={0.5}>
              <path d={foreL} fill="#fdeaf8" stroke="#fdeaf8" strokeWidth={3.6} strokeLinejoin="round" />
              <path d={foreR} fill="#fdeaf8" stroke="#fdeaf8" strokeWidth={3.6} strokeLinejoin="round" />
            </g>
            <path d={foreL} fill="url(#ff-butterfly-fore)" opacity={0.88} />
            <path d={foreR} fill="url(#ff-butterfly-fore)" opacity={0.88} />
            <path d={foreLIn} fill="#fffaff" opacity={0.42} />
            <path d={foreRIn} fill="#fffaff" opacity={0.42} />
            {/* เส้นปีกแผ่ออกจากโคน */}
            <path
              d="M 47 42 Q 35 32 23 21 M 47 45 Q 33 39 16 31 M 46.6 47.5 Q 32 45.5 13 42 M 46.4 50 Q 33 52 20 50.5 M 53 42 Q 65 32 77 21 M 53 45 Q 67 39 84 31 M 53.4 47.5 Q 68 45.5 87 42 M 53.6 50 Q 67 52 80 50.5"
              stroke="#cbb0ea" strokeWidth={0.8} fill="none" strokeLinecap="round" opacity={0.5}
            />
            {/* ลายตาปีกซ้อนสามชั้น + จุดเล็กเรียงริมปีก */}
            <circle cx={20} cy={32} r={5.8} fill="#fff8fc" opacity={0.85} />
            <circle cx={20} cy={32} r={3.7} fill="#f7bcd9" opacity={0.9} />
            <circle cx={20} cy={32} r={1.6} fill="#b28ae0" opacity={0.85} />
            <circle cx={18.7} cy={30.7} r={1} fill="#ffffff" opacity={0.9} />
            <circle cx={80} cy={32} r={5.8} fill="#fff8fc" opacity={0.85} />
            <circle cx={80} cy={32} r={3.7} fill="#f7bcd9" opacity={0.9} />
            <circle cx={80} cy={32} r={1.6} fill="#b28ae0" opacity={0.85} />
            <circle cx={78.7} cy={30.7} r={1} fill="#ffffff" opacity={0.9} />
            <circle cx={26} cy={19} r={2.2} fill="#ffffff" opacity={0.6} />
            <circle cx={13} cy={43} r={2} fill="#ffffff" opacity={0.55} />
            <circle cx={30} cy={45.5} r={1.6} fill="#ffffff" opacity={0.5} />
            <circle cx={74} cy={19} r={2.2} fill="#ffffff" opacity={0.6} />
            <circle cx={87} cy={43} r={2} fill="#ffffff" opacity={0.55} />
            <circle cx={70} cy={45.5} r={1.6} fill="#ffffff" opacity={0.5} />
            {/* ปอยขนริมปีกบน — ขอบไม่คม ดูนุ่มเหมือนผ้าสำลี */}
            <path
              d="M 26.5 13 q -1.4 -2.8 -0.6 -5 M 17.5 15 q -2.4 -2 -2.6 -4.4 M 9.6 21 q -3 -0.8 -4.4 -2.6 M 6.4 30 q -3.1 0.2 -4.6 -1 M 8.6 38.5 q -3 1.2 -4 3.2 M 13.5 46 q -2.6 1.8 -3.2 4 M 73.5 13 q 1.4 -2.8 0.6 -5 M 82.5 15 q 2.4 -2 2.6 -4.4 M 90.4 21 q 3 -0.8 4.4 -2.6 M 93.6 30 q 3.1 0.2 4.6 -1 M 91.4 38.5 q 3 1.2 4 3.2 M 86.5 46 q 2.6 1.8 3.2 4"
              stroke="#ffffff" strokeWidth={1.1} fill="none" strokeLinecap="round" opacity={0.8}
            />
            <circle className="ff-twinkle" style={{ transformOrigin: "31px 26px" }} cx={31} cy={26} r={1.6} fill="#ffffff" />
            <circle className="ff-twinkle" style={{ transformOrigin: "69px 26px", animationDelay: "0.5s" }} cx={69} cy={26} r={1.6} fill="#ffffff" />
            <circle className="ff-twinkle" style={{ transformOrigin: "12px 36px", animationDelay: "1s" }} cx={12} cy={36} r={1.3} fill="#fef3c7" />
            <circle className="ff-twinkle" style={{ transformOrigin: "88px 36px", animationDelay: "1.4s" }} cx={88} cy={36} r={1.3} fill="#fef3c7" />
          </g>
        </g>

        {/* ---------- ตัวตุ๊กตาปุย — ยกตัวเบา ๆ ตามจังหวะปีก ---------- */}
        <g className="ff-bob" style={{ animationDuration: "0.95s", animationDelay: "0.1s" }}>
          {/* ท้องปุยเป็นปล้อง แกว่งช้า ๆ */}
          <g className="ff-wiggle" style={{ transformOrigin: "50px 58px", animationDuration: "3.2s" }}>
            <path
              d="M 50 57 C 56.5 57 59.2 62 58.4 68.5 C 57.6 75.5 54.6 82 50 82 C 45.4 82 42.4 75.5 41.6 68.5 C 40.8 62 43.5 57 50 57 Z"
              fill="url(#ff-butterfly-body)"
            />
            <path d="M 42.4 64.5 Q 50 67.6 57.6 64.5 M 43 71 Q 50 74 57 71 M 45 77 Q 50 79.6 55 77" stroke="#e6dbff" strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.7} />
            <ellipse cx={46} cy={65.5} rx={2.4} ry={5.5} fill="#f6f0ff" opacity={0.4} transform="rotate(-8 46 65.5)" />
            <path
              d="M 41.8 63 q -2.4 0.8 -3.2 2.6 M 42.6 70 q -2.4 1 -3 2.8 M 44.6 76.5 q -2 1.6 -2.2 3.6 M 58.2 63 q 2.4 0.8 3.2 2.6 M 57.4 70 q 2.4 1 3 2.8 M 55.4 76.5 q 2 1.6 2.2 3.6 M 48.6 81.4 q -0.4 2.4 0.4 4 M 51.4 81.4 q 0.6 2.4 -0.2 3.8"
              stroke="#b9a2ef" strokeWidth={1.1} fill="none" strokeLinecap="round"
            />
          </g>
          {/* มือปุยจิ๋วสองข้าง ขยับคนละจังหวะ */}
          <g className="ff-wiggle" style={{ transformOrigin: "42px 58px", animationDuration: "2.8s" }}>
            <ellipse cx={38.8} cy={61} rx={4.6} ry={3.3} fill="#c3adf0" transform="rotate(26 38.8 61)" />
            <path d="M 36 62.8 q -1.8 1.2 -2.2 3" stroke="#a88fe6" strokeWidth={1.1} fill="none" strokeLinecap="round" />
          </g>
          <g className="ff-wiggle" style={{ transformOrigin: "58px 58px", animationDuration: "2.8s", animationDelay: "1.4s" }}>
            <ellipse cx={61.2} cy={61} rx={4.6} ry={3.3} fill="#c3adf0" transform="rotate(-26 61.2 61)" />
            <path d="M 64 62.8 q 1.8 1.2 2.2 3" stroke="#a88fe6" strokeWidth={1.1} fill="none" strokeLinecap="round" />
          </g>
          {/* อกขนฟู — ก้อนขนซ้อนกันให้ขอบเป็นหยัก ไม่ใช่วงรีเกลี้ยง */}
          <g fill="#bfa9ee">
            <circle cx={40.2} cy={49} r={6} />
            <circle cx={59.8} cy={49} r={6} />
            <circle cx={41.4} cy={57.2} r={5.4} />
            <circle cx={58.6} cy={57.2} r={5.4} />
            <circle cx={50} cy={61} r={6} />
          </g>
          <ellipse cx={50} cy={52} rx={11.5} ry={10.5} fill="url(#ff-butterfly-fluff)" />
          <ellipse cx={46.5} cy={46.5} rx={7.2} ry={4.2} fill="#f6f0ff" opacity={0.55} transform="rotate(-18 46.5 46.5)" />
          <ellipse cx={50} cy={59.5} rx={8} ry={3.2} fill="#8f78d6" opacity={0.2} />
          <path
            d="M 39.4 46.6 q -2.6 0.4 -4 -1 M 38.6 52.4 q -2.8 0.6 -4.2 -0.6 M 39.8 58.6 q -2.6 1 -3.6 2.8 M 60.6 46.6 q 2.6 0.4 4 -1 M 61.4 52.4 q 2.8 0.6 4.2 -0.6 M 60.2 58.6 q 2.6 1 3.6 2.8 M 45.6 43.2 q 0.6 -2.4 2.4 -3.4 M 52.4 43 q 1 -2.4 2.8 -3.2"
            stroke="#dccdfa" strokeWidth={1.1} fill="none" strokeLinecap="round"
          />
          {/* หัวกลมนุ่ม มีขนฟูรอบกระหม่อมและแก้ม */}
          <g fill="#c3adf0">
            <circle cx={41.5} cy={28} r={5} />
            <circle cx={58.5} cy={28} r={5} />
            <circle cx={50} cy={24.5} r={5.4} />
            <circle cx={38.6} cy={35} r={4.6} />
            <circle cx={61.4} cy={35} r={4.6} />
          </g>
          <circle cx={50} cy={33} r={10.5} fill="url(#ff-butterfly-fluff)" />
          <ellipse cx={46} cy={27.5} rx={6} ry={3.6} fill="#f8f3ff" opacity={0.5} transform="rotate(-20 46 27.5)" />
          <path
            d="M 44.5 23.6 q 0.8 -2.4 2.6 -3.4 M 50.4 22.4 q 0.6 -2.4 2.4 -3.2 M 55.6 24 q 1.4 -2.2 3.2 -2.8 M 39.6 39.8 q -2.2 1 -3 2.8 M 60.4 39.8 q 2.2 1 3 2.8"
            stroke="#dccdfa" strokeWidth={1.1} fill="none" strokeLinecap="round"
          />
          {/* หนวดปลายเป็นปอมปุย โยกทีละข้าง */}
          <g className="ff-wiggle" style={{ transformOrigin: "45.5px 26px", animationDuration: "2.6s" }}>
            <path d="M 45.5 26 Q 40.5 17.5 36.5 13.5" stroke="#b9a2ef" strokeWidth={2.3} fill="none" strokeLinecap="round" />
            <circle cx={34.5} cy={10.5} r={3.6} fill="#f7cfe8" />
            <circle cx={32.4} cy={9.2} r={2} fill="#f7cfe8" />
            <circle cx={36.4} cy={8.4} r={2.2} fill="#f7cfe8" />
            <circle cx={33.4} cy={9.4} r={1.1} fill="#ffffff" opacity={0.75} />
          </g>
          <g className="ff-wiggle" style={{ transformOrigin: "54.5px 26px", animationDuration: "2.6s", animationDelay: "0.35s" }}>
            <path d="M 54.5 26 Q 59.5 17.5 63.5 13.5" stroke="#b9a2ef" strokeWidth={2.3} fill="none" strokeLinecap="round" />
            <circle cx={65.5} cy={10.5} r={3.6} fill="#f7cfe8" />
            <circle cx={67.6} cy={9.2} r={2} fill="#f7cfe8" />
            <circle cx={63.6} cy={8.4} r={2.2} fill="#f7cfe8" />
            <circle cx={66.6} cy={9.4} r={1.1} fill="#ffffff" opacity={0.75} />
          </g>
          {/* หน้ายิ้มละมุน */}
          <GEye cx={45.4} cy={33} r={4.4} delay={0} />
          <GEye cx={54.6} cy={33} r={4.4} delay={0.15} />
          <Smile cx={50} cy={39.2} w={5.5} />
          <Blush cx={41.6} cy={37.4} r={3} />
          <Blush cx={58.4} cy={37.4} r={3} />
          <circle cx={50} cy={36.4} r={0.8} fill={FRIEND_INK} opacity={0.4} />
        </g>

        {/* ละอองแป้งปีกลอยขึ้นเป็นทางบิน */}
        <g fill="#fbcfe8">
          <circle className="ff-drift" cx={45} cy={88} r={1.6} style={{ animationDelay: "0s" }} />
          <circle className="ff-drift" cx={56} cy={90} r={1.2} fill="#ddd6fe" style={{ animationDelay: "0.9s" }} />
          <path className="ff-drift" fill="#fde68a" style={{ animationDelay: "1.7s" }}
            d="M 50 84 L 50.8 85.8 L 52.6 86.6 L 50.8 87.4 L 50 89.2 L 49.2 87.4 L 47.4 86.6 L 49.2 85.8 Z" />
        </g>
      </g>
    </g>
  );
}

/** วาฬสีน้ำเงินท่องนภา — รอร์ควอลกึ่งเรียล: ปากกว้างแบน ครีบหลังจิ๋วท้ายลำ ร่องใต้คาง พ่นละอองดาว */
function Whale() {
  return (
    <g>
      <defs>
        <linearGradient id="ff-whale-a-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="55%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="ff-whale-a-fin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7fb8fc" />
          <stop offset="100%" stopColor="#4f8ef8" />
        </linearGradient>
      </defs>
      {/* เมฆนุ่มลอยข้าง — ก้อนบนนิ่ง ก้อนล่างลอยช้า */}
      <g fill="#ffffff" opacity={0.85}>
        <ellipse cx={80} cy={19} rx={9.5} ry={5} />
        <ellipse cx={87} cy={15.5} rx={6.5} ry={4} />
      </g>
      <g className="ff-float" fill="#ffffff" opacity={0.85} style={{ animationDelay: "1.4s", animationDuration: "4.6s" }}>
        <ellipse cx={12} cy={80} rx={9} ry={5} />
        <ellipse cx={19} cy={76} rx={6} ry={4} />
      </g>
      <g className="ff-float">
        {/* หางแฉกกว้างปลายลำ — โบกจากโคนหาง */}
        <g className="ff-wiggle" style={{ transformOrigin: "83px 50px", animationDuration: "2.4s" }}>
          <path d="M 82 50 Q 85 43 96 37.5 Q 93 46 88 49.8 Q 93 54 96 62.5 Q 85 57 82 50 Z" fill="url(#ff-whale-a-fin)" />
        </g>
        {/* ครีบหลังจิ๋วโค้งงอ — อยู่ค่อนไปท้ายลำแบบวาฬสีน้ำเงินจริง */}
        <path d="M 68.5 43.5 Q 70.5 38.6 74.3 37.9 Q 73.4 40.8 72.6 43.9 Z" fill="url(#ff-whale-a-fin)" />
        {/* ลำตัวยาวเพรียว — ปากกว้างแบนซ้าย หลังลาด โคนหางคอด */}
        <path
          d="M 5 46 C 6 40.5 12 37.8 20 36.8 C 30 35.6 40 35.2 50 36.6 C 60 38.2 68 41 76 45 C 79 46.6 81.5 48 83.5 49.6 C 80.5 53.5 76 55.4 70 57 C 58 60.4 46 62.3 36 62.3 C 24 62.2 13 58 8.6 52.6 C 6.4 49.6 5.2 47.8 5 46 Z"
          fill="url(#ff-whale-a-body)"
        />
        {/* แสงบนหลัง + ลายด่างหินอ่อนแบบผิววาฬจริง */}
        <ellipse cx={28} cy={39.5} rx={9} ry={2.6} fill="#dbeafe" opacity={0.5} transform="rotate(-8 28 39.5)" />
        <ellipse cx={34} cy={41.5} rx={2.6} ry={1.4} fill="#dbeafe" opacity={0.35} transform="rotate(-8 34 41.5)" />
        <ellipse cx={46} cy={44.5} rx={2.1} ry={1.2} fill="#cbd5e1" opacity={0.3} transform="rotate(6 46 44.5)" />
        <ellipse cx={55} cy={41.5} rx={2.8} ry={1.5} fill="#dbeafe" opacity={0.3} transform="rotate(-5 55 41.5)" />
        <ellipse cx={63} cy={47} rx={1.9} ry={1.1} fill="#cbd5e1" opacity={0.28} />
        <circle cx={41} cy={47.5} r={1.1} fill="#dbeafe" opacity={0.35} />
        {/* ท้องสีอ่อน */}
        <path
          d="M 5 46 C 5.2 47.8 6.4 49.6 8.6 52.6 C 13 58 24 62.2 36 62.3 C 46 62.3 58 60.4 68 57.5 C 60 55.3 50 55.6 40 55.8 C 24 55.6 12 50.8 7.4 47 Q 6 46.4 5 46 Z"
          fill="#e0f2fe" opacity={0.95}
        />
        {/* ร่องใต้คาง (ventral pleats) โค้งตามแนวกราม-ท้อง */}
        <path
          d="M 7.5 51 Q 22 61.2 42 61.4 M 8.5 49.6 Q 24 59.4 46 59.7 M 10 48.4 Q 26 57.7 50 58 M 12 47.4 Q 28 56 53 56.2"
          stroke="#bae6fd" strokeWidth={1.3} fill="none" strokeLinecap="round" opacity={0.9}
        />
        {/* ครีบข้างเรียวยาว ใต้ช่วงหน้าลำตัว */}
        <path className="ff-wiggle" style={{ transformOrigin: "28px 56px", animationDuration: "3.6s" }}
          d="M 27.5 55.5 Q 37 57.5 46.5 66.5 Q 46.8 69 43.8 68.6 Q 33.5 64.5 26.5 58 Z"
          fill="url(#ff-whale-a-fin)"
        />
        {/* แนวปากรอร์ควอล — กวาดยาวจากปลายปาก ปลายโค้งขึ้นให้ยังยิ้ม */}
        <path d="M 5.8 46.8 Q 13 51 22 52.2 Q 27 52.7 30.5 51" fill="none" stroke={FRIEND_INK} strokeWidth={1.5} strokeLinecap="round" opacity={0.8} />
        {/* ตาวาฬจริง — เม็ดเล็กต่ำใกล้มุมปาก แววเดียว + เส้นเปลือกตาบน */}
        <g className="ff-blink" style={{ transformOrigin: "31.5px 49.5px" }}>
          <circle cx={31.5} cy={49.5} r={2.7} fill="#2f3a4a" />
          <circle cx={32.4} cy={48.6} r={0.85} fill="#fff" />
          <path d="M 28.7 48 Q 31.5 46.3 34.3 48.1" fill="none" stroke="#2f3a4a" strokeWidth={1} strokeLinecap="round" />
        </g>
        <Blush cx={37} cy={52.5} r={3.2} color="#f9a8d4" opacity={0.8} />
        {/* รูหายใจบนหัว + น้ำพุละอองดาวทอง */}
        <ellipse cx={22.5} cy={37.4} rx={1.9} ry={1} fill={FRIEND_INK} opacity={0.4} />
        <g fill="#fcd34d">
          <path className="ff-drift" style={{ animationDelay: "0s" }}
            d="M 22.5 23.5 L 23.4 25.6 L 25.5 26.5 L 23.4 27.4 L 22.5 29.5 L 21.6 27.4 L 19.5 26.5 L 21.6 25.6 Z" />
          <circle className="ff-drift" cx={17.5} cy={22} r={1.6} fill="#fde68a" style={{ animationDelay: "0.5s" }} />
          <path className="ff-drift" fill="#fde68a" style={{ animationDelay: "1s" }}
            d="M 28.5 14.9 L 29.3 16.7 L 31.1 17.5 L 29.3 18.3 L 28.5 20.1 L 27.7 18.3 L 25.9 17.5 L 27.7 16.7 Z" />
          <circle className="ff-drift" cx={21} cy={13.5} r={1.3} style={{ animationDelay: "1.5s" }} />
          <path className="ff-drift" fill="#fde68a" style={{ animationDelay: "0.8s" }}
            d="M 25 6.4 L 25.7 7.9 L 27.2 8.6 L 25.7 9.3 L 25 10.8 L 24.3 9.3 L 22.8 8.6 L 24.3 7.9 Z" />
        </g>
      </g>
    </g>
  );
}

/** 🐉 มังกรขนปุย — มังกรน้อยกึ่งเรียล: หัวกับลำตัวแยกเป็นสองก้อนชัดเจน (ของเดิมเป็นลูกกลมลูกเดียว
 *  เลยไม่มีสัดส่วน) มีปากยื่นสั้น ๆ พร้อมรูจมูก เขาโค้งมีสันขวาง ครีบหูแนบข้างแก้ม
 *  ปีกค้างคาวแผ่นกว้างมีก้านนิ้วและขอบหยัก แขน-ขาสั้นป้อมมีเล็บครีม
 *  หางอ้วนม้วนออกข้างจบด้วยปลายหัวใจ และพ่นไฟเป็นหัวใจดวงเล็กลอยขึ้นจากปาก */
function Dragon() {
  const headD =
    "M 50 13.6 C 61.5 13.6 69.6 19.4 71 29.4 C 72.2 38.4 66.6 46.4 57.6 49.8 C 55 50.8 52.4 51.2 50 51.2 C 47.6 51.2 45 50.8 42.4 49.8 C 33.4 46.4 27.8 38.4 29 29.4 C 30.4 19.4 38.5 13.6 50 13.6 Z";
  const bodyD =
    "M 50 45 C 63 45 71.5 53 72.5 64.5 C 73.6 77 65.4 86.5 50 86.5 C 34.6 86.5 26.4 77 27.5 64.5 C 28.5 53 37 45 50 45 Z";
  // ปีก: ขอบหน้า = กระดูกแขนพาดขึ้นไปหาข้อมือ แล้วขอบหลังหยักเว้าระหว่างปลายนิ้วสามนิ้ว
  const wingR =
    "M 61 50 C 69 39 78 29 86 25.5 C 89.5 24 93 26.5 95 32.5 C 89.5 36 87.5 41 90.5 46 C 84.5 47.5 80 48.5 76.5 54 C 71.5 53 66.5 54 62 57 Z";
  const wingL =
    "M 39 50 C 31 39 22 29 14 25.5 C 10.5 24 7 26.5 5 32.5 C 10.5 36 12.5 41 9.5 46 C 15.5 47.5 20 48.5 23.5 54 C 28.5 53 33.5 54 38 57 Z";
  const claw = "#f4e6bd";
  return (
    <g>
      <defs>
        <radialGradient id="ff-dragon-body" cx="0.36" cy="0.24" r="0.94">
          <stop offset="0%" stopColor="#c6f8e0" />
          <stop offset="48%" stopColor="#84e2b8" />
          <stop offset="100%" stopColor="#3ea886" />
        </radialGradient>
        <radialGradient id="ff-dragon-head" cx="0.38" cy="0.26" r="0.92">
          <stop offset="0%" stopColor="#d2fbe8" />
          <stop offset="52%" stopColor="#8ee7c0" />
          <stop offset="100%" stopColor="#46b08d" />
        </radialGradient>
        <radialGradient id="ff-dragon-snout" cx="0.5" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#e7fdf2" />
          <stop offset="100%" stopColor="#b5eed4" />
        </radialGradient>
        <linearGradient id="ff-dragon-belly" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdf7dc" />
          <stop offset="100%" stopColor="#eed695" />
        </linearGradient>
        <linearGradient id="ff-dragon-wing" x1="0.1" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#cdf3fa" />
          <stop offset="48%" stopColor="#8bd8e6" />
          <stop offset="100%" stopColor="#4ba9bd" />
        </linearGradient>
        <linearGradient id="ff-dragon-ear" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#89e0b8" />
          <stop offset="100%" stopColor="#3f9f7d" />
        </linearGradient>
        <linearGradient id="ff-dragon-horn" x1="0" y1="1" x2="0.3" y2="0">
          <stop offset="0%" stopColor="#dda23f" />
          <stop offset="52%" stopColor="#f7cd72" />
          <stop offset="100%" stopColor="#fff4cf" />
        </linearGradient>
        <linearGradient id="ff-dragon-tail" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6fd2a6" />
          <stop offset="100%" stopColor="#3f9f7d" />
        </linearGradient>
        <clipPath id="ff-dragon-bodyclip">
          <path d={bodyD} />
        </clipPath>
        <clipPath id="ff-dragon-headclip">
          <path d={headD} />
        </clipPath>
      </defs>

      {/* เงาทอดพื้น — นอกกลุ่มที่ขยับ จะได้ไม่ลอยตามตัว */}
      <ellipse cx={50} cy={90} rx={26} ry={3.6} fill="#2f7a5e" opacity={0.15} />
      <ellipse cx={50} cy={89.6} rx={13} ry={2} fill="#245c47" opacity={0.14} />

      {/* ---- ปีกค้างคาว: โคนจมอยู่ในไหล่ กระพือคนละจังหวะซ้าย-ขวา ---- */}
      <g className="ff-flap" style={{ transformOrigin: "39px 52px", animationDuration: "2.2s" }}>
        <path d={wingL} fill="url(#ff-dragon-wing)" />
        <path
          d="M 37.5 52.5 C 28 44 16 37 6.5 32.5 M 37 54 C 29 49 19 46.5 10.5 45.5 M 36.5 55.5 C 32 53.5 28 53 24.2 53.5"
          stroke="#4c9fb8" strokeWidth={1.2} fill="none" opacity={0.5} strokeLinecap="round"
        />
        <path d={wingL} fill="none" stroke="#5cb3c6" strokeWidth={1} opacity={0.5} />
        <path d="M 38 51 C 30 42 21 32 13.5 26.5" stroke="#4c9fb8" strokeWidth={2.2} fill="none" opacity={0.7} strokeLinecap="round" />
      </g>
      <g className="ff-flap" style={{ transformOrigin: "61px 52px", animationDuration: "2.2s", animationDelay: "-0.4s" }}>
        <path d={wingR} fill="url(#ff-dragon-wing)" />
        <path
          d="M 62.5 52.5 C 72 44 84 37 93.5 32.5 M 63 54 C 71 49 81 46.5 89.5 45.5 M 63.5 55.5 C 68 53.5 72 53 75.8 53.5"
          stroke="#4c9fb8" strokeWidth={1.2} fill="none" opacity={0.5} strokeLinecap="round"
        />
        <path d={wingR} fill="none" stroke="#5cb3c6" strokeWidth={1} opacity={0.5} />
        <path d="M 62 51 C 70 42 79 32 86.5 26.5" stroke="#4c9fb8" strokeWidth={2.2} fill="none" opacity={0.7} strokeLinecap="round" />
      </g>

      {/* ---- หาง: โคนซ่อนใต้สะโพก ม้วนออกขวาแล้วจบด้วยปลายหัวใจ แกว่งช้า ๆ ---- */}
      <g className="ff-tail" style={{ transformOrigin: "64px 79px", animationDuration: "3.2s" }}>
        <path d="M 64 79 C 74 82.5 82 80 86.5 73.5" stroke="url(#ff-dragon-tail)" strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d="M 66 77.6 C 74 80.4 80.4 78.4 84.4 73.4" stroke="#a5edcb" strokeWidth={2.2} fill="none" strokeLinecap="round" opacity={0.5} />
        <path
          d="M 87.6 73.2 C 91.2 71.4 91.6 67 88.6 65.2 C 86.6 64 84.4 64.9 83.7 66.9 C 83.1 64.9 80.8 64.5 79.1 66 C 76.4 68.4 78.2 72.8 82.1 73.9 C 84.3 74.5 85.8 74.1 87.6 73.2 Z"
          fill="#6fd2a6"
        />
        <path d="M 84.4 67.6 C 83.4 68.6 83.2 70 83.8 71.2" stroke="#a5edcb" strokeWidth={1} fill="none" strokeLinecap="round" opacity={0.6} />
      </g>

      {/* ---- ครีบหูข้างแก้ม กระดิกทีละข้าง ---- */}
      <g className="ff-ear" style={{ transformOrigin: "31px 35px" }}>
        <path d="M 31 32 C 27.6 30.6 24.6 31.4 23.4 34.2 C 25.4 37.2 28.4 38.6 31.4 38 Z" fill="url(#ff-dragon-ear)" />
        <path d="M 29 33.2 C 27 33 25.6 33.4 24.8 34.4 M 29.2 35.8 C 27.4 35.8 26.2 36.2 25.4 36.8" stroke="#2f8a68" strokeWidth={0.8} fill="none" opacity={0.5} strokeLinecap="round" />
      </g>
      <g className="ff-ear" style={{ transformOrigin: "69px 35px", animationDelay: "0.5s" }}>
        <path d="M 69 32 C 72.4 30.6 75.4 31.4 76.6 34.2 C 74.6 37.2 71.6 38.6 68.6 38 Z" fill="url(#ff-dragon-ear)" />
        <path d="M 71 33.2 C 73 33 74.4 33.4 75.2 34.4 M 70.8 35.8 C 72.6 35.8 73.8 36.2 74.6 36.8" stroke="#2f8a68" strokeWidth={0.8} fill="none" opacity={0.5} strokeLinecap="round" />
      </g>

      {/* ---- เขาทองโค้ง โคนจมในหัว + หงอนเล็กกลางกระหม่อม ---- */}
      <path d="M 44.6 16.2 C 40.8 11 36 7 30.6 4.6 C 31.4 10.6 33.4 15.8 36.6 20.4 C 39.6 21.4 42.6 19.6 44.6 16.2 Z" fill="url(#ff-dragon-horn)" />
      <path d="M 55.4 16.2 C 59.2 11 64 7 69.4 4.6 C 68.6 10.6 66.6 15.8 63.4 20.4 C 60.4 21.4 57.4 19.6 55.4 16.2 Z" fill="url(#ff-dragon-horn)" />
      <path d="M 41.4 16.4 C 38.6 12.8 35.4 9.6 32 7.4" stroke="#fff4cf" strokeWidth={1} fill="none" opacity={0.7} strokeLinecap="round" />
      <path d="M 58.6 16.4 C 61.4 12.8 64.6 9.6 68 7.4" stroke="#fff4cf" strokeWidth={1} fill="none" opacity={0.7} strokeLinecap="round" />
      <path d="M 37.4 18.6 C 39.2 18 41.2 17.2 43 16.4 M 34.8 14 C 36.2 13 37.6 12 39 11 M 32.8 9.6 C 33.8 8.8 34.8 8 35.8 7.2" stroke="#dda23f" strokeWidth={0.9} fill="none" opacity={0.55} strokeLinecap="round" />
      <path d="M 62.6 18.6 C 60.8 18 58.8 17.2 57 16.4 M 65.2 14 C 63.8 13 62.4 12 61 11 M 67.2 9.6 C 66.2 8.8 65.2 8 64.2 7.2" stroke="#dda23f" strokeWidth={0.9} fill="none" opacity={0.55} strokeLinecap="round" />
      <path d="M 45.6 14.6 C 46.6 11.6 48 9.6 49.2 8.6 C 49.6 10.6 49.8 12.6 49.8 14.2 Z M 50.2 14.2 C 50.4 11.8 51 9.6 51.8 8.2 C 53 9.8 54 12 54.6 14.6 Z" fill="#5cc79f" />

      {/* ---- ลำตัวอ้วนกลม + ท้องเป็นปล้อง ---- */}
      <path d={bodyD} fill="url(#ff-dragon-body)" />
      <g clipPath="url(#ff-dragon-bodyclip)">
        {/* แสงบนไหล่ซ้าย เงาโค้งขวาล่าง และเงาหัวทาบลงอก */}
        <ellipse cx={38} cy={55} rx={13} ry={8} fill="#ffffff" opacity={0.25} transform="rotate(-20 38 55)" />
        <ellipse cx={80} cy={82} rx={24} ry={20} fill="#2f7a5e" opacity={0.2} />
        <ellipse cx={50} cy={50} rx={20} ry={6} fill="#2f7a5e" opacity={0.18} />
      </g>
      <ellipse cx={50} cy={70} rx={14} ry={12} fill="url(#ff-dragon-belly)" />
      <path d="M 37 65.6 Q 50 68.4 63 65.6 M 36.2 70.6 Q 50 73.6 63.8 70.6 M 38.4 75.8 Q 50 78.4 61.6 75.8" stroke="#e0c583" strokeWidth={1.1} fill="none" opacity={0.7} strokeLinecap="round" />
      <path d="M 28.6 57.6 l -3.2 -2 M 27 68 l -3.6 -0.6 M 30.4 78 l -2.8 2.2 M 71.4 57.6 l 3.2 -2 M 73 68 l 3.6 -0.6 M 69.6 78 l 2.8 2.2" stroke="#a8ecd0" strokeWidth={1.6} strokeLinecap="round" opacity={0.85} />

      {/* ---- แขนสั้นป้อมมีเล็บ ขยับคนละจังหวะ ---- */}
      <g className="ff-wiggle" style={{ transformOrigin: "33px 61px", animationDuration: "5.4s" }}>
        <path d="M 32 60.5 C 26.5 61.5 22.5 65.5 22.8 69.8 C 23 73.2 26 75 29.4 73.8 C 32.4 72.8 34.4 69.8 34.8 66 Z" fill="url(#ff-dragon-body)" />
        <path d="M 24.2 72.4 l -1.8 2.4 M 27.4 74.4 l -1 2.6 M 30.8 74 l 0.2 2.6" stroke={claw} strokeWidth={1.6} strokeLinecap="round" fill="none" />
      </g>
      <g className="ff-wiggle" style={{ transformOrigin: "67px 61px", animationDuration: "5.4s", animationDelay: "1.6s" }}>
        <path d="M 68 60.5 C 73.5 61.5 77.5 65.5 77.2 69.8 C 77 73.2 74 75 70.6 73.8 C 67.6 72.8 65.6 69.8 65.2 66 Z" fill="url(#ff-dragon-body)" />
        <path d="M 75.8 72.4 l 1.8 2.4 M 72.6 74.4 l 1 2.6 M 69.2 74 l -0.2 2.6" stroke={claw} strokeWidth={1.6} strokeLinecap="round" fill="none" />
      </g>

      {/* ---- เท้าสองข้าง ---- */}
      <ellipse cx={40} cy={84.6} rx={8.4} ry={5.4} fill="url(#ff-dragon-body)" />
      <ellipse cx={60} cy={84.6} rx={8.4} ry={5.4} fill="url(#ff-dragon-body)" />
      <path d="M 34.4 86.4 l -1.4 2.4 M 39.6 88.2 l -0.2 2.4 M 45 86.4 l 1.4 2.4 M 54.4 86.4 l -1.4 2.4 M 59.6 88.2 l -0.2 2.4 M 65 86.4 l 1.4 2.4" stroke={claw} strokeWidth={1.7} strokeLinecap="round" fill="none" />

      {/* ---- หัว ---- */}
      <path d={headD} fill="url(#ff-dragon-head)" />
      <g clipPath="url(#ff-dragon-headclip)">
        <ellipse cx={39} cy={24} rx={12} ry={7} fill="#ffffff" opacity={0.28} transform="rotate(-20 39 24)" />
        <ellipse cx={74} cy={44} rx={16} ry={14} fill="#2f7a5e" opacity={0.16} />
      </g>

      {/* ---- ปากยื่นสั้น รูจมูก ปากอ้ายิ้ม เขี้ยวเล็ก ลิ้น ---- */}
      <ellipse cx={50} cy={41} rx={11} ry={7.4} fill="url(#ff-dragon-snout)" />
      <path d="M 46.4 36.6 q -1.2 1 -0.2 2.2 M 53.6 36.6 q 1.2 1 0.2 2.2" stroke="#5aab8b" strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <path d="M 42.6 42.6 C 44.6 49.4 55.4 49.4 57.4 42.6 Z" fill="#c94a63" />
      <path d="M 46.4 47 C 47.6 49.8 52.4 49.8 53.6 47 C 51.4 48.2 48.6 48.2 46.4 47 Z" fill="#f9a8d4" />
      <path d="M 44.6 43 l 1.5 2.2 1.5 -2.2 Z M 52.4 43 l 1.5 2.2 1.5 -2.2 Z" fill="#ffffff" />
      <path d="M 42.6 42.6 C 45.6 41.6 54.4 41.6 57.4 42.6" stroke="#3f9f7d" strokeWidth={1} fill="none" opacity={0.45} strokeLinecap="round" />

      {/* ---- หน้า ---- */}
      <GEye cx={41.5} cy={28.5} r={5.4} />
      <GEye cx={58.5} cy={28.5} r={5.4} delay={0.4} />
      <path d="M 36.6 21.6 C 38.6 20 41.4 19.8 43.6 21 M 63.4 21.6 C 61.4 20 58.6 19.8 56.4 21" stroke="#3f9f7d" strokeWidth={1.5} fill="none" strokeLinecap="round" opacity={0.7} />
      <Blush cx={33.6} cy={36.4} r={4.6} color="#ff8fb4" opacity={0.6} />
      <Blush cx={66.4} cy={36.4} r={4.6} color="#ff8fb4" opacity={0.6} />

      {/* ---- พ่นไฟเป็นหัวใจ ลอยขึ้นจากมุมปากแล้วจางหาย ---- */}
      <g className="ff-drift" style={{ animationDuration: "3s" }}>
        <path d="M 62.5 40 C 60.6 38 61 35.2 63 35.2 C 63.9 35.2 64.4 35.8 64.4 36.5 C 64.4 35.8 64.9 35.2 65.8 35.2 C 67.8 35.2 68.2 38 66.3 40 C 65.3 40.9 63.5 40.9 62.5 40 Z" fill="#fb7185" />
      </g>
      <g className="ff-drift" style={{ animationDuration: "3s", animationDelay: "-1s" }}>
        <path d="M 70.5 31.5 C 68.9 29.9 69.2 27.6 70.8 27.6 C 71.5 27.6 71.9 28.1 71.9 28.7 C 71.9 28.1 72.3 27.6 73 27.6 C 74.6 27.6 74.9 29.9 73.3 31.5 C 72.5 32.2 71.3 32.2 70.5 31.5 Z" fill="#fda4af" />
      </g>
      <g className="ff-drift" style={{ animationDuration: "3s", animationDelay: "-2s" }}>
        <path d="M 77.6 24.4 C 76.4 23.2 76.6 21.5 77.8 21.5 C 78.3 21.5 78.6 21.9 78.6 22.3 C 78.6 21.9 78.9 21.5 79.4 21.5 C 80.6 21.5 80.8 23.2 79.6 24.4 C 79 25 78.2 25 77.6 24.4 Z" fill="#fecdd3" />
      </g>

      <g className="ff-twinkle">
        <path d="M 16 20 l 1.3 3 3 1.3 -3 1.3 -1.3 3 -1.3 -3 -3 -1.3 3 -1.3 Z" fill="#fde68a" />
      </g>
      <g className="ff-twinkle" style={{ animationDelay: "-1s" }}>
        <path d="M 88 58 l 1.1 2.6 2.6 1.1 -2.6 1.1 -1.1 2.6 -1.1 -2.6 -2.6 -1.1 2.6 -1.1 Z" fill="#a7f3d0" />
      </g>
      <g className="ff-twinkle" style={{ animationDelay: "-1.8s" }}>
        <path d="M 10 62 l 0.9 2.1 2.1 0.9 -2.1 0.9 -0.9 2.1 -0.9 -2.1 -2.1 -0.9 2.1 -0.9 Z" fill="#bae6fd" />
      </g>
    </g>
  );
}

/** 🦄 ยูนิคอร์นแห่งความฝัน — โพนี่ขนมุกกึ่งเรียล: กะโหลกแก้มกว้างปากสั้น จมูกมีรูจมูกจริง
 *  ตาม่วงขนตายาว หูในสีชมพู เขาเกลียวทองมีสันจับแสง แผงคอ-หางสายรุ้งพลิ้วเป็นช่อ
 *  ขาสี่ข้างมีกีบสีมุก และออร่ารุ้งเรืองรอบตัว */
function Unicorn() {
  return (
    <g>
      <defs>
        <radialGradient id="ff-uni-coat" cx="0.36" cy="0.26" r="0.95">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#f7f4fd" />
          <stop offset="100%" stopColor="#ddd7f1" />
        </radialGradient>
        <radialGradient id="ff-uni-head" cx="0.38" cy="0.28" r="0.92">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f9f6fe" />
          <stop offset="100%" stopColor="#e3ddf4" />
        </radialGradient>
        <linearGradient id="ff-uni-muzzle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fefaff" />
          <stop offset="100%" stopColor="#f6dced" />
        </linearGradient>
        <linearGradient id="ff-uni-horn" x1="0" y1="1" x2="0.35" y2="0">
          <stop offset="0%" stopColor="#dd9c34" />
          <stop offset="45%" stopColor="#fbcf6e" />
          <stop offset="100%" stopColor="#fff7dc" />
        </linearGradient>
        <linearGradient id="ff-uni-hoof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4dbf4" />
          <stop offset="100%" stopColor="#c4a0dd" />
        </linearGradient>
        <radialGradient id="ff-uni-iris" cx="0.38" cy="0.32" r="0.85">
          <stop offset="0%" stopColor="#bcaaf4" />
          <stop offset="48%" stopColor="#7a5cc6" />
          <stop offset="100%" stopColor="#38246a" />
        </radialGradient>
        <radialGradient id="ff-uni-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="52%" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="100%" stopColor="#e9d5ff" stopOpacity={0.5} />
        </radialGradient>
        <clipPath id="ff-uni-bodyclip">
          <ellipse cx={50} cy={69} rx={22.5} ry={15.5} />
        </clipPath>
        <clipPath id="ff-uni-headclip">
          <path d="M 50 20.5 C 62 20.5 71.5 26.5 73.2 36.5 C 74.6 44.8 70.6 51.8 63.4 55.4 C 58.6 57.8 54.4 58.6 50 58.6 C 45.6 58.6 41.4 57.8 36.6 55.4 C 29.4 51.8 25.4 44.8 26.8 36.5 C 28.5 26.5 38 20.5 50 20.5 Z" />
        </clipPath>
      </defs>

      {/* ---- ออร่ารุ้ง: ฟุ้งนุ่มรอบตัว + เส้นรุ้งสามชั้น
             (จบเส้นสูงกว่าโคนหาง ไม่งั้นออร่ากับหางจะต่อกันจนดูเป็นสายรุ้งเส้นเดียว) ---- */}
      <ellipse cx={50} cy={50} rx={48} ry={48} fill="url(#ff-uni-glow)" />
      <g className="ff-shimmer" fill="none" strokeWidth={2.2} strokeLinecap="round" opacity={0.45}>
        <path d="M 8 54 A 42 42 0 0 1 92 54" stroke="#fda4af" />
        <path d="M 14 54 A 36 36 0 0 1 86 54" stroke="#fde68a" />
        <path d="M 20 54 A 30 30 0 0 1 80 54" stroke="#a7f3d0" />
      </g>

      {/* เงานุ่มใต้ตัว — อยู่นอกกลุ่มที่ขยับ จะได้ไม่ลอยตาม */}
      <ellipse cx={50} cy={91} rx={25} ry={3.4} fill="#7c6bb0" opacity={0.14} />

      <g className="ff-bob" style={{ animationDuration: "3.4s" }}>
        {/* ---- หางสายรุ้ง: โคนจมในสะโพก ปลายม้วนกลับเข้าหาตัว (ให้อ่านเป็น "หาง" ไม่ใช่เส้นออร่า) ---- */}
        <g className="ff-wiggle" style={{ transformOrigin: "68px 62px", animationDuration: "3.6s", animationDelay: "0.4s" }}>
          <path d="M 68 60 C 82 62 90.5 74 84.5 86 C 82.8 89.4 79.6 90.6 76.4 89.6" stroke="#fda4af" strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d="M 68 62.6 C 80.6 65 87.6 75.4 82.2 86.6 C 80.6 89.4 78 90.4 75.4 89.6" stroke="#fde68a" strokeWidth={4.6} fill="none" strokeLinecap="round" />
          <path d="M 68 65.2 C 79 68 84.8 76.6 80 87 C 78.8 89.4 76.6 90.2 74.4 89.4" stroke="#a7f3d0" strokeWidth={4.2} fill="none" strokeLinecap="round" />
          <path d="M 68 67.8 C 77.6 70.4 82.4 77.6 78 87.2 C 77 89.2 75.2 89.8 73.4 89.2" stroke="#bae6fd" strokeWidth={3.8} fill="none" strokeLinecap="round" />
          <path d="M 68 70.4 C 76 73 80 78.8 76.4 87.4 C 75.6 89 74 89.6 72.6 89" stroke="#ddd6fe" strokeWidth={3.4} fill="none" strokeLinecap="round" />
          <path d="M 71.6 62.6 C 82 66.6 88.4 76.4 83.4 85.4 M 72.2 67.2 C 79.6 70.6 83.6 77.6 80.4 85.4"
            stroke="#ffffff" strokeWidth={1} fill="none" strokeLinecap="round" opacity={0.5} />
        </g>

        {/* ---- ขาหลัง (อยู่หลังลำตัว จึงหม่นกว่านิดหนึ่ง) ---- */}
        <rect x={28.4} y={72} width={7.6} height={16} rx={3.8} fill="#e5dff3" />
        <rect x={64} y={72} width={7.6} height={16} rx={3.8} fill="#e5dff3" />
        <path d="M 28.2 83.6 h 8 v 3.6 q 0 2 -2 2 h -4 q -2 0 -2 -2 Z" fill="url(#ff-uni-hoof)" opacity={0.85} />
        <path d="M 63.8 83.6 h 8 v 3.6 q 0 2 -2 2 h -4 q -2 0 -2 -2 Z" fill="url(#ff-uni-hoof)" opacity={0.85} />

        {/* ---- ลำตัวกลมนุ่ม ---- */}
        <ellipse cx={50} cy={69} rx={22.5} ry={15.5} fill="url(#ff-uni-coat)" />
        <g clipPath="url(#ff-uni-bodyclip)">
          {/* แสงบนไหล่ซ้าย + เงาโค้งขวาล่าง = ปริมาตรกลม */}
          <ellipse cx={39} cy={60} rx={13} ry={7} fill="#ffffff" opacity={0.55} transform="rotate(-16 39 60)" />
          <ellipse cx={79} cy={83} rx={24} ry={20} fill="#a89ccf" opacity={0.28} />
          {/* เงาหัวทาบลงอก */}
          <ellipse cx={50} cy={55} rx={19} ry={5} fill="#a89ccf" opacity={0.2} />
          {/* แผงอกขนนุ่ม + เส้นขน */}
          <ellipse cx={50} cy={72} rx={13.5} ry={10} fill="#fffdff" opacity={0.8} />
          <path d="M 43.6 65 q 1.6 2 1 4.2 M 50 63.8 q 1.8 2 1.2 4.2 M 56.4 65 q 1.6 2 1 4.2"
            stroke="#e7e0f5" strokeWidth={1.1} fill="none" strokeLinecap="round" />
          <path d="M 31.6 62 Q 29 66 29.6 70.6 M 68.4 62 Q 71 66 70.4 70.6 M 70 74.4 Q 72 77.6 71.4 81"
            stroke="#d9d1ee" strokeWidth={1.1} fill="none" strokeLinecap="round" opacity={0.75} />
        </g>

        {/* ---- ขาหน้า + กีบสีมุก ---- */}
        <rect x={39.4} y={75} width={8.4} height={15} rx={4.2} fill="url(#ff-uni-coat)" />
        <rect x={52.2} y={75} width={8.4} height={15} rx={4.2} fill="url(#ff-uni-coat)" />
        <path d="M 39.1 85.2 h 9 v 3.4 q 0 2 -2.2 2 h -4.6 q -2.2 0 -2.2 -2 Z" fill="url(#ff-uni-hoof)" />
        <path d="M 51.9 85.2 h 9 v 3.4 q 0 2 -2.2 2 h -4.6 q -2.2 0 -2.2 -2 Z" fill="url(#ff-uni-hoof)" />
        <path d="M 41 80.6 q 2.6 1 5.2 0 M 53.8 80.6 q 2.6 1 5.2 0" stroke="#ded7f0" strokeWidth={1} fill="none" strokeLinecap="round" />
        {/* ขนข้อเท้าปุย ๆ ปิดรอยต่อกีบ */}
        <path d="M 39.2 84.6 q 2.2 1.6 4.4 0.6 q 2.4 1.4 4.4 -0.6 M 52 84.6 q 2.2 1.6 4.4 0.6 q 2.4 1.4 4.4 -0.6"
          fill="none" stroke="#f3eefc" strokeWidth={2} strokeLinecap="round" />

        {/* ---- แผงคอสายรุ้ง: ช่อผมหนาซ้อนกันเป็นชั้น โคนซ่อนใต้หัว ปลายทิ้งตัวพาดไหล่ถึงพื้น
               (วาดเป็นเส้นหนาปลายมน จะได้ความหนาสม่ำเสมอเหมือนปอยผมจริง) ---- */}
        <g className="ff-sway" fill="none" strokeLinecap="round" style={{ transformOrigin: "42px 24px", animationDuration: "5.4s" }}>
          <path d="M 43 21 C 33 25 26.5 33 24 43" stroke="#fda4af" strokeWidth={9} />
          <path d="M 41 23 C 30 29 23.5 40 22.5 53" stroke="#fde68a" strokeWidth={8.5} />
          <path d="M 40 26 C 29 33 23 46 23 62" stroke="#a7f3d0" strokeWidth={8} />
          <path d="M 39 30 C 28 38 24 52 25 72" stroke="#bae6fd" strokeWidth={7.5} />
          <path d="M 38 34 C 29 43 26.5 58 28.5 81" stroke="#ddd6fe" strokeWidth={7} />
          {/* เส้นไหลของเส้นผม — มัดช่อทั้งหมดให้เป็นแผงเดียวกัน */}
          <path d="M 39.4 24.6 C 31 29.6 25.6 38 23.6 48 M 35.6 34 C 28.4 42 25.4 54 26.4 68 M 34 40 C 28.6 48.6 27 60 28.4 76"
            stroke="#ffffff" strokeWidth={1.1} opacity={0.5} />
        </g>

        {/* ---- หัวโพนี่ ---- */}
        <path
          d="M 50 20.5 C 62 20.5 71.5 26.5 73.2 36.5 C 74.6 44.8 70.6 51.8 63.4 55.4 C 58.6 57.8 54.4 58.6 50 58.6 C 45.6 58.6 41.4 57.8 36.6 55.4 C 29.4 51.8 25.4 44.8 26.8 36.5 C 28.5 26.5 38 20.5 50 20.5 Z"
          fill="url(#ff-uni-head)"
        />
        <g clipPath="url(#ff-uni-headclip)">
          <ellipse cx={38} cy={30} rx={12} ry={6.5} fill="#ffffff" opacity={0.6} transform="rotate(-18 38 30)" />
          <ellipse cx={76} cy={50} rx={16} ry={16} fill="#a89ccf" opacity={0.2} />
        </g>

        {/* ---- หู: กระดิกทีละข้าง ---- */}
        <g className="ff-ear" style={{ transformOrigin: "36.4px 27.6px" }}>
          <path d="M 33.6 27.6 C 30.6 20.4 31.8 13.4 36.4 12.2 C 40.4 15.4 42.6 21.4 41.8 28.4 Z" fill="url(#ff-uni-head)" />
          <path d="M 35.4 25.8 C 33.8 20.8 34.6 16.6 37 15.4 C 39.4 17.8 40.6 21.6 40.2 26.4 Z" fill="#f7d3e6" />
        </g>
        <g className="ff-ear" style={{ transformOrigin: "63.6px 27.6px", animationDelay: "0.5s" }}>
          <path d="M 66.4 27.6 C 69.4 20.4 68.2 13.4 63.6 12.2 C 59.6 15.4 57.4 21.4 58.2 28.4 Z" fill="url(#ff-uni-head)" />
          <path d="M 64.6 25.8 C 66.2 20.8 65.4 16.6 63 15.4 C 60.6 17.8 59.4 21.6 59.8 26.4 Z" fill="#f7d3e6" />
        </g>

        {/* ---- ปาก-จมูก: เนินปากสั้นแบบโพนี่ รูจมูกโค้ง ปากยิ้มบาง ๆ ---- */}
        <ellipse cx={50} cy={50} rx={11.4} ry={8.2} fill="url(#ff-uni-muzzle)" />
        <ellipse cx={50} cy={53.4} rx={7.6} ry={4} fill="#f2d2e6" opacity={0.5} />
        <path d="M 45.4 48.2 q -1.4 1.2 -0.2 2.6 M 54.6 48.2 q 1.4 1.2 0.2 2.6"
          stroke="#cf90b4" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        <path d="M 46.6 54.4 Q 50 57 53.4 54.4" stroke={FRIEND_INK} strokeWidth={1.3} fill="none" strokeLinecap="round" opacity={0.75} />
        <ellipse cx={45.6} cy={45.8} rx={4.4} ry={2.4} fill="#ffffff" opacity={0.5} transform="rotate(-12 45.6 45.8)" />

        {/* ---- ปอยผมพาดขอบหัวด้านซ้าย — วาดทับหัวแล้ว แผงคอจึงดู "งอกจากหัว" ไม่ใช่แผ่นหลังหัว ---- */}
        <g className="ff-sway" fill="none" strokeLinecap="round" style={{ transformOrigin: "44px 22px", animationDuration: "5.4s" }}>
          <path d="M 45.4 20.6 C 36.4 23 30.4 29 28 37.4" stroke="#fda4af" strokeWidth={7} />
          <path d="M 43.6 21.4 C 35 26 30.4 33 28.8 41.6" stroke="#fde68a" strokeWidth={5.6} />
          <path d="M 43 23 C 35.6 27.6 31.6 34 30.4 41" stroke="#ffffff" strokeWidth={1.1} opacity={0.5} />
        </g>

        {/* ---- ผมหน้าม้าสายรุ้ง: แผ่เป็นพัดจากโคนเขาลงมาปรกหน้าผาก ---- */}
        <g className="ff-sway" fill="none" strokeLinecap="round" style={{ transformOrigin: "50px 23px", animationDuration: "6s", animationDelay: "0.6s" }}>
          <path d="M 48.6 23 C 44.6 26 41 30 38.8 34.6" stroke="#fbb6ce" strokeWidth={4.4} />
          <path d="M 50 23 C 47.6 27 46.2 31 45.6 35.2" stroke="#fcd88a" strokeWidth={4.2} />
          <path d="M 51.4 23 C 52 27 53 31 54.2 34.8" stroke="#a7f3d0" strokeWidth={4.2} />
          <path d="M 52.6 23.2 C 55.2 26.8 58 30 61.4 32.6" stroke="#bae6fd" strokeWidth={4} />
          <path d="M 48.4 25.4 C 45.4 28 43 31 41.4 34 M 52.4 25.4 C 54.6 28 57 30.2 59.6 32"
            stroke="#ffffff" strokeWidth={0.9} opacity={0.55} />
        </g>

        {/* ---- ตาม่วงประกาย ขนตายาว ---- */}
        <g className="ff-blink" style={{ transformOrigin: "39.8px 40.5px" }}>
          <ellipse cx={39.8} cy={40.5} rx={4.8} ry={5.6} fill="#2e1b3a" />
          <circle cx={39.8} cy={40.5} r={4.3} fill="url(#ff-uni-iris)" />
          <circle cx={39.9} cy={40.9} r={2.1} fill="#1b0f26" />
          <circle cx={38.3} cy={38.5} r={1.2} fill="#ffffff" />
          <circle cx={41.5} cy={42.4} r={0.5} fill="#ffffff" opacity={0.75} />
          <path d="M 34.8 37.6 Q 39.6 33.4 44.6 37.4" stroke="#2e1b3a" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M 34.6 35.2 l -2.4 -1.8 M 37.2 33.4 l -1.4 -2.4" stroke="#2e1b3a" strokeWidth={1.1} strokeLinecap="round" />
        </g>
        <g className="ff-blink" style={{ transformOrigin: "60.2px 40.5px", animationDelay: "0.15s" }}>
          <ellipse cx={60.2} cy={40.5} rx={4.8} ry={5.6} fill="#2e1b3a" />
          <circle cx={60.2} cy={40.5} r={4.3} fill="url(#ff-uni-iris)" />
          <circle cx={60.1} cy={40.9} r={2.1} fill="#1b0f26" />
          <circle cx={58.6} cy={38.5} r={1.2} fill="#ffffff" />
          <circle cx={61.8} cy={42.4} r={0.5} fill="#ffffff" opacity={0.75} />
          <path d="M 55.4 37.4 Q 60.4 33.4 65.2 37.6" stroke="#2e1b3a" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <path d="M 65.4 35.2 l 2.4 -1.8 M 62.8 33.4 l 1.4 -2.4" stroke="#2e1b3a" strokeWidth={1.1} strokeLinecap="round" />
        </g>
        <Blush cx={31.8} cy={47.4} r={4.2} color="#f9a8d4" opacity={0.45} />
        <Blush cx={68.2} cy={47.4} r={4.2} color="#f9a8d4" opacity={0.45} />

        {/* ---- เขาเกลียวทอง: วาดท้ายสุดให้ทับผมหน้าม้า ---- */}
        <ellipse cx={50} cy={26.4} rx={5} ry={1.7} fill="#f0c469" opacity={0.45} />
        <path d="M 45.4 27 C 46.4 21.4 47.8 13.4 50 4.4 C 52.2 13.4 53.6 21.4 54.6 27 Z" fill="url(#ff-uni-horn)" />
        <g stroke="#d99a35" strokeWidth={1.1} fill="none" strokeLinecap="round" opacity={0.75}>
          <path d="M 46.1 23 C 47.6 25 52 25.2 53.9 23" />
          <path d="M 46.9 18.4 C 48.2 20.2 51.8 20.4 53.1 18.4" />
          <path d="M 47.7 13.8 C 48.7 15.4 51.3 15.5 52.3 13.8" />
          <path d="M 48.5 9.4 C 49.2 10.6 50.8 10.7 51.5 9.4" />
        </g>
        <path d="M 47.7 24.4 C 48.4 17.6 49 11 49.8 6" stroke="#fff7dc" strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.7} />
        <path className="ff-twinkle" style={{ transformOrigin: "50px 4px" }} fill="#fff7dc"
          d="M 50 0.8 L 50.9 3.1 L 53.2 4 L 50.9 4.9 L 50 7.2 L 49.1 4.9 L 46.8 4 L 49.1 3.1 Z" />
      </g>

      {/* ประกายดาวระยิบระยับรอบตัว */}
      <path className="ff-twinkle" style={{ transformOrigin: "16px 34px" }} fill="#fcd34d"
        d="M 16 31.4 L 16.8 33.2 L 18.6 34 L 16.8 34.8 L 16 36.6 L 15.2 34.8 L 13.4 34 L 15.2 33.2 Z" />
      <path className="ff-twinkle" style={{ transformOrigin: "85px 26px", animationDelay: "0.6s" }} fill="#f9a8d4"
        d="M 85 23.8 L 85.7 25.3 L 87.2 26 L 85.7 26.7 L 85 28.2 L 84.3 26.7 L 82.8 26 L 84.3 25.3 Z" />
      <path className="ff-twinkle" style={{ transformOrigin: "88px 64px", animationDelay: "1.2s" }} fill="#bae6fd"
        d="M 88 62.1 L 88.6 63.4 L 89.9 64 L 88.6 64.6 L 88 65.9 L 87.4 64.6 L 86.1 64 L 87.4 63.4 Z" />
      <path className="ff-twinkle" style={{ transformOrigin: "12px 70px", animationDelay: "1.8s" }} fill="#c4b5fd"
        d="M 12 68.1 L 12.6 69.4 L 13.9 70 L 12.6 70.6 L 12 71.9 L 11.4 70.6 L 10.1 70 L 11.4 69.4 Z" />
    </g>
  );
}

/** ✨ น้องปุยร่างทองคำ — ร่างศักดิ์สิทธิ์ของน้องปุย และเป็นรางวัลใหญ่สุดของตู้กาชา
 *  ของเดิมคือ <FluffyBuddy> ทาสีทองเฉย ๆ เลยไม่ต่างจากตัวต้นฉบับ ตัวนี้จึงวาดใหม่เป็นสไปรต์ของตัวเอง:
 *  รัศมีแสงหมุนรอบตัว ออร่าทอง วงแหวนแสงลอยเหนือหัว มงกุฎประดับพลอยสามเม็ด ปีกนางฟ้าขนทอง
 *  เหรียญตราห้อยริบบิ้น และตัวขนปุยทองคำที่ลอยขึ้น-ลงเบา ๆ เหนือแอ่งแสง */
function GoldenFluffy() {
  const INK = "#6b350a";

  /** ขอบขนปุย — วงรีที่ขอบเป็นคลื่นเล็ก ๆ (สูตรเดียวกับน้องหมี) */
  const fluffy = (cx: number, cy: number, rx: number, ry: number, bumps: number, amp: number): string => {
    const step = (Math.PI * 2) / bumps;
    let d = `M ${(cx + rx).toFixed(2)} ${cy.toFixed(2)}`;
    for (let i = 0; i < bumps; i += 1) {
      const mid = (i + 0.5) * step;
      const end = (i + 1) * step;
      d += ` Q ${(cx + Math.cos(mid) * (rx + amp)).toFixed(2)} ${(cy + Math.sin(mid) * (ry + amp)).toFixed(2)} ${(cx + Math.cos(end) * rx).toFixed(2)} ${(cy + Math.sin(end) * ry).toFixed(2)}`;
    }
    return `${d} Z`;
  };

  /** ลำแสงหนึ่งซี่ของรัศมี — ซี่คู่/ซี่คี่ยาวไม่เท่ากันจะได้ไม่ดูเป็นเฟือง */
  const ray = (i: number, n: number): string => {
    const a = (i * Math.PI * 2) / n;
    const h = 0.055;
    const inner = 15;
    const outer = i % 2 ? 40 : 56;
    const p = (r: number, ang: number) => `${(50 + Math.cos(ang) * r).toFixed(2)} ${(55 + Math.sin(ang) * r).toFixed(2)}`;
    return `M ${p(inner, a - h)} L ${p(outer, a)} L ${p(inner, a + h)} Z`;
  };

  /** ประกายสี่แฉกทรงเพชร */
  const star = (cx: number, cy: number, r: number): string =>
    `M ${cx} ${cy - r} Q ${cx + r * 0.22} ${cy - r * 0.22} ${cx + r} ${cy} Q ${cx + r * 0.22} ${cy + r * 0.22} ${cx} ${cy + r} Q ${cx - r * 0.22} ${cy + r * 0.22} ${cx - r} ${cy} Q ${cx - r * 0.22} ${cy - r * 0.22} ${cx} ${cy - r} Z`;

  /** ปีก: แผ่นเดียวกวาดขึ้น ขอบหลังโป่งเป็นปลายขนห้าแฉก (X = ตัวสะท้อนซ้าย-ขวา) */
  const wingPath = (X: (n: number) => number): string =>
    `M ${X(66)} 55 C ${X(71)} 42 ${X(79)} 30 ${X(89)} 22 C ${X(91.5)} 20.2 ${X(94)} 21.4 ${X(93.6)} 24.4 ` +
    `C ${X(96.6)} 27 ${X(96.4)} 31.6 ${X(92.8)} 32.6 C ${X(95.2)} 35.6 ${X(94)} 40.4 ${X(90.4)} 41.2 ` +
    `C ${X(92)} 44.6 ${X(89.6)} 48.8 ${X(86)} 48.8 C ${X(86.8)} 52.6 ${X(83.4)} 55.8 ${X(79.6)} 55 ` +
    `C ${X(79.4)} 58.6 ${X(75.6)} 60.6 ${X(72)} 59 C ${X(69.6)} 58.4 ${X(67.4)} 57.4 ${X(66)} 55.8 Z`;
  /** ขนชั้นในที่โคนปีก — ทำให้ปีกดูซ้อนสองชั้น ไม่แบน */
  const covertPath = (X: (n: number) => number): string =>
    `M ${X(66)} 55 C ${X(70)} 46 ${X(76)} 38 ${X(83)} 32 C ${X(85)} 34.6 ${X(84.4)} 38 ${X(81.6)} 41 ` +
    `C ${X(83.4)} 43.2 ${X(81.6)} 46 ${X(78.4)} 46.8 C ${X(79.6)} 49.4 ${X(77)} 51.8 ${X(73.6)} 51.6 ` +
    `C ${X(71.4)} 53.6 ${X(68.6)} 54.8 ${X(66)} 55.8 Z`;

  const Wing = ({ dir }: { dir: 1 | -1 }) => {
    const X = (x: number) => (dir > 0 ? x : 100 - x);
    return (
      <g
        className="ff-wingbeat"
        style={{ transformOrigin: `${X(66)}px 55px`, animationDuration: "3.8s", animationDelay: dir > 0 ? "-0.5s" : "0s" }}
      >
        <path d={wingPath(X)} fill="url(#ff-gold-wing)" />
        <path d={wingPath(X)} fill="none" stroke="#d99f2e" strokeWidth={0.9} opacity={0.6} />
        <path
          d={
            `M ${X(68)} 54 C ${X(74)} 42 ${X(82)} 31 ${X(90)} 24 M ${X(68.6)} 55.6 C ${X(75)} 47 ${X(83)} 39 ${X(91)} 33 ` +
            `M ${X(69)} 57 C ${X(74)} 51 ${X(80)} 46 ${X(88.6)} 41.6 M ${X(69.6)} 58 C ${X(73.6)} 55 ${X(78)} 52 ${X(84.4)} 49.4`
          }
          stroke="#e6b556" strokeWidth={0.8} fill="none" opacity={0.5} strokeLinecap="round"
        />
        <path d={covertPath(X)} fill="#fff8e2" opacity={0.8} />
        <path d={`M ${X(67)} 54.4 C ${X(72)} 45 ${X(78)} 38 ${X(83.4)} 33.2`} stroke="#fffdf2" strokeWidth={1.8} fill="none" opacity={0.75} strokeLinecap="round" />
      </g>
    );
  };

  /** ตาทองคำ — ลูกตาโตแวว ไฮไลต์ใหญ่-เล็ก และมีประกายดาวในดวงตา */
  const eye = (cx: number, cy: number, delay: number) => (
    <g key={cx} className="ff-blink" style={{ transformOrigin: `${cx}px ${cy}px`, animationDelay: `${delay}s` }}>
      <ellipse cx={cx} cy={cy} rx={5.6} ry={6.8} fill={INK} />
      <path d={`M ${cx - 5.6} ${cy} a 5.6 6.8 0 0 1 11.2 0 z`} fill="#ffffff" opacity={0.18} />
      <circle cx={cx + 1.7} cy={cy - 2.2} r={2.3} fill="#fff" />
      <circle cx={cx - 2} cy={cy + 2.4} r={1} fill="#fff" opacity={0.85} />
      <path d={`M ${cx + 2.6} ${cy + 2.2} l 0.6 1.4 1.4 0.6 -1.4 0.6 -0.6 1.4 -0.6 -1.4 -1.4 -0.6 1.4 -0.6 Z`} fill="#fff" opacity={0.9} />
    </g>
  );

  return (
    <g>
      <defs>
        <radialGradient id="ff-gold-aura" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fff3c4" stopOpacity={0.95} />
          <stop offset="55%" stopColor="#ffe08a" stopOpacity={0.45} />
          <stop offset="100%" stopColor="#ffd166" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="ff-gold-halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fff6cf" stopOpacity={0} />
          <stop offset="78%" stopColor="#ffeaa0" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#ffd977" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="ff-gold-fur" cx="0.34" cy="0.24" r="0.95">
          <stop offset="0%" stopColor="#fffdf0" />
          <stop offset="38%" stopColor="#ffe9a4" />
          <stop offset="72%" stopColor="#f7c948" />
          <stop offset="100%" stopColor="#d68f16" />
        </radialGradient>
        <linearGradient id="ff-gold-wing" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#fffdf4" />
          <stop offset="52%" stopColor="#ffe9b4" />
          <stop offset="100%" stopColor="#e6b950" />
        </linearGradient>
        <linearGradient id="ff-gold-crown" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#fff6d2" />
          <stop offset="45%" stopColor="#fcd063" />
          <stop offset="100%" stopColor="#d9971d" />
        </linearGradient>
        <linearGradient id="ff-gold-limb" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#ffeeb4" />
          <stop offset="100%" stopColor="#e5a824" />
        </linearGradient>
        <filter id="ff-gold-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={2} />
        </filter>
      </defs>

      {/* ---- ออร่า + รัศมีแสงที่หมุนช้า ๆ ---- */}
      <circle className="ff-shimmer" cx={50} cy={55} r={48} fill="url(#ff-gold-aura)" style={{ animationDuration: "4.2s" }} />
      <g className="ff-spin" style={{ transformOrigin: "50px 55px" }}>
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d={ray(i, 14)} fill="#ffe9a8" opacity={i % 2 ? 0.45 : 0.62} />
        ))}
      </g>
      <ellipse cx={50} cy={55} rx={44} ry={44} fill="url(#ff-gold-halo)" />

      {/* แอ่งแสงที่พื้น — อยู่นิ่ง ตัวจึงดูลอยเหนือมันจริง ๆ */}
      <ellipse cx={50} cy={89} rx={26} ry={4.4} fill="#f0b429" opacity={0.22} />
      <ellipse cx={50} cy={88.8} rx={13} ry={2.4} fill="#fff0bd" opacity={0.6} />

      {/* ---- ตัวละครทั้งตัวลอยขึ้น-ลงช้า ๆ ---- */}
      <g className="ff-float" style={{ animationDuration: "4.4s" }}>
        {/* ปีกนางฟ้า (เงาฟุ้งข้างหลังให้เรืองแสง) */}
        <g filter="url(#ff-gold-soft)" opacity={0.55}>
          <Wing dir={-1} />
          <Wing dir={1} />
        </g>
        <Wing dir={-1} />
        <Wing dir={1} />

        {/* ---- อุ้งเท้าหน้าสองข้าง: โคนซ่อนหลังตัว ขยับคนละจังหวะ ---- */}
        <g className="ff-wiggle" style={{ transformOrigin: "31px 55px", animationDuration: "5.6s" }}>
          <path d="M 31 54 C 22.6 53.4 15.6 59.6 15.4 67 C 15.2 72.8 19.4 75.8 24.2 74 C 28.8 72.2 32.2 67 33 60.6 Z" fill="url(#ff-gold-limb)" />
          <path d="M 31 54 C 22.6 53.4 15.6 59.6 15.4 67 C 15.2 72.8 19.4 75.8 24.2 74" fill="none" stroke="#c8860f" strokeWidth={0.9} opacity={0.45} strokeLinecap="round" />
          <ellipse cx={19} cy={62.5} rx={4} ry={6} fill="#fff6d8" opacity={0.45} transform="rotate(-24 19 62.5)" />
          <path d="M 16.6 70.4 q -1.4 1.6 -1.2 3.4 M 20.4 73.2 q -0.8 1.8 -0.2 3.4 M 24.4 73.6 q 0.2 1.8 1.2 3" stroke="#f7dc9a" strokeWidth={1} fill="none" strokeLinecap="round" opacity={0.85} />
        </g>
        <g className="ff-wiggle" style={{ transformOrigin: "69px 55px", animationDuration: "5.6s", animationDelay: "1.7s" }}>
          <path d="M 69 54 C 77.4 53.4 84.4 59.6 84.6 67 C 84.8 72.8 80.6 75.8 75.8 74 C 71.2 72.2 67.8 67 67 60.6 Z" fill="url(#ff-gold-limb)" />
          <path d="M 69 54 C 77.4 53.4 84.4 59.6 84.6 67 C 84.8 72.8 80.6 75.8 75.8 74" fill="none" stroke="#c8860f" strokeWidth={0.9} opacity={0.45} strokeLinecap="round" />
          <ellipse cx={81} cy={62.5} rx={4} ry={6} fill="#fff6d8" opacity={0.45} transform="rotate(24 81 62.5)" />
          <path d="M 83.4 70.4 q 1.4 1.6 1.2 3.4 M 79.6 73.2 q 0.8 1.8 0.2 3.4 M 75.6 73.6 q -0.2 1.8 -1.2 3" stroke="#f7dc9a" strokeWidth={1} fill="none" strokeLinecap="round" opacity={0.85} />
        </g>

        {/* ---- ตัวขนปุยทองคำ ---- */}
        <path d={fluffy(50, 57, 29, 27, 24, 2.6)} fill="#fff2c9" opacity={0.75} />
        <path d={fluffy(50, 57, 27, 25.2, 22, 2.2)} fill="url(#ff-gold-fur)" />
        <ellipse cx={38} cy={42} rx={11} ry={7.4} fill="#fffdf0" opacity={0.6} transform="rotate(-22 38 42)" />
        <ellipse cx={72} cy={76} rx={16} ry={12} fill="#c8860f" opacity={0.18} />
        {/* ร่องเงาที่แขนซุกเข้าลำตัว */}
        <path d="M 30 55 C 27 60 26.4 66 28 71.4 M 70 55 C 73 60 73.6 66 72 71.4" stroke="#c8860f" strokeWidth={1.6} fill="none" opacity={0.22} strokeLinecap="round" />

        {/* ---- เท้าจิ๋วสองข้าง ---- */}
        <ellipse cx={39} cy={83.5} rx={8.6} ry={5} fill="url(#ff-gold-limb)" />
        <ellipse cx={61} cy={83.5} rx={8.6} ry={5} fill="url(#ff-gold-limb)" />
        <path d="M 35.6 82 q 1 2 0.2 3.6 M 39.4 82.4 q 0.4 2.2 -0.6 3.6 M 60.6 82.4 q -0.4 2.2 0.6 3.6 M 64.4 82 q -1 2 -0.2 3.6" stroke="#f7dc9a" strokeWidth={1} fill="none" strokeLinecap="round" opacity={0.8} />

        {/* ---- หน้ายิ้มกว้าง ---- */}
        {eye(40, 53, 0)}
        {eye(60, 53, 0.2)}
        <ellipse cx={30.5} cy={63} rx={5} ry={3.1} fill="#f8859f" opacity={0.5} />
        <ellipse cx={69.5} cy={63} rx={5} ry={3.1} fill="#f8859f" opacity={0.5} />
        <path d="M 42.4 63.4 C 43.6 71.6 56.4 71.6 57.6 63.4 Z" fill={INK} />
        <path d="M 46.6 68.6 C 47.8 71.4 52.2 71.4 53.4 68.6 C 51.2 69.6 48.8 69.6 46.6 68.6 Z" fill="#ff9db4" />

        {/* ---- เหรียญตราห้อยริบบิ้น ---- */}
        <path d="M 46.6 70.4 L 50 75.4 L 53.4 70.4 L 51.4 70 L 50 72.4 L 48.6 70 Z" fill="#e8607f" />
        <circle cx={50} cy={78.4} r={4.6} fill="url(#ff-gold-crown)" />
        <circle cx={50} cy={78.4} r={2.6} fill="#ff7b9c" />
        <circle cx={49.1} cy={77.5} r={0.9} fill="#fff" opacity={0.85} />
        <circle cx={50} cy={78.4} r={4.6} fill="none" stroke="#c8860f" strokeWidth={0.7} opacity={0.5} />

        {/* ---- วงแหวนแสงลอยเหนือมงกุฎ ---- */}
        <g className="ff-shimmer" style={{ animationDuration: "3.4s" }}>
          <ellipse cx={50} cy={8.4} rx={10.5} ry={2.9} fill="none" stroke="#ffe9a0" strokeWidth={2.2} opacity={0.9} />
          <ellipse cx={50} cy={8.4} rx={10.5} ry={2.9} fill="none" stroke="#fffdf0" strokeWidth={0.9} opacity={0.8} />
        </g>

        {/* ---- มงกุฎประดับพลอย ---- */}
        <path d="M 33.6 32.4 L 36.4 19.6 L 43.2 27 L 50 14.4 L 56.8 27 L 63.6 19.6 L 66.4 32.4 Z" fill="url(#ff-gold-crown)" />
        <path d="M 33.4 31.6 Q 50 36.4 66.6 31.6 L 66.6 36.6 Q 50 41.4 33.4 36.6 Z" fill="url(#ff-gold-crown)" />
        <path d="M 35.4 32.8 Q 50 37 64.6 32.8" stroke="#fff8dd" strokeWidth={0.9} fill="none" opacity={0.8} />
        <g className="ff-twinkle" style={{ transformOrigin: "50px 13px", animationDuration: "2.4s" }}>
          <circle cx={50} cy={13} r={3.2} fill="#ff7b9c" />
          <circle cx={49} cy={11.9} r={1.1} fill="#fff" opacity={0.85} />
        </g>
        <g className="ff-twinkle" style={{ transformOrigin: "36.4px 18.4px", animationDuration: "2.4s", animationDelay: "-0.8s" }}>
          <circle cx={36.4} cy={18.4} r={2.6} fill="#7fd7f0" />
          <circle cx={35.6} cy={17.6} r={0.9} fill="#fff" opacity={0.85} />
        </g>
        <g className="ff-twinkle" style={{ transformOrigin: "63.6px 18.4px", animationDuration: "2.4s", animationDelay: "-1.6s" }}>
          <circle cx={63.6} cy={18.4} r={2.6} fill="#a3f0c8" />
          <circle cx={62.8} cy={17.6} r={0.9} fill="#fff" opacity={0.85} />
        </g>
        <circle cx={50} cy={35.4} r={2.7} fill="#ff7b9c" />
        <circle cx={49.1} cy={34.5} r={0.9} fill="#fff" opacity={0.8} />
        <circle cx={41.5} cy={34.6} r={1.5} fill="#7fd7f0" />
        <circle cx={58.5} cy={34.6} r={1.5} fill="#a3f0c8" />
      </g>

      {/* ---- ประกายรอบตัว ---- */}
      <path className="ff-twinkle" style={{ transformOrigin: "16px 30px" }} d={star(16, 30, 4.6)} fill="#fff0b0" />
      <path className="ff-twinkle" style={{ transformOrigin: "84px 34px", animationDelay: "-0.6s" }} d={star(84, 34, 3.8)} fill="#fff0b0" />
      <path className="ff-twinkle" style={{ transformOrigin: "22px 72px", animationDelay: "-1.2s" }} d={star(22, 72, 3.2)} fill="#ffe6f0" />
      <path className="ff-twinkle" style={{ transformOrigin: "80px 66px", animationDelay: "-1.8s" }} d={star(80, 66, 2.6)} fill="#e0f7ff" />
      <path className="ff-twinkle" style={{ transformOrigin: "50px 4.6px", animationDelay: "-0.9s" }} d={star(50, 4.6, 2.6)} fill="#fffbe6" />
      <path className="ff-twinkle" style={{ transformOrigin: "12px 52px", animationDelay: "-1.5s" }} d={star(12, 52, 2.2)} fill="#fff0b0" opacity={0.8} />
      <path className="ff-twinkle" style={{ transformOrigin: "90px 52px", animationDelay: "-0.3s" }} d={star(90, 52, 2.2)} fill="#fff0b0" opacity={0.8} />
    </g>
  );
}

const SPRITES: Record<string, () => ReactNode> = {
  bear: Bear,
  rabbit: Rabbit,
  cat: Cat,
  dog: Dog,
  sloth: Sloth,
  owl: Owl,
  cloud: Cloud,
  star: Star,
  sprout: Sprout,
  fox: Fox,
  butterfly: Butterfly,
  whale: Whale,
  dragon: Dragon,
  unicorn: Unicorn,
  "golden-fluffy": GoldenFluffy,
};

/* ---------- exported renderer ---------- */

export function FriendSprite({
  id,
  size = 80,
  className,
  style,
  fallback,
}: {
  id: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
  /** Emoji fallback for ids that have no sprite (yet). */
  fallback?: string;
}) {
  const Sprite = SPRITES[id];
  if (!Sprite) {
    return (
      <span aria-hidden="true" style={{ fontSize: size * 0.62, lineHeight: 1, ...style }} className={className}>
        {fallback ?? "❔"}
      </span>
    );
  }
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={["ffs", className ?? ""].filter(Boolean).join(" ")}
      style={style}
      aria-hidden="true"
    >
      <style>{SPRITE_CSS}</style>
      <g className="ff-breathe">
        <Sprite />
      </g>
    </svg>
  );
}

export const SPRITE_IDS = Object.keys(SPRITES);

export default FriendSprite;
