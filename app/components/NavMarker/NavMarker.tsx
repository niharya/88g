'use client'

// NavMarker — the single nav-marker primitive.
//
// Every .nav-marker call site routes through this component. Emits the same
// class structure the existing nav.css consumes, so adoption is a visual
// no-op; tone / state / acknowledgment modifiers add new behavior on top.
//
// Naming: "marker" is the project-wide language — ChapterMarker, ProjectMarker,
// ExitMarker. This primitive is the shared shell they all rely on. Do not
// rename it to "pill" anywhere in the nav module.
//
// API:
//   as                  'a' | 'button' | 'div'     — element shape
//   role                'project' | 'chapter' | 'exit'  — slot semantics
//   tone                'neutral' | 'terra' | 'mint'    — colour palette
//   state               'default' | 'active' | 'disabled'
//   icon                ReactNode | string (Material Symbols glyph name)
//   label               main label (string or ReactNode for title-full/short)
//   sublabel            secondary text (year / subtitle — chapter role)
//   acknowledgeOnClick  'navigate' (default) | 'shake' | 'morph'
//     - navigate: no visual acknowledgment; route change is the feedback.
//     - shake:    arrow shakes on click — same-page markers (Works on /selected).
//     - morph:    icon rotates 45° while `active` — landing Nihar + → ×.
//   wipHint             when state='disabled', hover swaps label for this
//                       string rendered as a Monostamp (olive tone).
//   iconRef             ref forwarded to the icon element (for arrow rotation)
//
// Class structure emitted (matches nav.css contract):
//   .nav-marker.nav-marker--{role}[.nav-marker--tone-{tone}][.is-disabled]
//     .nav-marker__content
//       .nav-icon[.nav-arrow]
//       .nav-marker__{name|title|exit-label}  ← role-specific label slot
//       .nav-marker__year                     ← sublabel slot (chapter)

import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import type { Ref } from 'react'
import Link from 'next/link'
import Monostamp from '../Monostamp'

export type NavMarkerRole = 'project' | 'chapter' | 'exit'
export type NavMarkerTone = 'neutral' | 'terra' | 'mint'
export type NavMarkerState = 'default' | 'active' | 'disabled'
export type NavMarkerAcknowledge = 'navigate' | 'shake' | 'morph'

interface BaseProps {
  role:                NavMarkerRole
  tone?:               NavMarkerTone
  state?:              NavMarkerState
  icon?:               React.ReactNode | string
  iconRef?:            Ref<HTMLSpanElement>
  label:               React.ReactNode
  sublabel?:           React.ReactNode
  acknowledgeOnClick?: NavMarkerAcknowledge
  wipHint?:            string
  className?:          string
  style?:              React.CSSProperties
  'aria-label'?:       string
  'aria-expanded'?:    boolean
  'aria-current'?:     React.AriaAttributes['aria-current']
  'data-arrow-target'?: boolean
}

type AsAnchor = BaseProps & {
  as:       'a'
  href:     string
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  target?:  string
  rel?:     string
}
type AsButton = BaseProps & {
  as:       'button'
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  type?:    'button' | 'submit'
  href?:    never
}
type AsDiv = BaseProps & {
  as:       'div'
  href?:    never
  onClick?: never
}
export type NavMarkerProps = AsAnchor | AsButton | AsDiv

// ── Internals ────────────────────────────────────────────────────────────

function labelClassName(role: NavMarkerRole): string {
  if (role === 'project') return 'nav-marker__name t-btn1'
  if (role === 'exit')    return 'nav-marker__exit-label'
  return 'nav-marker__title t-btn1'
}

function renderIcon(icon: React.ReactNode | string | undefined, ref?: Ref<HTMLSpanElement>, arrow?: boolean) {
  if (icon == null) return null
  const cls = `nav-icon${arrow ? ' nav-arrow' : ''}`
  if (typeof icon === 'string') {
    return <span ref={ref} className={cls} aria-hidden="true">{icon}</span>
  }
  return <span ref={ref} className={cls} aria-hidden="true">{icon}</span>
}

