export interface FlowNote {
  text: string
  x: number
  y: number
  image?: string
  toggleLabel?: { initial: string; after: string }
}

export interface FlowSlide {
  id: number
  title: string
  before: { image: string; notes: FlowNote[] }
  after: { image: string; notes: FlowNote[] }
}

export const flows: FlowSlide[] = [
  {
    id: 1,
    title: "Paymaster Empty State",
    before: {
      image: "/images/biconomy/flows/paymaster_empty_state_before.png",
      notes: [
        { text: "The empty state does not clearly signal what the user should do first.", x: 0.14, y: 0.12 },
        { text: "Explanatory content occupies the primary visual area before any setup action.", x: 0.14, y: 0.35 },
        { text: "Main action is gated behind reading and understanding long descriptions.", x: 0.14, y: 0.4 },
        { text: "Learning and execution are presented together, creating cognitive noise.", x: 0.14, y: 0.45 },
      ],
    },
    after: {
      image: "/images/biconomy/flows/paymaster_empty_state_after.png",
      notes: [
        { text: "A single primary action is established and placed at the visual center of the screen.", x: 0.186, y: 0.191 },
        { text: "Explanatory content is moved below the primary action and reduced to a single supporting line.", x: 0.186, y: 0.24 },
        { text: "Commitment is lowered by allowing users to act before fully understanding the system.", x: 0.186, y: 0.735 },
        { text: "Learning resources are separated into secondary cards, off the main execution path.", x: 0.186, y: 0.8 },
      ],
    },
  },
  {
    id: 2,
    title: "Paymaster Overview",
    before: {
      image: "/images/biconomy/flows/paymaster_overview_before.png",
      notes: [
        { text: "The paymaster name appears without team or network context.", x: 0.148, y: 0.019 },
        { text: "The page shows paymaster details, but doesn't point to a clear next step.", x: 0.148, y: 0.102 },
        { text: "Keys and URLs are long blocks of text that are hard to scan or copy quickly.", x: 0.148, y: 0.483 },
        { text: "Setup options are mixed into descriptive content, making them easy to miss.", x: 0.579, y: 0.243 },
        { text: "The 'Overview' doesn't surface key information at a glance.", x: 0.148, y: 0.679 },
      ],
    },
    after: {
      image: "/images/biconomy/flows/paymaster_overview_after.png",
      notes: [
        { text: "The paymaster is tied to a team, name, and network.", x: 0.005, y: 0.016 },
        { text: "The page shows clear next steps instead of explaining concepts.", x: 0.005, y: 0.142 },
        { text: "Keys and URLs are grouped, truncated mid-line, and easy to copy.", x: 0.346, y: 0.252 },
        { text: "Setup options are broken into simple, visible choices.", x: 0.005, y: 0.422 },
        { text: "Rules and status are summarized so health signals are easy to spot.", x: 0.005, y: 0.627 },
      ],
    },
  },
  {
    id: 3,
    title: "Gas Tank Setup",
    before: {
      image: "/images/biconomy/flows/gas_tank_setup_before.png",
      notes: [
        { text: "The screen does not clearly communicate whether the gas tank already exists or not.", x: 0.142, y: 0.244 },
        { text: "Multiple messages, warnings, and links compete for attention at the moment of first setup.", x: 0.142, y: 0.290 },
        { text: "Critical rules are surfaced before the user understands the purpose of the feature.", x: 0.142, y: 0.343 },
        { text: "The user is asked to act without first understanding the value of that action.", x: 0.14, y: 0.6 },
      ],
    },
    after: {
      image: "/images/biconomy/flows/gas_tank_setup_after.png",
      notes: [
        { text: "The empty state clearly signals that the gas tank is not yet set up.", x: 0.353, y: 0.314 },
        { text: "The interface is reduced to a single primary message and a single primary action.", x: 0.353, y: 0.403 },
        {
          text: "Critical withdrawal rules are shown in a separate step, when they become relevant.",
          x: 0.28, y: 0.3,
          image: "/images/biconomy/flows/gas_tank_setup_after_2.png",
          toggleLabel: { initial: "See next step", after: "Go back" },
        },
        { text: "A short line explains what the gas tank does before asking the user to act.", x: 0.354, y: 0.45 },
      ],
    },
  },
  {
    id: 4,
    title: "Paymaster Card",
    before: {
      image: "/images/biconomy/flows/paymaster_card_before.png",
      notes: [
        { text: "The card is clickable but looks like a static block.", x: 0.565, y: 0.095 },
        { text: "The long horizontal footprint makes lists harder to scan and compare.", x: 0.924, y: 0.166 },
        { text: "The CTA blends into nearby text and doesn't pop as the main action.", x: 0.565, y: 0.270 },
        { text: "Secondary metadata competes with core actions for attention.", x: 0.565, y: 0.171 },
      ],
    },
    after: {
      image: "/images/biconomy/flows/paymaster_card_after.png",
      notes: [
        { text: "A clear affordance shows you can open the card and go deeper.", x: 0.565, y: 0.096 },
        { text: "A tighter layout improves scannability in stacked lists.", x: 0.825, y: 0.108 },
        { text: "The CTA is clearly a button, without breaking the visual style.", x: 0.840, y: 0.260 },
        { text: "The card now puts common actions up front (copy keys / deposit), and pushes metadata out of the main view (archived items live in a separate filtered view).", x: 0.565, y: 0.170 },
      ],
    },
  },
  {
    id: 5,
    title: "Register Paymaster Dialog",
    before: {
      image: "/images/biconomy/flows/register_paymaster_dialog_before.png",
      notes: [
        { text: "The layout is too spread out for just three inputs", x: 0.3, y: 0.136 },
        { text: "Users are asked to invent a name without any cue for what's acceptable", x: 0.3, y: 0.282 },
        { text: "The network list includes 30+ options, increasing scroll and decision time", x: 0.681, y: 0.266 },
        { text: "The version field has no context. Without reading docs, users don't know what it means", x: 0.3, y: 0.352 },
      ],
    },
    after: {
      image: "/images/biconomy/flows/register_paymaster_dialog_after.png",
      notes: [
        { text: "A vertical stack creates a single, predictable reading and action order", x: 0.37, y: 0.128 },
        { text: "A sample name shows the expected format, removing guesswork", x: 0.37, y: 0.267 },
        { text: "A default network is preselected based on prior usage or business logic", x: 0.37, y: 0.359 },
        { text: "A recommended tag to move the user along quicker. If they want to know, a link is provided to docs at the end of the drop down.", x: 0.37, y: 0.498 },
      ],
    },
  },
  {
    id: 6,
    title: "Network Change Prompt",
    before: {
      image: "/images/biconomy/flows/network_change_prompt_before.png",
      notes: [
        { text: "The error state does not clearly explain why the user is blocked.", x: 0.146, y: 0.285 },
        { text: "The wallet address draws more attention than the actual problem.", x: 0.146, y: 0.398 },
        { text: "There is no clear way to change the wallet from this state.", x: 0.146, y: 0.495 },
      ],
    },
    after: {
      image: "/images/biconomy/flows/network_change_prompt_after.png",
      notes: [
        { text: "The prompt now states upfront that a network mismatch is preventing progress.", x: 0.143, y: 0.317 },
        { text: "The message focuses on the network mismatch before showing wallet details.", x: 0.143, y: 0.408 },
        { text: "Both paths are made explicit: switch the network or change the wallet.", x: 0.143, y: 0.487 },
      ],
    },
  },
]
