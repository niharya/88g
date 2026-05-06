# /shape-of-product — anomalies

Architectural anomalies, cross-file wiring, and don't-touch items.
Read before editing the route.

---

## Layout & shell

**Route lives outside `(works)/`.** Pure canvas, no workbench frame, no
TransitionSlot, no chapter-marker / nav-sled. Mirrors `/marks`'s shell
shape. Layout owns the `CrossShellEntryFader` mount + the `SopNavRow`
nav pair.

**No inbound link from anywhere on the public site.** Reachable only
by direct URL. `CrossShellEntryFader` is mounted defensively — if a
future route adds a `useCrossShellNav` link to here, the veil will
land cleanly with no further wiring. Do not drop the fader.

**Theme color is overridden.** `viewport.themeColor` is set to
`#f9f9f7` (route's `--mat-bg`) in `layout.tsx`. The global default is
`#f2f3ef` and would paint the URL bar slightly cooler than the page
ground. Same pattern `/marks` uses for its dark canvas.

---

## Nav pair (`SopNavRow`)

**Center-aligned, not left-anchored.** `position: fixed; left: 50%;
transform: translateX(-50%)`. Different from `/selected` (left:560)
and `/marks` (top-right exit). The page is centered editorial prose,
so the nav reads better centered above the column.

**`text-transform: none` + `white-space: nowrap` on the chapter title.**
Two scoped overrides on `.sop-nav-row .nav-marker__title`:
- `text-transform: none` — t-btn1 applies `capitalize` for nav slots,
  which would render "Shape Of Product" (wrong for an editorial title
  with a lowercase "of").
- `white-space: nowrap` — the default `.nav-marker__title` lets long
  multi-word titles wrap. On mobile (375px), "Shape of Product" was
  wrapping to three lines because the marker's intrinsic width was
  constrained. Nowrap keeps the title on one line; the marker simply
  expands horizontally to fit.

Don't drop either — casing will silently regress, or the marker will
break on narrow viewports.

**The "Nihar" link sets `sessionStorage['nav-direction'] = 'to-landing'`**
so the landing page's `SlideInOnNav` can animate the hero in from the
left on arrival. Same pattern as `/selected/components/NiharHomeLink`.

**`NiharHomeLink` is consumed from the shared layer.** Promoted at
v0.79.0 from `/selected/components/NiharHomeLink.tsx` to
`app/components/NiharHomeLink/`. Both `/selected` and
`/shape-of-product` import from the shared path. The session-flag
side-effect (`nav-direction = 'to-landing'`) lives once.

---

## Inline chapter chips (`.sop__chip`)

**Icon collapse trick.** The `IconExternalLink` glyph at rest has
`width: 0`, `margin-inline-start: 0`, `opacity: 0`, `overflow: hidden`.
On hover/focus, all three transition together to `width: 14px` /
`margin-inline-start: 4px` / `opacity: 1`. The result is the icon
"unfurls" from inside the label edge, and the chip stays tight in
prose at rest. Counter-intuitive to read; an unaware refactor that
sets `width: 14px` permanently will widen the chip permanently and
push the surrounding prose around.

**Chip's NavMarker uses `flex-direction: row-reverse`** so the icon
trails the label. Padding is `4px 8px` (symmetric) instead of the
default `4px 32px 4px 8px` — without the override, the chip has 32px
of trailing whitespace past the (collapsed) icon.

**`text-transform: none` override on `.sop__chip .nav-marker__title`.**
Same rationale as the nav pair — chips quote prose phrases verbatim
("developer dashboards", "prototypes + stories"). Don't drop.

**Chips link to `/biconomy#ux-audit` and `/biconomy#demos` with
`target="_blank"`.** The hash anchors resolve to biconomy's
`<Sheet>` `<section id={chapter.id}>`. If biconomy's chapter slugs
ever change, these chips break silently. Also: new tab is intentional
— the icon literally is "open in new tab", and the reader is meant
to keep the essay loaded.

---

## Actor stickers (`ActorStickers`)

**Tilts and Y offsets are locked, not randomized.** Constants
`TILTS = [-3, 3, -1]` and `YS = [-6, 2, -3]` at module scope. Earlier
iterations randomized on mount; the user's editorial choice was to
freeze the pose. Don't re-add `Math.random()` here — the page renders
the same trio every visit, deliberately.

**Server-rendered.** No `'use client'` directive. The component has
no state / effects / event handlers; it just renders three
`<LabelSticker>` instances over module-level constants. `LabelSticker`
is `'use client'`, but Next.js handles the client/server boundary
crossing automatically.

**Each sticker is wrapped in a `.sop__actor-slot` span** so the
per-instance `translateY` lives on the wrapper. The inner
`<Sticker>`'s transform is already spent on rotation + hover lift —
overloading it would fight the family contract. The wrapper sets
`--sop-actor-y` inline; CSS reads it via `transform: translateY(...)`.

**The trio overlaps via `margin-inline-start: -16px`** between
adjacent slots. Later DOM siblings paint on top, so the rightmost
edge sits cleanest. Adjust the overlap and the click-rotate jitter
from `Sticker`'s family contract still works.

---

## Roles ↔ Approach stack (`RoleApproachStack`)

**Two cards in the same grid cell.** `display: grid;
grid-template-areas: 'card'` with both cards using `grid-area: card`.
The cell auto-sizes to the taller of the two contents (Roles' lede +
4 list items in the bips-notes format), and Approach (3 short lines)
stretches to match. Avoids the layout-jump-on-swap problem absolute
positioning has.

**Inactive card content is `aria-hidden`, not the whole card.** The
tab button stays in the document tree (and remains keyboard
focusable); only the inner `.sop__stack-content` is hidden from
assistive tech. A whole-card `aria-hidden={true}` would have been a
focusable-descendant violation.

**ARIA pattern: tablist with two tabs, each labelling its own
section.** `<div role="tablist">` wraps two `<section>`s. Each
section has `aria-labelledby` pointing at its heading; each tab is
`role="tab"` + `aria-controls` + `aria-selected`. Correct semantic
for a select-one-of-two state. Earlier attempts used `aria-pressed`
(toggle button semantic) — wrong for select-one.

**Approach is offset further than Roles when collapsed.** The
asymmetric `translate(40px, 10px)` (vs Roles' default `24px`) is
deliberate — yellow against the warm mat reads softer than olive,
so a bigger peek lets the tab signal "second card here" before the
user reaches for it. **On mobile** the Approach offset tightens to
`translate(28px, 10px)` (the stack body shrinks proportionally)
while Roles' default 24px stays untouched — the asymmetry is
preserved at every breakpoint, not flattened.

**Two `<h2>` headings, but one is `sr-only`.** Roles' heading is the
visible lede ("My role in those environments has been to:"). Approach
has no visible lede — its three sentences ARE the content. To keep a
clean document outline, the Approach `<h2>` is sr-only ("Approach").

**`useId` for SVG mask collision.** Each `ArrowBackIcon` instance
gets its own `mask` ID via `useId`. Defensive against rendering the
stack twice on the same page (mobile + desktop variants in the
future). Slight overkill today; harmless.

---

## Sign-off card (`SignOffCard`)

**Tilt is set via inline `style={{ transform: rotate(...) }}`, NOT a
CSS class.** When we tried the class-based approach
(`.sop__sign-off-card.is-flat { transform: rotate(0deg) }` over a
base `transform: rotate(2deg)`), the computed style stayed pinned at
2deg even after the class flipped — likely a transition / cascade
bug interacting with React's re-render. Inline style sidesteps the
issue. Do NOT refactor back to class-based transform; the tilt
animation will silently stop working.

**One-way settle.** `useState(true)` for `tilted`, `setTilted(false)`
on click. The card stays flat for the session — clicking again is a
no-op. Hover affordance: shadow lifts from `--shadow-resting` to
`--shadow-raised` on the tilted card; suppressed once flat.

**Promotion candidate.** The card visual (terra-replaced-with-blue
hero card from landing) is duplicated. Specifically:
`background: var(--blue-80)`, `color: var(--blue-800)`,
`box-shadow: var(--shadow-resting)`, `padding: 32px 64px 40px`,
`min-height: 240px`, centered greeting + headline + sub. If a third
consumer appears, lift the visual to `<HeroCard tone="blue">` (or
similar) and let landing keep the expand-pill-btn behaviour as a
route-local extension.

**Greeting comes from the shared `getGreeting` util.**
`useState(getGreeting)` lazy-inits on first client render so SSR and
hydration agree on a single value. Don't move the call into the
component body without `useState` — direct `getGreeting()` would run
on every render, and the server's hour wouldn't match the client's.

---

## Editorial chunks + dividers

**Three prose chunks separated by hairline dividers** wrapped in a
single `.sop__chunks` flex container with `gap: var(--space-56)`.
The two `<hr class="sop__divider">` siblings each get the full
56px breathing room above and below — uniform rhythm across the
lede. Don't break this into per-chunk margins; the flex `gap` is
load-bearing for the standardization. Adding a fourth chunk =
adding another divider sibling, no other changes needed.

**The chunks block is itself one `.sop` flex child.** The `.sop`
flex-gap (also 56px) flows the chunk block into the role/approach
stack with the same beat. Continuous rhythm through the page —
intentional. If you ever want to break the rhythm before the stack
(e.g. extra breathing room before "the work"), add a margin-bottom
to `.sop__chunks`, don't change the flex gap.

**Divider is `border-top: 1px solid var(--sop-prose-ink)` at 24%
opacity.** Tonal, not drawn — reads as a soft visual punctuation
between editorial sections. `aria-hidden` on the `<hr>` because the
divider is decorative, not navigational.

---

## Tokens & cascade

**Route-local token: `--sop-prose-ink`.** Set on `.route-sop`. Used
by `.sop__prose` for the main editorial ink. Earlier iterations
consumed `--rr-note-ink` from `/rr` — anti-pattern (cross-route
token reach), since the variable is only set inside `.route-rr`. The
route-local token has the same temperature; future palette work
adjusts a single declaration.

**Padding tokens: `--sop-pad-top` (160px desktop / 96 mobile),
`--sop-pad-bottom` (480 / 320).** Both are doubled on the bottom to
give the closing sign-off card breathing room before the page edge.
The mobile values are halved proportionally so the page doesn't feel
hollow on a narrow viewport.

---

## Responsive

**Stack overflow rule.** Desktop has `width: 280px` + 72px right
padding = 352px effective. On a 375px viewport with `.route-sop`'s
20px side padding, that overflows. Mobile drops the stack to
`max-width: 240px` and trims the right padding to 64. Approach's
inactive offset also tightens from 40 → 28.

**Mobile bottom padding is 320 (half of desktop's 480).** Doubling
intent preserved proportionally without making the page feel
hollow.

**ActorStickers are not responsively scaled.** The trio sits inline
in 24px Fraunces (desktop) / 20px Fraunces (mobile). Three pills at
12px t-h5 + overlap fits comfortably in both contexts. If the prose
ever wraps awkwardly around them on narrow viewports, that's a copy
adjustment, not a sticker-sizing one.
