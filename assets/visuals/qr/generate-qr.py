#!/usr/bin/env python3
"""Regenerate the /scan-me QR codes.

An offline one-off, NOT part of the site build — the site stays static with no
build step. Run it when a payload or the styling changes, then paste the inline
fragments into scan-me.html.

    pip install segno                 # required
    pip install opencv-python numpy   # optional, enables the decode check
    python3 assets/visuals/qr/generate-qr.py

Two codes are produced:

  page     the default. Encodes the /details URL. This is the main experience
           and must not change without a very good reason.
  contact  the offline fallback, shown only when a reader says they have no
           connection. Encodes a lean vCard as text, so the phone offers "Add
           to Contacts" with no network involved at all. It carries the
           /details URL inside it, so the full card is still one tap away once
           they have signal.

Writes:
    uttamdeb-details-qr.svg   standalone page code (printing, stickers)
    uttamdeb-contact-qr.svg   standalone contact code
    qr-inline-page.svg        page code, banded, for pasting into scan-me.html
    qr-inline-contact.svg     contact code, banded, likewise

Things that are easy to get wrong, all learned the hard way:

  * Draw dots as real <circle> elements. A <use> shadow tree is translated by
    its x/y, so a userSpaceOnUse gradient resolves at the same local point for
    every instance and every dot paints the first stop.
  * Give each code its OWN gradient id. Both fragments live in one document, so
    a shared id="g" would make the second code resolve the first code's
    gradient, which is sized for a different viewBox.
  * Rounded finder patterns are fine. OpenCV's detector rejects them, but Apple
    Vision (iOS camera) and ZXing (Android) decode them at every size tested.
    Do not "fix" the rounding on OpenCV's say-so.
  * The monogram is baked per viewBox. Each code has its own path constant,
    sized so the badge covers the same fraction of the symbol in both.
"""
import math
import os

import segno

QUIET = 4        # quiet-zone modules baked into the SVG (spec minimum)
BADGE_FRAC = 5.3 / 33   # badge radius as a fraction of symbol width, both codes
R = 0.46         # dot radius, in modules
BANDS = 20       # diagonal groups the reveal wave travels through
HERE = os.path.dirname(os.path.abspath(__file__))

PAGE_URL = "https://uttamdeb.com/details"

# Lean on purpose: a QR tops out near 3KB and the full vCard is 29KB with its
# photo. Name, org, a short title, the two ways to reach him, and the URL so the
# full card follows once there is signal. "BI & AI Systems Developer" is the
# longest title that still fits in 77 modules.
CONTACT_VCARD = "\r\n".join([
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:Deb;Uttam;;;",
    "FN:Uttam Deb",
    "ORG:10 Minute School",
    "TITLE:BI & AI Systems Developer",
    "TEL;TYPE=CELL:+8801718067555",
    "EMAIL:uttamdeb670@gmail.com",
    "URL:" + PAGE_URL,
    "END:VCARD",
]) + "\r\n"

