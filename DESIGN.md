# Portfolio Design Revamp Brief

## Goal

Redesign Uttam Deb's portfolio into a polished, modern, storytelling-led personal site for an AI, data, and business intelligence professional. The new direction should feel minimal, calm, premium, and editorial, while upgrading the current glass aesthetic into something more spatial, interactive, and memorable.

This is a full design overhaul, not a small theme pass. The homepage should become the primary narrative experience. Existing content such as projects, articles, experience, achievements, resume, links, social profiles, and analytics must remain available.

## Non-Negotiables

- Default theme is dark mode.
- Light mode must exist and be available through a visible toggle on every page.
- Preserve the existing greeting concept, but restyle it so it feels native to the new design.
- Preserve analytics trackers on every public page: Google Tag Manager `GTM-PWVFRF5B`, GA4 `G-X485NR8WPC`, and Microsoft Clarity `lsv9x3rlve`.
- Do not remove existing portfolio content. Re-home content when needed, but keep it reachable through navigation.
- Mobile must feel first-class, not like a squeezed desktoalsp.
- The revamp must be easy to revert if the direction is not approved.
- Do not depend on future photos or product screenshots being available during scaffolding. Build the structure with stable placeholders and swap in supplied assets later.

## Current Repo Shape

The site is currently a static HTML/CSS/JS portfolio with no build step. Core pages include:

- `index.html`
- `experience.html`
- `achievements.html`
- `resumé.html`
- `linkedin-feed.html`

Current styling is mostly in:

- `assets/css/main.css`
- `assets/css/glass-enhancements.css`
- `assets/css/animations.css`
- `assets/css/chat.css`

Current behavior is mostly in:

- `assets/js/main.js`
- `assets/js/greeting.js`

The current glass effect is applied broadly through translucent containers, blur, borders, and basic hover lifts. The revamp should keep the glass idea, but make it feel intentional: layered depth, light response, material edges, and scroll-driven movement.

## Implementation Guardrails

- Keep the project static by default. Do not introduce a package manager, bundler, framework, or build step unless the user explicitly approves it.
- Use plain HTML, CSS, and JavaScript first. This repo already works as a static site, and the redesign should respect that.
- New behavior should progressively enhance the page. If JavaScript fails, the content must still be readable and navigable.
- Prefer new revamp files over deep edits to legacy files. This keeps review and rollback clean.
- Avoid changing unrelated files such as tracked system metadata.
- Do not remove disabled or unused features such as chat-related files unless the user separately asks for cleanup.
- Keep filenames ASCII except where existing files already use non-ASCII, such as `resumé.html`.
- Keep external links intact unless replacing broken links is part of an explicit validation pass.

## Revert Strategy

Before implementation, create a dedicated branch:

```bash
git checkout -b design-v2
```

Keep the old design recoverable by following these rules:

- Avoid rewriting `assets/css/main.css` heavily. Prefer adding new revamp files loaded after the legacy CSS.
- Add new CSS as `assets/css/design-tokens.css` and `assets/css/design-v2.css`.
- Add new JS as `assets/js/theme-toggle.js`, `assets/js/storytelling.js`, and `assets/js/glass-interactions.js`.
- Keep legacy `main.js` and `greeting.js` until replacements are verified.
- Add a `legacy-home.html` snapshot only if the homepage markup is replaced wholesale.
- Keep commits small by phase so a partial revert is possible.

A clean revert should be possible by removing the new CSS/JS includes, restoring the old `index.html`, and deleting any new pages created for re-homed content.

Rollback checklist for the implementing agent:

- Capture `git status --short` before editing.
- Create one commit for the design scaffolding before changing page content.
- If replacing `index.html`, save the current homepage as `legacy-home.html` in the same commit.
- Keep all new files prefixed or grouped clearly: `design-*`, `theme-*`, `storytelling*`, or `glass-*`.
- Document every moved content block in the implementation summary.
- If the user rejects the design, revert the design branch or remove only the new CSS/JS includes and restore `index.html` from `legacy-home.html`.

## Information Architecture

### New Navigation

Use a compact global nav with these items:

