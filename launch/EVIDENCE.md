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

## Launch-day watch (added 2026-09-16)

`tools/launch_watch.py` reads the PH page and X metrics and appends one JSON
line to `state/observations.jsonl`. Read-only: it never posts, upvotes or
comments, since PH prohibits soliciting upvotes.

- `gh workflow run launch-watch.yml` — manual run **succeeded** (35039735296).
- Scheduled every 2 hours 05:00–23:00 UTC on 2026-09-18, plus 01:00 UTC on 9/19.
  The wide window is deliberate: PH says 04:01pm JST while an earlier note here
  said 16:01 JST, and the discrepancy was not resolved.
- **GitHub Actions egress is blocked by PH (403)** while the same request
  returns 200 locally. The watch records the block and a hint instead of
  implying zero. `tools/launch-watch.local.sh` runs the same observation from
  this Mac for real numbers on the day.
- X metrics are read in-process with OAuth 1.0a when `xapi` is absent.

Three bugs found by running it before trusting it:
1. `live` was inferred from the absence of a "not live yet" sentence — the
   urllib response has no such sentence, so it reported live while still
   scheduled. Now read from PH's `disabledWhenScheduled`.
2. Counts were taken from anywhere on the page, so Framer's 27 comments were
   attributed to BuildPeek. Now scoped to the buildpeek object.
3. OAuth signing omitted query params, giving 401.

## Self-review against a real Docker image

See `SELF-REVIEW.md`. Built `examples/deploy.Dockerfile` with Docker 29.3.1 and
ran all three input modes. 5 true positives; Docker's own linter independently
confirmed BP001 (`SecretsUsedInArgOrEnv`). 2 false positives, both `set -x`
inside the upstream nginx base image — fixed by requiring a secret in play, and
the fix is verified in production (3 findings → 1, true positive retained).

## Limitations and remaining work

- **The 7-persona review was written by me, not by real users.** No one outside this session has used BuildPeek. Feedback quality is a proxy, and the personas' objections are my best guess at their constraints.
- Image-reading returned unsupported-image errors for this model. **Visual quality/typography is unverified by eye.** Screenshots exist for owner inspection.
- No production-image recall/precision measurement. This is a text heuristic tool, not an image-layer scanner.
- Product Hunt submission, X posts and reach metrics are **not done** — no submission or post has been made.
- No recurring promotion/metrics jobs installed.
