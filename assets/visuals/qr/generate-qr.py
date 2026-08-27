#!/usr/bin/env python3
"""Regenerate the /scan-me QR code.

This is an offline one-off, NOT part of the site build — the site stays static
with no build step. Run it only when the encoded URL or the code's styling
needs to change, then paste the inline fragment into scan-me.html.

    pip install segno            # required
    pip install opencv-python numpy   # optional, enables the decode check
    python3 assets/visuals/qr/generate-qr.py

Writes:
    uttamdeb-details-qr.svg   the standalone code (printing, stickers, sharing)
    qr-inline.svg             the same code with dots grouped into concentric
                              bands, for pasting into scan-me.html as the
                              <svg class="qr-svg"> block that powers the bloom

Two things that are easy to get wrong, both learned the hard way:

  * Draw the dots as real <circle> elements. A <use> shadow tree is translated
    by its x/y, so a userSpaceOnUse gradient resolves at the same local point
    for every instance and every dot paints the first stop.
  * Rounded finder patterns are fine. OpenCV's detector rejects them, but Apple
    Vision (iOS camera) and ZXing (Android) decode them at every size. Do not
    "fix" the rounding on OpenCV's say-so.
"""
import math
import os

import segno

URL = "https://uttamdeb.com/details"
QUIET = 4       # quiet-zone modules baked into the SVG (spec minimum)
KNOCK = 9       # centre modules cleared for the monogram tile
R = 0.46        # dot radius, in modules
BANDS = 14      # concentric groups the bloom animates through
HERE = os.path.dirname(os.path.abspath(__file__))

# Error correction H: the centre knockout destroys ~7% of the symbol, and only
# H's redundancy makes that safe.
qr = segno.make(URL, error="h", micro=False)
matrix = [bytearray(row) for row in qr.matrix]
n = len(matrix)
lo = (n - KNOCK) // 2
for r in range(lo, lo + KNOCK):
    for c in range(lo, lo + KNOCK):
        matrix[r][c] = 0
assert lo > 8 and lo + KNOCK < n - 8, "knockout overlaps a function pattern"
print(f"version={qr.version} ecc={qr.error} {n}x{n} modules, "
      f"knockout {KNOCK}x{KNOCK} ({KNOCK * KNOCK / (n * n):.1%})")

FINDERS = [(0, 0), (n - 7, 0), (0, n - 7)]


def in_finder(row, col):
    return any(fr <= row < fr + 7 and fc <= col < fc + 7 for fc, fr in FINDERS)


# ---- optional decode check ------------------------------------------------
try:
    import cv2
    import numpy as np

    SS = 6  # supersample then INTER_AREA, so the check sees real antialiasing
    def render(scale, border=4):
        S = scale * SS
        size = (n + border * 2) * S
        img = np.full((size, size), 255, np.uint8)
        for r in range(n):
            for c in range(n):
                if matrix[r][c] and not in_finder(r, c):
                    cv2.circle(img, (int((c + border + .5) * S), int((r + border + .5) * S)),
                               int(round(R * S)), 0, -1, lineType=cv2.LINE_AA)
        for fc, fr in FINDERS:
            x0, y0 = (fc + border) * S, (fr + border) * S
            cv2.rectangle(img, (x0, y0), (x0 + 7 * S, y0 + 7 * S), 0, -1)
            cv2.rectangle(img, (x0 + S, y0 + S), (x0 + 6 * S, y0 + 6 * S), 255, -1)
            cv2.rectangle(img, (x0 + 2 * S, y0 + 2 * S), (x0 + 5 * S, y0 + 5 * S), 0, -1)
        out = (n + border * 2) * scale
        return cv2.resize(img, (out, out), interpolation=cv2.INTER_AREA)

    det = cv2.QRCodeDetector()
    # square eyes here on purpose: this only proves the DATA survived the
    # knockout. Rounded-eye rendering is verified with Apple Vision / ZXing.
    for s in (4, 8, 20):
        data, _, _ = det.detectAndDecode(render(s))
        assert data == URL, f"data check failed at {s}px/module: {data!r}"
    print("decode check: payload intact after the knockout")
except ImportError:
    print("decode check: skipped (opencv/numpy not installed)")

