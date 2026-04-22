'use client'

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import emailjs from '@emailjs/browser'
import IconArrowRight from './components/icons/IconArrowRight'
import SlideInOnNav from './components/SlideInOnNav'
import CaptionTag from './components/CaptionTag'
import { getGreeting } from './lib/greeting'
import './components/nav/nav.css'
import './landing.css'

/* Session flag read by /selected on arrival so it can slide in from the right.
   Paired with the inline slide-in effect inside LandingPage for the reverse
   trip — that effect is inlined rather than using <SlideInOnNav> because the
   landing's root className toggles on expand, and React's className
   reconciliation strips any imperatively-added classes (like SlideInOnNav's)
   on every re-render. Owning the class through React state keeps it stable
   across the expand toggle, avoiding a mid-flight animation restart. */
const markToSelected = () => {
  try { sessionStorage.setItem('nav-direction', 'to-selected') } catch { /* non-fatal */ }
}

const EMAILJS_SERVICE  = 'service_76t20oq'
const EMAILJS_TEMPLATE = 'template_t3lbcfn'
const EMAILJS_KEY      = '6EYXpRRlRsj0pe00B'

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

/* ---- Pill SVG icons ---- */
function ExpandIcon() {
  return (
    <svg className="pill-btn__icon" viewBox="0 0 20 20" fill="none">
      <path d="M6.77 13.23H9.25c.28 0 .52.1.72.3.2.2.3.44.3.72 0 .28-.1.52-.3.72-.2.2-.44.3-.72.3H5.75c-.28 0-.52-.1-.72-.3-.2-.2-.3-.44-.3-.72V10.75c0-.28.1-.52.3-.72.2-.2.44-.3.72-.3.28 0 .52.1.72.3.2.2.3.44.3.72v2.48zM13.23 6.77H10.75c-.28 0-.52-.1-.72-.3-.2-.2-.3-.44-.3-.72 0-.28.1-.52.3-.72.2-.2.44-.3.72-.3h3.5c.28 0 .52.1.72.3.2.2.3.44.3.72v3.5c0 .28-.1.52-.3.72-.2.2-.44.3-.72.3-.28 0-.52-.1-.72-.3-.2-.2-.3-.44-.3-.72V6.77z" fill="#895804"/>
    </svg>
  )
}

function CollapseIcon() {
  return (
    <svg className="pill-btn__icon" viewBox="0 0 20 20" fill="none">
      <path d="M7.1 12.89H4.62c-.28 0-.52-.1-.72-.3-.2-.2-.3-.44-.3-.72 0-.28.1-.52.3-.72.2-.2.44-.3.72-.3h3.5c.28 0 .52.1.72.3.2.2.3.44.3.72v3.5c0 .28-.1.52-.3.72-.2.2-.44.3-.72.3-.28 0-.52-.1-.72-.3-.2-.2-.3-.44-.3-.72v-2.48zM12.9 7.1h2.48c.28 0 .52.1.72.3.2.2.3.44.3.72 0 .28-.1.52-.3.72-.2.2-.44.3-.72.3h-3.5c-.28 0-.52-.1-.72-.3-.2-.2-.3-.44-.3-.72v-3.5c0-.28.1-.52.3-.72.2-.2.44-.3.72-.3.28 0 .52.1.72.3.2.2.3.44.3.72V7.1z" fill="#895804"/>
    </svg>
  )
}


