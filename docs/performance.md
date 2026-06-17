# Performance hygiene

Full reference for keeping the portfolio fast. CLAUDE.md carries a short
summary; read this file before adding fonts, images, icons, or touching the
motion tokens.

The site lives or dies by perceived speed. The rules below exist because each
one was, at some point, a real regression that took a real user-visible hit.

---

## Fonts

**The contract:**

- All fonts ship from `app/fonts/` as `.woff2` files. No external `<link>` to `fonts.googleapis.com`. No CDN-hosted font files.
- Wired through [`next/font/local`](https://nextjs.org/docs/app/api-reference/components/font#localfont) in [app/layout.tsx](../app/layout.tsx). Each font produces a `--font-*` CSS variable consumed by `globals.css` and route CSS.
- `display: 'swap'` on every font. Fallback renders immediately and swaps to the real face when it arrives — never invisible text on slow mobile.
- `fallback: [...]` arrays carry the system fallback chain (e.g. `system-ui`, `-apple-system`) on every `localFont()` call. next/font uses these to generate a metric-adjusted fallback face, minimising layout shift on swap.
- `preload: true` only on fonts used by the **landing page** (Fraunces, Google Sans, Google Sans Flex). Others (`code`, `symbols`) get `preload: false` so they don't bloat the landing critical path.
- `globals.css` **must not** redeclare the `--font-*` variables in `:root`. next/font sets them on `<html>` to hashed family names that scope the generated `@font-face` rules — redeclaring with literal names (`'Fraunces'`, `'Google Sans'`, …) detaches the cascade from the loaded woff2 files. Pages then fall back to whatever's installed locally, which on mobile is nothing — system serif/sans-serif renders. This was the v0.56 → v0.58 mobile-fonts regression.
- **Bounded font gate (v0.59).** Top-level surfaces (`.landing`, `.workbench`, `.route-marks`, `.route-sop`) carry `opacity: 0` until `<html>` gains the `.fonts-ready` class. The gate script in `app/layout.tsx` adds the class either when `document.fonts.ready` resolves or when a **1000 ms JS cap** fires — whichever first; a **1500 ms pure-CSS failsafe animation** in `globals.css` backs both paths in case the script never runs. The startooth `.page-boot` mark is sibling to the gated surfaces and remains visible during the hold. Result: typography fonts almost always finish within the cap and the page reveals with real fonts (no FOUT); on slow connections, the cap releases the page and Material Symbols continues to load in the background. The cap is also the implicit filter that stops the gate from waiting on the 1.18 MB symbol font.

**Banned:**

- `display: 'block'` on any primary font. It hides text for up to 3 s; on slow mobile that's a blank page. The v0.56 attempt to use `'block'` to "prevent FOUT" produced 3-second blanks and Material-Symbols ligature words flashing in as fallback text. `'swap'` + the bounded gate is the right answer.
- An **uncapped** JS font-gate that holds the page at `opacity: 0` until `document.fonts.ready` (the pre-v0.56 behaviour with a 3 s ceiling). The current gate is bounded at 1000 ms — do not raise the JS cap (the CSS failsafe sits at 1500 ms behind it). Past 1 s users start to wonder.
- External `<link rel="stylesheet">` to Google Fonts for **the five primary fonts** (display, body, ui, mono, symbols). DNS lookup + two-stage waterfall + non-deterministic timing.
- Redeclaring `--font-display` / `--font-body` / `--font-ui` / `--font-mono` / `--font-symbols` in `globals.css` (see contract above).

**Route-decorative fonts.**
Case-study routes can load decorative fonts via `next/font/local` in their own layout (see [app/(works)/rr/layout.tsx](../app/(works)/rr/layout.tsx) — `Playpen Sans`, `Londrina Solid`, `Gluten` for Rug Rumble). Use `preload: false` since these only matter once a user navigates into the route, and serve only the latin subset unless other scripts are actually used. The previous external `<link rel="stylesheet">` exception for /rr was retired in the production-readiness pass.

**Adding a new font:**

1. Get the `.woff2` file (Google Fonts download, foundry, etc.). Convert from `.ttf` if needed (use `wawoff2` or any CLI converter).
2. Drop it into `app/fonts/`.
3. Add a `localFont(...)` block in `app/layout.tsx` mirroring the existing five. Set `display: 'swap'`, supply a `fallback` chain, set `preload` based on whether the landing page uses it.
4. Define a `--font-<name>` token in `globals.css` **only as a comment** (the variable itself is set by next/font on `<html>`; never redeclare it in `:root`).
5. Add the className to the `<html>` element in `layout.tsx`.
6. Add a Fonts entry update to `LIBRARY.md`.

---

## Material Symbols icons

**The registry is the single source of truth: [`app/lib/icons.ts`](../app/lib/icons.ts) → `ICON_NAMES`.** Everything hangs off that list — usage is type-checked against it, the subset is built from it, and a check fails the push if they drift. This replaced the hand-maintained list that broke three times in one session (`keyboard_arrow_*`, then `play_circle`/`pause_circle`) — each a grep that missed a usage pattern.

**The contract:**

- **Use icons only through the typed paths**, so an icon not in the registry is a *compile error*: `<MaterialIcon name="…">` ([app/components/MaterialIcon.tsx](../app/components/MaterialIcon.tsx)) for spans, or NavMarker's `icon` prop. Never hand-write a `.material-symbols-rounded` (or route-local symbol-font) span — that's how icons escaped the inventory.
- **The shipped font is a ~4.5 KB subset** — `app/fonts/MaterialSymbolsRounded-subset.woff2` — built **from `ICON_NAMES`** by `npm run icons`, with the `FILL` + `wght` axes. (Source font kept, non-shipping, at `scripts/material-symbols-source.woff2`; full font is 5+ MB.) It's **`preload: true`** so it loads inside the page-gate window — icons are ready at reveal, no raw-ligature flash.
- **Enforced:** `npm run icons:check` ([scripts/check-icons.mjs](../scripts/check-icons.mjs), pure Node) compares the registry to `app/fonts/icon-manifest.json` (written by the build) and fails if they diverge. The **pre-push hook runs it** — a stale subset blocks the push.
- **Ligature-only, no codepoints.** The glyphs have no `cmap` codepoints, so they're reachable only via GSUB ligatures; the build resolves name→glyph and subsets **with closure OFF** ([scripts/icon_subset.py](../scripts/icon_subset.py)) — a naive `--text` subset balloons to 787 KB (the closure drags in the whole 3,200-icon library).
- **One exception:** `close` is consumed only by a CSS `content: 'close'` ligature (the /rr NoteRail mobile swap), which can't be typed. It lives in `ICON_NAMES` (so the subset has it) but its single use isn't compiler-enforced — flagged in `icons.ts`.

**Adding an icon:**

1. Add its Material Symbols Rounded ligature name to `ICON_NAMES` in `app/lib/icons.ts`.
2. Use it via `<MaterialIcon name="…">` or a NavMarker `icon` prop (TypeScript confirms it's in the registry).
3. `npm run icons` to rebuild the subset + manifest (needs Python + `fonttools`/`brotli`). `npm run icons:check` (and the pre-push hook) then pass.

**Tally — 15 icons (auto-checked against the registry):** `add` `arrow_back` `arrow_downward` `arrow_drop_down` `arrow_forward` `article` `category` `close` `emergency_home` `info` `keyboard_arrow_down` `keyboard_arrow_up` `pause_circle` `play_circle` `title`. (The registry in `icons.ts` is canonical; this list is a convenience copy.)

**Banned:**

- Hand-written `.material-symbols-rounded` / symbol-font spans, or NavMarker `icon` strings outside the registry — they bypass the type check and drift the subset.
- The full Material Symbols woff2 (5+ MB) or the 1.18 MB ligature distribution as a *shipped* asset (the kept source in `scripts/` is a build input, not bundled).
- Subsetting by `--text` alone (closure → 787 KB) or `--unicodes` (no codepoints → empty).
- `font-variation-settings` for `GRAD`/`opsz` on icons — not in the subset; `FILL` (info toggle) + `wght` are.

---

## UI font (Google Sans Flex)

**The contract:**

- `--font-ui` (the wide-width label font behind `.t-h5` / `.t-btn1`, nav, chips) is a variable font, **partial-instanced to the axis ranges the CSS actually uses** — not the full designspace. 643 KB → **261 KB**, no visual change.
- Why: the full 643 KB couldn't load inside the page-gate window on Slow 3G, so the page revealed with the wide font snapping in late. At 261 KB it makes the deadline. (`opsz` deltas dominate the file; holding `opsz` to the used `18–24` instead of the full `6–144` is most of the saving.)
- **Ranges (must cover every `font-variation-settings` value on `--font-ui`):** `opsz 18–24 · wdth 50–140 · wght 300–900 · GRAD 0–80 · ROND 0–100`. Sweep both literal CSS and `var(--*-font-axes)` custom properties (e.g. `--rr-font-axes`) before tightening — a value outside the range clips silently.

**Re-instancing flow (when a new axis value is needed):**

1. Restore the **original** from git (the working file is already trimmed): `git show <rev>:app/fonts/GoogleSansFlex-variable.woff2 > /tmp/flex-src.woff2`.
2. Widen the relevant range and re-instance with fontTools (`pyftsubset`'s python):
   ```python
   from fontTools.varLib.instancer import instantiateVariableFont
   from fontTools.ttLib import TTFont
   f = TTFont("/tmp/flex-src.woff2")
   instantiateVariableFont(f, {"opsz":(18,24),"wdth":(50,140),"wght":(300,900),"GRAD":(0,80),"ROND":(0,100)}, inplace=True)
   f.flavor = "woff2"; f.save("app/fonts/GoogleSansFlex-variable.woff2")
   ```
3. Verify size + that the wide labels (`wdth 120`) still render wide.

**Banned:**

- Shipping the full-range 643 KB variable font — it misses the gate on slow connections.
- Pinning an axis the CSS varies (all five are used: `opsz wdth wght GRAD ROND`) — pinning collapses a used distinction. Range-limit, don't pin.

---

## Images

The whole pipeline is built so that crisp-on-intake stays crisp-on-serve. The two compression layers (intake encoder + `next/image` serve quality) are coordinated automatically via a `lossless` flag in the image manifest — you don't reach for a `quality` prop per usage. All content imagery goes through the [`<Img>`](../app/components/Img) primitive; see `LIBRARY.md` → Img for sizing modes and placeholder variants.

**The contract:**

1. **Vectors are SVG.** Never rasterize SVG-native artwork.
2. **Raster masters live in `_source/images/`**, at the repo root — *outside* `public/`. Masters never reach a visitor's browser or the deploy bundle. They stay for re-encoding when encoders improve. Scope: photos, externally-authored artwork, screenshots from contexts that change. Figma exports don't need to live here — re-export from the Figma file when you need to re-encode.
3. **Resolution: 2× is the floor, 3× for high-fidelity edges, 4× never.** `<Img>` + `next/image` handle the density `srcset` automatically *if* the source has the pixels. Don't downscale exports. Picking the multiplier:

   - **2× — default.** Covers DPR=2 Retina screens cleanly (MacBook, iPad, iPhone non-Pro, most Android). DPR=3 devices upscale ~1.3× which is invisible on photographic content. Use for photos, hero shots, anything the eye reads as a subject rather than as edges.
   - **3× — patterns, illustrations, fine UI artwork.** Pays off where the eye reads pixel-precise edges on iPhone Pro phones (DPR=3). Examples: startooth pattern, brand marks, mockups where rasterized vectors must stay crisp. Costs roughly 2× the disk weight vs 2×; gives DPR=3 devices a true 1080-class variant instead of a 1.3× upscale of the 828w.
   - **4× — never.** No mainstream device DPR exists above 3, and next/image's default `images.deviceSizes` doesn't include a srcset entry that would consume the extra pixels anyway. Pure disk + transfer bloat with no visible payoff.

   Worked example: a 3-col tile in `/selected` renders 413 px wide on desktop. 2× source ≥ 826 px wide; 3× source ≥ 1239 px wide.
4. **Compression tier is picked by folder convention** in `_source/`:

   | Path contains      | Tier             | Encoder                                                          | Use for                                                          |
   |--------------------|------------------|------------------------------------------------------------------|------------------------------------------------------------------|
   | `/_photos/`        | lossy            | `sharp.webp({ quality: 88, effort: 6, smartSubsample: true })`   | Photographs, rich gradients                                      |
   | `/_diagrams/`      | full lossless    | `sharp.webp({ lossless: true, effort: 6 })`                      | Large flat-colour fields where near-lossless can introduce banding |
   | _(anything else)_  | **near-lossless** _(default)_ | `sharp.webp({ nearLossless: true, quality: 60, effort: 6 })` | UI / screenshots / anything with text                            |

   Defaulting to near-lossless biases toward crisp; opt into lossy only when the asset is genuinely a photo. Single source of truth: `scripts/lib/compression-tier.mjs`.
5. **One command to add an image:** drop the PNG/JPEG under `_source/images/<route>/...`, mirroring the target layout under `public/images/<route>/...`, then run `npm run optimize-images`. The script walks `_source/`, picks the encoder by path, and writes the `.webp` under `public/`. Sources stay. Then `npm run lqip` (or `npm run build`, which runs it via `prebuild`) regenerates the LQIP + `lossless` manifest.
6. **`<Img>` only.** Authors don't write raw `<img>`, don't reach for `next/image` directly. `<Img>` reads the manifest's `lossless` flag and sets `quality` for you: lossless / near-lossless → 100, lossy → 90. Override via the `quality` prop only when there's a reason (typically a true-photo thumbnail where you'll never see the artefacts).
7. **`sizes` is still your job.** `<Img>` can't infer it. Author it correctly so `next/image` serves the right srcset entry at the right DPR. Explicit `width` + `height` props are a valid alternative to `sizes` when render dimensions are fixed and known at request time.
8. **Existing assets:** the `lossless` flag conservatively defaults to `true` for any manifest entry without a master in `_source/`. Existing crisp-source webp files keep serving at q100. Lossy-on-intake legacy files don't get worse on serve; bringing them through the new pipeline is a separate (future) re-encode pass.

**Soft size budget:**

- Hero / landing imagery: under **300 KB** per file.
- Project-page imagery: under **500 KB** per file.
- Decorative / texture imagery: under **100 KB** per file.

These aren't absolute — a careful 400 KB hero is fine. But anything north of **1 MB** needs a justification, not a shrug.

**Banned:**

- Committing raw multi-MB PNGs or JPGs straight from the design tool. The v0.55 pass cleared 40+ MB of these. Don't put them back.
- Bypassing `<Img>` for content imagery — only the documented exceptions (twitter avatar, deck-strip chip, rule-card icon — tiny decorative SVGs/PNGs where LQIP is wasted) skip it.
- Hot-linking images from external CDNs.

---

## Motion tokens

The five `--dur-*` tokens (`instant` / `fast` / `slide` / `settle` / `glide`) live in `globals.css` — **the token block there is the single source of truth for values; this doc deliberately does not restate them** (restated copies have rotted before). They were tuned **down** during the v0.55 perf pass for snappier perceived performance, while staying within the paper-physical motion language (CLAUDE.md → "Motion vocabulary").

**The contract:**

- Don't drift back to the old values without intent. If a specific motion needs the longer feel, set the duration inline with a comment, don't bump the global token.
- New motion deserves a duration in this set. If none fits, that suggests a new tier — flag in `ANOMALIES.md` for the route, don't silently invent.
- Easing remains `--ease-paper` for everything except documented snap-tier cases (see CLAUDE.md → "Motion vocabulary" rule 6).

---

## What hygiene looks like in practice

- **Adding a font.** New `.woff2` in `app/fonts/`, `localFont(...)` in `layout.tsx` with `display: 'swap'` + `fallback`, LIBRARY.md entry. Do **not** redeclare `--font-*` in `globals.css`. No external link. Preload only if landing uses it.
- **Adding an image.** Drop a `.webp` (or convert immediately) in `public/images/<route>/`. Use `<Img>`. Run `npm run lqip`. If the source was huge, run `npm run optimize-images` first.
- **Adding an icon.** Add to the icons list above and re-subset from the source font (closure OFF, by glyph name) into `MaterialSymbolsRounded-subset.woff2` — see the re-subsetting flow above. Verify size + ligature resolution.
- **Touching motion tokens.** Don't, unless you've discussed why with the user. Inline durations in component CSS are fine for one-off cases.

---

## How regressions get caught

`/release` (the push ritual; `/prepush` is a deprecated alias for its check-only mode) scans the branch diff before any push and flags:

- New `.woff2` added without `next/font/local` wiring
- New raw `.png`/`.jpg` over 400 KB committed without `.webp` conversion
- New material-symbols ligature names not present in the subsetted icon list
- Changes to `--dur-*` tokens

Treat its output as a checklist, not a blocker.
