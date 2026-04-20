// Chapter — shared data contract for sheet-stack navigation
// Each route defines its own Chapter[] array; this type is shared.

export interface Chapter {
  id:          string  // scroll target id on <section>
  title:       string  // displayed in chapter pill + flyout
  year:        string  // displayed alongside title
  shortTitle?: string  // optional mobile-only label (falls back to title)
}
