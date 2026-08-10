"use client";

import { useEffect } from "react";

import { useCasesStore } from "@/lib/store/useCasesStore";

/**
 * ดึงเคสจากเซิร์ฟเวอร์เมื่อเปิดแอป และดึงซ้ำเมื่อผู้ใช้กลับมาที่แท็บนี้
 *
 * วางไว้ใน layout ของทั้งสองฝั่ง — ครูที่เปิดแดชบอร์ดค้างไว้ทั้งวันต้องเห็นเรื่อง
 * ที่นักเรียนเพิ่งแจ้งจากมือถือ โดยไม่ต้องกดรีเฟรชเอง
 *
 * ไม่เรนเดอร์อะไรเลย เป็นแค่ตัวเชื่อมข้อมูล
 */
export function CasesSync() {
  const syncFromServer = useCasesStore((s) => s.syncFromServer);

  useEffect(() => {
    void syncFromServer();

    const onFocus = () => {
      if (document.visibilityState === "visible") void syncFromServer();
    };
    document.addEventListener("visibilitychange", onFocus);
    // เผื่อครูเปิดค้างไว้โดยไม่สลับแท็บ — ดึงซ้ำเบา ๆ ทุก 60 วินาที
    const t = window.setInterval(() => void syncFromServer(), 60_000);
    return () => {
      document.removeEventListener("visibilitychange", onFocus);
      window.clearInterval(t);
    };
  }, [syncFromServer]);

  return null;
}

export default CasesSync;
