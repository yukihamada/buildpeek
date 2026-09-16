#!/bin/sh
# Fire the BuildPeek launch-day resume once, at the scheduled moment.
#
# Runs from launchd on 2026-09-18. Unlike the observer
# (launch-watch.local.sh) this runs ONCE, not every 2 hours: it opens a
# terminal with the agent so a human can handle PH comments.
#
# Safety, from the 2026-09-10 incident (KeepAlive + te run respawned 12,912
# times and drained the balance):
#   - No KeepAlive in the plist; StartInterval only.
#   - A date+time guard: outside the window it exits immediately, so a stray
#     invocation months later does nothing.
#   - A one-shot marker file: once it has fired, it never fires again, even if
#     launchd re-invokes it. Delete the marker to re-arm.
set -eu

REPO=/Users/yukihamada/workspace/buildpeek
LOG=/tmp/buildpeek-resume-trigger.log

# Fire on 2026-09-18 JST, from 15:30 onwards.
# BP_TEST_* let the guards be exercised without waiting for launch day.
WINDOW_START=${BP_TEST_START:-20260918}
WINDOW_END=${BP_TEST_END:-20260919}
EARLIEST=${BP_TEST_EARLIEST:-1530}
MARKER=${BP_TEST_MARKER:-/tmp/buildpeek-resume-fired}

now=$(date +%Y%m%d)
today_jst=${BP_TEST_TODAY:-$(TZ=Asia/Tokyo date +%Y%m%d)}
time_jst=${BP_TEST_TIME:-$(TZ=Asia/Tokyo date +%H%M)}

if [ -f "$MARKER" ]; then
  exit 0
fi

if [ "$today_jst" -lt "$WINDOW_START" ] || [ "$today_jst" -ge "$WINDOW_END" ]; then
  echo "$(date -u +%FT%TZ) outside resume window (jst=$today_jst); skip" >> "$LOG"
  exit 0
fi

# Do not fire before 15:30 JST; the event starts at 15:30 and PH goes live 16:01.
if [ "$time_jst" -lt "$EARLIEST" ]; then
  echo "$(date -u +%FT%TZ) too early (jst=$time_jst); skip" >> "$LOG"
  exit 0
fi

echo "$(date -u +%FT%TZ) firing resume" >> "$LOG"
: > "$MARKER"

exec "$REPO/tools/resume-launch.sh"
