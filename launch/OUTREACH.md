# Organic launch copy and follow-through — approval drafts

## X — first public release, English

Your Docker build remembers more than your final files.

I built BuildPeek: a free, local-first check for secret-like patterns in Dockerfiles and image history.

No upload. No account. Try the sample and tell me what it misses.

{VERIFIED_PRODUCT_URL}

Attach `artifacts/demo.mp4` if posting route supports media. Otherwise use a generated gallery image through the browser, or the verified product URL. Text-only `xapi post` cannot attach a video.

## X — Product Hunt launch-day post

BuildPeek is on Product Hunt.

Paste a Dockerfile or image history. Review build-secret patterns locally, then export findings without sharing your code.

Built with GPT-6 Astra. No runtime AI calls.

What should the next rule catch?

{VERIFIED_PH_URL}

## X — Japanese follow-up (separate approval)

Dockerのビルド履歴に、消したつもりの秘密が残ることがあります。

Dockerfileや履歴をブラウザ内で点検する「BuildPeek」を作りました。無料・登録不要・入力の外部送信なし。対処方法と、コードを含まない共有用レポートを出せます。

まずサンプルで試せます。見落としや使いにくい点を教えてください。

{VERIFIED_PRODUCT_URL}

## Developer-community post (draft, not authorized for bulk sending)

I made a small local-first Docker build-secret review tool. It checks pasted Dockerfiles or image-history text for eight patterns, including ARG/ENV secrets and authentication written into config files. There is no upload, credential validation, or layer extraction. Reports contain rule metadata and positions only.

I'm looking for sanitized examples of missed build patterns and false positives. Try the sample here: {VERIFIED_PRODUCT_URL}

## Distribution mechanism built into the product

- One-click synthetic demo reduces the need to trust the app with actual source on the first visit.
- Input-free Markdown review can be used in a team's discussion.
- Counts-only PNG card offers a shareable artifact without leaking source.
- Free static hosting and no model inference keep marginal compute costs low (not a promise of unlimited hosting capacity).

## Execution plan after approval

1. Verify production on both browsers before announcements; PH's Visit link must reach the working app.
2. Publish first-release X post with the real demo; record tweet ID and URL once. Do not retry an ambiguous successful write without checking.
3. Schedule PH for September 18 through the official contest flow, if accepted. Record confirmed schedule/success screen.
4. Publish launch-day X copy only after PH page is live. Do not announce 'on Product Hunt' for a draft.
5. Reply to actual questions with specific rule behavior and documented limitations. No automated praise, invented customer feedback, paid votes or direct upvote requests.
6. At +1h, +6h and +24h, collect X metrics using `xapi metrics <id>` and actual PH page counts. No recurring jobs have been set up yet.
7. Record actionable feedback and real usage reports. App intentionally has no analytics: don't invent activation/conversion counts from page visits or likes.

## First-day success criteria (targets, not results)

- 10 substantive developer feedback items.
- 3 independent, sanitized examples to improve detection or reduce false positives.
- 0 confirmed source-input exposure incidents.
- Track PH comments, visits if shown, and X impressions/click metrics if available. No guaranteed rank or reach.
