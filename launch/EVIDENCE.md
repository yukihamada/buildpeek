# Verification evidence — 2026-09-16

## Deliverable

- Source: `/Users/yukihamada/workspace/buildpeek/`
- Running preview: http://127.0.0.1:8942/ (Node PID 31432 when started; lifecycle not managed)
- Application: seven allowlisted files from `web/` to `dist/`
- Proposed public URL: `https://yukihamada.github.io/buildpeek/` — **not deployed / unverified**

## Actual verification

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

- Image-reading returned unsupported-image errors for this model. **Visual quality/typography is unverified by eye.** Screenshots exist for owner inspection.
- First browser run failed because test `wait_for_function` used eval prohibited by CSP. Replaced with a locator assertion; CSP was not weakened. Both browser runs then passed.
- No production-image detection recall/precision measurement or actual customer feedback yet. This is a text heuristic tool, not an image-layer scanner.
- Public repository, production release/tests, PH draft/submission/schedule, X posts and reach metrics are **not done**, pending publication approval.
- Logged-in PH new-product form and X authenticated account were checked. Final contest acceptance/scheduling is unverified.
- No recurring promotion/metrics jobs installed.
