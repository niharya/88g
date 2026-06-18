import { motion, AnimatePresence } from 'framer-motion'
import svgPaths from './paths'
import { imgRectangle145 } from './masks'

const HEALTH_MAX = 100
const ENERGY_MAX = 8
const HEALTH_BAR_COUNT = 4

interface StatsPanelProps {
  health: number
  energy: number
  shield: number
  healthDamaged: boolean
  healthNumberRed: boolean
  showDamageFlash: boolean
}

function HealthBarSegment({
  index,
  health,
  damaged,
}: {
  index: number
  health: number
  damaged: boolean
}) {
  const chunkSize = HEALTH_MAX / HEALTH_BAR_COUNT
  const chunkMin = index * chunkSize
  const fillPct = Math.max(0, Math.min(1, (health - chunkMin) / chunkSize))

  return (
    <div style={{ height: 18.43, position: 'relative', flexShrink: 0, width: 37.518 }}>
      <div style={{ position: 'absolute', backgroundColor: '#f3f3f3', inset: 0, borderRadius: 4 }} />
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          borderRadius: 4,
          backgroundImage: damaged
            ? 'linear-gradient(to bottom, #f34f3d, #8d2e23)'
            : 'linear-gradient(to bottom, #f3d300, #8d7a00)',
        }}
        animate={{ width: `${fillPct * 100}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </div>
  )
}

export function StatsPanel({
  health,
  energy,
  shield,
  healthDamaged,
  healthNumberRed,
  showDamageFlash,
}: StatsPanelProps) {
  const energyBarWidthPct = (energy / ENERGY_MAX) * 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 15.796, alignItems: 'flex-start' }}>
      {/* Row 1: You label + Shield */}
      <div style={{ display: 'flex', gap: 10.532, alignItems: 'flex-start', flexShrink: 0 }}>
        {/* "You" pill */}
        <div
          style={{
            backgroundColor: '#0e1325',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: 12.416,
            borderRadius: 18.624,
            flexShrink: 0,
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-rr-gluten), cursive',
              fontWeight: 600,
              lineHeight: 1,
              color: '#d0d0d0',
              fontSize: 31.594,
              whiteSpace: 'nowrap',
              margin: 0,
            }}
          >
            You
          </p>
        </div>

        {/* Shield pill */}
        <div
          style={{
            backgroundColor: '#0e1325',
            position: 'relative',
            borderRadius: 15.796,
            alignSelf: 'stretch',
            flexShrink: 0,
          }}
        >
          <div
            aria-hidden
            style={{
              position: 'absolute',
              border: '2px solid #297bf1',
              inset: 0,
              pointerEvents: 'none',
              borderRadius: 15.796,
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10.532px 15.796px',
              gap: 5.266,
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-rr-gluten), cursive',
                fontWeight: 600,
                lineHeight: 1,
                color: '#fff7d3',
                fontSize: 31.6,
                position: 'relative',
                top: 6,
                margin: 0,
              }}
            >
              {shield}
            </p>
            <div style={{ height: 23.696, flexShrink: 0, width: 22.602 }}>
              <svg
                style={{ display: 'block', width: '100%', height: '100%' }}
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 11.301 11.8477"
              >
                <path d={svgPaths.p1ffd3b80} fill="#297BF1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Health + Energy */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#13182c',
          display: 'flex',
          flexDirection: 'column',
          gap: 15.796,
          alignItems: 'flex-start',
          padding: '15.796px 10.532px',
          borderRadius: 21.062,
          flexShrink: 0,
        }}
      >
        <AnimatePresence>
          {showDamageFlash && (
            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 21.062,
                backgroundColor: '#ef4444',
                pointerEvents: 'none',
                zIndex: 10,
              }}
              initial={{ opacity: 0.45 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>

        {/* Health */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5.266, alignItems: 'flex-start', flexShrink: 0, width: '100%' }}>
          <div style={{ display: 'flex', gap: 5.266, alignItems: 'center', flexShrink: 0 }}>
            <motion.div
              style={{
                fontFamily: 'var(--font-rr-gluten), cursive',
                fontWeight: 600,
                lineHeight: 1,
                fontSize: 31.6,
                width: 38,
              }}
              animate={{ color: healthNumberRed ? '#ff5544' : '#fff7d3' }}
              transition={{ color: { duration: 0.3 } }}
            >
              <motion.span
                key={health}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                style={{ display: 'inline-block' }}
              >
                {health}
              </motion.span>
            </motion.div>
            <div style={{ height: 23.696, flexShrink: 0, width: 21.042, position: 'relative', top: -3 }}>
              <svg
                style={{ display: 'block', width: '100%', height: '100%' }}
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 10.5212 11.8477"
              >
                <path d={svgPaths.p27fbac00} fill="#FF7564" />
              </svg>
            </div>
          </div>

          <div style={{ height: 18.43, overflow: 'hidden', position: 'relative', borderRadius: 5.266, flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 2.632, height: 18.43, alignItems: 'center' }}>
              {Array.from({ length: HEALTH_BAR_COUNT }, (_, i) => (
                <HealthBarSegment key={i} index={i} health={health} damaged={healthDamaged} />
              ))}
            </div>
          </div>
        </div>

        {/* Energy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5.266, alignItems: 'flex-start', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 10.532, alignItems: 'center', flexShrink: 0 }}>
            <motion.span
              key={energy}
              style={{
                fontFamily: 'var(--font-rr-gluten), cursive',
                fontWeight: 600,
                lineHeight: 1,
                color: '#fff7d3',
                fontSize: 31.6,
                width: 15.796,
                display: 'inline-block',
              }}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
            >
              {energy}
            </motion.span>
            <div style={{ height: 23.696, flexShrink: 0, width: 22.602, position: 'relative', top: -3 }}>
              <svg
                style={{ display: 'block', width: '100%', height: '100%' }}
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 11.301 11.8477"
              >
                <path d={svgPaths.p2e08b8a0} fill="#EBBB4C" />
              </svg>
            </div>
          </div>

          {/* Energy bar */}
          <div style={{ position: 'relative', width: 157.968, height: 13.164 }}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: '#f3f3f3',
                maskImage: `url("${imgRectangle145}")`,
                WebkitMaskImage: `url("${imgRectangle145}")`,
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskSize: '157.968px 13.156px',
                WebkitMaskSize: '157.968px 13.156px',
              }}
            />
            <motion.div
              style={{
                position: 'absolute',
                top: 0.18,
                left: 0,
                height: 13.164,
                backgroundImage: 'linear-gradient(to bottom, #7af3a4, #478d5f)',
                borderRadius: 2.632,
                maskImage: `url("${imgRectangle145}")`,
                WebkitMaskImage: `url("${imgRectangle145}")`,
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: '0px -0.188px',
                WebkitMaskPosition: '0px -0.188px',
                maskSize: '157.968px 13.156px',
                WebkitMaskSize: '157.968px 13.156px',
              }}
              animate={{ width: `${energyBarWidthPct}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
