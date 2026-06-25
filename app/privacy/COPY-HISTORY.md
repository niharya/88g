# Privacy notice — copy history

An append-only record of **what the privacy notice has said, and when**. Copy
only — design, layout, and code changes are out of scope (those live in git).
Each substantive wording change gets a new dated entry **appended at the
bottom**; never edit a past entry (it's the record of what a visitor would have
read at that date). Dates are the release commit's timestamp (IST, +0530).

> Earlier lineage (pre-baseline, not transcribed): the notice was first
> published at **v0.70.0 · 2026-04-30** and had a metadata/tone rewrite at
> **v0.88.0 · 2026-05-27**. The first fully-transcribed version below is the one
> immediately preceding the stationery redesign.

---

## v0.109.0 · 2026-06-25 00:28

Plain single-column notice. Title "Privacy", "Last updated June 2026", five
prose paragraphs. This release added the cookieless-**Umami** analytics
disclosure to the analytics paragraph.

> nihar.works is a personal portfolio. It does not place advertising, set
> tracking cookies, or share visitor information with anyone. It does use a
> privacy-first, cookieless analytics service (Umami) to see anonymous,
> aggregate patterns — how many people visit, which pages they read, and where
> they arrived from. No cookies are set, you are never identified, and the
> analytics service stores nothing on your device.
>
> The only feature that collects data is the contact form on the home page.
> When you send a note, the form delivers your name, email, the purpose tags you
> selected, and the message you wrote directly to my inbox via EmailJS. Your
> details are not stored anywhere else, are not added to any mailing list, and
> are only used to reply to you.
>
> The "Book a call" link opens a Google Calendar appointment page on
> calendar.app.google. Anything you fill in there is handled by Google's own
> privacy policy.
>
> The site keeps a little state in your browser. Short-lived session flags
> remember how you moved between pages — so transitions animate the right way,
> and the back link on this page returns you to where you came from — and they
> clear when you close the tab. A couple of small local flags remember interface
> state on one project page (the Rug Rumble case study) — for instance, that
> you've already seen a panel — so it isn't replayed on a return visit. All of
> this stays on your device, is never sent anywhere, and none of it is a cookie.
>
> If you ever want a copy of the contact-form message you sent me removed from
> my inbox, email me and I will delete it.

---

## v0.111.0 (pending release) · 2026-06-25

Stationery redesign. Same five topics, restructured into a lead statement plus
five numbered Articles, each with a short description and a skimmable register
card. Prose kept **verbatim** where it stayed prose (lead, Article III, the
removal coupon); descriptions were lightly tightened where their specifics moved
into card fields. No facts added or removed.

**Lead** (verbatim from prior)
> nihar.works is a personal portfolio. It does not place advertising, set
> tracking cookies, or share visitor information with anyone.

**Article I — Analytics** (description trimmed; the counted/never-done specifics
moved into the "Recorded by Umami" card)
> It does use a privacy-first, cookieless analytics service (Umami) to see
> anonymous, aggregate patterns.

**Article II — The Contact Form** (sentence 1 verbatim; the field list moved to
the "What your note carries" card, "via EmailJS" to the card's footer band, the
not-stored/no-list/only-reply assurances to a fact strip)
> The only feature that collects data is the contact form on the home page. When
> you send a note, it goes straight to my inbox.

**Article III — Booking a Call** (verbatim from prior)
> The "Book a call" link opens a Google Calendar appointment page on
> calendar.app.google. Anything you fill in there is handled by Google's own
> privacy policy.

**Article IV — What Your Browser Keeps** (kept the "why"; the per-flag specifics
moved into the Session/Local cards + a fact strip)
> The site keeps a little state in your browser. Short-lived session flags
> remember how you moved between pages — so transitions animate the right way
> and the back link returns you where you came from. A couple of small local
> flags remember interface state on one project page, so it isn't replayed on a
> return visit. All of it is small, and gone the moment it is not needed.

**Article V — The Right of Removal** (verbatim from prior; "Write to me →" button
→ mailto:commissions@niharbhagat.com)
> If you ever want a copy of the contact-form message you sent me removed from my
> inbox, email me and I will delete it.
