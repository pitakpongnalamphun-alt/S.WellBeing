import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";
import type { NextRequest } from "next/server";

import { CRISIS_MESSAGE, detectCrisis } from "@/lib/wellai/crisis";
import {
  WELLAI_MAX_TOKENS,
  WELLAI_MODEL,
  WELLAI_SYSTEM_PROMPT,
} from "@/lib/wellai/systemPrompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * Shown when the LLM call fails after passing the safety checks — a bad/expired
 * key, no credit balance, a network blip. It must never be a blank bubble: a
 * student who reached out and got silence is worse than one who gets a warm
 * "not right now, but here's a human." So this always carries the hotline.
 */
const FALLBACK_MESSAGE =
  "ตอนนี้ Well.AI เชื่อมต่อกับผู้ช่วย AI ไม่ได้ชั่วคราว ขอโทษจริง ๆ นะ 🙏 ระหว่างนี้ถ้าอยากระบายหรือคุยกับใครสักคน โทร 1323 ได้ตลอด 24 ชั่วโมงเลยนะ";

/**
 * Well.AI chat endpoint — a two-layer guardrail in front of the LLM.
 *
 *   🔴 LAYER 1  deterministic keyword filter. Runs BEFORE any model call; on a
 *              hit it returns the exact emergency text and never reaches the LLM.
 *   🟢 LAYER 2  the LLM (Claude via the Vercel AI SDK), reached only when the
 *              message is safe.
 *
 * The response is a plain UTF-8 text stream plus an `X-WellAI-Type` header, so
 * the chat UI can stream tokens and style a crisis reply as an emergency card.
 */
export async function POST(req: NextRequest) {
  let messages: ChatMessage[] = [];
  try {
    const body = (await req.json()) as { messages?: ChatMessage[] };
    messages = Array.isArray(body.messages) ? body.messages : [];
  } catch {
    return new Response("bad request", { status: 400 });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user");

  // 🔴 LAYER 1 — hardcoded safety rule, before the LLM.
  if (lastUser && detectCrisis(lastUser.content)) {
    return plainText(CRISIS_MESSAGE, "crisis");
  }

  // No key configured: be honest rather than fake a reply.
  if (!process.env.OPENROUTER_API_KEY) {
    return plainText(
      "ตอนนี้ Well.AI ยังไม่ได้เชื่อมต่อกับผู้ช่วย AI (ผู้ดูแลระบบต้องตั้งค่า OPENROUTER_API_KEY ก่อน) — แต่ถ้าคุณต้องการคุยกับใครสักคนตอนนี้ โทร 1323 ได้ตลอด 24 ชั่วโมงนะ",
      "unconfigured",
    );
  }

  // 🟢 LAYER 2 — the LLM engine. OpenRouter speaks the OpenAI Chat Completions
  // protocol, so we point the OpenAI provider at its base URL. `.chat(...)`
  // forces /chat/completions (OpenRouter has no OpenAI "Responses" API). The
  // safety-critical path stays Layer 1's.
  const openrouter = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    // Optional attribution headers OpenRouter uses for its dashboard/ranking.
    headers: {
      "HTTP-Referer": "https://s-well-being.app",
      "X-Title": "S.Well-Being",
    },
  });
  const result = streamText({
    model: openrouter.chat(WELLAI_MODEL),
    system: WELLAI_SYSTEM_PROMPT,
    maxOutputTokens: WELLAI_MAX_TOKENS,
    // Lower temperature = the model picks higher-probability (more standard)
    // Thai words, which cuts down the odd, non-idiomatic phrasing that free
    // Western models drift into. Not too low, or the empathy turns robotic.
    temperature: 0.4,
    messages: messages as ModelMessage[],
    // Surface the real cause server-side. The SDK does NOT throw this into the
    // token stream — it ends the stream silently — so logging is the only way
    // to see a bad key / no credit / network failure.
    onError: ({ error }) => {
      console.error("[wellai] LLM error:", error);
    },
  });

  // Consume the stream ourselves. Because a failed call ends the stream with
  // zero tokens (silently), we treat "nothing emitted" as failure and send the
  // caring fallback with the hotline — a student who reached out must never get
  // a blank, broken bubble.
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let emitted = false;
      try {
        for await (const delta of result.textStream) {
          if (!delta) continue;
          emitted = true;
          controller.enqueue(encoder.encode(delta));
        }
      } catch (error) {
        console.error("[wellai] LLM stream error:", error);
      }
      if (!emitted) controller.enqueue(encoder.encode(FALLBACK_MESSAGE));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-WellAI-Type": "reply",
      "Cache-Control": "no-store",
    },
  });
}

function plainText(text: string, type: "crisis" | "unconfigured") {
  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-WellAI-Type": type,
      "Cache-Control": "no-store",
    },
  });
}
