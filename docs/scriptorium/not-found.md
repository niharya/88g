# Scriptorium — not-found (404)

Verbatim copy reference. Edit the source files, not this doc — run `/release` to surface drift.

**Sources:** `app/not-found.tsx`, `app/components/NotFoundContent.tsx`

---

## Code numeral {#nf-code}

> "404"
> — [`NotFoundContent.tsx`](../../app/components/NotFoundContent.tsx) (`.not-found__code`, display numeral)

## Headline {#nf-headline}

> "This page got rugged."
> — [`NotFoundContent.tsx`](../../app/components/NotFoundContent.tsx) (`.not-found__headline`, t-h1)

## Support line {#nf-support}

> "Fancy a game before you go?"
> — [`NotFoundContent.tsx`](../../app/components/NotFoundContent.tsx) (`.not-found__support`, t-p2)

## Home marker {#nf-home}

> "Home"
> — [`NotFoundContent.tsx:31`](../../app/components/NotFoundContent.tsx#L31)

## Notes

- The rest of the page is a `<GameBoard />` from the rr route. Game-internal copy is documented in `rr.md`.
- The Home NavMarker uses icon `"arrow_back"` (Material Symbols ligature, not user-visible text).
