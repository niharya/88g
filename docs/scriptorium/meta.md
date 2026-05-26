# Scriptorium — meta

Verbatim reference for all site metadata — page titles, descriptions, Open Graph blocks, Twitter cards, canonical URLs, OG images, JSON-LD structured data, robots, and sitemap. Edit the source files, not this doc — run `/prepush` to surface drift.

**Sources:** `app/layout.tsx`, `app/page.tsx`, `app/marks/page.tsx`, `app/shape-of-product/page.tsx`, `app/(works)/biconomy/page.tsx`, `app/(works)/rr/page.tsx`, `app/(works)/selected/page.tsx`, `app/resume/page.tsx`, `app/privacy/page.tsx`, `app/robots.ts`, `app/sitemap.ts`

This file is the SEO/social mental model. For reading-copy by route, see the per-route MDs in this folder.

---

## Root — metadataBase {#root-base}

> `https://nihar.works`
> — [`layout.tsx:95`](../../app/layout.tsx#L95)

## Root — title template {#root-title}

> default: "Nihar Bhagat"
> template: "%s — Nihar Bhagat"
> — [`layout.tsx:96-99`](../../app/layout.tsx#L96)

## Root — description {#root-description}

> "Portfolio of Nihar Bhagat — product, system, and brand design. Case studies written as long-form reading environments."
> — [`layout.tsx:100`](../../app/layout.tsx#L100)

## Root — applicationName / authors / creator {#root-app}

> applicationName: "Nihar Bhagat"
> creator: "Nihar Bhagat"
> authors: [{ name: "Nihar Bhagat", url: "https://nihar.works" }]
> — [`layout.tsx:101-103`](../../app/layout.tsx#L101)

## Root — keywords {#root-keywords}

> "Nihar Bhagat", "product design", "system design", "brand design", "portfolio", "design"
> — [`layout.tsx:104`](../../app/layout.tsx#L104)

## Root — alternates / canonical {#root-canonical}

> canonical: "/"
> — [`layout.tsx:105-107`](../../app/layout.tsx#L105)

## Root — Open Graph {#root-og}

> type: "website"
> url: "https://nihar.works"
> siteName: "Nihar Bhagat"
> title: "Nihar Bhagat"
> description: "Portfolio of Nihar Bhagat — product, system, and brand design. Case studies written as long-form reading environments."
> locale: "en_US"
> image: "/og-image.png" (1200×630, alt: "Nihar Bhagat — Portfolio")
> — [`layout.tsx:126-141`](../../app/layout.tsx#L126)

## Root — Twitter card {#root-twitter}

> card: "summary_large_image"
> title: "Nihar Bhagat"
> description: "Portfolio of Nihar Bhagat — product, system, and brand design. Case studies written as long-form reading environments."
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
> name: "Nihar Bhagat"
> url: "https://nihar.works"
> jobTitle: "Designer"
> description: "Product, system, and brand designer."
> sameAs: linkedin.com/in/niharbhagat, github.com/niharya, x.com/neonihar
> — [`page.tsx:438-450`](../../app/page.tsx#L438)

## Landing — JSON-LD (WebSite) {#landing-jsonld-website}

> @type: "WebSite"
> name: "Nihar Bhagat"
> url: "https://nihar.works"
> author: { @type: "Person", name: "Nihar Bhagat" }
> inLanguage: "en"
> — [`page.tsx:451-458`](../../app/page.tsx#L451)

---

## /selected (Works) — Metadata {#selected-meta}

> title: "Works"
> description: "Selected works by Nihar Bhagat — product, systems, and brand design from 2018 onward."
> canonical: "/selected"
> — [`page.tsx:10-14`](../../app/(works)/selected/page.tsx#L10)

> OG title: "Works — Nihar Bhagat"
> OG description: "Selected works by Nihar Bhagat — product, systems, and brand design from 2018 onward."
> OG url: "/selected"
> OG image: "/og-image.png"
> — [`page.tsx:15-21`](../../app/(works)/selected/page.tsx#L15)

---

## /biconomy — Metadata {#biconomy-meta}

> title: "Biconomy — Translating Complexity into Usable Systems"
> description: "Designing developer-facing products, onboarding flows, and interactive experiences inside a rapidly evolving infrastructure ecosystem."
> canonical: "/biconomy"
> — [`page.tsx:12-16`](../../app/(works)/biconomy/page.tsx#L12)

> OG title: "Biconomy — Translating Complexity into Usable Systems"
> OG description: "Designing developer-facing products, onboarding flows, and interactive experiences inside a rapidly evolving infrastructure ecosystem."
> OG url: "/biconomy"
> OG image: "/og-biconomy.jpg"
> — [`page.tsx:17-23`](../../app/(works)/biconomy/page.tsx#L17)

---

## /rr (Rug Rumble) — Metadata {#rr-meta}

> title: "Rug Rumble — Turning Infrastructure into Play"
> description: "Part game, part product demo. An experiment in using interaction and humor to communicate complex infrastructure systems."
> canonical: "/rr"
> — [`page.tsx:11-15`](../../app/(works)/rr/page.tsx#L11)

> OG title: "Rug Rumble — Turning Infrastructure into Play"
> OG description: "Part game, part product demo. An experiment in using interaction and humor to communicate complex infrastructure systems."
> OG url: "/rr"
> OG image: "/og-rr.jpg"
> — [`page.tsx:16-22`](../../app/(works)/rr/page.tsx#L16)

## /rr — JSON-LD (CreativeWork) {#rr-jsonld}

> @type: "CreativeWork"
> name: "Rug Rumble"
> headline: "Rug Rumble — Turning Infrastructure into Play"
> description: "Part game, part product demo. An experiment in using interaction and humor to communicate complex infrastructure systems."
> url: "https://nihar.works/rr"
> inLanguage: "en"
> genre: "Game design"
> author: { @type: "Person", name: "Nihar Bhagat", url: "https://nihar.works" }
> isPartOf: { @type: "WebSite", name: "Nihar Bhagat", url: "https://nihar.works" }
> — [`page.tsx:25-37`](../../app/(works)/rr/page.tsx#L25)

## /rr — H1 (sr-only) {#rr-h1}

> "Rug Rumble — strategy card game"
> — [`page.tsx:42`](../../app/(works)/rr/page.tsx#L42)

---

## /marks — Metadata {#marks-meta}

> title: "Marks & Symbols — Identity Work"
> description: "An editorial reel of logo marks and symbols, built like a slow strip of film credits."
> canonical: "/marks"
> — [`page.tsx:28-32`](../../app/marks/page.tsx#L28)

> OG title: "Marks & Symbols — Identity Work"
> OG description: "An editorial reel of logo marks and symbols, built like a slow strip of film credits."
> OG url: "/marks"
> OG image: "/og-marks.jpg"
> — [`page.tsx:33-39`](../../app/marks/page.tsx#L33)

---

## /shape-of-product — Metadata {#sop-meta}

> title: "Shape of Product"
> description: "A musing on building tools for people who build tools, and the role design plays when the shape of product is open."
> canonical: "/shape-of-product"
> — [`page.tsx:8-12`](../../app/shape-of-product/page.tsx#L8)

Notes: No openGraph block authored — falls back to root layout OG.

---

## /resume — Metadata {#resume-meta}

> title: "Resume"
> description: "Resume of Nihar Bhagat — product, system, and brand designer. Selected work, roles, and what I look for in the next chapter."
> canonical: "/resume"
> — [`page.tsx:27-30`](../../app/resume/page.tsx#L27)

> OG type: "profile"
> OG url: "https://nihar.works/resume"
> OG siteName: "Nihar Bhagat"
> OG title: "Resume — Nihar Bhagat"
> OG description: "Resume of Nihar Bhagat — product, system, and brand designer."
> OG image: "/og-image.png" (1200×630, alt: "Nihar Bhagat — Resume")
> — [`page.tsx:31-45`](../../app/resume/page.tsx#L31)

> Twitter card: "summary_large_image"
> Twitter title: "Resume — Nihar Bhagat"
> Twitter description: "Resume of Nihar Bhagat — product, system, and brand designer."
> Twitter images: ["/og-image.png"]
> — [`page.tsx:46-51`](../../app/resume/page.tsx#L46)

---

## /privacy — Metadata {#privacy-meta}

> title: "Privacy"
> description: "How nihar.works handles the small amount of data it touches."
> canonical: "/privacy"
> — [`page.tsx:12-16`](../../app/privacy/page.tsx#L12)

Notes: No openGraph block authored — falls back to root layout OG.

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
| `/selected` | monthly | 0.9 |
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

- **Dev-only routes** (`/_dev-tools/lqip-lab`, `/_dev-tools/sticker-lab`, `/preview/404`) have minimal metadata (just `title`) and are intentionally not in the sitemap. Not catalogued here.
- **Title template** (`%s — Nihar Bhagat`) applies to every route that sets `title` as a string. `title: "Resume"` renders as `"Resume — Nihar Bhagat"` in the browser tab.
- **OG image fallback chain:** routes without an OG block inherit root layout's `/og-image.png`. Routes with their own OG block override fully — fields you don't set are not inherited per-block (this is Next.js metadata behavior).
- **JSON-LD lives in two places** today: landing (Person + WebSite) and `/rr` (CreativeWork). Other routes don't carry structured data.
- **Same description string is reused** across `metadata.description`, `openGraph.description`, and `twitter.description` for each route — changing one means changing all three.
