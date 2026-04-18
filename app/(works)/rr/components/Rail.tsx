'use client'

import { useEffect, type CSSProperties, type ReactNode } from 'react'

interface RailProps {
  /** Base class on the wrapper. `.is-open` and `.is-revealing` are appended.
   *  Consumer owns the class prefix so existing CSS selectors keep working
   *  (e.g. `'rr-note-rail'`, `'rr-rules-rail'`). */
  className: string
  isOpen: boolean
  /** One-shot entrance — adds `.is-revealing`. Pair with a CSS `@keyframes` on
   *  the consumer side. While active, pass `transform={undefined}` so the
   *  animation owns the transform. */
  isRevealing?: boolean
  /** Inline transform. Consumer computes from (isOpen, otherOpen, …) — pixel
   *  values are tuned per coordinate system and don't generalise. */
  transform?: string
  /** When set, the whole rail becomes a button (RulesRail pattern). When
   *  omitted, consumers wire interactions on inner elements (NoteRail). */
  onToggle?: () => void
  ariaLabel?: string
  /** Emit open-state so a sibling rail can tuck-nudge. */
  onOpenChange?: (isOpen: boolean) => void
  children: ReactNode
}

export default function Rail({
  className,
  isOpen,
  isRevealing = false,
  transform,
  onToggle,
  ariaLabel,
  onOpenChange,
  children,
}: RailProps) {
  useEffect(() => {
    onOpenChange?.(isOpen)
  }, [isOpen, onOpenChange])

  const classes = [
    className,
    isOpen && 'is-open',
    isRevealing && 'is-revealing',
  ].filter(Boolean).join(' ')

  const style: CSSProperties | undefined = transform ? { transform } : undefined

  if (onToggle) {
    return (
      <div
        className={classes}
        style={style}
        onClick={onToggle}
        role="button"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
      >
        {children}
      </div>
    )
  }

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  )
}
