'use client'

// LabelSticker — text-based sticker variant.
//
// Composes <Sticker> for the family contract (drop-shadow, hover lift,
// :active press, tilt, clickRotate). The inner art is a typeset label
// rather than a raster image. Adding a new label sticker means choosing
// a `shape` and `tone`, not authoring SVG.
//
// Why not author each label as raster art:
//   - Type lives in the system (Google Sans Flex, wide width axis), so
//     stickers stay legible at any zoom and don't bake font choices into
//     PNGs.
//   - Color/shape variants are cheap — swap a prop, not a file.
//   - The press/lift/shadow vocabulary is unchanged: <Sticker> wraps the
//     label and the family contract is inherited untouched.
//
// API (kept small on purpose):
//   children   the label text. All-caps via CSS, so pass natural casing
//              ("Engineers") and let the component shout.
//   shape      'pill'   — rounded plaque (FRANCINE / READERS reference)
//              'ticket' — horizontal ticket with dashed perforated inset
//                         (DUE DATE reference)
//   tone       'cream' | 'orange' | 'green' — two-tone preset (fill+ink).
//              Adding a tone = a new entry in label-sticker.css.
//   tilt       forwarded to <Sticker> as the per-instance rest rotation.
//   ...rest    Sticker forwards `as`, `clickRotate`, `jitter`, `aria-*`,
//              `className`, `style`, `href`, `onClick`. See Sticker.tsx.
//
// Anything route-specific (positioning, scaling, layered placement) stays
// in the consumer route's CSS — LabelSticker does not own placement.

import type { CSSProperties, ReactNode } from 'react'
import Sticker, { type StickerProps } from '../Sticker'
import './label-sticker.css'

export type LabelStickerShape = 'pill' | 'plaque' | 'ticket'
export type LabelStickerTone  = 'cream' | 'orange' | 'green'

type StickerForwarded = Omit<StickerProps, 'children' | 'className'>

export interface LabelStickerProps {
  children: ReactNode
  /**
   * pill   — capsule, fully rounded ends (max border-radius).
   * plaque — rounded rectangle with visible corners (FRANCINE / READERS reference).
   * ticket — horizontal tag with inset dashed perforation (DUE DATE reference).
   */
  shape?:   LabelStickerShape
  tone?:    LabelStickerTone
  className?: string
}

export default function LabelSticker({
  children,
  shape = 'pill',
  tone  = 'cream',
  className,
  ...stickerProps
}: LabelStickerProps & StickerForwarded) {
  const wrapperClass = ['label-sticker', className].filter(Boolean).join(' ')
  // `.t-h5` is the shared typography token for compact label voices —
  // wide axis, semibold, opsz 18. Applied to the face so the em-based
  // shape (padding/radius/border) scales off the same font-size.
  const innerClass = `label-sticker__face label-sticker__face--${shape} label-sticker__face--tone-${tone} t-h5`

  return (
    <Sticker {...(stickerProps as StickerProps)} className={wrapperClass}>
      <span className={innerClass} data-shape={shape}>
        <span className="label-sticker__text">{children}</span>
      </span>
    </Sticker>
  )
}

// Re-export for consumers that want to forward style/CSSProperties.
export type { CSSProperties }
