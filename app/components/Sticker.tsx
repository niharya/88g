'use client'

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
//   jitter      when true, re-rolls a random ±2° offset on each pointer
//               enter (composed on top of `tilt` via --sticker-jitter).
//               Adds liveliness without breaking the per-instance pose.
//               If a parent surface owns the hover (e.g. a card hover
//               that should jitter the inner sticker), don't use this
//               prop — wire the same CSS var on the parent's pointer
//               enter instead. See /selected ProjectCard for that
//               pattern.
//   clickRotate default true. On click, re-rolls a random ±2° into
//               --sticker-jitter that *persists* until the next click
//               (unlike `jitter`, which clears on pointer leave). Sells
//               the sticker as something the visitor pushed and shifted.
//               Opt out with `clickRotate={false}` when the click is
//               navigation (e.g. /selected ProjectCard, where rotating
//               just before route-change is wasted motion) or when the
//               consumer owns its own click choreography.
//   className   route-local positional class hooks onto the wrapper.
//
// Visual contract (in globals.css):
//   .sticker             rest pose — tight contact shadow + tiny ambient
//   .sticker:hover       small upward lift + slightly diffused shadow
//   button/a.sticker:active  press-down — lift collapses, shadow snaps tight
//
// Tokens consumed:
//   --sticker-tilt       rest rotation (set inline via style prop)
//   --sticker-jitter     per-hover random offset (managed by `jitter` or
//                        by the parent surface)
//   --sticker-shadow-rest, --sticker-shadow-lift, --sticker-shadow-press,
//   --sticker-lift-y     global tokens; tune the family from one place.

import { useCallback, type CSSProperties, type ReactNode, type MouseEventHandler, type PointerEvent as ReactPointerEvent } from 'react'

type StickerAs = 'span' | 'div' | 'button' | 'a'

interface BaseProps {
  children:    ReactNode
  tilt?:       number
  jitter?:     boolean
  clickRotate?: boolean
  className?:  string
  style?:      CSSProperties
  'aria-label'?: string
  'aria-hidden'?: boolean
}

type AsSpan   = BaseProps & { as?: 'span' | 'div' }
type AsButton = BaseProps & { as: 'button'; onClick?: MouseEventHandler<HTMLButtonElement>; type?: 'button' | 'submit' }
type AsAnchor = BaseProps & { as: 'a'; href: string; onClick?: MouseEventHandler<HTMLAnchorElement>; target?: string; rel?: string }

export type StickerProps = AsSpan | AsButton | AsAnchor

// Random ±2° — committed for the duration of one hover, re-rolled on next enter.
const rollJitter = () => (Math.random() * 4 - 2).toFixed(2)

export default function Sticker(props: StickerProps) {
  const { children, tilt, jitter, clickRotate = true, className, style, ...rest } = props
  const classes = ['sticker', className].filter(Boolean).join(' ')
  const mergedStyle: CSSProperties = {
    ...(tilt !== undefined ? ({ ['--sticker-tilt' as string]: `${tilt}deg` } as CSSProperties) : null),
    ...style,
  }

  const onEnter = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (!jitter) return
    e.currentTarget.style.setProperty('--sticker-jitter', `${rollJitter()}deg`)
  }, [jitter])
  const onLeave = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (!jitter) return
    e.currentTarget.style.setProperty('--sticker-jitter', '0deg')
  }, [jitter])
  // Click rotation persists between clicks (no leave-reset). Coexists
  // safely with hover `jitter` only when one or the other is wired —
  // /selected uses parent-driven jitter, so it opts out via
  // clickRotate={false} to avoid a click-then-leave wiping the rotation.
  const onClickRotate = useCallback((e: { currentTarget: HTMLElement }) => {
    if (!clickRotate) return
    e.currentTarget.style.setProperty('--sticker-jitter', `${rollJitter()}deg`)
  }, [clickRotate])

  if ((props as AsAnchor).as === 'a') {
    const { href, target, rel, onClick, 'aria-label': ariaLabel, 'aria-hidden': ariaHidden } = props as AsAnchor
    const handleClick: MouseEventHandler<HTMLAnchorElement> = (e) => { onClickRotate(e); onClick?.(e) }
    return (
      <a className={classes} style={mergedStyle} href={href} target={target} rel={rel} onClick={handleClick} onPointerEnter={onEnter} onPointerLeave={onLeave} aria-label={ariaLabel} aria-hidden={ariaHidden}>
        {children}
      </a>
    )
  }
  if ((props as AsButton).as === 'button') {
    const { type = 'button', onClick, 'aria-label': ariaLabel, 'aria-hidden': ariaHidden } = props as AsButton
    const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => { onClickRotate(e); onClick?.(e) }
    return (
      <button className={classes} style={mergedStyle} type={type} onClick={handleClick} onPointerEnter={onEnter} onPointerLeave={onLeave} aria-label={ariaLabel} aria-hidden={ariaHidden}>
        {children}
      </button>
    )
  }
  const Tag = (props as AsSpan).as === 'div' ? 'div' : 'span'
  const { 'aria-label': ariaLabel, 'aria-hidden': ariaHidden } = rest as { 'aria-label'?: string; 'aria-hidden'?: boolean }
  return (
    <Tag className={classes} style={mergedStyle} onClick={onClickRotate} onPointerEnter={onEnter} onPointerLeave={onLeave} aria-label={ariaLabel} aria-hidden={ariaHidden}>
      {children}
    </Tag>
  )
}
