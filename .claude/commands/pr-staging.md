# Create PR to Staging

Create a pull request from the current branch to the `staging` branch.

## Instructions

1. **Check branch state** - Run these in parallel:
   - `git status` to check for uncommitted changes
   - `git log staging...HEAD --oneline` to see all commits since diverging from staging
   - `git diff staging...HEAD --stat` to see changed files summary
   - Check if the branch is pushed to remote

2. **If there are uncommitted changes**, warn the user and ask if they want to commit first before creating the PR.

3. **If the branch is not pushed**, push it with `git push -u origin HEAD`.

4. **Draft the PR**:
   - Title: use Conventional Commits style, max 70 chars (e.g. `feat(admin): add cover image management`)
   - Body: short summary of ALL commits from the branch as bullet points
   - Always target `staging` as the base branch
   - **Do NOT append any watermark, attribution, or "Generated with" footer to the PR body**

5. **Create the PR** using `gh pr create --base staging` with this format:

```
gh pr create --base staging --title "title here" --body "$(cat <<'EOF'
## Summary
- bullet points summarizing changes
EOF
)"
```

6. **Return the PR URL** to the user.
