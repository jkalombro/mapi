# jk-spec-project-boilerplate

A personal project boilerplate and spec-driven development harness. Copy this repo to bootstrap any new project — constitutions, scaffolding templates, and AI-assisted workflows are all pre-wired.

---

## What this is

This repo is the starting point for all future projects. It bundles two things together:

1. **Spec-driven development workflow** (`speckit`) — a set of Claude Code slash commands that take a feature description all the way from spec → plan → tasks → implementation, with a project constitution enforcing standards at every step.

2. **Pre-built scaffolding templates** (`.scaffolding/`) — opinionated project starters for specific frameworks. When you run `/create-ui-app angular my-app`, it copies the full Angular boilerplate (NgRx, feature modules, SCSS architecture, shared module, tests) rather than generating a bare `ng new` project.

---

## Project structure

```
.
├── .claude/
│   └── commands/          # Claude Code slash commands
├── .scaffolding/
│   └── angular/           # Angular boilerplate template (NgRx, lazy modules, SCSS)
├── .specify/
│   ├── memory/            # Project constitution and framework-specific standards
│   │   └── language-templates/
│   ├── templates/         # Spec, plan, tasks, checklist templates
│   └── scripts/           # Setup and context-update scripts
├── UI/                    # Frontend application(s) live here
└── API/                   # Backend application(s) live here
```

---

## Part 1 — Starting a New Project

Follow these steps once when creating a brand new project from this boilerplate.

### Step 1 — Copy the boilerplate

Create a new folder named after your project and copy everything from this boilerplate into it — **except** the `UI/` and `API/` folders (those are for the apps you will scaffold in later steps).

```
my-new-project/
├── .claude/
├── .scaffolding/
├── .specify/
├── .github/        ← will be removed in the next step
├── .gitignore
├── CLAUDE.md
└── README.md
```

Open the new folder in VS Code, then open Claude Code inside it.

---

### Step 2 — Initialize the project

```
/init-new-project
```

