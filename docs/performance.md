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
- **Bounded font gate (v0.59).** Top-level surfaces (`.landing`, `.workbench`, `.route-marks`) carry `opacity: 0` until `<html>` gains the `.fonts-ready` class. The gate script in `app/layout.tsx` adds the class either when `document.fonts.ready` resolves or when an **800 ms cap** fires — whichever first. The startooth `.page-boot` mark is sibling to the gated surfaces and remains visible during the hold. Result: typography fonts almost always finish within 800 ms and the page reveals with real fonts (no FOUT); on slow connections, the cap releases the page within 1 second and Material Symbols continues to load in the background. The cap is also the implicit filter that stops the gate from waiting on the 1.18 MB symbol font.

**Banned:**

- `display: 'block'` on any primary font. It hides text for up to 3 s; on slow mobile that's a blank page. The v0.56 attempt to use `'block'` to "prevent FOUT" produced 3-second blanks and Material-Symbols ligature words flashing in as fallback text. `'swap'` + the bounded gate is the right answer.
- An **uncapped** JS font-gate that holds the page at `opacity: 0` until `document.fonts.ready` (the pre-v0.56 behaviour with a 3 s ceiling). The current gate is bounded at 800 ms — do not raise the cap past ~1000 ms. Past 1 s users start to wonder.
- External `<link rel="stylesheet">` to Google Fonts for **the five primary fonts** (display, body, ui, mono, symbols). DNS lookup + two-stage waterfall + non-deterministic timing.
- Redeclaring `--font-display` / `--font-body` / `--font-ui` / `--font-mono` / `--font-symbols` in `globals.css` (see contract above).

**Documented exception — `/rr` route-decorative fonts.**
[app/(works)/rr/layout.tsx](../app/(works)/rr/layout.tsx) loads three external Google Fonts (`Playpen Sans`, `Londrina Solid`, `Gluten`) for the Rug Rumble case-study editorial. They're route-scoped, decorative, and only render after a user navigates to `/rr` (not on the landing critical path). Migrating them to `next/font/local` is a future cleanup, not a blocker. If you add another *decorative case-study* font, the same pattern is acceptable — but document it here. **Do not** use this exception for primary site typography.

**Adding a new font:**

1. Get the `.woff2` file (Google Fonts download, foundry, etc.). Convert from `.ttf` if needed (use `wawoff2` or any CLI converter).
2. Drop it into `app/fonts/`.
3. Add a `localFont(...)` block in `app/layout.tsx` mirroring the existing five. Set `display: 'swap'`, supply a `fallback` chain, set `preload` based on whether the landing page uses it.
4. Define a `--font-<name>` token in `globals.css` **only as a comment** (the variable itself is set by next/font on `<html>`; never redeclare it in `:root`).
5. Add the className to the `<html>` element in `layout.tsx`.
6. Add a Fonts entry update to `LIBRARY.md`.

---

## Material Symbols icons

**The contract:**

- Material Symbols is **subsetted**. The current `app/fonts/MaterialSymbolsRounded-normal.woff2` contains only the glyphs needed for the icons listed below, plus the `wght` and `FILL` variation axes. Down from 5.1 MB (full font) to ~1.1 MB.
- Adding a new icon requires re-subsetting and replacing the file. You cannot just use a new ligature name — the glyph won't be in the font.

**Currently subsetted icons (13):**

```
add               arrow_back        arrow_downward    arrow_drop_down
arrow_forward     arrow_upward      article           category
collapse_content  emergency_home    expand_content    info
title
```

**Re-subsetting flow (when you need a new icon):**

1. Add the new icon name to the list above.
2. Compute the unique character set from all icon names: `echo "<icons>" | tr ' ' '\n' | fold -w1 | sort -u | tr -d '\n'`.
3. Fetch the subset CSS from Google Fonts:
   ```
   https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:wght,FILL@100..700,0..1&text=<chars>&display=swap
   ```
4. Extract the `https://fonts.gstatic.com/...` font URL from the CSS.
5. Download with the right headers (Google Fonts rejects bare curl):
   ```
   curl -sLA "Mozilla/5.0 (...Chrome/120.0.0.0...)" \
     -H "Sec-Fetch-Dest: font" -H "Sec-Fetch-Mode: cors" \
     -H "Sec-Fetch-Site: cross-site" -H "Origin: https://fonts.googleapis.com" \
     -o app/fonts/MaterialSymbolsRounded-normal.woff2 "<font-url>"
   ```
6. Verify the file is the expected size (~1 MB with `wght` + `FILL` axes; ~270 KB without any axes).

**Banned:**

- The full Material Symbols woff2 (5+ MB). Hard "no."
- Adding `font-variation-settings` for `GRAD` or `opsz` to icons — those axes were dropped from the subset to save weight. Default values render fine at the sizes the portfolio uses (18–24px).

---

## Images

**The contract:**

- All content imagery goes through the [`<Img>`](../app/components/Img) primitive. See `LIBRARY.md` → Img for sizing modes and placeholder variants.
- Every image in `public/images/` lives as a `.webp`. The originals (`.png`/`.jpg`) were converted in the v0.55 perf pass; new images should arrive as `.webp` from the start, or be converted before commit.
- After adding a new image, run `npm run lqip` to regenerate the manifest (also runs automatically on `npm run build` via `prebuild`).
- For larger or oversized raw assets you've pulled in, run `npm run optimize-images` — it walks `public/images/`, compresses anything over 400 KB, and emits `.webp` siblings.

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

Current values in `globals.css`:

```
--dur-instant: 0.1s
--dur-fast:    0.15s   (was 0.2s pre-v0.55)
--dur-slide:   0.2s    (was 0.3s)
--dur-settle:  0.35s   (was 0.5s)
--dur-glide:   0.5s    (was 0.8s)
```

These were tuned **down** during the v0.55 perf pass for snappier perceived performance, while staying within the paper-physical motion language (CLAUDE.md → "Motion vocabulary").

**The contract:**

- Don't drift back to the old values without intent. If a specific motion needs the longer feel, set the duration inline with a comment, don't bump the global token.
- New motion deserves a duration in this set. If none fits, that suggests a new tier — flag in `ANOMALIES.md` for the route, don't silently invent.
- Easing remains `--ease-paper` for everything except documented snap-tier cases (see CLAUDE.md → "Motion vocabulary" rule 6).

---

## What hygiene looks like in practice

- **Adding a font.** New `.woff2` in `app/fonts/`, `localFont(...)` in `layout.tsx` with `display: 'swap'` + `fallback`, LIBRARY.md entry. Do **not** redeclare `--font-*` in `globals.css`. No external link. Preload only if landing uses it.
- **Adding an image.** Drop a `.webp` (or convert immediately) in `public/images/<route>/`. Use `<Img>`. Run `npm run lqip`. If the source was huge, run `npm run optimize-images` first.
- **Adding an icon.** Add to the icons list above. Re-subset. Replace `MaterialSymbolsRounded-normal.woff2`. Verify size.
- **Touching motion tokens.** Don't, unless you've discussed why with the user. Inline durations in component CSS are fine for one-off cases.

---

## How regressions get caught

`/prepush` (the pre-push hygiene skill) scans the branch diff before any push and flags:

- New `.woff2` added without `next/font/local` wiring
- New raw `.png`/`.jpg` over 400 KB committed without `.webp` conversion
- New material-symbols ligature names not present in the subsetted icon list
- Changes to `--dur-*` tokens

Treat its output as a checklist, not a blocker.
