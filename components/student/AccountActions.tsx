"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, LogOut, Trash2, X } from "lucide-react";

import {
  ERASED_ITEMS,
  KEPT_ITEMS,
  withdrawConsentAndErase,
} from "@/lib/account/withdraw";
import { useCasesStore } from "@/lib/store/useCasesStore";
import { useUserStore } from "@/lib/store/useUserStore";

/**
 * ออกจากระบบ และถอนความยินยอม
 *
 * ก่อนหน้านี้ signOut() ถูกเรียกที่เดียวคือแถบเมนูฝั่งครู — นักเรียนออกจากระบบไม่ได้เลย
 * ทั้งที่สโตร์เขียนคอมเมนต์ไว้เองว่า "เครื่องโรงเรียนใช้ร่วมกัน ข้อมูลส่วนตัวทุกชุด
 * ต้องหายไปพร้อมการออกจากระบบ" ส่วน clearConsent() ก็เขียนไว้แต่ไม่มีใครเรียกทั้งแอป
 * ทั้งที่หน้าล็อกอินขึ้นข้อความว่าดูแลข้อมูลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล
 *
 * ปุ่ม "ออกด่วน" ที่มุมจอไม่ใช่การออกจากระบบ — มันแค่พาออกจากหน้าจอตอนมีคนเดินมา
 */

