# Scriptorium — shared

Verbatim copy reference. Edit the source files, not this doc — run `/prepush` to surface drift.

**Sources:** `app/layout.tsx`, `app/components/Footer/Footer.tsx`, `app/components/NiharHomeLink/NiharHomeLink.tsx`, `app/components/nav/ExitMarker.tsx`, `app/(works)/ShellNav.tsx`

---

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
