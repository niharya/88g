'use client'

import { useState, useEffect, useRef } from 'react'
import { StatsPanel } from './StatsPanel'
import { CardPanel, type CardPhase } from './CardPanel'
import { gluten, playpen } from './fonts'
import './rr-interface.css'

const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))

const STARTING_HEALTH = 31
const STARTING_ENERGY = 5
const SHIELD = 4
const ENERGY_COST = 2
const DAMAGE = 4

type SceneProps = {
  /** Pause the autoplay loop. The showcase pauses non-active tiles when any tile is focused. */
  paused?: boolean
}

/**
 * Rug Rumble battle interface — autoplay scene.
 * Native canvas is 548 × 560 px (doubled from the Figma 1× export so we
 * don't need a runtime scale wrapper). The host tile scales the canvas
 * to fit via the `.sc-rr-scene` container — see rr-interface.css.
 */
export default function Scene({ paused = false }: SceneProps) {
  const [health, setHealth] = useState(STARTING_HEALTH)
  const [energy, setEnergy] = useState(STARTING_ENERGY)
  const [healthDamaged, setHealthDamaged] = useState(false)
  const [healthNumberRed, setHealthNumberRed] = useState(false)
  const [showDamageFlash, setShowDamageFlash] = useState(false)
  const [cardPhase, setCardPhase] = useState<CardPhase>('idle')
  const [reducedMotion, setReducedMotion] = useState(false)

  const aliveRef = useRef(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (paused) return
    if (reducedMotion) {
      // Static idle pose — no autoplay loop, no idle bob (CardPanel reads
      // the same flag and skips the y keyframe for the 'idle' phase).
      setHealth(STARTING_HEALTH)
      setEnergy(STARTING_ENERGY)
      setHealthDamaged(false)
      setHealthNumberRed(false)
      setShowDamageFlash(false)
      setCardPhase('idle')
      return
    }

    aliveRef.current = true

    const run = async () => {
      while (aliveRef.current) {
        setHealth(STARTING_HEALTH)
        setEnergy(STARTING_ENERGY)
        setHealthDamaged(false)
        setHealthNumberRed(false)
        setShowDamageFlash(false)
        setCardPhase('idle')

        await sleep(2200)
        if (!aliveRef.current) break

        setCardPhase('pressing')
        setEnergy(STARTING_ENERGY - ENERGY_COST)
        setHealthDamaged(true)
        setHealthNumberRed(true)
        setShowDamageFlash(true)

        const tickHealth = async () => {
          for (let i = 0; i < DAMAGE; i++) {
            if (!aliveRef.current) return
            setHealth((h) => h - 1)
            await sleep(160)
          }
          setHealthNumberRed(false)
        }
        tickHealth()

        await sleep(120)
        if (!aliveRef.current) break

        setCardPhase('playing')
        setShowDamageFlash(false)

        await sleep(520)
        if (!aliveRef.current) break

        setCardPhase('gone')
        await sleep(200)
        setCardPhase('cooldown')

        await sleep(1500)
        if (!aliveRef.current) break

        setHealthDamaged(false)
        await sleep(80)

        for (let i = DAMAGE; i > 0; i--) {
          setHealth(STARTING_HEALTH - i + 1)
          await sleep(60)
          if (!aliveRef.current) break
        }
        setEnergy(STARTING_ENERGY - ENERGY_COST + 1)
        await sleep(70)
        setEnergy(STARTING_ENERGY)

        await sleep(500)
        if (!aliveRef.current) break

        setCardPhase('resurrecting')
        await sleep(800)
        if (!aliveRef.current) break

        setCardPhase('idle')
        await sleep(400)
      }
    }

    run()
    return () => {
      aliveRef.current = false
    }
  }, [paused, reducedMotion])

  return (
    <div className={`sc-rr-scene ${gluten.variable} ${playpen.variable}`}>
      <div className="sc-rr-scene__canvas">
        <StatsPanel
          health={health}
          energy={energy}
          shield={SHIELD}
          healthDamaged={healthDamaged}
          healthNumberRed={healthNumberRed}
          showDamageFlash={showDamageFlash}
        />
        <CardPanel phase={cardPhase} reducedMotion={reducedMotion} />
      </div>
    </div>
  )
}