export function AccountActions() {
  const router = useRouter();
  const signOut = useUserStore((s) => s.signOut);
  const cases = useCasesStore((s) => s.cases);

  const [mounted, setMounted] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [working, setWorking] = useState(false);
  /** null = ยังไม่ได้ลบ · true/false = ลบเสร็จแล้ว และลบบนเซิร์ฟเวอร์ได้หรือไม่ */
  const [erased, setErased] = useState<boolean | null>(null);
  useEffect(() => setMounted(true), []);

  // เรื่องที่ยังไม่ปิด — ตัวเลขนี้ต้องขึ้นก่อนกดยืนยัน ไม่ใช่พูดลอย ๆ ว่า "บางเรื่องจะยังอยู่"
  const openCases = mounted ? cases.filter((c) => c.status !== "resolved").length : 0;

  async function doWithdraw() {
    setWorking(true);
    const { serverProfileDeleted } = await withdrawConsentAndErase();
    setWorking(false);
    // ไม่เด้งออกทันที — แสดงผลตรงนี้ก่อน เพราะเป็นจุดเดียวที่บอกได้ว่าเกิดอะไรขึ้นจริง
    // (ConsentGuard อ่านความยินยอมครั้งเดียวตอน mount หน้านี้จึงยังอยู่จนกว่าจะเปลี่ยนหน้า)
    setErased(serverProfileDeleted);
  }

  if (erased !== null) {
    return (
      <section className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-neutral-200/80">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-mint-50">
          <Check className="size-6 text-mint-600" aria-hidden="true" />
        </span>
        <p className="mt-3 text-[1rem] font-bold text-ink">ลบข้อมูลแล้ว</p>
        <p className="mx-auto mt-1.5 max-w-[22rem] text-[0.82rem] leading-relaxed text-ink-soft">
          {erased
            ? "ข้อมูลในเครื่องนี้และชื่อ-รหัสนักเรียนบนเซิร์ฟเวอร์ถูกลบเรียบร้อยแล้ว"
            : // บอกตามจริงว่าลบได้แค่ในเครื่อง ดีกว่าบอกว่าลบหมดแล้วทั้งที่ยังไม่หมด
              "ข้อมูลในเครื่องนี้ถูกลบแล้ว แต่ยังติดต่อเซิร์ฟเวอร์ไม่ได้ ชื่อและรหัสนักเรียนที่เก็บไว้บนเซิร์ฟเวอร์จึงอาจยังอยู่ ถ้าต้องการให้ลบส่วนนั้นด้วย บอกครูแนะแนวได้เลย"}
        </p>
        <button
          type="button"
          onClick={() => router.replace("/login")}
          className="mt-4 inline-flex min-h-11 items-center rounded-full bg-mint-700 px-6 text-[0.86rem] font-semibold text-white transition-colors hover:bg-mint-600"
        >
          กลับไปหน้าเข้าสู่ระบบ
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-2.5">
      <button
        type="button"
        onClick={() => {
          signOut();
          router.replace("/");
        }}
        className="flex w-full items-center gap-3.5 rounded-2xl bg-white p-3.5 text-left shadow-sm ring-1 ring-neutral-200/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-panel/60 text-ink-soft">
          <LogOut className="size-[1.2rem]" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.92rem] font-bold text-ink">ออกจากระบบ</span>
          <span className="mt-0.5 block text-[0.74rem] leading-snug text-ink-soft">
            ใช้เครื่องร่วมกับคนอื่น อย่าลืมกดก่อนลุก
          </span>
        </span>
      </button>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="flex w-full items-center gap-3.5 rounded-2xl bg-white p-3.5 text-left shadow-sm ring-1 ring-rose-200/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-500">
            <Trash2 className="size-[1.2rem]" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[0.92rem] font-bold text-ink">
              ถอนความยินยอมและลบข้อมูล
            </span>
            <span className="mt-0.5 block text-[0.74rem] leading-snug text-ink-soft">
              สิทธิ์ของเราตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล
            </span>
          </span>
        </button>
      ) : (
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-rose-200">
          <p className="flex items-center gap-2 text-[0.95rem] font-bold text-ink">
            <AlertTriangle className="size-[1.05rem] text-rose-500" aria-hidden="true" />
            แน่ใจนะ? กดแล้วย้อนกลับไม่ได้
          </p>

          <p className="mt-3 text-[0.8rem] font-semibold text-ink">สิ่งที่จะถูกลบ</p>
          <ul className="mt-1.5 space-y-1">
            {ERASED_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[0.78rem] leading-relaxed text-ink-soft">
                <X className="mt-0.5 size-3.5 shrink-0 text-rose-400" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-3.5 text-[0.8rem] font-semibold text-ink">สิ่งที่ยังอยู่ และเพราะอะไร</p>
          <ul className="mt-1.5 space-y-1.5">
            {KEPT_ITEMS.map((item) => (
              <li key={item.what} className="flex items-start gap-2 text-[0.78rem] leading-relaxed">
                <Check className="mt-0.5 size-3.5 shrink-0 text-mint-600" aria-hidden="true" />
                <span>
                  <span className="font-medium text-ink">{item.what}</span>
                  <span className="text-ink-mute"> — {item.why}</span>
                </span>
              </li>
            ))}
          </ul>

          {openCases > 0 ? (
            <p className="mt-3 rounded-xl bg-amber-50 p-3 text-[0.78rem] leading-relaxed text-amber-900">
              ตอนนี้มีเรื่องที่ครูกำลังดูแลอยู่ {openCases} เรื่อง เรื่องเหล่านี้จะยังอยู่ต่อ
              แต่สำเนาในเครื่องนี้จะหายไป แปลว่าเราจะกดติดตามสถานะเองไม่ได้อีก
              ถ้ายังอยากตามเรื่องอยู่ ให้จดรหัสรับเรื่องไว้ก่อนกด
            </p>
          ) : null}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={working}
              className="min-h-12 flex-1 rounded-2xl bg-panel/60 text-[0.88rem] font-semibold text-ink transition-colors hover:bg-panel disabled:opacity-50"
            >
              ไม่ลบแล้ว
            </button>
            <button
              type="button"
              onClick={doWithdraw}
              disabled={working}
              className="min-h-12 flex-1 rounded-2xl bg-rose-600 text-[0.88rem] font-semibold text-white transition-colors hover:bg-rose-500 disabled:opacity-60"
            >
              {working ? "กำลังลบ…" : "ยืนยันการลบ"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
