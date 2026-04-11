---
description: Scaffold a new UI application and wire its framework constitution into the project.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

### Step 0 — Argument Validation

Parse `FRAMEWORK` and `APP_NAME` from `$ARGUMENTS` (first and second whitespace-separated tokens).

- Normalize `FRAMEWORK` to lowercase (e.g., `Angular` → `angular`, `Next.js` → `nextjs`, `NextJS` → `nextjs`).
- If either argument is missing: output the following and **stop**:
  ```
  Usage: /create-ui-app <framework> <app-name>
  Example: /create-ui-app angular my-dashboard
  ```
- If `APP_NAME` contains spaces: warn the user ("App names with spaces are non-standard and may cause issues with scaffold tools. Proceed anyway? (yes/no)") and wait for confirmation before continuing.

---

### Step 1 — Constitution Handling

1. **Guard check**: Verify `.specify/memory/constitution.md` exists. If it does not → stop with:
   ```
   constitution.md not found. Run /speckit.constitution first to initialize your project constitution.
   ```

2. Compute the template path: `.specify/memory/language-templates/<FRAMEWORK>.constitution.md`

3. Check if the template file exists.

**Branch A — Template EXISTS:**

   a. Read `.specify/memory/constitution.md` (the gateway index) and scan for an existing reference to `language-templates/<FRAMEWORK>.constitution.md`. If a matching link is already present:
      - Inform the user: "Constitution reference for `<Framework>` already exists in `constitution.md`. Skipping registration. Run `/speckit.constitution` to update it."
      - Proceed to Step 2.

   b. Scan `.specify/memory/language-templates/<FRAMEWORK>.constitution.md` for any remaining tokens matching `[ALL_CAPS_IDENTIFIER]`. If any are found, emit a prominent warning:

      > **⚠ Warning:** The constitution file for `<Framework>` still contains unfilled placeholder tokens (e.g., `[PRINCIPLE_1_NAME]`). Run `/speckit.constitution` to fill them in before planning features.

   c. Register the framework in the gateway index. Under the `## UI` section in `.specify/memory/constitution.md` (add the section if it does not exist), append:
      `- [<Framework>](./language-templates/<framework>.constitution.md)`
      Where `<Framework>` is title-cased (e.g., `angular` → `Angular`, `react` → `React`).

**Branch B — Template DOES NOT EXIST:**

   Inform the user: "No language template found at `.specify/memory/language-templates/<FRAMEWORK>.constitution.md`."

   Then invoke `/speckit.constitution` with the following argument:

   > Define a UI constitution for the `<FRAMEWORK>` framework. Focus on: component architecture, state management patterns, routing conventions, testing approach (unit, E2E), styling methodology, build/bundle configuration, and accessibility standards. Scope this to UI development concerns only.

   Wait for `/speckit.constitution` to complete (it will create the file and register it in `constitution.md`) before proceeding to Step 1b.

---

### Step 1b — Embed Constitution in `CLAUDE.md`

After Branch A or B completes, inline the constitution into `CLAUDE.md` so its rules are always present in every future context window without requiring a manual read.

1. Read the full content of `.specify/memory/language-templates/<FRAMEWORK>.constitution.md`.

2. Read `CLAUDE.md` at the repo root. If it does not exist, create it with empty content.

3. Check whether `CLAUDE.md` already contains the marker `<!-- constitution:<FRAMEWORK> -->`.

   **If the marker EXISTS:** Replace everything between `<!-- constitution:<FRAMEWORK> -->` and `<!-- /constitution:<FRAMEWORK> -->` (inclusive) with the updated block below.

   **If the marker DOES NOT EXIST:** Append the following block to the end of `CLAUDE.md`.

   Block format:
   ```
   <!-- constitution:<FRAMEWORK> -->
   ## <Framework> Constitution

   <full content of the constitution file, verbatim>
   <!-- /constitution:<FRAMEWORK> -->
   ```

4. Save `CLAUDE.md`.

5. Inform the user: "Constitution for `<Framework>` has been embedded in `CLAUDE.md` and will be active in all future context windows."

---

### Step 2 — Determine Project Location

Check the `UI/` directory at the repo root.

**Detection logic (evaluate in order):**

1. Does `UI/` not exist, or exist but contain no files (including hidden files)? → **Case A** (fresh scaffold).

2. Does `UI/` contain any of the following project-marker files directly at its root: `package.json`, `angular.json`, `vite.config.ts`, `vite.config.js`, `next.config.js`, `next.config.ts`, `next.config.mjs`, `svelte.config.js`, `svelte.config.ts`, `nuxt.config.ts`, `nuxt.config.js`, `webpack.config.js`, `tsconfig.json`, `.eslintrc*`? → **Case B** (existing single project at root).

3. Does `UI/` contain subdirectories but no project-marker files at root? → **Case C** (multi-project mode).

4. Does `UI/` contain both project-marker files at root AND subdirectories? → **Case B** (root-level project takes precedence).

**Case A actions:** Note that `UI/` is empty or absent. The scaffold will create `UI/<APP_NAME>/`; you will flatten it to `UI/` afterward (Step 3).

**Case B actions — find existing project name:**

1. Attempt to read `UI/package.json` → extract the `name` field.
2. If absent, read `UI/angular.json` → extract the first key under `projects`.
3. If absent, look for a `*.csproj` file in `UI/` → use the filename without extension.
4. If still undetermined → **ask the user**: "I found an existing project in `UI/` but could not determine its name. What should I name its subfolder when reorganizing?" Wait for response.

