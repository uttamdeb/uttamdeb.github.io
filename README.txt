This is my personal portfolio website. Hosted on GitHub. Current Domain: uttamdeb.github.io

Release Changelog

v3.2.0 (August 27, 2026)
1. Added a new page: /scan-me, a full-screen QR display for sharing a profile at physical events.
2. Added a new page: /details, a concise profile card the QR points at, sized to one screen with no scrolling.
3. Neither page appears in the primary navigation, and neither carries the site footer.
4. QR is a pre-generated, committed SVG with no runtime library: dot modules in the site's blue/teal/bronze accent gradient, rounded finder patterns, and a circular badge holding a "UD" monogram set in Instrument Serif Italic and converted to outlines.
5. QR reveal is staged: the three finder rings draw themselves, a diagonal light sweep materialises the dot bands in its wake, and the monogram lands last. Replays on tap for live sharing.
6. QR card stays white in both themes so scanning contrast never depends on the theme.
7. Added a downloadable QR at assets/visuals/qr/uttamdeb-details-qr.svg, its generator, and print styles so /scan-me can be printed as a table tent.
8. /details leads with a centred portrait, name and role, then the two actions that matter and a compact rail of five contacts. The name is set in Instrument Serif Italic, the same face as the site's editorial accents.
9. "Save contact" glows and links straight to assets/uttam-deb.vcf, photo included, with no `download` attribute. On iOS that opens Safari's Add to Contacts sheet directly, with no file saved. Android always downloads the card first; the confirmation message says so, since no web page can open the Android contact editor directly.
10. "Share" uses the Web Share API with a clipboard fallback.
11. Scrolling down at the foot of /details carries you into the site: downward intent closes a gradient arc around the arrow, swaps the label to "Hold", and sheds drifting crystals as it builds, then navigates. The cue remains a real link for clicking and keyboard use.
12. That navigation runs a dedicated transition, the card lifting away while the site rises from beneath, with the arrow morphing into the homepage scroll cue.
13. Added assets/js/share-cards.js. Both pages remain fully usable without JavaScript.
14. /scan-me shows one code by default, the page link, exactly as before. A quiet "No internet?" control under it swaps the card in place to a second code that carries a lean vCard as text, so a reader with no connection can still save the contact; the vCard holds the /details URL so the full card follows once they have signal. The control is script-only and hidden without JavaScript.
15. Gave every page a distinct browser title in the form "Uttam Deb - Data & AI Professional | Section"; the homepage keeps the bare title.

v3.1.0 (May 28, 2026)
1. Added a new page: Origin Labs
2. Enhanced TenTen page
3. Added more photos in serenity photo booth.
4. Visual improvements and optimization

v3.0.0 (May 26, 2026)
1. Full portfolio design overhaul with a dark-default editorial storytelling homepage.
2. Added `assets/css/design-tokens.css` and `assets/css/design-v2.css` as a reversible redesign layer over the legacy theme.
3. Added light mode with persistent theme toggle across redesigned public pages.
4. Added interactive glass response through `assets/js/glass-interactions.js`.
5. Added scroll reveal/story behavior through `assets/js/storytelling.js`.
6. Moved the old homepage project/article archive into `work.html` while keeping content reachable.
7. Preserved the multilingual greeting behavior in a redesigned hero greeting pill.
8. Added `legacy-home.html` as a rollback snapshot for the pre-overhaul homepage.
9. Updated `robots.txt` and `sitemap.xml` for the new work archive path.
10. Fixed v3 alignment drift caused by legacy root font scaling on wide screens.
11. Restored homepage section padding with more specific design-v2 rules so story sections no longer collide.
12. Made the primary navigation smaller and sticky by overriding the legacy wrapper overflow.
13. Improved mobile navigation persistence and spacing with a compact theme toggle and horizontal link rail.
14. Fixed light mode contrast for headings, body copy, greeting text, stat text, and copyright text.
15. Updated homepage and metadata copy to the current role: Assistant Manager of Business Intelligence and Specialist AI Systems Developer.
16. Reworked first-person homepage copy and removed outdated Senior BI wording from the legacy snapshot.
17. Fixed image sizing by neutralizing HTML height attributes in the v2 layer and containing odd-ratio thumbnails.
18. Added a signal-section visual and tightened story section spacing for a clearer landing-page narrative.
19. Added X social links alongside GitHub, LinkedIn, Facebook, and Instagram across the redesigned pages.
20. Added an optional "Explore serenity" photo-booth section between the contact panel and final footer.
21. Added a dedicated `tenten.html` product and engineering story page, with a glowing TenTen nav entry and supporting TenTen visuals.

v2.3.1 (January 4, 2026)

1. Added enabled flag in config to easily disable/enable chatbot

