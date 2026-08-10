type CardBackdropProps = {
  /** Distinct shape seeds per card, so the two never look like the same photo. */
  variant: "student" | "admin";
};

/**
 * The out-of-focus photograph behind a role card, drawn rather than loaded.
 * A real image would be a network request, a layout shift, and a licence to
 * track; heavily blurred shapes read the same way at this scale and cost none
 * of that. The gradient overlay sits above this in RoleCard.
 */
export function CardBackdrop({ variant }: CardBackdropProps) {
  const id = `backdrop-${variant}`;

  return (
    <svg
      viewBox="0 0 400 200"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id={`${id}-blur`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
      </defs>

      {variant === "student" ? (
        // Open, rising shapes — a courtyard at midday.
        <g filter={`url(#${id}-blur)`}>
          <rect width="400" height="200" fill="#2f9e6a" />
          <circle cx="86" cy="46" r="76" fill="#8fd9ae" opacity="0.9" />
          <circle cx="292" cy="150" r="96" fill="#14663f" opacity="0.85" />
          <ellipse cx="330" cy="34" rx="90" ry="54" fill="#bfeacf" opacity="0.7" />
          <ellipse cx="150" cy="186" rx="120" ry="52" fill="#0f5433" opacity="0.6" />
        </g>
      ) : (
        // Denser, lower shapes — a room after hours.
        <g filter={`url(#${id}-blur)`}>
          <rect width="400" height="200" fill="#24467f" />
          <circle cx="322" cy="52" r="84" fill="#5b86d6" opacity="0.85" />
          <circle cx="92" cy="158" r="92" fill="#12244a" opacity="0.9" />
          <ellipse cx="196" cy="18" rx="110" ry="46" fill="#93b4ee" opacity="0.55" />
          <ellipse cx="360" cy="190" rx="104" ry="56" fill="#0c1830" opacity="0.7" />
        </g>
      )}
    </svg>
  );
}
