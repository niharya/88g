# PRD / DESIGN — The Bench (Work Essay)

> Working spec for the `/all` redesign (route formerly `/selected`; "bench" codename). Replaces the prior
> FirstView+cue / single-flow Prelude compositions. Source design:
> `reference/design_handoff_work_essay/`. This file is the durable spec — update it
> as decisions land. Intent lives here; load-bearing wiring lives in `ANOMALIES.md`.

## 1. One-liner

`/all` is an engraved "invitation" essay: a blue broadside card carrying a short
first-person manifesto, footed by a letterpress **ticket** with two tabs. Clicking a
tab **morphs** the ticket into a pinned top navbar, scrolls the page up, and reveals
that browse mode below — **Longform → Timeline + Archive**, **Visual → the Showcase
bento** built on this branch. A ✕ reverses the whole choreography.

## 2. Goals / non-goals

**Goals:** high-fidelity port; reuse our tokens (no parallel value systems); reuse
`SelectedContent` (Timeline + Archive) and the `Showcase` grid as tab content; one
coherent morph built on our motion + scroll primitives; addressable + shareable
browse modes; smooth fit into the (works) shell.

**Non-goals (v1):** a finalized gold palette (iterate from terracotta); `poster`/`split`
closings; outline marks; ticket serials.

## 3. Experience & states

State machine (ported from the prototype): `view: invite|browse` · `active: lf|vis` ·
`condensed: bool` · `closing: bool`.

- **Resting (invite):** desk → `+Nihar` marker (top-left) → blue card (poem stanzas,
  crown star, divider diamond, script closing) → ticket (`Longform · ⟡ · Visual`).
- **Open (tab click):** freeze ticket → animate to pinned 296×56 navbar at `top:14px`;
  inner reshape (eyebrow/subtitle/serials collapse, title 27→18px, `Visual`→`Showcase`
  crossfade, ✕ appears); page glides up so the work panel tops out. **Ticket morph and
  scroll share one curve** so they move in lockstep.
- **Switch (while condensed):** instant in-place content swap, **no re-morph** (this is
  why cases/showcase must be one surface — see §6).
- **Close (✕):** content leads (fade + sink, stays mounted), ticket de-condenses onto
  the descending card, lands framed (~34% down), then seamless fixed→static hand-off
  with sub-pixel scroll compensation.

## 4. Architecture / IA

```
/all (page)                          ?cases  → opens Longform browse
└─ BenchPage (.bench-workbench)        ?showcase → opens Visual browse
   ├─ BenchExitMarker        "+Nihar" → / (top-left, role="exit")
   ├─ InvitationCard         poem · marks · closing   (the "first sheet")
   │  └─ Ticket              the single morphing element (rest ⇄ navbar)
   └─ WorkPanel              mounts on browse
      ├─ Longform → <SelectedContent/>  (Timeline + expandable Archive)
      └─ Visual   → <Showcase/>         (lifted out of ShowcaseSection)
```

### Routing (locked)

- **Rename `/selected` → `/all`**, canonical. Add a permanent **redirect
  `/selected → /all`** so old inbound links + `og:canonical` survive.
- **Addressable views via bare query flags:** `/all?cases`, `/all?showcase`
  (read server-side as `'cases' in sp` / `'showcase' in sp`; showcase wins if both).
  Chosen over real routes deliberately — `useSelectedLayoutSegment` ignores
  search-params, so view changes **never trigger a shell TransitionSlot transition**,
  and the morph stays a single-surface interaction.
- **Pretty inbound aliases via `next.config` rewrites:** `/cases → /all?cases`,
  `/showcase → /all?showcase`. These are the share/entry URLs; rewrites keep the
  pretty path in the address bar. A *client-side* tab click doesn't push any query
  (it just swaps the active tab + scrolls), so the URL stays put — no `pushState`
  desync with the App Router.

### Why not three real routes

The morph + lift-to-reveal is one continuous scroll surface in one DOM tree (the ticket
is a single element animating rest→navbar→rest; switching cases↔showcase while condensed
is an instant in-place swap). Splitting into routes dissolves the "work lives beneath the
lifted invitation" metaphor and would force cross-route shared-element transitions running
alongside TransitionSlot — and TransitionSlot stays on Framer Motion, **not** the View
Transitions API (load-bearing, per root CLAUDE.md). Rejected.

