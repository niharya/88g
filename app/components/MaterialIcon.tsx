// MaterialIcon — the one typed way to render a Material Symbols glyph as a span.
//
// Renders `<span class="material-symbols-rounded">{name}</span>`, where the
// ligature `name` is constrained to the icon registry (app/lib/icons.ts), so a
// glyph the subset font won't have is a compile error. Route-local styling
// (size/colour) rides on `className`; the symbol font + `liga` come from the
// `.material-symbols-rounded` rule in globals.css.
//
// NavMarker has its own `.nav-icon` rendering and is typed at its `icon` prop
// instead — it does not use this component. Everything else that printed a raw
// `.material-symbols-rounded` (or route-local symbol-font) span goes through
// here so the registry is enforced.

import type { IconName } from '../lib/icons'

export default function MaterialIcon({
  name,
  className,
}: {
  name: IconName
  className?: string
}) {
  const classes = ['material-symbols-rounded', className].filter(Boolean).join(' ')
  return (
    <span className={classes} aria-hidden="true">
      {name}
    </span>
  )
}
