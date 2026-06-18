# Scriptorium — meta

Verbatim reference for all site metadata — page titles, descriptions, Open Graph blocks, Twitter cards, canonical URLs, OG images, JSON-LD structured data, robots, and sitemap. Edit the source files, not this doc — run `/release` to surface drift.

**Sources:** `app/layout.tsx`, `app/page.tsx`, `app/marks/page.tsx`, `app/shape-of-product/page.tsx`, `app/(works)/biconomy/page.tsx`, `app/(works)/rr/page.tsx`, `app/(works)/all/page.tsx`, `app/resume/page.tsx`, `app/privacy/page.tsx`, `app/robots.ts`, `app/sitemap.ts`

This file is the SEO/social mental model. For reading-copy by route, see the per-route MDs in this folder.

---

## Root — metadataBase {#root-base}

> `https://nihar.works`
> — [`layout.tsx:95`](../../app/layout.tsx#L95)

## Root — title template {#root-title}

> default: "Nihar, Advanced Designer, Basic Conversationalist"
> template: "%s · Nihar"
> — [`layout.tsx:96-99`](../../app/layout.tsx#L96)

## Root — description {#root-description}

> "Started with graphic design and somehow ended up deep in developer tooling and infrastructure systems."
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
> title: "This wasn’t the original plan."
> description: "UI and interaction design. Studio-building and creative direction. Developer tooling, tech infrastructure, growth experiments."
> locale: "en_US"
> image: "/og-image.png" (1200×630, alt: "Nihar — Portfolio")
> — [`layout.tsx:126-141`](../../app/layout.tsx#L126)

## Root — Twitter card {#root-twitter}

> card: "summary_large_image"
> title: "Nihar, Screens, Teams, Infrastructure"
> description: "Got into design because of curiosity and stayed because I like making complicated things feel clear."
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
> jobTitle: "Designer"
> description: "Started with graphic design and somehow ended up deep in developer tooling and infrastructure systems."
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

## /all (Works) — Metadata {#selected-meta}

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

- **Dev-only routes** (`/_dev-tools/lqip-lab`, `/_dev-tools/sticker-lab`, `/preview/404`) have minimal metadata (just `title`) and are intentionally not in the sitemap. Not catalogued here.
- **Title template** (`%s · Nihar`) applies to every route that sets `title` as a string. `title: "Resume · Interfaces To Infrastructure"` renders as `"Resume · Interfaces To Infrastructure · Nihar"` in the browser tab.
- **OG image fallback chain:** routes without an OG block inherit root layout's `/og-image.png`. Routes with their own OG block override fully — fields you don't set are not inherited per-block (this is Next.js metadata behavior).
- **JSON-LD lives in two places** today: landing (Person + WebSite) and `/rr` (CreativeWork). Other routes don't carry structured data.
- **Same description string is reused** across `metadata.description`, `openGraph.description`, and `twitter.description` for each route — changing one means changing all three.
