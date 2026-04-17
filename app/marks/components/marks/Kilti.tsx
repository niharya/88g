// Kilti — flag-and-arrow glyph.
// Source: reference/marks-source/kilti.svg
// Originally single dark #1E1E1E — collapsed to currentColor.
// clipPath id is scoped per-instance via useId().

import { useId } from 'react'
import type { SVGProps } from 'react'

export default function Kilti(props: SVGProps<SVGSVGElement>) {
  const rawId = useId()
  const clipId = `kilti-clip-${rawId.replace(/:/g, '')}`
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 70 82"
      fill="none"
      {...props}
    >
      <g clipPath={`url(#${clipId})`}>
        <path d="M13.9337 8.05687L0 0L0 81.3507L13.8152 73.3649C14.9526 72.7014 15.6635 71.4929 15.6635 70.1896L15.6635 11.019C15.6635 9.78673 15.0237 8.64929 13.9573 8.03318L13.9337 8.05687Z" fill="currentColor" />
        <path d="M69.5719 40.0706L44.7852 25.7578V55.5682L69.5719 41.2554C70.1406 40.9237 70.1406 40.3787 69.5719 40.0706ZM45.733 53.9332V27.4166L68.6951 40.6867L45.733 53.9569V53.9332Z" fill="currentColor" />
        <path d="M40.2861 23.3194L18.7695 10.9023V37.3241L40.2861 24.9071C41.0444 24.4568 41.0444 23.7696 40.2861 23.3194Z" fill="currentColor" />
        <path d="M40.2861 56.4444L18.7695 44.0273V70.4491L40.2861 58.0321C41.0444 57.5818 41.0444 56.8946 40.2861 56.4444Z" fill="currentColor" />
        <path d="M40.9022 28.1289C40.7127 28.1289 40.5231 28.2 40.2861 28.3185L18.7695 40.7355L40.2861 53.1526C40.4994 53.2711 40.7127 53.3422 40.9022 53.3422C41.3525 53.3422 41.6605 52.9867 41.6605 52.3706V29.1242C41.6605 28.5081 41.3525 28.1526 40.9022 28.1526V28.1289Z" fill="currentColor" />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect width="70" height="81.3507" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
