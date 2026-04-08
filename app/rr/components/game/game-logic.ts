// ── Constants ──────────────────────────────────────────────────────────────

export const PEEK_DURATION_MS = 2500
export const REVEAL_DELAY_MS = 600
export const AUTO_ADVANCE_MS = 3000

/** Card 5 always beats any two-digit card (10-16). */
export const ANOMALY_CARD = 5
export const ANOMALY_TARGETS = [10, 11, 12, 13, 14, 15, 16]

export const PLAYER_CARDS = [5, 7, 9, 11, 13, 15]
const OPPONENT_CARDS = [6, 8, 10, 12, 14, 16]

// ── AI tunables ────────────────────────────────────────────────────────────
// Centralised so the mechanics-polish phase can tweak feel from one place.

const AI = {
  /** Base probability the AI assumes the player will pick their high card. */
  pHighBase: 0.70,
  /** Bonus when player's two cards have a wide gap. */
  pHighBigGapBonus: 0.08,
  bigGapThreshold: 6,
  /** When learned bias is reliable, blend it in at this weight. */
  learnedBlend: 0.45,
  learnedMinObservations: 3,
  /** Random nerves noise scale applied to pHigh estimate. */
  noiseScale: 0.15,
  pHighClampLo: 0.45,
  pHighClampHi: 0.85,

  /** Conservation cost: don't burn high cards early. */
  conserveBase: 0.12,
  conserveAheadMult: 1.6,
  conserveBehindMult: 0.3,

  /** Trap awareness vs the anomaly card 5. */
  trapPenalty: 2.5,
  trapLastRoundBehindMult: 0.15,
  trapBehindMult: 0.4,
  /** Chance the AI ignores trap risk and bait-attempts. */
  baitChance: 0.12,

  /** EV closeness threshold below which AI may pick the worse option. */
  closeThreshold: 1.0,
  closePickBetterProb: 0.80,
  concedePickLowerProb: 0.80,
  concedePHighMin: 0.6,

  /** Nerves drift bounds and step. */
  nervesLo: 0.1,
  nervesHi: 0.5,
  nervesStartingValue: 0.25,
  nervesStep: 0.1,
  nervesSwingThreshold: 2,
} as const

// ── Types ──────────────────────────────────────────────────────────────────

export type Phase =
  | "IDLE"
  | "PEEK"
  | "CHOOSING"
  | "REVEALING"
  | "RESOLVED"
  | "GAME_OVER"

export type RoundOutcome = "P" | "O"

export interface GameState {
  phase: Phase
  round: number
  totalRounds: number
  /** Player hand: 2 cards drawn from playerDeck (odd cards) */
  playerHand: [number, number]
  /** Opponent hand: 2 cards drawn from opponentDeck (even cards) */
  opponentHand: [number, number]
  /** Index of the chosen card within playerHand (null until pick). */
  playerChoiceIndex: 0 | 1 | null
  /** Index of the chosen card within opponentHand (null until pick). */
  opponentChoiceIndex: 0 | 1 | null
  results: RoundOutcome[]
  /** Player's draw pile (odd cards: 5,7,9,11,13,15) */
  playerDeck: number[]
  /** Player's discard pile */
  playerDiscard: number[]
  /** Opponent's draw pile (even cards: 6,8,10,12,14,16) */
  opponentDeck: number[]
  /** Opponent's discard pile */
  opponentDiscard: number[]
  /** AI persistent state */
  ai: AIState
}

export interface AIState {
  /** Running count of how often the player picks the higher of their two cards */
  playerHighCount: number
  /** Total rounds observed */
  playerTotalObserved: number
  /** Whether the player has used card 5 already */
  fiveUsed: boolean
  /** Current nerves level */
  nerves: number
}

// ── Helpers ────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

/**
 * Compare two cards using the anomaly rule.
 * Returns positive if a wins, negative if b wins, 0 if tie.
 * Anomaly: card 5 beats any two-digit card (>= 10).
 */
export function compareCards(a: number, b: number): number {
  if (a === ANOMALY_CARD && b >= 10) return 1
  if (b === ANOMALY_CARD && a >= 10) return -1
  return a - b
}

