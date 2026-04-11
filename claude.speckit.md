# SpecKit — Getting Started Guide

SpecKit is a **Specification-Driven Development (SDD)** system integrated with Claude Code. Instead of jumping straight into code, you work through a structured workflow: define the feature in plain language, plan the design, generate tasks, and then implement. This ensures every piece of code traces back to a clear requirement.

**Full workflow:**
```
constitution → specify → clarify → plan → checklist → tasks → analyze → implement
```

---

## Commands Reference

### `/speckit.constitution`
**Run once when starting a new project.**

Creates or updates the project constitution — the non-negotiable principles, tech constraints, and workflow rules that govern all future features. All other commands validate against this document.

- Define your tech stack, coding standards, architecture boundaries
- Updates all dependent templates automatically
- Produces a Sync Impact Report showing what changed

---

### `/speckit.specify "feature description"`
**Start here for every new feature.**

Converts a natural language description into a structured `spec.md` with user stories (P1/P2/P3), functional requirements (FR-001…), success criteria (SC-001…), and key entities. Creates a feature branch directory under `specs/`.

- Each user story is independently testable (MVP-capable)
- Marks genuinely unknown items as `[NEEDS CLARIFICATION]` (max 3)
- Auto-generates a requirements quality checklist

---

### `/speckit.clarify`
**Optional — use when the spec has ambiguities.**

Scans the spec for underspecified areas across 9 categories (functional scope, domain, UX/interaction, non-functional, integration, edge cases, constraints, terminology, completion signals) and asks up to 5 targeted clarification questions. Answers are encoded back into the spec.

- Recommended for complex or cross-team features
- Terminates when all ambiguities are resolved or question quota is reached

---

### `/speckit.plan`
**Generates the technical design artifacts.**

Two-phase execution:
- **Phase 0 (Research):** Identifies unknowns, runs research tasks, produces `research.md`
- **Phase 1 (Design):** Extracts entities → `data-model.md`, defines interface contracts in `contracts/`, generates `quickstart.md`, updates `CLAUDE.md` agent context

Also prompts you to choose a project structure:
- Single project
- Web app (frontend + backend)
- Mobile + API

---

### `/speckit.checklist "domain"`
**Optional — validates requirements writing quality.**

Generates a custom checklist that acts as "unit tests for your requirements" — not implementation tests, but checks that requirements are complete, clear, measurable, and consistent. Appends to `checklists/[domain].md`.

- Traces each item back to a spec section
- Flags gaps, ambiguities, conflicts, and assumptions

---

### `/speckit.tasks`
**Generates the implementation task list.**

Reads all design artifacts and produces a dependency-ordered `tasks.md` organized by user story. Tasks are grouped into phases:

1. **Phase 1 — Setup:** Project initialization
2. **Phase 2 — Foundational:** Blocking prerequisites (shared models, auth, DB schema)
3. **Phase 3+ — User Stories:** One phase per story, ordered P1 → P2 → P3
4. **Final — Polish:** Cross-cutting concerns

Tasks marked `[P]` are parallelizable (different files, no shared dependencies).

---

### `/speckit.analyze`
**Read-only consistency check — safe to run anytime.**

Scans `spec.md`, `plan.md`, and `tasks.md` for:
- Duplicate or conflicting requirements
- Vague language and unresolved placeholders
- Requirements with no tasks (coverage gaps)
- Orphaned tasks with no requirement
- Constitution violations (flagged as CRITICAL)

Produces a severity-ranked findings table. No edits are made unless you explicitly approve remediation suggestions.

---

### `/speckit.implement`
**Executes the implementation phase-by-phase.**

Reads `tasks.md` and works through each phase sequentially. Within a phase, tasks marked `[P]` run in parallel. For each task:
- Verifies ignore files exist (`.gitignore`, `.dockerignore`, etc.)
- Follows TDD where applicable
- Marks completed tasks `[X]` in `tasks.md`
- Halts and reports on failures before continuing

Run `/speckit.analyze` first if you want a pre-flight consistency check.

---

### `/speckit.taskstoissues`
**Optional — converts tasks to GitHub Issues.**

Reads `tasks.md` and creates a GitHub Issue for each task, preserving dependency order. Requires a GitHub remote URL and the GitHub MCP server tool.

---

## Getting Started: UI Project (Frontend / Web App)

Use this flow when building a user interface — a web app, dashboard, or frontend with a backend API.

