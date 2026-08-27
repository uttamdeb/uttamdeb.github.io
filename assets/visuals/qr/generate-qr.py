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
KNOCK_R = 5.3   # radius (in modules) cleared for the monogram badge
BADGE_R = 4.40  # the white badge drawn in that clearing
R = 0.46        # dot radius, in modules
BANDS = 20      # diagonal groups the reveal wave travels through
HERE = os.path.dirname(os.path.abspath(__file__))

# Error correction H: the centre knockout destroys ~7% of the symbol, and only
# H's redundancy makes that safe.
qr = segno.make(URL, error="h", micro=False)
matrix = [bytearray(row) for row in qr.matrix]
n = len(matrix)
mid_mod = (n - 1) / 2
cleared = 0
for r in range(n):
    for c in range(n):
        if math.hypot(c - mid_mod, r - mid_mod) <= KNOCK_R and matrix[r][c]:
            matrix[r][c] = 0
            cleared += 1
assert mid_mod - KNOCK_R > 8 and mid_mod + KNOCK_R < n - 8, "knockout reaches a function pattern"
print(f"version={qr.version} ecc={qr.error} {n}x{n} modules, "
      f"circular knockout r={KNOCK_R} ({cleared} modules, {cleared / (n * n):.1%})")

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

# "UD" set in Instrument Serif Italic — the face the site already uses for its
# editorial accents — converted to outlines so the mark is identical everywhere
# and needs no webfont. Baked at cap height 5.0, tracking -0.25, ink-centred on
# (20.5, 20.5) in the 41-unit viewBox. The transform is baked into the
# coordinates rather than applied with a <g transform>, because a wrapper would
# also transform the userSpaceOnUse gradient.
#
# To re-derive (needs `pip install fonttools` and the Instrument Serif Italic
# TTF from Google Fonts), see the recipe in DESIGN.md.
MONOGRAM = ("M18.231 23.031Q17.856 23.031 17.593 22.854Q17.329 22.677 17.221 22.361Q17.113 22.045 17.211 21.635L17.954 18.427Q17.988 18.281 17.954 18.233Q17.919 18.184 17.78 18.156L17.641 18.128Q17.551 18.108 17.551 18.052Q17.551 17.969 17.676 17.969H18.926Q19.023 17.969 19.023 18.038Q19.023 18.115 18.926 18.128L18.731 18.156Q18.586 18.177 18.527 18.233Q18.468 18.288 18.433 18.434L17.69 21.642Q17.565 22.17 17.763 22.462Q17.961 22.753 18.377 22.753Q18.829 22.753 19.106 22.462Q19.384 22.17 19.502 21.642L20.211 18.573Q20.301 18.184 20.072 18.156L19.919 18.135Q19.822 18.122 19.822 18.052Q19.822 18.01 19.863 17.99Q19.905 17.969 19.954 17.969H20.954Q21.044 17.969 21.044 18.038Q21.044 18.108 20.933 18.128L20.766 18.156Q20.523 18.198 20.433 18.566L19.724 21.635Q19.579 22.267 19.197 22.649Q18.815 23.031 18.231 23.031ZM19.995 22.969Q19.898 22.969 19.898 22.899Q19.898 22.823 20.037 22.802L20.176 22.781Q20.329 22.76 20.388 22.708Q20.447 22.656 20.474 22.51L21.419 18.427Q21.454 18.281 21.419 18.233Q21.384 18.184 21.245 18.156L21.106 18.128Q21.016 18.108 21.016 18.052Q21.016 17.969 21.141 17.969H22.537Q23.134 17.969 23.485 18.41Q23.836 18.851 23.836 19.719Q23.836 20.358 23.634 20.944Q23.433 21.531 23.093 21.986Q22.752 22.441 22.318 22.705Q21.884 22.969 21.412 22.969ZM21.447 22.788Q21.843 22.788 22.19 22.497Q22.537 22.205 22.801 21.701Q23.065 21.198 23.214 20.566Q23.363 19.934 23.363 19.26Q23.363 18.705 23.134 18.427Q22.905 18.149 22.495 18.149Q21.974 18.149 21.856 18.656L21.023 22.281Q20.961 22.559 21.075 22.674Q21.19 22.788 21.447 22.788Z")

# ---- geometry -------------------------------------------------------------
span = n + QUIET * 2
mid = span / 2
# Banded along the top-left -> bottom-right diagonal, the same axis the colour
# gradient runs on, so the reveal wave and the colour travel together.
dots = [(c, r, c + r)
        for r in range(n) for c in range(n)
        if matrix[r][c] and not in_finder(r, c)]
