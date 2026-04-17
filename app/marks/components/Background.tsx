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
// When no mark section is dominant (Hero, Essay, Buffer), the palette
// falls back to the Hero's dark gradient (#333 → #000).

import { useEffect, useRef } from 'react'
import { MARKS } from '../data/marks'

const HERO_PALETTE = { stopA: '#333333', stopB: '#000000', angle: 233.57 }

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
      if (best.id !== activeId) {
        activeId = best.id
        el.style.setProperty('--marks-bg-stop-a', best.palette.stopA)
        el.style.setProperty('--marks-bg-stop-b', best.palette.stopB)
        el.style.setProperty('--marks-bg-angle', `${best.palette.angle}deg`)
      }
    }

    apply()
    window.addEventListener('scroll', apply, { passive: true })
    window.addEventListener('resize', apply)
    return () => {
      window.removeEventListener('scroll', apply)
      window.removeEventListener('resize', apply)
    }
  }, [])

  return <div ref={ref} className="marks-background" aria-hidden="true" />
}