### Step 1 — Set up the constitution
```
/speckit.constitution
```
Define your project's core principles. For a UI project, cover:
- **Framework:** React, Next.js, Vue, etc.
- **Styling:** Tailwind, CSS Modules, styled-components
- **State management:** Redux, Zustand, React Query
- **API layer:** REST vs GraphQL, base URL conventions
- **Accessibility standard:** WCAG level (e.g., AA)
- **Testing approach:** Vitest, Playwright, Storybook

> Do this once per project before writing any specs.

---

### Step 2 — Specify the first feature
```
/speckit.specify "Users can log in with email and password, see a dashboard with their recent activity, and log out"
```
Describe user-facing flows, screens, and interactions in plain language. SpecKit will extract user stories, acceptance criteria, and functional requirements.

---

### Step 3 — Clarify UX ambiguities (optional)
```
/speckit.clarify
```
Use if the spec has unclear interaction states, loading behaviors, error messages, or responsive breakpoints.

---

### Step 4 — Generate the technical plan
```
/speckit.plan
```
When prompted for project structure, select **Web app**. SpecKit will generate:
- `data-model.md` — entities and their relationships
- `contracts/` — API interface definitions (request/response shapes)
- `quickstart.md` — how to run the project locally
- Updated `CLAUDE.md` with your tech context

---

### Step 5 — Validate requirements quality (optional)
```
/speckit.checklist "ui"
```
Generates checks specific to UI concerns: accessibility, responsive design, empty states, loading states, error handling, form validation.

---

### Step 6 — Generate tasks
```
/speckit.tasks
```
Produces a task list organized as: Setup → Shared components/layouts → Auth screens (P1) → Dashboard (P2) → etc. Parallel tasks (e.g., building independent page components) are marked `[P]`.

---

### Step 7 — Run consistency analysis (optional)
```
/speckit.analyze
```
Checks that every user story has tasks, every task maps to a requirement, and no constitution rules are broken.

---

### Step 8 — Implement
```
/speckit.implement
```
Claude works through each phase, writing components, wiring API calls, and marking tasks complete. Review progress after each phase.

---

### Step 9 — Track on GitHub (optional)
```
/speckit.taskstoissues
```

---

## Getting Started: API Project (Backend / REST API)

Use this flow when building a backend service — a REST API, microservice, or data pipeline.

### Step 1 — Set up the constitution
```
/speckit.constitution
```
For an API project, cover:
- **Language/runtime:** Node.js (TypeScript), Python (FastAPI), C# (.NET), Go, etc.
- **Database:** PostgreSQL, MongoDB, Redis — and ORM/query strategy
- **Authentication:** JWT, OAuth2, API keys — and where tokens are validated
- **Error response format:** standard error shape (e.g., `{ error, message, code }`)
- **Versioning strategy:** `/v1/`, header-based, etc.
- **Testing approach:** unit + integration, test database setup

> Do this once per project before writing any specs.

---

### Step 2 — Specify the first feature
```
/speckit.specify "Users can register, log in, and manage their profile. Admins can list and deactivate users."
```
Describe the business rules, data flows, and expected behaviors. Include actor roles (user vs admin), access control expectations, and any integration points (email service, third-party APIs).

---

### Step 3 — Clarify domain ambiguities (optional)
```
/speckit.clarify
```
Use if the spec has unclear business rules, authorization logic, edge cases around data ownership, or external integration behavior.

---

### Step 4 — Generate the technical plan
```
/speckit.plan
```
When prompted for project structure, select **Single project** (or **Mobile + API** if pairing with a frontend). SpecKit will generate:
- `data-model.md` — entities, fields, relationships, indexes
- `contracts/` — endpoint definitions (method, path, request body, response shape, status codes, auth requirements)
- `research.md` — findings on third-party integrations or unknowns
- Updated `CLAUDE.md` with your tech context

---

### Step 5 — Validate requirements quality (optional)
```
/speckit.checklist "api"
```
Generates checks specific to API concerns: authentication on all protected routes, input validation, error response consistency, pagination, rate limiting, idempotency.

---

### Step 6 — Generate tasks
```
/speckit.tasks
```
Produces a task list organized as: Setup → DB schema + migrations (Foundational) → Auth endpoints (P1) → User management (P2) → Admin features (P3). Tasks that touch different modules are marked `[P]`.

---

### Step 7 — Run consistency analysis (optional)
```
/speckit.analyze
```
Checks that every endpoint in the spec has tasks, every task maps to a contract or requirement, and no constitution rules are violated.

---

