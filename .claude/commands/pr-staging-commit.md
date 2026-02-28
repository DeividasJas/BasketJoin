# Commit, Push & Create PR to Staging

Commit all changes, push the branch, and create a pull request to `staging`.

## Instructions

1. **Check git status** - Run in parallel:
   - `git status` to see staged and unstaged changes
   - `git diff` to review all changes
   - `git log --oneline -5` to match commit message style

2. **Stage and commit**:
   - Stage all relevant changed files (avoid .env, credentials, etc.)
   - Evaluate if changes should be split into multiple commits — if yes, ask the user
   - Use Conventional Commits format (e.g. `feat(scope): subject`)
   - Do NOT include Co-Authored-By or AI attribution
   - **Do NOT append any watermark, attribution, or "Generated with" footer to the PR body**

3. **Push the branch** with `git push -u origin HEAD`.

4. **Get commits since staging** - Run:
   - `git log staging...HEAD --oneline` to see all commits for the PR summary

5. **Create the PR** using `gh pr create --base staging`:

```
gh pr create --base staging --title "title here" --body "$(cat <<'EOF'
## Summary
- bullet points summarizing changes
EOF
)"
```

6. **Return the PR URL** to the user.
