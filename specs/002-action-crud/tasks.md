---
description: "Task list for Trigger-Action Binding & Modal UI Standardisation (revised design)"
---

# Tasks: Trigger-Action Binding & Modal UI Standardisation

**Input**: Design documents from `/specs/002-action-crud/`  
**Prerequisites**: spec.md ✅, data-model.md ✅, contracts/api.md ✅, contracts/ui-components.md ✅

**Tests**: TDD required — frontend (Jest, 90%+ coverage) and backend (xUnit + Reqnroll). Write tests before implementation.

**Organization**: Tasks are grouped by layer. Complete each phase before moving to the next.

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)

---

## Phase 1: Backend Domain Layer

- [ ] T001 Update `Action` entity: remove `UserId`, `User` nav, and `TriggerActionMaps` collection — `API/src/Mapi.Domain/Entities/Action.cs`
- [ ] T002 Update `Trigger` entity: remove `TriggerActionMaps` collection; add `ActionId` (Guid) and `Action` navigation property — `API/src/Mapi.Domain/Entities/Trigger.cs`
- [ ] T003 Delete `TriggerActionMap` entity — `API/src/Mapi.Domain/Entities/TriggerActionMap.cs`
- [ ] T004 Update `IActionRepository`: replace `GetAllByUserAsync(Guid)` with `GetAllAsync()`; remove `IsLinkedToAnyTriggerAsync(Guid)` — `API/src/Mapi.Domain/Interfaces/IActionRepository.cs`
- [ ] T005 Delete `ITriggerActionMapRepository` — `API/src/Mapi.Domain/Interfaces/ITriggerActionMapRepository.cs`

**Checkpoint**: Solution compiles (ignore Infrastructure/Application errors — they will be fixed next phases).

---

## Phase 2: Backend Application Layer

- [ ] T006 Delete `ActionCommands.cs` — `API/src/Mapi.Application/Actions/Commands/ActionCommands.cs`
- [ ] T007 Delete `ActionValidators.cs` — `API/src/Mapi.Application/Actions/Validators/ActionValidators.cs`
- [ ] T008 Update `ActionQueries.cs`: remove `GetActionByIdQuery`; update `GetActionsQueryHandler` to call `GetAllAsync()` (no user filter) — `API/src/Mapi.Application/Actions/Queries/ActionQueries.cs`
- [ ] T009 Update `ActionDTOs.cs`: remove `ActionRequest` and `UpdateActionRequest`; keep only `ActionResponse` — `API/src/Mapi.Application/Actions/DTOs/ActionDTOs.cs`
- [ ] T010 Update `TriggerCommands.cs`: remove `LinkActionCommand`/`UnlinkActionCommand`; add `ActionId` (Guid) to `CreateTriggerCommand` and `UpdateTriggerCommand` — `API/src/Mapi.Application/Triggers/Commands/TriggerCommands.cs`
- [ ] T011 Update `TriggerQueries.cs`: use direct `trigger.Action` navigation instead of `TriggerActionMaps` join — `API/src/Mapi.Application/Triggers/Queries/TriggerQueries.cs`
- [ ] T012 Update `TriggerDTOs.cs`: remove `TriggerActionLinkRequest`; update `TriggerRequest` (add `ActionId`); update `TriggerResponse` (replace collection with flat `ActionId` + `ActionType`) — `API/src/Mapi.Application/Triggers/DTOs/TriggerDTOs.cs`
- [ ] T013 Update `TriggerValidators.cs`: remove `LinkActionCommandValidator`; add `ActionId` (required, non-empty Guid) to `CreateTriggerCommandValidator` and `UpdateTriggerCommandValidator` — `API/src/Mapi.Application/Triggers/Validators/TriggerValidators.cs`

**Checkpoint**: `dotnet build` succeeds (Infrastructure errors resolved in Phase 3).

---

## Phase 3: Backend Infrastructure Layer

