---

description: "Task list for Action CRUD Management & Modal UI Standardisation"
---

# Tasks: Action CRUD Management & Modal UI Standardisation

**Input**: Design documents from `/specs/002-action-crud/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api.md ✅, contracts/ui-components.md ✅, quickstart.md ✅

**Tests**: TDD required — frontend (Jest, 100% coverage) and backend (xUnit + Reqnroll). Write tests before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US6)
- All file paths are relative to repository root

---

## Phase 1: Setup — Backend Spec Violation Fix

**Purpose**: Correct the `UpdateActionCommand` spec violation before any user story work begins. This is a blocking fix — leaving `ActionType` mutable violates the core data-integrity assumption for all subsequent stories.

**⚠️ CRITICAL**: Must be complete before Phase 2.

- [ ] T001 Fix `UpdateActionCommand` record (remove `ActionType` parameter) and remove `action.ActionType = request.ActionType` line from `UpdateActionCommandHandler.Handle` in `API/src/Mapi.Application/Actions/Commands/ActionCommands.cs`
- [ ] T002 Add `record UpdateActionRequest(string ResponseTemplate)` to `API/src/Mapi.Application/Actions/DTOs/ActionDTOs.cs`
- [ ] T003 Update `UpdateActionAsync` endpoint to bind `[FromBody] UpdateActionRequest` instead of `ActionRequest` in `API/src/Mapi.API/Endpoints/ActionsEndpoints.cs`

**Checkpoint**: `dotnet build` must succeed with zero warnings before proceeding.

---

## Phase 2: Foundational — Backend Missing Tests + Shared Frontend Infrastructure

**Purpose**: Fill backend test gaps and create the shared frontend infrastructure (ModalComponent, ActionsApiService extensions, routing) that all user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 [P] Write `ActionQueryHandlerTests` covering `GetActionsQuery` (returns list for user, returns empty list, excludes other users' actions) and `GetActionByIdQuery` (returns action, throws NotFoundException for wrong user or missing id) in `API/tests/Mapi.Application.Tests/Actions/ActionQueryHandlerTests.cs`
- [ ] T005 [P] Write `ActionValidatorTests` covering `CreateActionCommandValidator` (valid passes, empty ResponseTemplate fails, >500 chars fails), `UpdateActionCommandValidator` (valid passes, empty Id fails, empty ResponseTemplate fails), and `DeleteActionCommandValidator` (valid passes, empty Id fails) in `API/tests/Mapi.Application.Tests/Actions/ActionValidatorTests.cs`
- [ ] T006 Write `ModalComponent` tests (isVisible shows/hides overlay, title renders in header, × button emits `closed`, backdrop click emits `closed`, Escape key emits `closed`, projected content renders inside modal, aria attributes present) in `UI/src/app/shared/components/modal/modal.component.spec.ts`
- [ ] T007 Implement `ModalComponent` (standalone, OnPush; `isVisible` signal input, `title` signal input, `closed` output; backdrop overlay, title bar with × button, `<ng-content>` body, Escape key listener; `role="dialog"` `aria-modal="true"` `aria-labelledby`) in `UI/src/app/shared/components/modal/modal.component.ts`, `modal.component.html`, `modal.component.scss`
- [ ] T008 [P] Write updated `ActionsApiService` tests for `create()` (POST /api/v1/actions returns Action), `update()` (PUT /api/v1/actions/{id} returns Action), and `delete()` (DELETE /api/v1/actions/{id} returns void) in `UI/src/app/shared/services/actions-api.service.spec.ts`
- [ ] T009 Extend `ActionsApiService` with `create(request: CreateActionRequest): Observable<Action>`, `update(id: string, request: UpdateActionRequest): Observable<Action>`, and `delete(id: string): Observable<void>` in `UI/src/app/shared/services/actions-api.service.ts`
- [ ] T010 [P] Add `/actions` lazy route with `authGuard` (`loadChildren` → `actionsRoutes`) in `UI/src/app/app.routes.ts`
- [ ] T011 [P] Add `<a routerLink="/actions" class="toolbar__link">Actions</a>` nav link in `UI/src/app/app.component.html`

**Checkpoint**: `dotnet test` passes for both test projects; `npm test` passes for the new service and modal specs.

---

## Phase 3: US1 & US2 (P1) — Create an Action & View All Actions

**Goal**: Deliver the full Actions management page with list display, empty state, and create-via-modal functionality. Both P1 stories share the same NgRx store infrastructure and are implemented together.

**Independent Test**: Navigate to `/actions`, verify the list renders (empty state if no actions). Click "New Action", fill in Action Type and Response Template, save — verify the new action appears in the list. Covered by `Actions.feature` scenarios for GET and POST.

### Tests for US1 & US2

> **Write these tests FIRST — ensure they FAIL before implementation.**

- [ ] T012 [P] [US1] [US2] Create `Action`, `ActionsState`, `CreateActionRequest`, `UpdateActionRequest` interfaces in `UI/src/app/actions/store/models/action.model.ts`
- [ ] T013 [P] [US1] [US2] Define all NgRx action creators (`loadActions`, `loadActionsSuccess`, `loadActionsFailure`, `createNewAction`, `createActionSuccess`, `createActionFailure`, `updateAction`, `updateActionSuccess`, `updateActionFailure`, `deleteAction`, `deleteActionSuccess`, `deleteActionFailure`, `selectAction`) in `UI/src/app/actions/store/actions/actions.actions.ts`
- [ ] T014 [US1] [US2] Write `ActionsReducer` tests covering initial state, `loadActions` (sets isLoading), `loadActionsSuccess` (populates actions, clears isLoading), `loadActionsFailure` (sets error, clears isLoading), `createActionSuccess` (appends to actions list), `createActionFailure` (sets error), and `selectAction` (sets selectedAction) in `UI/src/app/actions/store/reducers/actions.reducer.spec.ts`
- [ ] T015 [US1] [US2] Implement `ActionsReducer` with selectors `selectAllActions`, `selectActionsIsLoading`, `selectActionsError`, `selectSelectedAction` in `UI/src/app/actions/store/reducers/actions.reducer.ts`
- [ ] T016 [US1] [US2] Write `ActionsEffects` tests for `loadActions$` (dispatches `loadActionsSuccess` on API success, `loadActionsFailure` on error) and `createNewAction$` (dispatches `createActionSuccess` on 201, `createActionFailure` on error) in `UI/src/app/actions/store/effects/actions.effects.spec.ts`
- [ ] T017 [US1] [US2] Implement `ActionsEffects` for `loadActions$` and `createNewAction$` in `UI/src/app/actions/store/effects/actions.effects.ts`
- [ ] T018 [US1] Write `ActionFormComponent` tests for create mode: form renders with ActionType selector (enabled) and ResponseTemplate textarea, `saved` emits `CreateActionRequest` on valid submit, `cancelled` emits on cancel, validation errors shown for empty fields and ResponseTemplate >500 chars in `UI/src/app/actions/components/action-form/action-form.component.spec.ts`
- [ ] T019 [US1] Implement `ActionFormComponent` create mode (standalone, OnPush; `editAction = input<Action | null>(null)`, `isLoading = input<boolean>(false)`, `saved` and `cancelled` outputs; Reactive Form with ActionType `<select>` and ResponseTemplate `<textarea>` max 500 chars; SCSS layout) in `UI/src/app/actions/components/action-form/action-form.component.ts`, `action-form.component.html`, `action-form.component.scss`
- [ ] T020 [US1] [US2] Write `ActionsComponent` tests for list display (`@for` over actions), empty state message when no actions, "New Action" button sets `showCreateModal` to true, `createNewAction` dispatch on `ActionFormComponent` saved output, modal closes on cancel or success in `UI/src/app/actions/actions.component.spec.ts`
- [ ] T021 [US1] [US2] Implement `ActionsComponent` (standalone, OnPush; `showCreateModal`, `showEditModal`, `pendingDeleteId` signals; `toSignal` selectors; list with edit/delete buttons per action; `ModalComponent` wrapping `ActionFormComponent` for create; empty state; responsive SCSS layout) in `UI/src/app/actions/actions.component.ts`, `actions.component.html`, `actions.component.scss`
- [ ] T022 [P] [US1] [US2] Create `actionsRoutes` with `loadComponent` pointing to `ActionsComponent` in `UI/src/app/actions/actions.routes.ts`
- [ ] T023 [US1] [US2] Register `actionsReducer` in `provideStore` and `ActionsEffects` in `provideEffects` in `UI/src/app/app.config.ts`
- [ ] T024 [US1] [US2] Write Gherkin scenarios in `API/tests/Mapi.API.IntegrationTests/Features/Actions.feature`: GET all actions (returns user's actions, returns empty array when none, excludes other user's actions), POST create action (201 with Location header, 400 on missing ResponseTemplate, 400 on ResponseTemplate >500 chars, 400 on invalid ActionType)
- [ ] T025 [US1] [US2] Implement `ActionsStepDefinitions` for US1 and US2 scenarios using `MapiWebApplicationFactory` and per-scenario seeding in `API/tests/Mapi.API.IntegrationTests/StepDefinitions/ActionsStepDefinitions.cs`

**Checkpoint**: Actions page loads, empty state displays, create modal opens and saves a new action to the list.

---

## Phase 4: US3 (P2) — Edit an Action

**Goal**: Allow users to update an existing action's response template via an edit modal. ActionType selector is disabled in edit mode. Store updates pessimistically (only after server success).

**Independent Test**: Create an action, click edit, modify the response template, save — verify the updated template appears in the list. ActionType must remain unchanged.

### Tests for US3

> **Write these tests FIRST — ensure they FAIL before implementation.**

- [ ] T026 [US3] Write `ActionsReducer` tests for `updateActionSuccess` (replaces matching action in list), `updateActionFailure` (sets error), and `selectAction` (null clears selectedAction) in `UI/src/app/actions/store/reducers/actions.reducer.spec.ts`
- [ ] T027 [US3] Update `ActionsReducer` to handle `updateActionSuccess` (map replace), `updateActionFailure` (set error), and `selectAction` (set/clear selectedAction) in `UI/src/app/actions/store/reducers/actions.reducer.ts`
- [ ] T028 [US3] Write `ActionsEffects` tests for `updateAction$` effect (dispatches `updateActionSuccess` on 200, `updateActionFailure` on error) in `UI/src/app/actions/store/effects/actions.effects.spec.ts`
- [ ] T029 [US3] Implement `updateAction$` effect in `UI/src/app/actions/store/effects/actions.effects.ts`
- [ ] T030 [US3] Write `ActionFormComponent` tests for edit mode: ActionType selector is disabled, form pre-filled from `editAction` input, `saved` emits `UpdateActionRequest` (no ActionType), validation still enforced on ResponseTemplate in `UI/src/app/actions/components/action-form/action-form.component.spec.ts`
- [ ] T031 [US3] Update `ActionFormComponent` to support edit mode (disable ActionType selector when `editAction()` is non-null, pre-fill ResponseTemplate on init, emit `UpdateActionRequest` shape from saved output) in `UI/src/app/actions/components/action-form/action-form.component.ts`, `action-form.component.html`
- [ ] T032 [US3] Write `ActionsComponent` tests for edit modal: clicking edit dispatches `selectAction`, sets `showEditModal` to true, `updateAction` dispatches on saved, modal closes on success or cancel in `UI/src/app/actions/actions.component.spec.ts`
- [ ] T033 [US3] Update `ActionsComponent` to support edit modal (`showEditModal` signal, edit button dispatches `selectAction` then sets `showEditModal(true)`, `ModalComponent` wrapping `ActionFormComponent` with `editAction` bound to `selectedAction()`, dispatches `updateAction` on saved) in `UI/src/app/actions/actions.component.ts`, `actions.component.html`
- [ ] T034 [US3] Add Gherkin scenario for PUT /api/v1/actions/{id} to `API/tests/Mapi.API.IntegrationTests/Features/Actions.feature`: update ResponseTemplate (200 OK, ActionType unchanged), 400 on empty ResponseTemplate, 404 on unknown id, 404 when updating another user's action
- [ ] T035 [US3] Implement `ActionsStepDefinitions` for US3 update scenarios in `API/tests/Mapi.API.IntegrationTests/StepDefinitions/ActionsStepDefinitions.cs`

**Checkpoint**: Clicking edit on an action opens the modal pre-filled; saving updates the list; ActionType is unchanged.

---

## Phase 5: US4 (P3) — Delete an Action

**Goal**: Allow users to delete an unlinked action via a confirmation dialog. Deletion of linked actions is blocked with a 409 Conflict error surfaced as a toast notification.

**Independent Test**: Create an unlinked action and delete it (204, removed from list). Link an action to a trigger and attempt deletion (toast error, action remains in list). Dismiss confirmation dialog (no change).

### Tests for US4

> **Write these tests FIRST — ensure they FAIL before implementation.**

- [ ] T036 [US4] Write `ActionsReducer` tests for `deleteActionSuccess` (removes action by id from list), `deleteActionFailure` (sets error, preserves list) in `UI/src/app/actions/store/reducers/actions.reducer.spec.ts`
- [ ] T037 [US4] Update `ActionsReducer` to handle `deleteActionSuccess` (filter out id) and `deleteActionFailure` (set error) in `UI/src/app/actions/store/reducers/actions.reducer.ts`
- [ ] T038 [US4] Write `ActionsEffects` tests for `deleteAction$` effect (dispatches `deleteActionSuccess` on 204, dispatches `deleteActionFailure` on 409 with conflict message, dispatches `deleteActionFailure` on other errors) in `UI/src/app/actions/store/effects/actions.effects.spec.ts`
- [ ] T039 [US4] Implement `deleteAction$` effect with conflict error handling (catch 409 → extract detail message → dispatch `deleteActionFailure`) in `UI/src/app/actions/store/effects/actions.effects.ts`
- [ ] T040 [US4] Write `ActionsComponent` tests for delete flow: clicking delete sets `pendingDeleteId`, `ConfirmationDialogComponent` renders, confirming dispatches `deleteAction`, cancelling clears `pendingDeleteId`, `deleteActionFailure` error shown as toast in `UI/src/app/actions/actions.component.spec.ts`
- [ ] T041 [US4] Update `ActionsComponent` to support delete confirmation (`pendingDeleteId = signal<string | null>(null)`, delete button sets `pendingDeleteId(action.id)`, `ConfirmationDialogComponent` bound to `pendingDeleteId()`, confirm dispatches `deleteAction`, cancel clears `pendingDeleteId`, error selector triggers toast) in `UI/src/app/actions/actions.component.ts`, `actions.component.html`
- [ ] T042 [US4] Add Gherkin scenarios for DELETE /api/v1/actions/{id} to `API/tests/Mapi.API.IntegrationTests/Features/Actions.feature`: delete unlinked action (204 No Content), delete linked action (409 Conflict with detail message), 404 on unknown id, 404 when deleting another user's action
- [ ] T043 [US4] Implement `ActionsStepDefinitions` for US4 delete and conflict scenarios (including seeding a `TriggerActionMap` row for the linked case) in `API/tests/Mapi.API.IntegrationTests/StepDefinitions/ActionsStepDefinitions.cs`

**Checkpoint**: All four Action CRUD operations functional; linked-action delete blocked with visible error toast.

---

## Phase 6: US5 (P2) — Modal UI for Items Management

**Goal**: Refactor `ItemsComponent` to use `ModalComponent` for create and edit operations, replacing the existing inline form. No backend or `ItemFormComponent` internal changes required.

**Independent Test**: Navigate to `/items`, click "New Item" → modal opens with blank form. Click edit on an existing item → modal opens pre-filled. Confirm delete → item removed. Cancel any modal → no data changed.

### Tests for US5

> **Write these tests FIRST — ensure they FAIL before implementation.**

- [ ] T044 [US5] Write updated `ItemsComponent` tests: "New Item" button sets `showCreateModal(true)`, edit button dispatches `selectItem` and sets `showEditModal(true)`, `ModalComponent` renders with correct title, cancel/closed emit resets modal signals, `showForm` signal no longer exists in `UI/src/app/items/items.component.spec.ts`
- [ ] T045 [US5] Refactor `ItemsComponent` to replace `showForm` signal with `showCreateModal` and `showEditModal` signals; replace inline `<app-item-form>` with two `<app-modal>` blocks wrapping `ItemFormComponent`; preserve all existing dispatch logic (createItem, updateItem, deleteItem) in `UI/src/app/items/items.component.ts`, `items.component.html`, `items.component.scss`

**Checkpoint**: Items page modal pattern matches the Actions page; no inline forms visible during normal operation.

---

## Phase 7: US6 (P2) — Modal UI for Triggers Management

**Goal**: Add missing `updateTrigger` NgRx plumbing to the Triggers store, add `editTrigger` input to `TriggerFormComponent`, and refactor `TriggersComponent` to use `ModalComponent` for create and edit operations.

**Independent Test**: Navigate to `/triggers`, click "New Trigger" → modal opens. Click edit → modal opens pre-filled with phrase. Save edit → trigger phrase updated in list. Cancel → no change.

### Tests for US6

> **Write these tests FIRST — ensure they FAIL before implementation.**

- [ ] T046 [P] [US6] Add `updateTrigger`, `updateTriggerSuccess`, `updateTriggerFailure`, `selectTrigger` NgRx action creators to `UI/src/app/triggers/store/actions/triggers.actions.ts`
- [ ] T047 [US6] Write `TriggersReducer` tests for `selectTrigger` (sets selectedTrigger), `updateTriggerSuccess` (replaces trigger in list), `updateTriggerFailure` (sets error) in `UI/src/app/triggers/store/reducers/triggers.reducer.spec.ts`
- [ ] T048 [US6] Update `TriggersReducer` to handle `selectTrigger`, `updateTriggerSuccess`, and `updateTriggerFailure` in `UI/src/app/triggers/store/reducers/triggers.reducer.ts`
- [ ] T049 [US6] Write `TriggersEffects` tests for `updateTrigger$` effect (dispatches `updateTriggerSuccess` on 200, `updateTriggerFailure` on error) in `UI/src/app/triggers/store/effects/triggers.effects.spec.ts`
- [ ] T050 [US6] Add `update(id: string, request: UpdateTriggerRequest): Observable<Trigger>` method to `TriggersApiService` in `UI/src/app/triggers/store/api/triggers-api.service.ts`
- [ ] T051 [US6] Implement `updateTrigger$` effect calling `TriggersApiService.update()` in `UI/src/app/triggers/store/effects/triggers.effects.ts`
- [ ] T052 [US6] Write `TriggerFormComponent` tests for `editTrigger` input: null = create mode (blank form), non-null = edit mode (phrase pre-filled) in `UI/src/app/triggers/components/trigger-form/trigger-form.component.spec.ts`
- [ ] T053 [US6] Add `editTrigger = input<Trigger | null>(null)` to `TriggerFormComponent` and pre-fill the phrase form control when non-null in `UI/src/app/triggers/components/trigger-form/trigger-form.component.ts`
- [ ] T054 [US6] Write `TriggersComponent` tests: "New Trigger" sets `showCreateModal(true)`, edit button dispatches `selectTrigger` and sets `showEditModal(true)`, `updateTrigger` dispatches on saved, cancel/closed resets modal signals in `UI/src/app/triggers/triggers.component.spec.ts`
- [ ] T055 [US6] Refactor `TriggersComponent` to add `showCreateModal`, `showEditModal` signals and `selectedTrigger` selector; replace inline create form with two `<app-modal>` blocks (create + edit) wrapping `TriggerFormComponent`; dispatch `updateTrigger` on edit save in `UI/src/app/triggers/triggers.component.ts`, `triggers.component.html`, `triggers.component.scss`

**Checkpoint**: All three management pages (Actions, Items, Triggers) use the identical modal interaction pattern for create, edit, and delete.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Verify complete coverage and run the full quickstart validation to confirm all stories work end-to-end.

- [ ] T056 [P] Run `npm run test:coverage` in `UI/` and confirm 100% coverage threshold passes for all new and modified frontend files
- [ ] T057 [P] Run `dotnet test` in `API/tests/Mapi.Application.Tests` and `API/tests/Mapi.API.IntegrationTests` and confirm all tests pass with zero failures

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion — **blocks all user story phases**
- **Phase 3 (US1+US2)**: Depends on Phase 2 completion
- **Phase 4 (US3)**: Depends on Phase 3 completion (needs existing store)
- **Phase 5 (US4)**: Depends on Phase 3 completion (needs existing store); can run in parallel with Phase 4
- **Phase 6 (US5)**: Depends on Phase 2 completion (needs ModalComponent — T007); can run in parallel with Phases 3–5
- **Phase 7 (US6)**: Depends on Phase 2 completion (needs ModalComponent — T007); can run in parallel with Phases 3–6
- **Phase 8 (Polish)**: Depends on all preceding phases

### User Story Dependencies

- **US1+US2 (Phase 3)**: Foundational complete → no dependencies on other stories
- **US3 (Phase 4)**: US1+US2 store in place → builds on Phase 3
- **US4 (Phase 5)**: US1+US2 store in place → builds on Phase 3; independent from US3
- **US5 (Phase 6)**: ModalComponent ready → independent of all Actions phases
- **US6 (Phase 7)**: ModalComponent ready → independent of all Actions phases

### Within Each Phase

- TDD: Write the spec/test task first; verify it FAILS; then implement
- Define models and action creators before reducer/effects
- Reducer and effects tests can be written in parallel (different files)
- Reducer and effects implementations can be written in parallel (different files)
- Component tests before component implementation
- Integration test feature file before step definitions

### Parallel Opportunities

**Phase 2** (all can be parallelised):
- T004 and T005 (different test files)
- T006+T007 (modal) and T008+T009 (service) — different files
- T010 and T011 (different files)

**Phase 3**:
- T012 and T013 (model file and actions file)
- T014 and T016 (reducer tests and effects tests — different files)
- T015 and T017 (reducer impl and effects impl — different files)
- T022 (routes file) can be written at any point during Phase 3

**Phases 4 and 5**: Can run in parallel with each other after Phase 3 (different store handlers)

**Phases 6 and 7**: Can run in parallel with each other and with Phases 3–5 (different features)

---

## Parallel Example: Phase 3 (US1 & US2)

```text
# Step 1 — parallel: define data structures
Task T012: Create action.model.ts interfaces
Task T013: Define actions.actions.ts NgRx creators

