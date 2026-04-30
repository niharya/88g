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
        <p className="about-card-p__quote">While working on this portfolio, I noticed that</p>
        <h2 className="about-card-p__heading">most of my work becomes about system design.</h2>
        <p className="about-card-p__body">
          It could be a product, an interface, a culture, or a brand. Across all types of work, the real work lies in tweaking the underlying structure.
          <br /><br />
          When that isn&rsquo;t possible directly, I design around it and still do what&rsquo;s needed.
        </p>
      </div>
      <div className="about-card-p__divider" />
      <p className="about-card-p__cta">You can spot it in these works</p>
    </motion.div>
  )
}
