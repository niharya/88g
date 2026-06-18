import { motion, AnimatePresence } from 'framer-motion'
import { PeaceTreatyCard } from './PeaceTreatyCard'

export type CardPhase =
  | 'idle'
  | 'pressing'
  | 'playing'
  | 'gone'
  | 'cooldown'
  | 'resurrecting'

interface CardPanelProps {
  phase: CardPhase
  /** When true, the idle bob is suppressed — honors prefers-reduced-motion. */
  reducedMotion?: boolean
}

export function CardPanel({ phase, reducedMotion = false }: CardPanelProps) {
  const showGhost = phase === 'gone' || phase === 'cooldown'

  const cardAnimate = (() => {
    switch (phase) {
      case 'idle':
        return { y: reducedMotion ? 0 : [0, -10, 0], scale: 1, opacity: 1 }
      case 'pressing':
        return { y: 6, scale: 0.91, opacity: 1 }
      case 'playing':
        return { y: -480, scale: 1.04, opacity: 0 }
      case 'resurrecting':
        return { y: 0, scale: 1, opacity: 1 }
      default:
        return { y: -480, scale: 1.04, opacity: 0 }
    }
  })()

  const cardTransition = (() => {
    switch (phase) {
      case 'idle':
        return {
          y: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' as const },
          scale: { duration: 0.2 },
          opacity: { duration: 0.2 },
        }
      case 'pressing':
        return { duration: 0.1, ease: 'easeOut' as const }
      case 'playing':
        return {
          y: { duration: 0.45, ease: [0.4, 0, 1, 1] as [number, number, number, number] },
          opacity: { duration: 0.18, delay: 0.05 },
          scale: { duration: 0.4 },
        }
      case 'resurrecting':
        return {
          y: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
          scale: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
          // Hold opacity at 0 until the card is past the clip zone, then
          // fade in over the final stretch — mirrors the exit timing so
          // we never catch the card mid-clip on either end of the loop.
          opacity: { duration: 0.18, delay: 0.22 },
        }
      default:
        return { duration: 0.15 }
    }
  })()

  return (
    <div style={{ position: 'relative', width: 240, height: 360 }}>
      <AnimatePresence>
        {showGhost && (
          <motion.div
            style={{
              position: 'absolute',
              borderRadius: 22.116,
              border: '2px solid #CCCCCC',
              pointerEvents: 'none',
              inset: 0,
              zIndex: 1,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>

      <motion.div
        style={{ position: 'absolute', inset: 0, zIndex: 2 }}
        animate={cardAnimate}
        transition={cardTransition}
      >
        <AnimatePresence>
          {phase === 'resurrecting' && (
            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 22.116,
                pointerEvents: 'none',
                zIndex: 3,
              }}
              initial={{ boxShadow: '0 0 0px 0px rgba(255,239,171,0)' }}
              animate={{
                boxShadow: [
                  '0 0 0px 0px rgba(255,239,171,0)',
                  '0 0 44px 16px rgba(255,239,171,0.7)',
                  '0 0 20px 6px rgba(255,239,171,0.3)',
                  '0 0 0px 0px rgba(255,239,171,0)',
                ],
              }}
              exit={{ boxShadow: '0 0 0px 0px rgba(255,239,171,0)' }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>

        <PeaceTreatyCard />
      </motion.div>
    </div>
  )
}
