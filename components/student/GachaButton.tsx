"use client";

import Link from "next/link";

/**
 * ปุ่มตู้กาชาปองจิ๋วข้างเหรียญ — ทางลัดน่ารัก ๆ ไปหน้าสุ่มเพื่อนปุย (/rewards)
 *
 * วาดเป็น SVG ตามตู้จริงในหน้ารางวัล: โดมแก้วใส แคปซูลพาสเทล ฐานชมพู ช่องจ่ายของ
 * ตู้จะดุ๊กดิ๊กเบา ๆ เป็นระยะเหมือนชวนให้มากด (ปิดอัตโนมัติเมื่อตั้งค่า reduced motion)
 */

const CSS = `
@keyframes gb-jiggle {
  0%, 86%, 100% { transform: rotate(0deg); }
  89% { transform: rotate(-9deg); }
  92% { transform: rotate(7deg); }
  95% { transform: rotate(-4deg); }
  98% { transform: rotate(2deg); }
}
.gb-machine {
  animation: gb-jiggle 4.6s ease-in-out infinite;
  transform-origin: 50% 92%;
}
@media (prefers-reduced-motion: reduce) {
  .gb-machine { animation: none; }
}
`;

export function GachaButton() {
  return (
    <Link
      href="/rewards"
      title="ตู้กาชาปองเพื่อนปุย — ไปสุ่มตัวละคร"
      className="group flex size-9 shrink-0 items-center justify-center rounded-full bg-pink-50 ring-1 ring-pink-200 transition hover:-translate-y-0.5 hover:bg-pink-100 hover:shadow-md active:translate-y-0 active:scale-95"
    >
      <style>{CSS}</style>
      <svg viewBox="0 0 24 24" className="gb-machine size-6" aria-hidden="true">
        {/* โดมแก้ว */}
        <circle cx={12} cy={9.5} r={7.2} fill="#ffffff" stroke="#f9a8d4" strokeWidth={1.1} />
        {/* แคปซูลพาสเทลในโดม */}
        <circle cx={9} cy={7.6} r={2.1} fill="#fde68a" />
        <circle cx={14.8} cy={8.2} r={2.1} fill="#c4b5fd" />
        <circle cx={11.6} cy={11} r={2.1} fill="#93c5fd" />
        <circle cx={15.4} cy={11.6} r={1.7} fill="#f9a8d4" />
        {/* แสงสะท้อนบนโดม */}
        <path d="M 7.2 6.2 Q 9 4.2 11.4 4.1" fill="none" stroke="#fce7f3" strokeWidth={1.2} strokeLinecap="round" />
        {/* ฐานตู้สีชมพู */}
        <path
          d="M 5.6 13.5 h 12.8 q 1.4 0 1.4 1.4 v 4.7 q 0 1.4 -1.4 1.4 H 5.6 q -1.4 0 -1.4 -1.4 v -4.7 q 0 -1.4 1.4 -1.4 Z"
          fill="#f472b6"
        />
        <path d="M 5.6 13.5 h 12.8 q 1.4 0 1.4 1.4 v 0.7 H 4.2 v -0.7 q 0 -1.4 1.4 -1.4 Z" fill="#f9a8d4" />
        {/* ช่องจ่ายแคปซูล + ลูกบิด */}
        <circle cx={12} cy={17.6} r={1.9} fill="#ffffff" />
        <circle cx={12} cy={17.6} r={0.8} fill="#fbcfe8" />
        <rect x={16.2} y={16.8} width={2.2} height={1.6} rx={0.8} fill="#fbcfe8" />
      </svg>
      <span className="sr-only">ตู้กาชาปองเพื่อนปุย — ไปสุ่มตัวละคร</span>
    </Link>
  );
}

export default GachaButton;
