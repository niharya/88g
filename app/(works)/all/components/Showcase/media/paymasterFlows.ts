// Three flows from the /biconomy UX audit, condensed for the showcase
// tile. Source of truth (full set) lives in
// app/(works)/biconomy/components/flowSlides.ts — these are the same x/y
// coordinates so the pointer dots land in the same spots on each image.
//
// We pick 3 paymaster flows here (empty state, overview, gas tank setup)
// because the tile's narrative is "what the audit found in the paymaster
// surface" — these three cover the strongest examples.

export type AuditNote = { text: string; x: number; y: number }

export type AuditFlow = {
  id: string
  title: string
  before: { image: string; notes: AuditNote[] }
  after: { image: string; notes: AuditNote[] }
}

export const PAYMASTER_FLOWS: AuditFlow[] = [
  {
    id: 'empty-state',
    title: 'Paymaster Empty State',
    before: {
      image: '/images/biconomy/flows/paymaster_empty_state_before.webp',
      notes: [
        { text: 'Empty state doesn’t signal what to do first.', x: 0.37, y: 0.268 },
        { text: 'Explanatory copy occupies the primary visual area.', x: 0.33, y: 0.360 },
        { text: 'Main action gated behind reading long descriptions.', x: 0.37, y: 0.420 },
        { text: 'Learning and execution mixed — cognitive noise.', x: 0.32, y: 0.489 },
      ],
    },
    after: {
      image: '/images/biconomy/flows/paymaster_empty_state_after.webp',
      notes: [
        { text: 'One primary action, placed at the visual center.', x: 0.38, y: 0.187 },
        { text: 'Explanatory copy moved below; reduced to one line.', x: 0.289, y: 0.720 },
        { text: 'Lower commitment — act before fully understanding.', x: 0.36, y: 0.287 },
        { text: 'Learning resources peeled into secondary cards.', x: 0.61, y: 0.720 },
      ],
    },
  },
  {
    id: 'overview',
    title: 'Paymaster Overview',
    before: {
      image: '/images/biconomy/flows/paymaster_overview_before.webp',
      notes: [
        { text: 'Paymaster name appears without team or network context.', x: 0.26, y: 0.063 },
        { text: 'Page details exist but no clear next step.', x: 0.16, y: 0.322 },
        { text: 'Keys and URLs are long blocks — hard to scan or copy.', x: 0.152, y: 0.508 },
        { text: 'Setup options mixed into descriptive content.', x: 0.575, y: 0.310 },
        { text: '"Overview" doesn’t surface key info at a glance.', x: 0.33, y: 0.774 },
      ],
    },
    after: {
      image: '/images/biconomy/flows/paymaster_overview_after.webp',
      notes: [
        { text: 'Paymaster tied to team, name, and network.', x: 0.152, y: 0.036 },
        { text: 'Clear next steps instead of explaining concepts.', x: 0.272, y: 0.229 },
        { text: 'Keys + URLs grouped, truncated mid-line, easy to copy.', x: 0.48, y: 0.29 },
        { text: 'Setup options broken into simple visible choices.', x: 0.195, y: 0.29 },
        { text: 'Rules and status summarized for at-a-glance health.', x: 0.12, y: 0.646 },
      ],
    },
  },
  {
    id: 'gas-tank',
    title: 'Gas Tank Setup',
    before: {
      image: '/images/biconomy/flows/gas_tank_setup_before.webp',
      notes: [
        { text: 'Unclear whether the gas tank already exists.', x: 0.148, y: 0.260 },
        { text: 'Messages, warnings, links compete during first setup.', x: 0.148, y: 0.314 },
        { text: 'Critical rules surface before the user gets the feature.', x: 0.148, y: 0.364 },
        { text: 'User asked to act before grasping the value.', x: 0.148, y: 0.441 },
      ],
    },
    after: {
      image: '/images/biconomy/flows/gas_tank_setup_after.webp',
      notes: [
        { text: 'Empty state signals clearly: not yet set up.', x: 0.526, y: 0.311 },
        { text: 'Reduced to a single primary message + action.', x: 0.573, y: 0.392 },
        { text: 'A short line explains the gas tank before asking to act.', x: 0.546, y: 0.503 },
      ],
    },
  },
]