## 5. Shell integration & seams

The (works) section is hub-and-spoke: **Landing → `/all` (hub) → Timeline cards →
`/rr`, `/biconomy`, `/marks`**; and **all of those EXIT back to the hub.** `Timeline.tsx`
is the only entry point to the deep case studies. Implications:

1. **Return seam (load-bearing):** case-study EXIT lands the hub at scroll 0. Post-restructure
   that's the resting *invite*, not the timeline the user came from. **Fix:** point all EXIT
   targets at **`/all?cases`** (shell `ExitMarker`, `MarksExitMarker`); on entry the
   bench reads `?view` and opens directly into that browse state (fast-forward past the morph).
2. **Exit happens *from browse mode*:** you reach `/rr` from inside Longform (condensed ticket,
   scrolled). TransitionSlot snapshots that — a `position:fixed` ticket cloned into a
   `position:absolute` ghost it then transforms. **Fix:** dissolve the morph (ticket back to
   flow, `condensed:false`) *before* `router.push` on any nav-out, or neutralize the fixed
   element in the clone.
3. **Dim-selector contract:** TransitionSlot's exit dim targets
   `'.sheet > :not(.nav-sled), .selected-workbench > *'`. The wrapper renames to
   **`.bench-workbench`** — update this selector in the SAME commit or the ghost won't dim.
4. **Top chrome:** `ShellNav` already hides its markers on the hub (`shell-nav-hidden`,
   keyed by segment — update to `bench`). Hub top chrome = `+Nihar` (left) + pinned ticket
   navbar (center). Design the two as one bar.
5. **Idiom:** the bench adds a third interaction idiom to the shell (sheet-stack reading ·
   flat hub · **morph-invite**). Don't unify it with the `Sheet`/`useReveal` model.
6. **Footer:** layout-level, below the workbench. Correct under the work panel in browse;
   in invite it's reachable by scrolling past the 100vh desk — decide sealed vs. peek.

### Rename touch-list (one mechanical commit)

`app/page.tsx` (landing link + slide flag `to-selected`→`to-bench`), `ShellNav.tsx`
(`segmentNames`, `isSelected`→`isBench`, `shell-nav-hidden` gate), `TransitionSlot.tsx`
(`prefetch('/all')`, dim selector, spatial comments), `selected/` folder → `bench/`,
`page.tsx` `metadata.canonical`, `ExitMarker.tsx`, `MarksExitMarker.tsx`,
`PrivacyReturn.tsx` mapping. ~32 refs / 7 files. Plus redirect + rewrites in `next.config`.

## 6. Token & porting spec (decisions applied)

**Blues — exact, port to token:** card `#E0EFFE`=`--blue-80`, border `#0364A7`=`--blue-800`,
opener ink `#0477C5`=`--blue-720`, deep `#013B66`=`--blue-960`, hairline `#90C8FE`=`--blue-320`,
tile border `#C7E3FE`=`--blue-160`. Minor→nearest: keyline `#9CCBFB`→`--blue-240`, watermark
`#D2E6FB`→`--blue-80/160`, closing eyebrow `#5E97CC`→`--blue-480/560`.

**Ticket — terracotta for v1, iterate to a `--gold-*` ramp later:**

| Design | v1 → token | Note |
|---|---|---|
| active title `#533301` | `--terra-960` | exact |
| eyebrow/subtitle `#A16803` | `--terra-720` | exact |
| bead `#C58B2E` | `--terra-560` | close |
| border `#E2B877` | `--terra-240` | reads saturated — iterate |
| keyline `#EAC892` | `--terra-160` | iterate |
| fill `#FBF5EB` | `--terra-80` / `--mat-bg` | iterate |
| muted `#B7A07C` | `--terra-560` desat | no exact — iterate |
| close `#B7945A` | `--terra-560` | iterate |