- Home
- Work
- Experience
- Achievements
- Resume
- Writing
- LinkedIn

The nav should include:

- Uttam Deb wordmark or concise initials mark.
- Theme toggle.
- Mobile menu button.
- Optional "Contact" CTA when space allows.

### Homepage

The homepage should become the storytelling experience. It should not open with a list of posts.

Recommended homepage sequence:

1. **Hero / Identity**
   - Greeting rail.
   - Name and role.
   - Short positioning statement.
   - Primary CTA to resume or contact.
   - Secondary CTA to work/writing.
   - First visual signal: supplied portrait, data/product screenshot, or generated visual asset representing AI/data systems.

2. **Signal / What Uttam Does**
   - 3-4 concise capability statements.
   - Examples: product analytics, BI systems, AI workflow prototyping, data storytelling.
   - Use glass panels that react subtly to cursor movement.

3. **Story Chapters**
   - A scroll-led narrative describing how Uttam turns messy signals into decisions.
   - Each chapter should pair a short line of copy with a visual: dashboard crop, product UI, data flow, AI agent/process, or work artifact.
   - Use section progress and reveal states, but no scroll hijacking.

4. **Featured Proof**
   - 3-5 featured work cards.
   - Cards should include problem, role, tools, year, and impact.
   - Use supplied screenshots later. Until then, use structured placeholder panels that look intentional.

5. **Writing and Thinking**
   - Preview the existing articles currently on the homepage.
   - Link to a dedicated Writing or Work page for the full archive.

6. **CTA / Contact**
   - Strong closing section with contact links, resume, LinkedIn, GitHub, and email.
   - Keep it concise and visually calm.

### Work / Writing Page

Move the current homepage project and article list into a dedicated page:

- Preferred: `work.html` for projects and analyses, plus `writing.html` if the article list grows.
- Acceptable first implementation: one `work.html` page with filters or sections for `Projects`, `Articles`, and `Notebooks`.
- Update nav active states and canonical URLs.

### Existing Pages

`experience.html`, `achievements.html`, `resumé.html`, and `linkedin-feed.html` should receive the same visual system but less theatrical motion than the homepage.

Special handling:

- `resumé.html` must remain highly readable, printable, and recruiter-friendly.
- `experience.html` should become a structured timeline with evidence cards.
- `achievements.html` can use a curated grid or timeline.
- `linkedin-feed.html` should feel like a feed/archive surface, not a landing page.

## Visual Direction

### Overall Feel

The site should feel:

- Minimal but not empty.
- Premium but not decorative.
- Technical but human.
- Glassy but mature.
- Story-led on the homepage, utilitarian on content-heavy pages.

Avoid:

- Generic template glass cards.
- Overloaded gradients.
- Random floating decoration.
- Cards inside cards.
- Large marketing hero layouts that do not show Uttam or his work.
- Hover-only interactions that hide critical content on mobile.

### Typography

Use legal, web-safe or open-source fonts. Do not use proprietary fonts unless the user supplies licensed files.

Recommended stack:

- Display serif: `Newsreader` or `Source Serif 4`.
- UI/body sans: `Inter`, `Segoe UI Variable`, `Segoe UI`, system sans-serif.
- Mono/accent: `Red Hat Mono` for labels, metadata, section numbers, and metrics.

Suggested usage:

- Hero headline: display serif, light or regular weight.
- Section headlines: display serif or UI sans depending on density.
- Body copy: UI/body sans, 16-18px desktop, 15-16px mobile.
- Labels and metadata: mono, 11-13px, uppercase only when short.

Do not use viewport-width font sizing. Use rem sizes and media-query steps so text does not become unpredictable on mobile or ultrawide screens.

### Color System

Use design tokens and theme attributes. Suggested dark theme:

- `--bg`: `#050607`
- `--bg-elevated`: `#0b0d10`
- `--surface`: `rgba(255,255,255,0.07)`
- `--surface-strong`: `rgba(255,255,255,0.12)`
- `--text`: `#f4f0e8`
- `--text-muted`: `rgba(244,240,232,0.68)`
- `--line`: `rgba(255,255,255,0.16)`
- `--accent`: `#8ab4ff`
- `--accent-2`: `#7ee7c8`
- `--warm`: `#d7b98c`

