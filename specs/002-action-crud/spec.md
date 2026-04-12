# Feature Specification: Action CRUD Management & Modal UI Standardisation

**Feature Branch**: `002-action-crud`  
**Created**: 2026-04-12  
**Status**: Draft  
**Input**: User description: "I want to address what's missing here. Which is the ability to add actions. What exists: ActionsApiService only has getAll(), no create/update/delete. action-link-form component for linking an existing action to a trigger (T131, done). The triggers page links/unlinks actions, but there's no page to manage actions themselves (create, edit, delete). What's missing: T125 ActionsEndpoints on the backend (GET/POST/PUT/DELETE) not done. T122 Action CRUD commands/handlers/validators on the backend not done. A frontend Actions management page (list, create, edit, delete actions)."

**Scope note**: This branch covers two concerns: (1) net-new Action CRUD — backend endpoints, commands/handlers/validators, and a new frontend Actions management page; (2) frontend-only modal UI standardisation — the existing Items and Triggers management pages are refactored so that all mutating operations (create, edit, delete) are presented in modal dialogs, consistent with the new Actions page pattern. No backend changes are required for Items or Triggers.

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Create an Action (Priority: P1)

A logged-in user navigates to an Actions management page and creates a new action by selecting an action type (Query, Add, Update, or Remove) and entering a response template. The newly created action immediately appears in their action list and becomes available to link to triggers.

**Why this priority**: Without the ability to create actions, the action-link-form on the Triggers page has no actions to select from. Action creation is the foundational requirement that unblocks all other CRUD and linking flows.

**Independent Test**: Can be fully tested by navigating to the Actions page, submitting the create form with a valid action type and response template, and verifying the new action appears in the list. No trigger setup needed.

**Acceptance Scenarios**:

1. **Given** a logged-in user is on the Actions page, **When** they submit the create form with a valid action type and response template, **Then** the new action appears in their action list immediately.
2. **Given** a logged-in user submits the create form, **Then** the action is persisted and associated only with that user's account — not visible to other users.
3. **Given** a user submits the form with a missing action type or empty response template, **When** the form is submitted, **Then** validation errors are shown and no action is created.
4. **Given** a response template exceeds 500 characters, **When** the form is submitted, **Then** a validation error is shown and no action is created.

---

### User Story 2 – View All Actions (Priority: P1)

A logged-in user can view a list of all actions they have created, showing the action type and response template for each. The list contains only their own actions.

**Why this priority**: The list view is the starting point for all management operations (edit, delete) and is required for the action-link-form to populate its action selector. Shares P1 priority with create since neither is useful without the other.

**Independent Test**: Can be fully tested by creating one or more actions and verifying they appear correctly in the list. Isolation from other users' data can be verified with two separate accounts.

**Acceptance Scenarios**:

1. **Given** a logged-in user has created actions, **When** they visit the Actions page, **Then** all their actions are listed with their action type and response template visible.
2. **Given** a user has no actions yet, **When** they visit the Actions page, **Then** an empty state message is shown.
3. **Given** two users each have their own actions, **When** either user views the Actions page, **Then** they see only their own actions — never the other user's.

---

### User Story 3 – Edit an Action (Priority: P2)

A logged-in user can update an existing action's response template. Changing an action that is already linked to a trigger does not break the trigger — the updated template takes effect immediately for future trigger invocations.

**Why this priority**: Response templates often need refinement after initial creation. Editing is lower priority than create/view because users can still function with the original template until editing is available.

**Independent Test**: Can be fully tested by creating an action, editing its response template, and verifying the updated value is reflected in the list. No trigger linking needed.

**Acceptance Scenarios**:

1. **Given** a logged-in user selects an action to edit, **When** they submit the updated response template, **Then** the action reflects the new template immediately in the list.
2. **Given** an action is linked to a trigger, **When** the action's response template is updated, **Then** the trigger remains linked and uses the new template for subsequent invocations.
3. **Given** a user submits an edit with an empty response template, **When** the form is submitted, **Then** a validation error is shown and the original template is preserved.

---

### User Story 4 – Delete an Action (Priority: P3)

A logged-in user can delete an action they no longer need. If the action is currently linked to one or more triggers, the system prevents deletion and informs the user which triggers must be unlinked first.

**Why this priority**: Deletion prevents accumulation of stale actions. The safety guard (block delete if linked) is critical for data integrity — existing triggers must not silently lose their actions.

**Independent Test**: Can be fully tested by creating an action and deleting it (unlinked case), then by linking an action to a trigger and attempting to delete it (blocked case).

**Acceptance Scenarios**:

1. **Given** a logged-in user selects an unlinked action for deletion, **When** they confirm the deletion, **Then** the action is permanently removed from their list.
2. **Given** an action is linked to one or more triggers, **When** the user attempts to delete it, **Then** the system blocks deletion and shows a message indicating the action is in use.
3. **Given** a user dismisses the delete confirmation, **When** the dialog is closed, **Then** no action is deleted.

