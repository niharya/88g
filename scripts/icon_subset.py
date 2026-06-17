#!/usr/bin/env python3
"""Build the Material Symbols subset font from the icon registry.

Single source of truth: app/lib/icons.ts (ICON_NAMES). This reads that list,
resolves each ligature name to its glyph in the kept source font, and writes a
minimal woff2 subset (closure OFF, so the ligature set doesn't drag in the full
3,200-icon library) plus a manifest recording exactly what was baked in.

The subset must be rebuilt whenever ICON_NAMES changes. scripts/check-icons.mjs
(pure Node — no font tooling, so the pre-push hook stays dependency-light)
compares the manifest to ICON_NAMES and fails the push if they diverge.

Requires fontTools + brotli. Run via `npm run icons` (or directly with a Python
that has fontTools installed: `pip install fonttools brotli`).
"""
import json
import re
import sys
from pathlib import Path

try:
    from fontTools.ttLib import TTFont
    from fontTools.subset import Subsetter, Options
except ImportError:
    sys.exit("icon_subset: fontTools not found — `pip install fonttools brotli`")

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "scripts" / "material-symbols-source.woff2"
OUT = ROOT / "app" / "fonts" / "MaterialSymbolsRounded-subset.woff2"
MANIFEST = ROOT / "app" / "fonts" / "icon-manifest.json"
ICONS_TS = ROOT / "app" / "lib" / "icons.ts"


def read_icon_names():
    txt = ICONS_TS.read_text()
    m = re.search(r"ICON_NAMES\s*=\s*\[(.*?)\]\s*as const", txt, re.S)
    if not m:
        sys.exit("icon_subset: could not find ICON_NAMES in app/lib/icons.ts")
    return sorted(set(re.findall(r"'([a-z_]+)'", m.group(1))))


def resolve_glyphs(font, names):
    """ligature name (e.g. 'play_circle') -> glyph name. The icons have no
    codepoints in this distribution, so they're reachable only via GSUB."""
    gsub = font["GSUB"].table
    c2g = {chr(cp): n for t in font["cmap"].tables for cp, n in t.cmap.items()}
    ligs = {}
    for lk in gsub.LookupList.Lookup:
        for st in lk.SubTable:
            st = st.ExtSubTable if getattr(st, "ExtSubTable", None) else st
            for first, ll in (getattr(st, "ligatures", {}) or {}).items():
                for lig in ll:
                    ligs[(first,) + tuple(lig.Component)] = lig.LigGlyph
    resolved = {}
    for n in names:
        try:
            seq = tuple(c2g[c] for c in n)
        except KeyError as e:
            sys.exit(f"icon_subset: '{n}' uses a letter {e} not in the source font")
        g = ligs.get(seq)
        if not g:
            sys.exit(f"icon_subset: '{n}' has no ligature in the source font "
                     "(typo, or not a Material Symbols Rounded name?)")
        resolved[n] = g
    return resolved


def main():
    names = read_icon_names()
    if not SRC.exists():
        sys.exit(f"icon_subset: source font missing at {SRC.relative_to(ROOT)}")
    font = TTFont(SRC)
    glyphs = resolve_glyphs(font, names)

    opts = Options()
    opts.flavor = "woff2"
    opts.layout_closure = False
    opts.layout_features += ["liga", "dlig", "rlig", "calt", "ccmp"]
    ss = Subsetter(options=opts)
    ss.populate(glyphs=list(glyphs.values()), text=" ".join(names))
    ss.subset(font)
    font.flavor = "woff2"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    font.save(OUT)

    MANIFEST.write_text(json.dumps({"icons": names}, indent=2) + "\n")
    print(f"icon_subset: {len(names)} icons -> {OUT.stat().st_size} bytes "
          f"({OUT.relative_to(ROOT)})")
    print(f"icon_subset: wrote manifest {MANIFEST.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