// ── Deck management ────────────────────────────────────────────────────────

function drawTwo(deck: number[], discard: number[]): {
  hand: [number, number]
  remaining: number[]
  updatedDiscard: number[]
} {
  let pile = [...deck]
  let disc = [...discard]

  // Recycle discard if needed
  if (pile.length < 2) {
    pile = shuffle([...pile, ...disc])
    disc = []
  }

  pile = shuffle(pile)
  const hand: [number, number] = [pile[0], pile[1]]
  return { hand, remaining: pile.slice(2), updatedDiscard: disc }
}

// ── Opponent AI ────────────────────────────────────────────────────────────

function aiChoose(
  opponentHand: [number, number],
  playerHand: [number, number],
  ai: AIState,
  results: RoundOutcome[],
  round: number,
  totalRounds: number,
): 0 | 1 {
  const [oA, oB] = opponentHand
  const pLow = Math.min(playerHand[0], playerHand[1])
  const pHigh = Math.max(playerHand[0], playerHand[1])

  // ── 1) Model player choice ──────────────────────────────────────────
  // Explicit `number` widens the literal type from `AI.pHighBase` (`0.70`)
  // so subsequent reassignment via `clamp(...)` typechecks.
  let pHighProb: number = AI.pHighBase
  if (pHigh - pLow >= AI.bigGapThreshold) pHighProb += AI.pHighBigGapBonus

  if (ai.playerTotalObserved >= AI.learnedMinObservations) {
    const learned = ai.playerHighCount / ai.playerTotalObserved
    pHighProb = pHighProb * (1 - AI.learnedBlend) + learned * AI.learnedBlend
  }

  const noise = (Math.random() * 2 - 1) * ai.nerves * AI.noiseScale
  pHighProb = clamp(pHighProb + noise, AI.pHighClampLo, AI.pHighClampHi)
  const pLowProb = 1 - pHighProb

  // ── 2) Expected win probability for each AI card ────────────────────
  const winVs = (aiCard: number, playerCard: number): number =>
    compareCards(aiCard, playerCard) > 0 ? 1 : 0

  const expectedWin = (aiCard: number): number =>
    pHighProb * winVs(aiCard, pHigh) + pLowProb * winVs(aiCard, pLow)

  // ── 3) Cost-to-spend penalty ────────────────────────────────────────
  const isLastRound = round >= totalRounds
  const roundsLeft = totalRounds - round
  const { playerWins, opponentWins } = getScores(results)
  const scoreDiff = opponentWins - playerWins

  let conserveW = isLastRound ? 0 : AI.conserveBase * (roundsLeft / totalRounds)
  if (scoreDiff >= AI.nervesSwingThreshold) conserveW *= AI.conserveAheadMult
  else if (scoreDiff <= -AI.nervesSwingThreshold) conserveW *= AI.conserveBehindMult

  const cardRank = (c: number): number => (c - 6) / 10
  const spendCost = (aiCard: number): number => cardRank(aiCard) * conserveW

  // ── Trap awareness (5 beats two-digit) ──────────────────────────────
  const sees5 = playerHand[0] === ANOMALY_CARD || playerHand[1] === ANOMALY_CARD
  const fiveGone = ai.fiveUsed

  const trapRisk = (aiCard: number): number => {
    if (!ANOMALY_TARGETS.includes(aiCard)) return 0
    if (fiveGone) return 0
    if (!sees5) return 0
    let penalty = AI.trapPenalty
    penalty *= (1 - Math.random() * ai.nerves)
    if (isLastRound && scoreDiff < 0) penalty *= AI.trapLastRoundBehindMult
    if (scoreDiff <= -AI.nervesSwingThreshold) penalty *= AI.trapBehindMult
    return penalty
  }

  const baiting = Math.random() < AI.baitChance

  // ── 4) Score each option ────────────────────────────────────────────
  const score = (aiCard: number): number => {
    let s = expectedWin(aiCard) * 10
    s -= spendCost(aiCard)
    if (!baiting) s -= trapRisk(aiCard)
    return s
  }

  const sA = score(oA)
  const sB = score(oB)

  // ── 4b) Concede mode ────────────────────────────────────────────────
  const concedeMode =
    winVs(oA, pHigh) === 0 &&
    winVs(oB, pHigh) === 0 &&
    pHighProb >= AI.concedePHighMin

  if (concedeMode && !isLastRound) {
    const lowerIdx: 0 | 1 = oA <= oB ? 0 : 1
    const higherIdx: 0 | 1 = lowerIdx === 0 ? 1 : 0
    return Math.random() < AI.concedePickLowerProb ? lowerIdx : higherIdx
  }

  // ── 4c) Last round: always play highest expected win ────────────────
  if (isLastRound) return sA >= sB ? 0 : 1

  // ── 5) Prefer lower winning card ────────────────────────────────────
  if (winVs(oA, pHigh) === 1 && winVs(oB, pHigh) === 1) {
    return oA <= oB ? 0 : 1
  }

  // ── 6) Controlled unpredictability ──────────────────────────────────
  const gap = Math.abs(sA - sB)
  if (gap < AI.closeThreshold) {
    const better: 0 | 1 = sA >= sB ? 0 : 1
    const worse: 0 | 1 = better === 0 ? 1 : 0
    return Math.random() < AI.closePickBetterProb ? better : worse
  }
  return sA >= sB ? 0 : 1
}

