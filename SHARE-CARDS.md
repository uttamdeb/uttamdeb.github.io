# Share Surfaces — Implementation Guide

How `/scan-me` and `/details` work. Two pages built to hand a profile to someone
standing in front of you: a QR shown on a screen, and the card it points at.

Neither appears in the primary nav, neither carries the site footer, and both
are sized to exactly one screen at every supported breakpoint.

---

## 1. The QR is generated offline, not at runtime

No QR library ships to the browser. `assets/visuals/qr/generate-qr.py` is an
**offline one-off** — run it only when a payload or the styling changes, then
paste its output into `scan-me.html`. The site stays static with no build step.

```bash
pip install segno                 # required
pip install opencv-python numpy   # optional, enables the decode check
python3 assets/visuals/qr/generate-qr.py
```

It writes four files:

| File | Purpose |
|---|---|
| `uttamdeb-details-qr.svg` | standalone page code — printing, stickers |
| `uttamdeb-contact-qr.svg` | standalone contact code |
| `qr-inline-page.svg` | banded, for pasting into `scan-me.html` |
| `qr-inline-contact.svg` | likewise |

The two `qr-inline-*.svg` files are gitignored — they are paste sources, not
site assets.

### Parameters

| | Page code | Contact code |
|---|---|---|
| Payload | `https://uttamdeb.com/details` (28 B) | lean vCard text (215 B) |
| Version / ECC | v4, **H** | v15, **H** |
| Modules | 33 × 33 | 77 × 77 |
| viewBox | 41 (33 + 2×4 quiet) | 85 |
| Badge radius | 16.1% of width, **4.0%** of modules cleared | same |

Error correction **H** (30% recovery) on both, because the centre badge
destroys real data. The knockout is **circular** — modules within a radius of
centre are cleared — so the badge sits in a round clearing rather than a square
hole.

### Styling pipeline

1. **Dots.** Every dark module becomes a `<circle>` of radius `0.46` modules.
2. **Finder patterns.** Rounded: a 7×7 ring (`rx="1.9"`, 1-module stroke) plus a
   rounded 3×3 core. Both carry `pathLength="100"` so CSS can draw them with a
   plain `stroke-dashoffset` animation.
3. **Gradient.** One `linearGradient`, `userSpaceOnUse`, blue → teal → bronze
   built from the site's accent tokens, deepened for contrast on white:
   `#2450d6 → #1a63a8 (.40) → #0f6a55 (.68) → #8a5a23`.
4. **Bands.** Dots are grouped into 20 `<g class="qr-band">` along the
   top-left→bottom-right diagonal — the same axis the gradient runs on, so the
   reveal wave and the colour travel together.

### Four traps, all hit for real

**Never draw the dots with `<use>`.** A `<use>` shadow tree is translated by its
`x`/`y`, so a `userSpaceOnUse` gradient resolves at the same local point for
every instance and **all dots paint the first stop**. This presents as "the
gradient looks too blue" and is not a colour problem. Emit real `<circle>`s.

**Give each code its own gradient id** (`qrgPage`, `qrgContact`). Both fragments
live in one document, so a shared `id="g"` makes the second code resolve the
first one's gradient — which is sized for a different viewBox.

**A 45° gradient across a square only reaches its last stop in the far corner**,
which is sparse in these symbols. The gradient vector is pulled inward so the
warm end is actually visible.

**Rounded finder patterns are fine.** OpenCV's `QRCodeDetector` rejects them.
Apple Vision and ZXing decode them at every size tested. Do not "fix" the
rounding on OpenCV's say-so — see §8.

---

## 2. The monogram

"UD" set in **Instrument Serif Italic** — the face the site uses for its
editorial accents — converted to **outlines** with `fontTools`, so it needs no
webfont and renders identically everywhere.

The transform is **baked into the path coordinates**, not applied with a
`<g transform>`: a wrapper would also transform the `userSpaceOnUse` gradient.

Because of that, each viewBox needs its own baked path. `MONOGRAM` is a dict
keyed by viewBox span (`41`, `85`), each sized so the badge covers the same
fraction of both symbols. To re-derive: extract the `U` and `D` glyph outlines,
lay them out with the natural italic advance, centre the composed ink box on the
symbol centre, and bake a `scale(s, -s)` flip into the coordinates.

