// Index-card copy — the editable strings for each showcase piece:
//   type     → the caption category label     (.sc-cap__type)
//   title    → the index-card heading          (.sc-note__title)
//   whatIs   → the "what is it" subtitle line   (.sc-note__whatis)
//   notice   → the "notice how…" line           (.sc-note__notice-txt)
//
// Split out of data.ts so the reader-facing copy lives in ONE place, separate
// from the structural piece data (kind, aspect, cols, href…). data.ts overlays
// these onto PIECES by id, so THIS file is the single source of truth for those
// four strings — edit here, or via the copy-editor lab.
//
// Rewritten wholesale by the dev copy-editor: the Save button POSTs to
// /api/dev-tools/index-card-copy, which regenerates this file from the edited
// values (JSON-encoded, so any punctuation is escaped safely). Keep it a plain
// object literal keyed by piece id — the editor's serializer assumes that shape.

export type CardCopy = {
  type:   string
  title:  string
  whatIs: string
  notice: string
}

export const CARD_COPY: Record<string, CardCopy> = {
  "cardstack": {
    type:   "Game Card UX",
    title:  "Evolution of a playing card",
    whatIs: "A set showing how a PvP game card layout evolved",
    notice: "The visual chunking is kept such that the card can be skimmed easily",
  },
  "paymaster": {
    type:   "Developer Dashboard",
    title:  "Payments infra dashboard",
    whatIs: "A DevX comparison before and after applying a UX Audit",
    notice: "The content in both the versions is same. Try it out using the switch.",
  },
  "subway": {
    type:   "Wayfinding Navigation",
    title:  "Site nav for the portfolio",
    whatIs: "A navigation marker that works as a menu toggle + page title",
    notice: "Inspired from the MagSafe snap, this one snaps to its neighbour",
  },
  "furrmark": {
    type:   "Brand Identity",
    title:  "Furrmark",
    whatIs: "A brandmark for a pet care company",
    notice: "Distillation of the face your pet makes when you put your hand on their head into a mark",
  },
  "startooth": {
    type:   "Tessellation Pattern",
    title:  "Startooth",
    whatIs: "My take on the classic Houndstooth",
    notice: "The trapezoids are sliced by diamonds and stars to form edible barfis",
  },
  "interface": {
    type:   "Game Interface",
    title:  "Vitals gauge for a PvP game",
    whatIs: "Snapshot of card being played and its effects on the player",
    notice: "The health bar separators make it easy to visually get an idea of the health without reading the numbers ",
  },
  "multiverse": {
    type:   "Design Intervention",
    title:  "Multiverse theory",
    whatIs: "A poster talking about the silos within the workplace",
    notice: "The copy and metaphor are done to just hint at the issue instead of shouting about it",
  },
  "ecochain": {
    type:   "B2B SaaS",
    title:  "Ecochain",
    whatIs: "Interface for a textile trading platform",
    notice: "Traders can easily segregate the buying and selling functions by the way information is organized",
  },
  "dual": {
    type:   "Job Platform UI",
    title:  "Job chip",
    whatIs: "Status indicators for tracking job stages",
    notice: "Each stage is made to be understood at a glance via the  position and length of the progress bar",
  },
  "posters": {
    type:   "Posters",
    title:  "Standup comedy posters",
    whatIs: "Posters for social-media marketing of open mics",
    notice: "Studies in the Swiss Grid that is running through them",
  },
}
