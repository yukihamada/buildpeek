# BuildPeek launch day — resume prompt

You are resuming the BuildPeek Product Hunt launch. Read this file, then act.
Do not re-derive context from scratch; the details below are current as of
2026-09-16. Verify anything time-sensitive before acting on it.

## What BuildPeek is

A free, local-first browser tool that reviews Dockerfiles and image history for
build-secret patterns. Eight explainable heuristic rules. English and Japanese.
No account, no uploads, no runtime model calls.

- App: https://yukihamada.github.io/buildpeek/
- Repo: https://github.com/yukihamada/buildpeek
- Product Hunt: https://www.producthunt.com/products/buildpeek

## Status

- Scheduled on Product Hunt for **2026-09-18 12:01am PT = 16:01 JST = 07:01 UTC**,
  entered in the GPT-6 Astra Challenge.
- Two X posts already published (ids 2100002084640956700, 2100010007472451).
- Launch-day observation is automated (launchd `tokyo.hamada.buildpeek-launch-watch`,
  every 2 hours) and appends to `state/observations.jsonl`.

## Your job on launch day

1. **Check whether the launch is actually live.** Run `python3 tools/launch_watch.py`
   in this repo, or read `state/observations.jsonl`. Look for
   `disabled_when_scheduled: false` / `live: true`. If it is not live yet, say so
   and stop — do not post "it's live" for a scheduled launch.

2. **Read the comments on the PH page** and reply to each one. Use a real browser
   via the existing Chrome CDP on port 9333 if helpful.

3. **Post the launch-day X announcement** only after confirming the PH page is
   live. Copy is in `launch/OUTREACH.md`.

4. **Report actual measured numbers only.** Never invent impressions, upvotes or
   ranks. If a number is unavailable, say it is unavailable.

## Hard rules

- **Never ask for upvotes.** Product Hunt bans this and it can get the launch
  removed. Asking people to visit and comment is fine.
- **Never claim BuildPeek is more than it is.** It is eight heuristics over
  supplied text. It does not scan filesystem layers, does not check whether
  credentials work, and is not a security certification. Say this plainly when
  someone asks.
- **Do not fabricate user feedback or metrics.**
- Measurement is already automated; do not add a second scheduler or a
  KeepAlive launchd job. See the 2026-09-10 incident in memory
  (`launchd-te-run-loop.md`) for why.

## Where things are

- `launch/EVIDENCE.md` — everything verified, with commands run
- `launch/SUBMISSION.md` — what was submitted to PH, including the contest answer
- `launch/OUTREACH.md` — X copy and follow-through plan
- `launch/SELF-REVIEW.md` — self-review against a real Docker image
- `launch/FEEDBACK-7.md` — proxy persona review (written by me, not real users)
- `README.md` — scope, rules, and what this does not do

## If something is wrong

Report the exact blocker with evidence. Do not silently pick a different date,
do not rewrite submitted copy without saying so, and do not post on X about a
launch that is not live.
