import type { Locale } from "@/lib/i18n/dictionaries";

/**
 * Bump on every substantive change to the policy text. A consent record is
 * only valid for the version the person actually read, so an old record must
 * not satisfy a new policy — the gate re-asks when this changes.
 */
export const POLICY_VERSION = "2026-07-23.1";

export type PolicySection = {
  /** Section number as printed in the source document. */
  no: number;
  heading: string;
  items: string[];
};

export type PolicyDocument = {
  act: string;
  title: string;
  standfirst: string;
  operator: string;
  sections: PolicySection[];
  /** The sentence that states what pressing accept means. */
  affirmation: string;
  /** Shown alongside the decline button — what happens if they say no. */
  declineNote: string;
};

const th: PolicyDocument = {
  act: "พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562",
  title: "นโยบายความเป็นส่วนตัว",
  standfirst:
    "ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)",
  operator:
    "ระบบ S.Well-Being ดำเนินการโดย ACT เก็บรวบรวมและประมวลผลข้อมูลส่วนบุคคลของท่านเพื่อวัตถุประสงค์ดังต่อไปนี้",
  sections: [
    {
      no: 1,
      heading: "ข้อมูลที่เก็บรวบรวม",
      items: [
        "ชื่อ-นามสกุล, รหัสนักเรียน",
        "อีเมลและเบอร์โทรศัพท์",
        "ข้อมูลสุขภาพจิต เช่น บันทึกอารมณ์ ผลการประเมิน",
        "ข้อมูลการร้องเรียน/แจ้งเหตุ",
      ],
    },
    {
      no: 2,
      heading: "วัตถุประสงค์ในการเก็บข้อมูล",
      items: [
        "เพื่อดูแลและส่งเสริมสุขภาพจิตของนักเรียน",
        "เพื่อให้คำปรึกษาและความช่วยเหลือที่เหมาะสม",
        "เพื่อวิเคราะห์แนวโน้มและปรับปรุงระบบ",
      ],
    },
    {
      no: 3,
      heading: "การเก็บรักษาและความปลอดภัย",
      items: [
        "ข้อมูลถูกเก็บอย่างปลอดภัยและเป็นความลับ",
        "เฉพาะผู้ได้รับอนุญาตเท่านั้นที่เข้าถึงได้",
        "ไม่เปิดเผยข้อมูลแก่บุคคลภายนอกโดยไม่ได้รับความยินยอม",
      ],
    },
    {
      no: 4,
      heading: "สิทธิ์ของเจ้าของข้อมูล",
      items: [
        "ท่านมีสิทธิ์เข้าถึง แก้ไข หรือลบข้อมูลของท่าน",
        "ท่านสามารถถอนความยินยอมได้ตลอดเวลา",
        "ติดต่อผู้รับผิดชอบได้ที่ครูแนะแนวของโรงเรียน",
      ],
    },
  ],
  affirmation:
    'การกดยืนยัน "ยอมรับ" ถือว่าท่านได้อ่านและยอมรับนโยบายฉบับนี้แล้ว',
  declineNote:
    "หากไม่ยอมรับ ท่านจะยังไม่สามารถใช้งานระบบได้ และเราจะไม่เก็บข้อมูลของท่าน ท่านกลับมายอมรับภายหลังได้",
};

const en: PolicyDocument = {
  act: "Personal Data Protection Act B.E. 2562 (2019)",
  title: "Privacy policy",
  standfirst:
    "Under the Personal Data Protection Act B.E. 2562 (PDPA)",
  operator:
    "S.Well-Being, operated by ACT, collects and processes your personal data for the purposes below.",
  sections: [
    {
      no: 1,
      heading: "Data we collect",
      items: [
        "Full name and student ID",
        "Email address and phone number",
        "Mental health data, such as mood entries and assessment results",
        "Reports and incident notifications",
      ],
    },
    {
      no: 2,
      heading: "Why we collect it",
      items: [
        "To look after and support student mental health",
        "To offer counselling and appropriate help",
        "To analyse trends and improve the system",
      ],
    },
    {
      no: 3,
      heading: "Storage and security",
      items: [
        "Data is stored securely and kept confidential",
        "Only authorised staff can access it",
        "It is not disclosed to third parties without your consent",
      ],
    },
    {
      no: 4,
      heading: "Your rights",
      items: [
        "You may access, correct, or delete your data",
        "You may withdraw consent at any time",
        "Contact your school counsellor to exercise these rights",
      ],
    },
  ],
  affirmation:
    'Pressing "Accept" confirms that you have read and accepted this policy.',
  declineNote:
    "If you decline, you cannot use the system yet and we will not collect your data. You can come back and accept later.",
};

export const policies: Record<Locale, PolicyDocument> = { th, en };
