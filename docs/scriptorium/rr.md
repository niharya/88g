# Scriptorium — rr (Rug Rumble)

Verbatim copy reference. Edit the source files, not this doc — run `/prepush` to surface drift.

**Sources:** `app/(works)/rr/page.tsx`, `app/(works)/rr/nav/chapters.ts`, `app/(works)/rr/components/*.tsx`, `app/(works)/rr/components/game/GameBoard.tsx`

---

## sr-only heading {#sr-heading}

> "Rug Rumble — strategy card game"
> — [`page.tsx:42`](../../app/(works)/rr/page.tsx#L42)

## Chapters (nav data) {#chapters}

> "Introduction" (short "Intro") — Sep 2024
> — [`chapters.ts:8`](../../app/(works)/rr/nav/chapters.ts#L8)

> "Game Mechanics" (short "Mechanics") — Oct 2024
> — [`chapters.ts:9`](../../app/(works)/rr/nav/chapters.ts#L9)

> "Cards & UI" (short "Cards") — Nov 2024
> — [`chapters.ts:10`](../../app/(works)/rr/nav/chapters.ts#L10)

> "Outcome" — Dec 2024
> — [`chapters.ts:11`](../../app/(works)/rr/nav/chapters.ts#L11)

## MarkerInfoCard {#marker-info}

> "Product Designer for"
> — [`MarkerInfoCard.tsx:36`](../../app/(works)/rr/components/MarkerInfoCard.tsx#L36)

> "a playable demo that helped developers understand and adopt our full-stack offering"
> — [`MarkerInfoCard.tsx:37`](../../app/(works)/rr/components/MarkerInfoCard.tsx#L37)

---

## Intro — story card body {#intro-body}

> "In 2024, at Biconomy's annual offsite in Baku the Growth team proposed building a small B2C product that could demonstrate our full tech stack. The idea was approved the same day, and I joined in to shape the product. It was a game."
> — [`Intro.tsx:132-135`](../../app/(works)/rr/components/Intro.tsx#L132)

> "I gathered the constraints and"
> — [`Intro.tsx:137`](../../app/(works)/rr/components/Intro.tsx#L137)

> "Sketched An Initial Game Mechanic."
> — [`Intro.tsx:138`](../../app/(works)/rr/components/Intro.tsx#L138)

## Intro — North Star card {#intro-north-star}

> "North Star"
> — [`Intro.tsx:144`](../../app/(works)/rr/components/Intro.tsx#L144)

> "A game that people can enjoy and want to come back to"
> — [`Intro.tsx:145`](../../app/(works)/rr/components/Intro.tsx#L145)

## Intro — Constraints card {#intro-constraints}

> "Constraints"
> — [`Intro.tsx:162`](../../app/(works)/rr/components/Intro.tsx#L162)

> "A strategy or puzzle-based PvP game"
> — [`Intro.tsx:164`](../../app/(works)/rr/components/Intro.tsx#L164)

> "A complete match in < two minutes"
> — [`Intro.tsx:166`](../../app/(works)/rr/components/Intro.tsx#L166)

> "A memetic visual language"
> — [`Intro.tsx:47`](../../app/(works)/rr/components/Intro.tsx#L47)

> "No possibility of a tie"
> — [`Intro.tsx:48`](../../app/(works)/rr/components/Intro.tsx#L48)

> "Visual restraint"
> — [`Intro.tsx:49`](../../app/(works)/rr/components/Intro.tsx#L49)

> "+3" (toggle label)
> — [`Intro.tsx:210`](../../app/(works)/rr/components/Intro.tsx#L210)

> "Expand sketches" / "Collapse sketches" (aria-label)
> — [`Intro.tsx:123`](../../app/(works)/rr/components/Intro.tsx#L123)

> "Expand constraints" / "Collapse constraints" (aria-label)
> — [`Intro.tsx:155`](../../app/(works)/rr/components/Intro.tsx#L155)

## Intro — enlarged sketches dialog {#intro-enlarged}

> "Sketches, enlarged" (aria-label)
> — [`Intro.tsx:273`](../../app/(works)/rr/components/Intro.tsx#L273)

> "Close enlarged view" (aria-label)
> — [`Intro.tsx:278`](../../app/(works)/rr/components/Intro.tsx#L278)

> "Sketch {n}" (alt, templated)
> — [`Intro.tsx:295`](../../app/(works)/rr/components/Intro.tsx#L295)

---

## InterstitialText {#interstitial}

> "You don't learn how to swim by reading about it."
> — [`InterstitialText.tsx:6`](../../app/(works)/rr/components/InterstitialText.tsx#L6)

> "So here's the most rudimentary form of the game mechanic that evolved into complex meme-warfare."
> — [`InterstitialText.tsx:7`](../../app/(works)/rr/components/InterstitialText.tsx#L7)

---

## Mechanics — RulesRail {#mech-rules-rail}

> "Rules" (tab)
> — [`RulesRail.tsx:135`](../../app/(works)/rr/components/RulesRail.tsx#L135)

> "Open rules" / "Close rules" (aria-label)
> — [`RulesRail.tsx:129`](../../app/(works)/rr/components/RulesRail.tsx#L129)

> "5 rounds, 6 cards each"
> — [`RulesRail.tsx:142`](../../app/(works)/rr/components/RulesRail.tsx#L142)

> "Higher number wins the round"
> — [`RulesRail.tsx:143`](../../app/(works)/rr/components/RulesRail.tsx#L143)

> "5 beats any two-digit card"
> — [`RulesRail.tsx:144`](../../app/(works)/rr/components/RulesRail.tsx#L144)

> "Played cards are discarded"
> — [`RulesRail.tsx:145`](../../app/(works)/rr/components/RulesRail.tsx#L145)

> "Unused cards shuffle back into the deck"
> — [`RulesRail.tsx:146`](../../app/(works)/rr/components/RulesRail.tsx#L146)

## Mechanics — NoteRail {#mech-note-rail}

> "This Is Not The Main Game"
> — [`NoteRail.tsx:74`](../../app/(works)/rr/components/NoteRail.tsx#L74)

> "This is the rudimentary game mechanic that evolved into the main gameplay later"
> — [`NoteRail.tsx:75`](../../app/(works)/rr/components/NoteRail.tsx#L75)

> "Open note" / "Close note" (aria-label)
> — [`NoteRail.tsx:64`](../../app/(works)/rr/components/NoteRail.tsx#L64)

## Mechanics — StoryCard (story view) {#mech-story}

> "Back in Bangalore, evolving this mechanic, we made and played with the first physical deck. We refined values, tested balance, and tweaked powers."
> — [`StoryCard.tsx:160-161`](../../app/(works)/rr/components/StoryCard.tsx#L160)

> "Then we shipped printed decks to remote teammates across four cities so everyone could join the playtesting."
> — [`StoryCard.tsx:164-165`](../../app/(works)/rr/components/StoryCard.tsx#L164)

> "We logged every match, noting not just balance issues but whether it passed the *only test*"
> — [`StoryCard.tsx:167-170`](../../app/(works)/rr/components/StoryCard.tsx#L167)

> "View story" / "View game structure" (aria-label on toggle)
> — [`StoryCard.tsx:145`](../../app/(works)/rr/components/StoryCard.tsx#L145)

## Mechanics — StoryCard (structure view) {#mech-structure}

> "Game Structure"
> — [`StoryCard.tsx:175`](../../app/(works)/rr/components/StoryCard.tsx#L175)

> "// Mechanics (The code)"
> — [`StoryCard.tsx:178`](../../app/(works)/rr/components/StoryCard.tsx#L178)

> "3 types of cards: Attack, Defense, Special"
> — [`StoryCard.tsx:180`](../../app/(works)/rr/components/StoryCard.tsx#L180)

> "You can see 2 cards of your opponent"
> — [`StoryCard.tsx:181`](../../app/(works)/rr/components/StoryCard.tsx#L181)

> "Played card is discarded. Rest is shuffled back."
> — [`StoryCard.tsx:182`](../../app/(works)/rr/components/StoryCard.tsx#L182)

> "Goes on for 5 rounds"
> — [`StoryCard.tsx:183`](../../app/(works)/rr/components/StoryCard.tsx#L183)

> "There's a wager for more involvement"
> — [`StoryCard.tsx:184`](../../app/(works)/rr/components/StoryCard.tsx#L184)

> "// Dynamics (The actions a player takes)"
> — [`StoryCard.tsx:189`](../../app/(works)/rr/components/StoryCard.tsx#L189)

> "The player has to analyze their own cards against their opponents while keeping in mind early or late stage of the game."
> — [`StoryCard.tsx:193-194`](../../app/(works)/rr/components/StoryCard.tsx#L193)

> "Low rule overhead (read: easy to understand)"
> — [`StoryCard.tsx:196`](../../app/(works)/rr/components/StoryCard.tsx#L196)

> "Two levels of randomness: shuffle before each round; player's choice of card in each round"
> — [`StoryCard.tsx:198-199`](../../app/(works)/rr/components/StoryCard.tsx#L198)

> "Time limit per round to keep the game under 5 min"
> — [`StoryCard.tsx:201`](../../app/(works)/rr/components/StoryCard.tsx#L201)

> "// Aesthetics (What the player feels)"
> — [`StoryCard.tsx:205`](../../app/(works)/rr/components/StoryCard.tsx#L205)

> "Visual treatment → web3 memetic universe"
> — [`StoryCard.tsx:207`](../../app/(works)/rr/components/StoryCard.tsx#L207)

> "Overarching feeling: Bullishness / Winning / Pride"
> — [`StoryCard.tsx:208`](../../app/(works)/rr/components/StoryCard.tsx#L208)

## Mechanics — StoryCard north star {#mech-north-star}

> "North Star"
> — [`StoryCard.tsx:354`](../../app/(works)/rr/components/StoryCard.tsx#L354)

> "A game that people can enjoy and want to come back to"
> — [`StoryCard.tsx:355-357`](../../app/(works)/rr/components/StoryCard.tsx#L355)

---

## GameBoard — idle state {#game-idle}

> "Number"
> — [`GameBoard.tsx:174`](../../app/(works)/rr/components/game/GameBoard.tsx#L174)

> "Duel"
> — [`GameBoard.tsx:175`](../../app/(works)/rr/components/game/GameBoard.tsx#L175)

> "Start game"
> — [`GameBoard.tsx:187`](../../app/(works)/rr/components/game/GameBoard.tsx#L187)

## GameBoard — phase labels {#game-phases}

> "Game Over"
> — [`GameBoard.tsx:125`](../../app/(works)/rr/components/game/GameBoard.tsx#L125)

> "Memorize!"
> — [`GameBoard.tsx:127`](../../app/(works)/rr/components/game/GameBoard.tsx#L127)

> "Revealing..."
> — [`GameBoard.tsx:129`](../../app/(works)/rr/components/game/GameBoard.tsx#L129)

> "Round {round} of {totalRounds}" (templated)
> — [`GameBoard.tsx:132`](../../app/(works)/rr/components/game/GameBoard.tsx#L132)

## GameBoard — status banner {#game-status}

> "Pick a card"
> — [`GameBoard.tsx:260`](../../app/(works)/rr/components/game/GameBoard.tsx#L260)

## GameBoard — round outcomes {#game-outcomes}

> "5 traps! You win!"
> — [`GameBoard.tsx:120`](../../app/(works)/rr/components/game/GameBoard.tsx#L120)

> "You win the round!"
> — [`GameBoard.tsx:120`](../../app/(works)/rr/components/game/GameBoard.tsx#L120)

> "5 traps! Opponent wins!"
> — [`GameBoard.tsx:121`](../../app/(works)/rr/components/game/GameBoard.tsx#L121)

> "Opponent wins!"
> — [`GameBoard.tsx:121`](../../app/(works)/rr/components/game/GameBoard.tsx#L121)

## GameBoard — verdict & replay {#game-verdict}

> "VICTORY"
> — [`GameBoard.tsx:194`](../../app/(works)/rr/components/game/GameBoard.tsx#L194)

> "DEFEAT"
> — [`GameBoard.tsx:194`](../../app/(works)/rr/components/game/GameBoard.tsx#L194)

> "Play again"
> — [`GameBoard.tsx:204`](../../app/(works)/rr/components/game/GameBoard.tsx#L204)

---

## Cards — section title (per tab) {#cards-title}

> "Evolution of the Card Layouts"
> — [`Cards.tsx:34`](../../app/(works)/rr/components/Cards.tsx#L34)

> "The Arena"
> — [`Cards.tsx:35`](../../app/(works)/rr/components/Cards.tsx#L35)

> "Over a Period of 3 Months" (subtitle, cards tab only)
> — [`Cards.tsx:101`](../../app/(works)/rr/components/Cards.tsx#L101)

## Cards — tab buttons {#cards-tabs}

> "Cards"
> — [`Cards.tsx:113`](../../app/(works)/rr/components/Cards.tsx#L113)

> "Interface"
> — [`Cards.tsx:130`](../../app/(works)/rr/components/Cards.tsx#L130)

> "Toggle tab" (aria-label)
> — [`Cards.tsx:119`](../../app/(works)/rr/components/Cards.tsx#L119)

## CardFan — card captions {#cardfan-captions}

> "v1" / "The very first hand-drawn concept"
> — [`CardFan.tsx:33`](../../app/(works)/rr/components/cards/CardFan.tsx#L33)

> "v2" / "Added energy and name"
> — [`CardFan.tsx:34`](../../app/(works)/rr/components/cards/CardFan.tsx#L34)

> "v3" / "Added conditional effects"
> — [`CardFan.tsx:35`](../../app/(works)/rr/components/cards/CardFan.tsx#L35)

> "v4" / "First printed version"
> — [`CardFan.tsx:36`](../../app/(works)/rr/components/cards/CardFan.tsx#L36)

> "v5" / "Final digital design"
> — [`CardFan.tsx:37`](../../app/(works)/rr/components/cards/CardFan.tsx#L37)

> "Card {v}" (alt, templated)
> — [`CardFan.tsx:119`](../../app/(works)/rr/components/cards/CardFan.tsx#L119)

## InterfacePanel — notes {#interface-notes}

> "All illustrations: the characters, the arena, and the cards are created by Florencia de Pamphilis, adding to the mematic visual language."
> — [`InterfacePanel.tsx:29`](../../app/(works)/rr/components/cards/InterfacePanel.tsx#L29)

> "I've designed the arena to hold focus on a single decision for the player: which card to play this round."
> — [`InterfacePanel.tsx:30`](../../app/(works)/rr/components/cards/InterfacePanel.tsx#L30)

> "The health bar is segmented, so players can read their status at a glance."
> — [`InterfacePanel.tsx:31`](../../app/(works)/rr/components/cards/InterfacePanel.tsx#L31)

> "A compact bottom bar shows time, round number, and settings. Easy to access but not distracting."
> — [`InterfacePanel.tsx:32`](../../app/(works)/rr/components/cards/InterfacePanel.tsx#L32)

> "Everything else is deliberately kept out of the way."
> — [`InterfacePanel.tsx:33`](../../app/(works)/rr/components/cards/InterfacePanel.tsx#L33)

> "Details"
> — [`InterfacePanel.tsx:77`](../../app/(works)/rr/components/cards/InterfacePanel.tsx#L77)

> "Show details" / "Hide details" (aria-label)
> — [`InterfacePanel.tsx:59`](../../app/(works)/rr/components/cards/InterfacePanel.tsx#L59)

> "The Arena interface" (img alt)
> — [`InterfacePanel.tsx:47`](../../app/(works)/rr/components/cards/InterfacePanel.tsx#L47)

---

## Outcome — outcome card {#outcome-card}

> "The final game launched with instant traction. Low rule overhead, quick matches, and meme energy made it an easy pick-up."
> — [`Outcome.tsx:374`](../../app/(works)/rr/components/Outcome.tsx#L374)

> "The adoption was so strong that the two people leading the project left the company to form a startup with Rug Rumble."
> — [`Outcome.tsx:391`](../../app/(works)/rr/components/Outcome.tsx#L391)

## Outcome — stats {#outcome-stats}

> "Months"
> — [`Outcome.tsx:379`](../../app/(works)/rr/components/Outcome.tsx#L379)

> "Testnet Users"
> — [`Outcome.tsx:383`](../../app/(works)/rr/components/Outcome.tsx#L383)

> "Games Played"
> — [`Outcome.tsx:387`](../../app/(works)/rr/components/Outcome.tsx#L387)

Numbers (animated): 3, 14K, 50K — [`Outcome.tsx:378-386`](../../app/(works)/rr/components/Outcome.tsx#L378)

## Outcome — Rules label {#outcome-rules-label}

> "Rules of the game"
> — [`Outcome.tsx:409`](../../app/(works)/rr/components/Outcome.tsx#L409)

> "(Appears at the start of the first few matches and is always available as a toggle within the game)"
> — [`Outcome.tsx:410`](../../app/(works)/rr/components/Outcome.tsx#L410)

> "View rules full screen" (aria-label)
> — [`Outcome.tsx:422`](../../app/(works)/rr/components/Outcome.tsx#L422)

> "Close rules" (aria-label, ×)
> — [`Outcome.tsx:647`](../../app/(works)/rr/components/Outcome.tsx#L647)

## Outcome — Rules panel: 1. Basics {#rules-basics}

> "1. Basics"
> — [`Outcome.tsx:430`](../../app/(works)/rr/components/Outcome.tsx#L430)

> "**Rug Rumble** is a fast-paced card game for 2 players, played with 7 cards per deck over 5 rounds."
> — [`Outcome.tsx:434`](../../app/(works)/rr/components/Outcome.tsx#L434)

> "Players" / "Cards" / "Rounds" stat labels (2 / 7 / 5)
> — [`Outcome.tsx:437-441`](../../app/(works)/rr/components/Outcome.tsx#L437)

> "Each card costs 1 to 4 Energy. You get 12 per match. *Use it wisely.*"
> — [`Outcome.tsx:450`](../../app/(works)/rr/components/Outcome.tsx#L450)

> "This is your health"
> — [`Outcome.tsx:458`](../../app/(works)/rr/components/Outcome.tsx#L458)

> "Max: 100"
> — [`Outcome.tsx:458`](../../app/(works)/rr/components/Outcome.tsx#L458)

> "This is your shield"
> — [`Outcome.tsx:465`](../../app/(works)/rr/components/Outcome.tsx#L465)

## Outcome — Rules panel: 2. Gameplay {#rules-gameplay}

> "2. Gameplay"
> — [`Outcome.tsx:474`](../../app/(works)/rr/components/Outcome.tsx#L474)

Step 1:

> "Reveal Cards"
> — [`Outcome.tsx:482`](../../app/(works)/rr/components/Outcome.tsx#L482)

> "At the start of each round, 2 random cards from each player's deck are revealed to both players."
> — [`Outcome.tsx:484`](../../app/(works)/rr/components/Outcome.tsx#L484)

Step 2:

> "Choose a Card"
> — [`Outcome.tsx:505`](../../app/(works)/rr/components/Outcome.tsx#L505)

> "Each player picks one card to play. The unchosen card goes back to the draw pile and is shuffled."
> — [`Outcome.tsx:507`](../../app/(works)/rr/components/Outcome.tsx#L507)

Step 3:

> "Lock in Choices"
> — [`Outcome.tsx:528`](../../app/(works)/rr/components/Outcome.tsx#L528)

> "Both cards are revealed, and their effects are resolved simultaneously."
> — [`Outcome.tsx:530`](../../app/(works)/rr/components/Outcome.tsx#L530)

Diagram labels (repeated each step):

> "↑ Not Your Cards"
> — [`Outcome.tsx:492, 515, 537`](../../app/(works)/rr/components/Outcome.tsx#L492)

> "↓ Your Cards"
> — [`Outcome.tsx:493, 516, 538`](../../app/(works)/rr/components/Outcome.tsx#L493)

## Outcome — Rules panel: How to Rumble {#rules-howto}

> "How to Rumble"
> — [`Outcome.tsx:550`](../../app/(works)/rr/components/Outcome.tsx#L550)

## Outcome — Rules panel: 3. Card Types {#rules-types}

> "3. Card Types"
> — [`Outcome.tsx:556`](../../app/(works)/rr/components/Outcome.tsx#L556)

> "Reflects 50% Damage" (badge)
> — [`Outcome.tsx:561`](../../app/(works)/rr/components/Outcome.tsx#L561)

> "34 Defense" (badge)
> — [`Outcome.tsx:562`](../../app/(works)/rr/components/Outcome.tsx#L562)

> "56 Heal" (badge)
> — [`Outcome.tsx:563`](../../app/(works)/rr/components/Outcome.tsx#L563)

> "12 Attack" (badge)
> — [`Outcome.tsx:564`](../../app/(works)/rr/components/Outcome.tsx#L564)

> "Apply special effects (e.g., disable shields, flip opponent's card)"
> — [`Outcome.tsx:567`](../../app/(works)/rr/components/Outcome.tsx#L567)

> "Block attacks by adding a shield"
> — [`Outcome.tsx:568`](../../app/(works)/rr/components/Outcome.tsx#L568)

> "Restore your own health"
> — [`Outcome.tsx:569`](../../app/(works)/rr/components/Outcome.tsx#L569)

> "Deal damage to your opponent's health"
> — [`Outcome.tsx:570`](../../app/(works)/rr/components/Outcome.tsx#L570)

## Outcome — Rules panel: 4. Resolving the Round {#rules-resolving}

> "4. Resolving the Round"
> — [`Outcome.tsx:579`](../../app/(works)/rr/components/Outcome.tsx#L579)

> "Card effects are resolved in the following order"
> — [`Outcome.tsx:581`](../../app/(works)/rr/components/Outcome.tsx#L581)

> "Power" / "Defense" / "Heal" / "Attack" (resolution order)
> — [`Outcome.tsx:589-592`](../../app/(works)/rr/components/Outcome.tsx#L589)

> "Defense shields are applied before any damage is calculated"
> — [`Outcome.tsx:594`](../../app/(works)/rr/components/Outcome.tsx#L594)

## Outcome — Rules panel: 5. Winning the Match {#rules-winning}

> "5. Winning the Match"
> — [`Outcome.tsx:601`](../../app/(works)/rr/components/Outcome.tsx#L601)

> "Both players start with 100 health. The match ends when..."
> — [`Outcome.tsx:604`](../../app/(works)/rr/components/Outcome.tsx#L604)

> "At any time"
> — [`Outcome.tsx:607`](../../app/(works)/rr/components/Outcome.tsx#L607)

> "A player's health drops to zero"
> — [`Outcome.tsx:613`](../../app/(works)/rr/components/Outcome.tsx#L613)

> "After the final round"
> — [`Outcome.tsx:616`](../../app/(works)/rr/components/Outcome.tsx#L616)

> "The player with the higher health wins"
> — [`Outcome.tsx:628`](../../app/(works)/rr/components/Outcome.tsx#L628)

> "Tiebreakers: Defense and remaining energy act as tiebreakers if health is tied."
> — [`Outcome.tsx:632`](../../app/(works)/rr/components/Outcome.tsx#L632)

## Outcome — bottom ticker {#outcome-ticker}

> "What started as a laugh in Baku became a live product with thousands of players, a proof that a simple, well-balanced mechanic can travel far"
> — [`Outcome.tsx:140`](../../app/(works)/rr/components/Outcome.tsx#L140)

## Notes

- GameBoard's `roundLabel` is templated based on outcome + anomaly flag. "5 traps" copy variants are kept verbatim.
- The shared `<Scorecard>` and `<ScrambleText>` components carry no user-visible copy of their own beyond what GameBoard passes (the verdict text).
- Many numbers in Outcome rules cards are rendered via `<AnimatedNumber>` and are positional, not editorial — the captured numbers (2/7/5/12/100/34/56/27/35/0) are deliberate part of the rules display.
- Dev-only shortcut hint (`Shift+V` / `Shift+D`) lives in `GameBoard.tsx:50-51` but does not render any visible string.
