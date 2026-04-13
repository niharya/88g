// chapters.ts — /rr chapter data

import type { Chapter } from '../../../components/nav/types'

export type { Chapter } from '../../../components/nav/types'

export const chapters: Chapter[] = [
  { id: 'intro',     title: 'Introduction',  year: 'Sep 2024' },
  { id: 'mechanics', title: 'Game Mechanics', year: 'Oct 2024' },
  { id: 'cards',     title: 'Cards & UI',     year: 'Nov 2024' },
  { id: 'outcome',   title: 'Outcome',        year: 'Dec 2024' },
]
