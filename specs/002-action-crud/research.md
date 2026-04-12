# Research: Action CRUD Management & Modal UI Standardisation

**Feature**: `002-action-crud` | **Date**: 2026-04-12

## Summary

The backend for Action CRUD is substantially complete. The primary backend work is a spec-violation correction and missing test coverage. The frontend has zero Actions feature code; the modal UI standardisation applies to all three management pages.

---

## Decision 1: Backend Action CRUD State

**Decision**: The backend is ~90% done. Fix one spec violation, add two missing test files, and add integration tests.

**Findings**:
- `ActionsEndpoints.cs` — all four operations (GET collection, GET by ID, POST, PUT, DELETE) are correctly wired
- `ActionCommands.cs` — all three command handlers are implemented and correct, except `UpdateActionCommandHandler` sets `action.ActionType = request.ActionType` which violates the spec assumption that "Action type is not editable after creation"
- `ActionQueries.cs` — both query handlers are implemented correctly
- `ActionValidators.cs` — validators are correct (UpdateActionCommandValidator validates only `Id` and `ResponseTemplate`, not ActionType — but the command record still accepts ActionType as a parameter)
- `ActionRepository.cs` — `GetAllByUserAsync` and `IsLinkedToAnyTriggerAsync` are implemented
- `ActionCommandHandlerTests.cs` — complete coverage of all command handlers
- **Missing**: `ActionQueryHandlerTests.cs`, `ActionValidatorTests.cs`, `Actions.feature`, `ActionsStepDefinitions.cs`

**Rationale**: Build on what exists; fix the violation; fill gaps.

**Alternatives considered**: Rewrite the endpoints layer — rejected because only a small targeted fix is needed.

---

## Decision 2: UpdateActionCommand Spec Violation Fix

**Decision**: Replace the shared `ActionRequest` DTO for the update endpoint with a separate `UpdateActionRequest(string ResponseTemplate)`. Remove `ActionType` from `UpdateActionCommand`. Update the endpoint and handler accordingly.

**Findings**:
- Spec assumption: "Action type is not editable after creation; only the response template can be updated."
- Current `UpdateActionCommand(Guid Id, ActionType ActionType, string ResponseTemplate)` — ActionType is both accepted and applied in the handler
- Current `ActionRequest(ActionType ActionType, string ResponseTemplate)` — used for both POST (create) and PUT (update), making it impossible to enforce immutability at the DTO level
- The `UpdateActionCommandValidator` already only validates `Id` and `ResponseTemplate` (not ActionType) — this is coincidentally correct and needs no change

**Fix scope**:
1. `ActionDTOs.cs` — add `UpdateActionRequest(string ResponseTemplate)`
2. `ActionCommands.cs` — change `UpdateActionCommand` record to `(Guid Id, string ResponseTemplate)`, remove `action.ActionType = ...` from handler
3. `ActionsEndpoints.cs` — change `UpdateActionAsync` to bind `[FromBody] UpdateActionRequest` instead of `ActionRequest`

**Rationale**: Smallest correct change. The POST endpoint keeps `ActionRequest` (with ActionType). The PUT endpoint switches to `UpdateActionRequest` (ResponseTemplate only).

**Alternatives considered**: Single `ActionRequest` with nullable ActionType — rejected because it makes the contract ambiguous and requires conditional logic in the handler.

---

## Decision 3: Modal Shell Component Design

**Decision**: Create `src/app/shared/components/modal/modal.component.*` using Angular content projection (`<ng-content>`). The component accepts `isVisible` and `title` inputs and emits `closed`.

**Findings**:
- The existing `ConfirmationDialogComponent` is a specialised yes/no dialog — not a general-purpose modal shell
- All three management pages need modals for create and edit forms — the forms have different shapes, so content projection is the correct pattern
- The delete confirmation continues to use `ConfirmationDialogComponent` on all three pages (no change needed)
- The modal shell will: render a backdrop overlay, display a title bar with a close (×) button, project the form body via `<ng-content>`, and trap keyboard events (Escape → emit `closed`)

**Rationale**: A single generic shell eliminates duplication across Actions, Items, and Triggers. Content projection keeps the shell unaware of form internals.

**Alternatives considered**:
- Angular CDK Dialog — rejected to avoid adding a dependency when a lightweight native solution is sufficient
- Extending `ConfirmationDialogComponent` — rejected (violates Single Responsibility; confirmation dialog has fixed yes/no buttons)

