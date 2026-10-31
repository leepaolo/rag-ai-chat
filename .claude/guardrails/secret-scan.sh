#!/bin/sh
# PreToolUse (Bash|Write|Edit|MultiEdit): block content that looks like a
# credential before it lands in a file or a commit, and block shell access to
# .env files (permissions.deny only covers the Read/Edit tools).
#
# Scans: Write content, Edit new_string, MultiEdit edits, Bash command text,
# and the added lines of `git diff HEAD` when the command is a `git commit`.
set -u
. "$(dirname "$0")/../hooks/lib/json.sh"

# High-confidence token formats (case-sensitive).
PATTERNS='AKIA[0-9A-Z]{16}'
PATTERNS="$PATTERNS"'|-----BEGIN ([A-Z]+ )?PRIVATE KEY-----'
PATTERNS="$PATTERNS"'|gh[pousr]_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{60,}'
PATTERNS="$PATTERNS"'|(^|[^A-Za-z0-9_-])sk-(ant-|proj-)?[A-Za-z0-9_-]{32,}'
PATTERNS="$PATTERNS"'|(sk|rk)_live_[A-Za-z0-9]{20,}'
PATTERNS="$PATTERNS"'|xox[baprs]-[A-Za-z0-9-]{10,}'
PATTERNS="$PATTERNS"'|AIza[0-9A-Za-z_-]{35}'
PATTERNS="$PATTERNS"'|(postgres|postgresql|mysql|mongodb(\+srv)?|redis)://[^:/@[:space:]]+:[^@/[:space:]]+@'
# Generic `secret = "long-literal"` assignments (case-insensitive).
GENERIC='(api[_-]?key|secret|token|passw(or)?d)[A-Za-z_]*["]?[[:space:]]*[:=][[:space:]]*["][A-Za-z0-9/+_.-]{16,}["]'
# Obvious placeholders that should not trigger a block.
ALLOW=':(password|pass|changeme|user|\$\{?[A-Za-z_]+\}?|<[^>]*>)@|example|placeholder|xxxx|your[_-]'
# TODO: add project-specific token formats (e.g. your vector DB / LLM provider keys).

block() {
  printf 'Blocked by secret-scan: %s\n' "$1" >&2
  printf 'Use an environment variable (process.env.X) instead of a literal. If this is a false positive, adjust .claude/guardrails/secret-scan.sh.\n' >&2
  exit 2
}

INPUT=$(cat)
TOOL=$(json_field "$INPUT" tool_name)
FILE=$(json_field "$INPUT" tool_input.file_path)

case "$FILE" in
  *.example|*.sample|*.template) exit 0 ;;
esac

case "$TOOL" in
  Write) CONTENT=$(json_field "$INPUT" tool_input.content) ;;
  Edit) CONTENT=$(json_field "$INPUT" tool_input.new_string) ;;
  MultiEdit) CONTENT=$(json_field "$INPUT" tool_input.edits) ;;
  Bash)
    CONTENT=$(json_field "$INPUT" tool_input.command)
    ENV_REFS=$(printf '%s' "$CONTENT" | grep -oE '(^|[^A-Za-z0-9_.])\.env[A-Za-z0-9._-]*' |
      sed 's/^[^.]*//' | grep -vxE '\.env\.(example|sample|template)')
    [ -n "$ENV_REFS" ] && block "shell commands may not touch .env files ($(printf '%s' "$ENV_REFS" | head -n 1))."
    if printf '%s' "$CONTENT" | grep -Eq '(^|[;&|(])[[:space:]]*git[[:space:]]+commit([[:space:]]|$)'; then
      DIFF=$(git -C "${CLAUDE_PROJECT_DIR:-.}" diff HEAD 2>/dev/null || git -C "${CLAUDE_PROJECT_DIR:-.}" diff --cached)
      CONTENT="$CONTENT
$(printf '%s\n' "$DIFF" | grep '^+' | grep -v '^+++')"
    fi
    ;;
  *) exit 0 ;;
esac

[ -n "$CONTENT" ] || exit 0

HIT=$( { printf '%s\n' "$CONTENT" | grep -oE "$PATTERNS"
         printf '%s\n' "$CONTENT" | grep -oiE "$GENERIC"; } | grep -viE "$ALLOW" | head -n 1)

if [ -n "$HIT" ]; then
  # Show only a prefix so the secret itself is not echoed back into the transcript.
  block "possible credential detected ($(printf '%s' "$HIT" | sed 's/^[^A-Za-z0-9]*//' | cut -c1-8)...)${FILE:+ in $FILE}."
fi
exit 0
