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
  palette:      { stopA: string; stopB: string; angle: number }  // angle in deg
  previewColor: string
  slides:       MarkSlide[]
}

export const MARKS: MarkEntry[] = [
  {
    id:           'beringer',
    name:         'Oscar Beringer',
    year:         2023,                                                     // TODO: confirm
    story:        'A signature mark for the pianist, built from a single fluent line.',  // TODO: replace with final copy
    palette:      { stopA: '#ec1c24', stopB: '#000', angle: 233.57 },       // TODO: confirm against Figma
    previewColor: '#ec1c24',                                                // source SVG red — confirm
    slides: [
      { kind: 'mark' },
      { kind: 'mark', flip: 'x' },   // placeholder — will be real supporting media
      { kind: 'mark', flip: 'y' },   // placeholder — will be real supporting media
    ],
  },
  {
    id:           'codezeros',
    name:         'Codezeros',
    year:         0,                                              // TODO
    story:        '',                                             // TODO
    palette:      { stopA: '#000', stopB: '#000', angle: 135 },   // TODO
    previewColor: '#FF4B3F',                                      // /selected codezeros tone — confirm
    slides:       [{ kind: 'mark' }],                             // TODO
  },
  {
    id:           'ecochain',
    name:         'Ecochain',
    year:         0,                                                          // TODO
    story:        '',                                                         // TODO
    // Placeholder palette tuned to sit far enough from Beringer red to make
    // the crossfade legible during structural scaffolding. Real Figma palette
    // will replace this.
    palette:      { stopA: '#4CB400', stopB: '#0A2E10', angle: 233.57 },
    previewColor: '#4CB400',                                                  // /selected olive tone — confirm
    slides: [
      { kind: 'mark' },
      { kind: 'mark', flip: 'x' },   // placeholder — will be real supporting media
      { kind: 'mark', flip: 'y' },   // placeholder — will be real supporting media
    ],
  },
  {
    id:           'furrmark',
    name:         'Furrmark',
    year:         0,                                              // TODO
    story:        '',                                             // TODO
    palette:      { stopA: '#000', stopB: '#000', angle: 135 },   // TODO
    previewColor: '#EF426F',                                      // source SVG pink — confirm
    slides:       [{ kind: 'mark' }],                             // TODO
  },
  {
    id:           'kilti',
    name:         'Kilti',
    year:         0,                                              // TODO
    story:        '',                                             // TODO
    palette:      { stopA: '#000', stopB: '#000', angle: 135 },   // TODO
    previewColor: '#1E1E1E',                                      // source SVG near-black — confirm (likely wants a color)
    slides:       [{ kind: 'mark' }],                             // TODO
  },
  {
    id:           'slangbusters',
    name:         'Slangbusters',
    year:         0,                                              // TODO
    story:        '',                                             // TODO
    palette:      { stopA: '#000', stopB: '#000', angle: 135 },   // TODO
    previewColor: '#07F063',                                      // /selected mint tone — confirm
    slides:       [{ kind: 'mark' }],                             // TODO
  },
]