# ---- geometry -------------------------------------------------------------
span = n + QUIET * 2
mid = span / 2
centre = (n - 1) / 2

dots = [(c, r, math.hypot(c - centre, r - centre))
        for r in range(n) for c in range(n)
        if matrix[r][c] and not in_finder(r, c)]
dmin = min(d for _, _, d in dots)
dmax = max(d for _, _, d in dots)

banded = [[] for _ in range(BANDS)]
for c, r, dist in dots:
    i = min(BANDS - 1, int((dist - dmin) / (dmax - dmin + 1e-9) * BANDS))
    banded[i].append(f'<circle cx="{c + QUIET + 0.5}" cy="{r + QUIET + 0.5}" r="{R}"/>')


def eye(fc, fr):
    x, y = fc + QUIET, fr + QUIET
    return (f'<rect x="{x + .5}" y="{y + .5}" width="6" height="6" rx="1.9" '
            f'fill="none" stroke="url(#g)" stroke-width="1"/>'
            f'<rect x="{x + 2}" y="{y + 2}" width="3" height="3" rx="1.05" fill="url(#g)"/>')


# The gradient vector is pulled inward: on a 45-degree gradient across a square
# the last stop only lands in the far corner, which is sparse in this symbol,
# so the warm end would never be visible.
DEFS = f'''<defs>
<linearGradient id="g" gradientUnits="userSpaceOnUse" x1="{QUIET + 4}" y1="{QUIET + 4}" x2="{QUIET + n - 6}" y2="{QUIET + n - 6}">
<stop offset="0" stop-color="#2450d6"/><stop offset=".40" stop-color="#1a63a8"/><stop offset=".68" stop-color="#0f6a55"/><stop offset="1" stop-color="#8a5a23"/>
</linearGradient>
</defs>'''

tile = lo + QUIET - 0.7
MARK = (f'<rect x="{tile:.2f}" y="{tile:.2f}" width="{KNOCK}" height="{KNOCK}" rx="2.4" '
        f'fill="#ffffff" stroke="url(#g)" stroke-width=".26"/>'
        f'<text x="{mid}" y="{mid}" text-anchor="middle" dominant-baseline="central" '
        f'font-family="Newsreader, Georgia, \'Times New Roman\', serif" font-size="4.0" '
        f'font-weight="500" letter-spacing=".12" fill="url(#g)">UD</text>')

standalone = (
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {span} {span}" '
    f'width="{span * 24}" height="{span * 24}" role="img" '
    f'aria-label="QR code linking to uttamdeb.com/details">'
    f'<title>Uttam Deb - uttamdeb.com/details</title>{DEFS}'
    f'<rect width="{span}" height="{span}" fill="#ffffff"/>'
    f'<g fill="url(#g)">{"".join("".join(b) for b in banded)}</g>'
    f'{"".join(eye(fc, fr) for fc, fr in FINDERS)}{MARK}</svg>\n')
with open(os.path.join(HERE, "uttamdeb-details-qr.svg"), "w") as fh:
    fh.write(standalone)

lines = [f'<svg class="qr-svg" viewBox="0 0 {span} {span}" xmlns="http://www.w3.org/2000/svg" '
         f'role="img" aria-label="QR code linking to uttamdeb.com/details">',
         DEFS, f'<rect width="{span}" height="{span}" fill="#ffffff"/>',
         '<g class="qr-dots" fill="url(#g)">']
lines += [f'<g class="qr-band" style="--i:{i}">{"".join(band)}</g>' for i, band in enumerate(banded)]
lines.append('</g>')
lines += [f'<g class="qr-eye" style="--i:{i}">{eye(fc, fr)}</g>' for i, (fc, fr) in enumerate(FINDERS)]
lines.append(f'<g class="qr-mark">{MARK}</g>')
lines.append('</svg>')
with open(os.path.join(HERE, "qr-inline.svg"), "w") as fh:
    fh.write("\n".join(lines) + "\n")

print(f"wrote uttamdeb-details-qr.svg and qr-inline.svg "
      f"({sum(len(b) for b in banded)} dots in {BANDS} bands)")
print("paste qr-inline.svg into scan-me.html, replacing the <svg class=\"qr-svg\"> block")
