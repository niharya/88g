// Sticker lab — archived preview for the LabelSticker primitive.
// Stashed under _dev-tools so it's NOT routable (the underscore prefix
// excludes the folder from the Next.js route tree). Kept as reference
// for shape/tone variants when we revisit the family. To view live
// again, rename the folder back to `app/sticker-lab/` and visit
// /sticker-lab on the dev server.

import { LabelSticker } from '../../components/LabelSticker'
import './sticker-lab.css'

export const metadata = { title: 'Sticker lab' }

export default function StickerLabPage() {
  return (
    <main className="sticker-lab">
      <header className="sticker-lab__header">
        <h1>LabelSticker</h1>
        <p>Two shapes × three tones, on the dark library ground.</p>
      </header>

      <section className="sticker-lab__section">
        <h2>Starting copy — engineers, users, protocols</h2>
        <div className="sticker-lab__row">
          <LabelSticker shape="plaque" tone="cream" tilt={-3}>Engineers</LabelSticker>
          <LabelSticker shape="ticket" tone="orange" tilt={2}>Users</LabelSticker>
          <LabelSticker shape="pill" tone="green" tilt={-1}>Protocols</LabelSticker>
        </div>
      </section>

      <section className="sticker-lab__section">
        <h2>Pill — all tones (max radius, true capsule)</h2>
        <div className="sticker-lab__row">
          <LabelSticker shape="pill" tone="cream" tilt={-2}>Cream</LabelSticker>
          <LabelSticker shape="pill" tone="orange" tilt={1}>Orange</LabelSticker>
          <LabelSticker shape="pill" tone="green" tilt={-3}>Green</LabelSticker>
        </div>
      </section>

      <section className="sticker-lab__section">
        <h2>Plaque — all tones</h2>
        <div className="sticker-lab__row">
          <LabelSticker shape="plaque" tone="cream" tilt={-2}>Cream</LabelSticker>
          <LabelSticker shape="plaque" tone="orange" tilt={1}>Orange</LabelSticker>
          <LabelSticker shape="plaque" tone="green" tilt={-3}>Green</LabelSticker>
        </div>
      </section>

      <section className="sticker-lab__section">
        <h2>Ticket — all tones</h2>
        <div className="sticker-lab__row">
          <LabelSticker shape="ticket" tone="cream" tilt={-2}>Due Date</LabelSticker>
          <LabelSticker shape="ticket" tone="orange" tilt={2}>Due Date</LabelSticker>
          <LabelSticker shape="ticket" tone="green" tilt={-1}>Due Date</LabelSticker>
        </div>
      </section>

      <section className="sticker-lab__section">
        <h2>Size scaling — em-based, set <code>font-size</code> on the face</h2>
        <div className="sticker-lab__row sticker-lab__row--align">
          <LabelSticker shape="pill" tone="cream" tilt={-1} className="sticker-lab__sm">Small</LabelSticker>
          <LabelSticker shape="pill" tone="cream" tilt={-1}>Default</LabelSticker>
          <LabelSticker shape="pill" tone="cream" tilt={-1} className="sticker-lab__lg">Large</LabelSticker>
        </div>
      </section>

      <section className="sticker-lab__section">
        <h2>Hover and click — family contract</h2>
        <p>Hover any sticker for the lift. Click to nudge it (clickRotate).</p>
        <div className="sticker-lab__row">
          <LabelSticker shape="pill" tone="orange" tilt={-2}>Hover me</LabelSticker>
          <LabelSticker shape="ticket" tone="cream" tilt={1}>Click me</LabelSticker>
        </div>
      </section>
    </main>
  )
}
