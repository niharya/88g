// chapters.ts — single source of truth for /biconomy chapter data
// Used by: page.tsx (sheet order), ChapterPill.tsx (flyout list), Sheet.tsx (id + props)

export interface Chapter {
  id:    string  // scroll target id on <section>
  title: string  // displayed in chapter pill + flyout
  year:  string  // displayed alongside title
}

export const chapters: Chapter[] = [
  { id: 'ux-audit',         title: 'UX Audit',         year: '2024'    },
  { id: 'demos',            title: 'Demos',             year: '2023–24' },
  { id: 'bips',             title: 'BIPs',              year: '2022'    },
  { id: 'multiverse',       title: 'Multiverse',        year: '2023'    },
  { id: 'api',              title: 'API',               year: '2022'    },
  { id: 'staying-anchored', title: 'Staying Anchored',  year: '2022–24' },
]
