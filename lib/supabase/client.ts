import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client. Uses the anon key, which is public by design —
 * every table this touches must have row-level security on, because the key
 * grants nothing on its own but also protects nothing.
 *
 * Never read another student's rows from here. Aggregates for the admin
 * dashboard belong in a server route where the service key lives.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    );
  }

  return createBrowserClient(url, anonKey);
}

/**
 * ตั้งค่า Supabase ไว้หรือยัง — โค้ดที่ต้องทำงานได้ทั้งแบบมีและไม่มีฐานข้อมูล
 * (เช่น ปุ่มล็อกอิน, ตัวเก็บข้อมูลที่ยังมีทางสำรองเป็น localStorage) เช็คตัวนี้ก่อน
 * แทนที่จะเรียก createClient() แล้วดัก throw
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** ไคลเอนต์เดียวใช้ทั้งแอป (null เมื่อยังไม่ตั้งค่า) — กันสร้างซ้ำทุกครั้งที่เรียก */
let browserClient: ReturnType<typeof createBrowserClient> | null = null;
export function getClient() {
  if (!isSupabaseConfigured()) return null;
  browserClient ??= createClient();
  return browserClient;
}
