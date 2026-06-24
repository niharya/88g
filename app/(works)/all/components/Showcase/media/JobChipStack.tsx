'use client'

// Connektion job-chip stack — imported wholesale from the AI-built
// reference at /Users/nihar.bico/88g/reference/connektion-resources/
// job-chip. ONLY change vs the reference file: `motion/react` import
// swapped to `framer-motion` to match this project's installed package
// (same API surface). Everything else preserved as authored;
// alignment with the portfolio's design language (radii, easing,
// typography) is a later pass.
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// Six-stage lifecycle, matched verbatim to LifecycleGauge's stage list.
// Bar widths progress 40 → 240 in steady 40 px steps so the bar's growth
// reads as evenly-spaced progress across the 6 stages (instead of the
// previous 4-stage 60 → 240 steps).
//
// Stage palette mapping rationale:
//   - Saved:     soft grey  (passive — just bookmarked, no action yet)
//   - Applied:   coral      (committed — same as the original spec)
//   - Reviewed:  blue       (considered — formerly the "In Review" tone)
//   - Interview: yellow     (engaged — repurposed the original "Shortlist"
//                            tone so no hue is wasted)
//   - Offer:     bright green + dark-green paint fill (the existing
//                            celebratory flourish from the reference,
//                            preserved)
//   - Accepted:  pale green (closing state — bar at full width, dark
//                            text reads "done"; intentionally calmer than
//                            Offer so the moment of celebration belongs
//                            to Offer's transition, not Accepted's hold)
export const STAGES = [
  { label: "Saved",     barColor: "#e5e7eb", dotColor: "#9ca3af", labelColor: "#4b5563", barWidth:  40, textColor: "#0f171a", barOpacity: 1   },
  { label: "Applied",   barColor: "#fcc0bc", dotColor: "#E84033", labelColor: "#9c1a0e", barWidth:  80, textColor: "#0f171a", barOpacity: 1   },
  { label: "Reviewed",  barColor: "#98ddff", dotColor: "#0C9EE5", labelColor: "#0666a0", barWidth: 120, textColor: "#0f171a", barOpacity: 0.6 },
  { label: "Interview", barColor: "#f9df9c", dotColor: "#F2B826", labelColor: "#9c7008", barWidth: 160, textColor: "#0f171a", barOpacity: 1   },
  { label: "Offer",     barColor: "#4ade80", dotColor: "#16a34a", labelColor: "#0d6530", barWidth: 200, textColor: "#ffffff", barOpacity: 1   },
  // Accepted: solid bar in the deep-green dot tone, no dot. The bar reads
  // as a finished/filled state — the dot would have nowhere to travel
  // beyond the bar's right edge anyway. Swatch label tone is light
  // (`#d1fae5`) — dark-on-dark was unreadable on the deep-green swatch.
  { label: "Accepted",  barColor: "#15803d", dotColor: "#15803d", labelColor: "#d1fae5", barWidth: 240, textColor: "#0f171a", barOpacity: 1, hideDot: true },
];

// Slot 1 (directly behind the front chip) bumped from the reference's
// opacity 0.80 → 1.00 so it reads as a solid card instead of a wash.
// The reference's 0.80 was tuned for darker Shortlist/Applied tones;
// the 6-stage palette now puts the bright Offer green (#4ade80) here
// at times, which at 0.80 opacity reads as translucent rather than
// "behind." Slots 2 & 3 keep their fades — depth still implied at the
// back of the stack, just no longer at the layer closest to the front.
const SLOTS = [
  { y: 0,  scale: 1,     opacity: 1,    zIndex: 40, shadow: "0px 12px 32px rgba(0,0,0,0.22), 0px 2px 6px rgba(0,0,0,0.10)" },
  { y: 27, scale: 0.95,  opacity: 1.00, zIndex: 30, shadow: "0px 4px 12px rgba(0,0,0,0.13)" },
  { y: 55, scale: 0.905, opacity: 0.52, zIndex: 20, shadow: "0px 2px 6px rgba(0,0,0,0.09)"  },
  { y: 82, scale: 0.86,  opacity: 0.28, zIndex: 10, shadow: "0px 1px 3px rgba(0,0,0,0.07)"  },
];

