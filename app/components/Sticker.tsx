// Sticker — shared presentation wrapper for the portfolio's "fun play"
// elements (paper-roll, web3 abstractor, send-assets card, notes USB,
// the RR diamond, the multiverse pill, …).
//
// Why a primitive: every sticker shares the same physical metaphor —
// printed and pressed onto the page — so they need the same shadow, the
// same hover lift, and (when style evolves) a single place to tune the
// whole family. Future stickers join by wrapping their content in this
// shell; nothing about the inner art has to change.
//
// API kept intentionally small:
//   children    inner art — <img>, inline <svg>, or a custom interactive
//               element (the multiverse dice mechanism is one of these).
//   as          'span' (default) | 'div' | 'button' | 'a' — pick the
//               interactive shell when the sticker has a click affordance.
//   tilt        rotation in degrees for the at-rest pose. Per-instance,
//               not random — kept stable so adjacent stickers don't drift.
//   className   route-local positional class hooks onto the wrapper.
//
// Visual contract (in globals.css):
//   .sticker             rest pose — slight shadow + tilt
//   .sticker:hover       small upward lift + raised shadow
//
// Tokens consumed:
//   --sticker-tilt       rest rotation (set inline via style prop)
//   --sticker-shadow-rest, --sticker-shadow-lift, --sticker-lift-y
//                        global tokens; tune the family from one place.

import type { CSSProperties, ReactNode, MouseEventHandler } from 'react'

type StickerAs = 'span' | 'div' | 'button' | 'a'

interface BaseProps {
  children:    ReactNode
  tilt?:       number
  className?:  string
  style?:      CSSProperties
  'aria-label'?: string
  'aria-hidden'?: boolean
}

type AsSpan   = BaseProps & { as?: 'span' | 'div' }
type AsButton = BaseProps & { as: 'button'; onClick?: MouseEventHandler<HTMLButtonElement>; type?: 'button' | 'submit' }
type AsAnchor = BaseProps & { as: 'a'; href: string; onClick?: MouseEventHandler<HTMLAnchorElement>; target?: string; rel?: string }

export type StickerProps = AsSpan | AsButton | AsAnchor

export default function Sticker(props: StickerProps) {
  const { children, tilt, className, style, ...rest } = props
  const classes = ['sticker', className].filter(Boolean).join(' ')
  const mergedStyle: CSSProperties = {
    ...(tilt !== undefined ? ({ ['--sticker-tilt' as string]: `${tilt}deg` } as CSSProperties) : null),
    ...style,
  }

  if ((props as AsAnchor).as === 'a') {
    const { href, target, rel, onClick, 'aria-label': ariaLabel, 'aria-hidden': ariaHidden } = props as AsAnchor
    return (
      <a className={classes} style={mergedStyle} href={href} target={target} rel={rel} onClick={onClick} aria-label={ariaLabel} aria-hidden={ariaHidden}>
        {children}
      </a>
    )
  }
  if ((props as AsButton).as === 'button') {
    const { type = 'button', onClick, 'aria-label': ariaLabel, 'aria-hidden': ariaHidden } = props as AsButton
    return (
      <button className={classes} style={mergedStyle} type={type} onClick={onClick} aria-label={ariaLabel} aria-hidden={ariaHidden}>
        {children}
      </button>
    )
  }
  const Tag = (props as AsSpan).as === 'div' ? 'div' : 'span'
  const { 'aria-label': ariaLabel, 'aria-hidden': ariaHidden } = rest as { 'aria-label'?: string; 'aria-hidden'?: boolean }
  return (
    <Tag className={classes} style={mergedStyle} aria-label={ariaLabel} aria-hidden={ariaHidden}>
      {children}
    </Tag>
  )
}
