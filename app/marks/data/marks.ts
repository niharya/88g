// Typed inventory of the six marks. Consumed by:
//   • Essay preview row (name + previewColor)
//   • MarkSection (slide list, name, year)
//   • MarkChrome (caption text, "Name, Year" attribution)
//   • Background (palette.stopA / .stopB / .angle)
//
// The first slide of every mark MUST be `{ kind: 'mark' }` — that renders the
// hero SVG at editorial scale. Slides 2+ are JPG/GIF/PNG supporting media.
//
// Fields marked `// TODO` are placeholder-scaffolded and need real values
// before chunk 2 finalises the mark components (palettes) and chunk 4 drives
// the Essay preview row (year/story/previewColor).

import type { MarkId } from '../components/marks/types'

export type MarkSlide =
  // `flip` is a placeholder affordance: when set, the mark glyph renders with
  // `transform: scaleX(-1)` or `scaleY(-1)` so we can scaffold a multi-slide
  // carousel before real supporting media (image/gif) ships. Real slides will
  // be kind: 'image' | 'gif'.
  | { kind: 'mark'; flip?: 'x' | 'y' }
  | { kind: 'image'; src: string; caption: string }
  | { kind: 'gif';   src: string; caption: string }

export type MarkEntry = {
  id:           MarkId
  name:         string
  year:         number
  story:        string
  // `stopMid` is an optional third stop placed at the geometric midpoint
  // between stopA (69.875%) and stopB (106.73%). It exists to smooth the
  // transition on marks whose A→B endpoints would otherwise band across
  // large flat areas. When omitted, the gradient falls back to a pure
  // A→B two-stop via color-mix in the CSS layer.
  palette:      { stopA: string; stopB: string; stopMid?: string; angle: number }
  previewColor: string
  slides:       MarkSlide[]
}

// Order mirrors the Essay's reading order: divider → wordmarks row → glyphs row.
//   Furrmark (divider) → Codezeros, Slangbusters, Beringer (wordmarks)
//                      → Ecochain, Kilti (glyphs)
export const MARKS: MarkEntry[] = [
  {
    id:           'furrmark',
    name:         'Aleyr',
    year:         2021,
    story:        'This mark is the face your pet makes when your hand rests on its head.',
    palette:      { stopA: '#2B0E13', stopMid: '#491821', stopB: '#912F41', angle: 45 },  // bottom-left #2B0E13 → mid (50%) #491821 → top-right #912F41
    previewColor: '#902F41',
    slides: [
      { kind: 'mark' },
      { kind: 'mark', flip: 'x' },   // placeholder — will be real supporting media
      { kind: 'mark', flip: 'y' },   // placeholder — will be real supporting media
    ],
  },
  {
    id:           'codezeros',
    name:         'Codezeros',
    year:         2019,
    story:        'A wordmark for a studio that writes code others read twice.',
    palette:      { stopA: '#4D0B0F', stopMid: '#80131A', stopB: '#FF2633', angle: 45 },  // primary #FF2633 × (0.3, 0.5, 1.0)
    previewColor: '#FF2633',
    slides: [
      { kind: 'mark' },
      { kind: 'mark', flip: 'x' },   // placeholder — will be real supporting media
      { kind: 'mark', flip: 'y' },   // placeholder — will be real supporting media
    ],
  },
  {
    id:           'slangbusters',
    name:         'Slangbusters',
    year:         2020,
    story:        'Built for a bureau that untangles jargon and leaves plain language standing.',
    palette:      { stopA: '#003D1F', stopMid: '#006633', stopB: '#00CC66', angle: 45 },  // primary #00CC66 × (0.3, 0.5, 1.0)
    previewColor: '#00CC66',
    slides: [
      { kind: 'mark' },
      { kind: 'mark', flip: 'x' },   // placeholder — will be real supporting media
      { kind: 'mark', flip: 'y' },   // placeholder — will be real supporting media
    ],
  },
  {
    id:           'beringer',
    name:         'Oscar Beringer',
    year:         2023,
    story:        'A signature mark for the pianist, drawn as one fluent line.',
    palette:      { stopA: '#47080B', stopMid: '#760E12', stopB: '#EC1C24', angle: 45 },  // primary #EC1C24 × (0.3, 0.5, 1.0)
    previewColor: '#EC1C24',
    slides: [
      { kind: 'mark' },
      { kind: 'mark', flip: 'x' },   // placeholder — will be real supporting media
      { kind: 'mark', flip: 'y' },   // placeholder — will be real supporting media
    ],
  },
  {
    id:           'ecochain',
    name:         'Ecochain',
    year:         2022,
    story:        'A glyph for a supply chain that grows instead of extracts.',
    palette:      { stopA: '#173600', stopMid: '#265A00', stopB: '#4CB400', angle: 45 },  // primary #4CB400 × (0.3, 0.5, 1.0)
    previewColor: '#4CB400',
    slides: [
      { kind: 'mark' },
      { kind: 'mark', flip: 'x' },   // placeholder — will be real supporting media
      { kind: 'mark', flip: 'y' },   // placeholder — will be real supporting media
    ],
  },
  {
    id:           'kilti',
    name:         'Kilti',
    year:         2024,
    story:        'Drawn for a practice that holds ceremony in small, precise gestures.',
    palette:      { stopA: '#2F2E4D', stopMid: '#4E4D80', stopB: '#9B99FF', angle: 45 },  // primary #9B99FF × (0.3, 0.5, 1.0)
    previewColor: '#9B99FF',
    slides: [
      { kind: 'mark' },
      { kind: 'mark', flip: 'x' },   // placeholder — will be real supporting media
      { kind: 'mark', flip: 'y' },   // placeholder — will be real supporting media
    ],
  },
]
