# Scriptorium — shared

Verbatim copy reference. Edit the source files, not this doc — run `/prepush` to surface drift.

**Sources:** `app/layout.tsx`, `app/components/Footer/Footer.tsx`, `app/components/NiharHomeLink/NiharHomeLink.tsx`, `app/components/nav/ExitMarker.tsx`, `app/(works)/ShellNav.tsx`

---

## Root metadata — title template {#meta-title}

> "Nihar Bhagat" (default title)
> — [`layout.tsx:97`](../../app/layout.tsx#L97)

> "%s — Nihar Bhagat" (template applied to child route titles)
> — [`layout.tsx:98`](../../app/layout.tsx#L98)

## Root metadata — description {#meta-description}

> "Portfolio of Nihar Bhagat — product, system, and brand design. Case studies written as long-form reading environments."
> — [`layout.tsx:100`](../../app/layout.tsx#L100)

## Root metadata — applicationName / creator / authors {#meta-app}

> "Nihar Bhagat"
> — [`layout.tsx:101-103`](../../app/layout.tsx#L101)

## Root metadata — keywords {#meta-keywords}

> "Nihar Bhagat", "product design", "system design", "brand design", "portfolio", "design"
> — [`layout.tsx:104`](../../app/layout.tsx#L104)

## Root metadata — Open Graph {#meta-og}

> "Nihar Bhagat" (siteName / title)
> — [`layout.tsx:129-130`](../../app/layout.tsx#L129)

> "Portfolio of Nihar Bhagat — product, system, and brand design. Case studies written as long-form reading environments."
> — [`layout.tsx:131`](../../app/layout.tsx#L131)

> "Nihar Bhagat — Portfolio" (OG image alt)
> — [`layout.tsx:138`](../../app/layout.tsx#L138)

## Root metadata — Twitter card {#meta-twitter}

> "Nihar Bhagat"
> — [`layout.tsx:144`](../../app/layout.tsx#L144)

> "Portfolio of Nihar Bhagat — product, system, and brand design. Case studies written as long-form reading environments."
> — [`layout.tsx:145`](../../app/layout.tsx#L145)

## Skip-to-content link {#skip-link}

> "Skip to content"
> — [`layout.tsx:209`](../../app/layout.tsx#L209)

## Footer — credit {#footer-credit}

> "Made in 2026"
> — [`Footer.tsx:35`](../../app/components/Footer/Footer.tsx#L35)

## Footer — link labels {#footer-links}

> "Privacy"
> — [`Footer.tsx:23`](../../app/components/Footer/Footer.tsx#L23)

> "Resume"
> — [`Footer.tsx:29`](../../app/components/Footer/Footer.tsx#L29)

> "LinkedIn"
> — [`Footer.tsx:30`](../../app/components/Footer/Footer.tsx#L30)

> "X"
> — [`Footer.tsx:31`](../../app/components/Footer/Footer.tsx#L31)

> "GitHub"
> — [`Footer.tsx:32`](../../app/components/Footer/Footer.tsx#L32)

## NiharHomeLink {#nihar-home}

> "Nihar"
> — [`NiharHomeLink.tsx:41`](../../app/components/NiharHomeLink/NiharHomeLink.tsx#L41)

> "Back to landing page" (aria-label)
> — [`NiharHomeLink.tsx:43`](../../app/components/NiharHomeLink/NiharHomeLink.tsx#L43)

## ExitMarker {#exit-marker}

> "EXIT"
> — [`ExitMarker.tsx:13`](../../app/components/nav/ExitMarker.tsx#L13)

> "Back to works" (aria-label)
> — [`ExitMarker.tsx:14`](../../app/components/nav/ExitMarker.tsx#L14)

## ShellNav — segment-mapped project marker names {#shell-nav-names}

> "Nihar" (segment: selected)
> — [`ShellNav.tsx:24`](../../app/(works)/ShellNav.tsx#L24)

> "Rug Rumble" (segment: rr)
> — [`ShellNav.tsx:25`](../../app/(works)/ShellNav.tsx#L25)

> "Biconomy" (segment: biconomy)
> — [`ShellNav.tsx:26`](../../app/(works)/ShellNav.tsx#L26)

> "Nihar" (fallback)
> — [`ShellNav.tsx:32`](../../app/(works)/ShellNav.tsx#L32)

## ProjectMarker default {#project-marker-default}

> "Biconomy" (default projectName when none passed)
> — [`ProjectMarker.tsx:26`](../../app/components/nav/ProjectMarker.tsx#L26)

## Notes

- NavMarker labels for routes are passed in as props by the consuming page; documented in each route's MD file.
- The chapter-tray flyout buttons re-render icons via Material Symbols ligatures (`arrow_upward` / `arrow_downward`) — these are icon glyphs, not visible English words.
- Footer credit is a single constant; updating the year requires editing `Footer.tsx:35`.
