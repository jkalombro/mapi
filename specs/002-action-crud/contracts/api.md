# API Contract: Actions Endpoints

**Feature**: `002-action-crud` | **Date**: 2026-04-12  
**Base path**: `/api/v1/actions`  
**Auth**: All endpoints require JWT Bearer (`RequireAuthorization()`)

---

## GET /api/v1/actions

Returns all actions owned by the authenticated user.

**Request**: None (user identity from JWT)

**Response 200 OK**:
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "actionType": "Query",
    "responseTemplate": "{name} costs {price}.",
    "createdAt": "2026-04-12T10:00:00Z",
    "updatedAt": "2026-04-12T10:00:00Z"
  }
]
```

**Empty list**: Returns `[]` (200 OK) — not 404.

---

## GET /api/v1/actions/{id}

Returns a single action by ID (must be owned by the authenticated user).

**Path params**: `id` (GUID)

**Response 200 OK**: Single `ActionResponse` object (same shape as above)

**Response 404 Not Found**:
```json
{
  "type": "https://tools.ietf.org/html/rfc7807",
  "title": "Not Found",
  "status": 404,
  "detail": "Action '{id}' was not found."
}
```

---

## POST /api/v1/actions

Creates a new action for the authenticated user.

**Request body**:
```json
{
  "actionType": "Query",
  "responseTemplate": "{name} costs {price}."
}
```

| Field | Type | Constraints |
|-------|------|-------------|
| `actionType` | string (enum) | Required; one of: `"Query"`, `"Add"`, `"Update"`, `"Remove"` |
| `responseTemplate` | string | Required; 1–500 characters |

**Response 201 Created**:
- `Location` header: `/api/v1/actions/{newId}`
- Body: `ActionResponse` object

**Response 400 Bad Request** (validation failure):
```json
{
  "type": "https://tools.ietf.org/html/rfc7807",
  "title": "Validation Failed",
  "status": 400,
  "errors": {
    "ResponseTemplate": ["Response template is required."]
  }
}
```

---

## PUT /api/v1/actions/{id}

Updates the response template of an existing action. **ActionType is not accepted — it is immutable after creation.**

**Path params**: `id` (GUID)

**Request body**:
```json
{
  "responseTemplate": "Updated response text here."
}
```

| Field | Type | Constraints |
|-------|------|-------------|
| `responseTemplate` | string | Required; 1–500 characters |

**Response 200 OK**: Updated `ActionResponse` object

**Response 400 Bad Request**: Validation failure (same structure as POST)

**Response 404 Not Found**: Action not found

---

## DELETE /api/v1/actions/{id}

Deletes an action. Fails with 409 if the action is linked to any trigger.

**Path params**: `id` (GUID)

**Response 204 No Content**: Action deleted successfully

**Response 404 Not Found**: Action not found

**Response 409 Conflict** (action is linked to one or more triggers):
```json
{
  "type": "https://tools.ietf.org/html/rfc7807",
  "title": "Conflict",
  "status": 409,
  "detail": "Action '{id}' is linked to one or more triggers and cannot be deleted."
}
```

---

## ActionType Enum Values

The API accepts and returns these string values (case-sensitive):

| Value | Description |
|-------|-------------|
| `"Query"` | Returns information about an item |
| `"Add"` | Adds an item to inventory |
| `"Update"` | Updates an existing item |
| `"Remove"` | Removes an item from inventory |

---

## Notes

- Per-user data isolation is enforced at the repository layer (`GetAllByUserAsync` filters by `UserId`). No other user can read, update, or delete another user's actions.
- The `UpdateAction` endpoint intentionally omits `actionType` from the request body. Sending `actionType` in the PUT body will not fail (extra fields are ignored by the binder), but the value will not be applied.
- Duplicate actions (same `actionType` + same `responseTemplate`) are permitted — uniqueness is not enforced.
