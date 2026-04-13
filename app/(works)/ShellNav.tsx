'use client'

// ShellNav — persistent navigation shell for the (works) route group.
// Renders MarkerSlot(left) with ProjectMarker + ExitMarker.
// Stays mounted across route changes. Uses useSelectedLayoutSegment to determine
// current route and toggle visibility.
//
// ProjectMarker content cross-fades when navigating between routes.
// On /selected the shell markers are hidden — that page renders its own docked
// nav row with MarkerSlot + ProjectMarker + ChapterMarker(static).

import { useSelectedLayoutSegment } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import MarkerSlot from '../components/nav/MarkerSlot'
import ProjectMarker from '../components/nav/ProjectMarker'
import ExitMarker from '../components/nav/ExitMarker'

const segmentNames: Record<string, string> = {
  selected: 'Nihar',
  rr: 'Rug Rumble',
  biconomy: 'Biconomy',
}

export default function ShellNav() {
  const segment = useSelectedLayoutSegment()
  const isSelected = segment === 'selected'
  const projectName = segmentNames[segment ?? ''] ?? 'Nihar'

  return (
    <div className={isSelected ? 'shell-nav-hidden' : undefined}>
      <MarkerSlot position="left">
        <AnimatePresence mode="wait">
          <motion.div
            key={projectName}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <ProjectMarker projectName={projectName} />
          </motion.div>
        </AnimatePresence>
      </MarkerSlot>
      <ExitMarker />
    </div>
  )
}
