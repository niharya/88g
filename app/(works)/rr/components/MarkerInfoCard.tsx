// rr/MarkerInfoCard — thin consumer of the shared MarkerTicket primitive.
// Terra tone; the Rug Rumble spike rendered inline with the same two-path
// halo spec the Biconomy cube uses (filled + plus-darker stroke), with
// terra hues swapped in for olive: terra-800 fill, terra-80 stroke.

import MarkerTicket from '../../../components/MarkerTicket'

const RR_SPIKE_PATH =
  'M13.6464 1.26833e-05C14.3548-0.00191177 14.6984 0.21482 14.9981 0.88508C17.5457 6.581 ' +
  '21.8922 11.4428 26.7794 15.2513C28.6599 16.7161 28.3602 17.2699 26.6878 18.6067C22.6455 ' +
  '21.8376 18.7682 25.8285 16.2738 30.4001C15.7725 31.3177 15.0668 33.1459 14.3575 33.7261C' +
  '14.2925 33.7369 14.2256 33.7464 14.1596 33.7546C13.5832 33.8254 13.3028 33.4115 13.0975 ' +
  '32.9453C10.7872 27.6901 6.99881 23.3985 2.76043 19.6029C2.02455 18.9441 0.107425 17.9394 ' +
  '0.00387143 16.9517C-0.110679 15.8627 2.34988 14.6728 2.99961 13.9281C6.25927 11.0425 ' +
  '9.15786 7.75474 11.4672 4.06244C12.2141 2.86827 12.785 0.974336 13.6464 1.26833e-05Z'

const RrSpike = (
  <svg width="40" height="40" viewBox="0 0 29 34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d={RR_SPIKE_PATH} fill="#895804" />
    <path
      d={RR_SPIKE_PATH}
      fill="none"
      stroke="#FFEAD3"
      strokeWidth={2.6}
      strokeLinejoin="round"
      style={{ mixBlendMode: 'plus-darker' }}
    />
  </svg>
)

export default function MarkerInfoCard() {
  return (
    <MarkerTicket
      tone="terra"
      icon={RrSpike}
      lead="Product Designer for"
      title="a playable demo that helped developers understand and adopt our full-stack offering"
      width={360}
      ruleHeight={72}
      padRight={24}
    />
  )
}
