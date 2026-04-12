# UI Component Contracts

**Feature**: `002-action-crud` | **Date**: 2026-04-12

---

## New Components

### ModalComponent

**Location**: `src/app/shared/components/modal/modal.component.ts`  
**Purpose**: Reusable modal shell used by Actions, Items, and Triggers for create/edit forms. Content is projected via `<ng-content>`.

```typescript
// Inputs
isVisible = input<boolean>(false);   // Controls overlay visibility
title     = input<string>('');        // Modal header title

// Outputs
closed = output<void>();              // Emits when user closes via × button or backdrop click or Escape key

// Template usage:
// <app-modal [isVisible]="showModal()" title="New Action" (closed)="onModalClose()">
//   <app-action-form ... />
// </app-modal>
```

**Accessibility**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the title element. Focus is trapped inside the modal while open. Escape key emits `closed`.

---

### ActionFormComponent

**Location**: `src/app/actions/components/action-form/action-form.component.ts`  
**Purpose**: Presentational form for creating or editing an action. Create mode: all fields empty, `ActionType` selector enabled. Edit mode: form pre-filled, `ActionType` selector disabled (immutable).

```typescript
// Inputs
editAction = input<Action | null>(null);      // null = create mode; non-null = edit mode
isLoading  = input<boolean>(false);           // Disables submit button while API call is in flight

// Outputs
saved     = output<CreateActionRequest | UpdateActionRequest>();
cancelled = output<void>();
```

**Form fields**:
| Field | Control | Create | Edit |
|-------|---------|--------|------|
| Action Type | `<select>` | Required, enabled | Read-only / disabled |
| Response Template | `<textarea>` | Required, max 500 chars | Pre-filled, required, max 500 chars |

**Validation**: Reactive Forms with synchronous validators. Error messages shown per-field after touch or submit attempt.

---

### ActionsComponent (smart container)

**Location**: `src/app/actions/actions.component.ts`  
**Purpose**: Smart container for the Actions management page. Selects from the NgRx store, dispatches actions, owns modal open/close signals.

```typescript
// No inputs/outputs (top-level routed component)

// Internal signals
showCreateModal = signal<boolean>(false);
showEditModal   = signal<boolean>(false);
pendingDeleteId = signal<string | null>(null);

// Store selectors (via toSignal)
actions    = toSignal(store.select(selectAllActions), { initialValue: [] });
isLoading  = toSignal(store.select(selectActionsIsLoading), { initialValue: false });
error      = toSignal(store.select(selectActionsError), { initialValue: null });
selectedAction = toSignal(store.select(selectSelectedAction), { initialValue: null });
```

---

## Modified Components

### ItemsComponent (refactored)

**Location**: `src/app/items/items.component.ts`  
**Change**: Replace `showForm: signal<boolean>` (inline form) with `showCreateModal` and `showEditModal` signals. Both use `ModalComponent` wrapping `ItemFormComponent`. Deletion continues to use `ConfirmationDialogComponent`.

**Before**:
```html
@if (showForm()) {
  <app-item-form ... />
}
```

**After**:
```html
<app-modal [isVisible]="showCreateModal()" title="New Item" (closed)="onCancelForm()">
  <app-item-form [editItem]="null" [isLoading]="isLoading()" (saved)="onSave($event)" (cancelled)="onCancelForm()" />
</app-modal>

<app-modal [isVisible]="showEditModal()" title="Edit Item" (closed)="onCancelForm()">
  <app-item-form [editItem]="selectedItem()" [isLoading]="isLoading()" (saved)="onSave($event)" (cancelled)="onCancelForm()" />
</app-modal>
```

---

### TriggersComponent (refactored)

**Location**: `src/app/triggers/triggers.component.ts`  
**Changes**:
1. Replace inline `TriggerFormComponent` with `ModalComponent` wrapping it (for both create and edit)
2. Add `showEditModal` signal and `selectedTrigger` signal
3. Wire `updateTrigger` NgRx dispatch for edits
4. `TriggerFormComponent` gains an `editTrigger` input for pre-fill support (consistent with `ItemFormComponent`)

**New NgRx store additions** (triggers store):
```typescript
updateTrigger        = createAction('[Triggers] Update Trigger', props<{ id: string; request: UpdateTriggerRequest }>())
updateTriggerSuccess = createAction('[Triggers] Update Trigger Success', props<{ trigger: Trigger }>())
updateTriggerFailure = createAction('[Triggers] Update Trigger Failure', props<{ error: string }>())
selectTrigger        = createAction('[Triggers] Select Trigger', props<{ trigger: Trigger | null }>())
```

---

## Unchanged Components

| Component | Notes |
|-----------|-------|
| `ConfirmationDialogComponent` | Used as-is for delete confirmation on all three pages |
| `ItemFormComponent` | No internal changes needed; accepts `editItem` input already |
| `ActionLinkFormComponent` | No changes; still used inline within trigger cards |
| `ItemListComponent` | No changes |

---

## ActionsApiService (extended)

**Location**: `src/app/shared/services/actions-api.service.ts`

```typescript
// Existing (unchanged)
getAll(): Observable<Action[]>

// New methods
create(request: CreateActionRequest): Observable<Action>
update(id: string, request: UpdateActionRequest): Observable<Action>
delete(id: string): Observable<void>
```

**Note**: The `Action` interface currently defined inline in `actions-api.service.ts` should be kept or aligned with the model in `actions/store/models/action.model.ts`. Since Actions is the only feature that owns this type, the service will import from the model file after the feature is created.

---

## Routing Additions

### `app.routes.ts` (addition)

```typescript
{
  path: 'actions',
  loadChildren: () => import('./actions/actions.routes').then(m => m.actionsRoutes),
  canActivate: [authGuard],
}
```

### `actions/actions.routes.ts` (new)

```typescript
export const actionsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./actions.component').then(m => m.ActionsComponent),
  },
];
```

### Navigation (`app.component.html` addition)

```html
<a routerLink="/actions" class="toolbar__link">Actions</a>
```
