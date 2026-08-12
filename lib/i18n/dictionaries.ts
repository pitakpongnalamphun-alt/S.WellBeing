/**
 * Copy lives here, not in components. Two locales, one shape — TypeScript
 * enforces that Thai never drifts out of sync with English.
 */

export const LOCALES = ["en", "th"] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  th: "ไทย",
};

export type Dictionary = {
  brand: string;
  headline: string[];
  tagline: string;
  note: string;
  welcome: string;
  welcomeSub: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  showPassword: string;
  hidePassword: string;
  forgot: string;
  submit: string;
  submitting: string;
  divider: string;
  google: string;
  apple: string;
  noAccount: string;
  signUp: string;
  footer: string[];
  languageLabel: string;
  errors: {
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    passwordShort: string;
  };
  /** Names for the five characters — revealed on hover. */
  emotions: {
    joy: string;
    spark: string;
    calm: string;
    ache: string;
    storm: string;
  };
  /** Role selection, shown once sign-in succeeds. */
  roles: {
    subtitle: string;
    values: {
      safe: string;
      care: string;
      connect: string;
    };
    prompt: string;
    student: RoleCopy;
    admin: RoleCopy;
    footnote: string;
  };
  /** Chrome around the policy document — the policy itself lives in lib/consent. */
  consent: {
    eyebrow: string;
    /** Named so the person knows which account they are consenting for. */
    forRole: string;
    sensitiveNotice: string;
    progressUnread: string;
    progressRead: string;
    jumpToEnd: string;
    checkbox: string;
    accept: string;
    accepting: string;
    decline: string;
    mustRead: string;
    mustTick: string;
    regionLabel: string;
    declinedTitle: string;
    declinedBody: string;
    declinedBack: string;
    changeRole: string;
  };
};

type RoleCopy = {
  title: string;
  /** English sub-label. Stays English in both locales — it names the product surface. */
  surface: string;
  description: string;
  /** Announced to screen readers in place of the bare arrow. */
  action: string;
};

const en: Dictionary = {
  brand: "S.WELL-BEING",
  headline: ["Understand", "your mind.", "Improve your", "life."],
  tagline:
    "S.Well-Being helps you track, understand, and regulate your emotions through intuitive design.",
  note: "A better you starts with understanding your feelings.",
  welcome: "Welcome back",
  welcomeSub: "Log in to continue your journey",
  emailLabel: "Email",
  emailPlaceholder: "hello@youremail.com",
  passwordLabel: "Password",
  passwordPlaceholder: "Enter your password",
  showPassword: "Show password",
  hidePassword: "Hide password",
  forgot: "Forgot password?",
  submit: "Log In",
  submitting: "Logging in",
  divider: "or continue with",
  google: "Continue with Google",
  apple: "Continue with Apple",
  noAccount: "Don't have an account?",
  signUp: "Sign up",
  footer: ["Your mental health matters.", "We're here to support you."],
  languageLabel: "Language",
  errors: {
    emailRequired: "Enter your email address.",
    emailInvalid: "That doesn't look like an email address.",
    passwordRequired: "Enter your password.",
    passwordShort: "Passwords are at least 8 characters.",
  },
  emotions: {
    joy: "Joyful",
    spark: "Excited",
    calm: "Neutral",
    ache: "Sad",
    storm: "Overwhelmed",
  },
  roles: {
    subtitle: "Student mental health support",
    values: {
      safe: "Safe",
      care: "Cared for",
      connect: "Connected",
    },
    prompt: "Choose your role",
    student: {
      title: "Student",
      surface: "Student Portal",
      description:
        "Report a problem, talk to a counsellor, and check in on how you're doing.",
      action: "Open the student portal",
    },
    admin: {
      title: "Administrator",
      surface: "Admin Dashboard",
      description: "Manage cases, review data, and keep the system running.",
      action: "Open the admin dashboard",
    },
    footnote: "You can switch roles later from your account settings.",
  },
  consent: {
    eyebrow: "Before you start",
    forRole: "Signing in as",
    sensitiveNotice:
      "This includes mental health data, which the PDPA treats as sensitive personal data. It needs your explicit consent.",
    progressUnread: "Scroll to read the whole policy",
    progressRead: "You've read the whole policy",
    jumpToEnd: "Skip to the end",
    checkbox:
      "I have read this policy and consent to the collection and processing of my personal data, including mental health data.",
    accept: "Accept",
    accepting: "Saving",
    decline: "Decline",
    mustRead: "Please read to the end of the policy first.",
    mustTick: "Please tick the box to give consent.",
    regionLabel: "Privacy policy — scrollable",
    declinedTitle: "You declined",
    declinedBody:
      "We haven't collected anything, and you can't use the system yet. Come back whenever you're ready.",
    declinedBack: "Read the policy again",
    changeRole: "Change role",
  },
};