Suggested light theme:

- `--bg`: `#f7f4ed`
- `--bg-elevated`: `#fffdf7`
- `--surface`: `rgba(255,255,255,0.66)`
- `--surface-strong`: `rgba(255,255,255,0.86)`
- `--text`: `#171717`
- `--text-muted`: `rgba(23,23,23,0.64)`
- `--line`: `rgba(23,23,23,0.14)`
- `--accent`: `#245bdb`
- `--accent-2`: `#147d64`
- `--warm`: `#9b6b2f`

The palette should not become one-note. Use the dark neutral base, one cool accent for data/AI, one green/mint accent for growth/systems, and one warm accent for editorial highlights.

### Glass System

Upgrade glass from simple transparency to a material system:

- Use `backdrop-filter` only on components that need it, not every container.
- Add a subtle border and inner highlight to glass panels.
- Add a masked cursor-responsive sheen on desktop pointer devices.
- Use low-opacity noise texture or CSS grain very subtly, but never let it reduce text contrast.
- Use layered glass only for meaningful surfaces: nav, hero controls, featured work cards, metric panels, contact CTA.
- Provide fallback styles for browsers without `backdrop-filter`.

Glass card anatomy:

- Base translucent surface.
- 1px border using theme line token.
- Top/left highlight through pseudo-element.
- Cursor-responsive light field through CSS variables `--mx` and `--my`.
- Content remains fully readable without the hover effect.

Cursor-responsive implementation details:

- Attach pointer tracking only when `matchMedia("(pointer: fine)")` is true.
- For each `[data-glass]` surface, calculate cursor position relative to the element.
- Write `--mx` and `--my` as percentages on the element.
- Use those variables in a pseudo-element mask or background so the highlight follows the cursor.
- Throttle updates with `requestAnimationFrame`.
- Disable this effect when `prefers-reduced-motion: reduce` or `data-motion="reduced"` is active.
- On touch devices, use a static top-edge highlight instead.
- Do not create a visible circular decoration that floats independently of a surface. The light response should belong to the material.

## Motion and Interaction

### Motion Principles

Motion should support the story and material feel. It must not become noise.

Use:

- Slow reveal for sections.
- Text line reveal for hero and chapter headings.
- Cursor-responsive glass highlight on desktop.
- Subtle parallax for visual assets.
- Magnetic CTA buttons, but within small movement limits.
- Project-card hover states that reveal action labels and add depth.
- A progress marker for homepage chapters.

Avoid:

- Scroll hijacking.
- Infinite distracting background movement.
- Required hover to understand content.
- Heavy canvas/WebGL unless there is a strong reason and performance is tested.

### Homepage Storytelling Mechanics

Use a chapter model rather than a single long list.

Recommended section behavior:

- Each chapter has `data-chapter`.
- A small progress indicator highlights the current chapter on desktop.
- On mobile, replace the side progress indicator with a simple section label or step count.
- Use IntersectionObserver to add `is-visible` and `is-current` classes.
- Use CSS transitions for reveal, not JavaScript animation loops.
- Keep all chapter content in the DOM and visible by default before JS initializes.

Suggested chapter copy structure:

- Chapter eyebrow: short mono label such as `01 / Signal`.
- Chapter headline: one strong sentence.
- Chapter body: 1-2 short lines.
- Evidence: metric, screenshot, quote, project card, or tool stack.

The page should feel like the visitor is moving through Uttam's work logic:

- Observe messy behavior.
- Model what matters.
- Build tools and dashboards.
- Prototype AI-assisted workflows.
- Turn signals into decisions.

### Greeting Function

Keep the greeting behavior, but redesign it.

Current behavior:

- `assets/js/greeting.js` rotates multilingual greetings every 3 seconds.

New behavior:

