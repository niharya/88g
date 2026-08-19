# Scriptorium — resume

Verbatim copy reference. Edit the source files, not this doc — run `/release` to surface drift.

**Sources:** `app/resume/page.tsx`, `app/resume/ResumeSheet.tsx`, `app/resume/ResumeViewer.tsx`

---

## Embed label {#embed-label}

> "Nihar — Resume"
> — [`ResumeViewer.tsx`](../../app/resume/ResumeViewer.tsx) (`aria-label` on the `<object>`)

## Sheet {#sheet}

The authored fallback — the page for phones, browsers that won't display a PDF
inline, and JS-off clients. Deliberately carries no "your browser couldn't…"
line: for most people who see it, nothing went wrong.

> "Resume"
> — [`ResumeSheet.tsx`](../../app/resume/ResumeSheet.tsx) (`.resume-sheet__title`)

> "Nihar Bhagat"
> — [`ResumeSheet.tsx`](../../app/resume/ResumeSheet.tsx) (`.resume-sheet__standfirst`)

> "Most of my career happened because I kept going one layer deeper."
> — [`ResumeSheet.tsx`](../../app/resume/ResumeSheet.tsx) (`.resume-sheet__lead`) — also the route's `metadata.description`

> "Open the PDF"
> — [`ResumeSheet.tsx`](../../app/resume/ResumeSheet.tsx) (`.resume-sheet__action-label`)

> "1.8 MB · opens in a new tab"
> — [`ResumeSheet.tsx`](../../app/resume/ResumeSheet.tsx) (`.resume-sheet__meta`)

## Assistive-tech link {#plain-link}

Inside the `<object>` fallback; visually clipped, read by screen readers and crawlers.

> "Open the resume PDF"
> — [`ResumeViewer.tsx`](../../app/resume/ResumeViewer.tsx) (`.resume-page__plain-link`)

## Notes

- The PDF's own contents are not part of this catalog.
- The retired `<noscript>` block ("Your browser blocked the embedded viewer.") was removed
  in the v0.132.0 pass — it keyed off scripting, not off whether the embed painted, so it
  never fired for the case it named. `ResumeSheet` replaces it.