# "UD" in Instrument Serif Italic converted to outlines, so the mark needs no
# webfont and renders identically everywhere. The transform is baked into the
# coordinates rather than applied with a <g transform>, because a wrapper would
# also transform the userSpaceOnUse gradient. See DESIGN.md to re-derive.
MONOGRAM = {
    41: ("M18.231 23.031Q17.856 23.031 17.593 22.854Q17.329 22.677 17.221 22.361Q17.113 22.045 17.211 21.635L17.954 18.427Q17.988 18.281 17.954 18.233Q17.919 18.184 17.78 18.156L17.641 18.128Q17.551 18.108 17.551 18.052Q17.551 17.969 17.676 17.969H18.926Q19.023 17.969 19.023 18.038Q19.023 18.115 18.926 18.128L18.731 18.156Q18.586 18.177 18.527 18.233Q18.468 18.288 18.433 18.434L17.69 21.642Q17.565 22.17 17.763 22.462Q17.961 22.753 18.377 22.753Q18.829 22.753 19.106 22.462Q19.384 22.17 19.502 21.642L20.211 18.573Q20.301 18.184 20.072 18.156L19.919 18.135Q19.822 18.122 19.822 18.052Q19.822 18.01 19.863 17.99Q19.905 17.969 19.954 17.969H20.954Q21.044 17.969 21.044 18.038Q21.044 18.108 20.933 18.128L20.766 18.156Q20.523 18.198 20.433 18.566L19.724 21.635Q19.579 22.267 19.197 22.649Q18.815 23.031 18.231 23.031ZM19.995 22.969Q19.898 22.969 19.898 22.899Q19.898 22.823 20.037 22.802L20.176 22.781Q20.329 22.76 20.388 22.708Q20.447 22.656 20.474 22.51L21.419 18.427Q21.454 18.281 21.419 18.233Q21.384 18.184 21.245 18.156L21.106 18.128Q21.016 18.108 21.016 18.052Q21.016 17.969 21.141 17.969H22.537Q23.134 17.969 23.485 18.41Q23.836 18.851 23.836 19.719Q23.836 20.358 23.634 20.944Q23.433 21.531 23.093 21.986Q22.752 22.441 22.318 22.705Q21.884 22.969 21.412 22.969ZM21.447 22.788Q21.843 22.788 22.19 22.497Q22.537 22.205 22.801 21.701Q23.065 21.198 23.214 20.566Q23.363 19.934 23.363 19.26Q23.363 18.705 23.134 18.427Q22.905 18.149 22.495 18.149Q21.974 18.149 21.856 18.656L21.023 22.281Q20.961 22.559 21.075 22.674Q21.19 22.788 21.447 22.788Z"),
    85: ("M37.207 48.406Q36.332 48.406 35.716 47.993Q35.1 47.58 34.849 46.843Q34.598 46.105 34.825 45.149L36.558 37.663Q36.639 37.323 36.558 37.209Q36.477 37.096 36.153 37.031L35.829 36.966Q35.619 36.918 35.619 36.788Q35.619 36.594 35.91 36.594H38.827Q39.054 36.594 39.054 36.756Q39.054 36.934 38.827 36.966L38.373 37.031Q38.033 37.08 37.895 37.209Q37.758 37.339 37.677 37.679L35.943 45.166Q35.651 46.397 36.113 47.078Q36.575 47.758 37.547 47.758Q38.6 47.758 39.248 47.078Q39.896 46.397 40.172 45.166L41.825 38.003Q42.035 37.096 41.501 37.031L41.144 36.983Q40.917 36.95 40.917 36.788Q40.917 36.691 41.014 36.642Q41.112 36.594 41.225 36.594H43.558Q43.769 36.594 43.769 36.756Q43.769 36.918 43.51 36.966L43.121 37.031Q42.554 37.128 42.343 37.987L40.69 45.149Q40.35 46.624 39.459 47.515Q38.568 48.406 37.207 48.406ZM41.322 48.26Q41.095 48.26 41.095 48.098Q41.095 47.92 41.42 47.872L41.744 47.823Q42.1 47.774 42.238 47.653Q42.376 47.531 42.44 47.191L44.644 37.663Q44.725 37.323 44.644 37.209Q44.563 37.096 44.239 37.031L43.915 36.966Q43.704 36.918 43.704 36.788Q43.704 36.594 43.996 36.594H47.253Q48.646 36.594 49.465 37.623Q50.283 38.652 50.283 40.677Q50.283 42.168 49.813 43.537Q49.343 44.906 48.549 45.968Q47.755 47.029 46.742 47.645Q45.73 48.26 44.628 48.26ZM44.709 47.839Q45.633 47.839 46.443 47.159Q47.253 46.478 47.869 45.303Q48.484 44.128 48.833 42.654Q49.181 41.179 49.181 39.608Q49.181 38.311 48.646 37.663Q48.112 37.015 47.156 37.015Q45.94 37.015 45.665 38.198L43.72 46.656Q43.575 47.304 43.842 47.572Q44.109 47.839 44.709 47.839Z"),
}