- Keep multilingual rotation.
- Place greeting in the hero as a small but distinctive identity signal.
- Style it as an editorial label or word rail, not a large novelty element.
- Animate using opacity and vertical clip/slide.
- Pause animation when `prefers-reduced-motion: reduce`.
- Avoid layout shift by giving the greeting container a fixed min-width based on the longest greeting.
- Keep Bangla and other scripts legible by using the body sans fallback stack.

### Theme Toggle

Implement a visible theme toggle on every page.

Behavior:

- Default to dark on first visit.
- Store preference in `localStorage` as `uttam-theme`.
- Set `data-theme="dark"` or `data-theme="light"` on `document.documentElement`.
- Set `color-scheme: dark light`.
- Toggle button must expose `aria-pressed`.
- Toggle button label must update for screen readers.
- Avoid flash of wrong theme by placing a tiny inline theme-init script in the head before CSS loads.

### Motion Toggle

Optional but recommended:

- Add a motion toggle under settings or respect system settings only.
- Store preference as `uttam-motion`.
- If disabled, remove cursor following, parallax, long reveals, and magnetic effects.

### Interaction Details

Buttons:

- Use icon plus text for primary actions where helpful.
- Primary CTA hover can use a subtle magnetic shift, max 6px.
- Button labels must never move enough to reduce readability.

Project cards:

- Hover can reveal a small action label such as `View case`.
- The title, problem, and impact must remain visible without hover.
- On mobile, action labels are always visible.

Navigation:

- Desktop nav may be translucent and sticky.
- Mobile nav should open as a full-height sheet or full-screen panel.
- Mobile menu state must close on link click, Escape, and outside click when applicable.

## Implementation Plan

### Phase 1: Foundation

- Create `assets/css/design-tokens.css`.
- Create `assets/css/design-v2.css`.
- Create `assets/js/theme-toggle.js`.
- Create `assets/js/glass-interactions.js`.
- Create `assets/js/storytelling.js`.
- Load new CSS after legacy CSS while the revamp is in progress.
- Load new JS after legacy JS.
- Add shared body classes or data attributes such as `data-page="home"`.

### Phase 2: Homepage

- Replace homepage content structure with semantic story sections.
- Move existing project/article cards into `work.html` or a temporary archive section.
- Preserve all existing external links.
- Add placeholders for future supplied images.
- Add `data-reveal`, `data-glass`, `data-tilt`, and `data-chapter` attributes where interaction JS can attach progressively.
- Keep a link from the homepage to the full archive above the fold or immediately after featured proof.

### Phase 3: Navigation and Shared Shell

- Replace the current nav with a responsive glass nav.
- Desktop: compact horizontal nav.
- Mobile: full-screen or sheet-style nav with large tap targets.
- Include theme toggle in both desktop and mobile nav.
- Keep social links accessible, but avoid crowding the primary nav.

### Phase 4: Content Pages

- Apply shared design tokens to existing pages.
- Keep pages calmer than homepage.
- Ensure resume print styles are preserved or improved.
- Update active nav states.

### Phase 5: Polish and QA

- Test all pages in dark and light mode.
- Test desktop, tablet, and mobile.
- Verify analytics scripts still exist on every page.
- Verify no critical content depends on JavaScript.
- Verify reduced motion.

## Responsive Requirements

Use these breakpoints as implementation targets:

- Small mobile: 360 x 740
- Modern mobile: 390 x 844
- Large mobile: 430 x 932
- Tablet: 768 x 1024
- Small laptop: 1280 x 720
- Desktop: 1440 x 900
- Large desktop: 1920 x 1080

Mobile rules:

- Hero must fit without text overlapping controls or visuals.
- Do not force every homepage section to `100vh` on mobile.
- Use `min-height: 100svh` for first viewport sections, with fallback.
- Disable desktop cursor effects on touch devices.
- Convert project cards to single-column stacked cards.
- Ensure all CTAs are at least 44px tall.
- Keep nav tap targets at least 44px.
- Avoid sticky elements that consume too much vertical space.
- Do not rely on hover states.
- Reduce blur intensity and layered shadows for performance.
- Keep body copy left-aligned on small screens unless a very short label is being centered.
- Do not place large fixed-position decorative elements behind text on mobile.
- Test with browser UI bars changing viewport height; avoid sections that cut off controls.