const th: Dictionary = {
  brand: "S.WELL-BEING",
  headline: ["เข้าใจตัวเอง", "เพื่อชีวิต", "ที่ดีกว่า"],
  tagline:
    "S.Well-Being ช่วยให้คุณบันทึก ทำความเข้าใจ และดูแลอารมณ์ของตัวเอง ผ่านการออกแบบที่ใช้ง่าย",
  note: "การดูแลตัวเองที่ดีขึ้น เริ่มจากการเข้าใจความรู้สึกของคุณ",
  welcome: "ยินดีต้อนรับกลับมา",
  welcomeSub: "เข้าสู่ระบบเพื่อไปต่อกับเส้นทางของคุณ",
  emailLabel: "อีเมล",
  emailPlaceholder: "hello@youremail.com",
  passwordLabel: "รหัสผ่าน",
  passwordPlaceholder: "กรอกรหัสผ่านของคุณ",
  showPassword: "แสดงรหัสผ่าน",
  hidePassword: "ซ่อนรหัสผ่าน",
  forgot: "ลืมรหัสผ่าน?",
  submit: "เข้าสู่ระบบ",
  submitting: "กำลังเข้าสู่ระบบ",
  divider: "หรือเข้าสู่ระบบด้วย",
  google: "เข้าสู่ระบบด้วย Google",
  apple: "เข้าสู่ระบบด้วย Apple",
  noAccount: "ยังไม่มีบัญชี?",
  signUp: "สมัครสมาชิก",
  footer: ["สุขภาพใจของคุณสำคัญ", "เราพร้อมอยู่เคียงข้างคุณ"],
  languageLabel: "ภาษา",
  errors: {
    emailRequired: "กรุณากรอกอีเมล",
    emailInvalid: "รูปแบบอีเมลไม่ถูกต้อง",
    passwordRequired: "กรุณากรอกรหัสผ่าน",
    passwordShort: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
  },
  emotions: {
    joy: "มีความสุข",
    spark: "ตื่นเต้น",
    calm: "เฉย ๆ",
    ache: "เศร้า",
    storm: "ท่วมท้น",
  },
  roles: {
    subtitle: "ระบบดูแลสุขภาพจิตนักเรียน",
    values: {
      safe: "ปลอดภัย",
      care: "ใส่ใจ",
      connect: "เชื่อมต่อ",
    },
    prompt: "เลือกบทบาทของคุณ",
    student: {
      title: "นักเรียน",
      surface: "Student Portal",
      description: "แจ้งปัญหา พูดคุยกับครูแนะแนว ตรวจวัดสุขภาพจิต",
      action: "เข้าสู่ระบบนักเรียน",
    },
    admin: {
      title: "ผู้ดูแลระบบ",
      surface: "Admin Dashboard",
      description: "จัดการเคส วิเคราะห์ข้อมูล และดูแลระบบ",
      action: "เข้าสู่ระบบผู้ดูแล",
    },
    footnote: "เปลี่ยนบทบาทภายหลังได้ที่การตั้งค่าบัญชี",
  },
  consent: {
    eyebrow: "ก่อนเริ่มใช้งาน",
    forRole: "เข้าใช้งานในฐานะ",
    sensitiveNotice:
      "รวมถึงข้อมูลสุขภาพจิต ซึ่ง PDPA จัดเป็นข้อมูลอ่อนไหว จึงต้องได้รับความยินยอมโดยชัดแจ้งจากท่าน",
    progressUnread: "เลื่อนอ่านนโยบายให้ครบ",
    progressRead: "ท่านอ่านนโยบายครบแล้ว",
    jumpToEnd: "ข้ามไปท้ายเอกสาร",
    checkbox:
      "ข้าพเจ้าได้อ่านนโยบายฉบับนี้แล้ว และยินยอมให้เก็บรวบรวมและประมวลผลข้อมูลส่วนบุคคลของข้าพเจ้า รวมถึงข้อมูลสุขภาพจิต",
    accept: "ยอมรับ",
    accepting: "กำลังบันทึก",
    decline: "ไม่ยอมรับ",
    mustRead: "กรุณาอ่านนโยบายให้ครบก่อน",
    mustTick: "กรุณาติ๊กช่องเพื่อให้ความยินยอม",
    regionLabel: "นโยบายความเป็นส่วนตัว — เลื่อนอ่านได้",
    declinedTitle: "ท่านไม่ได้ให้ความยินยอม",
    declinedBody:
      "เราไม่ได้เก็บข้อมูลใดของท่าน และท่านยังใช้งานระบบไม่ได้ กลับมาให้ความยินยอมเมื่อพร้อมได้เสมอ",
    declinedBack: "อ่านนโยบายอีกครั้ง",
    changeRole: "เปลี่ยนบทบาท",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { en, th };