**Marks (filled):** render the handoff's inline star/diamond paths, filled. v1 color =
`--blue-800` (coherent in the blue card). OPEN: design uses green `#028634` (ties to the
poem's "plant growth") — we have no green token; decide blue vs. introduce/seal a green.

**`+Nihar` marker:** route-local, reuses the `MarksExitMarker`/`.exit-marker` treatment
(`NavMarker role="exit"`, `icon arrow_back`), top-left, `href="/"` with
`nav-direction=to-landing`. Greys: rest `#CFCBC2`→`--grey-720`, hover `#A8A294`→`--grey-560`
(slightly darker than marks). Label **"+Nihar"**.

**Fonts:** Fraunces / Google Sans / Google Sans Code / Google Sans Flex already in
`app/fonts/`. **Pinyon Script** embedded scoped via `next/font/google`, applied only to
`.bench-*` (RR-scene precedent; not promoted to globals). VERIFY: our `Fraunces-normal.woff2`
carries `SOFT`/`WONK` axes.

## 7. Motion spec (our tiers; overshoot removed)

| Design | → ours |
|---|---|
| morph geometry `cubic-bezier(.65,0,.35,1)` 580ms | `--ease-paper` @ `--dur-glide` |
| scroll tween (same curve, lockstep) | `scrollGlide()` (already paper-eased) |
| **pop `cubic-bezier(.34,1.5,.64,1)` (overshoot)** | **removed** — keep subtle `translateY(-13→0)` lift on `--ease-paper`, drop `scale(1.03)` |
| inner reshape 0.4–0.54s | `--dur-settle` |
| close content fade 0.3 / sink 0.42 | `--dur-slide` / `--dur-settle` |
| EXIT hover `(.45,0,.15,1)` 0.175s | `--ease-snap` + `--dur-fast` (exact) |
| `blueCurrent` 9–10s infinite drift | ambient (below paper tier by intent; reduced-motion-gated) — OPEN: keep or static |

## 8. Responsive

Study `Work Essay — Mobile.dc.html` before this phase. Per handoff: poem reflows,
full-width ticket, watermark a single centered ghost; morph still runs. Crafted-lite
stance; `/marks` is the quality bar. No `scale()`, no JS media queries.

## 9. Accessibility / reduced motion

Gate `blueCurrent` AND the morph/scroll tweens behind `prefers-reduced-motion` → snap to
end-states. Tabs are real `<button>`s; ✕ keeps `aria-label`. Close keeps content mounted
to avoid scroll-clamp jumps.

## 10. Build phases (reviewable; stop between each)

0. **Rename & plumbing** — `/selected`→`/all`, redirect, rewrites (`/cases`,`/showcase`),
   the rename touch-list, `.bench-workbench` + dim-selector. Verify existing page works at
   `/all` and aliases resolve. (`?view`↔state lands in Phase 5.)
1. **Foundation** — Pinyon embed + Fraunces axis check; token mapping; mark-fill resolution.
2. **Static bench** — desk, card, poem, marks, closing, `+Nihar`. No motion. → review.
3. **Ticket resting** — full ticket, tabs, perforation/bead, hover.
4. **Morph** — `useBenchMorph` + imperative geometry + `scrollGlide` lockstep; open/switch/close;
   overshoot removed. → review (risk-heavy).
5. **Shell integration** — `?view`⇄morph state; reset-on-nav-out; EXIT targets → `?cases`.
6. **Tab content** — `SelectedContent` (Timeline+Archive) into Longform; `Showcase` into Visual;
   verify archive-expand inside the tab. `HeaderBlock` AND `HintRow` were both dropped — the Visual
   grid is now headed by a category **FilterStrip** (All · Interface · Brand), a single-select
   radiogroup that recedes non-matching tiles (pure-CSS). See `ANOMALIES.md` → "Filter strip".
7. **Responsive** — port mobile composition.
8. **Motion polish + a11y** — ambient gradient, reduced-motion gates.
9. **Cleanup + docs** — retire `FirstView`/cue/`ShowcaseSection`/`Prelude`; rewrite `ANOMALIES`
   overview + add morph-contract anomaly; rename the `/selected` doc digest → `/all`; LIBRARY
   entries for anything promoted.

## 11. Open items

1. **Mark color** — filled `--blue-800` (default) vs. a green for the botanical tie-in.
2. **Ambient gradient** — keep the slow `blueCurrent` drift vs. static gradient.
3. **Manifesto copy** — "close to final"; confirm before Phase 2 sets it.
4. **Footer in invite** — sealed (no peek) vs. allow scroll-to-footer.
