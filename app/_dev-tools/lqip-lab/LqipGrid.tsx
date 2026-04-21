'use client'

import { useState } from 'react'

type Row = {
  label: string
  src: string
  dominantColor: string
  thumbHash: string
  thumbHashDataUrl: string
  width: number
  height: number
}

export function LqipGrid({ rows }: { rows: Row[] }) {
  const [version, setVersion] = useState(0)
  const [hashBlur, setHashBlur] = useState(true)

  return (
    <>
      <div className="lqip-lab__controls">
        <button type="button" onClick={() => setVersion((v) => v + 1)}>
          Reload all
        </button>
        <label className="lqip-lab__toggle">
          <input
            type="checkbox"
            checked={hashBlur}
            onChange={(e) => setHashBlur(e.target.checked)}
          />
          ThumbHash blur
        </label>
      </div>

      <div className="lqip-lab__grid" role="table">
        <div className="lqip-lab__head" role="row">
          <div role="columnheader" />
          <div role="columnheader">Raw (current)</div>
          <div role="columnheader">Dominant color</div>
          <div role="columnheader">ThumbHash</div>
        </div>

        {rows.map((row) => (
          <div className="lqip-lab__row" role="row" key={row.src}>
            <div className="lqip-lab__label" role="rowheader">
              <strong>{row.label}</strong>
              <span>
                {row.width}×{row.height}
              </span>
            </div>
            <Cell variant="raw" row={row} version={version} hashBlur={hashBlur} />
            <Cell variant="color" row={row} version={version} hashBlur={hashBlur} />
            <Cell variant="hash" row={row} version={version} hashBlur={hashBlur} />
          </div>
        ))}
      </div>
    </>
  )
}

function Cell({
  variant,
  row,
  version,
  hashBlur,
}: {
  variant: 'raw' | 'color' | 'hash'
  row: Row
  version: number
  hashBlur: boolean
}) {
  const [loaded, setLoaded] = useState(false)
  const src = `${row.src}?v=${version}`

  const placeholderStyle: React.CSSProperties =
    variant === 'color'
      ? { background: row.dominantColor }
      : variant === 'hash'
        ? {
            backgroundImage: `url(${row.thumbHashDataUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: hashBlur ? 'blur(8px)' : 'none',
            transform: hashBlur ? 'scale(1.05)' : 'none',
            imageRendering: hashBlur ? undefined : 'pixelated',
          }
        : {}

  return (
    <div className="lqip-lab__cell" role="cell">
      {variant !== 'raw' && (
        <div
          className="lqip-lab__placeholder"
          style={placeholderStyle}
          aria-hidden
        />
      )}
      <img
        key={version}
        src={src}
        alt=""
        onLoad={() => setLoaded(true)}
        className={`lqip-lab__img ${variant === 'raw' || loaded ? 'is-visible' : ''}`}
      />
    </div>
  )
}
