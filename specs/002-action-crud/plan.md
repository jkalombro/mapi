# Implementation Plan: Action CRUD Management & Modal UI Standardisation

**Branch**: `002-action-crud` | **Date**: 2026-04-12 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-action-crud/spec.md`

## Summary

Deliver full Action CRUD management across backend and frontend, fixing one spec violation in the existing backend (ActionType immutability on update), completing missing backend test coverage, adding the new Actions management page, and standardising all three management pages (Actions, Items, Triggers) to use modal dialogs for create/edit/delete operations via a shared modal shell component.

## Technical Context

**Language/Version**:
- Backend: C# / .NET 9 (Minimal API, MediatR, FluentValidation, EF Core, Reqnroll)
- Frontend: TypeScript / Angular 18+ (NgRx Classic, Signals, @ngx-env/builder)

**Primary Dependencies**:
- Backend: MediatR, FluentValidation, EF Core 9, SQL Server, Serilog, Reqnroll, xUnit, Moq
- Frontend: NgRx, Angular Signals (`signal()`, `input()`, `output()`, `toSignal()`), SCSS, Jest

**Storage**: SQL Server (EF Core code-first; migrations already in place for `Action` entity)

**Testing**:
- Backend: xUnit (unit), Reqnroll/xUnit (integration)
- Frontend: Jest + Angular Testing Library (100% coverage threshold)

**Target Platform**: Web (ASP.NET Core 9 API + Angular SPA)

**Project Type**: Web application — backend REST API + frontend SPA

**Performance Goals**: Actions list loads all user-owned actions in a single GET request (< 100 actions/user expected — no pagination)

**Constraints**: Pessimistic store updates only; no optimistic rollback; transient errors via toast/snackbar

**Scale/Scope**: Per-user action isolation enforced at data access layer (global query filter pattern)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Backend (Dotnet Constitution)

| Rule | Status | Notes |
|------|--------|-------|
| Clean Architecture layer order (Domain ← Application ← Infrastructure ← API) | ✅ Pass | Existing layer references are correct |
| Minimal API, no controllers | ✅ Pass | `ActionsEndpoints.cs` uses `MapGroup` + extension method |
| MediatR for all dispatch | ✅ Pass | Endpoints send commands/queries only |
| FluentValidation, no Data Annotations | ✅ Pass | `ActionValidators.cs` uses `AbstractValidator<T>` |
| Repository pattern (IActionRepository in Domain) | ✅ Pass | Interface in `Domain/Interfaces/`, concrete in `Infrastructure/Repositories/` |
| TypedResults | ✅ Pass | All endpoints use `TypedResults.Ok/Created/NoContent` |
| TDD / xUnit | ⚠️ Partial | Command handler tests exist; query handler tests and validator tests are missing |
| Reqnroll integration tests | ⚠️ Missing | No `Actions.feature` or `ActionsStepDefinitions.cs` |
| Action type immutability | ❌ Violation | `UpdateActionCommand` accepts `ActionType`; spec states action type is not editable after creation |

**Gate result**: ERROR on spec violation — `UpdateActionCommand` must be corrected before implementation proceeds.

### Frontend (Angular Constitution)

| Rule | Status | Notes |
|------|--------|-------|
| Standalone components, OnPush | ✅ Pass | All existing components follow this pattern |
| NgRx (Actions / Reducers / Effects) | ✅ Pass | Items and Triggers follow this pattern |
| Signals (`input()`, `output()`, `signal()`, `toSignal()`) | ✅ Pass | Existing components use signals correctly |
| `@if`/`@for` template syntax | ✅ Pass | No `*ngIf`/`*ngFor` in existing templates |
| Reactive Forms | ✅ Pass | Item/Trigger forms use `FormBuilder` |
| Feature store placement | ✅ Pass | Each feature has its own `store/` folder |
| Shared modal shell | ❌ Missing | FR-015 requires a reusable modal shell; no such component exists yet |
| Actions route | ❌ Missing | No `actions/` feature, no `/actions` route, no nav link |
| Items/Triggers modal pattern | ❌ Missing | Both pages use inline forms, not modals (FR-013, FR-014) |
| TDD / Jest 100% coverage | ⚠️ Partial | New code must follow TDD; existing tests not changed |

## Project Structure

### Documentation (this feature)

```text
specs/002-action-crud/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/           ← Phase 1 output
│   ├── api.md           ← REST API contract (Actions endpoints)
│   └── ui-components.md ← Angular component contracts (inputs/outputs)
└── tasks.md             ← Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
API/
├── src/
│   ├── Mapi.Application/
│   │   └── Actions/
│   │       ├── Commands/
│   │       │   └── ActionCommands.cs          [FIX] Remove ActionType from UpdateActionCommand
│   │       ├── DTOs/
│   │       │   └── ActionDTOs.cs              [FIX] Add UpdateActionRequest (ResponseTemplate only)
│   │       └── Validators/
│   │           └── ActionValidators.cs        [UNCHANGED — validators already correct]
│   └── Mapi.API/
│       └── Endpoints/
│           └── ActionsEndpoints.cs            [FIX] UpdateAction endpoint uses UpdateActionRequest
├── tests/
│   ├── Mapi.Application.Tests/
│   │   └── Actions/
│   │       ├── ActionCommandHandlerTests.cs   [EXISTING — complete]
│   │       ├── ActionQueryHandlerTests.cs     [NEW] GetActionsQuery + GetActionByIdQuery tests
│   │       └── ActionValidatorTests.cs        [NEW] Validator unit tests for all 3 commands
│   └── Mapi.API.IntegrationTests/
│       ├── Features/
│       │   └── Actions.feature                [NEW] Gherkin acceptance scenarios
│       └── StepDefinitions/
│           └── ActionsStepDefinitions.cs      [NEW] Step definitions

