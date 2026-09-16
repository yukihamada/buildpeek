#!/bin/sh
# Launch-day observation on this Mac, because GitHub Actions egress IPs are
# sometimes blocked by Product Hunt (observed 403 on a runner, 200 locally).
# Runs every 2 hours on 2026-09-18 and appends to state/observations.jsonl.
#
# Install:  cp tools/launch-watch.local.sh /usr/local/bin/buildpeek-watch
#           (then schedule with launchd or cron)
# Remove:   rm /usr/local/bin/buildpeek-watch
set -eu

REPO=/Users/yukihamada/workspace/buildpeek
cd "$REPO"

set -a
. "$HOME/.config/twitter/.env"
set +a
export TWEET_IDS="2100002084640956700,2100010007475712451"

python3 tools/launch_watch.py > /tmp/buildpeek-watch.log 2>&1 || true

git add state/observations.jsonl
if git diff --cached --quiet; then
  echo "no change"
  exit 0
fi
git -c user.name="buildpeek-launch-watch" -c user.email="mail@yukihamada.jp" \
  commit -q -m "chore: launch observation $(date -u +%Y-%m-%dT%H:%MZ) [skip ci]"
git push -q origin HEAD:main
