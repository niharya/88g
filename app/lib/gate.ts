// Page-gate timing — single source of truth for the cold-load gate ceiling.
//
// The gate releases when BOTH window.load (the JS bundle + subresources) AND
// `document.fonts.ready` settle (the inline script in app/layout.tsx). It holds
// for window.load because page content reveals via a client hook (useReveal)
// that can't fire until React hydrates — releasing earlier would show an empty
// surface while content waits. Below-the-fold images stay lazy (<Img> LQIP
// blur), so this isn't waiting on them. This cap is the failsafe ceiling, for
// the rare case where an asset never resolves.
//
// Consumed by: the inline gate script (interpolated into <head>), useReveal's
// section-reveal failsafe, and mirrored in CSS as `--dur-gate-cap` in
// globals.css (the JS half and the CSS half of one ceiling — keep in sync).
export const GATE_CAP_MS = 8000

// useReveal proceeds just past the CSS failsafe so that, on the JS-fail path
// (gate released by CSS at the cap WITHOUT the class), sections never strand
// at opacity:0.
export const GATE_FAILSAFE_MS = GATE_CAP_MS + 500
