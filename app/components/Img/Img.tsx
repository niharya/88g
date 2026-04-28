'use client'

import NextImage, { type ImageProps as NextImageProps } from 'next/image'
import { thumbHashToDataURL } from 'thumbhash'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
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
  /**
   * Distance ahead of the viewport at which the image flips from lazy to
   * eager so the fetch begins before the section is actually reached.
   * Set to `0` or `false` to opt out and use native browser lazy loading only.
   * Default `'1500px'`.
   */
  prefetchMargin?: string | false
}

function hashToDataUrl(hash: string): string {
  const bytes = Uint8Array.from(atob(hash), (c) => c.charCodeAt(0))
  return thumbHashToDataURL(bytes)
}

/**
 * Load state and cache.
 *
 * Once the real image has fired onLoad, `.is-loaded` is applied and the
 * materialize keyframe plays. Animations (not transitions) are used
 * because transitions stall inside scroll-linked transform ancestors.
 * See /rr ANOMALIES.md.
 *
 * `loadedSrcs` is a module-level set of srcs that have completed at
 * least one load this session. On re-mount of a cached src, `.is-cached`
 * is applied alongside `.is-loaded` — the CSS pins the inner to the
 * keyframe's end-state directly (no animation), so a slide-in or
 * re-render of an already-cached image doesn't replay the 700ms reveal
 * over bytes the browser is serving instantly. First-mount of a fresh
 * src behaves exactly as before.
 */
const loadedSrcs = new Set<string>()
export const Img = forwardRef<HTMLSpanElement, ImgProps>(function Img({
  src,
  alt,
  placeholder,
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
  prefetchMargin = '1500px',
  ...rest
}: ImgProps, forwardedRef) {
  const entry: ImageManifestEntry | undefined = imageManifest[src]
  // Default placeholder is "color" for opaque assets and "none" for ones with
  // transparent pixels — a flat dominant-color tile would otherwise bleed
  // through any alpha regions of a PNG. Consumer-passed value always wins.
  const resolvedPlaceholder: Placeholder = placeholder ?? (entry?.hasAlpha ? 'none' : 'color')
  // wasInitiallyCached: was this src already loaded by another Img mount
  // this session? If yes, skip the materialize keyframe (bytes are instant
  // from the browser cache, replaying the reveal would jerk a fully-painted
  // image). The ref is updated on src change in the effect below.
  const wasInitiallyCachedRef = useRef(loadedSrcs.has(src))
  const [loaded, setLoaded] = useState(wasInitiallyCachedRef.current)
  const wrapperRef = useRef<HTMLSpanElement | null>(null)
  useImperativeHandle(forwardedRef, () => wrapperRef.current as HTMLSpanElement)

  // Prefetch — flip lazy→eager when the wrapper enters an extended rootMargin
  // around the viewport, so the fetch starts well before the user scrolls the
  // section into view. Skipped when the consumer has already forced eager
  // (priority or loading="eager") or opted out via prefetchMargin={false|"0"}.
  const consumerEager = priority === true || loading === 'eager'
  const prefetchEnabled = !consumerEager && prefetchMargin !== false && prefetchMargin !== '0' && prefetchMargin !== '0px'
  const [prefetched, setPrefetched] = useState(false)
  useEffect(() => {
    if (!prefetchEnabled || prefetched || !wrapperRef.current) return
    if (typeof IntersectionObserver === 'undefined') {
      setPrefetched(true)
      return
    }
    const node = wrapperRef.current
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPrefetched(true)
          io.disconnect()
        }
      },
      { rootMargin: `${prefetchMargin} 0px`, threshold: 0 },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [prefetchEnabled, prefetched, prefetchMargin])

  // Reset on src change. Cached srcs land already-loaded (no materialize);
  // fresh srcs go through the placeholder → load → materialize cycle.
  useEffect(() => {
    if (loadedSrcs.has(src)) {
      wasInitiallyCachedRef.current = true
      setLoaded(true)
    } else {
      wasInitiallyCachedRef.current = false
      setLoaded(false)
    }
    setPrefetched(false)
  }, [src])

  const hashUrl = useMemo(() => {
    if (resolvedPlaceholder !== 'hash' || !entry) return undefined
    return hashToDataUrl(entry.thumbHash)
  }, [resolvedPlaceholder, entry])

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

  const effectiveLoading: 'eager' | 'lazy' | undefined = consumerEager
    ? 'eager'
    : prefetched
      ? 'eager'
      : (loading ?? 'lazy')

  return (
    <span
      ref={wrapperRef}
      className={[
        'img',
        `img--${resolvedPlaceholder}`,
        fill ? 'img--fill' : '',
        intrinsic ? 'img--intrinsic' : '',
        loaded ? 'is-loaded' : '',
        wasInitiallyCachedRef.current ? 'is-cached' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={wrapperStyle}
      onClick={onClick}
    >
      {resolvedPlaceholder === 'hash' && hashUrl ? (
        <span
          className="img__placeholder img__placeholder--hash"
          style={{ backgroundImage: `url(${hashUrl})` }}
          aria-hidden
        />
      ) : resolvedPlaceholder === 'color' ? (
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
        loading={effectiveLoading}
        onLoad={() => {
          loadedSrcs.add(src)
          setLoaded(true)
        }}
        className="img__inner"
        {...rest}
      />
    </span>
  )
})
