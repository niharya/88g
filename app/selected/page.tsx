import type { Metadata } from 'next'
import './selected.css'
import PaperFilter from '../components/PaperFilter'
import ProjectMarker from '../components/nav/ProjectMarker'
import AboutCard from './components/AboutCard'
import SelectedContent from './components/SelectedContent'

export const metadata: Metadata = {
  title: 'Nihar Bhagat — Works',
  description: 'Selected works by Nihar Bhagat — product, systems, and brand design from 2018 to 2025.',
}

export default function SelectedPage() {
  return (
    <main className="workbench selected-workbench">
      <PaperFilter />

      <div className="selected-layout">
        {/* Nav pills — docked together, positioned above the mat */}
        <div className="selected-nav-row">
          <ProjectMarker projectName="Nihar" href="/" />
          <div className="selected-works-pill">
            <div className="nav-marker nav-marker--chapter" style={{ borderLeftWidth: 1 }}>
              <span className="nav-marker__content">
                <span className="nav-icon" aria-hidden="true">arrow_downward</span>
                <span className="nav-marker__title t-btn1">Works</span>
                <span className="nav-marker__year t-p4">2018-25</span>
              </span>
            </div>
          </div>
        </div>

        <AboutCard />
        <SelectedContent />
      </div>
    </main>
  )
}