// ---------------------------------------------------------------------------
// Motion constants — RESTORED from the original reference's choreography
// after the GLIDE/PRESS/FADE unification was reverted. The original
// timings read excellent and are kept verbatim:
//
//   MOVE — spring physics for stack slot positions. Critically-damped,
//          no bounce — settles fast, lands soft.
//   BAR  — tween for bar width, bar/text/dot colour shifts. Easy in/out
//          at 0.40 s; doesn't compete with the snappier push.
//   FADE — short opacity-only fades (swatch ghost / un-ghost).
//   PAINT_IN — Offer paint-fill flourish. SHORTENED from the reference's
//          0.72 s to 0.40 s so the dark-green clip-path covers the chip
//          on the same beat that the text + bar finish transitioning,
//          eliminating the "see-through" gap where white text landed on
//          the still-light surface for ~100 ms.
//   PAINT_OUT — Offer paint-fill exit fade, reference's 0.25 s.
// ---------------------------------------------------------------------------
const MOVE       = { type: "spring", stiffness: 420, damping: 26 }              as const;
const BAR        = { type: "tween",  duration: 0.40, ease: "easeInOut" }        as const;
const FADE       = { type: "tween",  duration: 0.20, ease: "easeOut" }          as const;
const PAINT_IN   = { duration: 0.40, ease: [0.22, 0.8, 0.36, 1] }               as const;
const PAINT_OUT  = { duration: 0.25 }                                            as const;

