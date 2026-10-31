#!/bin/sh
# PreToolUse (Bash): block pushes to main/master, force-pushes, and
# `git reset --hard`. Backs up the permissions.deny rules in settings.json,
# which only match literal command prefixes and are easy to sidestep.
# TODO: extend with other destructive ops you want gated (git clean -fd, branch -D, ...).
set -u
. "$(dirname "$0")/../hooks/lib/json.sh"

INPUT=$(cat)
CMD=$(json_field "$INPUT" tool_input.command)
[ -n "$CMD" ] || exit 0

block() {
  printf 'Blocked by guardrail: %s\nCommand: %s\n' "$1" "$CMD" >&2
  exit 2
}

matches() { printf '%s' "$CMD" | grep -Eq "$1"; }

START='(^|[;&|(])[[:space:]]*'

if matches "${START}git[[:space:]]+push([[:space:]]|$)"; then
  matches 'git[[:space:]]+push[^;&|]*(--force|[[:space:]]-[a-zA-Z]*f[a-zA-Z]*([[:space:]]|$)|[[:space:]]\+[^[:space:]]+)' &&
    block "force-push is not allowed."
  matches 'git[[:space:]]+push[^;&|]*[[:space:]:](main|master)([[:space:]]|$)' &&
    block "pushing to main is not allowed; push a feature branch and open a PR."

  # `git push`, `git push origin` or `git push ... HEAD` push the current branch.
  if matches 'git[[:space:]]+push([[:space:]]+[^-[:space:];&|][^[:space:];&|]*)?[[:space:]]*($|[;&|])' ||
     matches 'git[[:space:]]+push[^;&|]*[[:space:]]HEAD([[:space:]]|$)'; then
    BRANCH=$(git -C "${CLAUDE_PROJECT_DIR:-.}" symbolic-ref --short HEAD 2>/dev/null)
    case "$BRANCH" in
      main|master) block "the current branch is $BRANCH; push a feature branch and open a PR." ;;
    esac
  fi
fi

matches "${START}git[[:space:]]+reset[^;&|]*--hard" &&
  block "git reset --hard discards work; use git stash or a new branch instead."

exit 0