// Random crop of the shared noise tile. Each marker instance reads a
// different patch of /noise-bg.png via CSS custom properties, so docked
// markers don't show a repeated pattern across a page. Rotation is also
// randomized in 90° steps for extra decorrelation with zero visual cost.
//
// Set client-side after mount so SSR hydration matches — Math.random()
// during render would mismatch the server-rendered HTML.
function useNoiseCrop(): React.CSSProperties | undefined {
  const [crop, setCrop] = useState<React.CSSProperties | undefined>(undefined)
  useEffect(() => {
    setCrop({
      ['--nm-noise-x' as string]: `${Math.floor(Math.random() * 100)}%`,
      ['--nm-noise-y' as string]: `${Math.floor(Math.random() * 100)}%`,
      ['--nm-noise-rot' as string]: `${Math.floor(Math.random() * 4) * 90}deg`,
    })
  }, [])
  return crop
}

// ── Component ────────────────────────────────────────────────────────────

function NavMarkerInner(props: NavMarkerProps, ref: Ref<HTMLElement>) {
  const {
    role, tone = 'neutral', state = 'default',
    icon, iconRef, label, sublabel,
    acknowledgeOnClick = 'navigate',
    wipHint, className, style,
  } = props

  const [shaking, setShaking] = useShakeState()
  const isDisabled = state === 'disabled'
  const isActive   = state === 'active'
  const noiseCrop  = useNoiseCrop()

  const rootClass = [
    'nav-marker',
    `nav-marker--${role}`,
    tone !== 'neutral' ? `nav-marker--tone-${tone}` : '',
    isDisabled ? 'is-disabled' : '',
    isActive   ? 'is-active'   : '',
    acknowledgeOnClick === 'morph' && isActive ? 'is-morphed' : '',
    className || '',
  ].filter(Boolean).join(' ')

  // Acknowledgment: shake fires on click for same-page markers.
  const onClick = useCallback((e: React.MouseEvent) => {
    if (isDisabled) { e.preventDefault(); return }
    if (acknowledgeOnClick === 'shake') setShaking()
    if (props.onClick) (props.onClick as (e: React.MouseEvent) => void)(e)
  }, [isDisabled, acknowledgeOnClick, props.onClick, setShaking])

  // The arrow is the icon for chapter / exit / shake-acknowledged markers.
  const iconIsArrow = role === 'chapter' || role === 'exit' || acknowledgeOnClick === 'shake'

  const content = (
    <span className="nav-marker__content">
      {renderIcon(icon, iconRef, iconIsArrow)}
      <span className={labelClassName(role)}>{label}</span>
      {sublabel && <span className="nav-marker__year t-p4">{sublabel}</span>}
      {isDisabled && wipHint && (
        <span className="nav-marker__wip" aria-hidden="true">
          <Monostamp tone="olive" appearance="light">{wipHint}</Monostamp>
        </span>
      )}
    </span>
  )

  const commonProps = {
    className:  rootClass,
    style:      noiseCrop || style ? { ...(noiseCrop || {}), ...(style || {}) } : undefined,
    'aria-label':    props['aria-label'],
    'aria-expanded': props['aria-expanded'],
    'aria-current':  props['aria-current'],
    'data-shaking':  shaking ? '' : undefined,
    'data-arrow-target': props['data-arrow-target'] ? '' : undefined,
  }

  if (props.as === 'a') {
    return (
      <Link
        ref={ref as Ref<HTMLAnchorElement>}
        href={props.href}
        target={props.target}
        rel={props.rel}
        onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}
        aria-disabled={isDisabled || undefined}
        {...commonProps}
      >
        {content}
      </Link>
    )
  }

  if (props.as === 'button') {
    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        type={props.type ?? 'button'}
        onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
        disabled={isDisabled || undefined}
        {...commonProps}
      >
        {content}
      </button>
    )
  }

  // as === 'div' — inert presence marker (ProjectMarker uses this).
  return (
    <div ref={ref as Ref<HTMLDivElement>} {...commonProps}>
      {content}
    </div>
  )
}

const NavMarker = forwardRef<HTMLElement, NavMarkerProps>(NavMarkerInner)
NavMarker.displayName = 'NavMarker'

export default NavMarker

// ── Shake state hook ─────────────────────────────────────────────────────
// CSS owns the keyframe; the hook flips data-shaking for its duration
// (360ms — matches the animation length in navmarker.css).

const SHAKE_MS = 360

function useShakeState(): [boolean, () => void] {
  const [shaking, setShaking] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const trigger = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setShaking(true)
    timerRef.current = setTimeout(() => setShaking(false), SHAKE_MS)
  }, [])

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  return [shaking, trigger]
}
