#!/usr/bin/env python3
"""Squint test: programmatic blur + salience-region metrics for a page screenshot.

Usage: python3 squint.py <screenshot.png> [--out DIR] [--radius N]

Produces in OUT (default: alongside input, <name>_squint/):
  <name>_blur.png       Gaussian blur, radius = 2% of image width (the "frosted glass")
  <name>_blur_gray.png  Same blur in grayscale (color removed: structure only)
  <name>_thumb.png      Downscaled to 64px wide (distance / peripheral view)
  <name>_metrics.json   Salience-region metrics (see below)

How the metrics work (all computed on the blurred image, downscaled to
160px wide so text strokes vanish and only large shapes remain):
  A pixel is "salient" if its luminance deviates from the page's mean
  luminance by >= 30 (dark blocks and bright blocks both count).
  Connected salient pixels form regions.
  hero_share       area of the largest region / total salient area.
                   >= 0.45: one dominant mass. < 0.30: salience is scattered.
  competing_foci   regions whose area >= 30% of the largest region's area.
                   1 = single focus; 2 = hero + one CTA (healthy);
                   >= 3 = competing foci ("everything shouts").
  focus_rows       vertical thirds (0=top,1=mid,2=bottom) containing the
                   centroids of the competing foci, in area order: the scan path.
  verdict_hint     PASS / WEAK / FAIL from the two numbers above.
                   This is a hint for the human checklist in SKILL.md,
                   never a substitute for it.
"""
import argparse, json, os
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

def label_regions(mask):
    """4-connectivity connected components on a boolean array. Returns list of (size, cy, cx)."""
    h, w = mask.shape
    seen = np.zeros_like(mask, dtype=bool)
    regions = []
    for y in range(h):
        for x in range(w):
            if mask[y, x] and not seen[y, x]:
                q = deque([(y, x)]); seen[y, x] = True
                size = 0; sy = 0; sx = 0
                while q:
                    cy, cx = q.popleft(); size += 1; sy += cy; sx += cx
                    for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
                        ny, nx = cy+dy, cx+dx
                        if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                            seen[ny, nx] = True; q.append((ny, nx))
                regions.append((size, sy/size, sx/size))
    return regions

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("image")
    ap.add_argument("--out", default=None)
    ap.add_argument("--radius", type=float, default=None, help="blur radius px; default 2%% of width")
    args = ap.parse_args()

    im = Image.open(args.image).convert("RGB")
    w, h = im.size
    radius = args.radius if args.radius else max(4.0, w * 0.02)
    base = os.path.splitext(os.path.basename(args.image))[0]
    outdir = args.out or os.path.join(os.path.dirname(os.path.abspath(args.image)), base + "_squint")
    os.makedirs(outdir, exist_ok=True)

    blur = im.filter(ImageFilter.GaussianBlur(radius))
    blur.save(os.path.join(outdir, base + "_blur.png"))
    gray = blur.convert("L")
    gray.convert("RGB").save(os.path.join(outdir, base + "_blur_gray.png"))
    thumb = im.resize((64, max(1, int(64 * h / w))), Image.LANCZOS)
    thumb.save(os.path.join(outdir, base + "_thumb.png"))

    small_w = 160
    small = gray.resize((small_w, max(1, int(small_w * h / w))), Image.LANCZOS)
    a = np.asarray(small, dtype=np.float64)
    mask = np.abs(a - a.mean()) >= 30
    regions = sorted(label_regions(mask), reverse=True)
    total = sum(r[0] for r in regions) or 1
    hero_share = round(regions[0][0] / total, 3) if regions else 0.0
    foci = [r for r in regions if r[0] >= 0.30 * regions[0][0]] if regions else []
    sh = a.shape[0]
    focus_rows = [min(2, int(r[1] / (sh / 3))) for r in foci]
    if len(foci) >= 3:
        verdict = "FAIL-competing-foci"
    elif foci and set(focus_rows) == {2}:
        verdict = "WEAK-cta-only-focus"  # the only mass is in the bottom third:
        # a loud button with no readable purpose above it
    elif len(foci) <= 2 and hero_share >= 0.30:
        verdict = "PASS"
    else:
        verdict = "WEAK-scattered-salience"
    metrics = {
        "source": os.path.abspath(args.image),
        "size": [w, h],
        "blur_radius_px": round(radius, 1),
        "salient_regions": len(regions),
        "hero_share": hero_share,
        "competing_foci": len(foci),
        "focus_rows_top_to_bottom": sorted(set(focus_rows)),
        "verdict_hint": verdict,
    }
    with open(os.path.join(outdir, base + "_metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2, ensure_ascii=False)
    print(json.dumps(metrics, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