- [ ] T014 Update `ActionConfiguration.cs`: remove `UserId` FK and `TriggerActionMaps` nav; add `HasData()` for 4 seeded actions with deterministic GUIDs — `API/src/Mapi.Infrastructure/Persistence/Configurations/ActionConfiguration.cs`
- [ ] T015 Update `TriggerConfiguration.cs`: remove `TriggerActionMaps` nav; add `HasOne(t => t.Action).WithMany().HasForeignKey(t => t.ActionId).OnDelete(DeleteBehavior.Restrict)` — `API/src/Mapi.Infrastructure/Persistence/Configurations/TriggerConfiguration.cs`
- [ ] T016 Delete `TriggerActionMapConfiguration.cs` — `API/src/Mapi.Infrastructure/Persistence/Configurations/TriggerActionMapConfiguration.cs`
- [ ] T017 Update `ActionRepository.cs`: replace `GetAllByUserAsync(Guid)` with `GetAllAsync()`; remove `IsLinkedToAnyTriggerAsync(Guid)` — `API/src/Mapi.Infrastructure/Persistence/Repositories/ActionRepository.cs`
- [ ] T018 Delete `TriggerActionMapRepository.cs` — `API/src/Mapi.Infrastructure/Persistence/Repositories/TriggerActionMapRepository.cs`
- [ ] T019 Update `ApplicationDbContext.cs`: remove `DbSet<TriggerActionMap>`; remove global query filter for `Actions` — `API/src/Mapi.Infrastructure/Persistence/ApplicationDbContext.cs`
- [ ] T020 Update `DependencyInjection.cs` (Infrastructure): remove `ITriggerActionMapRepository` / `TriggerActionMapRepository` registration — `API/src/Mapi.Infrastructure/DependencyInjection.cs`

**Checkpoint**: `dotnet build` with zero warnings.

---

## Phase 4: Backend API Layer

- [ ] T021 Update `ActionsEndpoints.cs`: remove POST, PUT, DELETE; keep only `GET /api/v1/actions` calling `GetActionsQuery` — `API/src/Mapi.API/Endpoints/ActionsEndpoints.cs`
- [ ] T022 Update `TriggersEndpoints.cs`: remove link/unlink endpoints; update `POST` and `PUT` to include `ActionId` in request body — `API/src/Mapi.API/Endpoints/TriggersEndpoints.cs`

**Checkpoint**: `dotnet build` with zero warnings.

---

## Phase 5: EF Core Migration

- [ ] T023 Add migration `RedesignActionsAsSeededAndSingleTriggerAction`:
  ```bash
  dotnet ef migrations add RedesignActionsAsSeededAndSingleTriggerAction \
    --project API/src/Mapi.Infrastructure \
    --startup-project API/src/Mapi.API
  ```
  Verify migration drops `TriggerActionMaps` table, removes `Actions.UserId` column, adds `Triggers.ActionId` FK column, and inserts 4 seed rows.

**Checkpoint**: `dotnet ef database update` applies cleanly; DB has 4 rows in `Actions`, no `TriggerActionMaps` table.

---

## Phase 6: Backend Tests

- [ ] T024 Delete `ActionCommandHandlerTests.cs` — `API/tests/Mapi.Application.Tests/Actions/ActionCommandHandlerTests.cs`
- [ ] T025 Delete `ActionValidatorTests.cs` — `API/tests/Mapi.Application.Tests/Actions/ActionValidatorTests.cs`
- [ ] T026 Rewrite `ActionQueryHandlerTests.cs`: test `GetActionsQuery` returns all 4 seeded actions (no user filter) — `API/tests/Mapi.Application.Tests/Actions/ActionQueryHandlerTests.cs`
- [ ] T027 Update `Actions.feature` and `ActionsStepDefinitions.cs`: remove CRUD scenarios; keep only GET returning 4 seeded actions — `API/tests/Mapi.API.IntegrationTests/`
- [ ] T028 Update `TriggersStepDefinitions.cs`: remove link/unlink step definitions; update create/update scenarios to include `ActionId` — `API/tests/Mapi.API.IntegrationTests/StepDefinitions/TriggersStepDefinitions.cs`

**Checkpoint**: `dotnet test` passes with zero failures.

---

## Phase 7: Frontend — Actions Store (gutted to read-only)

- [ ] T029 [P] Update `action.model.ts`: remove `CreateActionRequest` and `UpdateActionRequest` — `UI/src/app/actions/store/models/action.model.ts`
- [ ] T030 [P] Update `actions.actions.ts`: remove create/update/delete NgRx action creators; keep load actions only — `UI/src/app/actions/store/actions/actions.actions.ts`
- [ ] T031 [P] Update `actions.reducer.ts`: remove create/update/delete case handlers; keep load only — `UI/src/app/actions/store/reducers/actions.reducer.ts`
- [ ] T032 [P] Update `actions.effects.ts`: remove create/update/delete effects; keep `loadActions$` only — `UI/src/app/actions/store/effects/actions.effects.ts`
- [ ] T033 Update `actions-api.service.ts`: remove `create()`, `update()`, `delete()` methods; keep `getAll()` only — `UI/src/app/shared/services/actions-api.service.ts`

---

## Phase 8: Frontend — Remove Actions Route and Nav

