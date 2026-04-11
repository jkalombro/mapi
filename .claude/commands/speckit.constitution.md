---
description: Create or update the project constitution from interactive or provided principle inputs, ensuring all dependent templates stay in sync.
handoffs: 
  - label: Build Specification
    agent: speckit.specify
    prompt: Implement the feature specification based on the updated constitution. I want to build...
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

`.specify/memory/constitution.md` is a **gateway index only** — it holds references to language-specific constitution files in `.specify/memory/language-templates/`. **Never write constitution content directly into `constitution.md`.**

Each language/framework has its own dedicated file:
`.specify/memory/language-templates/[language].constitution.md`
(e.g., `angular.constitution.md`, `dotnet.constitution.md`, `react.constitution.md`)

Follow this execution flow:

1. Load `.specify/memory/constitution.md` to read the current index of registered constitutions.

2. Determine the target language/framework:
   - If user input names a language/framework, use it.
   - If ambiguous, ask before proceeding.

3. Resolve the target file: `.specify/memory/language-templates/[language].constitution.md`
   - **Existing language** (file already exists): load it — this is an **amendment** workflow.
   - **New language** (file does not exist): **copy `.specify/memory/language-templates/template.constitution.md`** as the starting point — this is a **new constitution** workflow. Do not use any other template source.
   - Naming convention: lowercase, hyphen-separated (e.g., `node-express.constitution.md`).

4. Identify every placeholder token of the form `[ALL_CAPS_IDENTIFIER]` in the loaded file.
   **IMPORTANT**: The user might require fewer or more principles than those in the template. Respect that and adjust accordingly.

5. Collect/derive values for placeholders:
   - If user input supplies a value, use it.
   - Otherwise infer from repo context (README, docs, prior versions).
   - For governance dates: `RATIFICATION_DATE` is the original adoption date (if unknown, ask or mark TODO); `LAST_AMENDED_DATE` is today if changes are made, otherwise keep previous.
   - `CONSTITUTION_VERSION` must increment by semantic versioning rules:
     - MAJOR: Backward incompatible governance/principle removals or redefinitions.
     - MINOR: New principle/section added or materially expanded guidance.
     - PATCH: Clarifications, wording, typo fixes, non-semantic refinements.
   - If version bump type is ambiguous, propose reasoning before finalizing.

6. Draft the updated constitution content:
   - Replace every placeholder with concrete text (no bracketed tokens left except intentionally retained slots — explicitly justify any left).
   - Preserve heading hierarchy.
   - Ensure each Principle section has: a succinct name line, a paragraph or bullet list of non-negotiable rules, and explicit rationale if not obvious.
   - Ensure a Governance section listing amendment procedure, versioning policy, and compliance review expectations.

7. Consistency propagation checklist:
   - Read `.specify/templates/plan-template.md` and ensure any "Constitution Check" rules align with updated principles.
   - Read `.specify/templates/spec-template.md` for scope/requirements alignment — update if constitution adds/removes mandatory sections or constraints.
   - Read `.specify/templates/tasks-template.md` and ensure task categorization reflects new or removed principle-driven task types.
   - Read any runtime guidance docs (e.g., `README.md`, `docs/quickstart.md`) and update references to changed principles.

8. Produce a Sync Impact Report (prepend as an HTML comment at the top of the language constitution file after update):
   - Version change: old → new
   - List of modified principles (old title → new title if renamed)
   - Added sections / Removed sections
   - Templates requiring updates (✅ updated / ⚠ pending) with file paths
   - Follow-up TODOs if any placeholders intentionally deferred.

9. Validation before final output:
   - No remaining unexplained bracket tokens.
   - Version line matches report.
   - Dates ISO format YYYY-MM-DD.
   - Principles are declarative and testable ("should" → MUST/SHOULD where appropriate).

10. Write the completed content to `.specify/memory/language-templates/[language].constitution.md` (overwrite). **Do not write to `constitution.md`.**

11. If this was a **new constitution** (file did not exist before step 3):
    - Update `.specify/memory/constitution.md` to register the new file under the appropriate section heading (e.g., `## UI`, `## API`).
    - Format: `- [FrameworkName](./language-templates/[language].constitution.md)`
    - If no matching section heading exists, add a new one.

12. Output a final summary to the user with:
    - Target file written: `.specify/memory/language-templates/[language].constitution.md`
    - New version and bump rationale.
    - Whether `constitution.md` index was updated (new registration only).
    - Any files flagged for manual follow-up.
    - Suggested commit message (e.g., `docs: amend angular constitution to vX.Y.Z`).

Formatting & Style Requirements:

- Use Markdown headings exactly as in the template (do not demote/promote levels).
- Wrap long rationale lines to keep readability (<100 chars ideally).
- Keep a single blank line between sections.
- Avoid trailing whitespace.

If the user supplies partial updates (e.g., only one principle revision), still perform validation and version decision steps.

If critical info is missing (e.g., ratification date truly unknown), insert `TODO(<FIELD_NAME>): explanation` and include it in the Sync Impact Report under deferred items.
