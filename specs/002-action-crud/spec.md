# Feature Specification: Trigger-Action Binding & Modal UI Standardisation

**Feature Branch**: `002-action-crud`  
**Created**: 2026-04-12  
**Revised**: 2026-04-12  
**Status**: Revised  

## Summary of Design Change

The original spec assumed actions were user-created entities with full CRUD. The requirements have changed:

- **Actions are seeded global data** — 4 fixed actions (one per `ActionType`: Query, Add, Update, Remove). Users cannot create, edit, or delete actions.
- **Each trigger binds to exactly one action** — a required one-to-one FK on `Trigger` replaces the many-to-many `TriggerActionMap` join table.
- **No Action CRUD** — users pick from the seeded list when creating or editing a trigger.
- **No `/actions` route** — removed entirely; actions are only selectable from the trigger form.

---

## User Scenarios & Testing

### User Story 1 – View Available Actions (Priority: P1)

A logged-in user can view the list of available seeded actions (Query, Add, Update, Remove) for reference before assigning one to a trigger.

**Acceptance Scenarios**:

1. **Given** any authenticated user calls `GET /api/v1/actions`, **Then** the response contains exactly 4 actions — one for each ActionType — regardless of which user calls it.
2. **Given** the system is seeded, **When** two different users each call `GET /api/v1/actions`, **Then** both receive the same 4 actions.

---

### User Story 2 – Create a Trigger with an Action (Priority: P1)

A logged-in user creates a new trigger by entering a phrase and selecting one of the 4 seeded actions from a dropdown. The action assignment is required — a trigger cannot be saved without one.

**Acceptance Scenarios**:

1. **Given** a logged-in user opens the create trigger modal, **When** they enter a valid phrase and select an action, **Then** the trigger is created with the action assigned.
2. **Given** a user submits the create form without selecting an action, **Then** a validation error is shown and no trigger is created.
3. **Given** a user submits the create form without entering a phrase, **Then** a validation error is shown and no trigger is created.

---

### User Story 3 – Edit a Trigger's Action (Priority: P2)

A logged-in user can change the action assigned to an existing trigger by editing the trigger and selecting a different action from the dropdown.

**Acceptance Scenarios**:

1. **Given** a logged-in user opens the edit trigger modal, **When** they select a different action and save, **Then** the trigger reflects the new action.
2. **Given** a user submits the edit form with no action selected, **Then** a validation error is shown and the original action is preserved.

---

### User Story 4 – Modal UI for Items Management (Priority: P2)

A logged-in user manages their items (create, edit, delete) through modal dialogs on the Items page.

**Acceptance Scenarios**:

1. **Given** a logged-in user is on the Items page, **When** they click "New Item", **Then** a modal dialog opens with the create form.
2. **Given** a logged-in user clicks edit on an existing item, **When** the modal opens, **Then** the form is pre-filled with the item's current data.
3. **Given** a logged-in user confirms item deletion, **Then** the item is removed from the list and the modal closes.
4. **Given** a user dismisses any modal, **When** the dialog is closed, **Then** no data is changed.

---

### User Story 5 – Modal UI for Triggers Management (Priority: P2)

A logged-in user manages their triggers (create, edit, delete) through modal dialogs on the Triggers page.

**Acceptance Scenarios**:

1. **Given** a logged-in user is on the Triggers page, **When** they click "New Trigger", **Then** a modal dialog opens with a form containing a phrase field and an action dropdown.
2. **Given** a logged-in user clicks edit on an existing trigger, **When** the modal opens, **Then** the form is pre-filled with the trigger's current phrase and selected action.
3. **Given** a logged-in user confirms trigger deletion, **Then** the trigger is removed from the list and the modal closes.
4. **Given** a user dismisses any modal, **When** the dialog is closed, **Then** no data is changed.

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST seed exactly 4 actions at startup (Query, Add, Update, Remove), each with a fixed `ResponseTemplate`. These actions are global — not owned by any user.
- **FR-002**: System MUST expose a read-only `GET /api/v1/actions` endpoint that returns all 4 seeded actions. No POST, PUT, or DELETE endpoints for actions.
- **FR-003**: System MUST require `ActionId` when creating a trigger. A trigger without an action is invalid.
- **FR-004**: System MUST allow authenticated users to update a trigger's `ActionId` via the update trigger endpoint.
- **FR-005**: The trigger create and edit forms MUST include a required `<select>` dropdown populated with the 4 seeded actions. The form cannot be submitted without an action selected.
- **FR-006**: The `/actions` route and "Actions" navigation link MUST be removed. Actions are only accessible via the trigger form dropdown.
- **FR-007**: A reusable modal shell component MUST be created in `src/app/shared/components/` and used by the Items and Triggers management pages.
- **FR-008**: The existing Items management page MUST be refactored so that create, edit, and delete confirmation operations are presented in modal dialogs.
- **FR-009**: The existing Triggers management page MUST be refactored so that create, edit, and delete confirmation operations are presented in modal dialogs, with the trigger form including the action dropdown.

### Non-functional Requirements

- Actions are seeded via EF Core `HasData()` with deterministic GUIDs — idempotent across migrations.
- All trigger operations (create, update, delete) remain per-user (`UserId` FK on `Trigger` is unchanged).
- Pessimistic NgRx store updates only — store updated after server confirmation.

## Assumptions

- The 4 seeded actions have fixed `ResponseTemplate` values that do not change after seeding.
- Deleting a seeded action is not possible (no DELETE endpoint; EF Core `DeleteBehavior.Restrict` on the Trigger → Action FK prevents orphaned triggers).
- Action type is not editable — it is a fixed property of the seeded actions.
- The existing `TriggerActionMap` join table and all link/unlink endpoints are removed entirely.
- Existing data (user-created actions, TriggerActionMaps) is dropped in the migration.
