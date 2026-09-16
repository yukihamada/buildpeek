# Verification evidence — 2026-09-16

## Deliverable

- Source and public repo: https://github.com/yukihamada/buildpeek
- **Production: https://yukihamada.github.io/buildpeek/ — live and browser-verified**
- Offline single file: https://yukihamada.github.io/buildpeek/buildpeek-offline.html
- MIT licensed. Version 0.1.0.

## Post-feedback re-verification (after the 7-persona changes)

- `npm test`: 21 passed, 0 failed.
- `npm run build`: 7 assets + `buildpeek-offline.html`.
- `python3 tools/browser_check.py`: Chromium **and** WebKit PASS, en/ja, 375/768/1440 px, 0 external requests, 0 page errors.
- Offline build from `file://`: version renders, 6 findings, 6 copy-step buttons, **exactly one network request (itself)**, 0 errors.
- Production URL in Chromium **and** WebKit: title, version `0.1.0`, 6 findings, 8 rules listed, 6 copy-steps, language switch to `ja`, **0 external requests**, 0 errors.
- HTTP: root 200, offline file 200, `app.mjs` 200.
- Demo re-recorded: H.264, 1270×760, **24.64 s**, 512441 bytes, no audio; full decode clean.

## Bugs found and fixed during this round

1. The version line was inserted **inside** the language-toggle handler, corrupting it. Found because the offline build showed an empty version string. Fixed and re-verified.
2. The offline build requested `icon.svg`, which its own CSP (`img-src data:`) blocks. Icon is now inlined; the file makes one request — itself.
3. The first browser test used `wait_for_function`, which needs `eval` that the CSP forbids. Replaced with a locator assertion; **CSP was not weakened**.

## Earlier verification (before feedback changes)

1. `npm test`: **21 tests, 21 passed, 0 failed**.
2. `npm run build`: syntax checks and seven assets copied successfully.
3. `python3 tools/browser_check.py`: **Chromium and WebKit passed**, en/ja, 375/768/1440 px; zero external page requests and zero page errors. Evidence: `artifacts/browser-results.json`.
4. Local HTTP GET `/`: **200**.
5. `python3 tools/record_demo.py`: actual browser interaction captured using synthetic examples.
6. `ffmpeg -nostdin -n -i artifacts/demo.webm -c:v libx264 -pix_fmt yuv420p -movflags +faststart -an artifacts/demo.mp4`: success.
7. `ffprobe`: **H.264, 1270×760, 24.68 seconds, 533310 bytes**, no audio.
8. `ffmpeg -nostdin -v error -i artifacts/demo.mp4 -f null -`: full decode exit 0, no errors.
9. Synthetic scanner benchmark: 10,001 records / 150,012 bytes / **5.21 ms**, zero findings. One local Node run, not a cross-device claim.
10. Copy length: tagline **59/60**, description **226/260**, first English X post **252/280** with URL counted as 23 characters.
11. Image dimensions: thumbnail **240×240 / 8807 B**; gallery 1 **1270×760 / 96247 B**; gallery 2 **1270×760 / 120405 B**.

## Browser coverage

- Risky synthetic sample: 5 high + 1 review across 8 instructions; overlapping rule matches count separately.
- Secret-mount sample: 0 matches / 2 instructions / 1 mount, with explicit non-certification text.
- Language switch, file import, Markdown and PNG downloads, clear, malformed JSON, script-like input, immediate invalidation of stale results.
- Export excludes source command; import filename excluded from result UI.
- localStorage/sessionStorage/cookies empty. No horizontal overflow in tested languages/widths.

## Limitations and remaining work

- **The 7-persona review was written by me, not by real users.** No one outside this session has used BuildPeek. Feedback quality is a proxy, and the personas' objections are my best guess at their constraints.
- Image-reading returned unsupported-image errors for this model. **Visual quality/typography is unverified by eye.** Screenshots exist for owner inspection.
- No production-image recall/precision measurement. This is a text heuristic tool, not an image-layer scanner.
- Product Hunt submission, X posts and reach metrics are **not done** — no submission or post has been made.
- No recurring promotion/metrics jobs installed.
