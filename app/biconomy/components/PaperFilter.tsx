// PaperFilter — SVG displacement filter for paper surface texture
// Rendered off-screen; referenced via filter: url(#paper-displace) in CSS

export default function PaperFilter() {
  return (
    <svg
      aria-hidden="true"
      style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        <filter id="paper-displace" colorInterpolationFilters="sRGB">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.1 0.1"
            numOctaves={2}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={1.5}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  )
}
