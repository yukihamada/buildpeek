#!/bin/sh
# Launch-day observation for BuildPeek, run from this Mac.
#
# Why this exists: GitHub Actions egress IPs are blocked by Product Hunt
# (observed 403 on a runner while the same request returned 200 locally), so
# the scheduled CI run records no PH numbers. This runs the same script from a
# normal network and pushes the record.
#
# Safety, learned from the 2026-09-10 launchd incident (KeepAlive + te run
# re-spawned 12,912 times and drained the balance):
#   - No KeepAlive. The plist uses StartInterval only.
#   - A date guard exits immediately outside the launch window, so a stray
#     invocation months later does nothing.
#   - A lock file prevents overlapping runs.
#   - git push is attempted once; failure is logged, never retried in a loop.
set -eu

REPO=/Users/yukihamada/workspace/buildpeek
LOCK=/tmp/buildpeek-watch.lock
LOG=/tmp/buildpeek-watch.log
# Observe 2026-09-18 and 2026-09-19 (24h mark) only.
WINDOW_START=20260918
WINDOW_END=20260920

today=$(date -u +%Y%m%d)
if [ "$today" -lt "$WINDOW_START" ] || [ "$today" -ge "$WINDOW_END" ]; then
  echo "$(date -u +%FT%TZ) outside launch window ($today); nothing to do" >> "$LOG"
  exit 0
fi

if [ -e "$LOCK" ]; then
  # Stale lock from a crashed run: clear it after 15 minutes.
  if [ "$(find "$LOCK" -mmin +15 2>/dev/null)" ]; then
    rm -f "$LOCK"
  else
    echo "$(date -u +%FT%TZ) another run is in progress; skipping" >> "$LOG"
    exit 0
  fi
fi
trap 'rm -f "$LOCK"' EXIT INT TERM
: > "$LOCK"

cd "$REPO"

set -a
. "$HOME/.config/twitter/.env"
set +a
export TWEET_IDS="2100002084640956700,2100010007475712451"

echo "=== $(date -u +%FT%TZ) ===" >> "$LOG"
python3 tools/launch_watch.py >> "$LOG" 2>&1 || echo "observer failed" >> "$LOG"

git add state/observations.jsonl
if git diff --cached --quiet; then
  echo "no change" >> "$LOG"
  exit 0
fi
git -c user.name="buildpeek-launch-watch" -c user.email="mail@yukihamada.jp" \
  commit -q -m "chore: launch observation $(date -u +%Y-%m-%dT%H:%MZ) [skip ci]"
git push -q origin HEAD:main || echo "push failed (will be retried next run)" >> "$LOG"
