# API Contract: Actions & Triggers Endpoints

**Feature**: `002-action-crud` | **Revised**: 2026-04-12

---

## Actions Endpoints

**Base path**: `/api/v1/actions`  
**Auth**: JWT Bearer required

### GET /api/v1/actions

Returns all 4 seeded actions. No user filtering — actions are global.

**Request**: None

**Response 200 OK**:
```json
[
  {
    "id": "00000000-0000-0000-0000-000000000001",
    "actionType": "Query",
    "responseTemplate": "The {item} is {value}.",
    "createdAt": "2026-04-12T00:00:00Z",
    "updatedAt": "2026-04-12T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000002",
    "actionType": "Add",
    "responseTemplate": "I've added {item}.",
    "createdAt": "2026-04-12T00:00:00Z",
    "updatedAt": "2026-04-12T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000003",
    "actionType": "Update",
    "responseTemplate": "I've updated {item} to {value}.",
    "createdAt": "2026-04-12T00:00:00Z",
    "updatedAt": "2026-04-12T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000004",
    "actionType": "Remove",
    "responseTemplate": "I've removed {item}.",
    "createdAt": "2026-04-12T00:00:00Z",
    "updatedAt": "2026-04-12T00:00:00Z"
  }
]
```

**No POST, PUT, or DELETE endpoints for actions.**

---

## Triggers Endpoints

**Base path**: `/api/v1/triggers`  
**Auth**: JWT Bearer required

### GET /api/v1/triggers

Returns all triggers for the authenticated user.

**Response 200 OK**:
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "phrase": "how much is",
    "actionId": "00000000-0000-0000-0000-000000000001",
    "actionType": "Query",
    "createdAt": "2026-04-12T10:00:00Z",
    "updatedAt": "2026-04-12T10:00:00Z"
  }
]
```

### GET /api/v1/triggers/{id}

Returns a single trigger by ID (must belong to the authenticated user).

**Response 200 OK**: Single `TriggerResponse` (same shape as above)  
**Response 404 Not Found**: Trigger not found or not owned by user

### POST /api/v1/triggers

Creates a new trigger. `ActionId` is required.

**Request body**:
```json
{
  "phrase": "how much is",
  "actionId": "00000000-0000-0000-0000-000000000001"
}
```

| Field | Type | Constraints |
|-------|------|-------------|
| `phrase` | string | Required; 2–200 characters |
| `actionId` | Guid | Required; must be a valid seeded action ID |

**Response 201 Created**:
- `Location` header: `/api/v1/triggers/{newId}`
- Body: `TriggerResponse`

**Response 400 Bad Request** (validation failure):
```json
{
  "type": "https://tools.ietf.org/html/rfc7807",
  "title": "Validation Failed",
  "status": 400,
  "errors": {
    "ActionId": ["Action is required."]
  }
}
```

### PUT /api/v1/triggers/{id}

Updates a trigger's phrase and/or action.

**Path params**: `id` (GUID)

**Request body**:
```json
{
  "phrase": "what is the price of",
  "actionId": "00000000-0000-0000-0000-000000000002"
}
```

**Response 200 OK**: Updated `TriggerResponse`  
**Response 400 Bad Request**: Validation failure  
**Response 404 Not Found**: Trigger not found

### DELETE /api/v1/triggers/{id}

Deletes a trigger.

**Response 204 No Content**: Deleted  
**Response 404 Not Found**: Trigger not found

---

## Removed Endpoints

The following endpoints from the original design are **removed**:

| Endpoint | Reason |
|----------|--------|
| `POST /api/v1/actions` | Actions are seeded — no user creation |
| `PUT /api/v1/actions/{id}` | Actions are immutable |
| `DELETE /api/v1/actions/{id}` | Actions cannot be deleted |
| `GET /api/v1/actions/{id}` | Not needed |
| `POST /api/v1/triggers/{triggerId}/actions` | TriggerActionMap removed |
| `DELETE /api/v1/triggers/{triggerId}/actions/{actionId}` | TriggerActionMap removed |
