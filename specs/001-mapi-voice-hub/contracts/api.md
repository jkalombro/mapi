# REST API Contract: Mapi – Smart Voice & Storage Hub

**Branch**: `001-mapi-voice-hub` | **Date**: 2026-04-11  
**Base URL**: `/api/v1`  
**Auth**: JWT Bearer — all endpoints except `/auth/register` and `/auth/login` require `Authorization: Bearer <token>`.  
**Errors**: All error responses follow RFC 7807 `ProblemDetails` format.

---

## Authentication

### POST /api/v1/auth/register

Register a new user account.

**Request**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "storeName": "My Store"
}
```

**Responses**

| Status | Body | When |
|--------|------|------|
| `201 Created` | `{ "token": "...", "email": "...", "storeName": "..." }` | Registration successful |
| `400 Bad Request` | ProblemDetails (validation errors) | Invalid email, weak password, missing storeName |
| `409 Conflict` | ProblemDetails | Email already registered |

---

### POST /api/v1/auth/login

Authenticate and receive a JWT.

**Request**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Responses**

| Status | Body | When |
|--------|------|------|
| `200 OK` | `{ "token": "...", "email": "...", "storeName": "..." }` | Login successful |
| `400 Bad Request` | ProblemDetails | Missing fields |
| `401 Unauthorized` | ProblemDetails | Invalid email or password |

---

## Items

All item endpoints are scoped to the authenticated user's data.

### GET /api/v1/items

Retrieve all items for the authenticated user.

**Responses**

| Status | Body | When |
|--------|------|------|
| `200 OK` | `ItemResponse[]` | Success (empty array if no items) |
| `401 Unauthorized` | ProblemDetails | No or invalid JWT |

**ItemResponse**
```json
{
  "id": "guid",
  "itemName": "Milk",
  "bisayaName": "Gatas",
  "price": 50.00,
  "createdAt": "2026-04-11T00:00:00Z",
  "updatedAt": "2026-04-11T00:00:00Z"
}
```

---

### GET /api/v1/items/{id}

Retrieve a single item by ID.

**Responses**

| Status | Body | When |
|--------|------|------|
| `200 OK` | `ItemResponse` | Found |
| `404 Not Found` | ProblemDetails | Item not found or belongs to another user |
| `401 Unauthorized` | ProblemDetails | |

---

### POST /api/v1/items

Create a new item.

**Request**
```json
{
  "itemName": "Milk",
  "bisayaName": "Gatas",
  "price": 50.00
}
```

**Responses**

| Status | Body | When |
|--------|------|------|
| `201 Created` | `ItemResponse` | Created; `Location` header set to `/api/v1/items/{id}` |
| `400 Bad Request` | ProblemDetails | Validation failure |
| `401 Unauthorized` | ProblemDetails | |

---

### PUT /api/v1/items/{id}

Replace all fields of an item.

**Request**
```json
{
  "itemName": "Milk",
  "bisayaName": "Gatas",
  "price": 55.00
}
```

**Responses**

| Status | Body | When |
|--------|------|------|
| `200 OK` | `ItemResponse` | Updated |
| `400 Bad Request` | ProblemDetails | Validation failure |
| `404 Not Found` | ProblemDetails | |
| `401 Unauthorized` | ProblemDetails | |

---

### DELETE /api/v1/items/{id}

Permanently delete an item.

**Responses**

| Status | Body | When |
|--------|------|------|
| `204 No Content` | — | Deleted |
| `404 Not Found` | ProblemDetails | |
| `401 Unauthorized` | ProblemDetails | |

---

## Voice

### POST /api/v1/voice/command

Submit a voice transcript for processing.

**Request**
```json
{
  "transcript": "How much is Gatas?",
  "pendingIntent": null,
  "pendingItemName": null
}
```

`pendingIntent` and `pendingItemName` are optional — pass values from the previous `VoiceCommandResult` when continuing a multi-turn voice flow.

**Responses**

| Status | Body | When |
|--------|------|------|
| `200 OK` | `VoiceCommandResult` | Command processed |
| `400 Bad Request` | ProblemDetails | Empty transcript |
| `401 Unauthorized` | ProblemDetails | |

**VoiceCommandResult**

Single-turn query (no pending state):
```json
{
  "responseText": "Rice costs 50 pesos.",
  "pendingIntent": null,
  "pendingItemName": null,
  "itemsModified": false
}
```

Add step 1 — item not found, waiting for price:
```json
{
  "responseText": "What is the price of rice?",
  "pendingIntent": "Add",
  "pendingItemName": "rice",
  "itemsModified": false
}
```

Add — item already exists, waiting for yes/no confirmation:
```json
{
  "responseText": "Rice already exists at 50 pesos. Do you want to update it?",
  "pendingIntent": "ConfirmUpdate",
  "pendingItemName": "rice",
  "itemsModified": false
}
```

Completed mutating command:
```json
{
  "responseText": "Got it. Rice has been added at 50 pesos.",
  "pendingIntent": null,
  "pendingItemName": null,
  "itemsModified": true
}
```

**PendingIntent values**

| Value | Meaning | Auto-listen? |
|-------|---------|-------------|
| `"Add"` | Item not found; waiting for price | Yes |
| `"Update"` | Item found; waiting for new price | Yes |
| `"ConfirmUpdate"` | Item exists on Add; waiting for "yes"/"no" | Yes |
| `null` | No pending state — command completed | No |

---

## Triggers

### GET /api/v1/triggers

Get all triggers for the authenticated user (includes linked actions).

**Responses**

| Status | Body | When |
|--------|------|------|
| `200 OK` | `TriggerResponse[]` | Success |
| `401 Unauthorized` | ProblemDetails | |

**TriggerResponse**
```json
{
  "id": "guid",
  "phrase": "What's the price of",
  "actionId": "00000000-0000-0000-0000-000000000001",
  "actionType": "Query",
  "createdAt": "2026-04-11T00:00:00Z",
  "updatedAt": "2026-04-11T00:00:00Z"
}
```

---

### GET /api/v1/triggers/{id}

Get a single trigger with linked actions.

| Status | Body | When |
|--------|------|------|
| `200 OK` | `TriggerResponse` | Found |
| `404 Not Found` | ProblemDetails | |
| `401 Unauthorized` | ProblemDetails | |

---

### POST /api/v1/triggers

Create a new trigger. `actionId` must be one of the 4 seeded action IDs.

**Request**
```json
{
  "phrase": "What's the price of",
  "actionId": "00000000-0000-0000-0000-000000000001"
}
```

| Status | Body | When |
|--------|------|------|
| `201 Created` | `TriggerResponse` | Created; `Location` header set to `/api/v1/triggers/{id}` |
| `400 Bad Request` | ProblemDetails | Validation failure or invalid actionId |
| `401 Unauthorized` | ProblemDetails | |

---

### PUT /api/v1/triggers/{id}

Update a trigger's phrase and/or linked action.

**Request**
```json
{
  "phrase": "How much does",
  "actionId": "00000000-0000-0000-0000-000000000001"
}
```

| Status | Body | When |
|--------|------|------|
| `200 OK` | `TriggerResponse` | Updated |
| `400 Bad Request` | ProblemDetails | |
| `404 Not Found` | ProblemDetails | |
| `401 Unauthorized` | ProblemDetails | |

---

### DELETE /api/v1/triggers/{id}

Delete a trigger.

| Status | Body | When |
|--------|------|------|
| `204 No Content` | — | Deleted |
| `404 Not Found` | ProblemDetails | |
| `401 Unauthorized` | ProblemDetails | |

---

## Actions

Actions are **globally seeded** — there are exactly 4 actions (Query, Add, Update, Remove) shared across all users. They cannot be created, modified, or deleted via the API.

### GET /api/v1/actions

Returns all 4 seeded actions. No user filtering.

| Status | Body | When |
|--------|------|------|
| `200 OK` | `ActionResponse[]` | Success |
| `401 Unauthorized` | ProblemDetails | |

**ActionResponse**
```json
{
  "id": "00000000-0000-0000-0000-000000000001",
  "actionType": "Query",
  "responseTemplate": "The {item} is {value}.",
  "createdAt": "2026-04-12T00:00:00Z",
  "updatedAt": "2026-04-12T00:00:00Z"
}
```

**Seeded action IDs**

| ID | ActionType |
|----|-----------|
| `00000000-0000-0000-0000-000000000001` | Query |
| `00000000-0000-0000-0000-000000000002` | Add |
| `00000000-0000-0000-0000-000000000003` | Update |
| `00000000-0000-0000-0000-000000000004` | Remove |

---

## Removed Endpoints

The following endpoints from the original design have been removed:

| Endpoint | Reason |
|----------|--------|
| `POST /api/v1/voice/confirm-add` | Replaced by multi-turn `pendingIntent` flow on `POST /api/v1/voice/command` |
| `POST /api/v1/actions` | Actions are seeded — no user creation |
| `PUT /api/v1/actions/{id}` | Actions are immutable |
| `DELETE /api/v1/actions/{id}` | Actions cannot be deleted |
| `POST /api/v1/triggers/{triggerId}/actions` | TriggerActionMap removed; trigger holds a direct `actionId` |
| `DELETE /api/v1/triggers/{triggerId}/actions/{actionId}` | TriggerActionMap removed |
