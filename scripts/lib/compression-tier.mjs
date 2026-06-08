// Single source of truth for the per-asset compression tier.
//
// Both the optimizer (`scripts/optimize-images.mjs`) and the manifest
// generator (`scripts/generate-image-manifest.mjs`) call into this util so
// the encoder choice at intake and the `lossless` flag emitted into the
// manifest can never disagree. The Img primitive then reads that flag and
// drives `next/image`'s `quality` prop end-to-end — lossless source → q100,
// lossy source → q90 — so the two compression layers (intake + serve) are
// coordinated automatically with no per-consumer discipline.
//
// Tier is picked by FOLDER CONVENTION on the asset's path. Convention beats
// per-file flags: no sidecar JSON, no `.tier` markers, no histogram sniffing.
// Contributors choose the tier by where they drop the source file.
//
// The path argument can be any POSIX-style path string — absolute or
// relative, with forward slashes — as long as it contains the directory
// segments. Both consumers pass an absolute path; the matching is on
// `/_photos/` and `/_diagrams/` substrings.

export const TIER_LOSSY = 'lossy'
export const TIER_LOSSLESS = 'lossless'
export const TIER_NEAR_LOSSLESS = 'near-lossless'

/**
 * Return the compression tier for a source asset based on its path.
 *
 * - `/_photos/` anywhere in the path → lossy (photos, rich gradients)
 * - `/_diagrams/` anywhere in the path → full lossless (big flat fields
 *   where near-lossless can introduce faint banding)
 * - everything else → near-lossless (the default UI / screenshot tier;
 *   visually identical to full lossless on text + edges at ~½ the size)
 *
 * @param {string} absPath - posix-style path string containing the file
 * @returns {'lossless' | 'near-lossless' | 'lossy'}
 */
export function inferTier(absPath) {
  const p = absPath.replace(/\\/g, '/')
  if (p.includes('/_photos/')) return TIER_LOSSY
  if (p.includes('/_diagrams/')) return TIER_LOSSLESS
  return TIER_NEAR_LOSSLESS
}

/**
 * Sharp `.webp({...})` options for a given tier. Mirror the docs in
 * `_source/README.md` — change in one place, propagate to both.
 *
 * @param {'lossless' | 'near-lossless' | 'lossy'} tier
 * @returns {object}
 */
export function sharpWebpOptionsForTier(tier) {
  switch (tier) {
    case TIER_LOSSLESS:
      return { lossless: true, effort: 6 }
    case TIER_NEAR_LOSSLESS:
      return { nearLossless: true, quality: 60, effort: 6 }
    case TIER_LOSSY:
      return { quality: 88, effort: 6, smartSubsample: true }
    default:
      throw new Error(`Unknown compression tier: ${tier}`)
  }
}

/**
 * "Crisp" = the source preserves edges / text losslessly (or near-so).
 * Drives the Img primitive's default `quality`:
 *   crisp → 100   (next/image won't smear what we shipped)
 *   not crisp (lossy photo) → 90
 *
 * @param {'lossless' | 'near-lossless' | 'lossy'} tier
 * @returns {boolean}
 */
export const tierIsCrisp = (tier) => tier !== TIER_LOSSY
