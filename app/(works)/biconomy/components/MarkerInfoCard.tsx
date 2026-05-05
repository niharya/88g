// biconomy/MarkerInfoCard — thin consumer of the shared MarkerTicket primitive.
// Picks the olive tone, plugs the Biconomy cube as the icon (file ships its
// own halo + colors), and authors the route's copy.

import MarkerTicket from '../../../components/MarkerTicket'

export default function MarkerInfoCard() {
  return (
    <MarkerTicket
      tone="olive"
      icon={<img src="/images/biconomy/marker-ticket-mark.svg" alt="" width={40} height={40} />}
      lead="Product Designer at"
      title="a blockchain payments infrastructure company"
      width={334}
      padRight={24}
    />
  )
}