Desktop rules:

- Content width should usually max out around 1200-1320px.
- Ultrawide screens should not stretch text lines beyond readable measure.
- Large visuals may extend wider than text, but text measure should stay controlled.

## Accessibility Requirements

- Keep a visible skip link.
- Maintain one clear `h1` per page.
- Use semantic sections and headings.
- All icon-only controls need `aria-label`.
- Theme toggle must use `aria-pressed`.
- Mobile menu must manage `aria-expanded`.
- Focus states must be visible in both themes.
- Contrast must pass WCAG AA for body text and controls.
- Respect `prefers-reduced-motion`.
- Decorative visuals must be `aria-hidden="true"`.
- Real project/product images need meaningful alt text.
- Do not trap focus in the homepage story unless a modal/menu is actually open.
- Cursor effects must not hide the native cursor unless a replacement cursor is fully accessible and disabled on reduced motion.
- Keep link underlines or equally clear affordances in long-form content.

## Performance Requirements

- Keep the site static unless a build step is intentionally introduced and documented.
- Lazy-load below-the-fold images.
- Use `width`, `height`, and `decoding="async"` on images.
- Use modern image formats when possible: `.webp` or `.avif`.
- Avoid loading multiple heavy font families and weights. Start with 2-3 families and limited weights.
- Avoid layout shift in greeting, nav, and hero media.
- Use IntersectionObserver instead of scroll event loops for reveal states.
- Throttle pointer effects with `requestAnimationFrame`.
- Do not run cursor effects on touch devices or when reduced motion is enabled.
- Keep font loading simple: use `preconnect` and `display=swap`; avoid loading unused weights.
- If generated images are used, compress them before committing.

## Analytics Requirements

Every public page must keep:

- Google Tag Manager `GTM-PWVFRF5B`
- GA4 `G-X485NR8WPC`
- Microsoft Clarity `lsv9x3rlve`

Implementation options:

- Short term: keep the existing inline tracker blocks in every HTML page.
- Cleaner follow-up: centralize repeated analytics code into a shared include pattern only if the static hosting setup supports it safely.

Before finishing implementation, run:

```bash
rg -n "GTM-PWVFRF5B|G-X485NR8WPC|lsv9x3rlve" *.html
```

All public pages should appear in the output.

Do not move analytics scripts to the bottom of the body unless you confirm the tracking behavior remains equivalent. The current pages load these trackers in the head.

## Asset Plan

The user will provide photos and product/work screenshots before final implementation.

Prepare these folders:

- `images/revamp/portraits/`
- `images/revamp/work/`
- `images/revamp/textures/`

Expected asset types:

- Portrait or profile image.
- Product screenshots from relevant work.
- Dashboard or BI screenshots.
- AI/product workflow visuals.
- Article cover images already present can continue to be used.

Do not block layout work on final assets. Use neutral placeholder components with the same aspect ratios:

- Hero portrait/product visual: 4:5 or 1:1.
- Work card media: 16:10 or 4:3.
- Story chapter visual: 16:9, 4:3, or tall mobile mockup.

## Page-Level Notes

### `index.html`

Purpose: storytelling homepage.

Must include:

- Greeting.
- Positioning.
- Work proof.
- Visual chapters.
- Writing preview.
- CTA.

Should not be a plain archive of posts.

### `work.html`

Purpose: preserve and elevate existing projects/articles.

Must include:

- Current Medium links.
- Kaggle links.
- Existing images and alt text.
- Filters or clear groupings.

### `experience.html`

Purpose: professional timeline.

Design:

- Timeline with glass evidence panels.
- Role, company, dates, key contributions, tools.
- Include selected metrics where available.

### `achievements.html`

Purpose: recognitions and milestones.

Design:

- Curated cards or timeline.
- Avoid making every achievement look equally loud.

### `resumé.html`

Purpose: recruiter-friendly resume.

Design:

- Clean document-like surface.
- Strong print styles.
- Minimal animation.
- Keep download/contact obvious.

