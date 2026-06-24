# Scriptorium — privacy

Verbatim copy reference. Edit the source files, not this doc — run `/release` to surface drift.

**Sources:** `app/privacy/page.tsx`, `app/privacy/components/PrivacyBackLink.tsx`

---

## Header {#header}

> "Privacy"
> — [`page.tsx:23`](../../app/privacy/page.tsx#L23)

> "Last updated June 2026"
> — [`page.tsx:24`](../../app/privacy/page.tsx#L24)

## Body paragraph 1 {#body-1}

> "nihar.works is a personal portfolio. It does not place advertising, set tracking cookies, or share visitor information with anyone. It does use a privacy-first, cookieless analytics service ([Umami](https://umami.is/)) to see anonymous, aggregate patterns — how many people visit, which pages they read, and where they arrived from. No cookies are set, you are never identified, and the analytics service stores nothing on your device."
> — [`page.tsx:29-35`](../../app/privacy/page.tsx#L29)

## Body paragraph 2 {#body-2}

> "The only feature that collects data is the contact form on the home page. When you send a note, the form delivers your name, email, the purpose tags you selected, and the message you wrote directly to my inbox via [EmailJS](https://www.emailjs.com/). Your details are not stored anywhere else, are not added to any mailing list, and are only used to reply to you."
> — [`page.tsx:38-44`](../../app/privacy/page.tsx#L38)

## Body paragraph 3 {#body-3}

> "The “Book a call” link opens a Google Calendar appointment page on calendar.app.google. Anything you fill in there is handled by Google’s own privacy policy."
> — [`page.tsx:47-49`](../../app/privacy/page.tsx#L47)

## Body paragraph 4 {#body-4}

> "The site keeps a little state in your browser. Short-lived session flags remember how you moved between pages — so transitions animate the right way, and the back link on this page returns you to where you came from — and they clear when you close the tab. A couple of small local flags remember interface state on one project page (the Rug Rumble case study) — for instance, that you’ve already seen a panel — so it isn’t replayed on a return visit. All of this stays on your device, is never sent anywhere, and none of it is a cookie."
> — [`page.tsx:52-60`](../../app/privacy/page.tsx#L52)

## Body paragraph 5 {#body-5}

> "If you ever want a copy of the contact-form message you sent me removed from my inbox, email me and I will delete it."
> — [`page.tsx:63-64`](../../app/privacy/page.tsx#L63)

## Back link labels (dynamic) {#back-link}

> "Works"
> — [`PrivacyBackLink.tsx:29`](../../app/privacy/components/PrivacyBackLink.tsx#L29)

> "Biconomy"
> — [`PrivacyBackLink.tsx:30`](../../app/privacy/components/PrivacyBackLink.tsx#L30)

> "Rug Rumble"
> — [`PrivacyBackLink.tsx:31`](../../app/privacy/components/PrivacyBackLink.tsx#L31)

> "Back"
> — [`PrivacyBackLink.tsx:32`](../../app/privacy/components/PrivacyBackLink.tsx#L32)

> "Marks"
> — [`PrivacyBackLink.tsx:33`](../../app/privacy/components/PrivacyBackLink.tsx#L33)

> "Back" (fallback)
> — [`PrivacyBackLink.tsx:36`](../../app/privacy/components/PrivacyBackLink.tsx#L36)

## Notes

- Back link label/tone are chosen at runtime from `sessionStorage['privacy-from']`. Default fallback is "Back".
- "Privacy" uses curly quotes (`“ ”`) and curly apostrophes (`’`) via HTML entities; preserved here verbatim.
