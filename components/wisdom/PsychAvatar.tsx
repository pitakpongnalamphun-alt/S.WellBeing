import type { AvatarSpec } from "@/data/wisdom";

/**
 * ภาพเหมือนวาดมือของนักจิตวิทยาแต่ละคน
 *
 * ขอบเขตที่ตั้งใจไม่ข้าม: นี่คือ *ภาพวาด* ไม่ใช่ภาพถ่าย และไม่ได้พยายามให้เหมือน
 * ใบหน้าจริงของใคร คนในสำรับนี้เป็นบุคคลจริง หนึ่งในนั้น (บรีเน บราวน์) ยังมีชีวิตอยู่
 * การวาดให้ "ดูเหมือนรูปถ่ายของเขา" จะกลายเป็นการสร้างภาพปลอมของคนจริง
 * สิ่งที่เพิ่มความสมจริงในที่นี้จึงเป็นความเป็นภาพเหมือน — โครงหน้า แสงเงา ดวงตา
 * ที่มีชั้น ปกเสื้อ ร่องรอยของวัย — ไม่ใช่การไล่ให้ตรงกับหน้าตาจริงของบุคคล
 *
 * ของเดิมเป็นวงกลมสีเนื้อ ตาสองจุด และเส้นโค้งเป็นปาก ไม่มีจมูก ไม่มีคอ ไม่มีแสงเงา
 * ทั้งแปดคนจึงอ่านเป็นตัวการ์ตูนหน้าเหมือนกันหมด ต่างกันแค่ทรงผม
 *
 * ข้อจำกัดที่คุมการวาด: ภาพนี้ถูกย่อเหลือ 28px บนแถบหน้าแรก รายละเอียดที่เล็กกว่า
 * เส้นหนา 1.2 หน่วย (บนกรอบ 100 หน่วย) จะเละจนกลายเป็นรอยเปื้อน ทุกเส้นในไฟล์นี้
 * จึงหนาพอที่จะยังอ่านออกตอนย่อ และรายละเอียดที่ต้องเล็กกว่านั้นถูกตัดทิ้งไปแล้ว
 */

/** โทนเงาบนผิว — คงที่ทั้งชุด เพราะทั้งแปดคนเป็นชาวยุโรป/อเมริกันผิวขาวตามจริง */
const SHADOW = "#e2b189";
const DEEP = "#d09a71";
const LINE = "#9a6a4c";

/**
 * โครงหน้าสี่แบบ — ตัวแยกที่ทรงพลังที่สุด เพราะสายตาจับรูปหน้าได้ก่อนจับทรงผมเสมอ
 * และเป็นสิ่งที่ยังอ่านออกตอนย่อเหลือ 28px ต่างจากรายละเอียดเล็ก ๆ บนใบหน้า
 */
const FACE: Record<NonNullable<AvatarSpec["face"]>, string> = {
  oval: "M31 44 Q31 26 50 26 Q69 26 69 44 Q69 57 65 64 Q59 73 50 73 Q41 73 35 64 Q31 57 31 44 Z",
  round: "M29 45 Q29 25 50 25 Q71 25 71 45 Q71 59 66 66 Q59 74 50 74 Q41 74 34 66 Q29 59 29 45 Z",
  long: "M33 43 Q33 25 50 25 Q67 25 67 43 Q67 61 63 68 Q58 76 50 76 Q42 76 37 68 Q33 61 33 43 Z",
  square: "M31 43 Q31 25 50 25 Q69 25 69 43 Q69 61 67 67 Q63 72 50 72 Q37 72 33 67 Q31 61 31 43 Z",
};

