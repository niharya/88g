# Scriptorium — biconomy

Verbatim copy reference. Edit the source files, not this doc — run `/prepush` to surface drift.

**Sources:** `app/(works)/biconomy/page.tsx`, `app/(works)/biconomy/nav/chapters.ts`, `app/(works)/biconomy/components/*.tsx`, `app/(works)/biconomy/components/flowSlides.ts`

---

## Metadata {#meta}

> "Biconomy — Translating Complexity into Usable Systems"
> — [`page.tsx:13`](../../app/(works)/biconomy/page.tsx#L13)

> "Designing developer-facing products, onboarding flows, and interactive experiences inside a rapidly evolving infrastructure ecosystem."
> — [`page.tsx:14-15`](../../app/(works)/biconomy/page.tsx#L14)

## sr-only heading {#sr-heading}

> "Biconomy — long-form UX case study"
> — [`page.tsx:52`](../../app/(works)/biconomy/page.tsx#L52)

## Chapters (nav data) {#chapters}

> "UX Audit" — 2024
> — [`chapters.ts:9`](../../app/(works)/biconomy/nav/chapters.ts#L9)

> "Demos" — 2023–24
> — [`chapters.ts:10`](../../app/(works)/biconomy/nav/chapters.ts#L10)

> "BIPs" — 2022
> — [`chapters.ts:11`](../../app/(works)/biconomy/nav/chapters.ts#L11)

> "Multiverse" — 2023
> — [`chapters.ts:12`](../../app/(works)/biconomy/nav/chapters.ts#L12)

> "API concepts" (short "API") — 2022
> — [`chapters.ts:13`](../../app/(works)/biconomy/nav/chapters.ts#L13)

> "Staying Anchored" — 2022–24
> — [`chapters.ts:14`](../../app/(works)/biconomy/nav/chapters.ts#L14)

## MarkerInfoCard {#marker-info}

> "Product Designer at"
> — [`MarkerInfoCard.tsx:13`](../../app/(works)/biconomy/components/MarkerInfoCard.tsx#L13)

> "a blockchain payments infrastructure company"
> — [`MarkerInfoCard.tsx:14`](../../app/(works)/biconomy/components/MarkerInfoCard.tsx#L14)

---

## Intro — memo cards {#intro-memos}

> "What Is It?"
> — [`Intro.tsx:88`](../../app/(works)/biconomy/components/Intro.tsx#L88)

> "A platform to manage smart contracts and gas tank balances with custom config."
> — [`Intro.tsx:89-91`](../../app/(works)/biconomy/components/Intro.tsx#L89)

> "Who Uses It?"
> — [`Intro.tsx:96`](../../app/(works)/biconomy/components/Intro.tsx#L96)

> "All web3 blockchain devs, growth reps, early to mid stage founders"
> — [`Intro.tsx:97-99`](../../app/(works)/biconomy/components/Intro.tsx#L97)

> "Frequency of Use"
> — [`Intro.tsx:104`](../../app/(works)/biconomy/components/Intro.tsx#L104)

> "2 consecutive sessions\n1–3 times / month"
> — [`Intro.tsx:105-107`](../../app/(works)/biconomy/components/Intro.tsx#L105)

## Intro — surface copy {#intro-copy}

> "Reveal context" / "Hide context" (aria-labels)
> — [`Intro.tsx:74, 131`](../../app/(works)/biconomy/components/Intro.tsx#L74)

> "Upon joining"
> — [`Intro.tsx:146`](../../app/(works)/biconomy/components/Intro.tsx#L146)

> "my first tasks were to add new features to the dashboard and to restructure old ones."
> — [`Intro.tsx:150-163`](../../app/(works)/biconomy/components/Intro.tsx#L150)

> "Changes happened live and there was no testing or documentation process in place."
> — [`Intro.tsx:166-168`](../../app/(works)/biconomy/components/Intro.tsx#L166)

> "Over the next 18 months, cycling through 5 PMs, 3 FE devs, 2 BE devs, 1 bear cycle, 1 bull cycle, *the only constant source of truth was the Figma file.*"
> — [`Intro.tsx:175-181`](../../app/(works)/biconomy/components/Intro.tsx#L175)

> "So to make this dashboard simple to use and expandable for development, *I proposed a UX Audit.*"
> — [`Intro.tsx:182-185`](../../app/(works)/biconomy/components/Intro.tsx#L182)

## Intro — North Star {#intro-north-star}

> "North Star"
> — [`Intro.tsx:191`](../../app/(works)/biconomy/components/Intro.tsx#L191)

> "Increase usability and user confidence"
> — [`Intro.tsx:195`](../../app/(works)/biconomy/components/Intro.tsx#L195)

---

## Flows — switch labels {#flows-switch}

> "Toggle before/after audit states" (aria-label)
> — [`Flows.tsx:329`](../../app/(works)/biconomy/components/Flows.tsx#L329)

> "After Audit"
> — [`Flows.tsx:340`](../../app/(works)/biconomy/components/Flows.tsx#L340)

> "Before Audit"
> — [`Flows.tsx:340`](../../app/(works)/biconomy/components/Flows.tsx#L340)

## Flows — counter (templated) {#flows-counter}

> "Flow {currentSlide} of {TOTAL_SLIDES}"
> — [`Flows.tsx:351-352`](../../app/(works)/biconomy/components/Flows.tsx#L351)

## Flows — notes tab {#flows-notes-tab}

> "Notes"
> — [`Flows.tsx:438`](../../app/(works)/biconomy/components/Flows.tsx#L438)

> "Open notes" / "Close notes" (aria-label)
> — [`Flows.tsx:434`](../../app/(works)/biconomy/components/Flows.tsx#L434)

## Flows — flow titles {#flows-titles}

> "Paymaster Empty State"
> — [`flowSlides.ts:19`](../../app/(works)/biconomy/components/flowSlides.ts#L19)

> "Paymaster Overview"
> — [`flowSlides.ts:41`](../../app/(works)/biconomy/components/flowSlides.ts#L41)

> "Gas Tank Setup"
> — [`flowSlides.ts:65`](../../app/(works)/biconomy/components/flowSlides.ts#L65)

> "Paymaster Card"
> — [`flowSlides.ts:92`](../../app/(works)/biconomy/components/flowSlides.ts#L92)

> "Register Paymaster Dialog"
> — [`flowSlides.ts:114`](../../app/(works)/biconomy/components/flowSlides.ts#L114)

> "Network Change Prompt"
> — [`flowSlides.ts:136`](../../app/(works)/biconomy/components/flowSlides.ts#L136)

## Flows — Flow 1 notes (Paymaster Empty State) {#flow-1-notes}

Before:

> "The empty state does not clearly signal what the user should do first."
> — [`flowSlides.ts:23`](../../app/(works)/biconomy/components/flowSlides.ts#L23)

> "Explanatory content occupies the primary visual area before any setup action."
> — [`flowSlides.ts:24`](../../app/(works)/biconomy/components/flowSlides.ts#L24)

> "Main action is gated behind reading and understanding long descriptions."
> — [`flowSlides.ts:25`](../../app/(works)/biconomy/components/flowSlides.ts#L25)

> "Learning and execution are presented together, creating cognitive noise."
> — [`flowSlides.ts:26`](../../app/(works)/biconomy/components/flowSlides.ts#L26)

After:

> "A single primary action is established and placed at the visual center of the screen."
> — [`flowSlides.ts:32`](../../app/(works)/biconomy/components/flowSlides.ts#L32)

> "Explanatory content is moved below the primary action and reduced to a single supporting line."
> — [`flowSlides.ts:33`](../../app/(works)/biconomy/components/flowSlides.ts#L33)

> "Commitment is lowered by allowing users to act before fully understanding the system."
> — [`flowSlides.ts:34`](../../app/(works)/biconomy/components/flowSlides.ts#L34)

> "Learning resources are separated into secondary cards, off the main execution path."
> — [`flowSlides.ts:35`](../../app/(works)/biconomy/components/flowSlides.ts#L35)

## Flows — Flow 2 notes (Paymaster Overview) {#flow-2-notes}

Before:

> "The paymaster name appears without team or network context."
> — [`flowSlides.ts:45`](../../app/(works)/biconomy/components/flowSlides.ts#L45)

> "The page shows paymaster details, but doesn't point to a clear next step."
> — [`flowSlides.ts:46`](../../app/(works)/biconomy/components/flowSlides.ts#L46)

> "Keys and URLs are long blocks of text that are hard to scan or copy quickly."
> — [`flowSlides.ts:47`](../../app/(works)/biconomy/components/flowSlides.ts#L47)

> "Setup options are mixed into descriptive content, making them easy to miss."
> — [`flowSlides.ts:48`](../../app/(works)/biconomy/components/flowSlides.ts#L48)

> "The 'Overview' doesn't surface key information at a glance."
> — [`flowSlides.ts:49`](../../app/(works)/biconomy/components/flowSlides.ts#L49)

After:

> "The paymaster is tied to a team, name, and network."
> — [`flowSlides.ts:55`](../../app/(works)/biconomy/components/flowSlides.ts#L55)

> "The page shows clear next steps instead of explaining concepts."
> — [`flowSlides.ts:56`](../../app/(works)/biconomy/components/flowSlides.ts#L56)

> "Keys and URLs are grouped, truncated mid-line, and easy to copy."
> — [`flowSlides.ts:57`](../../app/(works)/biconomy/components/flowSlides.ts#L57)

> "Setup options are broken into simple, visible choices."
> — [`flowSlides.ts:58`](../../app/(works)/biconomy/components/flowSlides.ts#L58)

> "Rules and status are summarized so health signals are easy to spot."
> — [`flowSlides.ts:59`](../../app/(works)/biconomy/components/flowSlides.ts#L59)

## Flows — Flow 3 notes (Gas Tank Setup) {#flow-3-notes}

Before:

> "The screen does not clearly communicate whether the gas tank already exists or not."
> — [`flowSlides.ts:69`](../../app/(works)/biconomy/components/flowSlides.ts#L69)

> "Multiple messages, warnings, and links compete for attention at the moment of first setup."
> — [`flowSlides.ts:70`](../../app/(works)/biconomy/components/flowSlides.ts#L70)

> "Critical rules are surfaced before the user understands the purpose of the feature."
> — [`flowSlides.ts:71`](../../app/(works)/biconomy/components/flowSlides.ts#L71)

> "The user is asked to act without first understanding the value of that action."
> — [`flowSlides.ts:72`](../../app/(works)/biconomy/components/flowSlides.ts#L72)

After:

> "The empty state clearly signals that the gas tank is not yet set up."
> — [`flowSlides.ts:78`](../../app/(works)/biconomy/components/flowSlides.ts#L78)

> "The interface is reduced to a single primary message and a single primary action."
> — [`flowSlides.ts:79`](../../app/(works)/biconomy/components/flowSlides.ts#L79)

> "Critical withdrawal rules are shown in a separate step, when they become relevant."
> — [`flowSlides.ts:81`](../../app/(works)/biconomy/components/flowSlides.ts#L81)

> Toggle label initial: "See next step"
> — [`flowSlides.ts:84`](../../app/(works)/biconomy/components/flowSlides.ts#L84)

> Toggle label after: "Go back"
> — [`flowSlides.ts:84`](../../app/(works)/biconomy/components/flowSlides.ts#L84)

> "A short line explains what the gas tank does before asking the user to act."
> — [`flowSlides.ts:86`](../../app/(works)/biconomy/components/flowSlides.ts#L86)

## Flows — Flow 4 notes (Paymaster Card) {#flow-4-notes}

Before:

> "The card is clickable but looks like a static block."
> — [`flowSlides.ts:96`](../../app/(works)/biconomy/components/flowSlides.ts#L96)

> "The long horizontal footprint makes lists harder to scan and compare."
> — [`flowSlides.ts:97`](../../app/(works)/biconomy/components/flowSlides.ts#L97)

> "The CTA blends into nearby text and doesn't pop as the main action."
> — [`flowSlides.ts:98`](../../app/(works)/biconomy/components/flowSlides.ts#L98)

> "Secondary metadata competes with core actions for attention."
> — [`flowSlides.ts:99`](../../app/(works)/biconomy/components/flowSlides.ts#L99)

After:

> "A clear affordance shows you can open the card and go deeper."
> — [`flowSlides.ts:105`](../../app/(works)/biconomy/components/flowSlides.ts#L105)

> "A tighter layout improves scannability in stacked lists."
> — [`flowSlides.ts:106`](../../app/(works)/biconomy/components/flowSlides.ts#L106)

> "The CTA is clearly a button, without breaking the visual style."
> — [`flowSlides.ts:107`](../../app/(works)/biconomy/components/flowSlides.ts#L107)

> "The card now puts common actions up front (copy keys / deposit), and pushes metadata out of the main view (archived items live in a separate filtered view)."
> — [`flowSlides.ts:108`](../../app/(works)/biconomy/components/flowSlides.ts#L108)

## Flows — Flow 5 notes (Register Paymaster Dialog) {#flow-5-notes}

Before:

> "The layout is too spread out for just three inputs"
> — [`flowSlides.ts:118`](../../app/(works)/biconomy/components/flowSlides.ts#L118)

> "Users are asked to invent a name without any cue for what's acceptable"
> — [`flowSlides.ts:119`](../../app/(works)/biconomy/components/flowSlides.ts#L119)

> "The network list includes 30+ options, increasing scroll and decision time"
> — [`flowSlides.ts:120`](../../app/(works)/biconomy/components/flowSlides.ts#L120)

> "The version field has no context. Without reading docs, users don't know what it means"
> — [`flowSlides.ts:121`](../../app/(works)/biconomy/components/flowSlides.ts#L121)

After:

> "A vertical stack creates a single, predictable reading and action order"
> — [`flowSlides.ts:127`](../../app/(works)/biconomy/components/flowSlides.ts#L127)

> "A sample name shows the expected format, removing guesswork"
> — [`flowSlides.ts:128`](../../app/(works)/biconomy/components/flowSlides.ts#L128)

> "A default network is preselected based on prior usage or business logic"
> — [`flowSlides.ts:129`](../../app/(works)/biconomy/components/flowSlides.ts#L129)

> "A recommended tag to move the user along quicker. If they want to know, a link is provided to docs at the end of the drop down."
> — [`flowSlides.ts:130`](../../app/(works)/biconomy/components/flowSlides.ts#L130)

## Flows — Flow 6 notes (Network Change Prompt) {#flow-6-notes}

Before:

> "The error state does not clearly explain why the user is blocked."
> — [`flowSlides.ts:140`](../../app/(works)/biconomy/components/flowSlides.ts#L140)

> "The wallet address draws more attention than the actual problem."
> — [`flowSlides.ts:141`](../../app/(works)/biconomy/components/flowSlides.ts#L141)

> "There is no clear way to change the wallet from this state."
> — [`flowSlides.ts:142`](../../app/(works)/biconomy/components/flowSlides.ts#L142)

After:

> "The prompt now states upfront that a network mismatch is preventing progress."
> — [`flowSlides.ts:148`](../../app/(works)/biconomy/components/flowSlides.ts#L148)

> "The message focuses on the network mismatch before showing wallet details."
> — [`flowSlides.ts:149`](../../app/(works)/biconomy/components/flowSlides.ts#L149)

> "Both paths are made explicit: switch the network or change the wallet."
> — [`flowSlides.ts:150`](../../app/(works)/biconomy/components/flowSlides.ts#L150)

---

## Demos — header {#demos-header}

> "Between dashboard releases,"
> — [`Demos.tsx:155`](../../app/(works)/biconomy/components/Demos.tsx#L155)

> "I worked with growth and marketing to create usable prototypes"
> — [`Demos.tsx:157`](../../app/(works)/biconomy/components/Demos.tsx#L157)

> "They were small functional stories showing what our SDK could do"
> — [`Demos.tsx:161`](../../app/(works)/biconomy/components/Demos.tsx#L161)

## Demos — tab labels {#demos-tabs}

> "Figma Prototypes"
> — [`Demos.tsx:184-185`](../../app/(works)/biconomy/components/Demos.tsx#L184)

> "Web-Based Apps"
> — [`Demos.tsx:198-199`](../../app/(works)/biconomy/components/Demos.tsx#L198)

> "On-Chain Game"
> — [`Demos.tsx:212-213`](../../app/(works)/biconomy/components/Demos.tsx#L212)

> "Evolution of the Demos"
> — [`Demos.tsx:217`](../../app/(works)/biconomy/components/Demos.tsx#L217)

## Demos — tab body titles {#demos-titles}

> "Used when we needed to show how the SDK would fit into a prospect's existing dApp"
> — [`Demos.tsx:44`](../../app/(works)/biconomy/components/Demos.tsx#L44)

> "A live environment with real wallets and real transactions, with clear technical info at hand"
> — [`Demos.tsx:60`](../../app/(works)/biconomy/components/Demos.tsx#L60)

> "A fully on-chain game that uses our entire offering and one that feels fast and playful without exposing blockchain mechanics"
> — [`Demos.tsx:71`](../../app/(works)/biconomy/components/Demos.tsx#L71)

## Demos — media captions {#demos-captions}

> "A standard game flow with four separate signing steps before the user could proceed"
> — [`Demos.tsx:50`](../../app/(works)/biconomy/components/Demos.tsx#L50)

> "The same flow collapsed into a single signing step"
> — [`Demos.tsx:55`](../../app/(works)/biconomy/components/Demos.tsx#L55)

> "The entry point to the demo: choosing a signer (wallet, social login, passkey) made real and usable rather than abstractions."
> — [`Demos.tsx:65`](../../app/(works)/biconomy/components/Demos.tsx#L65)

> "Shows the arena view of the game where the cards are drawn and the player has to make the next move."
> — [`Demos.tsx:76`](../../app/(works)/biconomy/components/Demos.tsx#L76)

## Demos — quote card {#demos-quote}

> "These demos went through a natural process of abstraction themselves, from the most tangible to the most invisible."
> — [`Demos.tsx:339-340`](../../app/(works)/biconomy/components/Demos.tsx#L339)

> "Each demo made the invisible infrastructure into something people could see, use, and judge for themselves."
> — [`Demos.tsx:341-342`](../../app/(works)/biconomy/components/Demos.tsx#L341)

## Demos — Web3 Abstractor sticker {#demos-abstractor}

> "Web3 Abstractor" (img alt)
> — [`Demos.tsx:354`](../../app/(works)/biconomy/components/Demos.tsx#L354)

> "How we aspired to be known as"
> — [`Demos.tsx:362`](../../app/(works)/biconomy/components/Demos.tsx#L362)

---

## BIPs — header card {#bips-header}

> "Everyone on the team had real good ideas about our culture, process, and products so I started keeping a list."
> — [`BIPs.tsx:36-38`](../../app/(works)/biconomy/components/BIPs.tsx#L36)

> "This would go on to become"
> — [`BIPs.tsx:40`](../../app/(works)/biconomy/components/BIPs.tsx#L40)

> "Biconomy Improvement Proposals"
> — [`BIPs.tsx:41`](../../app/(works)/biconomy/components/BIPs.tsx#L41)

## BIPs — aside {#bips-aside}

> "Six months later, during an internal tech-debt cleanup, I proposed a way to build these ideas out."
> — [`BIPs.tsx:47`](../../app/(works)/biconomy/components/BIPs.tsx#L47)

> "So then, that simple checklist evolved into a small workflow on Notion."
> — [`BIPs.tsx:49`](../../app/(works)/biconomy/components/BIPs.tsx#L49)

## BIPs — card footer {#bips-footer}

> "Each Idea Moved"
> — [`BIPs.tsx:55`](../../app/(works)/biconomy/components/BIPs.tsx#L55)

> "from an insight"
> — [`BIPs.tsx:59`](../../app/(works)/biconomy/components/BIPs.tsx#L59)

> "to a proposal with legs"
> — [`BIPs.tsx:60`](../../app/(works)/biconomy/components/BIPs.tsx#L60)

> "to a mock project."
> — [`BIPs.tsx:61`](../../app/(works)/biconomy/components/BIPs.tsx#L61)

## BIPs — stats overlay {#bips-stats}

> "Seven ideas surfaced"
> — [`BIPs.tsx:72`](../../app/(works)/biconomy/components/BIPs.tsx#L72)

> "Three shipped"
> — [`BIPs.tsx:73`](../../app/(works)/biconomy/components/BIPs.tsx#L73)

## BIPs — Notion section {#bips-notion}

> "Copy of the Notion"
> — [`BIPs.tsx:79`](../../app/(works)/biconomy/components/BIPs.tsx#L79)

> "View Notion embed" (aria-label)
> — [`BIPs.tsx:90`](../../app/(works)/biconomy/components/BIPs.tsx#L90)

> "Reveal"
> — [`BIPs.tsx:92`](../../app/(works)/biconomy/components/BIPs.tsx#L92)

> "Biconomy Improvement Proposals — Notion workspace" (iframe title)
> — [`BIPs.tsx:95`](../../app/(works)/biconomy/components/BIPs.tsx#L95)

## BIPs — Notes rail tab {#bips-notes-tab}

> "Design of the Workflow"
> — [`BIPs.tsx:113`](../../app/(works)/biconomy/components/BIPs.tsx#L113)

> "Open design notes" / "Close design notes" (aria-label)
> — [`BIPs.tsx:109`](../../app/(works)/biconomy/components/BIPs.tsx#L109)

## BIPs — Notes rail body {#bips-notes-body}

> "The workflow was built around BIP #24001, a fully documented reference proposal"
> — [`BIPs.tsx:119-120`](../../app/(works)/biconomy/components/BIPs.tsx#L119)

> "1. Know Your Idea"
> — [`BIPs.tsx:124`](../../app/(works)/biconomy/components/BIPs.tsx#L124)

> "Contributors were first given a framework to clarify their idea by helping them with essential details required to strengthen it."
> — [`BIPs.tsx:125`](../../app/(works)/biconomy/components/BIPs.tsx#L125)

> "2. Present"
> — [`BIPs.tsx:130`](../../app/(works)/biconomy/components/BIPs.tsx#L130)

> "The doc structure then shifted into a presentation order, so every proposal could be read and evaluated in a consistent way."
> — [`BIPs.tsx:131`](../../app/(works)/biconomy/components/BIPs.tsx#L131)

> "3. Evaluate"
> — [`BIPs.tsx:136`](../../app/(works)/biconomy/components/BIPs.tsx#L136)

> "The final section captured stakeholder impressions, concerns, and suggested next steps."
> — [`BIPs.tsx:137`](../../app/(works)/biconomy/components/BIPs.tsx#L137)

> "Taken together, the workflow gave people a clear starting point, a shared structure, and a single place for feedback."
> — [`BIPs.tsx:143`](../../app/(works)/biconomy/components/BIPs.tsx#L143)

> "By following it, they could move an idea from insight to a real project."
> — [`BIPs.tsx:145`](../../app/(works)/biconomy/components/BIPs.tsx#L145)

## BIPs — footnote {#bips-footnote}

> "I had great support from the then PM (Nikola ♡) who introduced it to his devs. Then growth and marketing teams gave it a shot."
> — [`BIPs.tsx:153`](../../app/(works)/biconomy/components/BIPs.tsx#L153)

---

## Multiverse — header card {#mv-header}

> "After a year of remote work,"
> — [`Multiverse.tsx:50`](../../app/(works)/biconomy/components/Multiverse.tsx#L50)

> "I met the team at the annual offsite and realized each person carried a different idea of what Biconomy was."
> — [`Multiverse.tsx:52-53`](../../app/(works)/biconomy/components/Multiverse.tsx#L52)

> "That turned into an internal joke. I called this"
> — [`Multiverse.tsx:56`](../../app/(works)/biconomy/components/Multiverse.tsx#L56)

> "The Multiverse Theory"
> — [`Multiverse.tsx:58`](../../app/(works)/biconomy/components/Multiverse.tsx#L58)

## Multiverse — aside {#mv-aside}

> "To test it, I ran one-on-one calls and asked simple questions* around directions and priorities."
> — [`Multiverse.tsx:64-65`](../../app/(works)/biconomy/components/Multiverse.tsx#L64)

> "Surprisingly, the answers varied greatly."
> — [`Multiverse.tsx:67`](../../app/(works)/biconomy/components/Multiverse.tsx#L67)

## Multiverse — before-caption (fades out on scroll) {#mv-before}

> "I turned that phenomenon into a poster which made the problem real while also carrying the humor with which this had started"
> — [`Multiverse.tsx:80-81`](../../app/(works)/biconomy/components/Multiverse.tsx#L80)

## Multiverse — after-caption (fades in on scroll) {#mv-after}

> "Once I had resonance with the core team, I presented the findings to the founders."
> — [`Multiverse.tsx:111-112`](../../app/(works)/biconomy/components/Multiverse.tsx#L111)

> "They agreed with the diagnosis, unfortunately not the solutions."
> — [`Multiverse.tsx:114`](../../app/(works)/biconomy/components/Multiverse.tsx#L114)

> "Still, it aligned the rest of the team. We began looping each other in more intentionally."
> — [`Multiverse.tsx:116-117`](../../app/(works)/biconomy/components/Multiverse.tsx#L116)

## Multiverse — poster sub-caption {#mv-poster-sub}

> "Orange, the fruit, was part of our brand's secondary identity"
> — [`Multiverse.tsx:101`](../../app/(works)/biconomy/components/Multiverse.tsx#L101)

> "Multiverse" (poster alt)
> — [`Multiverse.tsx:90`](../../app/(works)/biconomy/components/Multiverse.tsx#L90)

## BiconomyChip {#bico-chip}

> "Shake the marks" (aria-label)
> — [`BiconomyChip.tsx:103`](../../app/(works)/biconomy/components/BiconomyChip.tsx#L103)

---

## API — header card {#api-header}

> "This began as an experiment"
> — [`API.tsx:272`](../../app/(works)/biconomy/components/API.tsx#L272)

> "My hypothesis was that if sci‑fi can inspire rockets, how about an interface?"
> — [`API.tsx:274-275`](../../app/(works)/biconomy/components/API.tsx#L274)

> "This is where"
> — [`API.tsx:278`](../../app/(works)/biconomy/components/API.tsx#L278)

> "Science Fiction Meets Interface Fiction"
> — [`API.tsx:280`](../../app/(works)/biconomy/components/API.tsx#L280)

## API — flow names {#api-flow-names}

> "Connecting Wallet"
> — [`API.tsx:24`](../../app/(works)/biconomy/components/API.tsx#L24)

> "Sending Assets"
> — [`API.tsx:42`](../../app/(works)/biconomy/components/API.tsx#L42)

> "Navigation & Signing"
> — [`API.tsx:60`](../../app/(works)/biconomy/components/API.tsx#L60)

## API — flow slide captions {#api-slide-captions}

Connecting Wallet:

> "A standby mark, a stepper, and a receiver — each a grammar piece before connection."
> — [`API.tsx:28`](../../app/(works)/biconomy/components/API.tsx#L28)

> "Unplugged at rest. A B-mark waits in the top-right for a hover or a click."
> — [`API.tsx:32`](../../app/(works)/biconomy/components/API.tsx#L32)

> "Once paired, the unit settles — QR, desktop, and session hand-offs stay in the same surface."
> — [`API.tsx:36`](../../app/(works)/biconomy/components/API.tsx#L36)

Sending Assets:

> "From a deployed smart wallet to a signed transaction — three steps on one continuous surface."
> — [`API.tsx:46`](../../app/(works)/biconomy/components/API.tsx#L46)

> "Send To accepts the address; Select Asset unfolds below without changing context."
> — [`API.tsx:50`](../../app/(works)/biconomy/components/API.tsx#L50)

> "Amount, gas, and total share the canvas. An operating-currency toggle sits a tap away."
> — [`API.tsx:54`](../../app/(works)/biconomy/components/API.tsx#L54)

Navigation & Signing:

> "Navigation collapses into the address itself — menu opens down, the asset library tucks below."
> — [`API.tsx:65`](../../app/(works)/biconomy/components/API.tsx#L65)

> "Signing stays legible — network, request type, forwarder details, keys, then sign or reject."
> — [`API.tsx:69`](../../app/(works)/biconomy/components/API.tsx#L69)

## API — side text {#api-side-text}

> "I read a few Asimov stories, hoping for a direction. I got ideas for the structure of the API and the way it will interface with the rest of the client dApp."
> — [`API.tsx:322-325`](../../app/(works)/biconomy/components/API.tsx#L322)

## API — tweet column {#api-tweet}

> "Post walking you through the full context"
> — [`API.tsx:332`](../../app/(works)/biconomy/components/API.tsx#L332)

> "opens in new tab"
> — [`API.tsx:342`](../../app/(works)/biconomy/components/API.tsx#L342)

## API — quote card {#api-quote}

> "Twitter was the primary channel for web3 discourse so I chose to pitch these ideas as threads rather than as a video or a deck."
> — [`API.tsx:351-352`](../../app/(works)/biconomy/components/API.tsx#L351)

## API — NavPill labels {#api-nav}

> "Previous slide" / "Next slide" / "Previous flow" / "Next flow"
> — [`API.tsx:192, 317`](../../app/(works)/biconomy/components/API.tsx#L192)

## TwitterEmbed (defaults) {#tweet-embed}

> "Biconomy Experience" (author)
> — [`TwitterEmbed.tsx:43`](../../app/(works)/biconomy/components/TwitterEmbed.tsx#L43)

> "BiconomyX" (handle)
> — [`TwitterEmbed.tsx:44`](../../app/(works)/biconomy/components/TwitterEmbed.tsx#L44)

> "An experiment in API design: if sci‑fi can inspire rockets, how about an interface? A thread on Science Fiction meeting Interface Fiction — walking through the full context of this exploration." (body, passed by API.tsx)
> — [`API.tsx:337-339`](../../app/(works)/biconomy/components/API.tsx#L337)

> "9:14 AM · Aug 5, 2022" (timestamp passed by API.tsx)
> — [`API.tsx:340`](../../app/(works)/biconomy/components/API.tsx#L340)

---

## StayingAnchored — lead {#sa-lead}

> "By year two, almost everyone I'd started with had left."
> — [`StayingAnchored.tsx:68`](../../app/(works)/biconomy/components/StayingAnchored.tsx#L68)

## StayingAnchored — prose {#sa-prose}

> "To stay centered, I kept my own documentation: decision logs, PM notes, founder goals, working styles. It became the best way to keep the threads connected."
> — [`StayingAnchored.tsx:111-113`](../../app/(works)/biconomy/components/StayingAnchored.tsx#L111)

> "Outside the company, I tracked what was happening in web3, read the EIPs that mattered and translated the useful ones into features."
> — [`StayingAnchored.tsx:116-117`](../../app/(works)/biconomy/components/StayingAnchored.tsx#L116)

> "Also, attended a few events and befriended some blockchain devs. The conversations with them informed some of the decisions on navigation and flow."
> — [`StayingAnchored.tsx:119-121`](../../app/(works)/biconomy/components/StayingAnchored.tsx#L119)

## StayingAnchored — photo alts {#sa-photos}

> "The Biconomy design team."
> — [`StayingAnchored.tsx:26`](../../app/(works)/biconomy/components/StayingAnchored.tsx#L26)

> "The broader Biconomy gang."
> — [`StayingAnchored.tsx:27`](../../app/(works)/biconomy/components/StayingAnchored.tsx#L27)

> "Flor and me."
> — [`StayingAnchored.tsx:28`](../../app/(works)/biconomy/components/StayingAnchored.tsx#L28)

> "Georgios and me."
> — [`StayingAnchored.tsx:29`](../../app/(works)/biconomy/components/StayingAnchored.tsx#L29)

> "Flor, Azaan, and me at football."
> — [`StayingAnchored.tsx:30`](../../app/(works)/biconomy/components/StayingAnchored.tsx#L30)

> "Building a bridge."
> — [`StayingAnchored.tsx:31`](../../app/(works)/biconomy/components/StayingAnchored.tsx#L31)

> "Kalyug ka Bazaar."
> — [`StayingAnchored.tsx:32`](../../app/(works)/biconomy/components/StayingAnchored.tsx#L32)

> "Scooters in Baku."
> — [`StayingAnchored.tsx:33`](../../app/(works)/biconomy/components/StayingAnchored.tsx#L33)

> "A feast in Bali."
> — [`StayingAnchored.tsx:34`](../../app/(works)/biconomy/components/StayingAnchored.tsx#L34)

> "Breakfast."
> — [`StayingAnchored.tsx:35`](../../app/(works)/biconomy/components/StayingAnchored.tsx#L35)

## StayingAnchored — controls {#sa-controls}

> "Advance photo stack" (aria-label)
> — [`StayingAnchored.tsx:76`](../../app/(works)/biconomy/components/StayingAnchored.tsx#L76)

> "Previous photo" / "Next photo"
> — [`StayingAnchored.tsx:103-104`](../../app/(works)/biconomy/components/StayingAnchored.tsx#L103)

> "Cycle through the Biconomy stickers" (aria-label)
> — [`StayingAnchored.tsx:162`](../../app/(works)/biconomy/components/StayingAnchored.tsx#L162)

## Notes

- "Flow X of Y" counter and chip number `#N` are templated.
- TwitterEmbed body / timestamp values are author-passed via props in `API.tsx`.
- "BIP #24001" is editorial copy, not a literal external ID.
- Slide pointer numbers (1, 2, 3…) on BeforeAfter overlays are positional — not user copy.
- HUD-panel copy ("Captured ✓", "Capture {state}", "saves to .claude/hud-captures.json") is dev-only, gated behind `?hud=1`; not part of the published surface.
