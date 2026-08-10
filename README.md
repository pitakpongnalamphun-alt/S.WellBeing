# S.WELL-BEING — Login

Next.js 15 · React 19 · Tailwind CSS v4 · TypeScript

```bash
npm install
npm run dev
```

Then open <http://localhost:3000> — `/` redirects to `/login`.

| Script | |
|---|---|
| `npm run dev` | dev server |
| `npm run build` | production build |
| `npm run start` | serve the build |
| `npm run typecheck` | types only, no emit |

## Structure

```
app/
  globals.css              design tokens + base layer — the only place colour is defined
  layout.tsx               font loading (Latin + Thai), metadata
  login/page.tsx           route; wraps the screen in LanguageProvider
  select-role/page.tsx     role selection, shown once sign-in succeeds
components/
  login/
    LoginScreen.tsx        card shell + footer
    BrandPanel.tsx         left: logo, headline, illustration, note
    LoginForm.tsx          right: fields, submit, social, sign-up
    LanguageSwitcher.tsx   EN/TH listbox
    SocialAuthButtons.tsx  Google + Apple
  roles/
    RoleSelectionScreen.tsx  header, values, prompt, the two cards
    CoreValues.tsx           safe / cared for / connected
    RoleCard.tsx             one role as a single link
    CardBackdrop.tsx         the blurred "photograph" behind each card
  consent/
    ConsentScreen.tsx        the PDPA gate — policy, progress, consent
    PolicySection.tsx        one numbered clause
    DeclinedNotice.tsx       what happens if you say no
    ConsentGuard.tsx         blocks any page that handles personal data
    ConsentReceipt.tsx       placeholder destination + withdrawal
lib/
  consent/policy.ts          the policy text, versioned, TH + EN
  consent/record.ts          what was consented to, and when
  roles.ts                   role names and their destinations
  illustration/
    SerenityScene.tsx      the landscape; scene geometry and blob placement
    EmotionBlob.tsx        one character: body path + five face variants
  ui/
    TextField.tsx          labelled input with error wiring
    PrimaryButton.tsx      submit with loading state
  icons/index.tsx          one 24×24 stroke system + third-party marks
lib/
  i18n/dictionaries.ts     all copy, EN + TH, one shared type
  i18n/LanguageProvider.tsx
  validation.ts            credential rules
```

## Design decisions

**Type.** Fraunces for display — a soft serif with an optical-size axis, set to
`SOFT 40, WONK 0, opsz 48` so it stays warm instead of brittle. DM Sans for the
interface. Thai gets its own pair (Noto Serif Thai / Noto Sans Thai) plus a `th:`
Tailwind variant for line-height, because Thai stacks vowel and tone marks above
and below the baseline and a Latin-tuned leading crowds them.

**Colour.** Every value lives in the `@theme` block in `app/globals.css`.
Nothing downstream hard-codes a colour, including the illustration — the five
emotion hues are read straight from the tokens, so the art re-skins with the UI.

**The illustration.** Drawn in SVG rather than shipped as an image: it re-colours
with the tokens, stays sharp at any size, and costs no extra request. The scene
is bottom-anchored with `preserveAspectRatio="xMidYMax slice"`, and its slot uses
a container query (`min-h-[min(78cqw,560px)]`) so the slot keeps the scene's own
600:470 aspect at every breakpoint. Verified: the fit crops ~2 scene units of
sky at 390 / 820 / 1024 / 1440 px, and never the sun or the characters.

**The characters.** They breathe on a stagger, and hovering one names the
feeling in the current language. That is the product's thesis — a better you
starts with understanding your feelings — made literal, and it is the only
place the page spends any boldness.

## Accessibility

- Errors wired through `aria-describedby` and `role="alert"`; submit moves focus to the first invalid field
- Password toggle is a labelled `aria-pressed` button; the field keeps `autocomplete="current-password"`
- Language menu is a `listbox`, closes on outside click and `Escape`, and updates `<html lang>`
- All interactive targets ≥ 24 px (WCAG 2.5.8)
- `prefers-reduced-motion` disables the breathing and page-load motion

## Role selection

`/select-role` is where a signed-in person picks Student or Administrator.
It sits on white per spec, rather than the warm canvas the rest of the product
uses — it is a doorway, not a room.

Each card is a single link rather than a card with a button inside it: there is
exactly one thing to do, and a full-width target is the most forgiving way to
offer it. The arrow is decorative; the card's `aria-label` carries the action.

The "photograph" behind each card is drawn in `CardBackdrop.tsx` — blurred SVG
shapes, not an image file. At this scale and blur radius a real photo would read
the same, while costing a request, a layout shift, and a third-party asset to
license. The gradient over it is lighter at the top-left so the texture shows.

**The green is at its accessibility limit.** `--color-card-student-from` is the
lightest green for which the faintest text on the card (the white/75 sub-label)
still clears 4.5:1, measured against the actual composited pixel rather than the
token value. Lightening it fails AA. Verified: white 6.84:1, white/85 5.45:1,
white/80 5.05:1, white/75 4.64:1.

## PDPA consent

`login → select-role → consent?role=… → student|admin`

Mental health data is sensitive personal data under PDPA s.26, which needs
**explicit** consent — so the screen is built around proving the person actually
had the chance to give it, not around getting them past a dialog:

- **Reading is tracked.** A progress rail fills as the policy scrolls, and
  accept stays blocked until the end is reached. The rail is the one visible
  mechanism on the screen because it is the thing standing between a person and
  a legal commitment.
- **Consent is a separate act.** Ticking the box is not the same gesture as
  pressing the button, and both are required.
- **Declining is a real option**, with its own screen that states plainly what
  was and was not collected, and two ways forward.
- **The record is specific:** policy version, role, UTC timestamp, and the
  locale the policy was displayed in. "The user clicked yes" is not a record.
- **Withdrawal is on the destination page**, not buried — s.19 requires it to be
  as easy as giving consent was.
- **Accept uses `aria-disabled`, not `disabled`.** A disabled button cannot be
  focused, so a screen-reader user never learns why it does nothing. Here it
  stays reachable and explains itself through a live region.

`POLICY_VERSION` in `lib/consent/policy.ts` invalidates old records: bump it on
any substantive change and everyone is asked again.

### Before this handles real students

Consent is written to `localStorage`. That is a stand-in so the flow runs end to
end — it is per-device, clearable by the very person it is meant to bind, and
invisible to any audit. **PDPA puts the burden of proving consent on the
controller, so this must move server-side**, and `ConsentGuard` must become a
middleware check rather than a client-side courtesy.

Two things the supplied policy text does not cover, both of which need a
decision before launch:

1. **Guardian consent.** Under PDPA s.20, consent from a minor may require a
   parent or guardian. This is a school system; the policy is silent on it.
2. **Retention.** The policy says how data is kept safe but not how long it is
   kept, which s.37 expects to be stated.

## Wiring it up

`signIn()` in `components/login/LoginForm.tsx` is a stub that resolves after a
delay. Replace its body with the real call — the form does not care what the
transport is. On success it pushes to `/select-role`.

Still placeholders: the social handlers, and the `/forgot-password`, `/signup`,
`/student`, and `/admin` routes. Role choice is not persisted — wire the cards
to your session once those routes exist.
