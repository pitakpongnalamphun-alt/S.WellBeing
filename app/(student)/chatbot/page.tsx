import type { Metadata } from "next";

import { ChatScreen } from "@/components/student/chatbot/ChatScreen";

export const metadata: Metadata = { title: "Well.AI — S.Well-Being" };

export default function ChatbotPage() {
  return <ChatScreen />;
}
