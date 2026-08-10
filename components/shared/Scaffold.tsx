import { Hammer } from "lucide-react";

import { Card } from "@/components/ui/Card";

/**
 * An honest placeholder. It states what the screen will do and what is missing,
 * rather than showing fake data that reads as a working feature — a demo that
 * pretends to work is worse than one that admits it doesn't.
 */
export function Scaffold({
  what,
  needs,
}: {
  what: string;
  /** The concrete pieces still to build. */
  needs: string[];
}) {
  return (
    <Card className="mt-4 p-5">
      <span className="flex size-10 items-center justify-center rounded-xl bg-neutral-100">
        <Hammer className="size-5 text-ink-mute" aria-hidden="true" />
      </span>

      <p className="mt-3.5 text-[0.9rem] leading-relaxed text-ink">{what}</p>

      <p className="mt-4 text-[0.75rem] font-medium uppercase tracking-[0.1em] text-ink-mute">
        ยังต้องทำ
      </p>
      <ul className="mt-2 space-y-1.5">
        {needs.map((need) => (
          <li
            key={need}
            className="relative pl-4 text-[0.84rem] leading-relaxed text-ink-soft before:absolute before:left-0 before:text-ink-mute before:content-['•']"
          >
            {need}
          </li>
        ))}
      </ul>
    </Card>
  );
}
