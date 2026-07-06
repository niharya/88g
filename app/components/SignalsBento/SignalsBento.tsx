// SignalsBento — the project "Signals" panel revealed inside the TopSheet.
// Five tiles in a fixed 3-column bento (Role · Outcome · Product ·
// Involvement · Deliverables). Structure is shared; per-route content + the
// two variable tones (role, outcome) come in as `data`. Product is always
// grey, Involvement olive, Deliverables terra. Every colour is a token (via
// the Tile tone presets); fonts are the app's `--font-*`. Entrance is a calm
// staggered place-in on --ease-paper (signals-bento.css) — no bounce.

import { Counter } from './Counter'
import { Tile, TileBadge } from './Tile'
import type { SignalsData } from './types'

export default function SignalsBento({ data }: { data: SignalsData }) {
  const { role, outcome, product, involvement, deliverables } = data

  return (
    <div className="signals-bento">
      {/* ROLE — the ticket line, now tile 0 */}
      <Tile tone={role.tone} area="role" pad="16px 22px" delay={0.04} className="signals-role">
        <div className="signals-role__main">
          <span className="signals-role__icon" aria-hidden="true">{role.icon}</span>
          <span className="signals-role__lead">
            {role.lead} <span className="signals-role__rest">{role.rest}</span>
          </span>
        </div>
        <span className="signals-role__meta">{role.meta}</span>
      </Tile>

      {/* OUTCOME — headline result; /rr adds three count-up stats */}
      <Tile
        tone={outcome.tone}
        area="out"
        minHeight={outcome.minHeight}
        pad="24px 26px"
        delay={0.12}
        className={`signals-outcome${outcome.stats ? ' signals-outcome--stats' : ''}`}
      >
        <TileBadge n={1} label="Outcome" />
        {outcome.stats ? (
          <div className="signals-outcome__lower">
            <p className="signals-outcome__body">{outcome.body}</p>
            <div className="signals-stats">
              {outcome.stats.map((s, i) => (
                <div className="signals-stat" key={s.label}>
                  <div className="signals-stat__value">
                    <Counter value={s.value} suffix={s.suffix} delay={i * 120} />
                    {s.unit && <span className="signals-stat__unit"> {s.unit}</span>}
                  </div>
                  <div className="signals-stat__label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="signals-outcome__body">{outcome.body}</p>
        )}
        <span className={`signals-outcome__halo signals-outcome__halo--${outcome.halo}`} aria-hidden="true" />
      </Tile>

      {/* PRODUCT — one-liner + card visual + meta rows (always grey) */}
      <Tile tone="grey" area="prod" pad="20px 22px" delay={0.2} className="signals-product">
        <TileBadge n={2} label="Product" />
        <p className="signals-product__head">{product.headline}</p>
        <div className="signals-product__art">
          {/* eslint-disable-next-line @next/next/no-img-element — vector card art, not a content photo */}
          <img
            src={product.image.src}
            alt={product.image.alt}
            style={{ maxWidth: product.image.width }}
          />
        </div>
        <div className="signals-product__rows">
          {product.rows.map((r) => (
            <div className="signals-product__row" key={r.label}>
              <span className="signals-product__row-key">{r.label}</span>
              <span className="signals-product__row-val">{r.value}</span>
            </div>
          ))}
        </div>
      </Tile>

      {/* INVOLVEMENT — disciplines (always olive) */}
      <Tile tone="olive" area="invl" minHeight={200} delay={0.28} className="signals-involve">
        <TileBadge n={3} label="Involvement" />
        <div className="signals-list">
          {involvement.map((t) => (
            <div className="signals-list__item" key={t}>
              <span className="signals-list__diamond" aria-hidden="true" />
              <span className="signals-list__text">{t}</span>
            </div>
          ))}
        </div>
      </Tile>

      {/* DELIVERABLES — numbered list (always terra) */}
      <Tile tone="terra" area="dlv" minHeight={200} delay={0.34} className="signals-dlv">
        <TileBadge n={4} label="Deliverables" />
        <div className="signals-dlv__list">
          {deliverables.map((t, i) => (
            <div className="signals-dlv__item" key={t}>
              <span className="signals-dlv__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="signals-dlv__text">{t}</span>
            </div>
          ))}
        </div>
      </Tile>
    </div>
  )
}