# Step 2 — parallel: write tests (depends on T012, T013)
Task T014: Write reducer tests (actions.reducer.spec.ts)
Task T016: Write effects tests   (actions.effects.spec.ts)
Task T018: Write form component tests (action-form.component.spec.ts)

# Step 3 — parallel: implement (depends on respective tests)
Task T015: Implement reducer      (actions.reducer.ts)
Task T017: Implement effects      (actions.effects.ts)
Task T022: Create routes file     (actions.routes.ts) — no test needed

# Step 4: Component tests + implementation (depends on T015, T017)
Task T020: Write ActionsComponent tests
Task T021: Implement ActionsComponent (depends on T020)
Task T023: Register store in app.config.ts (depends on T015)

# Step 5 — parallel: integration test coverage
Task T024: Write Actions.feature scenarios
Task T025: Implement ActionsStepDefinitions (depends on T024)
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Fix spec violation
2. Complete Phase 2: Foundational infrastructure
3. Complete Phase 3: Actions list + create modal
4. **STOP and VALIDATE**: Full Actions page functional — list renders, create works, empty state shows
5. Demo/deploy if needed

### Incremental Delivery

1. Phase 1 + Phase 2 → Foundation ready
2. Phase 3 → Actions list + create (MVP: SC-001, SC-002 partially, SC-004, SC-005)
3. Phase 4 → Actions edit (completes SC-002, SC-007 partially)
4. Phase 5 → Actions delete with safety guard (SC-003, SC-006)
5. Phase 6 → Items modal refactor (SC-007 partially, SC-008 partially)
6. Phase 7 → Triggers modal refactor (SC-007 ✅, SC-008 ✅)

### Parallel Team Strategy

After Phase 2 completes:
- Developer A: Phases 3 → 4 → 5 (Actions CRUD)
- Developer B: Phase 6 (Items modal refactor)
- Developer C: Phase 7 (Triggers modal refactor)

---

## Notes

- `[P]` tasks operate on different files and have no dependency on other incomplete tasks in the same phase
- Each phase ends with an independently testable increment
- TDD: test tasks must FAIL before the corresponding implementation task starts
- `createAction` NgRx factory function name conflicts with the domain "create action" concept — use `createNewAction` as the NgRx action creator name for the POST operation (see data-model.md naming note)
- The `ConfirmationDialogComponent` is reused unchanged for delete confirmations on all three pages — no new dialog scaffold needed
- `ActionsApiService` stays in `shared/services/` because the Triggers feature also uses it for the action-link-form (see research Decision 5)
- Pessimistic updates only: store is updated exclusively on server success responses — no optimistic rollback logic
- Transient failures (non-validation, non-conflict errors) surface via toast/snackbar — no blocking error banners