### `linkedin-feed.html`

Purpose: feed/archive.

Design:

- Dense, readable feed cards.
- Less cinematic than homepage.
- Keep sharing/link affordances clear.

## SEO and Metadata

During the revamp, fix domain consistency:

- Prefer canonical URLs using `https://uttamdeb.com/` if that is the intended production domain.
- Update Open Graph URLs and images accordingly.
- Update `sitemap.xml` and `robots.txt` if page paths change.
- Keep structured data for `Person`.
- Add structured data for `CreativeWork` or `Article` only where it is accurate.

When moving homepage content into `work.html`, avoid breaking discoverability:

- Link to `work.html` from the homepage and nav.
- Add `work.html` to `sitemap.xml`.
- If `writing.html` is created, add it to `sitemap.xml`.
- Update Open Graph metadata for the new homepage so it describes the storytelling portfolio, not only projects/articles.

## QA Checklist

Before handing off implementation:

- Dark mode works on first load.
- Light mode toggle persists after refresh.
- No flash of wrong theme.
- Greeting rotates and does not shift layout.
- Greeting pauses or simplifies under reduced motion.
- Homepage is readable with JavaScript disabled.
- Mobile nav opens, closes, and traps no focus incorrectly.
- Keyboard navigation reaches every control.
- Focus states are visible.
- No text overlaps at 360px, 390px, 768px, 1280px, 1440px, and 1920px widths.
- Cursor effects only run on devices with fine pointer support.
- Cards remain usable on touch.
- `backdrop-filter` fallback is acceptable.
- Resume page prints cleanly.
- Analytics IDs remain present on every public page.
- External links still work.
- Images have dimensions and meaningful alt text.
- Lighthouse or equivalent checks do not reveal major performance/accessibility issues.

## Implementation Notes From QA

These notes capture alignment and browser issues found during the v3 implementation pass.

- Keep `html { font-size: 16px; }` in `assets/css/design-v2.css`. The legacy stylesheet changes root font size by breakpoint, which can make rem-based v2 layouts balloon on wide screens.
- Keep `.design-v2 #wrapper { overflow: visible; }`. Legacy `overflow: hidden` breaks sticky positioning for the redesigned nav.
- Keep direct-child overrides such as `.design-v2 #main > .hero-story` and `.design-v2 #main > .story-section`. Legacy `#main > *` padding has higher specificity than simple section classes.
- The mobile nav is intentionally a sticky horizontal rail. The theme label is visually hidden on mobile so the primary navigation labels fit better.
- Light mode must be checked with real screenshots. Legacy `#main` text rules are specific enough to require explicit v2 overrides for headings, body text, spans, and strong text.
- Do not rely on HTML `width` and `height` attributes alone for v2 images. Keep `.design-v2 img { height: auto; }`, then explicitly set cropped/tall image behavior only where needed.
- Work/archive thumbnails should use a contained image stage because source images vary widely in aspect ratio.
- Homepage copy should stay first person. Use "My work..." / "I keep..." instead of third-person portfolio narration.
- Current role copy is: "Assistant Manager of Business Intelligence and Specialist AI Systems Developer".
- The social set for redesigned navs and footers is GitHub, LinkedIn, Facebook, Instagram, and X. The X URL is `https://x.com/UttamDebJ`.
- Treat the whole redesign QA pass as `v3.0.0` in public footers and `README.txt` unless a separate release is explicitly created.
- The current greeting script uses `is-entering` and `is-leaving`; keep matching CSS animation states so multilingual greetings visibly rotate.
- The homepage includes an optional `Explore serenity` section after the closing CTA and before the footer. It uses Nepal photos from `assets/visuals/` as a personal visual pause, not as part of the professional work narrative.
- Browser titles for redesigned public pages should use the exact title `Uttam Deb - Data & AI Professional`.
- The TenTen page is a product-and-engineering story, not a copied design case study. It should emphasize retrieval, semantic search, memory, agentic workflows, product analytics, evaluation loops, and launch impact.
- TenTen visuals and provider logos must be stored locally in the repo under `assets/visuals/tenten/` and `assets/visuals/brand-logos/` so the page does not depend on external case-study image hosting.
- The TenTen page should close with a concise learning-product CTA before the footer, using the same large editorial display style and warm italic emphasis as the homepage.
- On mobile TenTen split sections, copy should appear before the image for its own segment, even when desktop alternates image-left and image-right layouts. Avoid consecutive unrelated visuals stacking between two text sections.
- On mobile, TenTen centered editorial headings should become left-aligned and compact, usually two or three lines, so they read as intentional section starts instead of oversized centered posters.

