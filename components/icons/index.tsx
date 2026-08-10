import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/**
 * One stroke system for the whole product: 24×24 box, 1.6 stroke, round caps,
 * currentColor. Brand-owned marks (Google, Apple) keep their own fills.
 */
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <g {...stroke}>{children}</g>
    </svg>
  );
}

/* -- Brand ----------------------------------------------------------------- */

/**
 * Four petals around a shared centre — one for each direction a feeling can
 * pull you, meeting in the middle. Used as the app mark.
 */
export function BrandMark(props: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      {...props}
    >
      <circle cx="20" cy="14.4" r="6.6" />
      <circle cx="20" cy="25.6" r="6.6" />
      <circle cx="14.4" cy="20" r="6.6" />
      <circle cx="25.6" cy="20" r="6.6" />
    </svg>
  );
}

/* -- Form ------------------------------------------------------------------ */

export function MailIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2.75" y="5" width="18.5" height="14" rx="3" />
      <path d="m3.5 7.5 7.35 5.06a2 2 0 0 0 2.3 0L20.5 7.5" />
    </Icon>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4.25" y="10.25" width="15.5" height="10.5" rx="3" />
      <path d="M8 10.25V7.5a4 4 0 1 1 8 0v2.75" />
      <path d="M12 14.5v2" />
    </Icon>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.5 12S6 5.75 12 5.75 21.5 12 21.5 12 18 18.25 12 18.25 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9.9 5.98A9.6 9.6 0 0 1 12 5.75c6 0 9.5 6.25 9.5 6.25a17 17 0 0 1-2.72 3.5" />
      <path d="M6.4 7.9A16.7 16.7 0 0 0 2.5 12s3.5 6.25 9.5 6.25a9.3 9.3 0 0 0 4.02-.9" />
      <path d="M10.1 10.1a2.7 2.7 0 0 0 3.8 3.8" />
      <path d="m3.5 3.5 17 17" />
    </Icon>
  );
}

/* -- Chrome ---------------------------------------------------------------- */

export function GlobeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.75" />
      <path d="M3.4 12h17.2" />
      <path d="M12 3.25c2.2 2.35 3.4 5.46 3.4 8.75s-1.2 6.4-3.4 8.75c-2.2-2.35-3.4-5.46-3.4-8.75S9.8 5.6 12 3.25Z" />
    </Icon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />
    </Icon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 12h15" />
      <path d="m13.5 6 6 6-6 6" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Icon>
  );
}

/** An open book — the daily journal the product is built around. */
export function OpenBookIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 7.4v12.1" />
      <path d="M12 7.4C10.6 6.1 8.7 5.4 6.4 5.4H3.6v12.1h2.8c2.3 0 4.2.7 5.6 2" />
      <path d="M12 7.4c1.4-1.3 3.3-2 5.6-2h2.8v12.1h-2.8c-2.3 0-4.2.7-5.6 2" />
    </Icon>
  );
}

export function SpinnerIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      {...props}
    >
      <circle cx="12" cy="12" r="9" opacity={0.25} />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  );
}

/* -- Third-party marks (fixed brand colours, do not restyle) ---------------- */

export function GoogleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.87c2.26-2.09 3.57-5.17 3.57-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.88-3.01c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.28v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.28a7.17 7.17 0 0 1 0-4.56v-3.1H1.28a12 12 0 0 0 0 10.77l4-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.2 15.24 0 12 0A12 12 0 0 0 1.28 6.62l4 3.1C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

export function AppleIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
      {...props}
    >
      <path d="M17.05 12.72c.02 2.4 2.1 3.2 2.12 3.21-.02.06-.33 1.14-1.1 2.26-.66.97-1.35 1.93-2.44 1.95-1.07.02-1.41-.63-2.63-.63-1.22 0-1.6.61-2.61.65-1.05.04-1.85-1.04-2.51-2-1.36-1.97-2.4-5.57-1-8 .69-1.2 1.93-1.97 3.28-1.99 1.03-.02 2 .69 2.63.69.63 0 1.81-.86 3.05-.73.52.02 1.98.21 2.92 1.58-.08.05-1.74 1.02-1.72 3.04M15.1 4.4c.56-.68.94-1.62.83-2.56-.81.03-1.79.54-2.36 1.21-.51.6-.96 1.56-.84 2.48.9.07 1.82-.46 2.38-1.13" />
    </svg>
  );
}
