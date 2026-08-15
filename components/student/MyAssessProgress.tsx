"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardCheck, Minus, TrendingDown, TrendingUp } from "lucide-react";

import { mentalHealthAssessments } from "@/data/assessments";
import { ASSESS_ACTION_META } from "@/lib/store/useAssessmentStore";
import { useMyAssessStore, type MyAssessEntry } from "@/lib/store/useMyAssessStore";
import { useUserStore } from "@/lib/store/useUserStore";

/**
 * "พัฒนาการใจของฉัน" — เส้นทางผลประเมินของนักเรียนคนนี้คนเดียว
 *
 * ออกแบบเป็น "เส้นทาง" ไม่ใช่ "ตารางคะแนน": ขึ้นต้นด้วยประโยคสรุปที่เป็นมิตรก่อน
 * ให้เห็นตัวเลข เพราะเด็กที่กำลังเครียดเรื่องคะแนนอยู่แล้วไม่ควรเปิดหน้าหลักมาเจอ
 * อะไรที่หน้าตาเหมือนผลสอบ
 *
 * เทียบได้เฉพาะแบบเดียวกันเท่านั้น (คะแนน ST-5 เทียบกับ GAD-7 ไม่ได้) จึงจัดกลุ่ม
 * ตามแบบประเมิน — ทุกแบบในระบบ คะแนนต่ำลง = ดีขึ้น เส้นจึงลาดลงเมื่ออาการดีขึ้น
 */

/** จำนวนครั้งล่าสุดที่วาดบนกราฟ (ประวัติเก่ากว่านี้ยังนับในสรุป แต่ไม่วาด) */
const MAX_POINTS = 8;

/** คะแนนเต็มของแบบประเมิน = ผลรวมตัวเลือกที่คะแนนสูงสุดของทุกข้อ */
function maxScoreOf(assessmentId: string): number {
  const a = mentalHealthAssessments[assessmentId];
  if (!a) return 1;
  return Math.max(
    1,
    a.questions.reduce((sum, q) => sum + Math.max(...q.options.map((o) => o.score)), 0),
  );
}

/** "แบบคัดกรองภาวะซึมเศร้าเบื้องต้น (2Q)" → "ภาวะซึมเศร้าเบื้องต้น" ตัดคำนำหน้า/วงเล็บ */
function friendlyTitle(assessmentId: string): string {
  const t = mentalHealthAssessments[assessmentId]?.title ?? assessmentId;
  return t.replace(/\s*\(.*\)\s*$/, "").replace(/^แบบ(คัดกรอง|ประเมิน)/, "");
}

const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short" });

type Group = { id: string; list: MyAssessEntry[] };

/**
 * ประโยคเปิด — สิ่งแรกที่เด็กอ่านก่อนเห็นตัวเลขใด ๆ
 *
 * กติกาการเขียน: แนวโน้มที่แย่ลงต้องไม่ถูกเล่าเป็น "ความล้มเหลว" ของเด็ก
 * ให้ขอบคุณที่ยังกลับมาเช็คตัวเอง แล้วชี้ไปทางความช่วยเหลือ ไม่ใช่ตำหนิ
 */
function openingLine(groups: Group[]): { text: string; tone: "up" | "down" | "flat" | "new" } {
  const withHistory = groups.filter((g) => g.list.length >= 2);
  if (withHistory.length === 0) {
    return {
      tone: "new",
      text: "เริ่มบันทึกแล้วนะ — ทำอีกครั้งในอีกสักพัก แล้วจะเห็นว่าใจของเธอเปลี่ยนไปยังไง",
    };
  }
  // นับว่าแบบไหนดีขึ้น/แย่ลง แล้วสรุปภาพรวม (คะแนนต่ำลง = ดีขึ้น)
  let better = 0;
  let worse = 0;
  for (const g of withHistory) {
    const d = g.list[g.list.length - 1].score - g.list[0].score;
    if (d < 0) better += 1;
    else if (d > 0) worse += 1;
  }
  if (better > 0 && worse === 0) {
    return { tone: "down", text: "ใจของเธอเบาลงเรื่อย ๆ ในช่วงนี้ — ดูแลตัวเองได้ดีมากเลย 💚" };
  }
  if (worse > 0 && better === 0) {
    return {
      tone: "up",
      text: "ช่วงนี้ใจอาจกำลังแบกอะไรหนักอยู่ ขอบคุณที่ยังกลับมาเช็คตัวเองนะ — ไม่ต้องรับมือคนเดียวก็ได้",
    };
  }
  if (better > 0 && worse > 0) {
    return { tone: "flat", text: "บางเรื่องเบาลง บางเรื่องยังหนักอยู่ — ค่อย ๆ ดูแลไปด้วยกันนะ" };
  }
  return { tone: "flat", text: "ช่วงนี้ใจของเธอค่อนข้างคงที่ — กลับมาเช็คได้เรื่อย ๆ นะ" };
}

