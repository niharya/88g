// Hero — 100vh title spacer.
//
// The title itself is rendered by `MarksTitle.tsx` as a persistent `h1`
// driven by scrollY, so the same element smoothly scales from the big Hero
// moment (120px, ~37vh) into the docked pill (24px, top: 26px) as the user
// scrolls. Hero stays as a structural 100vh spacer so the scroll distance
// exists for the docked-title interpolation to consume.

export default function Hero() {
  return <section className="marks-hero" aria-label="Marks & Symbols" />
}
