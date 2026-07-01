'use client'

import { useState, useLayoutEffect, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import emailjs from '@emailjs/browser'
import IconArrowRight from './components/icons/IconArrowRight'
import SlideInOnNav from './components/SlideInOnNav'
import NavMarker from './components/NavMarker'
import CaptionTag from './components/CaptionTag'
import { ExpandToggle } from './components/ExpandToggle'
import Monostamp from './components/Monostamp'
import Footer from './components/Footer'
import { getGreeting } from './lib/greeting'
import { analytics } from './lib/analytics'
import './components/nav/nav.css'
import './components/NavMarker/navmarker.css'
import './components/Footer/footer.css'
import './landing.css'

// ssr:false — canvas is client-only; code-splits the engine into its own chunk
// so it's absent from every other route's bundle.
const StartoothCanvas = dynamic(() => import('./_landing/StartoothCanvas'), { ssr: false })

/* Session flag read by /all on arrival so it can slide in from the right.
   Paired with the inline slide-in effect inside LandingPage for the reverse
   trip — that effect is inlined rather than using <SlideInOnNav> because the
   landing's root className toggles on expand, and React's className
   reconciliation strips any imperatively-added classes (like SlideInOnNav's)
   on every re-render. Owning the class through React state keeps it stable
   across the expand toggle, avoiding a mid-flight animation restart. */
const markToBench = () => {
  try { sessionStorage.setItem('nav-direction', 'to-bench') } catch { /* non-fatal */ }
}

/* Startooth build memory — deliberately a MODULE-LEVEL variable, not
   sessionStorage. It must reset on a hard refresh (the build replays) but
   persist across client-side navigation (return from /all jumps straight
   to settled — replaying a 7s build on an in-app back-trip would be tedious).
   A module var is exactly that scope: a fresh value per page load, shared
   across route transitions within the same JS context. sessionStorage would
   survive the hard refresh and wrongly skip the build. */
let builtThisLoad = false

const EMAILJS_SERVICE  = 'service_76t20oq'
const EMAILJS_TEMPLATE = 'template_t3lbcfn'
const EMAILJS_KEY      = '6EYXpRRlRsj0pe00B'

/* Intro stage delays — standardized + trimmed so the reveal reads quicker.
   STAGE_SETTLE ≈ --dur-place (0.9s): the nav tabs stage in as the hero card
   finishes settling. REVEAL_BEAT is the single uniform beat for the trailing
   reveals (caption, then frame). FAILSAFE clears grey-hold + build with margin. */
const STAGE_SETTLE_MS = 900
const REVEAL_BEAT_MS   = 400
const FAILSAFE_MS      = 10000

/* ---- Spectrum palettes — precomputed from Munsell color system ---- */
// 8 cols × 7 rows diamond grid. 4 complementary hue pairs.
// Generated via mhvcToHex() with chroma fallback for gamut safety.
type Palette = { cells: (string | null)[]; leftLabel: string; rightLabel: string }

const PALETTES: Palette[] = [
  // BG / R — teal ↔ red
  { cells: [null,null,null,'#afcec8',null,null,null,null,null,null,null,'#96b4af','#bea9a7',null,null,null,null,null,'#629e97','#7d9995','#a48e8d','#b58986','#c4827e','#d17b77',null,'#238781','#4b837e','#647f7c','#8a7473','#9b6e6c','#aa6765',null,'#00716d','#006d69','#2f6966','#4c6562','#725a59','#825452',null,null,null,null,null,'#354c4a','#5a4141',null,null,null,null,null,null,null,'#412b2d',null,null,null], leftLabel: '#00716d', rightLabel: '#d17b77' },
  // P / GY — purple ↔ chartreuse
  { cells: [null,null,null,'#cbc6d0',null,null,null,null,null,null,null,'#b2abb7','#aab194',null,null,null,null,null,'#9d8ea8','#98919d','#8f977c','#8c9967','#889c4f','#839e32',null,'#8a7099','#84738e','#7f7784','#767c65','#727f50','#6d8138',null,'#765189','#715580','#6c5976','#665d6c','#5c634d','#586538',null,null,null,null,null,'#4f4355','#444a38',null,null,null,null,null,null,null,'#2e3325',null,null,null], leftLabel: '#765189', rightLabel: '#839e32' },
  // BG / P — jade ↔ lavender
  { cells: [null,null,null,'#b0cfc4',null,null,null,null,null,null,null,'#97b4aa','#adacb8',null,null,null,null,null,'#659f8e','#7e9990','#93929f','#9390ac','#938fba','#928dc6',null,'#2f8873','#4f8475','#667f77','#7a7886','#7a7693','#7a74a0',null,'#00715a','#006e5b','#346a5c','#4e655e','#615e6e','#615c7a',null,null,null,null,null,'#374c46','#494557',null,null,null,null,null,null,null,'#322f3f',null,null,null], leftLabel: '#00715a', rightLabel: '#928dc6' },
  // YR / B — orange ↔ blue
  { cells: [null,null,null,'#d9c4b6',null,null,null,null,null,null,null,'#bfa99c','#9bb1b7',null,null,null,null,null,'#b38b71','#a58f82','#81979d','#6b9ba8','#4b9eb3','#00a1bf',null,'#a46d46','#987158','#8a7569','#687d83','#50818e','#2d849a',null,'#904f1b','#88532f','#7f573f','#715c4f','#4e646a','#356776',null,null,null,null,null,'#584338','#354b52',null,null,null,null,null,null,null,'#21343a',null,null,null], leftLabel: '#904f1b', rightLabel: '#00a1bf' },
]



/* Practice-timeline phases — width encodes duration (sums to 100%); each
   reveals its guiding question + year-range when focused. */
const TIMELINE_PHASES = [
  { key: 'interface', label: 'Interface', num: '02', unit: 'years', question: 'How do people interact with technology?', range: '2016 – 2018', defaultW: 20 },
  { key: 'brand', label: 'Brand', num: '03', unit: 'years', question: 'How do ideas shape an organization?', range: '2018 – 2021', defaultW: 30 },
  { key: 'product', label: 'Product', num: '05', unit: 'years', question: 'How do complex products become usable?', range: '2021 – Now', defaultW: 50 },
]

export default function LandingPage() {
  const [expanded, setExpanded] = useState(false)
  const [slideIn, setSlideIn] = useState(false)
  const [greeting] = useState(getGreeting)

  /* Slide-in entrance — reads the session flag set by NiharHomeLink on
     /all. Owned by React state so the class survives className
     reconciliation when expand toggles. useLayoutEffect runs before paint
     so the class lands before the hero-card__bg animation can start. */
  useLayoutEffect(() => {
    let direction: string | null = null
    try { direction = sessionStorage.getItem('nav-direction') } catch { return }
    if (direction !== 'to-landing') return
    try { sessionStorage.removeItem('nav-direction') } catch { /* non-fatal */ }
    setSlideIn(true)
  }, [])

  /* ---- Startooth build gate ---- */
  // `built` drives the .landing--built CSS class, which reveals the landing
  // once the canvas build completes. `skipBuild` tells the engine to jump
  // straight to the settled pattern when we've already built in this page-load
  // (client-side return). Both read from the module-level `builtThisLoad` in
  // useLayoutEffect so they're known before the first paint — and so a hard
  // refresh (fresh module) always replays the build.
  const [built, setBuilt] = useState(false)
  const [skipBuild, setSkipBuild] = useState(false)
  // `buildStarted` fires when the (grey-held) build is cued — drives .landing--building,
  // which straightens the sheet corners rounded→square and inks the fill grey→black.
  const [buildStarted, setBuildStarted] = useState(false)
  // The entrance reads as a clean sequence — the hero card settles, THEN the nav
  // tabs slide out, THEN the Startooth caption follows a beat later. `staged`
  // gates the nav tabs (and about-cards); `captionIn` trails it for the caption.
  // On client-side return everything is already settled, so both flip immediately.
  const [staged, setStaged] = useState(false)
  const [captionIn, setCaptionIn] = useState(false)
  // `frameIn` is the LAST beat: the brown sheet frame fades in after the caption.
  // Drives .landing--frame, read by startooth-canvas.css (matte border-color).
  const [frameIn, setFrameIn] = useState(false)

  useLayoutEffect(() => {
    if (builtThisLoad) {
      setBuilt(true)
      setSkipBuild(true)
      setBuildStarted(true)
      setStaged(true)
      setCaptionIn(true)
      setFrameIn(true)
    }
  }, [])

  // Stage the nav row just after the hero card has docked. The card's dock runs
  // --dur-place (~0.9s) from the build reveal; we wait a short beat beyond that
  // so the tabs follow the card landing closely without overlapping its dock.
  // The skip path above sets staged synchronously, so this no-ops on return.
  useEffect(() => {
    if (!built || staged) return
    const id = setTimeout(() => setStaged(true), STAGE_SETTLE_MS)
    return () => clearTimeout(id)
  }, [built, staged])

  // The Startooth caption trails the nav tabs — once the tabs are out, hold a
  // beat, then let the caption slide up so the two reveals read as distinct
  // steps rather than arriving together.
  useEffect(() => {
    if (!staged || captionIn) return
    const id = setTimeout(() => setCaptionIn(true), REVEAL_BEAT_MS)
    return () => clearTimeout(id)
  }, [staged, captionIn])

  // The brown sheet frame is the LAST thing to arrive — a beat after the caption
  // has slid up, the frame fades in (border-color transparent → brown) and the
  // grey intro hairline retires. Skip path sets frameIn synchronously above.
  useEffect(() => {
    if (!captionIn || frameIn) return
    const id = setTimeout(() => setFrameIn(true), REVEAL_BEAT_MS)
    return () => clearTimeout(id)
  }, [captionIn, frameIn])

  // Failsafe: if onBuildComplete never fires (canvas error, no WebGL context,
  // network failure on the dynamic chunk), reveal the landing so the user isn't
  // stranded. Sized past the grey hold (~1.8s) + the ~6.2s build so it can't fire
  // before a healthy build completes (build-complete lands ~7.4s on desktop).
  useEffect(() => {
    if (built) return
    const id = setTimeout(() => setBuilt(true), FAILSAFE_MS)
    return () => clearTimeout(id)
  }, [built])

  const handleBuildStart = useCallback(() => {
    setBuildStarted(true)
  }, [])

  const handleBuildComplete = useCallback(() => {
    builtThisLoad = true
    setBuilt(true)
  }, [])

  /* ---- Practice-timeline focus ---- */
  // null = proportional default; 0/1/2 = that phase sprung open, others collapsed.
  const [focusedPhase, setFocusedPhase] = useState<number | null>(null)
  const barRef = useRef<HTMLDivElement>(null)

  // Click anywhere outside the bar resets the focus. Native document listener +
  // containment check (synthetic stopPropagation wouldn't reach here anyway).
  useEffect(() => {
    if (focusedPhase === null) return
    const onDocClick = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setFocusedPhase(null)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [focusedPhase])

  /* ---- Spectrum state ---- */
  const [hueIdx, setHueIdx] = useState(0)
  const [specRotation, setSpecRotation] = useState(0)   // click reroll (±1/±2°)
  const [specPressed, setSpecPressed] = useState(false)
  const spectrumRef = useRef<HTMLDivElement>(null)

  const palette = PALETTES[hueIdx]

  /* Spectrum base tilt — scroll-driven. 0° at the top of the page, easing to
     its −1° rest over the first 120px of scroll, so it reads straight when you
     first reach it and tilts as you nudge down. Driven as a CSS variable on
     .spectrum via a rAF-throttled scroll listener (no React re-render); it
     composes with the frame's click-reroll rotate. The click reroll is left
     intact (discrete user action). Frozen at 0° under reduced motion. */
  useEffect(() => {
    const el = spectrumRef.current
    if (!el) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    let raf = 0
    const update = () => {
      raf = 0
      const t = mq.matches ? 0 : -Math.min(window.scrollY / 120, 1)
      el.style.setProperty('--spec-scroll-tilt', `${t}deg`)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  /* Sheet-scale — couple the content to the frame (Phase 3, harmonization).
     The frame is height-driven (--sheet-width, startooth-canvas.css) and caps at
     760px; the content is authored at that 760 baseline (hero = 76% of the sheet).
     On shorter viewports the frame shrinks below the content width, so the
     fixed-px content pokes past the frame edges. Scale the whole content plate as
     a unit to match: scale = min(1, frameWidth / 760). Written as --sheet-scale on
     :root (so .landing's content AND the sibling colophon footer can both read it);
     landing.css applies it via a transform on .landing__content, scales the scroll
     height to match, and scales the footer slab into the frame. CSS can't divide
     two lengths into the unitless number transform: scale() needs, hence this small
     scalar (the deliberate "lighter touch" bridge, vs. a full cqi re-arch). Defaults
     to 1 (no JS / SSR / pre-mount) so design size is the graceful fallback. Mobile
     is full-bleed (no framed sheet) and handled separately — forced to 1 there so
     the coupling is a no-op and the layout matches live. */
  useEffect(() => {
    const root = document.documentElement
    const mq = window.matchMedia('(max-width: 767px), (max-height: 500px)')
    // The plate keeps a gutter inside the frame so cards never touch the border:
    // scale to (frameWidth − 2*inset) / 760. Value owned by --sheet-content-inset
    // (globals.css) so it stays tunable in one place.
    const inset = parseFloat(getComputedStyle(root).getPropertyValue('--sheet-content-inset')) || 0
    let raf = 0
    const measure = () => {
      raf = 0
      if (mq.matches) { root.style.setProperty('--sheet-scale', '1'); return }
      // Prefer the rendered frame width (single source of truth); fall back to the
      // --sheet-width formula if the canvas (ssr:false) hasn't mounted yet.
      const sheet = document.querySelector('.startooth-canvas-root') as HTMLElement | null
      const w = sheet?.offsetWidth ||
        Math.min((window.innerHeight - 60) / 1.3333, 760, window.innerWidth - 64)
      root.style.setProperty('--sheet-scale', String(Math.min(1, (w - 2 * inset) / 760)))
    }
    const onResize = () => { if (!raf) raf = requestAnimationFrame(measure) }
    measure()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  /* ---- Contact state ---- */
  const [formOpen, setFormOpen] = useState(false)
  const [actionLabel, setActionLabel] = useState('Send A Note')
  const [morphing, setMorphing] = useState(false)
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set())
  const [secondaryRevealed, setSecondaryRevealed] = useState(false)
  const [tagsDim, setTagsDim] = useState(true)

  /* Field validation */
  const [nameInvalid, setNameInvalid] = useState(false)
  const [tagsInvalid, setTagsInvalid] = useState(false)
  const [noteInvalid, setNoteInvalid] = useState(false)
  const [emailInvalid, setEmailInvalid] = useState(false)
  const [emailFormatError, setEmailFormatError] = useState(false)

  /* Submit state */
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [sentColor, setSentColor] = useState('')

  const SENT_COLORS = [
    'hsl(181, 90%, 48%)',   // connektion
    'hsl(344, 80%, 62%)',   // aleyr
    'hsl(34, 92%, 58%)',    // codezeros
    '#07F063',              // mint
  ]

  /* Refs */
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const noteRef = useRef<HTMLTextAreaElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const secondaryRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)

  const isDirty = actionLabel === 'Reset Form'

  /* Footer reveal — only show the colophon slab once the user is
     parked at the document bottom. Before that the footer would
     distract from the form. Resets to false when the landing
     collapses so a re-expand starts from hidden.

     Gating on document-bottom proximity (not contact-section
     visibility) means the slab disengages the moment the user starts
     scrolling up — there's no lingering window where the form is
     still mostly visible but the footer hangs around. Threshold is
     small (64 px) so even a tiny upward gesture clears it.

     Scroll listener (not IntersectionObserver) because IO's setup-time
     callback can miss when the section is already in viewport at
     mount, leaving the slab hidden forever. The listener is a cheap
     comparison on each scroll frame and re-evaluates from scratch. */
  const [pastForm, setPastForm] = useState(false)

  useEffect(() => {
    if (!expanded) {
      setPastForm(false)
      return
    }
    const evaluate = () => {
      const distanceFromBottom =
        document.documentElement.scrollHeight -
        (window.scrollY + window.innerHeight)
      // 64 px feels parked-at-bottom without being so loose that an
      // upward nudge fails to clear it. Any honest scroll-up gesture
      // pushes past this and hides the slab immediately.
      setPastForm(distanceFromBottom <= 64)
    }
    evaluate()
    window.addEventListener('scroll', evaluate, { passive: true })
    window.addEventListener('resize', evaluate)
    return () => {
      window.removeEventListener('scroll', evaluate)
      window.removeEventListener('resize', evaluate)
    }
  }, [expanded])

  /* ---- Idle timer ---- */
  const cancelIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = null
  }, [])

  const startIdleTimer = useCallback(() => {
    cancelIdleTimer()
    idleTimerRef.current = setTimeout(() => {
      setFormOpen(false)
      setActionLabel('Send A Note')
      cancelIdleTimer()
    }, 84000)
  }, [cancelIdleTimer])

  /* ---- Morph helper ---- */
  const morphTo = useCallback((label: string) => {
    setMorphing(true)
    setTimeout(() => setActionLabel(label), 140)
  }, [])

  /* ---- Clear form ---- */
  const clearForm = useCallback(() => {
    if (formRef.current) formRef.current.reset()
    if (noteRef.current) {
      noteRef.current.style.fontSize = ''
      noteRef.current.style.lineHeight = ''
      noteRef.current.style.overflowY = ''
      noteRef.current.style.transition = ''
      noteRef.current.classList.remove('note--scrolled')
      noteRef.current.scrollTop = 0
    }
    setActiveTags(new Set())
    setSecondaryRevealed(false)
    setTagsDim(true)
    setNameInvalid(false)
    setTagsInvalid(false)
    setNoteInvalid(false)
    setEmailInvalid(false)
    setEmailFormatError(false)
    setSubmitStatus('idle')
    if (secondaryRef.current) secondaryRef.current.style.display = 'none'
  }, [])

  /* ---- Collapse form ---- */
  const doFormCollapse = useCallback(() => {
    cancelIdleTimer()
    clearForm()
    setFormOpen(false)
  }, [cancelIdleTimer, clearForm])

  /* ---- Expand/collapse layout ---- */
  const handlePillClick = useCallback(() => {
    if (expanded) {
      setExpanded(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      doFormCollapse()
    } else {
      setExpanded(true)
    }
  }, [expanded, doFormCollapse])

  /* ---- Action button state machine ---- */
  const handleActionClick = useCallback(() => {
    if (formOpen) {
      if (isDirty) {
        morphTo('Close Form')
        clearForm()
        startIdleTimer()
      } else {
        morphTo('Send A Note')
        doFormCollapse()
      }
    } else {
      morphTo('Close Form')
      setFormOpen(true)
      startIdleTimer()
      setTimeout(() => {
        contactRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        nameRef.current?.focus({ preventScroll: true })
      }, 500)
    }
  }, [formOpen, isDirty, morphTo, clearForm, startIdleTimer, doFormCollapse])

  /* ---- Tag toggle ---- */
  const handleTagClick = useCallback((tag: string) => {
    setActiveTags(prev => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)

      if (next.size > 0) {
        setTagsDim(false)
        setTagsInvalid(false)
        if (!secondaryRevealed) {
          if (secondaryRef.current) {
            secondaryRef.current.style.display = 'grid'
            // Force reflow before adding class
            void secondaryRef.current.offsetHeight
          }
          setSecondaryRevealed(true)
        }
      } else {
        setTagsDim(true)
      }

      return next
    })
  }, [secondaryRevealed])

  /* ---- Form activity resets idle ---- */
  const handleFormActivity = useCallback(() => {
    if (!formOpen) return
    startIdleTimer()
    if (!isDirty) morphTo('Reset Form')
  }, [formOpen, isDirty, startIdleTimer, morphTo])

  /* ---- Note auto-scale ---- */
  const handleNoteInput = useCallback(() => {
    const note = noteRef.current
    if (!note) return
    if (note.value.trim()) setNoteInvalid(false)

    const MAX = 28, MIN = 12, MAX_LH = 1.25, MIN_LH = 1.45
    const T_START = 1.0, T_END = 3.0

    const currFont = parseFloat(note.style.fontSize) || MAX
    const currLH = parseFloat(note.style.lineHeight) || MAX_LH

    // Measure overflow at max font to determine fill ratio
    note.style.transition = 'none'
    note.style.fontSize = MAX + 'px'
    note.style.lineHeight = String(MAX_LH)
    const sh = note.scrollHeight
    const ch = note.clientHeight

    note.style.fontSize = currFont + 'px'
    note.style.lineHeight = String(currLH)

    if (!ch) return

    const fill = sh / ch
    const t = Math.max(0, Math.min(1, (fill - T_START) / (T_END - T_START)))
    const newFont = +(MAX - t * (MAX - MIN)).toFixed(1)
    const newLH = +(MAX_LH + t * (MIN_LH - MAX_LH)).toFixed(3)

    if (newFont === currFont) return

    requestAnimationFrame(() => {
      note.style.transition = 'font-size 140ms ease-out, line-height 140ms ease-out'
      note.style.fontSize = newFont + 'px'
      note.style.lineHeight = String(newLH)

      // Only enable scroll + gradient when at min font and still overflowing
      requestAnimationFrame(() => {
        const overflows = note.scrollHeight > note.clientHeight + 2
        if (newFont <= MIN && overflows) {
          note.style.overflowY = 'auto'
          note.classList.add('note--overflow')
        } else {
          note.style.overflowY = 'hidden'
          note.scrollTop = 0
          note.classList.remove('note--scrolled', 'note--overflow')
        }
      })
    })
  }, [])

  /* ---- Inline validation ---- */
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const handleNameBlur = useCallback(() => {
    if (nameRef.current && nameRef.current.value.trim() === '') {
      setNameInvalid(true)
    }
  }, [])

  const handleNameInput = useCallback(() => {
    if (nameRef.current && nameRef.current.value.trim() !== '') {
      setNameInvalid(false)
    }
    handleFormActivity()
  }, [handleFormActivity])

  const handleEmailBlur = useCallback(() => {
    if (!emailRef.current) return
    const val = emailRef.current.value
    if (val && !emailPattern.test(val)) setEmailFormatError(true)
    if (val) setEmailInvalid(false)
  }, [])

  const handleEmailInput = useCallback(() => {
    if (!emailRef.current) return
    if (emailPattern.test(emailRef.current.value)) {
      setEmailFormatError(false)
      setEmailInvalid(false)
    }
    handleFormActivity()
  }, [handleFormActivity])

  /* ---- Form submit ---- */
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (submitStatus === 'sending') return

    // Honeypot — bots fill hidden fields
    const honeypot = (e.currentTarget as HTMLFormElement).elements.namedItem('website') as HTMLInputElement
    if (honeypot?.value) return

    let valid = true
    if (!nameRef.current?.value.trim()) { setNameInvalid(true); valid = false }
    if (activeTags.size === 0) { setTagsInvalid(true); valid = false }
    if (!noteRef.current?.value.trim()) { setNoteInvalid(true); valid = false }
    if (!emailRef.current?.value.trim()) { setEmailInvalid(true); valid = false }
    else if (!emailPattern.test(emailRef.current.value)) { setEmailFormatError(true); valid = false }
    if (!valid) return

    setSubmitStatus('sending')

    const params = {
      from_name: nameRef.current?.value ?? '',
      purpose: Array.from(activeTags).join(', '),
      message: noteRef.current?.value ?? '',
      reply_to: emailRef.current?.value ?? '',
    }

    emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, params, EMAILJS_KEY)
      .then(() => {
        // Record the successful send (aggregate, anonymous; broken down by the
        // purpose tag(s) chosen). Fire-and-forget — never blocks the UI.
        analytics.contactSubmitted(params.purpose)
        // Progress bar runs for ~4s via CSS, then show success pill
        setTimeout(() => {
          setSentColor(SENT_COLORS[Math.floor(Math.random() * SENT_COLORS.length)])
          setSubmitStatus('sent')
          // After another 4s, collapse form
          setTimeout(() => {
            doFormCollapse()
            morphTo('Send A Note')
          }, 4000)
        }, 4000)
      })
      .catch((err) => {
        setSubmitStatus('error')

        // Attempt to notify about the failure via a separate send
        emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
          from_name: '[System] Contact Form Error',
          purpose: 'Error Notification',
          message: `Someone tried to send a note but it failed.\n\nSender: ${params.from_name} (${params.reply_to})\nPurpose: ${params.purpose}\nNote: ${params.message}\n\nError: ${err?.text || err?.message || String(err)}`,
          reply_to: params.reply_to,
        }, EMAILJS_KEY).catch(() => {
          // Silent fail on notification — nothing more we can do
        })
      })
  }, [activeTags, submitStatus, doFormCollapse, morphTo])

  /* ---- Spectrum click — cycle hue group + reroll rotation ---- */
  const handleSpectrumClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a')) return
    setHueIdx(prev => (prev + 1) % PALETTES.length)
    // Reroll from the subset that excludes the current value so the frame
    // always visibly rotates. Stacks on the scroll-driven base tilt.
    setSpecRotation(prev => {
      const options = [-2, -1, 1, 2].filter(t => t !== prev)
      return options[Math.floor(Math.random() * options.length)]
    })
  }, [])

  /* ---- Random tag tilts ---- */
  const TILTS = [-2, -1, 0, 1, 2]
  const getRandomTilt = () => TILTS[Math.floor(Math.random() * TILTS.length)]

  /* ---- Contact card class ---- */
  const contactClasses = ['contact-card']
  if (formOpen) contactClasses.push('contact-card--form-open')

  /* ---- Form class ---- */
  const formClasses = ['contact-form']
  if (secondaryRevealed) formClasses.push('contact-form--secondary-revealed')

  const TAGS = ['Hiring', 'Collaboration', 'Curiosity', 'Something else']

  /* JSON-LD — Person + WebSite. Rendered inline as <script
     type="application/ld+json"> per Google guidance; safe in a client
     component because Next ships it as static markup. sameAs lists the
     three public profiles; email is intentionally omitted (contact form
     is the only path). */
  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Nihar',
    url: 'https://nihar.works',
    jobTitle: 'Designer',
    description: 'Started with graphic design and somehow ended up deep in developer tooling and infrastructure systems.',
    sameAs: [
      'https://linkedin.com/in/niharbhagat',
      'https://github.com/niharya',
      'https://x.com/neonihar',
    ],
  }
  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Nihar',
    url: 'https://nihar.works',
    author: { '@type': 'Person', name: 'Nihar' },
    inLanguage: 'en',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <StartoothCanvas
        onBuildComplete={handleBuildComplete}
        onBuildStart={handleBuildStart}
        skipBuild={skipBuild}
        expanded={expanded}
      />

      <div className={`landing ${expanded ? 'landing--expanded' : 'landing--default'}${slideIn ? ' landing--slide-in' : ''}${buildStarted ? ' landing--building' : ''}${built ? ' landing--built' : ''}${skipBuild ? ' landing--skip' : ''}${staged ? ' landing--staged' : ''}${frameIn ? ' landing--frame' : ''}`}>
        <div className="landing__content">

          {/* Hero */}
          <div className="landing__section--hero">
            <div className="hero-card">
              <div className="hero-card__bg">
                <div className="hero-card__content">
                  <p className="hero-card__greeting t-p4">
                    <span>{greeting}</span>
                    <span className="hero-card__greeting-sep" aria-hidden="true" />
                    <span>I&rsquo;m Nihar</span>
                  </p>
                  <h1 className="hero-card__headline t-h2">
                    I believe well-made tools and systems can bring clarity, calm, and even delight to people working through complexity.
                  </h1>
                </div>
                <button
                  className="pill-btn"
                  onClick={handlePillClick}
                  aria-label={expanded ? 'Collapse content' : 'Expand content'}
                >
                  <ExpandToggle expanded={expanded} className="pill-btn__icon" />
                </button>
              </div>
            </div>
          </div>

          {/* Nav row — [Nihar] nameplate + expand trigger docked with [Works] link.
              Mirrors the /all nav row pattern; terra-tinted to live in
              landing's color world. + icon rotates 45° to × on expand. */}
          <div className="landing__section--projects">
            <div className="landing-nav-row">
              <NavMarker
                as="button"
                role="project"
                tone="terra"
                state={expanded ? 'active' : 'default'}
                acknowledgeOnClick="morph"
                icon="add"
                label="Nihar"
                onClick={handlePillClick}
                aria-expanded={expanded}
                aria-label={expanded ? 'Collapse content' : 'Expand content'}
                className="landing-nav-row__nihar"
              />
              <NavMarker
                as="a"
                href="/all"
                role="chapter"
                tone="terra"
                icon="arrow_forward"
                label="Works"
                onClick={markToBench}
                className="landing-nav-row__works"
              />
            </div>
          </div>

          {/* About Long — the practice timeline. A proportional data-viz: each
              segment's WIDTH encodes the years in that specialization (Interface
              2 / Brand 3 / Product 5), running end-to-end so "one thing at a
              time" reads literally. Replaces the former lead-paragraph +
              discipline-chip list — same content, literal form. Recomposed from
              the 800×480 handoff (reference/design_handoff_practice_card) to the
              column; stays Group A (tucks behind hero). */}
          <div className="landing__section--about-long">
            <div className="about-card about-card--long">
              <p className="practice-timeline__statement">
                Started with standup comedy. Then graphic design.<br />
                <span className="practice-timeline__accent">Since then I have been overusing my talent. Like with these graphs.</span>
              </p>

              <div className="practice-timeline__lower">
                {/* The bar — interactive focus graph. Click a phase to spring it
                    open (74%, question + range revealed); the others collapse to
                    13% grey spines. Widths always sum to 100% so the bar never
                    gaps mid-transition. Now genuinely interactive, so the segments
                    are real buttons (the hover affordance is honest). */}
                <div className="practice-timeline__bar" ref={barRef}>
                  {TIMELINE_PHASES.map((p, i) => {
                    const w = focusedPhase === null ? p.defaultW : (focusedPhase === i ? 74 : 13)
                    const state = focusedPhase === null ? 'default' : (focusedPhase === i ? 'focused' : 'collapsed')
                    const toggle = () => setFocusedPhase(prev => (prev === i ? null : i))
                    return (
                      <div
                        key={p.key}
                        className={`practice-timeline__seg practice-timeline__seg--${p.key} is-${state}`}
                        style={{ ['--phase-size']: `${w}%` } as React.CSSProperties}
                        role="button"
                        tabIndex={0}
                        aria-pressed={focusedPhase === i}
                        aria-label={`${p.label}: ${p.question}`}
                        onClick={toggle}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle() } }}
                      >
                        <div className="practice-timeline__seg-top">
                          <span className="practice-timeline__seg-label">{p.label}</span>
                          <div className="practice-timeline__seg-reveal">
                            <p className="practice-timeline__seg-question">{p.question}</p>
                            <p className="practice-timeline__seg-range">{p.range}</p>
                          </div>
                        </div>
                        <span className="practice-timeline__seg-num">{p.num}{p.unit ? <span className="practice-timeline__seg-unit">{p.unit}</span> : null}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Year axis — cells mirror the segment widths and track the
                    moving edges; the focused phase's boundary years highlight. */}
                <div className="practice-timeline__axis">
                  {TIMELINE_PHASES.map((p, i) => {
                    const w = focusedPhase === null ? p.defaultW : (focusedPhase === i ? 74 : 13)
                    return (
                      <div className="practice-timeline__axis-cell" style={{ ['--phase-size']: `${w}%` } as React.CSSProperties} key={p.key}>
                        {i === 0 && <span className={`practice-timeline__year${focusedPhase === 0 ? ' is-active' : ''}`}>2016</span>}
                        {i === 1 && <span className={`practice-timeline__year${focusedPhase === 0 || focusedPhase === 1 ? ' is-active' : ''}`}>2018</span>}
                        {i === 2 && (
                          <>
                            <span className={`practice-timeline__year${focusedPhase === 1 || focusedPhase === 2 ? ' is-active' : ''}`}>2021</span>
                            <span className={`practice-timeline__year practice-timeline__year--now${focusedPhase === 2 ? ' is-active' : ''}`}>
                              <span className="practice-timeline__rec" aria-hidden="true" />NOW
                            </span>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Spectrum — Group B #1 (was #2 before the spectrum/practice swap;
              see _landing/ANOMALIES.md → "Group B order"). */}
          <div className="landing__section--spectrum">
            <div
              ref={spectrumRef}
              className={`spectrum${specPressed ? ' spectrum--pressed' : ''}`}
              onClick={handleSpectrumClick}
              onPointerDown={() => setSpecPressed(true)}
              onPointerUp={() => setSpecPressed(false)}
              onPointerLeave={() => setSpecPressed(false)}
            >
              <div className="spectrum__frame" style={{ transform: `rotate(${specRotation}deg)` }}>
                <div className="spectrum__bg" />
                <div className="spectrum__inner">
                  <div className="spectrum__gradient" />
                  <div className="spectrum__grid">
                    {palette.cells.map((color, i) => {
                      const row = Math.floor(i / 8)
                      const col = i % 8
                      const dist = Math.abs(row - 3) + Math.abs(col - 3.5)
                      return (
                        <div
                          key={i}
                          className="spectrum__cell"
                          style={
                            color
                              ? { backgroundColor: color, transitionDelay: `${Math.round(dist * 40)}ms` }
                              : { opacity: 0 }
                          }
                        />
                      )
                    })}
                  </div>
                  <span className="spectrum__label spectrum__label--left t-h5" style={{ color: palette.leftLabel }}>Abstraction</span>
                  <span className="spectrum__label spectrum__label--right t-h5" style={{ color: palette.rightLabel }}>Application</span>
                  <div className="spectrum__footer">
                    <div className="spectrum__footer-line" />
                    <Link className="spectrum__link t-btn1" href="/all" onClick={markToBench}>My Works</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Practice — Group B #2 (split part 2: practice + life,
              framed sheet). Sits below spectrum after the swap. */}
          <div className="landing__section--about-practice">
            <div className="about-card about-card--practice">
              <p className="about-card__text t-p2">
                My practice has evolved from designing symbols to designing dashboards. I&rsquo;ve found joy in breaking and making processes within live systems to make them flowww.
              </p>
              <div className="about-card__divider about-card__divider--full" />
              <p className="about-card__text t-p2">
                I live well to be able to design well. I want to make my life and lives of those around me beautiful.
                <br /><br />
                Small interventions. In work. In daily life. And adjustments that make things function a bit better and make life feel a bit better.
                <br /><br />
                Welcome to my collection of design interventions aka my portfolio.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="landing__section--contact" ref={contactRef}>
            <div className={contactClasses.join(' ')}>
              <div className="contact-card__border">
                <p className="contact-card__intro t-h1">
                  I am looking to give my creative practice its deepest and farthest expression. If we&rsquo;re going the same way, I could use a lift.
                </p>

                {/* Action wrap */}
                <div className="contact-card__action-wrap">
                  <div className="contact-card__action-line" />
                  <button
                    className={`contact-card__action t-btn1${morphing ? ' contact-card__action--morphing' : ''}`}
                    type="button"
                    onClick={handleActionClick}
                    onAnimationEnd={() => setMorphing(false)}
                  >
                    {actionLabel}
                  </button>
                </div>

                {/* Form reveal */}
                <div className="contact-card__form-reveal" aria-hidden={!formOpen} inert={!formOpen ? true : undefined}>
                  <form
                    ref={formRef}
                    className={formClasses.join(' ')}
                    noValidate
                    onSubmit={handleSubmit}
                    onInput={handleFormActivity}
                    onClick={handleFormActivity}
                  >
                    {/* Honeypot */}
                    <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
                      <label htmlFor="field-website">Website</label>
                      <input type="text" id="field-website" name="website" tabIndex={-1} autoComplete="off" />
                    </div>

                    <div className="contact-form__fields">
                      {/* Name */}
                      <div className={`contact-form__field${nameInvalid ? ' contact-form__field--invalid' : ''}`} data-field-index="0">
                        <div className="contact-form__line" />
                        <div className="contact-form__input-area">
                          <label className="contact-form__label t-p4" htmlFor="field-name">Your Name</label>
                          <input
                            ref={nameRef}
                            type="text"
                            className="contact-form__input"
                            id="field-name"
                            name="name"
                            autoComplete="name"
                            required
                            maxLength={100}
                            onBlur={handleNameBlur}
                            onInput={handleNameInput}
                          />
                        </div>
                      </div>

                      {/* Purpose tags */}
                      <div className={`contact-form__field${tagsInvalid ? ' contact-form__field--invalid' : ''}`} data-field-index="1">
                        <div className="contact-form__line" />
                        <div className="contact-form__input-area">
                          <span className="contact-form__label t-p4">What brings you here?</span>
                          <div className={`contact-form__tags${tagsDim ? ' contact-form__tags--dim' : ''}`} role="group" aria-label="Purpose">
                            {TAGS.map(tag => (
                              <span
                                key={tag}
                                className={`landing-tag${activeTags.has(tag) ? ' landing-tag--active' : ''}`}
                                tabIndex={0}
                                role="checkbox"
                                aria-checked={activeTags.has(tag)}
                                style={activeTags.size > 0 ? { transform: `rotate(${getRandomTilt()}deg)` } : undefined}
                                onClick={() => { handleTagClick(tag); handleFormActivity() }}
                                onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleTagClick(tag); handleFormActivity() } }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Secondary fields */}
                      <div className="contact-form__secondary" ref={secondaryRef}>
                        <div className="contact-form__secondary-content">
                          {/* Note */}
                          <div className={`contact-form__field contact-form__field--secondary${noteInvalid ? ' contact-form__field--invalid' : ''}`} data-field-index="2">
                            <div className="contact-form__line" />
                            <div className="contact-form__input-area">
                              <label className="contact-form__label t-p4" htmlFor="field-note">Note</label>
                              <textarea
                                ref={noteRef}
                                className="contact-form__input contact-form__input--note"
                                id="field-note"
                                name="note"
                                maxLength={2000}
                                onInput={() => { handleNoteInput(); handleFormActivity() }}
                                onScroll={() => noteRef.current?.classList.toggle('note--scrolled', (noteRef.current?.scrollTop ?? 0) > 0)}
                              />
                            </div>
                          </div>

                          {/* Email */}
                          <div className={`contact-form__field contact-form__field--secondary${emailInvalid ? ' contact-form__field--invalid' : ''}${emailFormatError ? ' contact-form__field--format-error' : ''}`} data-field-index="3">
                            <div className="contact-form__line" />
                            <div className="contact-form__input-area">
                              <label className="contact-form__label t-p4" htmlFor="field-email">Email</label>
                              <input
                                ref={emailRef}
                                type="email"
                                className="contact-form__input"
                                id="field-email"
                                name="email"
                                autoComplete="email"
                                required
                                maxLength={254}
                                onBlur={handleEmailBlur}
                                onInput={handleEmailInput}
                              />
                            </div>
                          </div>

                          {/* Submit */}
                          <div className={`contact-form__field contact-form__field--secondary${submitStatus === 'sending' ? ' contact-form__field--sending' : ''}`} data-field-index="4">
                            <div className="contact-form__line" />
                            <div className="contact-form__input-area">
                              <div className="contact-form__submit">
                                <IconArrowRight size={20} className="contact-form__submit-icon" />
                                <button
                                  type="submit"
                                  className="contact-form__submit-btn t-btn1"
                                  disabled={submitStatus === 'sending' || submitStatus === 'sent'}
                                >
                                  {submitStatus === 'sending' ? 'Sending\u2026' : submitStatus === 'sent' ? 'Note Sent' : 'Send Note'}
                                </button>
                              </div>
                              {/* aria-live="polite" so screen readers announce the
                                  success or error pill when it appears, without
                                  interrupting whatever is currently being read. */}
                              <div role="status" aria-live="polite" aria-atomic="true">
                                {submitStatus === 'sent' && (
                                  <Monostamp className="contact-form__success-pill" style={{ color: sentColor }}>Note Sent. Thank you.</Monostamp>
                                )}
                                {submitStatus === 'error' && (
                                  <Monostamp className="contact-form__error-pill">There seems to be a network error on my side. I&rsquo;ve been notified. Please try again in a few hours.</Monostamp>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Footer */}
                <div className="contact-card__footer">
                  <div className="contact-card__footer-line" />
                  <span className="contact-card__footer-left t-p4">Prefer to talk sooner?</span>
                  <a className="contact-card__footer-right t-btn1" href="https://calendar.app.google/ek4WL37YAqTcytjH9" target="_blank" rel="noopener noreferrer" onClick={() => analytics.bookCallClicked()}>Book A Call</a>
                </div>
              </div>
            </div>
          </div>

        </div>

        <CaptionTag
          title="Startooth Pattern"
          year={2025}
          description="Geometric trapezoids, sliced by stars and diamonds, inspired by the houndstooth pattern."
          visible={!expanded && captionIn}
        />
      </div>

      {/* Site footer — mounts in expanded view but its visibility is
          gated on `pastForm` so the slab only fades in once the user
          has scrolled to the contact form (60 %+ of the contact
          section in view). Before that, the form gets the user's
          full attention — no distracting fixed-position element at
          the bottom. The Startooth caption is hidden during expand
          (`visible={!expanded}`); this footer takes over the same
          bottom-of-viewport role with the same voice. */}
      {expanded && <Footer variant="caption" visible={pastForm} />}
    </>
  )
}
