# Implementation Plan: Trigger-Action Binding & Modal UI Standardisation

**Branch**: `002-action-crud` | **Revised**: 2026-04-12 | **Spec**: [spec.md](./spec.md)

## Summary

Redesign the Action/Trigger relationship: actions become seeded global data (4 fixed actions, one per ActionType), the many-to-many `TriggerActionMap` join table is replaced by a direct `ActionId` FK on `Trigger` (required, one-to-one), all Action CRUD is removed, the `/actions` route is removed, and both Items and Triggers management pages are refactored to use modal dialogs via a shared `ModalComponent`.

## Technical Context

**Language/Version**:
- Backend: C# / .NET 9 (Minimal API, MediatR, FluentValidation, EF Core, Reqnroll)
- Frontend: TypeScript / Angular 18+ (NgRx Classic, Signals, @ngx-env/builder)

**Primary Dependencies**:
- Backend: MediatR, FluentValidation, EF Core 9, SQL Server, Serilog, Reqnroll, xUnit, Moq
- Frontend: NgRx, Angular Signals (`signal()`, `input()`, `output()`, `toSignal()`), SCSS, Jest

**Storage**: SQL Server (EF Core code-first migrations)

**Testing**:
- Backend: xUnit (unit), Reqnroll/xUnit (integration)
- Frontend: Jest + Angular Testing Library (90%+ coverage threshold)

---

## Implementation Phases

### Phase 1 — Backend Domain
Remove `UserId`/`User`/`TriggerActionMaps` from `Action`; add `ActionId` FK + `Action` nav to `Trigger`; delete `TriggerActionMap` entity; update `IActionRepository`; delete `ITriggerActionMapRepository`.

### Phase 2 — Backend Application
Delete `ActionCommands.cs`, `ActionValidators.cs`; update `ActionQueries` (no user filter); strip `ActionRequest`/`UpdateActionRequest` from DTOs; update `TriggerCommands` (add `ActionId`, remove link/unlink); update `TriggerQueries` (direct nav); update `TriggerDTOs` (flat response); update `TriggerValidators` (ActionId required).

### Phase 3 — Backend Infrastructure
Update `ActionConfiguration` (remove UserId FK, add seed data); update `TriggerConfiguration` (add ActionId FK, Restrict delete); delete `TriggerActionMapConfiguration`; update `ActionRepository` (`GetAllAsync`); delete `TriggerActionMapRepository`; update `ApplicationDbContext` (remove TriggerActionMap DbSet, remove Action query filter); update `DependencyInjection`.

### Phase 4 — Backend API
Strip `ActionsEndpoints` to GET only; remove link/unlink from `TriggersEndpoints`; update Trigger create/update to include `ActionId`.

### Phase 5 — EF Core Migration
`RedesignActionsAsSeededAndSingleTriggerAction`: drops `TriggerActionMaps`, removes `Actions.UserId`, adds `Triggers.ActionId`, seeds 4 actions.

### Phase 6 — Backend Tests
Delete command/validator tests; rewrite `ActionQueryHandlerTests`; update Actions.feature (GET only); update Triggers integration tests (add ActionId, remove link/unlink).

### Phase 7 — Frontend Actions Store (read-only)
Strip create/update/delete from `actions.actions.ts`, `actions.reducer.ts`, `actions.effects.ts`, `action.model.ts`, `actions-api.service.ts`.

### Phase 8 — Frontend Remove Actions Route
Delete `ActionsComponent`, `ActionFormComponent`, `actions.routes.ts`; remove route from `app.routes.ts`; remove nav link from `app.component.html`.

### Phase 9 — Frontend Triggers Feature
Delete `action-link-form` component; update `trigger.model.ts`, `triggers.actions.ts`, `triggers.reducer.ts`, `triggers.effects.ts`, `triggers.service.ts`; add `actionId` dropdown to `TriggerFormComponent`; update `TriggersComponent` to load actions and pass to form.

### Phase 10 — Frontend Tests
Update all affected spec files; delete specs for removed components.

### Phase 11 — Shared Modal Infrastructure
Create `ModalComponent` (shared shell used by Items and Triggers pages).

### Phase 12 — Modal UI Refactor
Refactor `ItemsComponent` and `TriggersComponent` to use `ModalComponent` for create/edit/delete modals.

---

## Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Seed mechanism | `HasData()` in `ActionConfiguration` | Idempotent across migrations; deterministic GUIDs |
| Trigger→Action relationship | Required FK on Trigger | One action per trigger; simplest model |
| Delete behavior | `DeleteBehavior.Restrict` on ActionId FK | Seeded actions cannot be deleted while any trigger references them |
| Action list in frontend | Loaded via `ActionsApiService.getAll()` on TriggersComponent init | Actions are global — no NgRx store needed for them in triggers context; however loading through store is also acceptable |
| `/actions` route | Removed entirely | No CRUD UI; actions are only selectable from trigger form |
| `TriggerActionMap` | Deleted entirely | Replaced by direct FK; sort order no longer meaningful with single action |