// ── State creation ─────────────────────────────────────────────────────────

function createDefaultAI(): AIState {
  return {
    playerHighCount: 0,
    playerTotalObserved: 0,
    fiveUsed: false,
    nerves: AI.nervesStartingValue,
  }
}

export function createIdleState(totalRounds = 5): GameState {
  return {
    phase: "IDLE",
    round: 0,
    totalRounds,
    playerHand: [0, 0],
    opponentHand: [0, 0],
    playerChoiceIndex: null,
    opponentChoiceIndex: null,
    results: [],
    playerDeck: [],
    playerDiscard: [],
    opponentDeck: [],
    opponentDiscard: [],
    ai: createDefaultAI(),
  }
}

export function startGame(state: GameState): GameState {
  if (state.phase !== "IDLE") return state
  return createInitialState(state.totalRounds)
}

export function createInitialState(totalRounds = 5): GameState {
  const pDraw = drawTwo(shuffle([...PLAYER_CARDS]), [])
  const oDraw = drawTwo(shuffle([...OPPONENT_CARDS]), [])

  return {
    phase: "PEEK",
    round: 1,
    totalRounds,
    playerHand: pDraw.hand,
    opponentHand: oDraw.hand,
    playerChoiceIndex: null,
    opponentChoiceIndex: null,
    results: [],
    playerDeck: pDraw.remaining,
    playerDiscard: pDraw.updatedDiscard,
    opponentDeck: oDraw.remaining,
    opponentDiscard: oDraw.updatedDiscard,
    ai: createDefaultAI(),
  }
}

// ── Phase Transitions ──────────────────────────────────────────────────────

export function endPeek(state: GameState): GameState {
  if (state.phase !== "PEEK") return state
  return { ...state, phase: "CHOOSING" }
}

export function chooseCard(state: GameState, cardIndex: 0 | 1): GameState {
  if (state.phase !== "CHOOSING") return state

  const playerCard = state.playerHand[cardIndex]
  const opponentIndex = aiChoose(
    state.opponentHand,
    state.playerHand,
    state.ai,
    state.results,
    state.round,
    state.totalRounds,
  )

  // Update AI bookkeeping based on player's pick.
  const pHigh = Math.max(state.playerHand[0], state.playerHand[1])
  const pickedHigh = playerCard === pHigh
  const newAI: AIState = {
    ...state.ai,
    playerHighCount: state.ai.playerHighCount + (pickedHigh ? 1 : 0),
    playerTotalObserved: state.ai.playerTotalObserved + 1,
    fiveUsed: state.ai.fiveUsed || playerCard === ANOMALY_CARD,
  }

  return {
    ...state,
    phase: "REVEALING",
    playerChoiceIndex: cardIndex,
    opponentChoiceIndex: opponentIndex,
    ai: newAI,
  }
}

