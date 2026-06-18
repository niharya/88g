'use client'

/**
 * LifecycleGauge — a self-contained "tuner dial" gauge for a job-application lifecycle.
 *
 * Imported wholesale from the AI-built reference at
 * /Users/nihar.bico/88g/reference/connektion-resources/lifecycle-gauge.
 * The only project-side change is the `'use client'` directive (needed
 * because this component uses `useEffect`/`useRef`). All other code
 * — the scoped `.lcg` CSS injected inline, the SVG filter, the rewind
 * animation — is preserved as authored. Design-language alignment with
 * the portfolio (radii, easing, typography, colour tokens) is a later
 * pass.
 *
 * Usage:
 *   import LifecycleGauge from "./LifecycleGauge";
 *   <LifecycleGauge />                         // auto-plays + click/Enter to advance
 *   <LifecycleGauge autoPlay={false} />        // static, advances only on click
 *   <LifecycleGauge stages={myStages} dwellMs={2200} />
 *
 * Notes:
 *  - All styles are scoped under `.lcg` and injected by the component, so it
 *    won't collide with your app CSS. Nothing else to import.
 *  - Loads its own metrics; the box renders at its natural 138×115. To display
 *    larger without blur, wrap it: <div style={{ transform: "scale(2)", transformOrigin: "top left" }}>…</div>
 *  - Expects the "Inter" font to be available; falls back to system-ui otherwise.
 *  - Honors prefers-reduced-motion.
 */
import { useEffect, useRef } from "react";

export type LifecycleStage = { name: string; date: string };

const DEFAULT_STAGES: LifecycleStage[] = [
  { name: "Saved", date: "02 Jun 2021" },
  { name: "Applied", date: "09 Jun 2021" },
  { name: "Reviewed", date: "18 Jun 2021" },
  { name: "Interview", date: "28 Jun 2021" },
  { name: "Offer", date: "06 Jul 2021" },
  { name: "Accepted", date: "09 Jul 2021" },
];

export interface LifecycleGaugeProps {
  stages?: LifecycleStage[];
  /** Auto-advance through the stages and loop. Default: true */
  autoPlay?: boolean;
  /** Dwell time per stage in ms. Default: 1850 */
  dwellMs?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function LifecycleGauge({
  stages = DEFAULT_STAGES,
  autoPlay = true,
  dwellMs = 2500,
  className = "",
  style,
}: LifecycleGaugeProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const blur = blurRef.current;
    if (!box) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let active = 0;
    let timer: number | undefined;

    const setActive = (i: number) => {
      active = Math.max(0, Math.min(stages.length - 1, i));
      box.style.setProperty("--active", String(active));
    };

    // sine-ramped horizontal blur (0 → peak mid-glide → 0) on the rewind
    const motionBlur = (ms: number, maxB: number) => {
      if (reduce || !blur) return;
      const t0 = performance.now();
      const frame = (now: number) => {
        const t = Math.min(1, (now - t0) / ms);
        blur.setAttribute("stdDeviation", (Math.sin(t * Math.PI) * maxB).toFixed(2) + " 0");
        if (t < 1) requestAnimationFrame(frame);
        else blur.setAttribute("stdDeviation", "0 0");
      };
      requestAnimationFrame(frame);
    };

    const rewind = () => {
      box.classList.add("is-rewinding");
      setActive(0);
      motionBlur(650, 12);
      window.setTimeout(() => box.classList.remove("is-rewinding"), 700);
    };

    // Auto-loop just advances — no press tick on auto-advance. The
    // press-in interaction (scale + needle desaturation) is reserved
    // for user clicks, where it reads as a deliberate input.
    const loop = () => {
      if (active >= stages.length - 1) {
        rewind();
      } else {
        setActive(active + 1);
      }
      // Same dwell after rewind as after a normal advance — removed the
      // previous +400 ms wait so the gauge stays in lock-step with the
      // JobChipStack's interval (both 2500 ms).
      timer = window.setTimeout(loop, dwellMs);
    };
    const play = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(loop, dwellMs);
    };
    const pause = () => window.clearTimeout(timer);

    const advance = () => {
      pause();
      box.classList.remove("is-pressed");
      void box.offsetWidth; // restart the press animation
      box.classList.add("is-pressed");
      if (active >= stages.length - 1) rewind();
      else setActive(active + 1);
    };

