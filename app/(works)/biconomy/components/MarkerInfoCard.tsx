// MarkerInfoCard — biconomy-local card shown when the project marker is opened.
// Mirrors /selected's blue ProjectCard as initial content; route-owned so copy
// can diverge from the index entry.

import IconChevronRight from '../../../components/icons/IconChevronRight'

export default function MarkerInfoCard() {
  return (
    <div className="bicon-marker-info-card">
      <h3 className="bicon-marker-info-card__title">
        Designs to make the invisible infra: visible and usable
      </h3>
      <p className="bicon-marker-info-card__body">
        + a UX Audit, demos, a concept UI, and cultural interventions in a web3 ecosystem.
      </p>
      <div className="bicon-marker-info-card__divider" />
      <div className="bicon-marker-info-card__footer">
        <span className="bicon-marker-info-card__role">Product Designer • Biconomy</span>
        <IconChevronRight size={20} className="bicon-marker-info-card__arrow" />
      </div>
    </div>
  )
}