v2.3.0 (December 31, 2025)
1. Integrated Google Gemini AI chat feature across all pages (index, achievements, experience, resumé, linkedin-feed)
2. Implemented streaming responses for real-time AI conversation experience
3. Created glass morphism chat UI matching site aesthetic with responsive design
4. Desktop: Chat popup appears from bottom-right corner (420×600px) with hover tooltip
5. Mobile: Full-screen bottom sheet style chat (100% width × 85vh)
6. Added system prompt configuration (/assets/config/system-prompt.txt) for easy customization
7. Created Gemini API client (/assets/js/gemini-client.js) with conversation history management
8. Implemented chat UI controller (/assets/js/chat-ui.js) with animations and error handling
9. Styled chat interface (/assets/css/chat.css) with glassmorphism effects, smooth animations
10. Features: Typing indicators, streaming text display, ESC/Enter keyboard shortcuts, auto-scrolling
11. Responsive breakpoints: Mobile (≤736px), Tablet (737-980px), Desktop (>980px)
12. Safety settings: BLOCK_MEDIUM_AND_ABOVE for harassment, hate speech, explicit, dangerous content
13. Chat icon: tenten-icon.png, uses site fonts (Merriweather body, Source Sans Pro headings)
14. Icons: FontAwesome for close and send buttons
15. Added markdown support with marked.js for rich text formatting in chat responses
16. Integrated KaTeX for mathematical equation rendering (supports $$, $, \(\), \[\] delimiters)
17. Added syntax highlighting with highlight.js (Atom One Dark theme) for code blocks
18. **SECURITY FIX**: Implemented Cloudflare Pages Functions proxy to protect API key
19. Created serverless function (/functions/api/gemini.js) to handle secure API communication
20. API key now stored as environment variable (server-side only, never exposed to client)
21. Client updated to support proxy mode with SSE streaming through secure endpoint
22. See CLOUDFLARE_DEPLOYMENT.md for deployment instructions and security best practices

v2.2.0 (December 31, 2025) - Major Performance & Scaling Optimizations
1. Fixed large display scaling issue - content now caps at 1440px (90rem) with centered layout
2. Implemented responsive font sizing using clamp() for optimal readability across all screen sizes
3. Optimized intro heading: now scales from 2.5rem to 5rem based on viewport (prevents oversizing)
4. Optimized gradient greeting animation: reduced from 5.3em to responsive clamp() sizing
5. Added wrapper-max constraint (90rem/1440px) to prevent excessive content width on ultra-wide displays
6. All main containers (wrapper, main, nav, footer) now use min(wrapper-max, 90vw) for consistent sizing
7. Enhanced animation performance: added will-change and GPU acceleration (translateZ(0)) to all animated elements
8. Cleaned up duplicate code: removed empty comment blocks and consolidated glass effect definitions
9. Optimized header logo sizing: responsive clamp(1.75rem, 2vw + 0.5rem, 2.25rem) with 90% max-width
10. Added large display breakpoint optimization (>xlarge) to cap padding and prevent excessive spacing
11. Improved gallery responsiveness: now uses min(300px, 100%) for better mobile adaptation
12. Performance boost: all hover effects now use GPU-accelerated transforms
13. Added CSS custom properties for max-content-width and viewport-safe-width in glass-enhancements.css
14. Optimized typewriter effect with will-change and max-width constraints
15. Enhanced articles grid with will-change properties for smoother hover transitions
16. Navigation panel toggle button optimized with GPU acceleration for smoother animations
17. All content sections now properly center with background visible on sides for ultra-wide displays
18. Improved padding system: consistent spacing across all screen sizes with large display caps