Once `EXISTING_NAME` is known:
1. Create `UI/<EXISTING_NAME>/`.
2. Capture the list of all current top-level entries in `UI/` (excluding `<EXISTING_NAME>/` itself) using `ls -A UI/`.
3. Move each captured entry into `UI/<EXISTING_NAME>/`.
4. Verify the move succeeded by checking `UI/<EXISTING_NAME>/package.json` (or equivalent marker file) exists.

**Guard — name conflict:** Before scaffolding, check if `UI/<APP_NAME>/` already exists (in Cases B/C) or if `UI/` already contains project files matching `<APP_NAME>` (Case A). If a conflict is detected → stop with:
```
Conflict: UI/<APP_NAME> already exists. Choose a different app name or remove the existing folder first.
```

---

### Step 3 — Scaffold the Project

#### Step 3.0 — Check for Scaffolding Template

Before running any scaffold command, check whether `.scaffolding/<FRAMEWORK>/` exists at the repo root.

**If `.scaffolding/<FRAMEWORK>/` EXISTS (template found):**

1. Compute `APP_TITLE` from `APP_NAME` by splitting on `-`, capitalizing each part, then joining:
   - e.g., `my-dashboard` → `MyDashboard`, `sample-app` → `SampleApp`

2. Determine the target directory:
   - **Case A:** target is `UI/`
   - **Cases B/C:** target is `UI/<APP_NAME>/`

3. Copy all files from `.scaffolding/<FRAMEWORK>/` into the target directory:
   ```bash
   cp -r .scaffolding/<FRAMEWORK>/. <TARGET>/
   ```

4. Replace placeholder tokens in every copied file:
   ```bash
   # Replace __APP_NAME__ and __APP_TITLE__ recursively in all text files
   find <TARGET> -type f | xargs sed -i 's/__APP_NAME__/<APP_NAME>/g; s/__APP_TITLE__/<APP_TITLE>/g'
   ```
   On Windows (PowerShell), use:
   ```powershell
   Get-ChildItem -Path <TARGET> -Recurse -File | ForEach-Object {
     (Get-Content $_.FullName -Raw) -replace '__APP_NAME__', '<APP_NAME>' -replace '__APP_TITLE__', '<APP_TITLE>' | Set-Content $_.FullName
   }
   ```

5. Run `npm install` in the target directory to install dependencies.

6. Note in the summary that a scaffolding template was used instead of the CLI scaffold command.

7. **Jump to Step 4** — skip the rest of Step 3.

---

**If `.scaffolding/<FRAMEWORK>/` DOES NOT EXIST (no template):**

Proceed with the standard scaffold command below.

---

Determine the scaffold command from `FRAMEWORK`:

| Framework | Scaffold Command |
|---|---|
| `angular` | `ng new <APP_NAME>` |
| `react` | `npm create vite@latest <APP_NAME> -- --template react-ts` |
| `vue` | `npm create vite@latest <APP_NAME> -- --template vue` |
| `nextjs`, `next`, `next.js` | `npx create-next-app@latest <APP_NAME>` |
| `svelte` | `npm create vite@latest <APP_NAME> -- --template svelte` |
| `nuxt` | `npx nuxi@latest init <APP_NAME>` |
| anything else | Ask the user: "I don't have a built-in scaffold command for `<FRAMEWORK>`. Please provide the scaffold command to run from inside `UI/`, or type `skip` to create the folder manually." Wait for response. |

**If user provides a custom command:** use it exactly as provided for the execution step below.

**If user types `skip`:**
- Create `UI/<APP_NAME>/` (or `UI/` in Case A) as an empty directory.
- Note in the summary that scaffolding was skipped.
- Jump to Step 4.

**Execution:**

Run the scaffold command from inside `UI/` (i.e., set working directory to `UI/`). This creates `UI/<APP_NAME>/` as output.

- **Case A only (flatten):** After scaffolding succeeds, move the contents of `UI/<APP_NAME>/` up to `UI/` and remove the now-empty subfolder:
  ```bash
  cd UI && mv <APP_NAME>/* <APP_NAME>/.??* . 2>/dev/null; rmdir <APP_NAME>
  ```
  Verify by confirming a marker file (e.g., `package.json`, `angular.json`) now exists at `UI/` root.

- **Cases B and C:** No post-scaffold move needed. The project is already in `UI/<APP_NAME>/`.

**If the scaffold command fails** (e.g., CLI not found on PATH): report the error output verbatim, suggest installing the required CLI tool (e.g., `npm install -g @angular/cli`), and stop. Do not proceed to Step 4.

---

### Step 4 — Output Summary

Print the following summary:

```
## Summary — create-ui-app complete

- Framework:    <FRAMEWORK>
- App name:     <APP_NAME>
- Location:     UI/              ← (Case A: single project, files at root)
                UI/<APP_NAME>/   ← (Cases B/C: multi-project, named subfolder)

- Constitution: Reference to "language-templates/<framework>.constitution.md"
                registered in .specify/memory/constitution.md
```

If constitution placeholders remain unfilled, append:

```
  ⚠ WARNING: Unfilled placeholder tokens remain in the constitution file.
    Run /speckit.constitution to fill them in.
```

If the constitution reference was skipped (already existed), append:

```
  ℹ Constitution reference already registered — no changes made.
    Run /speckit.constitution to update it.
```

Then print:

```
## Next Steps

1. Fill in any constitution placeholders: /speckit.constitution
2. Define features for this app:        /speckit.specify "<feature description>"
```
