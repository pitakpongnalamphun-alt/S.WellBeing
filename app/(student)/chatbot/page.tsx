import type { Metadata } from "next";

import { ChatScreen } from "@/components/student/chatbot/ChatScreen";

export const metadata: Metadata = { title: "คุยกับน้องปุย — S.Well-Being" };

export default function ChatbotPage() {
  return <ChatScreen />;
}
