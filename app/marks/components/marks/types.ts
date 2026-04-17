// MarkId — union of the six mark component keys. Kept in its own file so
// `data/marks.ts` and `components/marks/index.ts` can both import it without
// a circular dependency.
//
// Extend the union when a new mark is added to the inventory in
// `data/marks.ts` AND a matching component file lands in this directory.

export type MarkId =
  | 'beringer'
  | 'codezeros'
  | 'ecochain'
  | 'furrmark'
  | 'kilti'
  | 'slangbusters'

// MarkComponent — filled in chunk 2 once the individual mark components land.
// Every mark component receives `className` (so the consumer can size/ink it
// from the outside) and uses `currentColor` for every fillable path.
export type MarkComponent = React.FC<React.SVGProps<SVGSVGElement>>