export function PsychAvatar({ spec, size = 88 }: { spec: AvatarSpec; size?: number }) {
  const {
    skin, hair, hairStyle, beard, glasses,
    age = "senior", collar = "suit", face = "oval", bowtie = false,
    outfit = "#4a5560", hat,
  } = spec;
  const eyeY = 48;
  const senior = age === "senior";

  // id ต้องไม่ชนกันเมื่อมีหลายภาพในหน้าเดียว — ผูกกับลักษณะเฉพาะของสเปก
  const uid = `${face}-${hairStyle}-${beard ?? "n"}-${glasses ?? "n"}-${collar}-${bowtie ? "b" : "x"}-${hat ?? "n"}-${hair.slice(1)}-${outfit.slice(1)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <clipPath id={`c-${uid}`}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
        {/* ไล่สีพื้นหลังอ่อน ๆ ให้หัวไม่ลอยอยู่บนพื้นเรียบ */}
        <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#efe9df" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="50" fill={`url(#bg-${uid})`} />

      <g clipPath={`url(#c-${uid})`}>
        {/* ---------------------------------------------------- คอและไหล่ */}
        <path d="M42 68 L42 79 Q50 84 58 79 L58 68 Z" fill={skin} />
        {/* เงาใต้คาง — ตัวที่ทำให้หัวมีปริมาตร ไม่ใช่แผ่นแบน */}
        <path d="M42 68 L42 74 Q50 80 58 74 L58 68 Z" fill={DEEP} opacity="0.55" />

        {/* เสื้อ — สองทรงตามยุคของแต่ละคน */}
        {collar === "suit" ? (
          <>
            <path d="M20 100 Q22 84 38 78 L50 88 L62 78 Q78 84 80 100 Z" fill={outfit} />
            <path d="M38 78 L50 88 L45 100 L33 100 Z" fill="#f2efe8" />
            <path d="M62 78 L50 88 L55 100 L67 100 Z" fill="#f2efe8" />
            <path d="M38 78 L50 88 L41 92 Z" fill="#000" fillOpacity="0.2" />
            <path d="M62 78 L50 88 L59 92 Z" fill="#000" fillOpacity="0.2" />
            {/* หูกระต่าย — เครื่องหมายประจำตัวที่คนจำได้ก่อนจำหน้า */}
            {bowtie && (
              <>
                <path d="M50 88 L41 84 L41 93 Z" fill="#9d3b3b" />
                <path d="M50 88 L59 84 L59 93 Z" fill="#9d3b3b" />
                <rect x="47.6" y="85.6" width="4.8" height="4.8" rx="1.4" fill="#7f2f2f" />
              </>
            )}
          </>
        ) : (
          <>
            <path d="M21 100 Q24 84 39 78 Q44 86 50 86 Q56 86 61 78 Q76 84 79 100 Z" fill={outfit} />
            <path d="M39 78 Q44 86 50 86 Q56 86 61 78 Q56 89 50 89 Q44 89 39 78 Z" fill="#000" fillOpacity="0.16" />
          </>
        )}

        {/* -------------------------------------------------------- ใบหู */}
        <ellipse cx="29.5" cy="50" rx="4" ry="5.5" fill={skin} />
        <ellipse cx="70.5" cy="50" rx="4" ry="5.5" fill={skin} />
        <path d="M29 48 Q31 50 29.5 52.5" fill="none" stroke={LINE} strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
        <path d="M71 48 Q69 50 70.5 52.5" fill="none" stroke={LINE} strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />

        {/* ------------------------------------------------------ โครงหน้า
            ไม่ใช่วงรี — หน้าผากกว้าง แก้มสอบเข้า คางมน คือสิ่งที่ทำให้อ่านเป็นคน */}
        <path d={FACE[face]} fill={skin} />
        {/* เงาข้างแก้มซ้าย-ขวา ให้หน้ามีความหนา */}
        <path d="M31 44 Q31 57 35 64 Q38 68 41 70 Q34 66 33 55 Q32 48 33 42 Z" fill={SHADOW} opacity="0.75" />
        <path d="M69 44 Q69 57 65 64 Q62 68 59 70 Q66 66 67 55 Q68 48 67 42 Z" fill={SHADOW} opacity="0.75" />

        {/* -------------------------------------------------------- เครา */}
        {beard === "full" && (
          <>
            <path d="M33 50 Q33 70 41 77 Q50 82 59 77 Q67 70 67 50 Q64 63 50 64.5 Q36 63 33 50 Z" fill={hair} />
            <path d="M38 57 Q40 69 50 73 Q60 69 62 57 Q56 65 50 65 Q44 65 38 57 Z" fill="#000" opacity="0.08" />
            {/* ช่องริมฝีปาก — เคราที่ปิดปากสนิททำให้ทั้งหน้าเหลือแต่ก้อนขน
                และคนดูจะบอกไม่ได้ว่าคนในรูปกำลังยิ้มอยู่หรือเปล่า */}
            <ellipse cx="50" cy="66" rx="6.4" ry="3.4" fill={skin} />
            <ellipse cx="50" cy="67.4" rx="5.2" ry="2" fill={SHADOW} opacity="0.45" />
          </>
        )}

        {beard === "goatee" && (
          <path d="M44 63 Q44 75 50 78 Q56 75 56 63 Q53 67 50 67 Q47 67 44 63 Z" fill={hair} />
        )}

        {/* --------------------------------------------------------- ผม
            สองชั้นเสมอ: ชั้นล่างเข้มเป็นเงา ชั้นบนสว่างเป็นแสงตกกระทบ */}
        {hairStyle === "full" && (
          <>
            <path d="M30 48 Q27 24 50 22 Q73 24 70 48 Q68 31 50 30 Q32 31 30 48 Z" fill={hair} />
            <path d="M34 40 Q38 29 50 28 Q62 29 66 40 Q60 33 50 33 Q40 33 34 40 Z" fill="#fff" opacity="0.22" />
          </>
        )}
        {hairStyle === "sides" && (
          <>
            <path d="M30 44 Q29 31 36 27 Q33 40 34.5 55 Q30 51 30 44 Z" fill={hair} />
            <path d="M70 44 Q71 31 64 27 Q67 40 65.5 55 Q70 51 70 44 Z" fill={hair} />
            {/* ปอยบาง ๆ บนกลางศีรษะ — หัวล้านสนิทอ่านเป็นหมวก */}
            <path d="M37 30 Q50 25 63 30 Q50 28 37 30 Z" fill={hair} opacity="0.6" />
          </>
        )}
        {hairStyle === "receding" && (
          <>
            <path d="M31 45 Q30 30 41 27 Q43 34 50 34 Q57 34 59 27 Q70 30 69 45 Q67 34 50 36 Q33 34 31 45 Z" fill={hair} />
            <path d="M35 36 Q40 30 44 30 Q40 33 37 40 Z" fill="#fff" opacity="0.2" />
          </>
        )}
        {hairStyle === "swept" && (
          <>
            <path d="M29 47 Q28 25 50 23 Q72 25 71 47 Q69 33 56 31 Q40 30 33 40 Q31 44 29 47 Z" fill={hair} />
            <path d="M34 38 Q42 30 56 31 Q46 32 38 42 Z" fill="#fff" opacity="0.24" />
          </>
        )}
        {hairStyle === "wild" && (
          <>
            <path d="M28 48 Q22 30 32 22 Q34 30 38 27 Q40 20 48 24 Q52 18 58 25 Q64 20 66 28 Q72 24 72 34 Q78 32 72 48 Q68 32 50 31 Q32 32 28 48 Z" fill={hair} />
            <path d="M36 36 Q44 28 56 30 Q46 31 39 40 Z" fill="#fff" opacity="0.2" />
          </>
        )}
        {hairStyle === "long" && (
          <>
            <path d="M27 46 Q27 21 50 21 Q73 21 73 46 Q75 76 67 86 Q71 50 59 33 Q54 29 50 29 Q46 29 41 33 Q29 50 33 86 Q25 76 27 46 Z" fill={hair} />
            <path d="M35 33 Q43 25 50 25 Q44 30 39 40 Z" fill="#fff" opacity="0.22" />
          </>
        )}
        {hairStyle === "bob" && (
          <>
            <path d="M28 46 Q28 21 50 21 Q72 21 72 46 Q73 68 65 74 Q69 46 59 33 Q54 29 50 29 Q46 29 41 33 Q31 46 35 74 Q27 68 28 46 Z" fill={hair} />
            <path d="M36 34 Q43 26 50 26 Q45 30 40 40 Z" fill="#fff" opacity="0.24" />
          </>
        )}

        {/* ------------------------------------------------------- คิ้ว */}
        <path
          d={`M37.5 ${eyeY - 6} Q42 ${eyeY - 8.4} 46.5 ${eyeY - 6.2}`}
          fill="none" stroke={hair} strokeWidth="2.2" strokeLinecap="round"
        />
        <path
          d={`M53.5 ${eyeY - 6.2} Q58 ${eyeY - 8.4} 62.5 ${eyeY - 6}`}
          fill="none" stroke={hair} strokeWidth="2.2" strokeLinecap="round"
        />

        {/* -------------------------------------------------------- ตา
            เบ้าตา → ตาขาว → ม่านตา → รูม่านตา → ประกายแสง
            ชั้นพวกนี้คือความต่างที่ใหญ่ที่สุดระหว่าง "จุดสองจุด" กับ "สายตาที่มองอยู่" */}
        <g>
          <ellipse cx="42" cy={eyeY} rx="5" ry="3.4" fill="#fdf7f2" />
          <ellipse cx="58" cy={eyeY} rx="5" ry="3.4" fill="#fdf7f2" />
          <circle cx="42.4" cy={eyeY} r="2.5" fill="#6b4a33" />
          <circle cx="58.4" cy={eyeY} r="2.5" fill="#6b4a33" />
          <circle cx="42.4" cy={eyeY} r="1.2" fill="#241a14" />
          <circle cx="58.4" cy={eyeY} r="1.2" fill="#241a14" />
          <circle cx="41.3" cy={eyeY - 1.1} r="0.75" fill="#ffffff" />
          <circle cx="57.3" cy={eyeY - 1.1} r="0.75" fill="#ffffff" />
          {/* เปลือกตาบน — เส้นหนากว่าขอบอื่นเสมอ ทำให้ตาดูมีน้ำหนัก */}
          <path d={`M37 ${eyeY - 1.6} Q42 ${eyeY - 4.6} 47 ${eyeY - 1.6}`} fill="none" stroke="#4a3527" strokeWidth="1.6" strokeLinecap="round" />
          <path d={`M53 ${eyeY - 1.6} Q58 ${eyeY - 4.6} 63 ${eyeY - 1.6}`} fill="none" stroke="#4a3527" strokeWidth="1.6" strokeLinecap="round" />
        </g>

        {/* ------------------------------------------------------- จมูก
            ของเดิมไม่มีจมูกเลย ซึ่งเป็นเหตุผลใหญ่ที่หน้าดูเป็นการ์ตูน */}
        <path d={`M49.4 ${eyeY + 1} Q47.6 ${eyeY + 7} 50 ${eyeY + 8.4} Q52.4 ${eyeY + 7.6} 52.6 ${eyeY + 6.6}`}
              fill="none" stroke={LINE} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
        <ellipse cx="50" cy={eyeY + 8.6} rx="3.1" ry="1.5" fill={SHADOW} opacity="0.6" />

        {/* --------------------------------------------------- ร่องแก้ม */}
        {senior && (
          <>
            <path d="M44.5 60 Q42.5 64.5 44 67" fill="none" stroke={LINE} strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />
            <path d="M55.5 60 Q57.5 64.5 56 67" fill="none" stroke={LINE} strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />
          </>
        )}

        {/* ------------------------------------------------------- หนวด */}
        {beard === "mustache" && (
          <>
            <path d="M39 60.5 Q45 58.4 50 61.4 Q55 58.4 61 60.5 Q55 65 50 63.4 Q45 65 39 60.5 Z" fill={hair} />
            <path d="M43 60.6 Q47 59.6 50 61.4 Q53 59.6 57 60.6 Q53 62.4 50 61.8 Q47 62.4 43 60.6 Z" fill="#000" opacity="0.1" />
          </>
        )}

        {/* -------------------------------------------------------- ปาก */}
        <path
          d="M44.5 65.4 Q50 68.6 55.5 65.4"
          fill="none"
          stroke={beard === "full" ? "#7d4c3b" : "#a8604c"}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {beard !== "full" && (
          <path d="M46 66.4 Q50 68 54 66.4" fill="none" stroke="#c98a72" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
        )}

        {hat === "beret" && (
          <>
            <path d="M27 38 Q28 20 50 19 Q72 20 73 36 Q73 42 66 41 Q56 39 34 42 Q27 43 27 38 Z" fill="#3f5148" />
            <path d="M34 27 Q42 22 52 22 Q42 25 36 33 Z" fill="#fff" opacity="0.16" />
            <circle cx="50" cy="18.5" r="2.6" fill="#2e3b34" />
          </>
        )}

        {/* ----------------------------------------------------- แว่นตา
            วาดหลังใบหน้าทั้งหมด เพราะแว่นอยู่หน้าสุดในชีวิตจริง */}
        {glasses === "round" && (
          <g fill="none" stroke="#544a40" strokeWidth="1.7" strokeLinecap="round">
            <circle cx="42" cy={eyeY} r="7.2" fill="#ffffff" fillOpacity="0.14" />
            <circle cx="58" cy={eyeY} r="7.2" fill="#ffffff" fillOpacity="0.14" />
            <path d={`M49.2 ${eyeY - 0.6} Q50 ${eyeY - 2} 50.8 ${eyeY - 0.6}`} />
            <line x1="34.8" y1={eyeY - 1} x2="30" y2={eyeY - 2.6} />
            <line x1="65.2" y1={eyeY - 1} x2="70" y2={eyeY - 2.6} />
          </g>
        )}
        {glasses === "halfmoon" && (
          <g fill="none" stroke="#5a4f43" strokeWidth="1.6" strokeLinecap="round">
            <path d={`M35 ${eyeY + 1} Q42 ${eyeY + 7} 49 ${eyeY + 1}`} fill="#ffffff" fillOpacity="0.14" />
            <path d={`M51 ${eyeY + 1} Q58 ${eyeY + 7} 65 ${eyeY + 1}`} fill="#ffffff" fillOpacity="0.14" />
            <line x1="35" y1={eyeY + 1} x2="65" y2={eyeY + 1} />
            <line x1="35" y1={eyeY + 1} x2="30.5" y2={eyeY - 1} />
            <line x1="65" y1={eyeY + 1} x2="69.5" y2={eyeY - 1} />
          </g>
        )}
        {glasses === "square" && (
          <g fill="none" stroke="#332c25" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
            <rect x="34" y={eyeY - 5.6} width="15" height="11.6" rx="2.6" fill="#ffffff" fillOpacity="0.14" />
            <rect x="51" y={eyeY - 5.6} width="15" height="11.6" rx="2.6" fill="#ffffff" fillOpacity="0.14" />
            <line x1="49" y1={eyeY - 1.6} x2="51" y2={eyeY - 1.6} />
            <line x1="34" y1={eyeY - 2.6} x2="29.6" y2={eyeY - 3.6} />
            <line x1="66" y1={eyeY - 2.6} x2="70.4" y2={eyeY - 3.6} />
          </g>
        )}
      </g>
    </svg>
  );
}

export default PsychAvatar;
