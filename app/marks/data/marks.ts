// Typed inventory of the six marks. Consumed by:
//   • Essay preview row (name + previewColor)
//   • MarkSection (slide list, name, year)
//   • MarkChrome (caption text, "Name, Year" attribution)
//   • Background (palette.stopA / .stopB / .angle)
//
// The first slide of every mark MUST be `{ kind: 'mark' }` — that renders the
// hero SVG at editorial scale. Slides 2+ are JPG/WEBP stills or MP4 motion.
//
// Fields marked `// TODO` are placeholder-scaffolded and need real values
// before chunk 2 finalises the mark components (palettes) and chunk 4 drives
// the Essay preview row (year/story/previewColor).

import type { MarkId } from '../components/marks/types'

export type MarkSlide =
  // `flip` is a placeholder affordance: when set, the mark glyph renders with
  // `transform: scaleX(-1)` or `scaleY(-1)` so we can scaffold a multi-slide
  // carousel before real supporting media ships. Real slides are kind:
  // 'image' | 'video'.
  | { kind: 'mark'; flip?: 'x' | 'y' }
  | { kind: 'image'; src: string; caption: string }
  | { kind: 'video'; src: string; caption: string }

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
  // `previewColor` is the primary ink the Essay preview reveals on hover.
  // `previewAccent` is the secondary ink used by duotone marks whose accent
  // paths are tagged `data-depth=""` — on hover those paths flip to the
  // accent while primary paths flip to `previewColor`, reproducing the
  // source mark's original two-tone identity.
  previewColor:  string
  previewAccent?: string
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
    previewColor: '#F04E6B',
    slides: [
      { kind: 'mark' },
      { kind: 'image', src: '/marks/furrmark/01.webp', caption: 'Early iterations' },
      { kind: 'video', src: '/marks/furrmark/04.mp4', caption: 'Refinement journey' },
      { kind: 'image', src: '/marks/furrmark/02.webp', caption: 'Brand-book placement rules for the mark.' },
      { kind: 'video', src: '/marks/furrmark/05.mp4', caption: 'Pages of the brandbook, turning.' },
      { kind: 'image', src: '/marks/furrmark/03.webp', caption: 'Logo lockup' },
    ],
  },
  {
    id:           'codezeros',
    name:         'Codezeros',
    year:         2019,
    story:        'Is it read code-zeros, co-dezeros, codez-eros? The logotype solved for this ambiguity.',
    palette:      { stopA: '#4D0B0F', stopMid: '#80131A', stopB: '#FF2633', angle: 45 },  // primary #FF2633 × (0.3, 0.5, 1.0)
    previewColor: '#FF2633',
    previewAccent:'#FF9933',
    slides: [
      { kind: 'mark' },
      { kind: 'image', src: '/marks/codezeros/01.webp', caption: 'Refinement' },
      { kind: 'video', src: '/marks/codezeros/03.mp4', caption: 'First drafts' },
      { kind: 'video', src: '/marks/codezeros/04.mp4', caption: 'Eyeballing color' },
      { kind: 'video', src: '/marks/codezeros/05.mp4', caption: 'Just fancy animation' },
      { kind: 'image', src: '/marks/codezeros/02.webp', caption: 'Environmental signage at the studio’s front desk.' },
    ],
  },
  {
    id:           'slangbusters',
    name:         'Slangbusters',
    year:         2020,
    story:        'It begins with noise and ends in clarity, just like our clients going through the process.',
    palette:      { stopA: '#003D1F', stopMid: '#006633', stopB: '#00CC66', angle: 45 },  // primary #00CC66 × (0.3, 0.5, 1.0)
    previewColor: '#FFFFFF',
    previewAccent:'#00CC66',
    slides: [
      { kind: 'mark' },
      { kind: 'video', src: '/marks/slangbusters/02.mp4', caption: 'Early drafts' },
      { kind: 'video', src: '/marks/slangbusters/03.mp4', caption: 'Relationship trials' },
      { kind: 'video', src: '/marks/slangbusters/04.mp4', caption: 'Slangbusters logo cutout by Savan Prajapati' },
      { kind: 'image', src: '/marks/slangbusters/01.webp', caption: 'Studio’s library stamp' },
    ],
  },
  {
    id:           'beringer',
    name:         'Oscar Beringer',
    year:         2023,
    story:        '[Concept] Solves for his name’s pronunciation problem',
    palette:      { stopA: '#47080B', stopMid: '#760E12', stopB: '#EC1C24', angle: 45 },  // primary #EC1C24 × (0.3, 0.5, 1.0)
    previewColor: '#EC1C24',
    previewAccent:'#EF5223',
    slides: [
      { kind: 'mark' },
      { kind: 'image', src: '/marks/beringer/01.webp', caption: 'Some fake mockups' },
      { kind: 'image', src: '/marks/beringer/02.webp', caption: 'It’s bay-rohn-jay ffs!' },
      { kind: 'image', src: '/marks/beringer/03.webp', caption: 'Like I said previously…' },
      { kind: 'image', src: '/marks/beringer/04.webp', caption: 'Just' },
    ],
  },
  {
    id:           'ecochain',
    name:         'Ecochain',
    year:         2022,
    story:        'Lovechild of a typeface and a spindle of thread',
    palette:      { stopA: '#173600', stopMid: '#265A00', stopB: '#4CB400', angle: 45 },  // primary #4CB400 × (0.3, 0.5, 1.0)
    previewColor: '#4CB400',
    slides: [
      { kind: 'mark' },
      { kind: 'image', src: '/marks/ecochain/01.webp', caption: 'Presentation showing how a child is born' },
      { kind: 'video', src: '/marks/ecochain/03.mp4', caption: 'Fancy animation' },
      { kind: 'image', src: '/marks/ecochain/02.webp', caption: 'Real work by Savan Prajapati' },
      { kind: 'video', src: '/marks/ecochain/04.mp4', caption: 'By Savan Prajapati + Akshar Dave' },
    ],
  },
  {
    id:           'kilti',
    name:         'Kilti',
    year:         2024,
    story:        'Clothing line. Cats. Triangles.',
    palette:      { stopA: '#2F2E4D', stopMid: '#4E4D80', stopB: '#9B99FF', angle: 45 },  // primary #9B99FF × (0.3, 0.5, 1.0)
    previewColor: '#9B99FF',
    slides: [
      { kind: 'mark' },
      { kind: 'image', src: '/marks/kilti/01.webp', caption: 'House of Kilti with its owner' },
    ],
  },
]
