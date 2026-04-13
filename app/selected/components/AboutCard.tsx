'use client'

// AboutCard — editorial statement card, positioned left of the mat.
// Framer Motion spring entrance: slides in from left with overshoot.

import { motion } from 'framer-motion'

const SPRING = { type: 'spring' as const, duration: 0.6, bounce: 0.18 }

export default function AboutCard() {
  return (
    <motion.div
      className="about-card-p"
      initial={{ opacity: 0, x: -20, rotate: -1.5 }}
      animate={{ opacity: 1, x: 0, rotate: 0 }}
      transition={SPRING}
    >
      <div className="about-card-p__text">
        <p className="about-card-p__quote">While finishing this portfolio, I noticed something.</p>
        <h1 className="about-card-p__heading">Most of my work converges on system design.</h1>
        <p className="about-card-p__body">
          Whatever the medium: product, interface, culture or brand, the real work becomes about
          adjusting the underlying structure.
          <br /><br />
          When that isn&rsquo;t possible, I design around it and still move forward.
        </p>
      </div>
      <div className="about-card-p__divider" />
      <p className="about-card-p__cta">You can spot it in these works</p>
    </motion.div>
  )
}
