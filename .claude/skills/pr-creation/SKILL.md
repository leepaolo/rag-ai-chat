---
name: pr-creation
description: Open a GitHub pull request for the current branch. Verifies the branch, runs checks, pushes, and creates the PR with the gh CLI. Use when the user asks to open, create, or submit a PR.
# Opening a PR is outward-facing, so it only runs when invoked as /pr-creation.
# Remove this line to let Claude trigger it on its own.
disable-model-invocation: true
---

# Create a pull request

Extra context from the user (title, issue number, notes): $ARGUMENTS

## 1. Preflight

1. `git branch --show-current`. If it is `main`, do not continue on main: create a branch with `git switch -c <type>/<short-kebab-desc>` (types: `feat`, `fix`, `chore`, `docs`, `refactor`).
2. `git status`. If there are uncommitted changes, ask the user whether to commit them first.
3. `git log --oneline main..HEAD` to see which commits the PR will contain. If there are none, stop and tell the user.

## 2. Checks

Run these and stop on failure, showing the output:

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- TODO: `pnpm test` once a test runner exists (see `.claude/rules/testing.md`)

## 3. Push

`git push -u origin HEAD`. Never push to `main` or force-push; the guardrails will block it anyway.

## 4. Open the PR

Write the body to a temp file and run:

```sh
gh pr create --base main --title "<type>: <summary>" --body-file <tmpfile>
```

Body template:

```markdown
## Summary
<1-3 sentences: what and why>

## Changes
- <bullet per meaningful change>

## Test plan
- [ ] <how this was verified>

<!-- TODO: link issue, add screenshots for UI changes -->
```

## 5. Wrap up

- Print the PR URL.
- Add an entry to `.claude/docs/session-log.md`.
