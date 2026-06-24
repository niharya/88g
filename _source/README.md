# `_source/` — raster masters

This tree holds the original PNG/JPEG masters for everything under `public/images/`.
It lives at the repo root, **outside** `public/`, so Next.js never serves these
files. Visitors only ever fetch the compressed `.webp` derivatives under
`public/images/`.

## How to add an image

1. Drop the PNG (or JPEG) under `_source/images/<route>/...`, mirroring the
   target layout under `public/images/<route>/...`.
2. Decide the **tier** by picking the folder name. The pipeline reads the path
   convention to pick the encoder:

   | Path contains | Tier             | Encoder                                                          |
   |---------------|------------------|------------------------------------------------------------------|
   | `/_photos/`   | lossy            | `sharp.webp({ quality: 88, effort: 6, smartSubsample: true })`   |
   | `/_diagrams/` | full lossless    | `sharp.webp({ lossless: true, effort: 6 })`                      |
   | _(anything else)_ | **near-lossless** _(default)_ | `sharp.webp({ nearLossless: true, quality: 60, effort: 6 })`     |

   The default is the screenshot tier: visually indistinguishable from full
   lossless on UI/text, ~½ the file size. Reach for `_diagrams/` only when
   you're encoding a large flat-colour field where near-lossless can band.

3. **Resolution rule.** Source rasters are **@2× by default, @3× for
   patterns / illustrations / fine UI artwork, never @4×.** The `<Img>`
   primitive + `next/image` handle the density `srcset` automatically — but
   only if the source has the pixels. Worked example: a 3-col tile in
   `/selected` renders 413 px wide on desktop. 2× source ≥ 826 px wide;
   3× source ≥ 1239 px wide. Don't downscale exports. Picking the multiplier:

   | Multiplier | Use for                                                    | Why                                                       |
   |------------|------------------------------------------------------------|-----------------------------------------------------------|
   | **2×**     | Photos, hero shots, anything the eye reads as a subject    | Crisp on DPR=2 Retina; the ~1.3× upscale on iPhone Pro DPR=3 reads invisibly on photographic content |
   | **3×**     | Patterns, illustrations, brand marks, fine UI artwork      | Gives DPR=3 phones a true ~1080-class variant where edges actually read |
   | **4×**     | Never                                                      | No mainstream DPR is above 3, and `images.deviceSizes` doesn't have a srcset entry that would consume the extra pixels — bloat with no payoff |
4. Run `npm run optimize-images`. The script walks `_source/images/`, picks
   the encoder by path, and writes the `.webp` under `public/images/`,
   mirroring the directory structure. Sources stay here for re-encoding.
5. Run `npm run lqip` (or just `npm run build` — it runs as `prebuild`) to
   regenerate the LQIP + dimension manifest so `<Img>` knows the new asset.
6. Author your `<Img src="/images/.../foo.webp" sizes="..." />` consumer.
   The `quality` prop is automatic: lossless / near-lossless sources serve
   at `q100`, lossy sources at `q90`. Override with `quality={…}` only when
   you have a reason.

## Why source masters live in the repo

- Re-encoding when `next/image` gains a better format (or when you decide
  the screenshot tier should be full lossless after all) requires the master,
  not the already-compressed `.webp` derivative.
- Encoders improve; a master committed today still pays off in two years.

## Scope

This tree retains masters for raster assets that are **not** trivially
re-exportable. Figma exports don't need to live here — re-export from the
Figma file when you need to re-encode. Photographs, externally-authored
artwork, and screenshots from contexts that change (a UI you no longer have
access to, a one-shot capture) do live here.

## Not served

`_source/` is at the repo root, not under `public/`. Next.js only serves files
under `public/`, so nothing here ever reaches a visitor's browser, a crawler,
or your deploy bundle.
