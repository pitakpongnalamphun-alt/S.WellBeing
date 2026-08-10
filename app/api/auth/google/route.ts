import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * ยืนยัน Google ID token ฝั่งเซิร์ฟเวอร์ — ปุ่ม Google ฝั่ง client ได้ credential (JWT)
 * มาจาก Google Identity Services แล้วส่งมาที่นี่ เราตรวจ 4 อย่างก่อนเชื่อ:
 * ลายเซ็น (JWKS ของ Google), ผู้ออก (iss), ผู้รับ (aud ต้องเป็น Client ID ของเรา)
 * และวันหมดอายุ — ผ่านครบจึงคืนโปรไฟล์ที่เชื่อถือได้ให้ฝั่งแอปใช้เป็น session
 *
 * flow นี้ใช้แค่ Client ID (ข้อมูลสาธารณะ) — ไม่ต้องมี Client Secret ที่ไหนเลย
 */

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);

export async function POST(req: Request) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  let credential: unknown;
  try {
    ({ credential } = (await req.json()) as { credential?: unknown });
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  if (typeof credential !== "string" || credential.length > 4096) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const { payload } = await jwtVerify(credential, GOOGLE_JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: clientId,
    });
    if (!payload.email || payload.email_verified !== true) {
      return Response.json({ error: "email_unverified" }, { status: 401 });
    }
    return Response.json({
      email: payload.email,
      name: (payload.name as string | undefined) ?? null,
      picture: (payload.picture as string | undefined) ?? null,
    });
  } catch {
    return Response.json({ error: "invalid_token" }, { status: 401 });
  }
}
