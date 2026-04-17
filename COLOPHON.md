# Colophon

A record of what this site is built from — the ideas it borrows, the systems it rides on, and the small tools behind specific pieces. Listed roughly from the thing that shaped the whole, down to the thing that solved one line.

---

## ⬚ Visual inspiration

**Flatlay — meticulously arranged random objects.**

A designer's habit. Tickets, receipts, pressed leaves, pens, notebooks, coins, a watch face, a business card — laid out on a clean surface at an overhead angle, each object rotated slightly off-true, casting a soft shadow, with just enough breathing room between them that the eye reads them as *placed*, not scattered.

That is the grammar this portfolio tries to speak in. Every decision downstream — the cream mat, the micro-rotation on content blocks, the restrained shadow alpha, the paper-settle motion, the insistence that proof artifacts stay as proof artifacts — traces back to this one image. A reading environment, not a display case.

---

## ◈ Typography

All five faces are delivered via **[Google Fonts](https://fonts.google.com/)** CDN. Variable-axis families are pulled with their full axis ranges so UI weight steps are live axis combinations, not separate font files.

- **[Fraunces](https://fonts.google.com/specimen/Fraunces)** — display serif. Used for the largest editorial voice. Variable axes (opsz, wght, SOFT, WONK) are live; the site uses them sparingly.
- **[Google Sans](https://fonts.google.com/specimen/Google+Sans)** — body text. A workhorse humanist sans with slightly warmer proportions than Inter or Helvetica; reads as authored, not defaulted.
- **[Google Sans Flex](https://fonts.google.com/specimen/Google+Sans+Flex)** — UI. Full variable-axis family (`wdth`, `wght`, `GRAD`, `ROND`, `opsz`). Every weight step in the type scale is a specific axis combination, not a different font file.
- **[Material Symbols Rounded](https://fonts.google.com/icons?icon.style=Rounded)** — nav icons. Variable-axis glyphs for the small number of cases where a hand-rolled SVG would have been busywork.
- **System monospace stack** (`ui-monospace`, `SF Mono`, `Cascadia Mono`, `Segoe UI Mono`, Menlo, Monaco, Consolas) — year labels in the `/selected` timeline. Monospace ensures even digit widths without needing tabular-nums or variable-font tricks on the display face.

---

## ☁︎ Motion

- **Paper-physical vocabulary** — the governing idea, not a library. Everything glides, settles, lands. One easing curve (`--ease-paper`, `cubic-bezier(0.5, 0, 0.2, 1)`), long durations (0.5–0.9s), no bounce, no overshoot, no scroll hijacking. Documented in `CLAUDE.md`.
- **[Framer Motion](https://motion.dev/)** — the runtime behind spring physics, `useScroll`/`useTransform`/`useSpring` pipelines, and `AnimatePresence`. Used only where it materially helps; plain CSS transitions carry the majority.
- **[Web Animations API (WAAPI)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)** — `TransitionSlot` uses the native Web Animations API (no library) for the DOM ghost-clone page transition, because the choreography needed to run against an element that no longer exists in the React tree.

---

## ▤ Shadow & elevation

- **[Atlassian Design System](https://atlassian.design/foundations/elevation)** — semantic structure. The four-tier naming (`flat` → `resting` → `raised` → `overlay`) tracks Atlassian's approach, where elevation names a relationship, not a pixel value.
- **[Radix UI](https://www.radix-ui.com/)** — restraint. Shadow alphas in this site sit between 0.10 and 0.26 on cream, close to what Radix uses on its neutral surfaces. The instinct that shadows should be *quiet* on warm paper rather than loud on white comes from looking at Radix components.
- Tokens live in `app/globals.css`. Off-ladder shadows (button-press insets, motion-state lerps, the api-card backlight, the pin-mark dot stamp) are kept separate and annotated where they live.

---

## 🎨 Color

Two color systems, used for different jobs. Both run offline — no color-science runtime ships to the browser. The site only sees final hex or HSL values.

- **[OKLCH](https://oklch.com/)** — the default. A perceptually uniform color space: equal steps in lightness look equal to the eye, complementary pairs stay balanced across hue, and chroma clamps land in-gamut without the washed-out surprises HSL produces. Used for the per-project token scales in `/selected` (Connektion, Aleyr, Ecochain, Codezeros, Slangbusters — each with tiers at 100 / 240 / 800 / 960), and for the cream / blue / yellow / neutral tokens in `globals.css`. Authored in OKLCH, exported as HSL for CSS tweakability.
- **[munsell.js](https://github.com/privet-kitty/munsell.js)** — used only for the landing-page spectrum grid. The four palettes (teal↔red, purple↔chartreuse, jade↔lavender, orange↔blue) were generated via `mhvcToHex()` — the Munsell-HVC-to-RGB conversion — with chroma fallback for gamut safety. The [Munsell color system](https://en.wikipedia.org/wiki/Munsell_color_system) gives a specific kind of perceptually balanced complementary pair the spectrum grid needed, that OKLCH doesn't quite reproduce. Precomputed at build-time into the palette array in `app/page.tsx`.

---

## ✦ Shaders & textures

- **Balatro background shader** — the animated rug behind the `/rr` Cards section is a direct GLSL port of **[localthunk](https://www.localthunk.com/)**'s [Balatro](https://www.playbalatro.com/) title background, discovered via **[Shadertoy](https://www.shadertoy.com/)** ([view XXtBRr](https://www.shadertoy.com/view/XXtBRr)). Tuned slower (`SPIN_SPEED 3.0` vs the original `7.0`) and softer (`CONTRAST 3.0` vs `3.5`) to sit under readable content instead of under a game loop. Palette retuned to deep forest green / rich green / smoky purple-black against a green-grain paper reference. `app/(works)/rr/components/RugShader.tsx`.
- **Paper noise (SVG displacement)** — [`feTurbulence`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTurbulence) + [`feDisplacementMap`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDisplacementMap), rendered once off-screen in `PaperFilter.tsx`, referenced by CSS via `filter: url(#paper-displace)`. No library. The turbulence seed, base frequency, and displacement scale were tuned by feel to match hand-milled paper grain.

---

## ⊞ Infrastructure

- **[Next.js 15](https://nextjs.org/)** (App Router) — framework. Route groups, layouts, metadata API, image optimization.
- **[React 19](https://react.dev/)** — component runtime. No state-management library; state lives in the components that own it.
- **[TypeScript](https://www.typescriptlang.org/)** — types. Strict enough to catch real mistakes, loose enough to not fight the design.
- **[EmailJS](https://www.emailjs.com/)** (`@emailjs/browser`) — the contact form on the landing page. Client-side form submission to a templated email, no backend endpoint to run.
- **[Netlify](https://www.netlify.com/)** — hosting. Serves [nihar.works](https://nihar.works) with its CDN, build pipeline, and automatic deploys from the main branch.
- **[GitHub](https://github.com/niharya/88g)** — source of truth and the bridge between development and hosting. Every push to `main` is what Netlify builds from; every tag (`v0.X.0`) is a release marker.

---

## ◐ Icons (custom, not imported)

Two of the animated icons in `/selected` are hand-rolled SVGs built against the geometry of the **[Lucide](https://lucide.dev/)** icon set — not imported from `lucide-react`. Done this way so the inner `<path>` and `<g>` nodes could be named and animated individually (`.icon-ext-arrow`, `.icon-chevron-shaft`) via CSS `translate` on parent hover. The rest of the site uses Material Symbols Rounded where a static glyph is enough.

---

## ✎ Editorial

The sheet-stack reading environment and the "proof artifact must remain a proof artifact" principle draw on long-form editorial practice — design case studies in print, architectural monographs, museum catalogs — more than on any specific SaaS portfolio template. The site wants to be read, not scrolled past.

---

## ✿ Collaborators

- **[Akshar Dave](https://akshardave.com/)** — developed the original `/biconomy` page. The evidence-and-notes language, the surface/mat/chapter vocabulary, and the sheet-stack containment model all have their roots in what Akshar built first. Everything in the shared design system at `app/components/` and the design tokens in `app/globals.css` descend from that original work; `/rr` and the landing page consume it in turn. A real debt, not a footnote.

---

## ◍ Tools

The thinking and the building are done by different tools, and the distinction matters.

- **[ChatGPT](https://chatgpt.com/)** — organizing thoughts. Early structural outlines, copy drafts, naming passes, thinking out loud about what a section should *do* before it had any shape. Best for the part of the work that has no file yet.
- **[Claude Code](https://claude.com/claude-code)** — the actual development. Implementation, refactoring, hygiene passes, writing ANOMALIES.md entries as architectural anomalies are discovered, and this colophon. Working contract and agent routing live in `CLAUDE.md`.
- **[Vercel v0](https://v0.dev/)** — helped create the Rug Rumble game. The initial playable mechanic for `/rr` was prototyped in v0 and then ported into the Next.js route. The ported source lives in `reference/v0-duel-game/` as read-only context.
- **[Figma](https://www.figma.com/)** — layout, spacing grids, typography composition, and per-project color palettes before they're translated into CSS tokens.
- **[Cursor](https://cursor.com/) / [VS Code](https://code.visualstudio.com/)** — editor.

---

*Last updated: April 2026.*