UI/
└── src/
    └── app/
        ├── app.component.html                 [FIX] Add "Actions" nav link
        ├── app.routes.ts                      [FIX] Add /actions lazy route with authGuard
        ├── shared/
        │   ├── components/
        │   │   └── modal/                     [NEW] Shared modal shell component
        │   │       ├── modal.component.ts
        │   │       ├── modal.component.html
        │   │       └── modal.component.scss
        │   └── services/
        │       └── actions-api.service.ts     [FIX] Add create(), update(), delete()
        ├── actions/                           [NEW] Full feature folder
        │   ├── actions.routes.ts
        │   ├── actions.component.ts
        │   ├── actions.component.html
        │   ├── actions.component.scss
        │   ├── components/
        │   │   └── action-form/
        │   │       ├── action-form.component.ts
        │   │       ├── action-form.component.html
        │   │       └── action-form.component.scss
        │   └── store/
        │       ├── models/
        │       │   └── action.model.ts
        │       ├── actions/
        │       │   └── actions.actions.ts
        │       ├── reducers/
        │       │   └── actions.reducer.ts
        │       ├── effects/
        │       │   └── actions.effects.ts
        │       └── api/                       (uses shared ActionsApiService — no duplicate)
        ├── items/
        │   ├── items.component.ts             [FIX] Use modal shell instead of inline form
        │   ├── items.component.html           [FIX] Modal pattern for create/edit
        │   └── items.component.scss           [FIX] Remove inline-form layout if any
        └── triggers/
            ├── triggers.component.ts          [FIX] Add updateTrigger; use modal shell
            ├── triggers.component.html        [FIX] Modal pattern for create/edit
            └── store/
                └── actions/
                    └── triggers.actions.ts    [FIX] Add updateTrigger / updateTriggerSuccess / updateTriggerFailure
```

**Structure Decision**: Web application (Option 2). Backend is `API/`, frontend is `UI/`. This matches the existing repository layout exactly. The Actions feature follows the identical pattern established by Items.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| UpdateActionCommand spec violation | `ActionType` was included in the command but spec mandates immutability after creation | Leaving it is a data-integrity bug; callers should not be able to change the semantic meaning of a linked action |
| `updateTrigger` missing from frontend store | Backend `UpdateTriggerCommand` exists but frontend never wired it up | The US-6 modal refactor requires an edit flow; adding the store action is the minimal correct fix |
| Modal shell vs. ConfirmationDialogComponent reuse | `ConfirmationDialogComponent` is specific (yes/no with a message); general create/edit modals need a title + content-projected form body | Extending the confirmation dialog would violate Single Responsibility |