def build(payload, ecc, name, grad_id):
    qr = segno.make(payload, error=ecc, micro=False)
    matrix = [bytearray(row) for row in qr.matrix]
    n = len(matrix)
    span = n + QUIET * 2
    mid_mod = (n - 1) / 2
    knock_r = BADGE_FRAC * n
    badge_r = knock_r * (4.40 / 5.3)

    cleared = 0
    for r in range(n):
        for c in range(n):
            if math.hypot(c - mid_mod, r - mid_mod) <= knock_r and matrix[r][c]:
                matrix[r][c] = 0
                cleared += 1
    assert mid_mod - knock_r > 8 and mid_mod + knock_r < n - 8, "knockout reaches a function pattern"
    assert span in MONOGRAM, f"no monogram baked for a {span}-unit viewBox"

    finders = [(0, 0), (n - 7, 0), (0, n - 7)]

    def in_finder(row, col):
        return any(fr <= row < fr + 7 and fc <= col < fc + 7 for fc, fr in finders)

    print(f"  {name:8} {len(payload):>4}B  ecc={qr.error} v{qr.version} {n}x{n} modules, "
          f"badge r={knock_r:.1f} ({cleared / (n * n):.1%} cleared)")

    # Banded along the top-left -> bottom-right diagonal, the same axis the
    # colour gradient runs on, so the reveal wave and the colour travel together.
    dots = [(c, r, c + r) for r in range(n) for c in range(n)
            if matrix[r][c] and not in_finder(r, c)]
    dmin = min(d for _, _, d in dots)
    dmax = max(d for _, _, d in dots)
    banded = [[] for _ in range(BANDS)]
    for c, r, dist in dots:
        i = min(BANDS - 1, int((dist - dmin) / (dmax - dmin + 1e-9) * BANDS))
        banded[i].append(f'<circle cx="{c + QUIET + 0.5}" cy="{r + QUIET + 0.5}" r="{R}"/>')

    def eye(fc, fr, animated=False):
        """pathLength="100" lets CSS draw the ring with a plain dashoffset
        animation without anyone having to know its real perimeter."""
        x, y = fc + QUIET, fr + QUIET
        ring = ' class="qr-eye-ring"' if animated else ''
        core = ' class="qr-eye-core"' if animated else ''
        return (f'<rect{ring} x="{x + .5}" y="{y + .5}" width="6" height="6" rx="1.9" '
                f'pathLength="100" fill="none" stroke="url(#{grad_id})" stroke-width="1"/>'
                f'<rect{core} x="{x + 2}" y="{y + 2}" width="3" height="3" rx="1.05" fill="url(#{grad_id})"/>')

    def mark(animated=False):
        ring = ' class="qr-mark-ring"' if animated else ''
        glyph = ' class="qr-mark-glyph"' if animated else ''
        return (f'<circle{ring} cx="{span / 2}" cy="{span / 2}" r="{badge_r:.2f}" fill="#ffffff" '
                f'stroke="url(#{grad_id})" stroke-width="{0.16 * n / 33:.2f}" stroke-opacity=".45" pathLength="100"/>'
                f'<path{glyph} d="{MONOGRAM[span]}" fill="url(#{grad_id})"/>')

    # The gradient vector is pulled inward: on a 45-degree gradient across a
    # square the last stop only lands in the far corner, which is sparse, so the
    # warm end would never be visible.
    inset = 4 * n / 33
    defs = (f'<defs>\n<linearGradient id="{grad_id}" gradientUnits="userSpaceOnUse" '
            f'x1="{QUIET + inset:.1f}" y1="{QUIET + inset:.1f}" '
            f'x2="{QUIET + n - inset * 1.5:.1f}" y2="{QUIET + n - inset * 1.5:.1f}">\n'
            f'<stop offset="0" stop-color="#2450d6"/><stop offset=".40" stop-color="#1a63a8"/>'
            f'<stop offset=".68" stop-color="#0f6a55"/><stop offset="1" stop-color="#8a5a23"/>\n'
            f'</linearGradient>\n</defs>')

    standalone = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {span} {span}" '
        f'width="{span * 12}" height="{span * 12}" role="img" '
        f'aria-label="{"QR code linking to uttamdeb.com/details" if name == "page" else "QR code containing Uttam Deb contact details"}">'
        f'<title>Uttam Deb - {"uttamdeb.com/details" if name == "page" else "contact card"}</title>{defs}'
        f'<rect width="{span}" height="{span}" fill="#ffffff"/>'
        f'<g fill="url(#{grad_id})">{"".join("".join(b) for b in banded)}</g>'
        f'{"".join(eye(fc, fr) for fc, fr in finders)}{mark()}</svg>\n')

    label = ("QR code linking to uttamdeb.com/details" if name == "page"
             else "QR code containing Uttam Deb's contact details, readable without an internet connection")
    lines = [f'<svg class="qr-svg" viewBox="0 0 {span} {span}" xmlns="http://www.w3.org/2000/svg" '
             f'role="img" aria-label="{label}">',
             defs, f'<rect width="{span}" height="{span}" fill="#ffffff"/>',
             '<g class="qr-dots" fill="url(#' + grad_id + ')">']
    lines += [f'<g class="qr-band" style="--i:{i}">{"".join(band)}</g>' for i, band in enumerate(banded)]
    lines.append('</g>')
    lines += [f'<g class="qr-eye" style="--i:{i}">{eye(fc, fr, True)}</g>' for i, (fc, fr) in enumerate(finders)]
    lines.append(f'<g class="qr-mark">{mark(True)}</g>')
    lines.append('</svg>')
    return standalone, "\n".join(lines) + "\n"


