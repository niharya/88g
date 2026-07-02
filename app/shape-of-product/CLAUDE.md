# /shape-of-product — protective digest

Part of the 88g doc family (root `CLAUDE.md` → "The document family"). Auto-loads whenever files under `app/shape-of-product/` are touched.

**Archive:** [`./ANOMALIES.md`](./ANOMALIES.md) — full rationale and what-breaks. Intent: [`./DESIGN.md`](./DESIGN.md). This digest is the seatbelt; the archive is the manual.

**Maintenance:** every new ANOMALIES entry gets a one-line item here in the same commit; every retired entry removes its item. The `/release` census checks this pairing.

This is the musings layer — the one sanctioned net-new authoring zone in the finishing-stage repo. New musings live alongside this route.

## Don't-touch digest

- Do not remove `CrossShellEntryFader` from layout.tsx — a future inbound `useCrossShellNav` link won't land cleanly. ANOMALIES.md → "Layout & shell"
- Do not drop the `viewport.themeColor '#f9f9f7'` override in layout.tsx — the mobile URL bar paints cooler than the page ground. ANOMALIES.md → "Layout & shell"
- Do not remove `text-transform: none` or `white-space: nowrap` on `.sop-nav-row .nav-marker__title` — title regresses to "Shape Of Product" and/or wraps to three lines at 375px. ANOMALIES.md → "Nav pair (`SopNavRow`)"
- The chip icon's collapsed width is intentional (`.sop__chip .nav-icon` width 0 / opacity 0 at rest, unfurls on hover/focus) — "fixing" it widens every chip and pushes the prose. ANOMALIES.md → "Inline chapter chips (`.sop__chip`)"
- Keep the `.sop__chip .nav-marker__content` overrides (`flex-direction: row-reverse; padding: 4px 8px`) — NavMarker's default padding leaves 32px of trailing whitespace past the collapsed icon. ANOMALIES.md → "Inline chapter chips (`.sop__chip`)"
- Keep `text-transform: none` on `.sop__chip .nav-marker__title` — chips stop quoting prose phrases verbatim. ANOMALIES.md → "Inline chapter chips (`.sop__chip`)"
- Chip hrefs are hard-coupled to biconomy chapter slugs `#ux-audit` and `#demos` (`app/(works)/biconomy/nav/chapters.ts`), `target=_blank` is intentional — renaming those slugs breaks the chips silently. ANOMALIES.md → "Inline chapter chips (`.sop__chip`)"
- ActorStickers tilts and Y offsets are frozen authored constants — do not reintroduce Math.random; the identical pose every visit is deliberate. ANOMALIES.md → "Actor stickers (`ActorStickers`)"
- Keep each sticker's translateY on the `.sop__actor-slot` wrapper — the inner Sticker's transform is reserved for rotation + hover lift; overloading it breaks the click-rotate jitter. ANOMALIES.md → "Actor stickers (`ActorStickers`)"
- SignOffCard's tilt must stay an inline style transform — the class-based variant silently pins at 2deg due to a transition/cascade interaction. ANOMALIES.md → "Sign-off card (`SignOffCard`)"
- Keep `useState(getGreeting)` lazy-init in SignOffCard — a direct call in the render body breaks SSR/hydration agreement on the hour. ANOMALIES.md → "Sign-off card (`SignOffCard`)"
- SignOffCard's settle is one-way per session — don't make it a toggle; clicking the flat card is a no-op by design. ANOMALIES.md → "Sign-off card (`SignOffCard`)"
- In RoleApproachStack, `aria-hidden` goes on the inner `.sop__stack-content` only, never the whole card — the tab button must stay in the a11y tree. ANOMALIES.md → "Roles ↔ Approach stack (`RoleApproachStack`)"
- Keep the ARIA tablist pattern (role=tab + aria-controls + aria-selected) — aria-pressed semantics were tried and are wrong for select-one-of-two. ANOMALIES.md → "Roles ↔ Approach stack (`RoleApproachStack`)"
- Preserve the asymmetric inactive-card offsets (Roles 24px; Approach 40px desktop / 28px mobile) — yellow reads harder than olive; never flatten the asymmetry. ANOMALIES.md → "Roles ↔ Approach stack (`RoleApproachStack`)"
- Editorial chunk rhythm lives in flex gap (`--space-56` desktop on `.sop__chunks`) — don't convert to per-chunk margins; add breathing room via margin-bottom on `.sop__chunks`, never by changing the gap. ANOMALIES.md → "Editorial chunks + dividers"
- `--sop-prose-ink` stays route-local on `.route-sop` — never consume another route's token, and don't inline the hex. ANOMALIES.md → "Tokens & cascade"
- The doubled bottom padding (`--sop-pad-bottom`) is authored breathing room for the sign-off card — don't normalize it. ANOMALIES.md → "Tokens & cascade"
- Mobile stack narrowing (max-width 240px, right padding 64px) exists because the desktop geometry overflows a 375px viewport — don't remove. ANOMALIES.md → "Responsive"
- ActorStickers are deliberately not responsively scaled — if prose wraps awkwardly, adjust the copy, not the sticker size. ANOMALIES.md → "Responsive"
- The page's register is deliberately quiet: no scroll choreography, no reveal-on-intersection, no auto-anything, no contact form / CTA cluster — don't add "engagement" affordances. ANOMALIES.md → "Editorial register"
