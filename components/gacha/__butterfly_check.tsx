"use client";
import { GEye, Blush, Smile, FRIEND_INK } from "./FriendSprite";

/** 🦋 น้องผีเสื้อนักเดินทาง — ผีเสื้อตุ๊กตาขนปุย: ตัวกลมนุ่มขอบขนฟู ปีกโปร่งซ้อนสามชั้น
 *  มีลายตาปีก เกล็ดระยิบ และกระพือแบบมีน้ำหนัก (ปีกล่างตามหลังปีกบนครึ่งจังหวะ) */
export function Butterfly() {
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
