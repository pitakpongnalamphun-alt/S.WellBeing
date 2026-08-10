import type { PolicySection as Section } from "@/lib/consent/policy";

/**
 * One numbered clause. The numbers are not decoration — they are how the
 * source document is cited, so a counsellor and a student can point at the
 * same "ข้อ 4" and mean the same thing.
 */
export function PolicySection({ section }: { section: Section }) {
  return (
    <section className="border-t border-neutral-200 pt-5 first:border-t-0 first:pt-0">
      <h3 className="flex gap-2.5 text-[0.95rem] font-semibold text-ink">
        <span className="tabular-nums text-role-heading">
          {section.no}.
        </span>
        <span>{section.heading}</span>
      </h3>

      <ul className="mt-2.5 space-y-1.5 pl-[1.6rem]">
        {section.items.map((item) => (
          <li
            key={item}
            className="relative text-[0.88rem] leading-relaxed text-ink-soft before:absolute before:-left-4 before:text-ink-mute before:content-['•']"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
