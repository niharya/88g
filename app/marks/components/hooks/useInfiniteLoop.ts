'use client'

// useInfiniteLoop — credits-reel wrap from Buffer back to Hero.
//
// The reel is one cycle long (hero → essay → 6 marks → buffer). When the user
// reaches the buffer's black zone while scrolling downward, we instant-jump
// scrollY back to 0. Two things conspire to make the jump invisible:
//
//   • The black zone is fully opaque (#000 + noise), so the viewport is
//     showing nothing but black during the window the jump fires.
//   • Background.tsx already resets palette to HERO under black-zone
//     dominance (Chunk 5), so the fixed gradient underneath the opaque
//     black is already hero-grey before we jump.
//
// So at t=jump: viewport shows opaque black, palette below is hero, DOM is
// identical — we just swap scrollY from ~near-bottom to 0. Hero is now
// immediately below the (still-rendered) black zone; a tick later, scrollY=0
// places hero in view. The user feels continuous downward scroll.
//
// Armed state prevents re-firing: the loop only fires when the user has
// genuinely traversed the reel (armed during mark-zone dominance) and then
// reached the black zone. Up-scrolling past hero doesn't arm; scrolling back
// up out of a mark disarms.

import { useEffect } from 'react'

const ARM_OVERLAP  = 0.6   // any mark section crossing 60% arms the loop
const FIRE_OVERLAP = 0.9   // black zone must fully dominate to fire

export function useInfiniteLoop() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    let armed       = false
    let lastY       = window.scrollY
    let lastFiredAt = 0   // timestamp guard — one fire per cycle, min 1s apart

    const onScroll = () => {
      const y  = window.scrollY
      const dy = y - lastY
      lastY    = y
      const vh = window.innerHeight || 1

      // Arm: any mark section dominating arms the loop.
      if (!armed) {
        const sections = document.querySelectorAll<HTMLElement>('.marks-section')
        for (const section of sections) {
          const rect = section.getBoundingClientRect()
          const overlap = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0)) / vh
          if (overlap >= ARM_OVERLAP) {
            armed = true
            break
          }
        }
      }

      if (!armed)       return
      if (dy <= 0)      return   // only fire on downward scroll
      const now = performance.now()
      if (now - lastFiredAt < 1000) return

      const black = document.querySelector<HTMLElement>(
        '.marks-buffer__zone[data-buffer-zone="black"]',
      )
      if (!black) return
      const rect    = black.getBoundingClientRect()
      const overlap = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0)) / vh
      if (overlap < FIRE_OVERLAP) return

      // Fire: black is fully opaque over the viewport; palette is already
      // hero-grey underneath. Jump scrollY to 0, disarm until the user
      // traverses again.
      lastFiredAt = now
      armed       = false
      window.scrollTo(0, 0)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
}
