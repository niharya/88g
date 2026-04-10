import type { Metadata } from 'next'
import { Fragment } from 'react'
import { chapters } from './nav/chapters'
import PaperFilter from '../components/PaperFilter'
import ProjectMarker from '../components/nav/ProjectMarker'
import ExitMarker from '../components/nav/ExitMarker'
import Sheet from '../components/Sheet'
import Intro from './components/Intro'
import Mechanics from './components/Mechanics'
import Cards from './components/Cards'
import Outcome from './components/Outcome'
import InterstitialText from './components/InterstitialText'

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
          <Fragment key={chapter.id}>
            <Sheet chapter={chapter} chapters={chapters}>
              {chapter.id === 'intro'      && <Intro />}
              {chapter.id === 'mechanics' && <Mechanics />}
              {chapter.id === 'cards'     && <Cards />}
              {chapter.id === 'outcome'   && <Outcome />}
            </Sheet>

            {chapter.id === 'intro' && <InterstitialText />}
          </Fragment>
        ))}
      </div>
    </main>
  )
}
