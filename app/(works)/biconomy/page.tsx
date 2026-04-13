import type { Metadata } from 'next'
import { chapters } from './nav/chapters'
import Sheet from '../../components/Sheet'
import Intro from './components/Intro'
import Flows from './components/Flows'
import Demos from './components/Demos'
import BIPs from './components/BIPs'
import Multiverse from './components/Multiverse'
import API from './components/API'
import StayingAnchored from './components/StayingAnchored'

export const metadata: Metadata = {
  title: 'Biconomy — Nihar Bhagat',
}

// Sheet content keyed by chapter id — keeps page.tsx readable without a giant switch
const sheetContent: Record<string, React.ReactNode> = {
  'ux-audit':         <><Intro /><Flows /></>,
  'demos':            <Demos />,
  'bips':             <BIPs />,
  'multiverse':       <Multiverse />,
  'api':              <API />,
  'staying-anchored': <StayingAnchored />,
}

export default function BiconomyPage() {
  return (
    <div className="route-biconomy">
      <div className="sheet-stack">
        {chapters.map(chapter => (
          <Sheet key={chapter.id} chapter={chapter} chapters={chapters}>
            {sheetContent[chapter.id]}
          </Sheet>
        ))}
      </div>
    </div>
  )
}
