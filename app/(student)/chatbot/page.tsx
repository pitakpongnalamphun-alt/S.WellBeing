import type { Metadata } from "next";
import { Suspense } from "react";

import { ChatScreen } from "@/components/student/chatbot/ChatScreen";

export const metadata: Metadata = { title: "คุยกับน้องอุ่น — S.Well-Being" };

/** ChatScreen อ่าน ?q= จึงต้องอยู่ใต้ Suspense ไม่งั้นทั้งหน้าถูกบังคับให้เรนเดอร์ฝั่งไคลเอนต์ */
export default function ChatbotPage() {
  return (
    <Suspense fallback={null}>
      <ChatScreen />
    </Suspense>
  );
}