---

## 3. Two codes, one card

`/scan-me` shows **one** code. The default is the page link and is the main
experience — it must not change without a very good reason. A quiet
**"No internet?"** control under the card swaps the payload in place.

### Why a tap, not automatic

**A single URL code cannot serve an offline reader.** Their phone never reaches
the site, so nothing of ours runs and nothing can detect their state. The
payload has to change.

Auto-detection was considered and rejected: `navigator.onLine` reports `true`
behind captive portals, so it would sometimes swap the code for a reader who
*does* have a connection — breaking the main path to serve the edge case.

### The contact payload

A QR tops out near 3 KB and the full vCard is 29 KB with its photo, so the
embedded one is lean: name, org, short title, mobile, email, and the `/details`
URL so the full card follows once there is signal.

Title length is the expensive part — `BI & AI Systems Developer` is the longest
that still fits in 77 modules; the full job title costs four more versions.

### Mechanics

Both codes are inlined as `.qr-face` blocks and toggled with the `hidden`
attribute. Inlining is **required, not chosen**: lazy-loading the second would
need a connection, which is the whole thing it exists to survive.

```
scan-me.html   131 KB raw → 14.4 KB gzipped
```

> A `display` declaration outranks the UA's `[hidden] { display: none }`, so
> every element toggled by that attribute needs its own `[hidden]` guard.
> Without it the control showed up for no-JS readers, where it could do nothing.

The control is script-only (`hidden` in markup, unhidden by JS), so without
JavaScript the page is exactly what it was before the fallback existed.

---

## 4. Save contact — iOS vs Android

`assets/uttam-deb.vcf` is vCard 3.0 with an **embedded photo**, folded to 75
octets per line as the spec requires.

**The link deliberately has no `download` attribute.** GitHub Pages serves the
file as `text/x-vcard`, and a plain navigation is what makes iOS open its
"Add to Contacts" sheet with everything prefilled. `download` would send it to
Files instead.

| Platform | Behaviour |
|---|---|
| iOS Safari | Opens the Add to Contacts sheet directly. Photo included. |
| Android | Downloads the `.vcf`; the reader taps it to import. |
| Desktop | Downloads the file. |

### Why Android cannot skip the download

An `intent://` with `ACTION_INSERT` was built, shipped, and **confirmed broken
on a real handset**. Chrome only launches an intent whose target activity
declares `CATEGORY_BROWSABLE`, and the contacts insert activity does not, so the
intent is ignored and the file downloads anyway.

There is no web API that opens the Android contact editor. Rather than pretend
otherwise, the confirmation toast is platform-aware:

- Android — *"Open the downloaded card to add the contact"*
- everywhere else — *"Confirm to add the contact"*

**Do not rebuild the intent approach.**

---

## 5. The reveal animation

Staged, in the order the eye wants to read it. Driven entirely by CSS off an
`is-live` class; JS only toggles that class.

| Stage | Timing |
|---|---|
| Finder rings draw (`stroke-dashoffset` 100→0) | 620 ms, delay `140ms + i×95ms` |
| Ring cores land (spring) | 480 ms, delay `540ms + i×95ms` |
| Dot bands materialise diagonally | 320 ms, delay `330ms + i×44ms` |
| Badge ring draws | 720 ms @ 1180 ms |
| Monogram presses in (overshoot) | 760 ms @ 1400 ms |
| Light sweep | draw pass 1250 ms @ 200 ms, then ambient every 6.5 s |

The sweep is a diagonal `linear-gradient` animated by `background-position`, so
it runs on the same axis as the colour and the bands — it reads as the thing
*painting* the code, not a shine passing over a finished one.

The starting state is applied **only under `body.qr-anim`**, added by
`assets/js/share-cards.js` at runtime. Without JavaScript the code renders complete — it
is the one thing the page exists to do. Tapping the card replays the sequence.

---

## 6. `/details` — one screen

Read standing up, in a few seconds, by someone who has just met you. It carries
identity plus the two actions that matter; the vCard behind "Save contact"
carries the detail. **Anything that forces a scroll defeats the page.**

