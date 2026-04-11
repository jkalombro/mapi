---
description: Initialize a new project by cleaning up boilerplate artifacts and creating a GitHub repository.
---

## Outline

### Step 1 — Detect Project Name

Determine `PROJECT_NAME` from the root folder of the current working directory:

```bash
basename $(pwd)
```

Store this as `PROJECT_NAME`. This will be used as the GitHub repository name.

---

### Step 2 — Delete the `.github` Folder

Check if `.github/` exists at the repo root.

- If it exists: delete it.
  ```bash
  rm -rf .github
  ```
- If it does not exist: note "`.github/` not found — skipping."

---

### Step 3 — Update `.gitignore`

Read the current contents of `.gitignore` at the repo root.

Perform the following edits in a single update:

1. **Remove** the line `/UI/` (exact match, including the newline).
2. **Remove** the line `/API/` (exact match, including the newline).
3. **Add** `/.scaffolding/` as a new line if it is not already present.

Save the updated `.gitignore`.

---

### Step 4 — Resolve `gh` CLI Path

Before running any `gh` commands, resolve the CLI path with:

```bash
GH=$(which gh 2>/dev/null || echo "/c/Program Files/GitHub CLI/gh.exe")
```

Verify authentication:

```bash
"$GH" auth status 2>&1
```

- If not authenticated: stop with:
  ```
  GitHub CLI is not authenticated. Run `gh auth login` first.
  ```

---

### Step 5 — Create GitHub Repository

Run the following command to create a new **private** GitHub repository named `PROJECT_NAME` under the authenticated user's account:

```bash
"$GH" repo create <PROJECT_NAME> --private --source=. --remote=origin --push
```

- If the repository already exists or the command fails: report the exact error output and stop.

---

### Step 6 — Output Summary

Print the following summary:

```
## Summary — init-new-project complete

- Project name:   <PROJECT_NAME>
- .github folder: deleted
- .gitignore:     removed /UI/ and /API/ entries; added /.scaffolding/
- GitHub repo:    created (private) and pushed

## Next Steps

1. Add team collaborators:  gh repo edit --add-collaborator <username>
2. Define your first feature: /speckit.specify "<feature description>"
```
