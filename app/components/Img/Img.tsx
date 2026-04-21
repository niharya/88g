'use client'

import NextImage, { type ImageProps as NextImageProps } from 'next/image'
import { thumbHashToDataURL } from 'thumbhash'
import { useEffect, useMemo, useState } from 'react'
import { imageManifest, type ImageManifestEntry } from './manifest.generated'
import './img.css'

type Placeholder = 'color' | 'hash' | 'none'

type ImgProps = Omit<NextImageProps, 'src' | 'placeholder' | 'blurDataURL' | 'width' | 'height' | 'fill'> & {
  src: string
  alt: string
  placeholder?: Placeholder
  className?: string
  style?: React.CSSProperties
  onClick?: React.MouseEventHandler<HTMLElement>
  /** Override manifest width (rarely needed). */
  width?: number
  /** Override manifest height. */
  height?: number
  /** Fill the parent container (consumer must be positioned + sized). */
  fill?: boolean
  /** Intrinsic sizing — wrapper sizes to image's natural dims, CSS can cap. */
  intrinsic?: boolean
  /** Skip Next.js image optimization — pass through unoptimized to <NextImage>. */
  unoptimized?: boolean
  /** Lazy loading mode; forwarded to <NextImage>. */
  loading?: 'eager' | 'lazy'
}

function hashToDataUrl(hash: string): string {
  const bytes = Uint8Array.from(atob(hash), (c) => c.charCodeAt(0))
  return thumbHashToDataURL(bytes)
}

/**
 * Single load state: once the real image has fired onLoad, `.is-loaded` is
 * applied and the materialize keyframe plays. Resetting on src change means
 * a flow switch replays the animation — acceptable because consumers sync
 * their own label/toggle transitions to the same timing.
 * Animations (not transitions) are used because transitions stall inside
 * scroll-linked transform ancestors. See /rr ANOMALIES.md.
 */
export function Img({
  src,
  alt,
  placeholder = 'color',
  className,
  style,
  onClick,
  sizes,
  priority,
  draggable,
  fill,
  intrinsic,
  unoptimized,
  loading,
  width,
  height,
  ...rest
}: ImgProps) {
  const entry: ImageManifestEntry | undefined = imageManifest[src]
  const [loaded, setLoaded] = useState(false)

  // Reset on src change so a new image animates in on first paint.
  useEffect(() => {
    setLoaded(false)
  }, [src])

  const hashUrl = useMemo(() => {
    if (placeholder !== 'hash' || !entry) return undefined
    return hashToDataUrl(entry.thumbHash)
  }, [placeholder, entry])

  // Dev-time warning: nudge contributors to regenerate the manifest.
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !entry && src.startsWith('/')) {
      // eslint-disable-next-line no-console
      console.warn(
        `[Img] "${src}" is not in the image manifest. Falling back to raw <img>. Run \`npm run lqip\` to regenerate.`,
      )
    }
  }, [entry, src])

  if (!entry) {
    // Image not in manifest yet — graceful fallback.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} style={style} onClick={onClick} />
  }

  const wrapperStyle: React.CSSProperties = {
    ...style,
    ['--img-color' as string]: entry.dominantColor,
  }

  const nextImageSizingProps = fill
    ? { fill: true as const }
    : {
        width: width ?? entry.width,
        height: height ?? entry.height,
      }

  return (
    <span
      className={[
        'img',
        `img--${placeholder}`,
        fill ? 'img--fill' : '',
        intrinsic ? 'img--intrinsic' : '',
        loaded ? 'is-loaded' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={wrapperStyle}
      onClick={onClick}
    >
      {placeholder === 'hash' && hashUrl ? (
        <span
          className="img__placeholder img__placeholder--hash"
          style={{ backgroundImage: `url(${hashUrl})` }}
          aria-hidden
        />
      ) : placeholder === 'color' ? (
        <span className="img__placeholder img__placeholder--color" aria-hidden />
      ) : null}

      <NextImage
        src={src}
        alt={alt}
        {...nextImageSizingProps}
        sizes={sizes}
        priority={priority}
        draggable={draggable}
        unoptimized={unoptimized}
        loading={loading}
        onLoad={() => setLoaded(true)}
        className="img__inner"
        {...rest}
      />
    </span>
  )
}