v2.1.2 (December 28, 2025)
1. Fixed mobile layout issues with responsive design improvements
2. Reduced header font size on mobile (3.25rem → 2.5rem) with word-break for overflow prevention
3. Changed articles grid to single column layout on mobile and tablet breakpoints
4. Added glassmorphism effects to mobile menu button (#navPanelToggle)
5. Enhanced navigation panel with glass UI (backdrop-filter blur, transparent background)
6. Fixed header text overflow on small screens with proper text wrapping
7. Ensured articles stack vertically on mobile devices (≤980px)
8. Applied consistent glass design to all mobile navigation elements
9. Updated navigation panel text colors to white for optimal readability on glass background

v2.1.1 (December 24, 2025)
1. Fine-tuned active tab padding in navigation for better spacing (0.55rem 0.35rem)
2. Fixed vertical alignment of social media icons in navigation using flexbox
3. Adjusted navigation bottom margin for improved layout spacing
4. Enhanced glass morphism effects on main content area, footer, and copyright section
5. Improved text contrast with text shadows for better readability

v2.1.0 (December 24, 2025)
1. Major UI redesign with glassmorphism effects and rounded corners
2. Added backdrop blur effects to navigation, buttons, boxes, forms, and tables
3. Enhanced navigation with glass-themed active states and hover effects
4. Improved component styling with rounded corners throughout (1rem - 1.5rem radius)
5. Created new glass-enhancements.css with modern design variables
6. Enhanced animations.css with glass shimmer effects and smooth transitions
7. Fixed image aspect ratio preservation
8. Added background element to all pages for consistent design
9. Updated all SCSS components (nav, header, buttons, forms, images, tables)
10. Improved accessibility with focus states and reduced motion support
11. Enhanced hover animations with transform effects and shadows

v2.0.0 (December 24, 2025)
1. Major performance optimizations (lazy loading, resource hints, async scripts)
2. Comprehensive SEO improvements (Open Graph, Twitter Cards, JSON-LD structured data, canonical URLs)
3. Code quality improvements (moved inline CSS/JS to external files, eliminated 200+ lines of duplication)
4. Created new asset files (animations.css, greeting.js)
5. Fixed image aspect ratio preservation with CSS height: auto
6. Added responsive iframe styling for LinkedIn embeds
7. Updated copyright to 2026
8. Updated sitemap.xml and robots.txt
9. Updated domain references from uttamdeb.com to uttamdeb.github.io

v1.4.0 (August 15, 2025)
1. New LinkedIn posts
2. New article
3. Alt text fix

v1.3.0 (July 6, 2025)
1. Updated Experience: 10 Minute School
2. New Experience: SheSTEM
3. Updated resumé

v1.2.2 (June 26, 2025)
1. Updated resumé

v1.2.1 (May 11, 2025)
1. New LinkedIn posts

v1.2.0 (April 1, 2025)
1. Experience section updated with more tasks
2. Revamped resume with new minimal design
3. Achievements updated with newer achievements

v1.1.2 (January 28, 2025)
1. Updated LinkedIn posts

v1.1.1 (September 28, 2024)
1. Updated article links

v1.1.0 (September 17, 2024)
1. Changed background image
2. Updated resumé
3. Deleted unwanted files

v1.0.5 (May 7, 2024)
1. Google Tag Manager integration

v1.0.4 (May 4, 2024)
1. SEO optimizations
2. Added sitemap.xml
3. Added robots.txt

v1.0.3 (April 28, 2024)
1. Added buttons to LinkedIn posts and fixed post height.

v1.0.2 (April 26, 2024)
1. Added latest LinkedIn post.

v1.0.1 (April 24, 2024)
1. Updated designation

v1.0.0 Initial Public Release (April 22, 2024)
1. Added a new tab: LinkedIn Posts with LinkedIn profile integration
2. Spelling fixes

v0.7.1 (April 21, 2024)
1. Bug fixes

v0.7.0 (April 21, 2024)
1. Updated latest Article link
2. Added a new tab: Resumé
3. Renamed Articles tab to: Projects & Articles
4. Fixed meta description
5. Deleted unwanted image assests.
6. Removed .html from the links but this has broken the test server.

v0.6.4 (April 17, 2024)
1. Footer updated
2. Background image optimized

v0.6.3 (April 17, 2024)
1. Changed tab picture

v0.6.2 (April 17, 2024)
1. Reduced Hello animation speed
2. Fixed Arabic for Hello
3. Footer updated

v0.6.1 (April 17, 2024)
1. Changed background

v0.6.0 (April 16, 2024)
1. Added a new 'Experience' section
2. Added remaining certificates
3. Replaced the featured post in Articles.

v0.5.1 (April 13, 2024)
1. Bug fixes

v0.5.0 (April 13, 2024)
1. Replaced Microsoft Forms integration with Formspree

v0.4.2 (April 13, 2024)
1. Added version footer

v0.4.1 (April 12, 2024)

1. Moved to a custom domain and added CNAME

v0.4.0 (April 9, 2024)

1. Performance, Accessibility, SEO optimizations
2. Gradient Hello in different languages
3. Added a short intro
4. Background changed
5. Added a new achievement element in achievements.html
6. Added post dates.
7. Changed order of posts.
8. Removed intro area in achievements.html
9. Added README

v0.3.0 (April 8, 2024)

1. Added typewriter effect for name.
2. Changed background
3. Added Achievements tab. (Blank for now)
4. Changed button class.
5. Fixed phone number.
6. Added copyright footer.

v0.2.1 (April 7, 2024)

1. Added tab icon
2. Microsoft Clarity integration

v0.2.0 (April 7, 2024)

1. Added Google Analytics 4 integration
2. Added a Text me form via Microsoft Forms
3. Added a self picture.

v0.1.0 Initial Test Release (April 7, 2024)
