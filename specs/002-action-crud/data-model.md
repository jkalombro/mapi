# Data Model: Action CRUD Management & Modal UI Standardisation

**Feature**: `002-action-crud` | **Date**: 2026-04-12

---

## Backend Entities

### Action (existing — no schema changes)

**Source**: `Mapi.Domain/Entities/Action.cs`, `Mapi.Infrastructure/Persistence/Configurations/ActionConfiguration.cs`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `Id` | `Guid` | PK, required | Inherited from `BaseEntity` |
| `UserId` | `Guid` | FK → User, required | Per-user isolation |
| `ActionType` | `ActionType` (enum) | Required, immutable after creation | Query, Add, Update, Remove |
| `ResponseTemplate` | `string` | Required, max 500 chars | Editable via PUT |
| `CreatedAt` | `DateTime` | Set on insert by `ApplicationDbContext` | Inherited from `BaseEntity` |
| `UpdatedAt` | `DateTime` | Set on update by `ApplicationDbContext` | Inherited from `BaseEntity` |

**Immutability rule**: `ActionType` is set at creation only. The `UpdateActionCommand` no longer accepts `ActionType`.

**Validation** (FluentValidation):
- `CreateActionCommand`: `ResponseTemplate` required, max 500 chars (ActionType is an enum — invalid values rejected by model binding)
- `UpdateActionCommand`: `Id` required (non-empty GUID), `ResponseTemplate` required, max 500 chars
- `DeleteActionCommand`: `Id` required (non-empty GUID)

### TriggerActionMap (existing — no changes)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `TriggerId` | `Guid` | FK → Trigger, required | Composite PK part |
| `ActionId` | `Guid` | FK → Action, required | Composite PK part |
| `SortOrder` | `int` | Required | Determines execution order |

**Delete guard**: An `Action` with one or more `TriggerActionMap` entries cannot be deleted (HTTP 409 Conflict).

---

## Backend DTOs

### Existing (unchanged)

```csharp
// Used for POST /api/v1/actions (create only)
record ActionRequest(ActionType ActionType, string ResponseTemplate);

// Used in all GET and mutation responses
record ActionResponse(Guid Id, ActionType ActionType, string ResponseTemplate, DateTime CreatedAt, DateTime UpdatedAt);
```

### New (fix for UpdateAction spec violation)

```csharp
// Used for PUT /api/v1/actions/{id} (update only — ActionType is immutable)
record UpdateActionRequest(string ResponseTemplate);
```

---

## Backend Commands / Queries (after fix)

```csharp
// Commands
record CreateActionCommand(ActionType ActionType, string ResponseTemplate)  → ActionResponse
record UpdateActionCommand(Guid Id, string ResponseTemplate)                → ActionResponse   ← FIXED
record DeleteActionCommand(Guid Id)                                         → Unit

// Queries
record GetActionsQuery                                                       → IReadOnlyList<ActionResponse>
record GetActionByIdQuery(Guid Id)                                           → ActionResponse
```

---

## Frontend State Shape

### ActionsState (new)

```typescript
interface ActionsState {
  actions: Action[];
  isLoading: boolean;
  error: string | null;
  selectedAction: Action | null;   // null = create mode, non-null = edit mode
}
```

### Action model (in `actions/store/models/action.model.ts`)

```typescript
export interface Action {
  id: string;
  actionType: string;          // 'Query' | 'Add' | 'Update' | 'Remove'
  responseTemplate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActionRequest {
  actionType: string;
  responseTemplate: string;
}

export interface UpdateActionRequest {
  responseTemplate: string;    // ActionType is immutable; not sent on update
}
```

> **Note**: The existing `Action` interface in `ActionsApiService` (`shared/services/actions-api.service.ts`) is the same shape. The model file in the feature store is the canonical definition; `ActionsApiService` will reference it from there (or keep consistent by type alignment).

### TriggersState (update — add selectedTrigger)

```typescript
// Existing fields unchanged; add:
selectedTrigger: Trigger | null;   // null = create mode, non-null = edit mode

// New action interfaces (update):
interface UpdateTriggerRequest {
  phrase: string;
}
```

---

## Frontend NgRx Actions

### Actions feature store (`actions/store/actions/actions.actions.ts`)

```typescript
loadActions           → (none)
loadActionsSuccess    → { actions: Action[] }
loadActionsFailure    → { error: string }

createAction          → { request: CreateActionRequest }
createActionSuccess   → { action: Action }
createActionFailure   → { error: string }

updateAction          → { id: string; request: UpdateActionRequest }
updateActionSuccess   → { action: Action }
updateActionFailure   → { error: string }

deleteAction          → { id: string }
deleteActionSuccess   → { id: string }
deleteActionFailure   → { error: string }

selectAction          → { action: Action | null }
```

> **Naming note**: NgRx action creators are named `createAction` (NgRx function) and the domain action name is also `createAction`. To avoid collision, the NgRx action creator for the domain "create" operation will be named `createNewAction` in the actions file, and the feature store file will prefix with the feature: `[Actions] Create Action`.

### Triggers store additions (`triggers/store/actions/triggers.actions.ts`)

```typescript
// Add to existing:
updateTrigger         → { id: string; request: UpdateTriggerRequest }
updateTriggerSuccess  → { trigger: Trigger }
updateTriggerFailure  → { error: string }

selectTrigger         → { trigger: Trigger | null }
```

---

## Component Contracts Summary

| Component | Location | Pattern |
|-----------|----------|---------|
| `ModalComponent` | `shared/components/modal/` | Shell; `isVisible` input, `title` input, `closed` output, `<ng-content>` body |
| `ActionFormComponent` | `actions/components/action-form/` | Presentational; `editAction` input (`Action \| null`), `isLoading` input, `saved` output (`CreateActionRequest \| UpdateActionRequest`), `cancelled` output |
| `ActionsComponent` | `actions/` | Smart container; dispatches to store, owns modal open/close signals |

Full interface details: see [contracts/ui-components.md](./contracts/ui-components.md)

---

## Enum: ActionType

| Value | Integer | Meaning |
|-------|---------|---------|
| `Query` | 0 | Returns information |
| `Add` | 1 | Adds an item |
| `Update` | 2 | Updates an item |
| `Remove` | 3 | Removes an item |

Source: `Mapi.Domain/Enums/ActionType.cs` — no changes needed.

---

## State Transitions

### Action lifecycle

```
[Created] ──(PUT response template)──► [Updated]
   │
   └──(DELETE — only if not linked)──► [Deleted]
              │
              └──(DELETE — linked)──► 409 Conflict → user must unlink from Triggers page first
```

### Modal lifecycle (all three management pages)

```
[List visible]
    ├── "New" button ──────────────────────────► [Create modal open]
    │                                                 ├── Submit ──► [API call] ──► [List updated, modal closed]
    │                                                 └── Cancel / × ──────────────► [Modal closed]
    ├── Edit button ──► dispatch selectItem/etc ──► [Edit modal open, form pre-filled]
    │                                                 ├── Submit ──► [API call] ──► [List updated, modal closed]
    │                                                 └── Cancel / × ──────────────► [Modal closed]
    └── Delete button ───────────────────────────► [Confirmation dialog open]
                                                      ├── Confirm ──► [API call] ──► [List updated, dialog closed]
                                                      └── Cancel ──────────────────► [Dialog closed]
```
