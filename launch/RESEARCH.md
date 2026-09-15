# BuildPeek launch research — 2026-09-16 JST

## Decision

Build a narrow, free, local-first browser review for Docker build-secret patterns. Target English-speaking indie developers shipping containers. Japanese is also available.

Positioning hypothesis: **make a recently discussed, easy-to-miss failure mode instantly understandable and actionable without installing a scanner or uploading potential secrets.** This is a hypothesis, not demonstrated demand or a promise of featuring.

## News checked

1. Hacker News front page: https://news.ycombinator.com/ — Strix/Baseten story observed at 168 points / 87 comments during this session. Values are a snapshot, not ongoing metrics.
2. Original disclosure: https://www.strix.ai/blog/baseten-harbor-github-pat-takeover — page dated September 1, 2026. Describes a live GitHub token in Docker image config `history[].created_by`, with repository admin access. Discovery was July 13; publisher says the registry was restricted and token rotated July 14. **Do not imply an unresolved current incident or that this happened today.**
3. Official Docker docs: https://docs.docker.com/build/building/secrets/ — ARG/ENV are inappropriate for build secrets; use secret/SSH mounts; consuming commands can still persist credentials.
4. Internet Archive update: https://blog.archive.org/2026/09/15/an-update-on-wayback-machine-access/ — automated load and false-positive 429 blocks. Considered a local archive product; discarded for this sprint because robust page capture competes with mature archival tooling and needs a larger browser integration.

## Product Hunt and competitive context

- https://www.producthunt.com/ observed current developer/agent/security launches, including Axari, Buddy AI Access, and previous-week Harden. This demonstrates category activity, not product demand.
- TruffleHog: https://github.com/trufflesecurity/trufflehog — already supports Docker images and hundreds of credential detectors. BuildPeek is substantially narrower. The new value proposed is the browser onboarding, explainable build-pattern review and input-free shareable artifact. **Do not claim first, comprehensive, more accurate, or unique secret detection.**
- `/products/buildpeek` returned 404. GitHub API `repos/yukihamada/buildpeek` returned 404. These are availability observations, not trademark clearance or proof no product with that name exists. General Google text search did not yield readable results.
- Existing PH planning topic recommended Sente for an earlier portfolio-launch request. This task explicitly asks for a news-led new product; BuildPeek is a separate experiment, not a rename/relaunch of Sente.

## Timely distribution opportunity

- Official contest: https://www.producthunt.com/contests/gpt-6-astra-challenge
- Official announcement: https://www.producthunt.com/p/producthunt/product-hunt-teams-up-with-openaidevs-for-the-gpt-6-astra-challenge
- Launch guide (read in a real Chromium browser because Notion required JS): https://producthunt.s.gy/forum-astra-launch-guide
- Guide states launch must be scheduled September 18, 2026, at 12:01 AM Pacific. September is PDT: **September 18, 16:01 JST / 07:01 UTC**.
- Top five launches receive $10K in API credits and one year of ChatGPT Pro for up to two team members, according to that guide. No guarantee of eligibility, curation or prizes.
- Guide describes building with Astra and shoutouts to tools; it does not explicitly require runtime API inference in the readable text. This app was built with GPT-6 Astra through Sente, but does not perform runtime model calls. State this transparently. Final contest acceptance remains unverified until actual submission.
- Contest page's text countdown rendered 00:00:00 while guide says September 18. Do not infer closure or acceptance from the static countdown; check the live contest submission flow.
- General guide permits descriptions up to 500 characters; contest guide says **260 max**. Use under 260 for both.
- Required: square thumbnail (recommended 240×240), 2 gallery images (recommended 1270×760). Optional video is YouTube, not private. The older memory assertion that all unlisted video is disallowed was not supported by the current guide; validate actual form if used.
- Official https://www.producthunt.com/launch states no direct upvote requests. Invite product use and specific feedback.

## Access actually checked

- GitHub API authenticated as `yukihamada`; proposed repository does not exist.
- Existing Chrome CDP 9333 is logged into Product Hunt. A newly opened `/posts/new` page displayed the new-product URL field and an existing `chatweb.ai` draft. No fields were changed and no draft was replaced.
- `xapi me` authenticated as `@yukihamada` (id 5663582).
- No paid inference, domain purchase, paid advertisement, public repository creation, release or post performed during preparation.
- Workspace's prescribed `~/.claude/tools/yuki-reviewer/check.py` is absent (also searched for an alternate under `.claude`). Automated personal-style review is unavailable; publicly intended copy has been manually checked against loaded rules for hype, competitor-comparison claims, secrets and unsupported metrics.

## Go / no-go

Go to public preview only after owner approves name, public repository and static hosting. Go to PH only after public URL verification and live form/contest eligibility confirmation. Goal: useful reviews and actionable feedback, not vote manipulation.