// ---------------------------------------------------------------------------
// Pure colored swatch — used for every slot in the physical stack.
// Slot 0 keeps the swatch invisible (the persistent chip sits on top of it).
// ---------------------------------------------------------------------------
function SwatchCard({ stage, ghost, mono }: { stage: typeof STAGES[number]; ghost: boolean; mono: boolean }) {
  return (
    <motion.div
      animate={{ opacity: ghost ? 0 : 1, filter: mono ? "grayscale(1)" : "grayscale(0)" }}
      transition={FADE}
      style={{
        width: 260, height: 72, borderRadius: 6,
        backgroundColor: stage.barColor, position: "relative",
      }}
    >
      {!ghost && (
        <p style={{
          position: "absolute", bottom: 5, left: 0, right: 0, margin: 0,
          textAlign: "center", fontFamily: "'Inter', sans-serif",
          fontWeight: 700, fontSize: 10, textTransform: "uppercase",
          letterSpacing: "0.1em", color: stage.labelColor, pointerEvents: "none",
        }}>
          {stage.label}
        </p>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Persistent chip — fixed at the front position (top:0 left:0), always visible.
// Text never disappears. Progress bar animates on stage change.
// Offer transition: dark-green paint fill via clip-path.
// ---------------------------------------------------------------------------
function PersistentChip({ stage, pushTick }: { stage: typeof STAGES[number]; pushTick: number }) {
  const offerCtrl = useAnimation();
  const pushCtrl  = useAnimation();
  const prevLabel = useRef<string>("");

  // Paint fill
  useEffect(() => {
    const prev = prevLabel.current;
    prevLabel.current = stage.label;

    if (stage.label === "Offer" && prev !== "Offer") {
      // Asymmetric ellipse spreading from bottom-left tilted toward top-
      // right. PAINT_IN (0.40 s) is the SHORTENED reference timing — the
      // dark-green ellipse now fully covers the chip on the same beat
      // BAR (0.40 s) finishes shifting the text to white, so white text
      // never lands on the light surface. Was 0.72 s; that 320 ms gap
      // was the "see-through" the user reported.
      offerCtrl.set({ clipPath: "ellipse(0% 0% at 15% 90%)", opacity: 1 });
      offerCtrl.start({
        clipPath: "ellipse(200% 180% at 15% 90%)",
        transition: PAINT_IN,
      });
    } else if (stage.label !== "Offer" && prev === "Offer") {
      offerCtrl.start({ opacity: 0, transition: PAINT_OUT });
    }
  }, [stage.label]);

  // Push reaction — front card subtly lurches forward when stack advances
  useEffect(() => {
    if (pushTick === 0) return;
    pushCtrl.start({
      y: [0, -4, 0],
      scale: [1, 1.014, 1],
      transition: { duration: 0.38, times: [0, 0.28, 1], ease: "easeOut" },
    });
  }, [pushTick]);

  return (
    <motion.div
      animate={pushCtrl}
      style={{
        width: 260, height: 72, borderRadius: 6,
        position: "relative", overflow: "hidden",
        backgroundColor: "#f1f5f8",
      }}
    >
      {/* Offer dark-green fill — invisible by default, paints in on Offer entry */}
      <motion.div
        animate={offerCtrl}
        initial={{ clipPath: "ellipse(200% 180% at 15% 90%)", opacity: 0 }}
        style={{ position: "absolute", inset: 0, backgroundColor: "#0f3d2e" }}
      />

      {/* Text — always visible, color follows stage. Type recipe matches  */}
      {/* the LifecycleGauge: title 16/600 with -0.2px tracking, subtitle  */}
      {/* 12/400 — size-contrast hierarchy shared across both specimens.   */}
      <motion.p
        animate={{ color: stage.textColor }}
        transition={BAR}
        style={{
          position: "absolute", top: 11, left: 10, margin: 0, zIndex: 2,
          fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 16,
          letterSpacing: "-0.2px", lineHeight: 1, whiteSpace: "nowrap",
        }}
      >
        Junior Shoemaker
      </motion.p>
      <motion.p
        animate={{ color: stage.textColor }}
        transition={BAR}
        style={{
          position: "absolute", top: 32, left: 10, margin: 0, zIndex: 2,
          fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12,
          lineHeight: 1, whiteSpace: "nowrap",
        }}
      >
        Nike
      </motion.p>

      {/* Progress bar */}
      <motion.div
        animate={{ width: stage.barWidth, backgroundColor: stage.barColor, opacity: stage.barOpacity }}
        transition={BAR}
        style={{ position: "absolute", top: 58, left: 10, bottom: 6, borderRadius: 8, zIndex: 2 }}
      />
      {/* Dot — center aligned to bar: top 58 + height/2 (4) = 62 = 50% + 26.   */}
      {/* Stages with `hideDot: true` (Accepted) fade the dot out — the bar    */}
      {/* itself takes the dot's tone so it reads as filled-to-completion.     */}
      <motion.div
        animate={{
          left: 10 + stage.barWidth - 4,
          opacity: stage.hideDot ? 0 : 1,
        }}
        transition={BAR}
        style={{
          position: "absolute", top: "calc(50% + 26px)", transform: "translateY(-50%)",
          width: 8, height: 8, zIndex: 2,
        }}
      >
        <motion.div
          animate={{ backgroundColor: stage.dotColor }}
          transition={BAR}
          style={{ width: 8, height: 8, borderRadius: "50%" }}
        />
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
type CardEntry = { id: number; stageIndex: number };

export function JobChipStack() {
  const nextId = useRef(4);
  const [queue, setQueue] = useState<CardEntry[]>([
    { id: 0, stageIndex: 0 },
    { id: 1, stageIndex: 1 },
    { id: 2, stageIndex: 2 },
    { id: 3, stageIndex: 3 },
  ]);
  const [paused, setPaused] = useState(false);
  const [pushTick, setPushTick] = useState(0);

  const advance = () => {
    setQueue(q => [
      ...q.slice(1),
      { id: nextId.current++, stageIndex: (q[q.length - 1].stageIndex + 1) % STAGES.length },
    ]);
    setPushTick(t => t + 1);
  };

  useEffect(() => {
    if (paused) return;
    const t = setInterval(advance, 2500);
    return () => clearInterval(t);
  }, [paused]);

  const lastSlot = SLOTS[SLOTS.length - 1];

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        onClick={advance}
        style={{ position: "relative", width: 260, height: 72 + lastSlot.y + 8, cursor: "pointer" }}
      >

        {/* Physical card stack — all slots, slot 0 is a ghost (invisible swatch) */}
        <AnimatePresence mode="sync">
          {queue.map((card, idx) => {
            const slot = SLOTS[idx];
            return (
              <motion.div
                key={card.id}
                initial={idx === queue.length - 1
                  ? { y: lastSlot.y + 16, scale: lastSlot.scale - 0.03, opacity: 0 }
                  : false
                }
                animate={{ y: slot.y, scale: slot.scale, opacity: slot.opacity }}
                exit={{ opacity: 0, transition: { duration: 0.18 } }}
                transition={MOVE}
                style={{
                  position: "absolute", top: 0, left: 0,
                  zIndex: slot.zIndex,
                  transformOrigin: "center bottom",
                  boxShadow: slot.shadow,
                  borderRadius: 6,
                }}
              >
                <SwatchCard stage={STAGES[card.stageIndex]} ghost={idx === 0} mono={idx === SLOTS.length - 1} />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Persistent chip — floats above the stack at front position, never moves */}
        <div style={{
          position: "absolute", top: 0, left: 0,
          zIndex: 50, borderRadius: 6, overflow: "hidden",
          // No shadow here — the slot-0 wrapper below provides it
        }}>
          <PersistentChip stage={STAGES[queue[0].stageIndex]} pushTick={pushTick} />
        </div>
      </div>

    </div>
  );
}
