# Scriptorium — meta

Verbatim reference for all site metadata — page titles, descriptions, Open Graph blocks, Twitter cards, canonical URLs, OG images, JSON-LD structured data, robots, and sitemap. Edit the source files, not this doc — run `/release` to surface drift.

**Sources:** `app/layout.tsx`, `app/page.tsx`, `app/marks/page.tsx`, `app/shape-of-product/page.tsx`, `app/(works)/biconomy/page.tsx`, `app/(works)/rr/page.tsx`, `app/(works)/all/page.tsx`, `app/resume/page.tsx`, `app/privacy/page.tsx`, `app/robots.ts`, `app/sitemap.ts`, `public/blast-radius/index.html` (hand-authored `<head>`, not an `app/` route)

This file is the SEO/social mental model. For reading-copy by route, see the per-route MDs in this folder.

---

## Root — metadataBase {#root-base}

> `https://nihar.works`
> — [`layout.tsx:95`](../../app/layout.tsx#L95)

## Root — title template {#root-title}

> default: "Nihar · Product designer for developer tools and infrastructure"
> template: "%s · Nihar"
> — [`layout.tsx:96-99`](../../app/layout.tsx#L96)

## Root — description {#root-description}

> "I design developer tools and infrastructure, the technical software most designers steer around. The way in is always the same. Go a layer deeper than the screens, make the system underneath legible first. Screens follow."
> — [`layout.tsx:100`](../../app/layout.tsx#L100)

## Root — applicationName / authors / creator {#root-app}

> applicationName: "Nihar"
> creator: "Nihar"
> authors: [{ name: "Nihar", url: "https://nihar.works" }]
> — [`layout.tsx:101-103`](../../app/layout.tsx#L101)

## Root — keywords {#root-keywords}

> "Nihar", "product design", "system design", "brand design", "portfolio", "design"
> — [`layout.tsx:104`](../../app/layout.tsx#L104)

## Root — alternates / canonical {#root-canonical}

> canonical: "/"
> — [`layout.tsx:105-107`](../../app/layout.tsx#L105)

## Root — Open Graph {#root-og}

> type: "website"
> url: "https://nihar.works"
> siteName: "Nihar"
> title: "Most of my real work is under the screens."
> description: "Developer tools, infrastructure, dashboards. Dense products where the design problem isn’t adding screens, it’s making the system underneath legible and keeping it authored instead of mass generated."
> locale: "en_US"
> image: "/og-image.png" (1200×630, alt: "Nihar — Portfolio")
> — [`layout.tsx:126-141`](../../app/layout.tsx#L126)

## Root — Twitter card {#root-twitter}

> card: "summary_large_image"
> title: "The screens were never the hard part."
> description: "Developer tools and infrastructure. The design problem is in the system, not at the surface, and I go looking for it a layer down."
> images: ["/og-image.png"]
> — [`layout.tsx:142-147`](../../app/layout.tsx#L142)

## Root — robots {#root-robots}

> index: true
> follow: true
> — [`layout.tsx:148-151`](../../app/layout.tsx#L148)

## Root — viewport theme color {#root-theme}

> themeColor: "#f2f3ef"
> — [`layout.tsx:91`](../../app/layout.tsx#L91)

## Root — manifest {#root-manifest}

> "/site.webmanifest"
> — [`layout.tsx:125`](../../app/layout.tsx#L125)

## Root — icons {#root-icons}

> icon SVG: "/icon-star-blue.svg" (image/svg+xml)
> icon PNG: "/icon-32.png" 32×32, "/icon-16.png" 16×16
> shortcut: "/favicon.ico"
> apple: "/apple-icon" 180×180
> other: "/android-chrome-192.png" 192×192, "/android-chrome-512.png" 512×512
> — [`layout.tsx:111-124`](../../app/layout.tsx#L111)

---

## Landing — JSON-LD (Person) {#landing-jsonld-person}

> @type: "Person"
> name: "Nihar"
> url: "https://nihar.works"
> jobTitle: "Product Designer"
> description: "I design developer tools and infrastructure, the technical software most designers steer around. The way in is always the same. Go a layer deeper than the screens, make the system underneath legible first. Screens follow."
> sameAs: linkedin.com/in/niharbhagat, github.com/niharya, x.com/neonihar
> — [`page.tsx:438-450`](../../app/page.tsx#L438)

## Landing — JSON-LD (WebSite) {#landing-jsonld-website}

> @type: "WebSite"
> name: "Nihar"
> url: "https://nihar.works"
> author: { @type: "Person", name: "Nihar" }
> inLanguage: "en"
> — [`page.tsx:451-458`](../../app/page.tsx#L451)

---

## /all (Works) — Metadata {#all-meta}

> title: "Selected Work"
> description: "Branding, onboarding flows, naming, systems work, infrastructure experiments."
> canonical: "/all"
> — [`page.tsx:10-14`](../../app/(works)/all/page.tsx#L10)

> OG title: "Different systems. Same instincts."
> OG description: "Trying to organize complexity so people can move through it and get somewhere."
> OG url: "/all"
> OG image: "/og-image.png"
> — [`page.tsx:15-21`](../../app/(works)/all/page.tsx#L15)

---

## /biconomy — Metadata {#biconomy-meta}

> title: "Biconomy · Deep Infrastructure Stuff"
> description: "Thought I was designing product screens. Most of the work was actually systems work."
> canonical: "/biconomy"
> — [`page.tsx:12-16`](../../app/(works)/biconomy/page.tsx#L12)

> OG title: "Deep infrastructure stuff."
> OG description: "Trying to make complicated systems feel clear enough to move through."
> OG url: "/biconomy"
> OG image: "/og-biconomy.jpg"
> — [`page.tsx:17-23`](../../app/(works)/biconomy/page.tsx#L17)

---

## /rr (Rug Rumble) — Metadata {#rr-meta}

> title: "Rug Rumble · Systems Disguised As A Card Game"
> description: "Turned infrastructure ideas into something people could actually play with."
> canonical: "/rr"
> — [`page.tsx:11-15`](../../app/(works)/rr/page.tsx#L11)

> OG title: "I think games are just systems people agree to take seriously."
> OG description: "Part game, part product demo, part systems experiment."
> OG url: "/rr"
> OG image: "/og-rr.jpg"
> — [`page.tsx:16-22`](../../app/(works)/rr/page.tsx#L16)

## /rr — JSON-LD (CreativeWork) {#rr-jsonld}

> @type: "CreativeWork"
> name: "Rug Rumble"
> headline: "Rug Rumble — Turning Infrastructure into Play"
> description: "Turned infrastructure ideas into something people could actually play with."
> url: "https://nihar.works/rr"
> inLanguage: "en"
> genre: "Game design"
> author: { @type: "Person", name: "Nihar", url: "https://nihar.works" }
> isPartOf: { @type: "WebSite", name: "Nihar", url: "https://nihar.works" }
> — [`page.tsx:25-37`](../../app/(works)/rr/page.tsx#L25)

## /rr — H1 (sr-only) {#rr-h1}

> "Rug Rumble — strategy card game"
> — [`page.tsx:42`](../../app/(works)/rr/page.tsx#L42)

---

## /marks — Metadata {#marks-meta}

> title: "Marks & Symbols · Trying To Reduce Things"
> description: "Trying to reduce things until they still feel alive."
> canonical: "/marks"
> — [`page.tsx:28-32`](../../app/marks/page.tsx#L28)

> OG title: "Identity work before systems happened."
> OG description: "Symbols, marks, reduction, repetition."
> OG url: "/marks"
> OG image: "/og-marks.jpg"
> — [`page.tsx:33-39`](../../app/marks/page.tsx#L33)

---

## /shape-of-product — Metadata {#sop-meta}

> title: "Somewhere Between Product And Infrastructure"
> description: "Thinking about tools, systems, interfaces, and the people building them."
> canonical: "/shape-of-product"
> — [`page.tsx:8-12`](../../app/shape-of-product/page.tsx#L8)

Notes: No openGraph block authored — falls back to root layout OG.

---

## /resume — Metadata {#resume-meta}

> title: "Resume · Interfaces To Infrastructure"
> description: "Most of my career happened because I kept going one layer deeper."
> canonical: "/resume"
> — [`page.tsx:27-30`](../../app/resume/page.tsx#L27)

> OG type: "profile"
> OG url: "https://nihar.works/resume"
> OG siteName: "Nihar"
> OG title: "Went pretty far behind the curtain."
> OG description: "Started with interfaces. Ended up deep in systems work."
> OG image: "/og-image.png" (1200×630, alt: "Nihar — Resume")
> — [`page.tsx:31-45`](../../app/resume/page.tsx#L31)

> Twitter card: "summary_large_image"
> Twitter title: "Went pretty far behind the curtain."
> Twitter description: "Started with interfaces. Ended up deep in systems work."
> Twitter images: ["/og-image.png"]
> — [`page.tsx:46-51`](../../app/resume/page.tsx#L46)

---

## /privacy — Metadata {#privacy-meta}

> title: "Privacy · Nothing Weird Here"
> description: "Pretty standard privacy stuff."
> canonical: "/privacy"
> — [`page.tsx:12-16`](../../app/privacy/page.tsx#L12)

Notes: No openGraph block authored — falls back to root layout OG.

## /blast-radius — Metadata {#blast-radius-meta}

Not a Next route. A standalone single-file prototype served straight off the CDN
from `public/blast-radius/index.html`, so its metadata is hand-authored `<head>`
markup rather than a Next `metadata` export — nothing here inherits the root
layout's title template, OG defaults, or `metadataBase`.

> title: "Blast Radius: a notification policy sandbox for Rippling"
> description: "Change a notification rule and replay the same week of work under it, for three different people, before it ships. A working sketch for Rippling, by Nihar Bhagat."
> canonical: "https://nihar.works/blast-radius"
> og:type: "website"
> og:url: "https://nihar.works/blast-radius"
> og:site_name: "Nihar Bhagat"
> og:title: "Blast Radius: a notification policy sandbox for Rippling"
> og:description: "Set a notification policy. See the week it would have produced for an HR admin, a finance controller, and a first-week employee, before anything ships. A working sketch for Rippling, by Nihar Bhagat."
> og:image: "https://nihar.works/blast-radius/og.png"
> og:image:type: "image/png"
> og:image:width: "1200"
> og:image:height: "630"
> og:image:alt: "The Blast Radius sandbox: a policy panel on the left, and a verdict row reading 183 interruptions this week, 0 moved to a digest, 0 deadlines missed."
> twitter:image: "https://nihar.works/blast-radius/og.png"
> twitter:card: "summary_large_image"
> twitter:title: "Blast Radius: a notification policy sandbox for Rippling"
> twitter:description: "Cut 183 weekly interrupts to 75 with zero missed deadlines, and catch the policy that looks quietest but silently drops 124."
> — [`index.html:6-23`](../../public/blast-radius/index.html#L6)

**The card image is a real screenshot, not a composed graphic.** `og.png` is the
page itself rendered headless at 1200x630 (captured at 2x, downsampled), showing
the brand, the policy panel and the verdict row at its load state: 183 / 0 / 0.
It deliberately shows the *before* number, because that is what a visitor sees
when they land; the 183-to-75 movement is carried by `twitter:description`
instead. Regenerate with headless Chrome at `--window-size=1200,630
--force-device-scale-factor=2` against the live URL, then `sips -z 630 1200`.
Re-run `npm run lqip` afterwards: the file sits under `public/`, so
`generate-image-manifest.mjs` indexes it even though no `<Img>` consumes it.

**Favicon is an inline data-URI SVG**, not a file, so the page stays
self-contained. It redraws the header's own `.rings` bullseye with heavier
strokes and a paper disc behind it, because the authored opacities (.22/.4/.7)
disappear at 16px and the ink mark would vanish against a dark tab bar.

Notes: `title` and `og:title` are deliberately identical. `description` (search)
and `og:description` (share cards) differ: the OG line names the three personas,
the meta line describes the mechanic. No OG image, and `twitter:card` is
`summary` rather than `summary_large_image`, so cards render text-only. Absent
from `sitemap.xml` on purpose: shared by link, not indexed.

**Addressed to Rippling, and single-use because of it.** The company name is in
the title and both descriptions so their name surfaces on the share card. That
makes this URL specific to one pitch. Retargeting means editing these six values
(and this entry) or standing up a second path.

**No em dashes in any user-visible string on this page**, by request. The six
that remain in the file are inside CSS comments and never reach a reader. The
sole en dash is a route separator in generated event copy (`flight BLR–SFO`) and
the one curly-quote pair wraps a dropped item's title in the verdict copy; both
are inside the canonical `<script>` and are correct as written.

---

## robots.txt {#robots}

> User-agent: *
> Allow: /
> Sitemap: https://nihar.works/sitemap.xml
> Host: https://nihar.works
> — [`robots.ts`](../../app/robots.ts)

## sitemap.xml {#sitemap}

Routes published, with priority:

| URL | Change frequency | Priority |
|---|---|---|
| `/` | monthly | 1.0 |
| `/all` | monthly | 0.9 |
| `/biconomy` | yearly | 0.8 |
| `/rr` | yearly | 0.8 |
| `/marks` | monthly | 0.7 |
| `/shape-of-product` | monthly | 0.6 |
| `/resume` | yearly | 0.5 |
| `/privacy` | yearly | 0.3 |

— [`sitemap.ts`](../../app/sitemap.ts)

Notes: `lastModified` is set to `new Date()` at request time — every fetch reports "modified now." Worth tightening if SEO precision matters.

---

## Notes

- **Dev-only routes** (`/_dev-tools/lqip-lab`, `/_dev-tools/sticker-lab`, `/_preview/404`) have minimal metadata (just `title`) and are intentionally not in the sitemap. Not catalogued here.
- **Title template** (`%s · Nihar`) applies to every route that sets `title` as a string. `title: "Resume · Interfaces To Infrastructure"` renders as `"Resume · Interfaces To Infrastructure · Nihar"` in the browser tab.
- **OG image fallback chain:** routes without an OG block inherit root layout's `/og-image.png`. Routes with their own OG block override fully — fields you don't set are not inherited per-block (this is Next.js metadata behavior).
- **JSON-LD lives in two places** today: landing (Person + WebSite) and `/rr` (CreativeWork). Other routes don't carry structured data.
- **Same description string is reused** across `metadata.description`, `openGraph.description`, and `twitter.description` for each route — changing one means changing all three.