## Share Surfaces: `/scan-me` and `/details` (v3.2)

These two pages exist to hand a profile to someone standing in front of you: a QR shown on a screen, and the concise card it points at. Both are sized to exactly one screen at every supported breakpoint, neither is in the primary nav, and neither carries the site footer.

### The QR

- Pre-generated and committed, not built at runtime; no QR library ships to the browser. Regenerate with `assets/visuals/qr/generate-qr.py`, then paste `qr-inline.svg` over the `<svg class="qr-svg">` block in `scan-me.html`. `uttamdeb-details-qr.svg` is the same code standalone, for printing.
- Error correction **H**. The knockout is **circular** (radius 5 modules) rather than a square, so the badge sits in a round clearing instead of a square hole; it costs about 4% of the symbol.
- **Do not render the dots with `<use>`.** A `<use>` shadow tree is translated by its `x`/`y`, so a `userSpaceOnUse` gradient resolves at the same local point for every instance and all dots paint the first stop. Emit real `<circle>` elements. This presents as "the gradient looks too blue" and is not a colour problem.
- A 45-degree gradient across a square only reaches its final stop in the far corner, which is sparse here, so the gradient vector is pulled inward to make the warm end visible.
- The monogram is "UD" in **Instrument Serif Italic** — the face the site uses for its editorial accents — converted to outlines so it needs no webfont and renders identically everywhere. The transform is **baked into the path coordinates**: wrapping it in a `<g transform>` would also transform the `userSpaceOnUse` gradient.
- **Rounded finder patterns are fine.** OpenCV's `QRCodeDetector` rejects them, but Apple Vision (the iOS camera) and ZXing (Android) decode them at every size tested, including under blur, tilt and low light. Verify with those two, not OpenCV.
- The card stays **white in both themes**. Scanning contrast must never depend on the theme.
- The reveal is staged: finder rings draw via `stroke-dashoffset` (`pathLength="100"` in the markup keeps the CSS simple), a diagonal sweep materialises the dot bands in its wake, and the monogram badge lands last. Bands are grouped along the top-left/bottom-right diagonal so the motion travels with the colour.
- The starting state is applied only under `body.qr-anim`, added by `share-cards.js`. Without JavaScript the code must render complete — it is the one thing the page exists to do.

### The profile card

- It is read standing up in a few seconds. It carries identity plus the two actions that matter; the vCard behind "Save contact" carries the detail. Do not reintroduce long lists here — anything that forces a scroll defeats the page.
- **"Save contact" deliberately has no `download` attribute.** GitHub Pages serves the `.vcf` as `text/x-vcard`, and a plain navigation is what makes iOS open its "Add to Contacts" sheet prefilled; `download` sends it to Files instead.
- **Android cannot be made to skip the download from a web page, and an `intent://` will not help.** Chrome only launches an intent whose target activity declares `CATEGORY_BROWSABLE`, and the contacts insert activity does not, so an `ACTION_INSERT` intent is ignored and the `.vcf` downloads anyway. This was built, shipped and confirmed broken on a real handset — do not try it again. The card there tells the reader to open the downloaded file instead.
- The vCard embeds a photo, folded to 75 octets per line as vCard 3.0 requires.
- The glow on that button is a `box-shadow`, not a blurred pseudo-element: a blurred box extends the layout and reintroduces horizontal overflow. `.button` sets `overflow: hidden` for its ripple, so the glow lives on a wrapper.

### Layout traps

