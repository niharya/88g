'use client'

// RoleApproachStack — two olive/yellow notes-rail-style cards z-stacked.
// Roles is olive (bips-notes idiom from /biconomy). Approach is yellow/terra
// (rules-rail idiom from /rr). Each card has a 90°-rotated tab on the right
// edge with a flippable arrow icon. The inactive card sits behind the active
// one, offset diagonally so its right-edge sliver + tab are visible. Click
// the inactive card or its tab → the two swap; transforms animate via
// --dur-slide / --ease-paper.
//
// Default active = 'roles' (mirrors the prior page composition where Roles
// came first).

import { useId, useState } from 'react'

type Active = 'roles' | 'approach'

interface ArrowProps {
  className?: string
  maskId:     string
}

// Inline SVG, mirrors the bips/flows ArrowBackIcon. `maskId` is consumer-
// scoped via useId so two arrows in the same document don't collide.
function ArrowBackIcon({ className, maskId }: ArrowProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <mask id={maskId} style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
        <rect width="20" height="20" transform="matrix(-1 0 0 1 20 0)" fill="white" />
      </mask>
      <g mask={`url(#${maskId})`}>
        <path d="M10.4167 16.6666L4.16675 9.99992L10.4167 3.33325" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.58325 10L15.8333 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  )
}

export default function RoleApproachStack() {
  const [active, setActive] = useState<Active>('roles')
  const rolesActive    = active === 'roles'
  const approachActive = active === 'approach'

  // useId guarantees each ArrowBackIcon's mask is unique even if the stack
  // ever renders twice on the same page (e.g. mobile + desktop variants).
  const baseId = useId()
  const rolesMaskId    = `${baseId}-roles-arrow`
  const approachMaskId = `${baseId}-approach-arrow`

  // Click handlers: tabs always switch; card body switches only when that
  // card is currently inactive (clicking the active card is a no-op so the
  // user can interact with its content without unintended swaps).
  const switchToRoles    = () => setActive('roles')
  const switchToApproach = () => setActive('approach')

  return (
    <div className="sop__stack" role="tablist" aria-label="Roles and approach">
      {/* Roles card */}
      <section
        className={`sop__stack-card sop__stack-card--roles${rolesActive ? ' is-active' : ''}`}
        onClick={rolesActive ? undefined : switchToRoles}
        aria-labelledby="sop-roles-heading"
      >
        <button
          type="button"
          role="tab"
          className="sop__stack-tab"
          onClick={(e) => { e.stopPropagation(); switchToRoles() }}
          aria-controls="sop-roles-panel"
          aria-selected={rolesActive}
        >
          <span className="sop__stack-tab-inner t-h5">
            <ArrowBackIcon
              maskId={rolesMaskId}
              className={`sop__stack-arrow${rolesActive ? '' : ' is-flipped'}`}
            />
            Roles
          </span>
        </button>

        <div
          id="sop-roles-panel"
          className="sop__stack-content"
          // The inactive card's content is visually dimmed and not the
          // focus of the reading; hide from assistive tech to avoid the
          // hidden-text-fighting-the-active-card noise. Keeping the tab
          // outside this aria-hidden region preserves keyboard
          // tabbability — `aria-hidden` on the whole card would have
          // been a focusable-descendant violation.
          aria-hidden={!rolesActive}
        >
          <h2 id="sop-roles-heading" className="sop__stack-lede t-p3">
            My role in those environments has been to:
          </h2>
          <ul className="sop__stack-list t-p4">
            <li>
              <p className="t-p4">
                <span className="t-h5">Make the system legible</span><br />
                So decisions can be made without guesswork
              </p>
            </li>
            <li>
              <p className="t-p4">
                <span className="t-h5">Prototype flows early</span><br />
                So behavior is tested before it's abstracted
              </p>
            </li>
            <li>
              <p className="t-p4">
                <span className="t-h5">Work closely with engineers</span><br />
                Not as handoff, but as shared problem-solving
              </p>
            </li>
            <li>
              <p className="t-p4">
                <span className="t-h5">Reduce complexity without flattening it</span><br />
                Especially in technical contexts
              </p>
            </li>
          </ul>
        </div>
      </section>

      {/* Approach card */}
      <section
        className={`sop__stack-card sop__stack-card--approach${approachActive ? ' is-active' : ''}`}
        onClick={approachActive ? undefined : switchToApproach}
        aria-labelledby="sop-approach-heading"
      >
        <button
          type="button"
          role="tab"
          className="sop__stack-tab"
          onClick={(e) => { e.stopPropagation(); switchToApproach() }}
          aria-controls="sop-approach-panel"
          aria-selected={approachActive}
        >
          <span className="sop__stack-tab-inner t-h5">
            <ArrowBackIcon
              maskId={approachMaskId}
              className={`sop__stack-arrow${approachActive ? '' : ' is-flipped'}`}
            />
            Approach
          </span>
        </button>

        <div
          id="sop-approach-panel"
          className="sop__stack-content sop__stack-content--prose t-p2"
          aria-hidden={!approachActive}
        >
          <h2 id="sop-approach-heading" className="sr-only">Approach</h2>
          <p>Start with ambiguity.</p>
          <p>Stay with it long enough to understand the forces.</p>
          <p>Then shape it into something that can actually be built and used.</p>
        </div>
      </section>
    </div>
  )
}
