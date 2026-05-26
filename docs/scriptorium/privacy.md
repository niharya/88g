# Scriptorium — privacy

Verbatim copy reference. Edit the source files, not this doc — run `/prepush` to surface drift.

**Sources:** `app/privacy/page.tsx`, `app/privacy/components/PrivacyBackLink.tsx`

---

## Metadata {#meta}

> "Privacy"
> — [`page.tsx:13`](../../app/privacy/page.tsx#L13)

> "How nihar.works handles the small amount of data it touches."
> — [`page.tsx:14`](../../app/privacy/page.tsx#L14)

## Header {#header}

> "Privacy"
> — [`page.tsx:23`](../../app/privacy/page.tsx#L23)

> "Last updated April 2026"
> — [`page.tsx:24`](../../app/privacy/page.tsx#L24)

## Body paragraph 1 {#body-1}

> "nihar.works is a personal portfolio. It does not run analytics, does not place advertising, does not set tracking cookies, and does not share any visitor information with third parties."
> — [`page.tsx:29-31`](../../app/privacy/page.tsx#L29)

## Body paragraph 2 {#body-2}

> "The only feature that collects data is the contact form on the home page. When you send a note, the form delivers your name, email, the purpose tags you selected, and the message you wrote directly to my inbox via [EmailJS](https://www.emailjs.com/). Your details are not stored anywhere else, are not added to any mailing list, and are only used to reply to you."
> — [`page.tsx:34-41`](../../app/privacy/page.tsx#L34)

## Body paragraph 3 {#body-3}

> "The “Book a call” link opens a Google Calendar appointment page on calendar.app.google. Anything you fill in there is handled by Google’s own privacy policy."
> — [`page.tsx:43-46`](../../app/privacy/page.tsx#L43)

## Body paragraph 4 {#body-4}

> "The site uses a single short-lived browser session flag to remember which way you arrived at a page, so animations transition smoothly. It is cleared when you close the tab. No other browser storage, no cookies."
> — [`page.tsx:48-52`](../../app/privacy/page.tsx#L48)

## Body paragraph 5 {#body-5}

> "If you ever want a copy of the contact-form message you sent me removed from my inbox, email me and I will delete it."
> — [`page.tsx:54-55`](../../app/privacy/page.tsx#L54)

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
