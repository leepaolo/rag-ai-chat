---
paths:
  - ".claude/**"
  - ".mcp.json"
---

# Claude Code setup

- `.claude/settings.json`: shared permissions and hooks (committed). Personal overrides go in `.claude/settings.local.json` (gitignored).
- `.claude/hooks/`: workflow hooks (`lint-format.sh` after edits, `block-untested-commit.sh` before `git commit`).
- `.claude/guardrails/`: safety hooks (`block-dangerous-git.sh`, `secret-scan.sh`). They read raw command text, so even mentioning a blocked command or a credential-shaped string in a command triggers them.
- Hooks and guardrails share `.claude/hooks/lib/json.sh`, which parses hook JSON with Node so `jq` is not required.
- `.claude/rules/`: topic rules, each loaded only for files that match its `paths:` frontmatter.
- `.claude/skills/`: project skills (`pr-creation`).

## MCP servers (`.mcp.json`, all placeholders)

JSON allows no comments, so here is what each server is for:

- `git`: structured git history/diff queries (needs `uvx`). Mostly redundant with Bash `git`; remove if unused.
- `github`: GitHub's remote MCP for issues, PRs, and reviews. Needs `GITHUB_PAT` exported in your shell (`gh` CLI is an alternative).
- `postgres`: read-only SQL against the app DB. Needs `DATABASE_URL` exported. `@modelcontextprotocol/server-postgres` is archived upstream; TODO: swap for your DB vendor's server (e.g. Neon).
- `filesystem`: sandboxed file access. Redundant with Claude Code's built-in file tools; remove if unused.

`${VAR}` values are expanded from the shell environment when Claude Code starts, not from `.env` files.
