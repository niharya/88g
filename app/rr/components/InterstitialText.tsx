'use client'

import { useRef, useState } from 'react'
import { useScroll, useMotionValueEvent } from 'framer-motion'

const WORDS_1 = "You don't learn how to swim by reading about it.".split(' ')
const WORDS_2 = "So here's the most rudimentary form of the game mechanic that evolved into complex meme-warfare.".split(' ')

// Each word reveals within a window of the scroll progress.
// Para 1 maps to 0.00 → 0.46; para 2 maps to 0.54 → 1.00 (gap creates a pause).
function wordRange(paraIndex: number, wordIndex: number, paraLength: number): [number, number] {
  const [rangeStart, rangeEnd] = paraIndex === 0 ? [0.0, 0.46] : [0.54, 1.0]
  const span     = rangeEnd - rangeStart
  const from     = rangeStart + (wordIndex / paraLength) * span
  const to       = from + (span / paraLength) * 1.2   // slight overlap for smoothness
  return [from, to]
}

function clamp(v: number) {
  return Math.max(0, Math.min(1, v))
}

interface WordProps {
  word: string
  paraIndex: number
  wordIndex: number
  paraLength: number
  progress: number
}

function Word({ word, paraIndex, wordIndex, paraLength, progress }: WordProps) {
  const [from, to]  = wordRange(paraIndex, wordIndex, paraLength)
  const p           = clamp((progress - from) / (to - from))
  return (
    <span
      style={{
        display:   'inline-block',
        opacity:   p,
        transform: `translateY(${(1 - p) * 8}px)`,
      }}
    >
      {word}&nbsp;
    </span>
  )
}

export default function InterstitialText() {
  const ref = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  const { scrollYProgress } = useScroll({
    target:  ref,
    offset:  ['start end', 'start 0.3'],
  })

  useMotionValueEvent(scrollYProgress, 'change', setProgress)

  return (
    <div className="rr-interstitial-text" ref={ref}>
      <p>
        {WORDS_1.map((word, i) => (
          <Word key={i} word={word} paraIndex={0} wordIndex={i} paraLength={WORDS_1.length} progress={progress} />
        ))}
      </p>
      <p>
        {WORDS_2.map((word, i) => (
          <Word key={i} word={word} paraIndex={1} wordIndex={i} paraLength={WORDS_2.length} progress={progress} />
        ))}
      </p>
    </div>
  )
}
