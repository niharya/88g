import type { Metadata } from 'next'
import { chapters } from './nav/chapters'
import PaperFilter from '../components/PaperFilter'
import ProjectMarker from '../components/nav/ProjectMarker'
import ExitMarker from '../components/nav/ExitMarker'
import Sheet from '../components/Sheet'

export const metadata: Metadata = {
  title: 'Rug Rumble — Nihar Bhagat',
}

export default function RRPage() {
  return (
    <main className="workbench">
      <PaperFilter />
      <ProjectMarker projectName="Rug Rumble" />
      <ExitMarker />

      <div className="sheet-stack">
        {chapters.map(chapter => (
          <Sheet key={chapter.id} chapter={chapter} chapters={chapters}>
            {/* Phase 1+ content goes here */}
          </Sheet>
        ))}
      </div>
    </main>
  )
}
