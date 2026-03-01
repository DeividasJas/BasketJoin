# Create PR from Staging to Main

Create a pull request from `staging` to `main`.

## Instructions

1. **Get context** - Run in parallel:
   - `git log main...staging --oneline` to see all commits on staging since main
   - `git diff main...staging --stat` to see changed files summary
   - `gh pr list --base main --head staging --state merged --limit 1 --json title,body` to get the previous staging → main PR for reference

2. **If staging is not ahead of main**, inform the user there's nothing to PR.

3. **Draft the PR**:
   - Title: brief summary of what staging includes (Conventional Commits style, max 70 chars)
   - Body: short bullet points summarizing all changes since main
   - Include a brief note about what was in the previous staging → main PR for context
   - **Do NOT append any watermark, attribution, or "Generated with" footer to the PR body**

4. **Create the PR** using `gh pr create`:

```
gh pr create --base main --head staging --title "title here" --body "$(cat <<'EOF'
## Summary
- bullet points summarizing changes

## Previous release
- brief summary of last staging → main PR
EOF
)"
```

5. **Return the PR URL** to the user.
