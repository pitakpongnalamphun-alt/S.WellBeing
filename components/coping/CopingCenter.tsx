"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CircleSlash,
  Clock3,
  Phone,
} from "lucide-react";

import { References } from "@/components/shared/References";
import {
  BULLY_TRIAGE,
  CENTRE_META,
  COPING_GUIDES,
  EVIDENCE_LABEL,
  GUIDE_BY_ID,
  guidesOf,
  type Centre,
  type Guide,
} from "@/data/copingGuides";

import { GroundingWalk } from "./GroundingWalk";
import { ReframeWalk } from "./ReframeWalk";

/**
 * คลังวิธีรับมือ — หน้ารวมสองศูนย์ และหน้ารายละเอียดของแต่ละวิธี
 *
 * รับพารามิเตอร์จาก URL ได้สองตัว เพื่อให้ที่อื่นในแอปลิงก์ตรงมาที่วิธีที่ตรงกับ
 * สถานการณ์ได้ เช่น ฟอร์มแจ้งเหตุที่รู้อยู่แล้วว่าเด็กเลือกหัวข้อย่อยอะไรไว้
 *   ?c=stress        เปิดค้างที่ศูนย์นั้น
 *   ?g=grounding-54321  เปิดวิธีนั้นเลย
 */

/* ------------------------------------------------------ การ์ดในหน้ารวม */

function GuideCard({ guide, onOpen }: { guide: Guide; onOpen: (id: string) => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(guide.id)}
        className="flex w-full items-center gap-3.5 rounded-2xl bg-white p-3.5 text-left shadow-sm ring-1 ring-neutral-200/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-panel/60 text-[1.35rem]" aria-hidden="true">
          {guide.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.9rem] font-bold leading-snug text-ink">
            {guide.title}
          </span>
          <span className="mt-0.5 block text-[0.74rem] leading-snug text-ink-soft">
            {guide.tagline}
          </span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-ink-mute" aria-hidden="true" />
      </button>
    </li>
  );
}

/* --------------------------------------------------------- ตัวอ่านขั้นตอน */

/**
 * อ่านทีละขั้น แทนการเทขั้นตอนทั้งหมดลงหน้าเดียว
 *
 * ขั้นตอนสี่ถึงห้าข้อที่ขึ้นพร้อมกันเป็นกำแพงตัวหนังสือ คนที่เพิ่งโดนมาสิบนาทีที่แล้ว
 * เห็นแล้วปิดทิ้งก่อนได้อ่านบรรทัดแรกด้วยซ้ำ ทีละขั้นทำให้แต่ละหน้าจอมีของอ่านชิ้นเดียว
 * และเห็นว่าเหลืออีกไม่กี่ขั้นก็จบ
 *
 * ยังมีปุ่มดูรวดเดียวไว้ให้ เพราะบางคนอยากกวาดตาดูทั้งหมดก่อนตัดสินใจอ่าน และครูที่
 * เปิดดูเพื่อเตรียมสอนก็ต้องการมุมมองนั้น
 */
