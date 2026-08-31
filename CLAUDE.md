# Star-Site

Personal portfolio / CV site (static HTML, CSS, JS).

## Web UI rules

Apply only in projects with a browser-based user interface.

- Use `-` (hyphen), never `—` (em dash), in UI copy/text.
- Minimum text size: 12px. Layout must stay usable down to a 320px viewport width.
- No emoji in UI elements - use an icon library or SVG instead.
- Every site needs Open Graph + Twitter Card meta tags in `<head>` (`og:title`, `og:description`, `og:image`, `og:url`, `og:image:width`/`height`, `twitter:card` set to `summary_large_image`), pointing at an absolute image URL. The preview image (1200x630) must be an actual screenshot of the site/app in use, taken from a running instance (dev server or deployed site) - not a designed/illustrated graphic and not a logo or title card with no real UI in it. Resize/crop the raw screenshot to fit; don't composite it into invented artwork. To get that screenshot:
  1. Start a dev server yourself and open the app in a browser tool.
  2. If the page is empty/blank by default (no seed data), fill in a few fields with realistic-looking demo content first, so the screenshot represents actual use rather than an empty form. Don't persist this anywhere real - it's only for the screenshot.
  3. Pick a state that's actually representative of the product, not just whatever the default view happens to render. If the UI varies by real-world context (time of day, date, etc.), deliberately set it to a meaningful state (e.g. override `Date` in the page via the browser tool) rather than settling for whatever the literal current moment produces.
  4. Capture the screenshot directly at (or cropped/resized to) the target dimensions (1200x630) - don't composite a differently-shaped screenshot into a designed frame.
  5. Clean up: close the browser page/tab and stop the dev server you started.