    const onClick = () => advance();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        advance();
      }
    };
    const onAnimEnd = () => box.classList.remove("is-pressed");

    box.addEventListener("click", onClick);
    box.addEventListener("keydown", onKey);
    box.addEventListener("animationend", onAnimEnd);

    setActive(0);
    if (autoPlay) play();

    return () => {
      window.clearTimeout(timer);
      box.removeEventListener("click", onClick);
      box.removeEventListener("keydown", onKey);
      box.removeEventListener("animationend", onAnimEnd);
    };
  }, [stages, autoPlay, dwellMs]);

  return (
    <div
      ref={boxRef}
      className={`lcg ${className}`.trim()}
      role="button"
      tabIndex={0}
      aria-label="Application lifecycle stage"
      style={style}
    >
      <style>{LCG_CSS}</style>

      <div className="lcg__track">
        <div className="lcg__rule" />
        {stages.map((s, i) => (
          <div className="lcg__station" key={i} style={{ "--i": i } as React.CSSProperties}>
            <span className="lcg__name">{s.name}</span>
            <span className="lcg__date">{s.date}</span>
            <span className="lcg__tick" />
          </div>
        ))}
      </div>

      <div className="lcg__needle">
        <svg viewBox="0 0 30 18" fill="none">
          <path d="M15 3.5 L26 14.5 L4 14.5 Z" />
        </svg>
      </div>

      {/* SVG filter for the rewind motion blur */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <filter id="lcg-mblur" x="-30%" y="-10%" width="160%" height="120%" colorInterpolationFilters="sRGB">
            <feGaussianBlur ref={blurRef} in="SourceGraphic" stdDeviation="0 0" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

const LCG_CSS = `
@property --active { syntax: '<number>'; inherits: true; initial-value: 0; }

.lcg {
  --ink: #353535; --name: #F5F5F5; --date: #CCCCCC; --rule: #7A7A7A;
  --needle: #FF5F33; --frame: #000;
  --step: 88px; --w: 138px; --h: 115px; --half: 69px; --bw: 3px; --tick-y: 64px;
  --ease-paper: cubic-bezier(0.5, 0, 0.2, 1);
  --ease-snap:  cubic-bezier(0.45, 0, 0.15, 1);
  --glide: 0.65s;
  --active: 0;
  transition: --active var(--glide) var(--ease-paper);
  position: relative; width: var(--w); height: var(--h);
  border: var(--bw) solid var(--frame); border-radius: 6px; overflow: hidden;
  background: var(--ink);
  box-shadow: 0 3px 8px -1px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.10);
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  cursor: pointer; -webkit-font-smoothing: antialiased; user-select: none;
  box-sizing: border-box;
}
.lcg *, .lcg *::before, .lcg *::after { box-sizing: border-box; }
.lcg::before {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px);
  background-size: 11px 11px;
}
.lcg::after {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background:
    linear-gradient(90deg, var(--ink) 0, transparent 18%, transparent 82%, var(--ink) 100%),
    radial-gradient(120% 92% at 50% 45%, transparent 36%, rgba(0,0,0,0.40) 100%);
}
.lcg__track {
  position: absolute; top: 0; left: 0; height: var(--h);
  transform: translateX(calc(var(--half) - var(--bw) - var(--active) * var(--step)));
  will-change: transform;
}
.lcg__rule {
  position: absolute; left: calc(-3 * var(--step)); width: calc(12 * var(--step));
  top: var(--tick-y); height: 8px; color: var(--rule);
  background-image: repeating-linear-gradient(90deg,
    currentColor 0, currentColor 1px, transparent 1px, transparent calc(var(--step) / 3));
}
.lcg__station {
  position: absolute; top: 0; left: calc(var(--i) * var(--step));
  transform: translateX(-50%); width: 120px; height: var(--h); text-align: center;
}
.lcg__name { display: block; margin-top: 14px; font-size: 16px; font-weight: 600; letter-spacing: -0.2px; line-height: 1; color: var(--name); }
.lcg__date { display: block; margin-top: 6px; font-size: 12px; font-weight: 400; white-space: nowrap; color: var(--date); }
.lcg__tick { position: absolute; left: 50%; top: var(--tick-y); width: 3px; height: 13px; margin-left: -1.5px; border-radius: 2px; background: var(--rule); }
.lcg__needle { position: absolute; top: 82px; left: 50%; transform: translateX(-50%); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.45)); z-index: 2; }
.lcg__needle svg { width: 30px; height: 18px; display: block; }
.lcg__needle path { fill: var(--needle); stroke: var(--needle); stroke-width: 3.6; stroke-linejoin: round; }
/* User-click only: the needle desaturates and dims for the press beat —
   reads as pressed into the device, lost its lit charge briefly. Auto-
   advance does NOT trigger this; only user clicks add the is-pressed
   class. The transition uses the long paper glide on the way out so the
   colour returns warmly, and the snap curve on the way in so the press
   itself feels tactile. Filter functions match between rest and pressed
   (drop-shadow + saturate + brightness, with values varying) so the
   browser interpolates each function value cleanly. */
.lcg__needle {
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.45)) saturate(1) brightness(1);
  transition: filter var(--glide) var(--ease-paper);
}
.lcg.is-pressed .lcg__needle {
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.45)) saturate(0.15) brightness(0.7);
  transition: filter 0.12s var(--ease-snap);
}
.lcg.is-pressed { animation: lcg-press 0.24s var(--ease-snap); }
@keyframes lcg-press { 0% { transform: scale(1); } 34% { transform: scale(0.945); } 100% { transform: scale(1); } }
.lcg.is-rewinding .lcg__track { filter: url(#lcg-mblur); }
@media (prefers-reduced-motion: reduce) {
  .lcg { transition-duration: 0.001s; }
  .lcg.is-pressed { animation: none; }
}
`;
