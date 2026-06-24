'use client'

// Switch — bare-track-and-thumb binary toggle.
//
// Visuals come from CSS variables set by the consumer:
//   --switch-tint       main "on" colour (track when checked, thumb when off)
//   --switch-tint-soft  light variant (track when off, thumb when on)
//   --switch-border-off optional override (defaults to --switch-tint)
//   --switch-border-on  optional override (defaults to --switch-tint)
//
// Behaviour comes from React props. The component renders a button with
// `role="switch"` and `aria-checked`; the active scaleX(0.9) press is
// handled in CSS.
//
// Outer chrome (label, pill background, controls-bar mat fill, hover ring,
// etc.) is the consumer's job — this is the toggle artefact itself.
//
// Known consumers
//   • /all showcase tiles (Before/After, Clean/UI map, Interface/Icons).
//     Sets tint from `--sc-dotc` so the switch follows the tile's caption-
//     dot colour.
//   • /biconomy Flows audit (Before/After). Sets tint from the orange
//     palette; wraps the switch in `.flows__ba-pill` for its motion chrome.
//
// Don't introduce its own padding, border, or background — those belong
// to the consumer wrapper. Keeping this thin means the same primitive
// composes inside .sc-controls (subtle mat chip) and .flows__ba-pill
// (orange motion pill) without forking.

import type { CSSProperties } from 'react'

export interface SwitchProps {
  checked: boolean
  onCheckedChange: (next: boolean) => void
  /** Screen-reader label for the switch. */
  ariaLabel?: string
  /** Optional one-off className to extend visuals at the consumer. */
  className?: string
  /** Inline CSS variables — usually `--switch-tint` + `--switch-tint-soft`. */
  style?: CSSProperties
  /** When the switch needs to be present but inert (e.g. standby state). */
  disabled?: boolean
  /** Optional ID for label[for] association. */
  id?: string
}

export default function Switch({
  checked,
  onCheckedChange,
  ariaLabel,
  className,
  style,
  disabled,
  id,
}: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`switch${className ? ` ${className}` : ''}`}
      style={style}
    >
      <span className="switch__thumb" aria-hidden="true" />
    </button>
  )
}
