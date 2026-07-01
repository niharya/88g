# Scriptorium — landing

Verbatim copy reference. Edit the source files, not this doc — run `/release` to surface drift.

**Sources:** `app/page.tsx`, `app/lib/greeting.ts`

---

## About short (collapsed view) {#about-short}

> "I never fit neatly into one discipline. Every time I thought I found “my thing,” it opened the door to a larger system behind it."
> — [`page.tsx:478-480`](../../app/page.tsx#L478)

## Hero — greeting {#hero-greeting}

> "Good morning"
> — [`greeting.ts:9`](../../app/lib/greeting.ts#L9)

> "Good afternoon"
> — [`greeting.ts:10`](../../app/lib/greeting.ts#L10)

> "Good evening"
> — [`greeting.ts:11`](../../app/lib/greeting.ts#L11)

## Hero — headline {#hero-headline}

> "I’m Nihar. I’ve designed brands, cultures, and products."
> — [`page.tsx:491-493`](../../app/page.tsx#L491)

> "What connected all of it was systems thinking."
> — [`page.tsx:494`](../../app/page.tsx#L494)

## Hero — expand pill aria {#hero-pill-aria}

> "Collapse content" / "Expand content"
> — [`page.tsx:499`](../../app/page.tsx#L499)

## Nav row markers {#nav-row}

> "Nihar"
> — [`page.tsx:519`](../../app/page.tsx#L519)

> "Works"
> — [`page.tsx:531`](../../app/page.tsx#L531)

> "Collapse content" / "Expand content" (aria-label on Nihar marker)
> — [`page.tsx:522`](../../app/page.tsx#L522)

## About long — practice timeline {#about-long-practice-timeline}

The about-long card was rebuilt into the practice timeline (v0.114–116); the old
disciplines-list copy is retired. Referenced by symbol (line refs drift).

> "Started with standup comedy. Then graphic design."
> — [`page.tsx`](../../app/page.tsx) — `.practice-timeline__statement`

> "Since then I have been overusing my talent. Like with these graphs." (accent)
> — [`page.tsx`](../../app/page.tsx) — `.practice-timeline__accent`

> "Interface" · "How do people interact with technology?" · "2016 – 2018"
> "Brand" · "How do ideas shape an organization?" · "2018 – 2021"
> "Product" · "How do complex products become usable?" · "2021 – Now"
> — [`page.tsx`](../../app/page.tsx) — `TIMELINE_PHASES`

## Spectrum labels {#spectrum-labels}

> "Abstraction"
> — [`page.tsx:581`](../../app/page.tsx#L581)

> "Application"
> — [`page.tsx:582`](../../app/page.tsx#L582)

> "My Works"
> — [`page.tsx:585`](../../app/page.tsx#L585)

## About practice {#about-practice}

> "My practice has evolved from designing symbols to designing dashboards. I’ve found joy in breaking and making processes within live systems to make them flowww."
> — [`page.tsx:596-598`](../../app/page.tsx#L596)

> "I live well to be able to design well. I want to make my life and lives of those around me beautiful."
> — [`page.tsx:600-601`](../../app/page.tsx#L600)

> "Small interventions. In work. In daily life. And adjustments that make things function a bit better and make life feel a bit better."
> — [`page.tsx:603`](../../app/page.tsx#L603)

> "Welcome to my collection of design interventions aka my portfolio."
> — [`page.tsx:605`](../../app/page.tsx#L605)

## Contact — intro {#contact-intro}

> "I am looking to give my creative practice its deepest and farthest expression. If we’re going the same way, I could use a lift."
> — [`page.tsx:614-616`](../../app/page.tsx#L614)

## Contact — action button states {#contact-action}

> "Send A Note"
> — [`page.tsx:77`](../../app/page.tsx#L77)

> "Reset Form"
> — [`page.tsx:218`](../../app/page.tsx#L218)

> "Close Form"
> — [`page.tsx:218, 226`](../../app/page.tsx#L218)

## Contact — form labels {#contact-form-labels}

> "Your Name"
> — [`page.tsx:652`](../../app/page.tsx#L652)

> "What brings you here?"
> — [`page.tsx:672`](../../app/page.tsx#L672)

> "Note"
> — [`page.tsx:699`](../../app/page.tsx#L699)

> "Email"
> — [`page.tsx:716`](../../app/page.tsx#L716)

## Contact — purpose tags {#contact-tags}

> "Hiring"
> — [`page.tsx:431`](../../app/page.tsx#L431)

> "Collaboration"
> — [`page.tsx:431`](../../app/page.tsx#L431)

> "Curiosity"
> — [`page.tsx:431`](../../app/page.tsx#L431)

> "Something else"
> — [`page.tsx:431`](../../app/page.tsx#L431)

## Contact — submit button states {#contact-submit}

> "Sending…"
> — [`page.tsx:743`](../../app/page.tsx#L743)

> "Note Sent"
> — [`page.tsx:743`](../../app/page.tsx#L743)

> "Send Note"
> — [`page.tsx:743`](../../app/page.tsx#L743)

## Contact — submit success / error pills {#contact-pills}

> "Note Sent. Thank you."
> — [`page.tsx:751`](../../app/page.tsx#L751)

> "There seems to be a network error on my side. I’ve been notified. Please try again in a few hours."
> — [`page.tsx:754`](../../app/page.tsx#L754)

## Contact — footer (Book a call) {#contact-foot}

> "Prefer to talk sooner?"
> — [`page.tsx:768`](../../app/page.tsx#L768)

> "Book A Call"
> — [`page.tsx:769`](../../app/page.tsx#L769)

## CaptionTag (Startooth pattern) {#caption-tag}

> "Startooth Pattern"
> — [`page.tsx:778`](../../app/page.tsx#L778)

> "Geometric trapezoids, sliced by stars and diamonds, inspired by the houndstooth pattern."
> — [`page.tsx:780`](../../app/page.tsx#L780)

> "2025" (year)
> — [`page.tsx:779`](../../app/page.tsx#L779)

## Honeypot field (hidden) {#honeypot}

> "Website"
> — [`page.tsx:643`](../../app/page.tsx#L643)

## Notes

- Greeting is time-of-day computed at mount via `getGreeting()` — one of three strings shown.
- Purpose tags are randomized in tilt rotation per click, not in label order.
- Sent-pill color is random from a 4-color array (`SENT_COLORS`, line 94).
- The honeypot "Website" label is visually hidden (`left: -9999px`) but exists in the DOM for bots.