- [ ] T034 Delete `actions.component.ts`, `actions.component.html`, `actions.component.scss` — `UI/src/app/actions/`
- [ ] T035 Delete `action-form` component folder — `UI/src/app/actions/components/action-form/`
- [ ] T036 Delete `actions.routes.ts` — `UI/src/app/actions/actions.routes.ts`
- [ ] T037 Remove `'actions'` route from `app.routes.ts` — `UI/src/app/app.routes.ts`
- [ ] T038 Remove "Actions" nav link from `app.component.html` — `UI/src/app/app.component.html`

---

## Phase 9: Frontend — Triggers Feature

- [ ] T039 Delete `action-link-form` component folder — `UI/src/app/triggers/components/action-link-form/`
- [ ] T040 Update `trigger.model.ts`: remove `TriggerAction` and `ActionLinkRequest`; update `Trigger`, `TriggerRequest`, `UpdateTriggerRequest` to include `actionId` — `UI/src/app/triggers/store/models/trigger.model.ts`
- [ ] T041 Update `triggers.actions.ts`: remove `linkAction`/`unlinkAction` action creators — `UI/src/app/triggers/store/actions/triggers.actions.ts`
- [ ] T042 Update `triggers.reducer.ts`: remove link/unlink case handlers — `UI/src/app/triggers/store/reducers/triggers.reducer.ts`
- [ ] T043 Update `triggers.effects.ts`: remove `linkAction$` and `unlinkAction$` effects — `UI/src/app/triggers/store/effects/triggers.effects.ts`
- [ ] T044 Update `triggers.service.ts`: remove `linkAction()` and `unlinkAction()` methods — `UI/src/app/triggers/store/api/triggers.service.ts`
- [ ] T045 Update `trigger-form.component.ts/html`: add `actions = input<Action[]>([])` and required `actionId` FormControl with `<select>` dropdown — `UI/src/app/triggers/components/trigger-form/`
- [ ] T046 Update `triggers.component.ts/html`: remove link/unlink modal handling; dispatch `loadActions` on init; pass `actions` signal to `TriggerFormComponent` — `UI/src/app/triggers/triggers.component.ts`

---

## Phase 10: Frontend Tests

- [ ] T047 [P] Update `actions-api.service.spec.ts`: remove tests for create/update/delete — `UI/src/app/shared/services/actions-api.service.spec.ts`
- [ ] T048 [P] Update `actions.actions.ts` store spec (if exists): remove create/update/delete tests
- [ ] T049 [P] Update `triggers.store.spec.ts`: remove link/unlink tests; add tests for `actionId` in create/update payloads — `UI/src/app/triggers/store/triggers.store.spec.ts`
- [ ] T050 [P] Update `trigger-form.component.spec.ts`: add tests for action dropdown (renders options, required validation, pre-fill in edit mode) — `UI/src/app/triggers/components/trigger-form/trigger-form.component.spec.ts`
- [ ] T051 [P] Update `triggers.component.spec.ts`: remove link/unlink tests; add test for actions loaded on init — `UI/src/app/triggers/triggers.component.spec.ts`
- [ ] T052 [P] Update `action-link-form.component.spec.ts` — delete the spec file since the component is deleted

**Checkpoint**: `npx jest --coverage` passes with 90%+ coverage.

---

## Phase 11: Shared Infrastructure

- [ ] T053 Create `ModalComponent` (standalone, OnPush; `isVisible` signal input, `title` signal input, `closed` output; backdrop, × button, Escape key, focus trap, `role="dialog"` aria attributes) — `UI/src/app/shared/components/modal/modal.component.ts/html/scss`
- [ ] T054 Write `ModalComponent` tests — `UI/src/app/shared/components/modal/modal.component.spec.ts`

---

## Phase 12: Modal UI Refactor (Items + Triggers)

- [ ] T055 Refactor `ItemsComponent`: replace inline form with `ModalComponent` wrapping `ItemFormComponent` for create and edit — `UI/src/app/items/items.component.ts/html`
- [ ] T056 Update `ItemsComponent` tests to cover modal open/close behavior — `UI/src/app/items/items.component.spec.ts`
- [ ] T057 Refactor `TriggersComponent`: replace inline forms with `ModalComponent` for create and edit — `UI/src/app/triggers/triggers.component.ts/html`
- [ ] T058 Update `TriggersComponent` tests — `UI/src/app/triggers/triggers.component.spec.ts`

**Final Checkpoint**: `dotnet build` zero warnings · `dotnet test` zero failures · `ng build` zero errors · `npx jest --coverage` 90%+ pass
