#!/bin/sh
# PreToolUse (Bash): before any `git commit`, run the test suite. Until a test
# runner exists, fall back to typecheck + lint. Exit 2 blocks the commit and
# shows Claude the failure output.
set -u
. "$(dirname "$0")/lib/json.sh"

INPUT=$(cat)
CMD=$(json_field "$INPUT" tool_input.command)
printf '%s' "$CMD" | grep -Eq '(^|[;&|(])[[:space:]]*git[[:space:]]+commit([[:space:]]|$)' || exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

fail() {
  printf 'Commit blocked: %s Fix and retry.\n' "$1" >&2
  printf '%s\n' "$2" | tail -n 60 >&2
  exit 2
}

if node -e 'process.exit(require("./package.json").scripts?.test ? 0 : 1)'; then
  # The "test" script must run once and exit (e.g. `vitest run`, not watch mode).
  OUT=$(npm test --silent 2>&1) || fail "tests failed." "$OUT"
else
  # TODO: remove this fallback once a test runner is set up (see .claude/rules/testing.md).
  OUT=$(npx --no-install tsc --noEmit 2>&1) || fail "type errors." "$OUT"
  OUT=$(npm run lint --silent 2>&1) || fail "lint errors." "$OUT"
fi
exit 0
