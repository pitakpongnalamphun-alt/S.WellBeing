/**
 * The people a student can book time with. Three roles, each with its own hue so
 * the picker reads as three clear doors — deep support, school guidance, and
 * app/account help — not one intimidating list.
 */

export type CounselorRole = "psychologist" | "counselor" | "admin";

export type Counselor = {
  id: string;
  name: string;
  role: CounselorRole;
  /** Short role line shown under the name. */
  title: string;
  emoji: string;
  /** What they help with — plain, reassuring. */
  blurb: string;
};

export const ROLE_META: Record<
  CounselorRole,
  { label: string; desc: string; emoji: string; tint: string; ring: string; soft: string; ink: string }
> = {
  psychologist: {
    label: "นักจิตวิทยา",
    desc: "คุยเรื่องความรู้สึกลึก ๆ อย่างเป็นความลับ",
    emoji: "💜",
    tint: "bg-lavender-100",
    ring: "ring-lavender-400",
    soft: "bg-lavender-50",
    ink: "text-lavender-700",
  },
  counselor: {
    label: "ครูแนะแนว",
    desc: "ปรึกษาเรื่องเรียน อนาคต หรือเรื่องในโรงเรียน",
    emoji: "🎓",
    tint: "bg-mint-100",
    ring: "ring-mint-400",
    soft: "bg-mint-50",
    ink: "text-mint-700",
  },
  admin: {
    label: "ผู้ดูแลระบบ",
    desc: "แจ้งปัญหาการใช้งานแอป หรือเรื่องบัญชี",
    emoji: "🛠️",
    tint: "bg-sky-100",
    ring: "ring-sky-400",
    soft: "bg-sky-50",
    ink: "text-sky-700",
  },
};

/** Display order of the roles in the picker. */
export const ROLE_ORDER: CounselorRole[] = ["psychologist", "counselor", "admin"];

export const COUNSELORS: Counselor[] = [
  {
    id: "psy-pim",
    name: "คุณหมอพิม",
    role: "psychologist",
    title: "นักจิตวิทยาคลินิก",
    emoji: "💜",
    blurb: "รับฟังเรื่องความเครียด ความวิตกกังวล และความรู้สึกที่หนักใจ",
  },
  {
    id: "gc-aoy",
    name: "ครูอ้อย",
    role: "counselor",
    title: "ครูแนะแนว",
    emoji: "🌷",
    blurb: "ปรึกษาเรื่องการเรียน การวางแผนอนาคต และเรื่องเพื่อน",
  },
  {
    id: "gc-jane",
    name: "ครูเจน",
    role: "counselor",
    title: "ครูแนะแนว",
    emoji: "🌻",
    blurb: "ดูแลเรื่องความสัมพันธ์ในโรงเรียนและการปรับตัว",
  },
  {
    id: "admin-team",
    name: "ทีมผู้ดูแลระบบ",
    role: "admin",
    title: "ผู้ดูแลระบบ",
    emoji: "🛠️",
    blurb: "ช่วยเรื่องการเข้าใช้งาน บัญชี และการแจ้งปัญหาทางเทคนิค",
  },
];

export const COUNSELOR_BY_ID: Record<string, Counselor> = Object.fromEntries(
  COUNSELORS.map((c) => [c.id, c]),
);
