# Commit Changes

Analyze staged changes and create a commit with a well-crafted message using Conventional Commits style.

## Commit Message Style

This project uses **Conventional Commits** with optional body:

```
type(scope): subject

body (optional - use when context is needed)

footer (optional - for issue references)
```

**Types:**

- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code restructuring
- `perf` - Performance improvement
- `docs` - Documentation
- `test` - Tests
- `chore` - Build/tooling/dependencies
- `style` - Code formatting

**Examples:**

```
feat(credits): add credit top-up endpoint

fix(auth): prevent token expiration during active session

Users were being logged out despite active usage. Added token
refresh mechanism that extends expiration when user is active.

```

## Instructions

1. **Check git status** to see staged and unstaged changes

2. **Evaluate if changes should be split** - If there are many staged files:
   - Analyze if changes represent multiple logical units (different features, unrelated fixes, etc.)
   - If yes, **recommend splitting into separate commits** and ask user which files to commit first
   - Group related changes together (e.g., entity + DTO + service for one feature)
   - Example: Don't mix "add new feature" with "fix unrelated bug" in same commit

3. **Review the diff** of staged changes to understand what was modified

4. **Look at recent commits** to match the repository's commit message style

5. **Create the commit** using Conventional Commits format:
   - Choose appropriate type (feat, fix, refactor, etc.)
   - Add scope if applicable (module/feature name)
   - Write clear subject line (imperative mood, no period, max 80 chars)
   - Add body if changes need explanation (wrap at 80 chars)
   - **Do NOT include Co-Authored-By or any AI attribution in commit messages**

If there are no staged changes, check for unstaged changes and ask the user if they want to stage specific files before committing
