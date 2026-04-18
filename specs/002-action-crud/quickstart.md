# Quickstart: Action CRUD Management & Modal UI Standardisation

**Feature**: `002-action-crud` | **Date**: 2026-04-12  
**Branch**: `002-action-crud`

---

## Prerequisites

- .NET 9 SDK installed
- Node.js 20+ and npm installed
- SQL Server LocalDB (for integration tests)
- Repo cloned, branch `002-action-crud` checked out

---

## Running the Backend

```bash
cd API/src/Mapi.API
dotnet run
# API available at https://localhost:5001
# Swagger UI at https://localhost:5001/swagger
```

### Running Backend Tests

```bash
# Unit tests
cd API/tests/Mapi.Application.Tests
dotnet test

# Integration tests (requires LocalDB)
cd API/tests/Mapi.API.IntegrationTests
dotnet test
```

---

## Running the Frontend

```bash
cd UI
npm install
npm start
# Angular dev server at http://localhost:4200
```

### Running Frontend Tests

```bash
cd UI
npm test                    # run all tests once
npm run test:watch          # watch mode
npm run test:coverage       # with coverage report
```

---

## Testing the Actions Feature Manually

1. **Register / Login**: Navigate to `http://localhost:4200`, create an account and log in.
2. **Navigate to Actions**: Click "Actions" in the top navigation.
3. **Create an action**:
   - Click "New Action"
   - In the modal, select an Action Type (e.g. "Query") and enter a Response Template (e.g. `{name} costs {price}.`)
   - Click "Save" — the action appears in the list
4. **Edit an action**:
   - Click the edit button on any action
   - Note: Action Type is disabled — only Response Template is editable
   - Update the template and click "Save"
5. **Delete an unlinked action**:
   - Click the delete button on an action
   - Confirm in the dialog — action is removed
6. **Delete a linked action** (expected to fail):
   - Link the action to a trigger via the Triggers page
   - Try to delete the action — expect a 409 error message shown as a toast

---

## Testing the Modal Refactor

### Items Page

1. Navigate to `/items`
2. Click "New Item" — a modal dialog should open with the create form
3. Fill in fields and save — modal closes, item appears in list
4. Click edit on any item — modal opens pre-filled
5. Click delete on any item — confirmation dialog appears

### Triggers Page

1. Navigate to `/triggers`
2. Click "New Trigger" — modal opens with create form
3. Save — modal closes, trigger appears in list
4. Click edit on any trigger — modal opens pre-filled with phrase
5. Click delete — confirmation dialog appears

---

## Key File Locations

| What | Where |
|------|-------|
| Action CRUD backend fix (UpdateActionCommand) | `API/src/Mapi.Application/Actions/Commands/ActionCommands.cs` |
| UpdateActionRequest DTO | `API/src/Mapi.Application/Actions/DTOs/ActionDTOs.cs` |
| Actions endpoints | `API/src/Mapi.API/Endpoints/ActionsEndpoints.cs` |
| Action query tests | `API/tests/Mapi.Application.Tests/Actions/ActionQueryHandlerTests.cs` |
| Action validator tests | `API/tests/Mapi.Application.Tests/Actions/ActionValidatorTests.cs` |
| Actions integration feature | `API/tests/Mapi.API.IntegrationTests/Features/Actions.feature` |
| Actions step definitions | `API/tests/Mapi.API.IntegrationTests/StepDefinitions/ActionsStepDefinitions.cs` |
| Shared modal shell | `UI/src/app/shared/components/modal/modal.component.ts` |
| ActionsApiService (extended) | `UI/src/app/shared/services/actions-api.service.ts` |
| Actions feature page | `UI/src/app/actions/actions.component.ts` |
| Actions NgRx store | `UI/src/app/actions/store/` |
| Items component (modal refactor) | `UI/src/app/items/items.component.ts` |
| Triggers component (modal refactor + edit) | `UI/src/app/triggers/triggers.component.ts` |
| Navigation | `UI/src/app/app.component.html` |

---

## Constitution Compliance Summary

| Rule | Status |
|------|--------|
| Clean Architecture (Backend) | ✅ All layers correct |
| MediatR dispatch only from endpoints | ✅ No direct service calls |
| FluentValidation (no Data Annotations) | ✅ |
| TypedResults in all endpoints | ✅ |
| Standalone OnPush components (Frontend) | ✅ |
| NgRx Classic (Actions/Reducers/Effects) | ✅ |
| Signals in components (`input()`, `output()`, `signal()`, `toSignal()`) | ✅ |
| `@if`/`@for` template syntax | ✅ |
| Reactive Forms only | ✅ |
| TDD (tests written before implementation) | ✅ |
| 100% Jest coverage threshold | ✅ (must verify after implementation) |
| SCSS only (no inline styles) | ✅ |
| Shared modal shell (FR-015) | ✅ `src/app/shared/components/modal/` |
| ActionType immutable after creation | ✅ Fixed in UpdateActionCommand |
