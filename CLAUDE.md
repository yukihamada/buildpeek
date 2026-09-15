# BuildPeek

Local-first Docker build-secret review. Static English/Japanese app; no runtime dependencies, analytics, backend, credential validation, or outbound scan requests.

- `npm test` — scanner regression tests.
- `npm run build` — syntax checks + copy only public assets to dist.
- `npm run preview` — loopback-only preview at http://127.0.0.1:8942.
- `python3 tools/browser_check.py` — browser flows, network isolation, screenshots.
- Keep all user-facing strings in `web/i18n.mjs` or bilingual rule metadata.
- Never put input text, filenames, secrets, or source snippets in reports, share cards, logs, URLs, storage, or telemetry.
- Findings are heuristics; never call an image safe or claim to scan filesystem layers.
- Public release via GitHub Actions / GitHub Pages only, after owner approval.