### Step 8 — Implement
```
/speckit.implement
```
Claude works through each phase — models, repositories, services, controllers, middleware — marking tasks complete. Stops and reports on any failure before moving to the next phase.

---

### Step 9 — Track on GitHub (optional)
```
/speckit.taskstoissues
```

---

## .specify Folder Structure

The `.specify` directory is the backbone of SpecKit. It contains all configuration, templates, scripts, and runtime memory that power the commands.

```
.specify/
├── init-options.json                        # Project settings (branch numbering, AI type, script type)
├── integration.json                         # Integration metadata (active AI agent, script entry points)
├── memory/
│   └── constitution.md                      # Live project constitution — read by every command
├── templates/
│   ├── spec-template.md                     # Blueprint for spec.md
│   ├── plan-template.md                     # Blueprint for plan.md
│   ├── tasks-template.md                    # Blueprint for tasks.md
│   ├── checklist-template.md                # Blueprint for checklists/[domain].md
│   ├── agent-file-template.md               # Blueprint for CLAUDE.md and other agent context files
│   └── constitution-template.md             # Starting point for a new constitution
├── scripts/
│   └── powershell/
│       ├── common.ps1                       # Shared helpers (repo root detection, branch/path utilities)
│       ├── create-new-feature.ps1           # Creates feature directory and initializes spec.md
│       ├── setup-plan.ps1                   # Copies plan-template into the feature directory as plan.md
│       ├── check-prerequisites.ps1          # Validates required artifacts exist before a command runs
│       └── update-agent-context.ps1         # Regenerates CLAUDE.md (and other agent files) from plan.md
└── integrations/
    ├── claude.manifest.json                 # SHA256 checksums for Claude integration files
    ├── speckit.manifest.json                # SHA256 checksums for core SpecKit files
    └── claude/
        └── scripts/
            ├── update-context.ps1           # Thin wrapper → calls update-agent-context.ps1 (Windows)
            └── update-context.sh            # Thin wrapper → calls update-agent-context.ps1 (Unix/Mac)
```

### `memory/`
Runtime state for the project. Holds `constitution.md` — the authoritative source of project principles. Every command reads this before executing. Updated in place when you run `/speckit.constitution`.

### `templates/`
Source of truth for every generated document. When SpecKit creates a `spec.md`, `plan.md`, or `tasks.md`, it copies and fills these templates. To change the default structure of any generated document project-wide, edit the template here.

### `scripts/powershell/`
Internal automation scripts invoked by the Claude commands — you don't call these directly. Key responsibilities:
- `common.ps1` — shared helpers used by all other scripts (finding repo root, resolving feature paths, computing next branch number)
- `create-new-feature.ps1` — called by `/speckit.specify` to create `specs/###-branch-name/` and seed `spec.md`
- `setup-plan.ps1` — called by `/speckit.plan` to initialize `plan.md` from template
- `update-agent-context.ps1` — called at end of `/speckit.plan` to regenerate `CLAUDE.md`
- `check-prerequisites.ps1` — called by `/speckit.tasks`, `/speckit.analyze`, and `/speckit.implement` to validate required files exist before running

### `integrations/`
AI-agent-specific wiring. The `claude/scripts/` subfolder contains the Claude Code integration scripts (`update-context.ps1` / `.sh`). The manifest files track SHA256 checksums so SpecKit can detect if integration files have been modified or are out of sync with the installed version.

### `init-options.json`
Written when the project was initialized. Key settings:
- `branch_numbering` — `"sequential"` (001, 002…) or `"timestamp"` (YYYYMMDD-HHMMSS)
- `script` — `"ps"` for PowerShell (Windows) or `"sh"` for Unix
- `ai` / `integration` — which AI agent is active (defaults to `"claude"`)

### `integration.json`
Declares the active integration and the entry point for the `update-context` script. Used internally by SpecKit to route calls to the correct agent-specific scripts.

---

## Key Concepts

| Concept | What it means |
|---|---|
| **User Story (US1, US2…)** | An independently deliverable unit of functionality, prioritized P1/P2/P3 |
| **[P] task** | Parallelizable — can run concurrently with other [P] tasks in the same phase |
| **Constitution** | Non-negotiable project principles; violations are flagged CRITICAL in analyze |
| **[NEEDS CLARIFICATION]** | Placeholder in spec for genuinely unknown details; resolved by `/speckit.clarify` |
| **Foundational phase** | Tasks that block all user stories (e.g., DB schema, auth middleware) |
| **Checklist** | Quality gate on requirements, not implementation — run before tasks |
