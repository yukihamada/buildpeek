#!/bin/sh
# Resume the BuildPeek launch task from a calendar event.
#
# Opens Ghostty running the launch-day task in the BuildPeek repo, so the work
# continues with its context instead of being re-explained.
#
# launch/RESUME-PROMPT.md is the single source of truth for what "this task"
# means, so the calendar event and this script cannot drift apart.
#
# Ghostty is used because `open -na Ghostty.app --args -e <cmd>` was verified
# launching a window that runs the command (verified 2026-09-16). It takes a
# few seconds to appear, so a pgrep immediately after is a false negative.
#
# Output is tee'd so a failed resume leaves evidence instead of a blank window.
# The window stays open at the end so errors are readable.
set -eu

REPO=/Users/yukihamada/workspace/buildpeek
PROMPT_FILE="$REPO/launch/RESUME-PROMPT.md"
LOG=/tmp/buildpeek-resume.log
RUN_LOG=/tmp/buildpeek-resume-run.log

if [ ! -f "$PROMPT_FILE" ]; then
  echo "prompt file missing: $PROMPT_FILE" >&2
  exit 1
fi

echo "$(date -u +%FT%TZ) resume requested" >> "$LOG"

# The prompt is read from the file at launch time, so editing the file changes
# what the calendar event does without touching the calendar.
#
# te is preferred; on 2026-09-16 it started but returned "Unexpected server
# error" for every run, so a plain `command -v` check is not enough. The
# fallback triggers on a non-zero exit or an error in the output, rather than
# leaving a dead window.
CMD="cd '$REPO' && prompt=\"\$(cat '$PROMPT_FILE')\"; "
CMD="$CMD run_te() { te run \"\$prompt\" 2>&1 | tee /tmp/bp-te.log; }; "
CMD="$CMD if command -v te >/dev/null 2>&1; then "
CMD="$CMD   if run_te && ! grep -qi 'Unexpected server error' /tmp/bp-te.log; then exit 0; fi; "
CMD="$CMD   echo 'te failed; falling back to claude' >> /tmp/bp-te.log; "
CMD="$CMD fi; "
CMD="$CMD if command -v claude >/dev/null 2>&1; then claude -p \"\$prompt\"; "
CMD="$CMD else echo 'No working agent found (te failed and claude missing)'; fi"

open -na Ghostty.app --args -e /bin/sh -c \
  "$CMD 2>&1 | tee '$RUN_LOG'; echo; echo '--- done. press enter to close ---'; read _"

echo "$(date -u +%FT%TZ) launched" >> "$LOG"