def verify(payload, ecc, name):
    """Prove the data survives the knockout. Square eyes on purpose: this checks
    the payload, not the rendering. Rounded-eye output is verified against Apple
    Vision and ZXing separately."""
    try:
        import cv2
        import numpy as np
    except ImportError:
        return None
    qr = segno.make(payload, error=ecc, micro=False)
    m = [bytearray(r) for r in qr.matrix]
    n = len(m)
    mid = (n - 1) / 2
    for r in range(n):
        for c in range(n):
            if math.hypot(c - mid, r - mid) <= BADGE_FRAC * n and m[r][c]:
                m[r][c] = 0
    finders = [(0, 0), (n - 7, 0), (0, n - 7)]
    inf = lambda r, c: any(fr <= r < fr + 7 and fc <= c < fc + 7 for fc, fr in finders)
    SS, border = 5, 4
    det = cv2.QRCodeDetector()
    for scale in (6, 12):
        S = scale * SS
        size = (n + border * 2) * S
        img = np.full((size, size), 255, np.uint8)
        for r in range(n):
            for c in range(n):
                if m[r][c] and not inf(r, c):
                    cv2.circle(img, (int((c + border + .5) * S), int((r + border + .5) * S)),
                               int(round(R * S)), 0, -1, lineType=cv2.LINE_AA)
        for fc, fr in finders:
            x0, y0 = (fc + border) * S, (fr + border) * S
            cv2.rectangle(img, (x0, y0), (x0 + 7 * S, y0 + 7 * S), 0, -1)
            cv2.rectangle(img, (x0 + S, y0 + S), (x0 + 6 * S, y0 + 6 * S), 255, -1)
            cv2.rectangle(img, (x0 + 2 * S, y0 + 2 * S), (x0 + 5 * S, y0 + 5 * S), 0, -1)
        out = (n + border * 2) * scale
        data, _, _ = det.detectAndDecode(cv2.resize(img, (out, out), interpolation=cv2.INTER_AREA))
        assert data == payload, f"{name} failed to decode at {scale}px/module"
    return True


print("generating:")
page_std, page_inline = build(PAGE_URL, "h", "page", "qrgPage")
contact_std, contact_inline = build(CONTACT_VCARD, "h", "contact", "qrgContact")

ok = verify(PAGE_URL, "h", "page") and verify(CONTACT_VCARD, "h", "contact")
print("decode check:", "both payloads intact after the knockout" if ok else "skipped (opencv/numpy not installed)")

for fname, blob in (("uttamdeb-details-qr.svg", page_std), ("uttamdeb-contact-qr.svg", contact_std),
                    ("qr-inline-page.svg", page_inline), ("qr-inline-contact.svg", contact_inline)):
    with open(os.path.join(HERE, fname), "w") as fh:
        fh.write(blob)
    print(f"  wrote {fname:26} {len(blob):>7,}B")
print("\npaste qr-inline-page.svg and qr-inline-contact.svg into the two .qr-face blocks in scan-me.html")
