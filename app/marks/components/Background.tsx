'use client'

// Background — fixed gradient layer behind every phase.
//
// A scroll listener picks the "dominant" mark section — the one whose entry
// progress (p = (vh - sectionTop) / vh, clamped 0–1) is highest — and writes
// that section's palette onto the fixed Background element as inline CSS
// custom properties. The palette change fires early in the entry (as soon
// as the section starts to come into view), so by the time its contents
// reveal the color is already correct underneath them.
//
// Because `--marks-bg-stop-a` / `--marks-bg-stop-b` are declared as
// `@property <color>` in marks.css, the browser interpolates between the
// old and new values over 0.9s under `--ease-paper`. We get smooth color
// morphing on scroll without a per-frame JS tween loop.
//
// When no mark section is dominant (Hero, Essay), the palette falls back
// to the Hero's dark gradient (#333 → #000). The tail of the document —
// BlankSection (pure black) and HeroClone (hero gradient) — participate
// in the dominance contest directly so their palettes win as scroll
// approaches them, making the clone-and-teleport wrap invisible.

import { useEffect, useRef } from 'react'
import { MARKS } from '../data/marks'

type Palette = { stopA: string; stopB: string; stopMid?: string; angle: number }
const HERO_PALETTE:  Palette = { stopA: '#333333', stopB: '#000000', angle: 233.57 }
const BLACK_PALETTE: Palette = { stopA: '#000000', stopB: '#000000', angle: 180 }

// Linear RGB midpoint of two hex colors. Used when a palette doesn't declare
// a `stopMid` — the three-stop gradient in marks.css needs a real color for
// the middle stop (an @property with initial-value defeats `var(…, fallback)`
// tricks), so we derive one here rather than branching the CSS.
function midHex(a: string, b: string): string {
  const toRGB = (h: string) => {
    const n = parseInt(h.slice(1), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const
  }
  const [ar, ag, ab] = toRGB(a)
  const [br, bg, bb] = toRGB(b)
  const mix = (x: number, y: number) => Math.round((x + y) / 2)
  const hex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${hex(mix(ar, br))}${hex(mix(ag, bg))}${hex(mix(ab, bb))}`
}

export default function Background() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let activeId: string | null = '__hero__'   // sentinel so first pass always writes

    const apply = () => {
      const vh = window.innerHeight || 1
      const sections = document.querySelectorAll<HTMLElement>('.marks-section')
      // Score = how much of the section currently overlaps the viewport,
      // normalised by viewport height. Peaks at 1.0 when a 100vh section
      // sits flush with the viewport and drops back to 0 once it leaves.
      // Using overlap (not entry progress) guarantees that once we're
      // scrolled PAST a section, the next section's palette wins.
      let best: { id: string; palette: typeof HERO_PALETTE; score: number } = {
        id: '__hero__',
        palette: HERO_PALETTE,
        score: 0.2,   // Hero stays until a section's overlap crosses 20%
      }
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        const overlap = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0))
        const score = overlap / vh
        if (score > best.score) {
          const id = section.dataset.markId
          const mark = MARKS.find((m) => m.id === id)
          if (mark && id) {
            best = { id, palette: mark.palette, score }
          }
        }
      })

      // Tail of the document: BlankSection (pure black) and HeroClone
      // (hero gradient) contest dominance the same way mark sections do.
      // Having them participate here is what makes the wrap invisible —
      // by the time the clone is docked, Background is already painting
      // the same palette as the real Hero at y=0.
      const blank = document.querySelector<HTMLElement>('.marks-blank')
      if (blank) {
        const rect = blank.getBoundingClientRect()
        const overlap = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0))
        const score = overlap / vh
        if (score > best.score) {
          best = { id: '__blank__', palette: BLACK_PALETTE, score }
        }
      }
      const heroClone = document.querySelector<HTMLElement>('.marks-hero-clone')
      if (heroClone) {
        const rect = heroClone.getBoundingClientRect()
        const overlap = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0))
        const score = overlap / vh
        if (score > best.score) {
          best = { id: '__hero_clone__', palette: HERO_PALETTE, score }
        }
      }
      if (best.id !== activeId) {
        activeId = best.id
        el.style.setProperty('--marks-bg-stop-a', best.palette.stopA)
        el.style.setProperty('--marks-bg-stop-b', best.palette.stopB)
        el.style.setProperty('--marks-bg-angle', `${best.palette.angle}deg`)
        // Always write the midpoint — either the palette's declared stopMid,
        // or a computed A/B average. Declaring the @property with an
        // initial-value means a CSS-side `var(…, color-mix(…))` fallback
        // would never fire, so we resolve it here.
        const mid = ('stopMid' in best.palette && best.palette.stopMid)
          ? best.palette.stopMid
          : midHex(best.palette.stopA, best.palette.stopB)
        el.style.setProperty('--marks-bg-stop-mid', mid)
      }
    }

    // Tab-hidden gate for ambient CSS animations. `html[data-marks-hidden]`
    // is the single switch the stylesheet keys off — see the
    // `animation-play-state: paused` rule in marks.css. Reduced-motion is
    // handled purely via @media in the same place; no JS guard needed.
    const onVisibility = () => {
      document.documentElement.dataset.marksHidden =
        document.visibilityState === 'hidden' ? 'true' : 'false'
    }
    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)

    apply()
    window.addEventListener('scroll', apply, { passive: true })
    window.addEventListener('resize', apply)
    return () => {
      window.removeEventListener('scroll', apply)
      window.removeEventListener('resize', apply)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return <div ref={ref} className="marks-background" aria-hidden="true" />
}