function StepReader({ steps }: { steps: Guide["steps"] }) {
  const [i, setI] = useState(0);
  const [all, setAll] = useState(false);
  const step = steps[Math.min(i, steps.length - 1)];

  const Body = ({ s, n }: { s: Guide["steps"][number]; n: number }) => (
    <>
      <div className="flex items-start gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-mint-100 text-[0.82rem] font-bold text-mint-800">
          {s.badge ?? n}
        </span>
        <p className="mt-0.5 text-[1.02rem] font-bold leading-snug text-ink">{s.title}</p>
      </div>
      {/* ตัวหนังสือใหญ่ขึ้นและบรรทัดห่างขึ้นกว่าเดิม ภาษาไทยมีสระบนล่าง
          ระยะบรรทัดที่พอดีกับภาษาอังกฤษจะแน่นเกินไปสำหรับไทยเสมอ */}
      <p className="mt-2.5 text-[0.94rem] leading-[2] text-ink-soft">{s.body}</p>
      {s.caution ? (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-[0.86rem] leading-[1.9] text-amber-900">
          <AlertTriangle className="mt-1 size-4 shrink-0 text-amber-500" aria-hidden="true" />
          {s.caution}
        </p>
      ) : null}
    </>
  );

  if (all) {
    return (
      <div className="mt-5">
        <ol className="space-y-3">
          {steps.map((s, n) => (
            <li key={s.title} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200/80">
              <Body s={s} n={n + 1} />
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => setAll(false)}
          className="mt-3 block w-full rounded-xl py-2 text-[0.82rem] text-ink-mute transition-colors hover:text-ink"
        >
          กลับไปอ่านทีละขั้น
        </button>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200/80">
        <Body s={step} n={i + 1} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setI((v) => Math.max(0, v - 1))}
          disabled={i === 0}
          className="min-h-11 rounded-full px-3 text-[0.84rem] text-ink-soft transition-colors hover:text-ink disabled:opacity-30"
        >
          ก่อนหน้า
        </button>

        <span className="flex flex-1 items-center justify-center gap-1.5" aria-hidden="true">
          {steps.map((s, n) => (
            <span
              key={s.title}
              className={`h-1.5 rounded-full transition-all ${
                n === i ? "w-5 bg-mint-600" : "w-1.5 bg-neutral-300"
              }`}
            />
          ))}
        </span>

        {i < steps.length - 1 ? (
          <button
            type="button"
            onClick={() => setI((v) => v + 1)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-mint-700 px-4 text-[0.84rem] font-semibold text-white transition-colors hover:bg-mint-600"
          >
            ถัดไป
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        ) : (
          <span className="min-h-11 px-3 text-[0.84rem] font-medium text-mint-700">
            อ่านครบแล้ว
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => setAll(true)}
        className="mt-1 block w-full rounded-xl py-2 text-[0.8rem] text-ink-mute transition-colors hover:text-ink"
      >
        ดูทั้ง {steps.length} ขั้นรวดเดียว
      </button>
    </div>
  );
}

/* ------------------------------------------------------- หน้ารายละเอียด */

function GuideDetail({ guide, onBack }: { guide: Guide; onBack: () => void }) {
  return (
    // pb-24 กันไม่ให้แถบเมนูล่างทับบรรทัดสุดท้าย — บรรทัดสุดท้ายคือแหล่งอ้างอิง
    // และการ์ดที่มีขั้นตอนน้อยจะจบพอดีใต้แถบเมนูจนอ้างอิงหายไปทั้งบรรทัด
    <article className="pb-24">
      <button
        type="button"
        onClick={onBack}
        className="-ml-2.5 mb-2 inline-flex min-h-11 items-center gap-1 rounded-xl px-2.5 text-[0.82rem] text-ink-soft transition-colors hover:text-ink"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        คลังวิธีรับมือ
      </button>

      <header>
        <span className="text-[2rem] leading-none" aria-hidden="true">
          {guide.emoji}
        </span>
        <h1 className="font-display th:leading-snug mt-1 text-[1.3rem] font-bold text-ink">
          {guide.title}
        </h1>
        <p className="mt-1 text-[0.8rem] text-ink-mute">{guide.techniqueName}</p>
      </header>

      {/* ใช้ตอนไหน / ไม่ใช้ตอนไหน — ขึ้นก่อนขั้นตอน เพราะคนที่หยิบวิธีผิดมาใช้
          จะเสียหายกว่าคนที่ยังไม่ได้เริ่ม */}
      <div className="mt-4 space-y-2">
        <p className="flex items-start gap-2 rounded-xl bg-panel/50 p-3.5 text-[0.88rem] leading-[1.9] text-ink-soft">
          <Clock3 className="mt-0.5 size-4 shrink-0 text-ink-mute" aria-hidden="true" />
          <span>
            <span className="font-semibold text-ink">ใช้ตอน</span> {guide.when}
          </span>
        </p>
        {guide.notFor ? (
          <p className="flex items-start gap-2 rounded-xl bg-rose-50 p-3.5 text-[0.88rem] leading-[1.9] text-rose-900 ring-1 ring-rose-200/70">
            <CircleSlash className="mt-0.5 size-4 shrink-0 text-rose-500" aria-hidden="true" />
            <span>
              <span className="font-semibold">ไม่ใช้ตอน</span> {guide.notFor}
            </span>
          </p>
        ) : null}
      </div>

      {/* โหมดพาทำ อยู่ก่อนขั้นตอนที่เป็นตัวหนังสือ เพราะคนที่กำลังแย่ต้องการเริ่มทำ
          มากกว่าต้องการอ่าน */}
      {guide.practice ? (
        <div className="mt-5">
          {guide.practice === "grounding" ? <GroundingWalk /> : null}
          {guide.practice === "reframe" ? <ReframeWalk /> : null}
        </div>
      ) : null}

      <StepReader steps={guide.steps} />

      {guide.action ? (
        <Link
          href={guide.action.href}
          className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-mint-700 text-[0.9rem] font-semibold text-white transition-colors hover:bg-mint-600 active:translate-y-px"
        >
          {guide.action.label}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      ) : null}

      {/* ความหนักของหลักฐาน — บอกตรง ๆ ว่าวิธีนี้ยืนอยู่บนอะไร */}
      <div className="mt-5 rounded-2xl bg-panel/40 p-3.5">
        <p className="text-[0.74rem] font-semibold text-ink">
          หลักฐานหนักแค่ไหน · {EVIDENCE_LABEL[guide.evidence]}
        </p>
        <p className="mt-1 text-[0.78rem] leading-relaxed text-ink-soft">
          {guide.evidenceNote}
        </p>
      </div>

      <References
        items={guide.references}
        className="mt-5 border-t border-line pt-3"
      />
    </article>
  );
}

/* ------------------------------------------------------------ ตัวหน้าจอ */

export function CopingCenter() {
  const params = useSearchParams();
  const [openId, setOpenId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // ค่าจาก URL อ่านหลัง mount เพื่อให้ HTML ที่เรนเดอร์จากเซิร์ฟเวอร์ตรงกับรอบแรก
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const g = params.get("g");
    if (g && GUIDE_BY_ID[g]) setOpenId(g);
  }, [params]);

  const centreFilter = params.get("c") as Centre | null;
  const centres = useMemo<Centre[]>(
    () =>
      centreFilter === "bullying" || centreFilter === "stress"
        ? [centreFilter]
        : ["bullying", "stress"],
    [centreFilter],
  );

  const open = openId ? GUIDE_BY_ID[openId] : null;
  if (mounted && open) {
    return <GuideDetail guide={open} onBack={() => setOpenId(null)} />;
  }

  return (
    <div className="space-y-6 pb-24">
      <header className="pt-1">
        <h1 className="font-display th:leading-snug text-[1.42rem] font-bold text-ink">
          คลังวิธีรับมือ
        </h1>
        <p className="mt-1 text-[0.84rem] leading-relaxed text-ink-soft">
          {COPING_GUIDES.length} วิธีที่ทำตามได้ทันที พร้อมบอกว่าแต่ละวิธีใช้ตอนไหน และไม่ใช้ตอนไหน
        </p>
      </header>

      {centres.map((c) => {
        const meta = CENTRE_META[c];
        return (
          <section key={c}>
            <h2 className="flex items-center gap-2 text-[0.98rem] font-bold text-ink">
              <span aria-hidden="true">{meta.emoji}</span>
              {meta.label}
            </h2>
            <p className="mt-0.5 text-[0.76rem] text-ink-soft">{meta.blurb}</p>

            {/* ประตูของหมวดกลั่นแกล้งไม่ใช่สารบัญ แต่เป็นคำถามข้อเดียว
                คนที่เพิ่งโดนมาไม่อยู่ในสภาพที่จะอ่านหัวข้อหกอันแล้วเดาว่าอันไหนคือของตัวเอง */}
            {c === "bullying" ? (
              <div className="mt-3 rounded-2xl bg-sky-50/70 p-3.5 ring-1 ring-sky-200/60">
                <p className="text-[0.9rem] font-bold text-ink">ตอนนี้เธออยู่ตรงไหน</p>
                <p className="mt-0.5 text-[0.76rem] text-ink-soft">แตะข้อที่ใกล้ที่สุด</p>
                <ul className="mt-2.5 space-y-1.5">
                  {BULLY_TRIAGE.map((t) => (
                    <li key={t.guideId}>
                      <button
                        type="button"
                        onClick={() => setOpenId(t.guideId)}
                        className="flex w-full items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 text-left ring-1 ring-sky-100 transition active:scale-[0.99]"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-[0.88rem] font-semibold leading-snug text-ink">
                            {t.label}
                          </span>
                          <span className="mt-0.5 block text-[0.74rem] leading-snug text-ink-mute">
                            {t.hint}
                          </span>
                        </span>
                        <ChevronRight className="size-4 shrink-0 text-sky-400" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <ul className="mt-3 space-y-2.5">
              {guidesOf(c).map((g) => (
                <GuideCard key={g.id} guide={g} onOpen={setOpenId} />
              ))}
            </ul>
          </section>
        );
      })}

      {/* ทางออกสำหรับคนที่อ่านมาถึงตรงนี้แล้วยังไม่ไหว — ไม่ให้หน้านี้เป็นทางตัน */}
      <section className="rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-200/70">
        <p className="text-[0.88rem] font-bold text-rose-900">
          ถ้าตอนนี้ยังไม่ไหวจริง ๆ
        </p>
        <p className="mt-1 text-[0.8rem] leading-relaxed text-rose-900/80">
          ไม่ต้องอ่านให้จบก็ได้ คุยกับคนได้เลย สายด่วนสุขภาพจิต 1323 โทรฟรีตลอด 24 ชั่วโมง
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href="tel:1323"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-rose-600 px-4 text-[0.84rem] font-semibold text-white transition-colors hover:bg-rose-500"
          >
            <Phone className="size-4" aria-hidden="true" />
            โทร 1323
          </a>
          <Link
            href="/chatbot"
            className="inline-flex min-h-11 items-center rounded-full bg-white px-4 text-[0.84rem] font-semibold text-rose-700 ring-1 ring-rose-200 transition-colors hover:bg-rose-50"
          >
            คุยกับน้องอุ่นก่อน
          </Link>
        </div>
      </section>
    </div>
  );
}
