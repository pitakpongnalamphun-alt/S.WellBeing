import { Suspense } from "react";

import { CopingCenter } from "@/components/coping/CopingCenter";

/** useSearchParams (ใน CopingCenter) ต้องอยู่ใต้ Suspense ไม่งั้น build จะบังคับ
 *  ให้ทั้งหน้าเรนเดอร์ฝั่งไคลเอนต์ทั้งหมด */
export default function CopingPage() {
  return (
    <div className="flex flex-1 flex-col py-2">
      <Suspense fallback={null}>
        <CopingCenter />
      </Suspense>
    </div>
  );
}