- Both pages lay `#wrapper` out as a flex column filling `100svh`. Do not go back to subtracting a guessed chrome height from `100svh`; it overflowed at every breakpoint.
- `/details` centres its card with `auto` margins so the panel stays exactly as tall as its content, rather than stretching and leaving the content floating.
- The scan card's ambient glow is **sized** (`min(136%, 90vw)`), not `inset`. A percentage inset on a `78vw` frame pushed past the viewport, which widened the mobile layout viewport and stretched the fixed `.bg` layer with it.
- `.design-v2:not(.page-home) #main p` carries a type selector, so it outranks class-only rules and will quietly reimpose its margin, line-height, colour and `text-align: left` on any `<p>` here. Match its specificity with `#main p.your-class`, and set `text-align` explicitly — this is why centred copy silently rendered left-aligned.
- The portrait's `aspect-ratio` has to live on the `<img>`. With `height: 100%` against an auto-height parent it resolves to `auto` and the photo's own ratio stretches the frame.
- Legacy `ul li` padding widens flex items; zero it on any icon rail or the row wraps.
- `.scroll-cue` is absolutely placed in the home hero with `left: 50%` and a matching translate. Reusing the class in normal flow means undoing both, or it lands off-screen right.

### The `/details` -> `/` transition

- Cross-document view transitions build their pseudo-element tree in the **new** document, so all `::view-transition-*` styling for this navigation lives in the home page's CSS, scoped to `html.vt-explore`.
- `index.html` adds that class in a `pagereveal` listener, only when `navigation.activation.from` is `/details`, and removes it when the transition finishes so every other navigation keeps the sheet drop. The listener is **in the head** because `pagereveal` fires before the first rendering opportunity.
- The arrow is a shared element: `.explore-cue` and the homepage `.scroll-cue` both take `view-transition-name: explore-cue`, the homepage's only under `.vt-explore`.
- Scrolling down at the foot of the card triggers it. Intent is accumulated from wheel and touch deltas and closes a gradient arc before navigating, with a 600ms arm delay so momentum carried from the previous page cannot fire it. The cue stays a real link.
- The label swaps to "Hold" once the gesture is under way. Both labels sit in one grid cell so the swap cannot change the cue's width.
- Crystals shed from the dial while the gesture is held. They are **keyed to progress, not to raw delta** — browsers scale wheel and touch deltas very differently and a delta-keyed emitter looks wrong on half of them. They live in a `position: fixed` layer appended to `body` so they can never extend the page or reintroduce overflow, and they are suppressed entirely under reduced motion.
- **Do not prefetch or prerender `/`.** A navigation served from the speculation cache does not reliably run the cross-document transition — the same finding recorded in `glass-interactions.js`.
- Playwright screenshots cannot capture a view transition; the screenshot forces a paint that bypasses the pseudo-element layer. Verify by asserting the class is applied across frames, not by eye through automation.


## Edge Cases

Handle these explicitly during implementation:

- **No JavaScript:** nav links, content, and CTAs remain usable; reveal sections are visible.
- **Reduced motion:** no cursor tracking, parallax, magnetic buttons, or long text reveals.
- **No backdrop-filter support:** glass surfaces use opaque or semi-opaque backgrounds with borders.
- **Touch devices:** hover-only states become always-visible states.
- **Very small screens:** 320-360px widths must not crop button labels, nav controls, or long words.
- **Long names and URLs:** cards and footer links wrap without overflow.
- **Slow connections:** image placeholders or background colors prevent blank layout holes.
- **Print:** resume prints without dark backgrounds, glass, fixed nav, or animations.
- **High contrast modes:** important content should not rely solely on translucent color differences.
- **External embeds:** LinkedIn/feed content must not cause horizontal scrolling.
- **Analytics blockers:** page should still render normally if analytics scripts fail.

## Acceptance Criteria

The redesign is successful when:

- The homepage feels like a guided story, not a template archive.
- The glass aesthetic has depth, response, and restraint.
- Typography is calm, minimal, and premium.
- Existing content is preserved and easier to explore.
- Dark and light themes feel designed, not inverted.
- Mobile feels intentional.
- The implementation can be reverted without hunting through tangled CSS.