This command:
- Detects the project name from the folder name
- Deletes the `.github/` folder (boilerplate's CI config, not yours)
- Updates `.gitignore` — removes `/UI/` and `/API/` exclusions, adds `/.scaffolding/`
- Creates a **private** GitHub repository under your account and pushes the initial commit

> Requires the `gh` CLI to be installed and authenticated (`gh auth login`).

---

### Step 3 — Define the project constitution

```
/speckit.constitution
```

The constitution is the non-negotiable source of truth for coding standards — every future command reads it before doing anything. Define your project's principles here: architecture style, error handling conventions, testing approach, etc.

> **Skip this step if your framework already has a constitution in `.specify/memory/language-templates/`.** The following are already included in this boilerplate:
> - `angular.constitution.md`
> - `dotnet.constitution.md`
>
> If you're using Angular or .NET, go straight to Step 4 — `/create-ui-app` or `/create-api-app` will automatically register and embed the existing constitution for you.

---

### Step 4 — Scaffold your apps

Run whichever of these applies to your project. You can run both for a full-stack setup.

**UI app:**
```
/create-ui-app <framework> <app-name>
```
Examples: `/create-ui-app angular my-dashboard`, `/create-ui-app react my-app`

- Uses `.scaffolding/<framework>/` template if one exists; otherwise runs the framework's standard CLI scaffold
- Registers a framework constitution under `.specify/memory/language-templates/` and embeds it in `CLAUDE.md`
- Scaffolds into `UI/` (single app) or `UI/<app-name>/` (when a UI app already exists)

**API app:**
```
/create-api-app <framework> <app-name>
```
Examples: `/create-api-app dotnet my-api`, `/create-api-app nestjs my-service`

- Same template-first logic as the UI command
- Scaffolds into `API/` (single app) or `API/<app-name>/` (when an API app already exists)

> If the constitution still has unfilled placeholder tokens after scaffolding, run `/speckit.constitution` again to fill them in.

---

## Part 2 — Building Features (SpecKit Workflow)

Use this flow for every new feature, whether you're starting fresh or enhancing an existing project. The full pipeline is:

```
specify → clarify → plan → checklist → tasks → analyze → implement → taskstoissues
```

---

### Step 1 — Write the spec

```
/speckit.specify "feature description"
```

Converts a plain-language description into a structured `spec.md` with user stories (P1/P2/P3), functional requirements (FR-001…), success criteria (SC-001…), and key entities. Creates a feature branch directory under `specs/`.

---

### Step 2 — Clarify ambiguities *(optional)*

```
/speckit.clarify
```

Scans the spec for underspecified areas and asks up to 5 targeted questions. Answers are encoded back into the spec. Use this for complex features or anything with unclear edge cases or cross-team dependencies.

---

### Step 3 — Generate the technical plan

```
/speckit.plan
```

Two-phase execution:

- **Phase 0 (Research):** Identifies unknowns, produces `research.md`
- **Phase 1 (Design):** Extracts entities → `data-model.md`, defines interface contracts in `contracts/`, generates `quickstart.md`, updates `CLAUDE.md`

You will be prompted to choose a project structure: Single project, Web app (frontend + backend), or Mobile + API.

---

### Step 4 — Validate requirements quality *(optional)*

```
/speckit.checklist "<domain>"
```

Generates a custom checklist that acts as "unit tests for your requirements" — not implementation tests, but checks that requirements are complete, clear, measurable, and consistent. Use `"ui"` for frontend concerns (accessibility, empty states, loading states) or `"api"` for backend concerns (auth, validation, pagination).

---

### Step 5 — Generate the task list

```
/speckit.tasks
```

Reads all design artifacts and produces a dependency-ordered `tasks.md` organized by phase:

1. **Setup** — project initialization
2. **Foundational** — blocking prerequisites (shared models, auth, DB schema)
3. **User Stories** — one phase per story, P1 → P2 → P3
4. **Polish** — cross-cutting concerns

Tasks marked `[P]` are parallelizable.

---

### Step 6 — Run consistency analysis *(optional)*

```
/speckit.analyze
```

Read-only cross-check across `spec.md`, `plan.md`, and `tasks.md`. Flags duplicate or conflicting requirements, vague language, unresolved placeholders, requirements with no tasks (coverage gaps), orphaned tasks, and constitution violations (CRITICAL). No edits are made unless you approve.

---

### Step 7 — Implement

```
/speckit.implement
```

Works through each phase sequentially. Within a phase, `[P]` tasks run in parallel. Marks tasks `[X]` as they complete. Halts and reports on failures before continuing.

Run `/speckit.analyze` first if you want a pre-flight check.

---

### Step 8 — Track on GitHub *(optional)*

```
/speckit.taskstoissues
```

Reads `tasks.md` and creates a GitHub Issue for each task, preserving dependency order. Requires a GitHub remote URL and the GitHub MCP server tool.

---

## Slash commands reference

### Project setup

| Command | Description |
|---|---|
| `/init-new-project` | Clean up boilerplate artifacts and create a private GitHub repository. |
| `/create-ui-app <framework> <name>` | Scaffold a new UI app and register its framework constitution. |
| `/create-api-app <framework> <name>` | Scaffold a new API app and register its framework constitution. |

### SpecKit — spec-driven development

| Command | Description |
|---|---|
| `/speckit.constitution` | Create or update the project constitution (coding standards, patterns, principles). |
| `/speckit.specify "<description>"` | Turn a feature description into a structured spec. |
| `/speckit.clarify` | Ask up to 5 targeted questions to fill gaps in the current spec. |
| `/speckit.plan` | Generate an implementation plan from the spec. |
| `/speckit.checklist "<domain>"` | Generate a feature-specific requirements quality checklist. |
| `/speckit.tasks` | Break the plan into a dependency-ordered task list. |
| `/speckit.analyze` | Cross-check spec, plan, and tasks for consistency issues. |
| `/speckit.implement` | Execute the tasks one by one. |
| `/speckit.taskstoissues` | Convert tasks into GitHub issues. |

---

## Scaffolding templates

Templates live in `.scaffolding/<framework>/` and use two placeholder tokens that get replaced at scaffold time:

| Token | Replaced with |
|---|---|
| `__APP_NAME__` | The app name you pass to the command (e.g., `my-dashboard`) |
| `__APP_TITLE__` | PascalCase version of the name (e.g., `MyDashboard`) |

### Available templates

| Framework | Location | Includes |
|---|---|---|
| Angular | `.scaffolding/angular/` | NgRx global + feature stores, lazy-loaded feature modules (home, about), shared module (badge, logger, string helpers), SCSS design token architecture |

To add a new template: scaffold a project the way you want it, then copy it into `.scaffolding/<framework>/` with the placeholder tokens substituted in.

---

## Constitution

The project constitution (`.specify/memory/constitution.md`) is the source of truth for coding standards. It links to per-framework constitutions under `.specify/memory/language-templates/`.

Claude reads the constitution before writing any code. Run `/speckit.constitution` to create or update it.