Centred portrait → name (Instrument Serif Italic) → role → org · location →
**Save contact** (glowing) + **Share** → a rail of five contacts → the explore cue.

The glow is a `box-shadow`, not a blurred pseudo-element: a blurred box extends
the layout and reintroduces horizontal overflow. `.button` sets
`overflow: hidden` for its ripple, so the glow lives on a wrapper.

### Scroll to explore

Scrolling down at the foot of the card carries you into the site.

- Downward intent is accumulated from wheel and touch deltas; **170 px** commits.
- A **600 ms arm delay** stops momentum carried from the previous page firing it.
- A gradient arc closes around the arrow; the label swaps to **"Hold"**.
- Crystals shed from the dial, **keyed to progress, not raw delta** — browsers
  scale wheel and touch deltas very differently, and a delta-keyed emitter looks
  right on one device and wrong on the next. One every 4% of progress, two above
  60%, capped at 32.
- Crystals live in a `position: fixed` layer appended to `body`, so they can
  never extend the page or reintroduce overflow. Suppressed under reduced motion.
- The cue stays a real link — clicking and keyboard both work.

---

## 7. The `/details` → `/` transition

Pressing a *down* arrow should not feel like the default sheet dropping from
*above*, so this navigation lifts the card away while the site rises from
beneath, with the arrow morphing into the homepage's scroll cue.

Cross-document view transitions build their pseudo-element tree in the **new**
document, so all `::view-transition-*` styling lives in the home page's CSS,
scoped to `html.vt-explore`. `index.html` adds that class in a `pagereveal`
listener — **in the head**, because `pagereveal` fires before the first
rendering opportunity — only when `navigation.activation.from` is `/details`,
and removes it when the transition finishes so every other navigation keeps the
normal sheet drop.

**Do not prefetch or prerender `/`.** A navigation served from the speculation
cache does not reliably run the cross-document transition — the same finding
already recorded in `assets/js/glass-interactions.js`. `/details` instead preloads the
shared portrait and loads the identical CSS/JS bundle, so the homepage renders
from a warm cache without a speculation entry.

---

## 8. How this was verified

**Decode the rendered browser pixels, not a synthetic raster**, and use the
engines phones actually run:

| Engine | Library | Represents |
|---|---|---|
| **Apple Vision** | `pyobjc-framework-Vision` | the iOS camera |
| **ZXing** | `zxing-cpp` | Android |
| OpenCV | `opencv-python` | *payload integrity only* |

OpenCV is the odd one out: it rejects rounded finder patterns that both real
engines accept. It is used only to prove the data survived the knockout, with
square eyes, and is never a gate on the styling.

Screenshots are taken from a live page with Playwright, then run through both
engines at 620/420/308/240/180 px and under Gaussian blur, perspective tilt,
sensor noise and dim-screen simulation, in both themes. Latest run: **78/80**,
with the denser contact code passing all 20 — more modules give the detector
more to lock onto.

Also checked on every change: one-screen fit at ten viewport sizes in both
themes and both code modes, no-JS rendering, reduced motion, contrast at 4.5:1,
44 px tap targets, print output, and that the generator reproduces all four
committed SVGs byte-identically.

> Playwright **cannot** screenshot a view transition — the capture forces a
> paint that bypasses the pseudo-element layer. Verify it by asserting the
> class is applied across frames, not by eye through automation.

---

## 9. Changing things

| To change | Do this |
|---|---|
| The encoded URL or vCard | edit `assets/visuals/qr/generate-qr.py`, run it, paste both `qr-inline-*.svg` into the `.qr-face` blocks in `scan-me.html` |
| The monogram | re-derive the outline path per viewBox (§2), replace the `MONOGRAM` entries |
| Contact details | update **both** `assets/uttam-deb.vcf` and `CONTACT_VCARD` in the generator |
| Reveal timing | `assets/css/design-v2.css`, the "The reveal" block — CSS only, no JS |
| Scroll sensitivity | `THRESHOLD` in `assets/js/share-cards.js` |

`DESIGN.md` carries the same gotchas in short form, next to the design brief
they constrain.
