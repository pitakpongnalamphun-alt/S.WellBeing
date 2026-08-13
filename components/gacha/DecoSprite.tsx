"use client";

import type { ReactNode } from "react";

/**
 * ของตกแต่งทั้ง 13 ชิ้น วาดมือเป็น SVG — สไตล์เดียวกับเพื่อนปุยใน FriendSprite
 *
 * ก่อนหน้านี้ของตกแต่งเป็นอีโมจิวางทับตัวละคร ซึ่งเป็นคนละภาษาภาพกันคนละเรื่อง:
 * มังกรที่วาดเองมีหมวก 🎩 ของระบบปฏิบัติการลอยอยู่บนหัว และหน้าตาก็เปลี่ยนไปตาม
 * เครื่องที่เปิด (iOS/Android/Windows วาดอีโมจิไม่เหมือนกันเลย)
 *
 * ทุกชิ้นวาดในกรอบ 0–100 โดยจัดให้อยู่กลางกรอบ ตำแหน่งจริงบนตัวละครมาจาก
 * FRIEND_ANCHORS ใน data/fluffyFriends.ts
 */

const PIECES: Record<string, ReactNode> = {
  "hat-knit": (
    <>
      <path d="M22,62 Q22,26 50,26 Q78,26 78,62 Z" fill="#f7b3c8"/>
      <path d="M32,62 Q32,30 50,30 Q68,30 68,62" fill="none" stroke="#e58aa9" strokeWidth="2.5"/>
      <path d="M50,26 Q50,60 50,62" fill="none" stroke="#e58aa9" strokeWidth="2.5"/>
      <rect x="16" y="58" width="68" height="14" rx="7" fill="#fdd9e5"/>
      <circle cx="50" cy="20" r="9" fill="#fdd9e5"/>
      <circle cx="46" cy="17" r="3" fill="#fff" opacity="0.7"/>
    </>
  ),
  "hat-straw": (
    <>
      <ellipse cx="50" cy="62" rx="42" ry="13" fill="#f3d79a"/>
      <ellipse cx="50" cy="60" rx="42" ry="12" fill="#f8e3b6"/>
      <path d="M27,58 Q27,24 50,24 Q73,24 73,58 Z" fill="#f3d79a"/>
      <path d="M27,50 Q50,58 73,50" fill="none" stroke="#e0bd77" strokeWidth="2"/>
      <path d="M28,44 Q50,52 72,44" fill="none" stroke="#e0bd77" strokeWidth="2"/>
      <path d="M26,54 Q50,46 74,54 L74,58 Q50,50 26,58 Z" fill="#f6a8bd"/>
    </>
  ),
  "hat-flower": (
    <>
      <path d="M14,58 Q50,40 86,58" fill="none" stroke="#9ed9a4" strokeWidth="6" strokeLinecap="round"/>
      <g transform="translate(22 56)">
            <ellipse cx="0" cy="-6" rx="4.2" ry="6" fill="#f9a8d4" transform="rotate(0)"/><ellipse cx="0" cy="-6" rx="4.2" ry="6" fill="#f9a8d4" transform="rotate(72)"/><ellipse cx="0" cy="-6" rx="4.2" ry="6" fill="#f9a8d4" transform="rotate(144)"/><ellipse cx="0" cy="-6" rx="4.2" ry="6" fill="#f9a8d4" transform="rotate(216)"/><ellipse cx="0" cy="-6" rx="4.2" ry="6" fill="#f9a8d4" transform="rotate(288)"/>
            <circle cx="0" cy="0" r="3.2" fill="#fde68a"/>
          </g><g transform="translate(36 48)">
            <ellipse cx="0" cy="-6" rx="4.2" ry="6" fill="#fcd5e5" transform="rotate(0)"/><ellipse cx="0" cy="-6" rx="4.2" ry="6" fill="#fcd5e5" transform="rotate(72)"/><ellipse cx="0" cy="-6" rx="4.2" ry="6" fill="#fcd5e5" transform="rotate(144)"/><ellipse cx="0" cy="-6" rx="4.2" ry="6" fill="#fcd5e5" transform="rotate(216)"/><ellipse cx="0" cy="-6" rx="4.2" ry="6" fill="#fcd5e5" transform="rotate(288)"/>
            <circle cx="0" cy="0" r="3.2" fill="#fde68a"/>
          </g><g transform="translate(50 44)">
            <ellipse cx="0" cy="-6" rx="4.2" ry="6" fill="#f7c8e0" transform="rotate(0)"/><ellipse cx="0" cy="-6" rx="4.2" ry="6" fill="#f7c8e0" transform="rotate(72)"/><ellipse cx="0" cy="-6" rx="4.2" ry="6" fill="#f7c8e0" transform="rotate(144)"/><ellipse cx="0" cy="-6" rx="4.2" ry="6" fill="#f7c8e0" transform="rotate(216)"/><ellipse cx="0" cy="-6" rx="4.2" ry="6" fill="#f7c8e0" transform="rotate(288)"/>
            <circle cx="0" cy="0" r="3.2" fill="#fde68a"/>
          </g><g transform="translate(64 48)">
            <ellipse cx="0" cy="-6" rx="4.2" ry="6" fill="#fbb6ce" transform="rotate(0)"/><ellipse cx="0" cy="-6" rx="4.2" ry="6" fill="#fbb6ce" transform="rotate(72)"/><ellipse cx="0" cy="-6" rx="4.2" ry="6" fill="#fbb6ce" transform="rotate(144)"/><ellipse cx="0" cy="-6" rx="4.2" ry="6" fill="#fbb6ce" transform="rotate(216)"/><ellipse cx="0" cy="-6" rx="4.2" ry="6" fill="#fbb6ce" transform="rotate(288)"/>
            <circle cx="0" cy="0" r="3.2" fill="#fde68a"/>
          </g><g transform="translate(78 56)">
            <ellipse cx="0" cy="-6" rx="4.2" ry="6" fill="#f9a8d4" transform="rotate(0)"/><ellipse cx="0" cy="-6" rx="4.2" ry="6" fill="#f9a8d4" transform="rotate(72)"/><ellipse cx="0" cy="-6" rx="4.2" ry="6" fill="#f9a8d4" transform="rotate(144)"/><ellipse cx="0" cy="-6" rx="4.2" ry="6" fill="#f9a8d4" transform="rotate(216)"/><ellipse cx="0" cy="-6" rx="4.2" ry="6" fill="#f9a8d4" transform="rotate(288)"/>
            <circle cx="0" cy="0" r="3.2" fill="#fde68a"/>
          </g>
    </>
  ),
  "hat-detective": (
    <>
      <ellipse cx="50" cy="58" rx="40" ry="11" fill="#b08f6e"/>
      <path d="M28,56 Q28,22 50,22 Q72,22 72,56 Z" fill="#c9a67f"/>
      <path d="M28,56 Q50,64 72,56" fill="none" stroke="#a1815f" strokeWidth="2.5"/>
      <path d="M40,24 L44,56 M56,24 L60,56" stroke="#a1815f" strokeWidth="2" fill="none"/>
      <path d="M10,58 Q28,50 34,58 Q28,66 10,58 Z" fill="#b08f6e"/>
      <path d="M90,58 Q72,50 66,58 Q72,66 90,58 Z" fill="#b08f6e"/>
    </>
  ),
  "hat-octopus": (
    <>
      <path d="M26,54 Q26,26 50,26 Q74,26 74,54 Z" fill="#c4a3f5"/>
      <ellipse cx="50" cy="54" rx="24" ry="8" fill="#b18ff0"/>
      <path d="M30,58 q5,9 2,15" fill="none" stroke="#c4a3f5" strokeWidth="5" strokeLinecap="round"/><path d="M40,60 q-5,9 -2,15" fill="none" stroke="#c4a3f5" strokeWidth="5" strokeLinecap="round"/><path d="M50,61 q5,9 2,15" fill="none" stroke="#c4a3f5" strokeWidth="5" strokeLinecap="round"/><path d="M60,60 q-5,9 -2,15" fill="none" stroke="#c4a3f5" strokeWidth="5" strokeLinecap="round"/><path d="M70,58 q5,9 2,15" fill="none" stroke="#c4a3f5" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="42" cy="42" r="4" fill="#4a3546"/>
      <circle cx="58" cy="42" r="4" fill="#4a3546"/>
      <circle cx="43.4" cy="40.6" r="1.5" fill="#fff"/>
      <circle cx="59.4" cy="40.6" r="1.5" fill="#fff"/>
      <path d="M46,50 q4,4 8,0" fill="none" stroke="#4a3546" strokeWidth="2" strokeLinecap="round"/>
    </>
  ),
  "face-round": (
    <>
      <path d="M18,50 L30,50 M70,50 L82,50" stroke="#4a3546" strokeWidth="3" strokeLinecap="round"/>
      <path d="M42,50 q8,-5 16,0" fill="none" stroke="#4a3546" strokeWidth="3"/>
      <circle cx="32" cy="50" r="13" fill="#dbeafe" opacity="0.55" stroke="#4a3546" strokeWidth="3.4"/>
      <circle cx="68" cy="50" r="13" fill="#dbeafe" opacity="0.55" stroke="#4a3546" strokeWidth="3.4"/>
      <path d="M25,44 q5,-4 10,-1" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"/>
    </>
  ),
  "face-shades": (
    <>
      <path d="M16,44 L30,42 M84,44 L70,42" stroke="#4a3546" strokeWidth="3.4" strokeLinecap="round"/>
      <path d="M44,46 q6,-4 12,0" fill="none" stroke="#4a3546" strokeWidth="3.4"/>
      <path d="M22,42 L46,42 Q46,60 34,60 Q22,60 22,42 Z" fill="#3b3550"/>
      <path d="M78,42 L54,42 Q54,60 66,60 Q78,60 78,42 Z" fill="#3b3550"/>
      <path d="M26,46 l7,0 -9,9 z" fill="#fff" opacity="0.45"/>
      <path d="M58,46 l7,0 -9,9 z" fill="#fff" opacity="0.45"/>
    </>
  ),
  "face-plaster": (
    <>
      <g transform="rotate(-18 50 50)">
        <rect x="22" y="41" width="56" height="18" rx="9" fill="#fde4d0"/>
        <rect x="40" y="41" width="20" height="18" fill="#fbd0b4"/>
        <circle cx="45" cy="46" r="1.6" fill="#f3b894"/><circle cx="55" cy="46" r="1.6" fill="#f3b894"/><circle cx="45" cy="54" r="1.6" fill="#f3b894"/><circle cx="55" cy="54" r="1.6" fill="#f3b894"/>
      </g>
    </>
  ),
  "face-sparkle": (
    <>
      <path d="M30,31 Q32.86,41.14 43,44 Q32.86,46.86 30,57 Q27.14,46.86 17,44 Q27.14,41.14 30,31 Z" fill="#ffd98a"/><path d="M70,42 Q72.2,49.8 80,52 Q72.2,54.2 70,62 Q67.8,54.2 60,52 Q67.8,49.8 70,42 Z" fill="#ffd98a"/><path d="M52,22 Q53.76,28.24 60,30 Q53.76,31.76 52,38 Q50.24,31.76 44,30 Q50.24,28.24 52,22 Z" fill="#ffd98a"/>
      <circle cx="44" cy="62" r="3" fill="#fff3c4"/>
    </>
  ),
  "hold-cocoa": (
    <>
      <path d="M74,40 q12,0 12,10 q0,10 -12,10" fill="none" stroke="#e6e0f0" strokeWidth="5"/>
      <path d="M24,36 h52 v26 q0,10 -12,10 h-28 q-12,0 -12,-10 z" fill="#fff8fb"/>
      <path d="M24,36 h52 v8 h-52 z" fill="#f3e7ef"/>
      <ellipse cx="50" cy="38" rx="24" ry="6" fill="#a9744e"/>
      <ellipse cx="50" cy="37" rx="20" ry="4.6" fill="#f7ede6"/>
      <path d="M40,22 q4,-6 0,-12 M50,20 q4,-7 0,-13 M60,22 q4,-6 0,-12" fill="none" stroke="#e3d6e6" strokeWidth="2.6" strokeLinecap="round"/>
    </>
  ),
  "hold-teddy": (
    <>
      <circle cx="30" cy="30" r="9" fill="#d9b18a"/>
      <circle cx="70" cy="30" r="9" fill="#d9b18a"/>
      <circle cx="30" cy="30" r="4.5" fill="#f0d3bb"/>
      <circle cx="70" cy="30" r="4.5" fill="#f0d3bb"/>
      <ellipse cx="50" cy="46" rx="27" ry="24" fill="#e3c09a"/>
      <ellipse cx="50" cy="76" rx="22" ry="18" fill="#d9b18a"/>
      <ellipse cx="50" cy="78" rx="13" ry="11" fill="#f0d3bb"/>
      <ellipse cx="50" cy="52" rx="12" ry="9" fill="#f5e0cb"/>
      <ellipse cx="50" cy="47" rx="4" ry="3" fill="#4a3546"/>
      <circle cx="40" cy="40" r="3.4" fill="#4a3546"/>
      <circle cx="60" cy="40" r="3.4" fill="#4a3546"/>
      <path d="M46,54 q4,4 8,0" fill="none" stroke="#4a3546" strokeWidth="2" strokeLinecap="round"/>
    </>
  ),
  "hold-umbrella": (
    <>
      <path d="M50,20 Q16,26 12,54 L88,54 Q84,26 50,20 Z" fill="#cfeaf7" opacity="0.85"/>
      <path d="M50,20 Q34,26 31,54 M50,20 Q66,26 69,54" fill="none" stroke="#8fc6e0" strokeWidth="2"/>
      <path d="M12,54 q10,8 19,0 q10,8 19,0 q10,8 19,0 q10,8 19,0" fill="none" stroke="#8fc6e0" strokeWidth="2.4"/>
      <path d="M50,20 v54 q0,10 -10,10 q-8,0 -8,-7" fill="none" stroke="#b48fd9" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="50" cy="17" r="3.4" fill="#b48fd9"/>
    </>
  ),
  "hold-diary": (
    <>
      <path d="M22,24 h48 q10,0 10,10 v44 q0,10 -10,10 h-48 z" fill="#f6a8bd"/>
      <path d="M22,24 h10 v64 h-10 z" fill="#e58aa9"/>
      <rect x="36" y="30" width="38" height="52" rx="4" fill="#fff8fb"/>
      <path d="M42,40 h26" stroke="#f0c8d8" strokeWidth="2.6" strokeLinecap="round"/><path d="M42,50 h26" stroke="#f0c8d8" strokeWidth="2.6" strokeLinecap="round"/><path d="M42,60 h26" stroke="#f0c8d8" strokeWidth="2.6" strokeLinecap="round"/><path d="M42,70 h26" stroke="#f0c8d8" strokeWidth="2.6" strokeLinecap="round"/>
      <path d="M64,20 v22 l-6,-5 -6,5 v-22 z" fill="#fde68a"/>
      <circle cx="76" cy="56" r="5" fill="#fde68a"/>
    </>
  ),
};

export function DecoSprite({
  id,
  size,
  fallback,
}: {
  id: string;
  size: number;
  /** อีโมจิสำรอง เผื่อมีของตกแต่งใหม่ที่ยังไม่ได้วาด */
  fallback?: string;
}) {
  const piece = PIECES[id];
  if (!piece) {
    return (
      <span style={{ fontSize: size * 0.8, lineHeight: 1 }} aria-hidden="true">
        {fallback ?? ""}
      </span>
    );
  }
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ display: "block", overflow: "visible" }}
    >
      {piece}
    </svg>
  );
}

export default DecoSprite;
