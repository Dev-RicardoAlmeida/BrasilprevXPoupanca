This repository is a small static site (single-page simulators) used to compare savings vs. Brasilprev funds.

Key facts an AI coding agent should know (short and actionable):

- Project layout (important files):
  - `index.html` — main comparator UI (Poupança, Brasilprev, CDB). Contains markup and references `scripts.js` for behavior.
  - `brasilprev.html` — alternate/variant page focused on Brasilprev; also references `scripts.js`.
  - `scripts.js` — consolidated JavaScript logic (input formatting, calculations, DOM updates). Keep behavior here when modifying calculations or UI interactions.
  - `README.md`, `LICENSE` — small meta files.

- Big picture and architecture:
  - This is a purely static, client-side app (no backend). All calculations run in the browser using fixed monthly rates defined in `scripts.js` (TAXA_POUPANCA, TAXA_BRASILPREV, TAXA_CDB) and simple IR rules. Changes to rates or new instruments should be done in `scripts.js` and the UI updated in the HTML files.

- Where to make changes:
  - UI markup and text: edit `index.html` / `brasilprev.html`.
  - Interactive logic and numeric constants: edit `scripts.js` (one source of truth for both pages). The script is written defensively — it checks for DOM elements that may be missing on a page.

- Conventions and patterns used in this repo:
  - Currency input: the input field accepts digits only; typing is treated as cents (typed digits -> formatted as BRL). See `onlyDigits` and `formatInput` in `scripts.js` for the exact behavior.
  - Display formatting uses `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
  - Colors for differences: CSS classes `diff-positive`, `diff-negative`, `muted` control color. When changing how deltas look, update those classes in the HTML `<style>` blocks.
  - Defensive DOM access: `scripts.js` sets text only when elements exist so it can be shared between pages.

- How to preview and debug locally:
  - Since this is static, you can open `index.html` or `brasilprev.html` directly in a browser (double-click or File → Open). This is enough for quick checks.
  - For a local server (recommended for correct module/relative path behavior and consistent dev experience), run a simple static server in the repo root, for example using Python (if installed):

```powershell
# from repository root on Windows PowerShell
py -3 -m http.server 8000
# then open http://localhost:8000/index.html in the browser
```

  - Or, if you prefer Node.js tooling and have http-server installed:

```powershell
npx http-server -c-1 -p 8000
# then open http://localhost:8000/index.html
```

- Tests and build: there is no build pipeline or tests in this repo. Changes are validated manually by opening the pages in a browser. When adding more code, prefer small, focused changes and validate with the local server flow above.

- Integration points and external dependencies:
  - Uses Bootstrap CSS/JS from CDN (see the <link> and <script> tags in the HTML files). No other external APIs or services are used.

- Small diffs and safe refactors:
  - When extracting JS (as done), keep existing constants and formatting logic intact to preserve UI behavior.
  - If adding new pages, follow the pattern: include `scripts.js` and create DOM ids matching those used by the script, or adjust `scripts.js` to handle new ids defensively.

- Examples of patterns to follow when modifying calculations:
  - To change a rate, edit the constant at the top of `scripts.js` (e.g., `TAXA_BRASILPREV = 0.012`). Update any explanatory text in the HTML files to match.
  - To add a new instrument (e.g., another fund), add UI blocks in the HTML with IDs for bruto/liquido/total/diff and then extend `scripts.js` to compute and update those elements; use `safeSetText` and `updateColor` for consistent formatting.

- When committing changes:
  - Keep commits small and descriptive (e.g., "extract scripts to scripts.js", "update Brasilprev rate and note in index.html").

If anything is unclear, tell me which part you'd like expanded (for example: specific DOM ids, exact calculation formulas, or adding unit tests), and I will refine this file. 
