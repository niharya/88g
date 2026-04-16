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
        { text: "The empty state does not clearly signal what the user should do first.", x: 0.370, y: 0.268 },
        { text: "Explanatory content occupies the primary visual area before any setup action.", x: 0.330, y: 0.360 },
        { text: "Main action is gated behind reading and understanding long descriptions.", x: 0.370, y: 0.420 },
        { text: "Learning and execution are presented together, creating cognitive noise.", x: 0.320, y: 0.489 },
      ],
    },
    after: {
      image: "/images/biconomy/flows/paymaster_empty_state_after.png",
      notes: [
        { text: "A single primary action is established and placed at the visual center of the screen.", x: 0.380, y: 0.187 },
        { text: "Explanatory content is moved below the primary action and reduced to a single supporting line.", x: 0.289, y: 0.720 },
        { text: "Commitment is lowered by allowing users to act before fully understanding the system.", x: 0.360, y: 0.287 },
        { text: "Learning resources are separated into secondary cards, off the main execution path.", x: 0.610, y: 0.720 },
      ],
    },
  },
  {
    id: 2,
    title: "Paymaster Overview",
    before: {
      image: "/images/biconomy/flows/paymaster_overview_before.png",
      notes: [
        { text: "The paymaster name appears without team or network context.", x: 0.260, y: 0.063 },
        { text: "The page shows paymaster details, but doesn't point to a clear next step.", x: 0.160, y: 0.322 },
        { text: "Keys and URLs are long blocks of text that are hard to scan or copy quickly.", x: 0.152, y: 0.508 },
        { text: "Setup options are mixed into descriptive content, making them easy to miss.", x: 0.575, y: 0.310 },
        { text: "The 'Overview' doesn't surface key information at a glance.", x: 0.330, y: 0.774 },
      ],
    },
    after: {
      image: "/images/biconomy/flows/paymaster_overview_after.png",
      notes: [
        { text: "The paymaster is tied to a team, name, and network.", x: 0.152, y: 0.036 },
        { text: "The page shows clear next steps instead of explaining concepts.", x: 0.272, y: 0.229 },
        { text: "Keys and URLs are grouped, truncated mid-line, and easy to copy.", x: 0.480, y: 0.290 },
        { text: "Setup options are broken into simple, visible choices.", x: 0.195, y: 0.290 },
        { text: "Rules and status are summarized so health signals are easy to spot.", x: 0.120, y: 0.646 },
      ],
    },
  },
  {
    id: 3,
    title: "Gas Tank Setup",
    before: {
      image: "/images/biconomy/flows/gas_tank_setup_before.png",
      notes: [
        { text: "The screen does not clearly communicate whether the gas tank already exists or not.", x: 0.148, y: 0.260 },
        { text: "Multiple messages, warnings, and links compete for attention at the moment of first setup.", x: 0.148, y: 0.314 },
        { text: "Critical rules are surfaced before the user understands the purpose of the feature.", x: 0.148, y: 0.364 },
        { text: "The user is asked to act without first understanding the value of that action.", x: 0.148, y: 0.441 },
      ],
    },
    after: {
      image: "/images/biconomy/flows/gas_tank_setup_after.png",
      notes: [
        { text: "The empty state clearly signals that the gas tank is not yet set up.", x: 0.526, y: 0.311 },
        { text: "The interface is reduced to a single primary message and a single primary action.", x: 0.573, y: 0.392 },
        {
          text: "Critical withdrawal rules are shown in a separate step, when they become relevant.",
          x: 0.28, y: 0.3,
          image: "/images/biconomy/flows/gas_tank_setup_after_2.png",
          toggleLabel: { initial: "See next step", after: "Go back" },
        },
        { text: "A short line explains what the gas tank does before asking the user to act.", x: 0.546, y: 0.503 },
      ],
    },
  },
  {
    id: 4,
    title: "Paymaster Card",
    before: {
      image: "/images/biconomy/flows/paymaster_card_before.png",
      notes: [
        { text: "The card is clickable but looks like a static block.", x: 0.570, y: 0.120 },
        { text: "The long horizontal footprint makes lists harder to scan and compare.", x: 0.930, y: 0.220 },
        { text: "The CTA blends into nearby text and doesn't pop as the main action.", x: 0.570, y: 0.290 },
        { text: "Secondary metadata competes with core actions for attention.", x: 0.670, y: 0.190 },
      ],
    },
    after: {
      image: "/images/biconomy/flows/paymaster_card_after.png",
      notes: [
        { text: "A clear affordance shows you can open the card and go deeper.", x: 0.722, y: 0.143 },
        { text: "A tighter layout improves scannability in stacked lists.", x: 0.709, y: 0.241 },
        { text: "The CTA is clearly a button, without breaking the visual style.", x: 0.761, y: 0.242 },
        { text: "The card now puts common actions up front (copy keys / deposit), and pushes metadata out of the main view (archived items live in a separate filtered view).", x: 0.659, y: 0.207 },
      ],
    },
  },
  {
    id: 5,
    title: "Register Paymaster Dialog",
    before: {
      image: "/images/biconomy/flows/register_paymaster_dialog_before.png",
      notes: [
        { text: "The layout is too spread out for just three inputs", x: 0.308, y: 0.156 },
        { text: "Users are asked to invent a name without any cue for what's acceptable", x: 0.357, y: 0.300 },
        { text: "The network list includes 30+ options, increasing scroll and decision time", x: 0.557, y: 0.300 },
        { text: "The version field has no context. Without reading docs, users don't know what it means", x: 0.395, y: 0.402 },
      ],
    },
    after: {
      image: "/images/biconomy/flows/register_paymaster_dialog_after.png",
      notes: [
        { text: "A vertical stack creates a single, predictable reading and action order", x: 0.381, y: 0.145 },
        { text: "A sample name shows the expected format, removing guesswork", x: 0.484, y: 0.259 },
        { text: "A default network is preselected based on prior usage or business logic", x: 0.562, y: 0.355 },
        { text: "A recommended tag to move the user along quicker. If they want to know, a link is provided to docs at the end of the drop down.", x: 0.509, y: 0.496 },
      ],
    },
  },
  {
    id: 6,
    title: "Network Change Prompt",
    before: {
      image: "/images/biconomy/flows/network_change_prompt_before.png",
      notes: [
        { text: "The error state does not clearly explain why the user is blocked.", x: 0.153, y: 0.310 },
        { text: "The wallet address draws more attention than the actual problem.", x: 0.257, y: 0.371 },
        { text: "There is no clear way to change the wallet from this state.", x: 0.287, y: 0.534 },
      ],
    },
    after: {
      image: "/images/biconomy/flows/network_change_prompt_after.png",
      notes: [
        { text: "The prompt now states upfront that a network mismatch is preventing progress.", x: 0.312, y: 0.317 },
        { text: "The message focuses on the network mismatch before showing wallet details.", x: 0.381, y: 0.446 },
        { text: "Both paths are made explicit: switch the network or change the wallet.", x: 0.258, y: 0.627 },
      ],
    },
  },
]
