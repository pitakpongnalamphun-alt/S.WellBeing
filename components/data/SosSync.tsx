"use client";

import { useEffect } from "react";

import { useSosStore } from "@/lib/store/useSosStore";

/**
 * ดึงเหตุ SOS จากเซิร์ฟเวอร์เมื่อเปิดแอป เมื่อกลับมาที่แท็บ และซ้ำเป็นระยะ —
 * คู่แฝดของ CasesSync แต่ถี่กว่า (15 วินาที) เพราะนี่คือเหตุฉุกเฉินสด
 * ครูเวรที่เปิดแดชบอร์ดค้างไว้ต้องเห็นเหตุใหม่เร็วที่สุดโดยไม่ต้องรีเฟรช
 *
 * ไม่เรนเดอร์อะไรเลย เป็นแค่ตัวเชื่อมข้อมูล
 */
export function SosSync() {
  const syncFromServer = useSosStore((s) => s.syncFromServer);

  useEffect(() => {
    void syncFromServer();

    const onFocus = () => {
      if (document.visibilityState === "visible") void syncFromServer();
    };
    document.addEventListener("visibilitychange", onFocus);
    const t = window.setInterval(() => void syncFromServer(), 15_000);
    return () => {
      document.removeEventListener("visibilitychange", onFocus);
      window.clearInterval(t);
    };
  }, [syncFromServer]);

  return null;
}

export default SosSync;