export default function LandingPage() {
  const [expanded, setExpanded] = useState(false)
  const [slideIn, setSlideIn] = useState(false)
  const [greeting] = useState(getGreeting)

  /* Slide-in entrance — reads the session flag set by NiharHomeLink on
     /selected. Owned by React state so the class survives className
     reconciliation when expand toggles. useLayoutEffect runs before paint
     so the class lands before the hero-card__bg animation can start. */
  useLayoutEffect(() => {
    let direction: string | null = null
    try { direction = sessionStorage.getItem('nav-direction') } catch { return }
    if (direction !== 'to-landing') return
    try { sessionStorage.removeItem('nav-direction') } catch { /* non-fatal */ }
    setSlideIn(true)
  }, [])

  /* ---- Spectrum state ---- */
  const [hueIdx, setHueIdx] = useState(0)
  const [specRotation, setSpecRotation] = useState(0)

  /* ---- Secondary-stack random tilts ----
     Group B (cards below the hero — currently practice, future additions)
     reroll their random rotation every time the page expands. The reroll
     MUST happen in the same React update as setExpanded(true) — if it
     lagged into a useEffect([expanded]), the CSS transition would begin
     with the stale rotation and then snap to the new one mid-flight,
     because custom properties aren't interpolated without @property
     registration. Filter excludes the previous value so each reroll
     visibly shifts. To add a new Group B card: add a rot state here,
     reroll inside rerollStackRotations(), pass via --<name>-rot style. */
  const [practiceRot, setPracticeRot] = useState(0)
  const rerollStackRotations = useCallback(() => {
    const opts = [-2, -1, 1, 2]
    setPracticeRot(prev => {
      const choices = opts.filter(t => t !== prev)
      return choices[Math.floor(Math.random() * choices.length)]
    })
  }, [])
  const palette = PALETTES[hueIdx]

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
  const spectrumRef = useRef<HTMLDivElement>(null)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const noteRef = useRef<HTMLTextAreaElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const secondaryRef = useRef<HTMLDivElement>(null)

  const isDirty = actionLabel === 'Reset Form'

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
      // Reroll Group B rotations in the same React commit as setExpanded
      // so the expand transition begins with the final rotation target
      // (avoids a mid-transition rotation snap — the "ghost" effect).
      rerollStackRotations()
      setExpanded(true)
    }
  }, [expanded, doFormCollapse, rerollStackRotations])

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
      setTimeout(() => nameRef.current?.focus(), 500)
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

  /* ---- Spectrum IntersectionObserver ---- */
  useEffect(() => {
    if (!expanded) {
      spectrumRef.current?.classList.remove('spectrum--aligned')
      return
    }

    const el = spectrumRef.current
    if (!el) return

    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) el.classList.add('spectrum--aligned') },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [expanded])

  /* ---- Spectrum click — cycle hue group ---- */
  const handleSpectrumClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a')) return
    setHueIdx(prev => (prev + 1) % PALETTES.length)
    // Reroll from the subset that excludes the current value so the frame
    // always visibly rotates. Without this filter, two consecutive identical
    // picks would read as no rotation change.
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

  return (
    <>
      <div className="landing-pattern-bg" aria-hidden="true" />

      <div className={`landing ${expanded ? 'landing--expanded' : 'landing--default'}${slideIn ? ' landing--slide-in' : ''}`}>
        <div className="landing__content">

          {/* About Short */}
          <div className="landing__section--about-short">
            <div className="about-card about-card--short">
              <p className="about-card__text t-p2">
                I started with graphic design, then evolved the process to build a studio where we created timeless brands, and from there towards making products solo.
              </p>
              <div className="about-card__divider" />
            </div>
          </div>

          {/* Hero */}
          <div className="landing__section--hero">
            <div className="hero-card">
              <div className="hero-card__bg">
                <div className="hero-card__content">
                  <p className="hero-card__greeting t-p4">{greeting}</p>
                  <h1 className="hero-card__headline t-h2">
                    I&rsquo;m a designer working across product, systems, and brand.
                  </h1>
                  <p className="hero-card__sub t-p3">I now focus primarily on systems.</p>
                </div>
                <button
                  className="pill-btn"
                  onClick={handlePillClick}
                  aria-label={expanded ? 'Collapse content' : 'Expand content'}
                >
                  {expanded ? <CollapseIcon /> : <ExpandIcon />}
                </button>
              </div>
            </div>
          </div>

          {/* Nav row — [Nihar] nameplate + expand trigger docked with [Works] link.
              Mirrors the /selected nav row pattern; terra-tinted to live in
              landing's color world. + icon rotates 45° to × on expand. */}
          <div className="landing__section--projects">
            <div className="landing-nav-row">
              <button
                className="nav-marker nav-marker--project landing-nav-row__nihar"
                type="button"
                onClick={handlePillClick}
                aria-expanded={expanded}
                aria-label={expanded ? 'Collapse content' : 'Expand content'}
              >
                <span className="nav-marker__content">
                  <span
                    className={`nav-icon landing-nihar-icon${expanded ? ' landing-nihar-icon--expanded' : ''}`}
                    aria-hidden="true"
                  >
                    add
                  </span>
                  <span className="nav-marker__name t-btn1">Nihar</span>
                </span>
              </button>
              <Link
                href="/selected"
                className="nav-marker nav-marker--chapter landing-nav-row__works"
                onClick={markToSelected}
              >
                <span className="nav-marker__content">
                  <span className="nav-icon" aria-hidden="true">arrow_forward</span>
                  <span className="nav-marker__title t-btn1">Works</span>
                </span>
              </Link>
            </div>
          </div>

          {/* About Long — split part 1: framing paragraph */}
          <div className="landing__section--about-long">
            <div className="about-card about-card--long">
              <p className="about-card__text t-p2">
                <span style={{ color: 'var(--grey-160)' }}>Now I look at the world through the lens of system design and sitting here, I could design anything (if it interests me enough). A game being the last one.</span>
              </p>
            </div>
          </div>

          {/* About Practice — split part 2: practice + life, framed sheet */}
          <div
            className="landing__section--about-practice"
            style={{ '--practice-rot': `${practiceRot}deg` } as React.CSSProperties}
          >
            <div className="about-card about-card--practice">
              <p className="about-card__text t-p2">
                My practice has evolved from designing symbols to designing objects, dashboards, processes that contribute to live systems. To live cultures.
              </p>
              <div className="about-card__divider about-card__divider--full" />
              <p className="about-card__text t-p2">
                I live well to be able to design well. I want to make my life and lives of those around me beautiful.
                <br /><br />
                Small interventions. In work. In daily life.
                <br />
                Adjustments that make things function better and make life feel better.
                <br /><br />
                Welcome to my collection of design interventions.
              </p>
            </div>
          </div>

          {/* Spectrum */}
          <div className="landing__section--spectrum" ref={spectrumRef}>
            <div className="spectrum" onClick={handleSpectrumClick}>
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
                    <Link className="spectrum__link t-btn1" href="/selected" onClick={markToSelected}>Works</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="landing__section--contact">
            <div className={contactClasses.join(' ')}>
              <div className="contact-card__border">
                <p className="contact-card__intro t-h1">
                  I am looking to give my creative practice its deepest and farthest expression. If we&rsquo;re going the same way, we could join our energies.
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
                <div className="contact-card__form-reveal" aria-hidden={!formOpen}>
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
                              {submitStatus === 'sent' && (
                                <span className="contact-form__success-pill" style={{ color: sentColor }}>Note Sent. Thank you.</span>
                              )}
                              {submitStatus === 'error' && (
                                <span className="contact-form__error-pill">There seems to be a network error on my side. I&rsquo;ve been notified. Please try again in a few hours.</span>
                              )}
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
                  <a className="contact-card__footer-right t-btn1" href="https://calendar.app.google/ek4WL37YAqTcytjH9" target="_blank" rel="noopener noreferrer">Book A Call</a>
                </div>
              </div>
            </div>
          </div>

        </div>

        <CaptionTag
          title="Startooth Pattern"
          year={2025}
          description="Geometric trapezoids, sliced by stars and diamonds, inspired by the houndstooth pattern."
          visible={!expanded}
        />
      </div>
    </>
  )
}