---

### User Story 5 – Modal UI for Items Management (Priority: P2)

A logged-in user manages their items (create, edit, delete) through modal dialogs on the Items page, consistent with the Actions page pattern. The list remains visible at all times — modals open on top without navigating away.

**Why this priority**: The Items page already has working CRUD; this is a UI consistency refactor. Deprioritised below Action create/view (P1) since the existing UI is functional, but ships in the same branch to establish the modal pattern across all management pages simultaneously.

**Independent Test**: Can be fully tested by opening each modal (create, edit, delete confirmation) on the Items page and verifying the list updates correctly after each operation.

**Acceptance Scenarios**:

1. **Given** a logged-in user is on the Items page, **When** they click "New Item", **Then** a modal dialog opens with the create form.
2. **Given** a logged-in user clicks edit on an existing item, **When** the modal opens, **Then** the form is pre-filled with the item's current data.
3. **Given** a logged-in user confirms item deletion in the modal, **When** the dialog is confirmed, **Then** the item is removed from the list and the modal closes.
4. **Given** a user dismisses any modal (create, edit, or delete), **When** the dialog is closed, **Then** no data is changed.

---

### User Story 6 – Modal UI for Triggers Management (Priority: P2)

A logged-in user manages their triggers (create, edit, delete) through modal dialogs on the Triggers page, consistent with the Actions and Items page patterns.

**Why this priority**: Same rationale as User Story 5 — existing Triggers CRUD is functional; this refactor ships together to deliver a consistent UI across all three management pages in a single branch.

**Independent Test**: Can be fully tested by opening each modal on the Triggers page and verifying list updates after each operation.

**Acceptance Scenarios**:

1. **Given** a logged-in user is on the Triggers page, **When** they click "New Trigger", **Then** a modal dialog opens with the create form.
2. **Given** a logged-in user clicks edit on an existing trigger, **When** the modal opens, **Then** the form is pre-filled with the trigger's current data.
3. **Given** a logged-in user confirms trigger deletion in the modal, **When** the dialog is confirmed, **Then** the trigger is removed from the list and the modal closes.
4. **Given** a user dismisses any modal, **When** the dialog is closed, **Then** no data is changed.

---

### Edge Cases

- What happens when a user tries to create two actions with the same action type and the same response template? (Duplicates are permitted — action type + template alone do not enforce uniqueness.)
- What happens when the Actions page is accessed while the backend is unavailable? The page shows an error state with a retry option.
- What happens when a user edits an action that is currently being used in a live voice command execution? The in-flight command uses the old template; subsequent invocations use the new one.
- What happens when an action is deleted while another browser tab has the action-link-form open? The stale tab's selector still shows the deleted action; selecting it and saving will surface a server-side error that is shown to the user.
- When a delete is attempted on an action linked to triggers, the error response must identify that the action is linked — the user must unlink it manually from the Triggers page before deletion is allowed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow authenticated users to create a new action by specifying an action type (one of: Query, Add, Update, Remove) and a response template.
- **FR-002**: System MUST validate that action type is one of the four permitted values and that response template is non-empty and does not exceed 500 characters; requests failing validation MUST be rejected with descriptive field-level error messages.
- **FR-003**: System MUST store each action as belonging to the authenticated user — no action is visible to or accessible by any other user.
- **FR-004**: System MUST allow authenticated users to retrieve the full list of their own actions.
- **FR-005**: System MUST allow authenticated users to update the response template of an existing action they own.
- **FR-006**: System MUST allow authenticated users to delete an action they own, provided it is not currently linked to any trigger. If the action is linked, the system MUST reject the deletion with a conflict response and inform the user the action is in use.
- **FR-007**: System MUST expose action management operations through dedicated API endpoints: list all (GET), create (POST), update (PUT), and delete (DELETE).
- **FR-008**: The frontend MUST provide a dedicated Actions management page accessible via a distinct navigation route, separate from the Triggers page.
- **FR-009**: The Actions management page MUST display a list of all user actions. All mutating operations — create, edit, and delete confirmation — MUST be presented in modal dialogs: a "New Action" button opens a create modal, clicking an action's edit control opens an edit modal pre-filled with the action's data, and clicking delete opens a confirmation modal. No inline or page-level forms are used for these operations. This modal-for-all-CRUD pattern is the standard UI convention shared across the Actions, Items, and Triggers management pages.
- **FR-010**: The `ActionsApiService` on the frontend MUST be extended with create, update, and delete operations to match the full backend API surface.
- **FR-011**: Deleting an action MUST require an explicit user confirmation via a modal dialog (with Cancel and Delete buttons) before the request is sent.
- **FR-012**: All action management operations MUST enforce user data isolation — the API MUST apply per-user filtering at the data access layer consistent with the existing global query filter pattern used for Items and Triggers.
- **FR-013**: The existing Items management page MUST be refactored so that create, edit, and delete confirmation operations are presented in modal dialogs. No inline or page-level forms are used for these operations. No backend changes are required.
- **FR-014**: The existing Triggers management page MUST be refactored so that create, edit, and delete confirmation operations are presented in modal dialogs. No inline or page-level forms are used for these operations. No backend changes are required.
- **FR-015**: A reusable modal shell component MUST be created in `src/app/shared/components/` and used by the Actions, Items, and Triggers management pages — no per-feature modal scaffolding duplication.

