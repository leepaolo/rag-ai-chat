#!/bin/sh
# PostToolUse (Write|Edit|MultiEdit): auto-fix the edited file with ESLint and
# report anything left over. Exit 2 feeds stderr back to Claude so it fixes the
# remaining problems; the edit itself has already happened.
set -u
. "$(dirname "$0")/lib/json.sh"

INPUT=$(cat)
FILE=$(json_field "$INPUT" tool_input.file_path)
[ -n "$FILE" ] && [ -f "$FILE" ] || exit 0

case "$FILE" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs) ;;
  *) exit 0 ;;
esac

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

# TODO: add a formatter step (e.g. `npx --no-install prettier --write "$FILE"`)
# once one is chosen. Today ESLint --fix is the only formatter (see .claude/rules/code-style.md).
if ! OUT=$(npx --no-install eslint --fix --max-warnings 0 "$FILE" 2>&1); then
  printf 'ESLint found problems it could not auto-fix in %s:\n%s\n' "$FILE" "$OUT" | tail -n 60 >&2
  exit 2
fi
exit 0
