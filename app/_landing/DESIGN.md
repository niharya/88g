# / (landing) — Design notes

Part of the 88g doc family (root `CLAUDE.md` → "The document family"). Intent and philosophy for the landing route's authored interactions. Protective archive: [`./ANOMALIES.md`](./ANOMALIES.md); working digest: [`./CLAUDE.md`](./CLAUDE.md).

---

## Void Rupture — the 9-click charge → break → re-grow

A hidden delight built on the Startooth canvas (`StartoothField`). Persistently poking **one void** (a star or diamond) *charges* it; on the 9th click the void **ruptures** — the field cuts to its bare wireframe and flickers like a pulled plug, then **regrows from that void** with a slightly different light. It rewards a curious visitor who keeps prodding the same spot.

**Status:** specced and built. No on-screen affordance — discovery only.

### State machine

`idle (done=true)` → **charging** (1…N−1) → **rupturing** (pulled-plug break) → **rebuilding** (`rebuildFrom(origin)`, `done=false`) → `idle (charge=0)`.

`rupturing` + `rebuilding` set `done=false`, and `pointer()` already early-returns on `!done` — so interaction is suppressed mid-rupture for free, reusing the build gate.

### 1 · Charge (same void only, with decay)

On a void click (`pointer()`'s `!isKey(u)` branch):
- Same void as the live charge → `charge = min(N, live + 1)`.
- Different void (or charge already bled to 0) → restart at 1 on the new void.

**Decay (Q3 = A):** the live charge is computed from the last-click timestamp, not accumulated per frame — after `CHARGE_DECAY` (~1.4 s) of no click on the charged void it bleeds toward 0 at `DECAY_FALL` (~0.9 s per unit). You have to keep poking *briskly* or it loses steam, which (a) reinforces the wind-up feel and (b) stops the rupture firing minutes after you walked away. The existing void-press feedback (push-in, void-wave, cross-ripple) still fires each click; the charge glow layers on top.

### 2 · Escalating glow — intensity = `charge / N`

- The charged void heats up: its fill lerps toward a hot tone (→ `EFFECT.ripple`), additive, pulsing.
- Near-critical (`intensity > ~0.7`): a sub-pixel **tremor** of the whole field — the "about to go" tension.
- Honors `prefers-reduced-motion` (keep the heat, drop the tremor).

### 3 · The rupture — a pulled plug, not a clean dissolve

At the Nth click the break reads electrical:
1. **Hard cut** — a bright overexposed flash, then a sharp blackout: power gone, no gradual dissolve.
2. **Flicker** — the bare wireframe stutters in/out (5–7 uneven on/off beats from a precomputed schedule), and as it does it **tears** (random horizontal sync-loss shift) and **loses bands** (black dropout strips punched across it) — a dying signal, not a tidy fade. *Occasional, not rhythmic.*
3. **Settle** on the broken outline for a breath (dropout eases off).

### 4 · The re-grow

`rebuildFrom(originX, originY)` replays the center-out build **originating at the void** — outline → fill spreading from the rupture point. `rebuildFrom` already resets `reduced → prefersReduced` (animates even on a skip-loaded page), drops the initial-load HOLD, re-bakes settled, and fires `onBuildComplete`. On completion: `done=true`, `charge=0`, idle.

**Variation (Q4):** each rupture advances a small curated palette ramp (`paletteVariants`) — the warm `face`/`top` tones nudge one step and wrap. Subtle: "same field, slightly different light." The `core` (read from `--surface-bg`) and the authored `-15°` tilt never change.

### Reduced motion (Q5)

Minimal: skip the tremor and the multi-stutter flicker; do a quick cut → settle → regrow (the rebuild is already instant when `reduced`).

### What's reused vs. new

Reused from the port: `rebuildFrom`, parametrized `build()` origin, the `done` gate, cross-ripple/void-wave drawers, `EFFECT` palette, `start()`/`bakeSettled()`, `lerpC`/`smoother`.
New: charge state (`chargeVoid`/`chargeBase`/`chargeAt` + `chargeLive()`), `triggerRupture()`, `buildFlickerSchedule()`, `drawRupture()` (loop branch beside `drawBuild`), `advancePalette()`, the glow + tremor in `drawInteractive`. Constants: `N=9`, `CHARGE_DECAY≈1400`, `DECAY_FALL≈900`, plus the flicker/tremor tuning.

Full protective rationale + don't-touch items live in [`./ANOMALIES.md`](./ANOMALIES.md) → "Void rupture".

---

## Idle breathing

After the field has sat untouched for `IDLE_BREATH` (~9 s), a few random key-tops gently brighten and recede — the same `topScatter` gold the lock-click uses, but at low magnitude (`mag ≈ 0.15`) and a slow symmetric **swell** envelope (`sin`) instead of the click's instant attack-decay. It's driven by a self-scheduling `setTimeout` (`scheduleIdle`/`idleTick`), not a continuous rAF: each breath kicks the loop only for the ~2–3 s the swell lives, then the loop sleeps until the next breath (2.6–6 s later). Any pointer activity stamps `lastActivity` and resets the 9 s idle clock; the build-complete also stamps it so idle counts from when the field settles. Skipped entirely under `prefers-reduced-motion`.