dmin = min(d for _, _, d in dots)
dmax = max(d for _, _, d in dots)

banded = [[] for _ in range(BANDS)]
for c, r, dist in dots:
    i = min(BANDS - 1, int((dist - dmin) / (dmax - dmin + 1e-9) * BANDS))
    banded[i].append(f'<circle cx="{c + QUIET + 0.5}" cy="{r + QUIET + 0.5}" r="{R}"/>')


def eye(fc, fr, animated=False):
    """pathLength="100" lets CSS draw the ring with a plain dashoffset animation
    without anyone having to know its real perimeter."""
    x, y = fc + QUIET, fr + QUIET
    ring_cls = ' class="qr-eye-ring"' if animated else ''
    core_cls = ' class="qr-eye-core"' if animated else ''
    return (f'<rect{ring_cls} x="{x + .5}" y="{y + .5}" width="6" height="6" rx="1.9" '
            f'pathLength="100" fill="none" stroke="url(#g)" stroke-width="1"/>'
            f'<rect{core_cls} x="{x + 2}" y="{y + 2}" width="3" height="3" rx="1.05" fill="url(#g)"/>')


# The gradient vector is pulled inward: on a 45-degree gradient across a square
# the last stop only lands in the far corner, which is sparse in this symbol,
# so the warm end would never be visible.
DEFS = f'''<defs>
<linearGradient id="g" gradientUnits="userSpaceOnUse" x1="{QUIET + 4}" y1="{QUIET + 4}" x2="{QUIET + n - 6}" y2="{QUIET + n - 6}">
<stop offset="0" stop-color="#2450d6"/><stop offset=".40" stop-color="#1a63a8"/><stop offset=".68" stop-color="#0f6a55"/><stop offset="1" stop-color="#8a5a23"/>
</linearGradient>
</defs>'''

assert span == 41, "MONOGRAM is baked for a 41-unit viewBox; re-derive it if that changes"


def mark(animated=False):
    ring_cls = ' class="qr-mark-ring"' if animated else ''
    glyph_cls = ' class="qr-mark-glyph"' if animated else ''
    return (f'<circle{ring_cls} cx="{mid}" cy="{mid}" r="{BADGE_R}" fill="#ffffff" '
            f'stroke="url(#g)" stroke-width=".16" stroke-opacity=".45" pathLength="100"/>'
            f'<path{glyph_cls} d="{MONOGRAM}" fill="url(#g)"/>')

standalone = (
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {span} {span}" '
    f'width="{span * 24}" height="{span * 24}" role="img" '
    f'aria-label="QR code linking to uttamdeb.com/details">'
    f'<title>Uttam Deb - uttamdeb.com/details</title>{DEFS}'
    f'<rect width="{span}" height="{span}" fill="#ffffff"/>'
    f'<g fill="url(#g)">{"".join("".join(b) for b in banded)}</g>'
    f'{"".join(eye(fc, fr) for fc, fr in FINDERS)}{mark()}</svg>\n')
with open(os.path.join(HERE, "uttamdeb-details-qr.svg"), "w") as fh:
    fh.write(standalone)

lines = [f'<svg class="qr-svg" viewBox="0 0 {span} {span}" xmlns="http://www.w3.org/2000/svg" '
         f'role="img" aria-label="QR code linking to uttamdeb.com/details">',
         DEFS, f'<rect width="{span}" height="{span}" fill="#ffffff"/>',
         '<g class="qr-dots" fill="url(#g)">']
lines += [f'<g class="qr-band" style="--i:{i}">{"".join(band)}</g>' for i, band in enumerate(banded)]
lines.append('</g>')
lines += [f'<g class="qr-eye" style="--i:{i}">{eye(fc, fr, True)}</g>' for i, (fc, fr) in enumerate(FINDERS)]
lines.append(f'<g class="qr-mark">{mark(True)}</g>')
lines.append('</svg>')
with open(os.path.join(HERE, "qr-inline.svg"), "w") as fh:
    fh.write("\n".join(lines) + "\n")

print(f"wrote uttamdeb-details-qr.svg and qr-inline.svg "
      f"({sum(len(b) for b in banded)} dots in {BANDS} bands)")
print("paste qr-inline.svg into scan-me.html, replacing the <svg class=\"qr-svg\"> block")
