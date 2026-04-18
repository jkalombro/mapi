# UI Component Contracts

**Feature**: `002-action-crud` | **Revised**: 2026-04-12

---

## New Components

### ModalComponent

**Location**: `src/app/shared/components/modal/modal.component.ts`  
**Purpose**: Reusable modal shell used by Items and Triggers for create/edit forms.

```typescript
// Inputs
isVisible = input<boolean>(false);
title     = input<string>('');

// Outputs
closed = output<void>();  // × button, backdrop click, or Escape key
```

**Accessibility**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to title. Focus trapped. Escape emits `closed`.

---

## Modified Components

### TriggerFormComponent (updated)

**Location**: `src/app/triggers/components/trigger-form/trigger-form.component.ts`  
**Changes**: Add required `actions` input and `actionId` form control.

```typescript
// Inputs
editTrigger = input<Trigger | null>(null);      // null = create; non-null = edit (pre-fill)
actions     = input<Action[]>([]);               // seeded actions for dropdown
isLoading   = input<boolean>(false);

// Outputs
saved     = output<TriggerRequest>();
cancelled = output<void>();
```

**Form fields**:
| Field | Control | Create | Edit |
|-------|---------|--------|------|
| Phrase | `<input>` | Empty, required, min 2 chars | Pre-filled |
| Action | `<select>` | Required, populated from `actions` input | Pre-filled with current actionId |

**Validation**: Both fields required. ActionId must not be empty GUID.

---

### TriggersComponent (updated)

**Location**: `src/app/triggers/triggers.component.ts`  
**Changes**:
1. Load available actions on init (dispatch `loadActions` or call `ActionsApiService.getAll()`)
2. Pass `actions` list to `TriggerFormComponent`
3. Remove `linkingTriggerId` signal and link/unlink modal logic
4. Create and edit modals use `ModalComponent` wrapping `TriggerFormComponent`

```typescript
// Internal signals
showCreateModal = signal<boolean>(false);
showEditModal   = signal<boolean>(false);
pendingDeleteId = signal<string | null>(null);

// Store selectors (via toSignal)
triggers      = toSignal(store.select(selectAllTriggers), { initialValue: [] });
actions       = toSignal(store.select(selectAllActions), { initialValue: [] });
selectedTrigger = toSignal(store.select(selectSelectedTrigger), { initialValue: null });
isLoading     = toSignal(store.select(selectTriggersIsLoading), { initialValue: false });
```

---

### ItemsComponent (refactored)

**Location**: `src/app/items/items.component.ts`  
**Change**: Replace inline `ItemFormComponent` with `ModalComponent` wrapping it.

```html
<app-modal [isVisible]="showCreateModal()" title="New Item" (closed)="onCancelForm()">
  <app-item-form [editItem]="null" [isLoading]="isLoading()" (saved)="onSave($event)" (cancelled)="onCancelForm()" />
</app-modal>

<app-modal [isVisible]="showEditModal()" title="Edit Item" (closed)="onCancelForm()">
  <app-item-form [editItem]="selectedItem()" [isLoading]="isLoading()" (saved)="onSave($event)" (cancelled)="onCancelForm()" />
</app-modal>
```

---

## Removed Components

| Component | Reason |
|-----------|--------|
| `ActionFormComponent` (`actions/components/action-form/`) | No Action CRUD — users cannot create or edit actions |
| `ActionsComponent` (`actions/actions.component.ts`) | `/actions` route removed entirely |
| `ActionLinkFormComponent` (`triggers/components/action-link-form/`) | Link/unlink replaced by action dropdown in TriggerFormComponent |

---

## ActionsApiService (simplified)

**Location**: `src/app/shared/services/actions-api.service.ts`

```typescript
// Only method remaining:
getAll(): Observable<Action[]>

// Removed: create(), update(), delete()
```

Used by `TriggersComponent` to populate the action dropdown.

---

## Routing Changes

### `app.routes.ts`

```typescript
// REMOVED:
{
  path: 'actions',
  loadChildren: () => import('./actions/actions.routes').then(m => m.actionsRoutes),
  canActivate: [authGuard],
}
```

### `app.component.html`

```html
<!-- REMOVED: -->
<a routerLink="/actions" class="toolbar__link">Actions</a>
```

---

## Unchanged Components

| Component | Notes |
|-----------|-------|
| `ConfirmationDialogComponent` | Used as-is for delete confirmation on Items and Triggers pages |
| `ItemFormComponent` | No internal changes needed |
| `ItemListComponent` | No changes |
| `TriggerFormComponent` | Modified (see above) — phrase field unchanged, action dropdown added |
