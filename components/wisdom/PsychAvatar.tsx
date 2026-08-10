import type { AvatarSpec } from "@/data/wisdom";

/**
 * A stylised, non-photographic portrait. Not a likeness or a photo — but the
 * features that most help you place each figure (bald crown vs. full head vs.
 * receding hairline, a big beard vs. a moustache, round wire vs. thick square
 * glasses) are drawn distinctly per person so the eight read as eight people.
 */
export function PsychAvatar({ spec, size = 88 }: { spec: AvatarSpec; size?: number }) {
  const { skin, hair, hairStyle, beard, glasses } = spec;
  const eyeY = 47;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" role="presentation">
      {/* shoulders + collar */}
      <path d="M24 99 Q50 73 76 99 Z" fill={skin} />
      <path d="M31 99 Q50 84 69 99 Z" fill="#dcd5c6" />

      {/* head + ears */}
      <circle cx="30" cy="49" r="4.5" fill={skin} />
      <circle cx="70" cy="49" r="4.5" fill={skin} />
      <ellipse cx="50" cy="47" rx="20" ry="23" fill={skin} />

      {/* full beard sits under the face, before the hair rim on the sides */}
      {beard === "full" && (
        <path d="M31 49 Q30 77 50 81 Q70 77 69 49 Q63 65 50 65 Q37 65 31 49 Z" fill={hair} />
      )}

      {/* hair — the main tell */}
      {hairStyle === "full" && (
        <path d="M29 50 Q27 23 50 22 Q73 23 71 50 Q70 33 50 32 Q30 33 29 50 Z" fill={hair} />
      )}
      {hairStyle === "sides" && (
        <>
          <path d="M30 45 Q29 32 35 28 Q32 41 34 53 Q30 50 30 45 Z" fill={hair} />
          <path d="M70 45 Q71 32 65 28 Q68 41 66 53 Q70 50 70 45 Z" fill={hair} />
        </>
      )}
      {hairStyle === "receding" && (
        <path d="M31 46 Q30 31 40 28 Q42 35 50 35 Q58 35 60 28 Q70 31 69 46 Q67 35 50 37 Q33 35 31 46 Z" fill={hair} />
      )}
      {hairStyle === "bob" && (
        <path d="M28 46 Q28 22 50 22 Q72 22 72 46 Q73 67 66 72 Q69 46 60 34 Q54 30 50 30 Q46 30 40 34 Q31 46 34 72 Q27 67 28 46 Z" fill={hair} />
      )}

      {/* subtle brows for a touch of age/character */}
      <path d={`M38 ${eyeY - 5} Q42 ${eyeY - 6.5} 46 ${eyeY - 5}`} fill="none" stroke={hair} strokeWidth="1.4" strokeLinecap="round" />
      <path d={`M54 ${eyeY - 5} Q58 ${eyeY - 6.5} 62 ${eyeY - 5}`} fill="none" stroke={hair} strokeWidth="1.4" strokeLinecap="round" />

      {/* eyes */}
      <circle cx="42" cy={eyeY} r="2.1" fill="#3a2e2e" />
      <circle cx="58" cy={eyeY} r="2.1" fill="#3a2e2e" />

      {/* glasses */}
      {glasses === "round" && (
        <g fill="none" stroke="#4a4038" strokeWidth="1.5">
          <circle cx="42" cy={eyeY} r="6.4" />
          <circle cx="58" cy={eyeY} r="6.4" />
          <line x1="48.4" y1={eyeY} x2="51.6" y2={eyeY} />
          <line x1="35.6" y1={eyeY - 1} x2="31.5" y2={eyeY - 2} />
          <line x1="64.4" y1={eyeY - 1} x2="68.5" y2={eyeY - 2} />
        </g>
      )}
      {glasses === "square" && (
        <g fill="none" stroke="#2c2620" strokeWidth="2.3" strokeLinejoin="round">
          <rect x="34.5" y={eyeY - 5} width="14" height="11" rx="2.5" />
          <rect x="51.5" y={eyeY - 5} width="14" height="11" rx="2.5" />
          <line x1="48.5" y1={eyeY - 1} x2="51.5" y2={eyeY - 1} />
        </g>
      )}

      {/* moustache */}
      {beard === "mustache" && (
        <path d="M40 56.5 Q45 55 50 58 Q55 55 60 56.5 Q55 60 50 59 Q45 60 40 56.5 Z" fill={hair} />
      )}

      {/* mouth */}
      <path d="M45 59 Q50 62 55 59" fill="none" stroke={beard === "full" ? "#7a4a3a" : "#a86a5a"} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default PsychAvatar;