---

## Decision 4: Triggers Update — Missing Frontend Store Action

**Decision**: Add `updateTrigger`, `updateTriggerSuccess`, `updateTriggerFailure` NgRx actions plus a corresponding effect to the triggers store. The backend `UpdateTriggerCommand` already exists.

**Findings**:
- Backend: `UpdateTriggerCommand(Guid Id, string Phrase)` + handler + `PUT /api/v1/triggers/{id}` endpoint all exist
- Frontend: `triggers.actions.ts` has no `updateTrigger` action; `triggers.effects.ts` has no update effect
- `TriggerFormComponent` has no `editTrigger` input — currently create-only
- US-6 acceptance scenario requires "edit on existing trigger → modal opens pre-filled"
- `TriggersService.update()` is also missing

**Rationale**: The modal refactor (FR-014) requires an edit flow. Adding the missing store plumbing is the minimum needed to enable this.

**Alternatives considered**: Skip trigger edit in this branch — rejected because the spec explicitly requires it (US-6 acceptance criteria, FR-014, SC-007).

---

## Decision 5: Actions NgRx Store Placement

**Decision**: Create a feature-scoped store at `src/app/actions/store/`. The `ActionsApiService` stays in `src/app/shared/services/` because the Triggers page also uses it (for the action-link-form selector).

**Findings**:
- `ActionsApiService` is already in `shared/services/` and is imported by `TriggersComponent`
- Moving it to `actions/store/api/` would break the cross-feature usage
- The Actions feature effects will inject `ActionsApiService` from shared — this is the correct cross-feature pattern per the Angular constitution
- The feature NgRx store handles the `ActionsState` (list, isLoading, error, selectedAction)

**Rationale**: Constitution rule: "Cross-feature sharing → `src/app/shared/`." `ActionsApiService` qualifies because it's used by both Actions and Triggers features.

**Alternatives considered**: Duplicate the service in the Actions feature — rejected (duplicates HTTP logic and is explicitly prohibited by the constitution).

---

## Decision 6: Actions NgRx Store Model and State Shape

**Decision**: `ActionsState` holds `{ actions: Action[], isLoading: boolean, error: string | null, selectedAction: Action | null }`. The `selectedAction` is set when editing (null = create mode).

**Findings**:
- Items store has `selectedItem: Item | null` for the same create/edit distinction — replicate this pattern
- Actions list is small (< 100 per user), so no pagination needed
- Pessimistic updates: store updates only after server success response

**Rationale**: Exact parity with Items store pattern — reduces cognitive overhead for contributors familiar with the Items feature.

---

## Decision 7: Items Page Modal Refactor Approach

**Decision**: Add `showCreateModal` and `showEditModal` signals to `ItemsComponent`. The "New Item" button sets `showCreateModal(true)`; clicking edit on a list item dispatches `selectItem` and sets `showEditModal(true)`. Both modals use the shared `ModalComponent` wrapping `ItemFormComponent`.

**Findings**:
- Current Items page uses `showForm` signal to toggle an inline `ItemFormComponent` that replaces the list area
- The modal approach keeps the list visible at all times behind the modal overlay
- `ItemFormComponent` already accepts `editItem` input — no internal changes needed (it already supports both create and edit via null/non-null editItem)

**Rationale**: Least-change modal refactor: the form component is untouched; only the container (ItemsComponent) changes to render the form inside `ModalComponent`.

---

## Decision 8: Integration Test Strategy for Actions

**Decision**: Add `Actions.feature` (Gherkin) + `ActionsStepDefinitions.cs` following the exact pattern of `Items.feature` and `ItemsStepDefinitions.cs`. Cover: create action, get all actions, update action (response template only), delete unlinked action, delete linked action (409 Conflict), data isolation between users.

**Findings**:
- `ItemsStepDefinitions.cs` and `CommonStepDefinitions.cs` demonstrate the test infrastructure: `MapiWebApplicationFactory`, `TestContext`, per-scenario database seeding
- The integration test project uses `WebApplicationFactory<Program>` with SQL Server LocalDB
- Conflict scenario (linked action → 409) is a unique test case not present in Items or Triggers integration tests

**Rationale**: Complete coverage of all user stories including the safety guard (FR-006, SC-003).
