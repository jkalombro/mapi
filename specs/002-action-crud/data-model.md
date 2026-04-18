# Data Model: Trigger-Action Binding & Modal UI Standardisation

**Feature**: `002-action-crud` | **Revised**: 2026-04-12

---

## Backend Entities

### Action (seeded global — no UserId)

**Source**: `Mapi.Domain/Entities/Action.cs`, `Mapi.Infrastructure/Persistence/Configurations/ActionConfiguration.cs`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `Id` | `Guid` | PK, required | Deterministic seed GUID |
| `ActionType` | `ActionType` (enum) | Required, immutable | Query, Add, Update, Remove |
| `ResponseTemplate` | `string` | Required, max 500 chars | Fixed seed value |
| `CreatedAt` | `DateTime` | Set on insert | Inherited from `BaseEntity` |
| `UpdatedAt` | `DateTime` | Set on update | Inherited from `BaseEntity` |

**No `UserId`** — actions are global, not user-owned.

**Seed data** (deterministic GUIDs, via `HasData()` in `ActionConfiguration`):

| ActionType | ResponseTemplate |
|------------|-----------------|
| Query | `"The {item} is {value}."` |
| Add | `"I've added {item}."` |
| Update | `"I've updated {item} to {value}."` |
| Remove | `"I've removed {item}."` |

---

### Trigger (updated — direct ActionId FK)

**Source**: `Mapi.Domain/Entities/Trigger.cs`, `Mapi.Infrastructure/Persistence/Configurations/TriggerConfiguration.cs`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `Id` | `Guid` | PK, required | Inherited from `BaseEntity` |
| `UserId` | `Guid` | FK → User, required | Per-user isolation (unchanged) |
| `Phrase` | `string` | Required, max 200 chars | Unchanged |
| `ActionId` | `Guid` | FK → Action, required | **New** — replaces TriggerActionMap |
| `CreatedAt` | `DateTime` | Set on insert | Inherited from `BaseEntity` |
| `UpdatedAt` | `DateTime` | Set on update | Inherited from `BaseEntity` |

**Delete behavior**: `DeleteBehavior.Restrict` on `Trigger.ActionId → Action.Id` — seeded actions cannot be deleted while any trigger references them.

---

### TriggerActionMap — REMOVED

The `TriggerActionMap` join table and entity are removed entirely. The many-to-many relationship it represented is replaced by the direct `Trigger.ActionId` FK.

---

## Backend DTOs

### ActionResponse (read-only, no request DTOs)

```csharp
record ActionResponse(Guid Id, ActionType ActionType, string ResponseTemplate, DateTime CreatedAt, DateTime UpdatedAt);
```

No `ActionRequest` or `UpdateActionRequest` — actions cannot be created or updated by users.

### TriggerRequest (updated)

```csharp
record TriggerRequest(string Phrase, Guid ActionId);
```

### TriggerResponse (updated)

```csharp
record TriggerResponse(Guid Id, string Phrase, Guid ActionId, string ActionType, DateTime CreatedAt, DateTime UpdatedAt);
```

`ActionId` and `ActionType` are flat fields — no nested collection.

---

## Backend Commands / Queries

```csharp
// Actions — read-only
record GetActionsQuery → IReadOnlyList<ActionResponse>   // no user filter

// Triggers
record CreateTriggerCommand(Guid UserId, string Phrase, Guid ActionId) → TriggerResponse
record UpdateTriggerCommand(Guid Id, Guid UserId, string Phrase, Guid ActionId) → TriggerResponse
record DeleteTriggerCommand(Guid Id, Guid UserId) → Unit

// Removed: LinkActionCommand, UnlinkActionCommand, GetActionByIdQuery, CreateActionCommand, UpdateActionCommand, DeleteActionCommand
```

---

## Frontend State Shape

### ActionsState (read-only)

```typescript
interface ActionsState {
  actions: Action[];
  isLoading: boolean;
  error: string | null;
}
```

No `selectedAction` — no create/edit modal for actions.

### Action model (`actions/store/models/action.model.ts`)

```typescript
export interface Action {
  id: string;
  actionType: string;          // 'Query' | 'Add' | 'Update' | 'Remove'
  responseTemplate: string;
  createdAt: string;
  updatedAt: string;
}

// No CreateActionRequest or UpdateActionRequest
```

### Trigger model (updated)

```typescript
export interface Trigger {
  id: string;
  phrase: string;
  actionId: string;       // single FK — replaces actions: TriggerAction[]
  actionType: string;     // denormalised for display
  createdAt: string;
  updatedAt: string;
}

export interface TriggerRequest {
  phrase: string;
  actionId: string;       // required
}

export interface UpdateTriggerRequest {
  phrase: string;
  actionId: string;       // required
}

// Removed: TriggerAction, ActionLinkRequest
```

---

## Frontend NgRx Actions

### Actions feature store (`actions/store/actions/actions.actions.ts`)

```typescript
loadActions        → (none)
loadActionsSuccess → { actions: Action[] }
loadActionsFailure → { error: string }

// No create / update / delete NgRx actions
```

### Triggers store (updated)

```typescript
// Existing (unchanged):
loadTriggers, loadTriggersSuccess, loadTriggersFailure
createTrigger, createTriggerSuccess, createTriggerFailure
deleteTrigger, deleteTriggerSuccess, deleteTriggerFailure
selectTrigger

// Updated (ActionId now included in payload):
updateTrigger        → { id: string; request: UpdateTriggerRequest }
updateTriggerSuccess → { trigger: Trigger }
updateTriggerFailure → { error: string }

// Removed: linkAction, linkActionSuccess, linkActionFailure,
//          unlinkAction, unlinkActionSuccess, unlinkActionFailure
```

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

## ERD Summary

```
User (1) ──→ (many) Trigger ──→ (1) Action [seeded, global]
```

`TriggerActionMap` is removed. `Action` has no `UserId`.
