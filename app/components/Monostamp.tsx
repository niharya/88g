// Monostamp — small monospace stamp.
//
// Reusable annotation pill: monospace numerals or short tokens inside a
// shell with a hairline border. Tone colors the ink; appearance chooses
// between light and dark shells; active toggles between the muted default
// and the brighter "selected" state.
//
// Consumers drive interaction state — Monostamp itself is stateless and
// does not listen for hover. This keeps reciprocal-hover patterns (where
// a stamp brightens because something else was hovered) as simple as
// passing `active={isHovered}`.
//
// Variants
//   default — horizontal pill, fit-content, padding 3×6.
//   tall    — vertical stamp, fixed height 20, narrow padding — reads as a
//             single character on a vertically-oriented rectangle.
//
// Appearance
//   light   — paper-cream fill, neutral hairline border, tone-800 ink.
//             For light surfaces (mats, cards, paper).
//   dark    — tone-960 fill, tone-560 border + ink at rest. On active the
//             shell brightens to tone-800 and border + ink jump to tone-400
//             for a high-contrast pop against the brighter shell. For use
//             on dark artefacts (screenshots, frames).
//
// Known consumers
//   • /biconomy Flows note pointers (tone="olive" variant="tall" appearance="dark").
//   • Landing about-long discipline-year chips (tone="terra", default light).
//     The terra tone was added alongside this consumer.
//   • Landing contact-form success pill (neutral light + per-instance `style`
//     for the randomized sentColor) and error pill (neutral light + a
//     route-local className for orange ink + wide multi-line variant).
//   • /selected archive entry "opens in new tab" hint — migration pending;
//     see app/(works)/selected/ANOMALIES.md (blocked on missing per-entry
//     tones — connektion/aleyr/codezeros/ecochain — and a token-promotion
//     decision; not a duplicate of the pattern, an extension of it).
//
// Don't add color/border/background transitions to .monostamp.
//   An earlier pass transitioned color, border-color, and background-color on
//   the base rule. Re-renders driven by scroll springs, hover toggles, and
//   motion values restart the transition every paint; running CSS Animation
//   objects stack on the element and the `is-active` palette never applies —
//   the stamp stays locked on the rest-state color. The palette swap is
//   intentionally instant. Reintroducing a transition here will silently
//   break the active/rest flip on every dark-appearance consumer.

import type { CSSProperties, ReactNode } from 'react'

// Tones correspond 1:1 to color ramps in globals.css. When adding a new
// tone, also add the matching 560 / 720 / 800 / 960 tokens and the light
// + dark + is-active CSS rules so the tone works in both appearances.
export type MonostampTone = 'neutral' | 'mint' | 'olive' | 'yellow' | 'terra'

export type MonostampVariant = 'default' | 'tall'

export type MonostampAppearance = 'light' | 'dark'

export interface MonostampProps {
  children: ReactNode
  tone?: MonostampTone
  variant?: MonostampVariant
  appearance?: MonostampAppearance
  /** When true, the stamp brightens to its "selected" palette. */
  active?: boolean
  className?: string
  /** Inline style for one-off per-instance ink (e.g., the contact-form
      success pill's randomized `sentColor`). Prefer `tone` + className for
      anything reused. */
  style?: CSSProperties
  'aria-hidden'?: boolean
}

export default function Monostamp({
  children,
  tone = 'neutral',
  variant = 'default',
  appearance = 'light',
  active = false,
  className,
  ...rest
}: MonostampProps) {
  const classes = [
    'monostamp',
    `monostamp--${tone}`,
    `monostamp--${variant}`,
    `monostamp--${appearance}`,
    active ? 'is-active' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  )
}
