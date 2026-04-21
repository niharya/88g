import { thumbHashToDataURL } from 'thumbhash'
import { lqipSamples } from './samples.generated'
import { LqipGrid } from './LqipGrid'
import './lqip-lab.css'

export const metadata = { title: 'LQIP lab' }

export default function LqipLabPage() {
  const rows = lqipSamples.map((s) => {
    const bytes = Uint8Array.from(Buffer.from(s.thumbHash, 'base64'))
    const thumbHashDataUrl = thumbHashToDataURL(bytes)
    return { ...s, thumbHashDataUrl }
  })

  return (
    <main className="lqip-lab">
      <header className="lqip-lab__header">
        <h1>LQIP comparison</h1>
        <p>
          Three ways the same image can arrive. Click <em>reload all</em> to re-trigger
          the fetch. For the clearest read, open devtools → Network → throttle to
          &ldquo;Slow 3G&rdquo; before reloading.
        </p>
      </header>

      <LqipGrid rows={rows} />

      <footer className="lqip-lab__footer">
        <dl>
          <div>
            <dt>Raw</dt>
            <dd>Current behavior. Blank → image pops in when bytes arrive.</dd>
          </div>
          <div>
            <dt>Dominant color</dt>
            <dd>~20 bytes. A single hue derived from the image fills the reserved space. Image crossfades in over 500ms.</dd>
          </div>
          <div>
            <dt>ThumbHash</dt>
            <dd>~25 bytes. An abstract low-fi preview decoded from a short string. Image crossfades in over 500ms.</dd>
          </div>
        </dl>
      </footer>
    </main>
  )
}
