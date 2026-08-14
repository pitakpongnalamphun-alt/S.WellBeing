import { clearConsent } from "@/lib/consent/record";
import { deleteMyProfile } from "@/lib/data/profileRepo";
import { useAppointmentStore } from "@/lib/store/useAppointmentStore";
import { useCasesStore } from "@/lib/store/useCasesStore";
import { useChatStore } from "@/lib/store/useChatStore";
import { useCloudHugsStore } from "@/lib/store/useCloudHugsStore";
import { useGachaStore } from "@/lib/store/useGachaStore";
import { useMoodDiaryStore } from "@/lib/store/useMoodDiaryStore";
import { useMyAssessStore } from "@/lib/store/useMyAssessStore";
import { useSosStore } from "@/lib/store/useSosStore";
import { useUserStore } from "@/lib/store/useUserStore";
import { useWisdomStore } from "@/lib/store/useWisdomStore";

/**
 * ถอนความยินยอมและลบข้อมูลของตัวเอง
 *
 * รายการสองชุดข้างล่างนี้คือ "สัญญา" ที่หน้าจอไปบอกนักเรียนไว้ ทั้งสองชุดจึงอยู่ใน
 * ไฟล์เดียวกับโค้ดที่ลบจริง ไม่ใช่ให้หน้าจอเขียนข้อความของตัวเองแยกไว้ที่อื่น —
 * ถ้าแยกกัน วันหนึ่งจะมีคนเพิ่มสโตร์ใหม่แล้วลืมแก้ข้อความ แล้วหน้าจอจะสัญญาสิ่งที่
 * โค้ดไม่ได้ทำ ซึ่งแย่กว่าไม่มีปุ่มนี้เลย
 *
 * ทำไมเรื่องที่ครูกำลังดูแลอยู่ถึงไม่ถูกลบ
 * ถ้าปุ่มนี้ลบเคสที่แจ้งไว้ได้ด้วย เด็กที่ไปแจ้งว่าโดนรังแกจะถูกบีบให้กดลบได้
 * ("มึงไปฟ้องครูใช่ไหม ไปกดลบเดี๋ยวนี้") กดครั้งเดียวเรื่องหายจากระบบ และปุ่มที่
 * ควรเป็นของเด็ก ก็กลายเป็นของคนที่มีอำนาจเหนือเด็กคนนั้นแทน
 *
 * เคสจึงยืนอยู่บนหน้าที่ดูแลความปลอดภัยของโรงเรียน ไม่ได้ยืนอยู่บนความยินยอมอย่างเดียว
 * แต่ต้องบอกบนหน้าจอตรง ๆ ว่าคงไว้ ไม่ใช่ลบเงียบ ๆ แล้วให้เขาไปรู้ทีหลังว่าของยังอยู่
 */

/** สิ่งที่ถูกลบ — ข้อความนี้ขึ้นบนหน้าจอก่อนกดยืนยัน */
export const ERASED_ITEMS = [
  "ชื่อและรหัสนักเรียน ทั้งในเครื่องนี้และบนเซิร์ฟเวอร์",
  "บันทึกอารมณ์และสมุดสะสมอารมณ์",
  "ข้อความที่คุยกับน้องปุย",
  "ผลประเมินใจของตัวเอง",
  "คำคมที่บันทึกไว้ และก้อนเมฆที่ปล่อยไป",
  "แก๊งเพื่อนปุย เหรียญ และของตกแต่งทั้งหมด",
  "สำเนาเรื่องที่แจ้งและใบนัด ที่เก็บไว้ในเครื่องนี้",
] as const;

/** สิ่งที่คงไว้ พร้อมเหตุผล — ต้องบอกก่อนกด ไม่ใช่ให้ไปรู้ทีหลัง */
export const KEPT_ITEMS = [
  {
    what: "เรื่องที่ครูกำลังดูแลอยู่",
    why: "เพื่อไม่ให้ใครถูกบังคับให้กดลบเรื่องที่ตัวเองแจ้งไว้ และเพื่อให้ครูตามดูแลต่อได้",
  },
  {
    what: "ตัวเลขรวมของทั้งโรงเรียน",
    why: "เป็นยอดรวมที่ไม่มีชื่อใครอยู่ในนั้นแล้ว",
  },
  {
    what: "บันทึกว่าใครเข้าดูข้อมูลบ้าง",
    why: "เก็บไว้เพื่อให้ตรวจสอบย้อนหลังได้ว่ามีใครเปิดดูข้อมูลของเราหรือไม่",
  },
] as const;

/** คีย์ของสโตร์ที่ไม่มี clear() ของตัวเอง — ลบทั้งก้อนแล้วให้มันเริ่มใหม่ */
const RAW_KEYS = ["swb.gacha", "swb.cloudhugs", "swb.appointments", "swb.sos"];

export type WithdrawResult = {
  /** ลบแถวโปรไฟล์บนเซิร์ฟเวอร์สำเร็จไหม (false เมื่อยังไม่ได้ต่อฐานข้อมูล) */
  serverProfileDeleted: boolean;
};

export async function withdrawConsentAndErase(): Promise<WithdrawResult> {
  // ลบฝั่งเซิร์ฟเวอร์ก่อน เพราะต้องใช้ session ที่ signOut กำลังจะทำลาย
  const serverProfileDeleted = await deleteMyProfile();

  useMoodDiaryStore.getState().clear();
  useChatStore.getState().clear();
  useMyAssessStore.getState().clear();
  useWisdomStore.getState().clear();
  useCasesStore.getState().clear();

  for (const key of RAW_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // โหมดส่วนตัวของบางเบราว์เซอร์ห้ามเขียน — ไม่ควรทำให้ทั้งขั้นตอนล้ม
    }
  }
  // สโตร์ที่เพิ่งลบคีย์ทิ้ง ยังถือค่าเดิมอยู่ในหน่วยความจำจนกว่าจะโหลดหน้าใหม่
  // เรียก persist.rehydrate() ให้มันกลับไปอ่านของที่ (ไม่) มีอยู่ทันที
  void useGachaStore.persist?.rehydrate();
  void useCloudHugsStore.persist?.rehydrate();
  void useAppointmentStore.persist?.rehydrate();
  void useSosStore.persist?.rehydrate();

  clearConsent();
  useUserStore.getState().signOut(); // ล้าง session + โปรไฟล์ในเครื่อง และออกจาก Supabase

  return { serverProfileDeleted };
}