### Key Entities

- **Action**: A system operation owned by a user. Fields: unique identifier, action type (enum: Query, Add, Update, Remove), response template (string, max 500 characters), created timestamp, updated timestamp. Belongs to a single user.
- **TriggerActionMap**: A many-to-many join entity linking a Trigger to an Action with a sort order. An Action that has one or more TriggerActionMap entries is considered "linked" and cannot be deleted until all entries are removed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can create a new action from the Actions page in under 60 seconds, from opening the form to seeing the action in their list.
- **SC-002**: All four CRUD operations (list, create, edit, delete) are available and functional from the Actions management page without requiring navigation to any other page (except unlinking from Triggers page before deletion).
- **SC-003**: An attempt to delete a linked action is rejected 100% of the time with a user-visible explanation — silent deletion of linked actions never occurs.
- **SC-004**: Actions created by one user are never visible or accessible to a different user's session — verified across 100% of tested scenarios.
- **SC-005**: Validation errors for invalid action type or oversized response template are displayed to the user within 1 second of form submission, without a full page reload.
- **SC-006**: After deleting an action, the action-link-form on the Triggers page no longer lists the deleted action in subsequent requests.
- **SC-007**: All three management pages (Actions, Items, Triggers) use an identical modal interaction pattern — create, edit, and delete confirmation each open a modal; no page uses inline forms or page-level forms for mutating operations.
- **SC-008**: The shared modal shell component is used on all three pages — no duplicated modal scaffolding exists across features.

## Assumptions

- The four permitted action types (Query, Add, Update, Remove) are fixed for this version — no user-defined types.
- Action type is not editable after creation; only the response template can be updated. (Changing action type would alter the semantic meaning of the action and its linked triggers.)
- The Actions management page is a protected route accessible only to authenticated users, consistent with the existing auth guard applied to `/items` and `/triggers`.
- The existing global query filter in `ApplicationDbContext` that enforces per-user data isolation will be extended to cover the `Actions` DbSet — no per-endpoint filtering is needed.
- Deletion conflict response from the backend returns HTTP 409 Conflict with a message the frontend can surface directly to the user.
- The navigation structure (e.g., sidebar or top nav) already exists and adding an "Actions" link is within scope of this feature.
- The existing `ActionsApiService` `getAll()` method will be retained and supplemented with `create()`, `update()`, and `delete()` methods — no breaking changes to existing callers.
- The Actions list loads all user-owned actions in a single GET request — no pagination. Per-user action counts are expected to remain small (< 100), making pagination unnecessary complexity for this version.
- All CRUD operations (create, update, delete) use pessimistic NgRx updates — the store is updated only after the server returns a success response. No optimistic rollback logic is needed.
- Transient operation failures (non-validation errors such as network errors or 500 responses) are surfaced via a toast/snackbar notification — non-blocking, no inline error banners or blocking dialogs for these cases.
- Delete confirmation uses a modal dialog (Cancel / Delete buttons), consistent with the edit modal pattern. The modal may include a warning message when the action is linked to triggers.

## Clarifications

### Session 2026-04-12

- Q: Will the Actions list require pagination or load all actions at once? → A: Load all at once — single GET returns full list, no pagination needed.
- Q: What is the UX pattern for editing an action? → A: Modal dialog — selecting an action opens a modal with the edit form pre-filled.
- Clarification (user-initiated): Modal dialogs are the standard for ALL CRUD operations — create, edit, and delete confirmation — not edit only. This pattern applies uniformly to Actions, Items, and Triggers management pages.
- Scope expansion (user-initiated): Branch scope extended to include frontend-only modal UI refactor for existing Items and Triggers management pages (FR-013, FR-014, FR-015). No backend changes required for Items or Triggers. A shared modal shell component will be extracted to `src/app/shared/components/`.
- Q: Should CRUD operations update the store optimistically or wait for server confirmation? → A: Pessimistic — store updates only after the server confirms success.
- Q: How should transient operation failures (non-validation errors) be surfaced to the user? → A: Toast/snackbar — a brief non-blocking notification for create/update/delete failures.
- Q: What is the UX pattern for the delete confirmation step? → A: Confirmation modal — a dialog with Cancel / Delete buttons before the request is sent.
