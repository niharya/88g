// StartoothLoader — the sticker family's passive, SSR-safe member.
//
// The Startooth cluster line-mark drawn on a die-cut sticker hull, animated
// with one of two pure-CSS movements:
//   trace   — the accent line draws itself on, holds, retracts. Calm.
//   twinkle — the facets pulse in and out of phase. A quieter shimmer.
//
// Why it's NOT a <Sticker> consumer (and why that's correct):
//   - <Sticker> is a client component (hover-lift, press, clickRotate). This
//     mark's primary mount is the first-paint patience mark in layout.tsx,
//     which must render in the server HTML and paint BEFORE hydration — a
//     client subtree can't. So this is its own server component.
//   - A loader is passive by definition (no hover, no click). It joins the
//     family by sharing the *material* — the printed-pressed drop-shadow
//     token (--sticker-shadow-lift) and the die-cut silhouette — not the
//     interaction shell. See LIBRARY.md → "Sticker" / "StartoothLoader".
//
// Colour + movement: two channels, one component.
//   - Primary path (the boot mount): pass NO colour/movement props. The hull
//     fill + line accent inherit from --loader-sticker / --loader-lit, which
//     globals.css sets per route via :root:has(.route-*); the movement is
//     likewise route-assigned there. One shared layout renders for every
//     route, so the route isn't known at render time — CSS owns the mapping.
//   - Override path (Suspense fallbacks, previews): pass `lit` / `sticker` /
//     `movement` to pin a look. Props set the same CSS vars inline — the
//     identical prop→var pattern <Sticker> uses for `tilt`.
//
// Geometry: hull viewBox 0 0 222 174; the 194×146 cluster centres inside it
// at translate(14 14) (14u padding per side). Height derives 174:222.

import type { CSSProperties } from 'react'
import './startooth-loader.css'

// Die-cut hull — single closed path. (assets/die-cut.svg)
const HULL =
  'M105.903 0.893555C109.737 -0.492275 114.006 -0.267178 117.709 1.58398L117.71 1.58301L149.71 17.583C149.731 17.5933 149.751 17.6039 149.771 17.6143L181.708 33.583C181.929 33.6937 182.148 33.8104 182.363 33.9326L182.449 33.9814C182.635 34.087 182.818 34.1976 182.999 34.3115C185.739 36.0389 187.85 38.6089 189.01 41.6396L189.229 42.252L189.229 42.2568L194.857 59.1406L211.744 64.7705L211.748 64.7715C217.863 66.8119 222 72.537 222 79C222 85.4631 217.863 91.188 211.748 93.2285L211.743 93.2295L196.001 98.4756L189.709 129.941L189.708 129.944C188.801 134.476 185.853 138.345 181.708 140.417V140.416L149.75 156.395C149.736 156.402 149.722 156.41 149.708 156.417V156.416L117.708 172.416C113.485 174.527 108.515 174.528 104.292 172.417V172.416L72.292 156.416V156.417C72.2775 156.41 72.2635 156.402 72.249 156.395L40.292 140.416V140.417C36.1471 138.345 33.1992 134.476 32.292 129.944L32.291 129.942L25.9971 98.4756L10.2568 93.2295L10.252 93.2285C4.32835 91.2518 0.260123 85.8172 0.0117188 79.6035L0 79L0.0117188 78.3965C0.260205 72.1829 4.32839 66.7482 10.252 64.7715L10.2559 64.7705L27.1406 59.1406L32.7705 42.2559L32.9775 41.6768L33.0127 41.585L33.1543 41.2295C33.2031 41.1118 33.2537 40.9942 33.3057 40.8779C34.7158 37.7237 37.1789 35.1395 40.292 33.583L72.292 17.583L72.3379 17.5605L104.294 1.58301L104.671 1.40137C104.798 1.3427 104.925 1.28631 105.054 1.23145L105.161 1.18555C105.406 1.08112 105.653 0.983903 105.903 0.893555Z'

// The 4 cluster line paths. (assets/cluster.svg)
const EDGES = [
  'M129 17L97 1L65 17',
  'M41 57L65 49V17L33 33L25 57L1 65L25 73L33 113L65 129V81L41 73M33 113L41 73L65 65L41 57L33 33',
  'M97 113L89 73L65 65L89 57L97 33M97 113L105 73L129 65L105 57L97 33M97 33L129 17V49L105 57M97 33L65 17V49L89 57M105 73L129 81V129L97 145L65 129V81L89 73M97 113L129 129M97 113L65 129',
  'M161 113L153 73L129 65L153 57L161 33M153 57L129 49V17L161 33L169 57L193 65L169 73L161 113L129 129V81L153 73',
]

export interface StartoothLoaderProps {
  /** Line accent colour. Omit in the boot mount — inherits --loader-lit per route. */
  lit?: string
  /** Die-cut fill colour. Omit in the boot mount — inherits --loader-sticker per route. */
  sticker?: string
  /** Pin a movement. Omit in the boot mount — the route assigns it in globals.css. */
  movement?: 'trace' | 'twinkle'
  /** Rendered width in px; height derives 174:222. */
  size?: number
  /** Line weight in viewBox units. */
  stroke?: number
  className?: string
  'aria-hidden'?: boolean
  'aria-label'?: string
}

export default function StartoothLoader({
  lit,
  sticker,
  movement,
  size = 150,
  stroke = 2,
  className,
  'aria-hidden': ariaHidden = true,
  'aria-label': ariaLabel,
}: StartoothLoaderProps) {
  const classes = ['startooth-loader', className].filter(Boolean).join(' ')
  // Props override the route-driven CSS vars when supplied; otherwise the
  // SVG fills reference the inherited --loader-* and resolve per route.
  const style: CSSProperties = {
    ...(lit !== undefined ? ({ ['--loader-lit' as string]: lit } as CSSProperties) : null),
    ...(sticker !== undefined ? ({ ['--loader-sticker' as string]: sticker } as CSSProperties) : null),
  }

  return (
    <svg
      className={classes}
      style={style}
      data-movement={movement}
      viewBox="0 0 222 174"
      width={size}
      height={size * 174 / 222}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={ariaLabel ? 'img' : undefined}
      aria-hidden={ariaHidden}
      aria-label={ariaLabel}
    >
      {/* 1 — die-cut hull. Carries the family's printed-pressed shadow. */}
      <path className="startooth-loader__hull" d={HULL} />
      {/* Cluster centres in the hull with 14u padding per side. */}
      <g transform="translate(14 14)">
        {/* 2 — resting strokes keep the mark legible between sweeps. */}
        <g className="startooth-loader__base">
          {EDGES.map((d, i) => (
            <path key={i} d={d} strokeWidth={stroke} strokeLinejoin="round" />
          ))}
        </g>
        {/* 3 — lit strokes, animated. pathLength normalises every path to 1
            so the dash maths is geometry-independent. */}
        <g className="startooth-loader__lit-group">
          {EDGES.map((d, i) => (
            <path
              key={i}
              className="startooth-loader__lit"
              d={d}
              pathLength={1}
              strokeWidth={stroke}
              strokeLinejoin="round"
            />
          ))}
        </g>
      </g>
    </svg>
  )
}
