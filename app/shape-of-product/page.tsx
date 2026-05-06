import type { Metadata } from 'next'
import NavMarker from '../components/NavMarker'
import IconExternalLink from '../components/icons/IconExternalLink'
import ActorStickers from './components/ActorStickers'
import RoleApproachStack from './components/RoleApproachStack'
import SignOffCard from './components/SignOffCard'

export const metadata: Metadata = {
  title: 'Shape of Product',
  description:
    'A musing on building tools for people who build tools, and the role design plays when the shape of product is open.',
  alternates: { canonical: '/shape-of-product' },
}

export default function ShapeOfProductPage() {
  return (
    <div className="route-sop">
      <article className="sop">
        {/* The visual title was removed at v0.78+ — the chapter marker in
            SopNavRow already names the page. Keeping a sr-only h1 so screen
            readers and document outlines still get a heading. */}
        <h1 className="sr-only">Shape of Product</h1>

        {/* Editorial chunks — three prose blocks separated by hairline
            dividers. Spacing is uniform around each divider so the
            rhythm reads as a steady section beat across the lede. */}
        <div className="sop__chunks">
          <div className="sop__prose">
            <p>You are building tools for people who build tools.</p>
          </div>

          <hr className="sop__divider" aria-hidden="true" />

          <div className="sop__prose">
            <p>
              Most of my work has been in systems where design sits close to
              infrastructure.
            </p>
            <p>
              Works like{' '}
              <span className="sop__chip sop__chip--left">
                <NavMarker
                  as="a"
                  role="chapter"
                  href="/biconomy#ux-audit"
                  target="_blank"
                  rel="noopener noreferrer"
                  icon={<IconExternalLink size={14} />}
                  label="developer dashboards"
                  aria-label="Open the UX Audit chapter from Biconomy in a new tab"
                />
              </span>{' '}
              and{' '}
              <span className="sop__chip sop__chip--right">
                <NavMarker
                  as="a"
                  role="chapter"
                  href="/biconomy#demos"
                  target="_blank"
                  rel="noopener noreferrer"
                  icon={<IconExternalLink size={14} />}
                  label="prototypes + stories"
                  aria-label="Open the Demos chapter from Biconomy in a new tab"
                />
              </span>
              <br />
              that make deep infra understandable.
            </p>
          </div>

          <hr className="sop__divider" aria-hidden="true" />

          <div className="sop__prose">
            <p>
              I tend to work well in cultures (aka systems) where multiple actors —{' '}
              <ActorStickers />{' '}
              — are influencing each other heavily and the shape of product is open.
            </p>
          </div>
        </div>

        <RoleApproachStack />

        <SignOffCard />
      </article>
    </div>
  )
}
