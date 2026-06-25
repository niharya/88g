# Scriptorium — privacy

Verbatim copy reference. Edit the source files, not this doc — run `/release` to surface drift.

**Sources:** `app/privacy/page.tsx`, `app/privacy/components/PrivacyReturn.tsx`

> The notice was redesigned into the "stationery" form at v0.111.0 (five numbered
> Articles + register cards). Per-version copy history lives in
> `app/privacy/COPY-HISTORY.md`; this file tracks the *current* verbatim copy only.

---

## Masthead {#masthead}

> "NIHAR · WORKS"  *(crest wordmark)*

> "Privacy"  *(title)*

> "On the Handling of Visitor Information"  *(subtitle)*

## Lead {#lead}

> "nihar.works is a personal portfolio. It does not place advertising, set tracking cookies, or share visitor information with anyone."

## Article I — Analytics {#article-1}

Eyebrow "Article I" · title "Analytics".

> "It does use a privacy-first, cookieless analytics service ([Umami](https://umami.is/)) to see anonymous, aggregate patterns."

Register card **"Recorded by Umami"** — *What it counts:* Visitors → Yes · Pages read → Yes · Referrer → Yes. *What it never does:* Cookies → None · Your identity → Never · Device storage → None.

## Article II — The Contact Form {#article-2}

Eyebrow "Article II" · title "The Contact Form".

> "The only feature that collects data is the contact form on the home page. When you send a note, it goes straight to my inbox."

Register card **"What your note carries"** — Your name / as you typed it · Email / to reply to you · Purpose tags / the ones you picked · Your message / in full. Footer band: "→ Straight to my inbox, via [EmailJS](https://www.emailjs.com/)". Fact strip: "Not stored elsewhere · No mailing list · Only to reply".

## Article III — Booking a Call {#article-3}

Eyebrow "Article III" · title "Booking a Call".

> "The “Book a call” link opens a Google Calendar appointment page on calendar.app.google. Anything you fill in there is handled by Google’s own privacy policy."

Register card **"The hand-off"** — Opens / calendar.app.google · Governed by / [Google’s privacy policy](https://policies.google.com/privacy).

## Article IV — What Your Browser Keeps {#article-4}

Eyebrow "Article IV" · title "What Your Browser Keeps".

> "The site keeps a little state in your browser. Short-lived session flags remember how you moved between pages — so transitions animate the right way and the back link returns you where you came from. A couple of small local flags remember interface state on one project page, so it isn’t replayed on a return visit. All of it is small, and gone the moment it is not needed."

Register cards — **Session flags:** Remember / Page transitions & the back link · Cleared / When you close the tab. **Local flags:** Remember / A panel you’ve already seen · Scope / One project page (Rug Rumble). Fact strip: "Stays on device · Never sent · Not a cookie".

## Article V — The Right of Removal {#article-5}

Eyebrow "Article V" · title "The Right of Removal".

> "If you ever want a copy of the contact-form message you sent me removed from my inbox, email me and I will delete it."

Button: "Write to me →" (`mailto:commissions@niharbhagat.com`).

## Footer {#footer}

> "Nihar·Works"  *(colophon mark)*

> "Privacy Notice · June 2026"  *(meta; the date is driven by a single `LAST_UPDATED` const, also surfacing in the "Filed · June 2026" stamp)*

## Return links (PrivacyReturn) {#return}

> "Return"  *(top marker label — `ReturnMarker`)*

> "Return to nihar.works"  *(bottom button label)*

## Notes

- The two return links are statically labelled; only their **destination** is dynamic, read at runtime from `sessionStorage['privacy-from']` (set by the Footer's Privacy link) — back to `/all`, `/biconomy`, `/rr`, `/marks`, else `/`. The old per-source toned labels (Works / Biconomy / …) were retired with `PrivacyBackLink`.
- Decorative, `aria-hidden` chrome (not read aloud): the gutter marginalia (`§ I`…`§ V`, `↗ umami.is`, `↗ emailjs.com`, `↗ google.com`, `kept on-device`, `↗ niharbhagat.com`) and the tilted "Filed · June 2026" stamp. Dropped on mobile.
- Curly quotes (`“ ”`) and apostrophes (`’`) are used in Articles III–V verbatim, via HTML entities in the source.
