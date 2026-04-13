// chapters.ts — /biconomy chapter data
// Chapter type is shared; see app/components/nav/types.ts

export type { Chapter } from '../../../components/nav/types'

import type { Chapter } from '../../../components/nav/types'

export const chapters: Chapter[] = [
  { id: 'ux-audit',         title: 'UX Audit',         year: '2024'    },
  { id: 'demos',            title: 'Demos',             year: '2023–24' },
  { id: 'bips',             title: 'BIPs',              year: '2022'    },
  { id: 'multiverse',       title: 'Multiverse',        year: '2023'    },
  { id: 'api',              title: 'API',               year: '2022'    },
  { id: 'staying-anchored', title: 'Staying Anchored',  year: '2022–24' },
]
