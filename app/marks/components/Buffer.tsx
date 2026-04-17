// Buffer — fade-to-black reel cut.
//
// Layout of the 80vh buffer (from MARKS_BRIEF.md):
//   • ~25vh — Mark 6 gradient fades to pure black
//   • ~30vh — pure black with slow noise drift
//   • ~25vh — black fades into Hero's gradient
//
// The silent scroll-shift reset (useInfiniteLoop) fires inside this region
// during chunk 13, so the fade-to-black visually masks any frame-level
// imperfection in the jump.

export default function Buffer() {
  return <section className="marks-buffer" aria-hidden="true" />
}