/**
 * สีของเส้นต้องตรงกับความจริงของแนวโน้ม — เส้นสีเขียวบนกราฟที่คะแนนพุ่งขึ้น
 * คือการโกหกด้วยภาพ ใช้ชุดสีเดียวกับป้ายสรุป (เขียว/เหลืองอำพัน/เทา)
 * เจตนาเลี่ยงสีแดง เพราะแนวโน้มที่แย่ลงคือสัญญาณให้ดูแล ไม่ใช่คำตัดสิน
 */
const TREND_STROKE = {
  better: "#4fc08d",
  worse: "#d97706",
  flat: "#94a3b8",
} as const;

/** กราฟเส้น: แกนตั้งคือคะแนน (สูง = หนักใจ) เส้นจึงลาดลงเมื่อดีขึ้น */
function TrendLine({
  points,
  max,
  stroke,
}: {
  points: MyAssessEntry[];
  max: number;
  stroke: string;
}) {
  const W = 300;
  const H = 76;
  const padX = 16;
  const padTop = 12;
  const padBottom = 20;
  const plotH = H - padTop - padBottom;

  const xs =
    points.length === 1
      ? [W / 2]
      : points.map((_, i) => padX + (i * (W - padX * 2)) / (points.length - 1));
  const ys = points.map((p) => padTop + (1 - Math.min(1, p.score / max)) * plotH);

  const path = xs.map((x, i) => `${x},${ys[i]}`).join(" ");
  const lastIdx = points.length - 1;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mt-2 w-full"
      style={{ height: H }}
      preserveAspectRatio="none"
      role="img"
      aria-label={`กราฟเส้นแสดงคะแนน ${points.length} ครั้ง ล่าสุด ${points[lastIdx].score} จาก ${max} คะแนน`}
    >
      {/* เส้นฐาน = คะแนน 0 (สบายใจที่สุด) ไว้ให้สายตาอ้างอิงว่าเส้นกำลังเข้าใกล้อะไร */}
      <line
        x1={padX - 6}
        y1={padTop + plotH}
        x2={W - padX + 6}
        y2={padTop + plotH}
        stroke="#e5e7eb"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      {points.length >= 2 && (
        <polyline
          points={path}
          fill="none"
          stroke={stroke}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
      {points.map((p, i) => {
        const isLast = i === lastIdx;
        return (
          <circle
            key={p.id}
            cx={xs[i]}
            cy={ys[i]}
            r={isLast ? 5.5 : 4}
            fill={ASSESS_ACTION_META[p.action].bar}
            stroke="#ffffff"
            strokeWidth={isLast ? 2 : 1.5}
          />
        );
      })}
    </svg>
  );
}

export function MyAssessProgress() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const allEntries = useMyAssessStore((s) => s.entries);
  const profile = useUserStore((s) => s.profile);

  // เครื่องใช้ร่วมกันได้ — แสดงเฉพาะประวัติของคนที่ล็อกอินอยู่เท่านั้น
  const entries = useMemo(
    () => allEntries.filter((e) => e.owner && e.owner === profile?.studentId),
    [allEntries, profile?.studentId],
  );

  // จัดกลุ่มตามแบบประเมิน เรียงกลุ่มตามครั้งล่าสุด — ในกลุ่มเรียงเก่า→ใหม่ไว้วาดกราฟ
  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, MyAssessEntry[]>();
    for (const e of entries) {
      map.set(e.assessmentId, [...(map.get(e.assessmentId) ?? []), e]);
    }
    return [...map.entries()]
      .map(([id, list]) => ({
        id,
        list: [...list].sort((a, b) => a.at.localeCompare(b.at)),
      }))
      .sort((a, b) => b.list[b.list.length - 1].at.localeCompare(a.list[a.list.length - 1].at));
  }, [entries]);

  const opening = useMemo(() => openingLine(groups), [groups]);

  if (!mounted) return null;

  // ยังไม่เคยประเมิน = ไม่ต้องขึ้นอะไร ไทล์ "เช็คสุขภาพใจ" ในกริดด้านบนชวนไปแล้ว
  if (groups.length === 0) return null;

  return (
    <section className="mt-3.5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200/80">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-[0.95rem] font-bold text-ink">พัฒนาการใจของฉัน</h2>
        <Link href="/assessment" className="text-[0.72rem] font-medium text-mint-700 hover:underline">
          เช็คอีกครั้ง
        </Link>
      </div>

      {/* ประโยคเปิด — อ่านก่อนเห็นตัวเลขเสมอ */}
      <p
        className={[
          "mt-2.5 rounded-xl px-3 py-2.5 text-[0.82rem] font-medium leading-relaxed",
          opening.tone === "down"
            ? "bg-mint-50 text-mint-700"
            : opening.tone === "up"
              ? "bg-lavender-50 text-lavender-700"
              : "bg-neutral-50 text-ink-soft",
        ].join(" ")}
      >
        {opening.text}
      </p>

      <div className="mt-3 flex flex-col gap-5">
        {groups.map(({ id, list }) => {
          const max = maxScoreOf(id);
          const shown = list.slice(-MAX_POINTS);
          const first = list[0];
          const last = list[list.length - 1];
          const delta = last.score - first.score;
          const lastMeta = ASSESS_ACTION_META[last.action];

          return (
            <div key={id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[0.82rem] font-semibold text-ink">
                  {friendlyTitle(id)} <span className="font-normal text-ink-mute">({id})</span>
                </p>
                {list.length >= 2 ? (
                  <span
                    className={[
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold ring-1",
                      delta < 0
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : delta > 0
                          ? "bg-amber-50 text-amber-700 ring-amber-200"
                          : "bg-slate-100 text-slate-500 ring-slate-200",
                    ].join(" ")}
                  >
                    {delta < 0 ? (
                      <TrendingDown className="size-3" aria-hidden="true" />
                    ) : delta > 0 ? (
                      <TrendingUp className="size-3" aria-hidden="true" />
                    ) : (
                      <Minus className="size-3" aria-hidden="true" />
                    )}
                    ครั้งแรก {first.score} → ล่าสุด {last.score}{" "}
                    {delta < 0 ? "(ดีขึ้น)" : delta > 0 ? "(ควรดูแลต่อ)" : "(คงที่)"}
                  </span>
                ) : (
                  <span className="text-[0.68rem] text-ink-mute">
                    ทำอีกครั้งภายหลังเพื่อเห็นพัฒนาการ
                  </span>
                )}
              </div>

              <TrendLine
                points={shown}
                max={max}
                stroke={
                  delta < 0
                    ? TREND_STROKE.better
                    : delta > 0
                      ? TREND_STROKE.worse
                      : TREND_STROKE.flat
                }
              />

              {/* วันที่กำกับใต้กราฟ — วางนอก SVG เพื่อให้ฟอนต์ไทยไม่ถูกยืดตาม preserveAspectRatio */}
              <div className="flex justify-between px-1 text-[0.6rem] text-ink-mute">
                {shown.length === 1 ? (
                  <span className="mx-auto">{fmtDay(shown[0].at)}</span>
                ) : (
                  <>
                    <span>{fmtDay(shown[0].at)}</span>
                    <span>{fmtDay(shown[shown.length - 1].at)}</span>
                  </>
                )}
              </div>

              <p className="mt-1.5 text-[0.68rem] text-ink-mute">
                ล่าสุด:{" "}
                <span className="font-semibold" style={{ color: lastMeta.bar }}>
                  {lastMeta.label}
                </span>
                {" · "}
                {last.score}/{max} คะแนน · เส้นลาดลง = ใจเบาลง
                {list.length > MAX_POINTS &&
                  ` · กราฟแสดง ${MAX_POINTS} ครั้งล่าสุด (จากทั้งหมด ${list.length})`}
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-3 border-t border-neutral-100 pt-2.5 text-[0.66rem] leading-relaxed text-ink-mute">
        🔒 ประวัตินี้เก็บอยู่ในเครื่องของคุณเท่านั้น ครูจะเห็นผลก็ต่อเมื่อคุณกดยินยอมส่งต่อจากหน้าผลประเมิน
      </p>
    </section>
  );
}

export default MyAssessProgress;
