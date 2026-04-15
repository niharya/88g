'use client'

// TwitterEmbed — port of original TwitterEmbed.js
// Source-locked: blockquote.twitter-tweet + twttr.widgets.load pattern preserved exactly.

import Script from 'next/script'
import { useEffect, useRef } from 'react'

// Minimal type for the twitter widgets global — avoids `any` casts.
declare global {
  interface Window {
    twttr?: { widgets: { load: (el: HTMLElement | null) => void } }
  }
}

export default function TwitterEmbed({ tweetId, className }: { tweetId: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.twttr?.widgets.load(containerRef.current)
  }, [tweetId])

  if (!tweetId) return null

  const tweetUrl = `https://twitter.com/i/status/${tweetId}`

  return (
    <div ref={containerRef} className={className}>
      <Script
        src="https://platform.twitter.com/widgets.js"
        strategy="lazyOnload"
        onLoad={() => {
          window.twttr?.widgets.load(containerRef.current)
        }}
      />
      <blockquote
        className="twitter-tweet"
        data-dnt="true"
        data-theme="light"
        data-tweet-id={tweetId}
      >
        <a href={tweetUrl}>View tweet</a>
      </blockquote>
    </div>
  )
}