export function resolveRound(state: GameState): GameState {
  if (state.phase !== "REVEALING") return state
  if (state.playerChoiceIndex === null || state.opponentChoiceIndex === null) return state

  const playerCard = state.playerHand[state.playerChoiceIndex]
  const opponentCard = state.opponentHand[state.opponentChoiceIndex]
  const playerUnused = state.playerHand[state.playerChoiceIndex === 0 ? 1 : 0]
  const opponentUnused = state.opponentHand[state.opponentChoiceIndex === 0 ? 1 : 0]

  const newPlayerDiscard = [...state.playerDiscard, playerCard]
  const newPlayerDeck = shuffle([...state.playerDeck, playerUnused])
  const newOpponentDiscard = [...state.opponentDiscard, opponentCard]
  const newOpponentDeck = shuffle([...state.opponentDeck, opponentUnused])

  const cmp = compareCards(playerCard, opponentCard)
  const outcome: RoundOutcome = cmp > 0 ? "P" : "O"
  const newResults = [...state.results, outcome]
  const isLastRound = state.round >= state.totalRounds

  const { playerWins, opponentWins } = getScores(newResults)
  const scoreDiff = opponentWins - playerWins
  let newNerves = state.ai.nerves
  if (scoreDiff >= AI.nervesSwingThreshold) newNerves -= AI.nervesStep
  else if (scoreDiff <= -AI.nervesSwingThreshold) newNerves += AI.nervesStep
  newNerves = clamp(newNerves, AI.nervesLo, AI.nervesHi)

  return {
    ...state,
    phase: isLastRound ? "GAME_OVER" : "RESOLVED",
    results: newResults,
    playerDeck: newPlayerDeck,
    playerDiscard: newPlayerDiscard,
    opponentDeck: newOpponentDeck,
    opponentDiscard: newOpponentDiscard,
    ai: { ...state.ai, nerves: newNerves },
  }
}

export function nextRound(state: GameState): GameState {
  if (state.phase !== "RESOLVED") return state

  const pDraw = drawTwo(state.playerDeck, state.playerDiscard)
  const oDraw = drawTwo(state.opponentDeck, state.opponentDiscard)

  return {
    ...state,
    phase: "PEEK",
    round: state.round + 1,
    playerHand: pDraw.hand,
    opponentHand: oDraw.hand,
    playerChoiceIndex: null,
    opponentChoiceIndex: null,
    playerDeck: pDraw.remaining,
    playerDiscard: pDraw.updatedDiscard,
    opponentDeck: oDraw.remaining,
    opponentDiscard: oDraw.updatedDiscard,
  }
}

// ── Selectors ──────────────────────────────────────────────────────────────
// Pure derivations of state for the view layer. Single source of truth.

export function getScores(results: RoundOutcome[]) {
  let playerWins = 0
  let opponentWins = 0
  for (const r of results) {
    if (r === "P") playerWins++
    else opponentWins++
  }
  return { playerWins, opponentWins }
}

function getPlayerCard(state: GameState): number | null {
  return state.playerChoiceIndex === null ? null : state.playerHand[state.playerChoiceIndex]
}

function getOpponentCard(state: GameState): number | null {
  return state.opponentChoiceIndex === null ? null : state.opponentHand[state.opponentChoiceIndex]
}

export function getLastOutcome(state: GameState): RoundOutcome | null {
  return state.results.length > 0 ? state.results[state.results.length - 1] : null
}

/** Whether the most recent resolved round was decided by the anomaly rule. */
export function wasAnomalyResolution(state: GameState): boolean {
  if (state.phase !== "RESOLVED" && state.phase !== "GAME_OVER") return false
  const p = getPlayerCard(state)
  const o = getOpponentCard(state)
  if (p === null || o === null) return false
  return (
    (p === ANOMALY_CARD && ANOMALY_TARGETS.includes(o)) ||
    (o === ANOMALY_CARD && ANOMALY_TARGETS.includes(p))
  )
}

export type GameOverResult = "victory" | "defeat" | "draw"

export function getGameOverResult(state: GameState): GameOverResult | null {
  if (state.phase !== "GAME_OVER") return null
  const { playerWins, opponentWins } = getScores(state.results)
  if (playerWins > opponentWins) return "victory"
  if (playerWins < opponentWins) return "defeat"
  return "draw"
}
