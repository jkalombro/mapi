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
  "transcript": "How much is Gatas?"
}
```

**Responses**

| Status | Body | When |
|--------|------|------|
| `200 OK` | `VoiceCommandResult` | Command processed (includes ambiguous and confirmation states) |
| `400 Bad Request` | ProblemDetails | Empty transcript |
| `401 Unauthorized` | ProblemDetails | |

**VoiceCommandResult**
```json
{
  "responseText": "Price of Gatas is 50.00",
  "isAmbiguous": false,
  "isConfirmationRequired": false,
  "matchedNames": []
}
```

Ambiguous example:
```json
{
  "responseText": "Found 2 items named Gatas. Please specify which one.",
  "isAmbiguous": true,
  "isConfirmationRequired": false,
  "matchedNames": ["Gatas (50.00)", "Gatas (75.00)"]
}
```

Duplicate add example:
```json
{
  "responseText": "Gatas already exists with price 50.00. Do you want to update it?",
  "isAmbiguous": false,
  "isConfirmationRequired": true,
  "matchedNames": ["Gatas"]
}
```

---

### POST /api/v1/voice/confirm-add

Confirm a duplicate voice-add to update the existing item's price.

**Request**
```json
{
  "itemName": "Gatas",
  "newPrice": 60.00
}
```

**Responses**

| Status | Body | When |
|--------|------|------|
| `200 OK` | `VoiceCommandResult` | Item updated; `responseText` confirms the update |
| `404 Not Found` | ProblemDetails | Item no longer exists |
| `400 Bad Request` | ProblemDetails | Validation failure |
| `401 Unauthorized` | ProblemDetails | |

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
  "actions": [
    {
      "id": "guid",
      "actionType": "Query",
      "responseTemplate": "The price of {name} is {price}",
      "sortOrder": 0
    }
  ],
  "createdAt": "2026-04-11T00:00:00Z"
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

Create a new trigger.

**Request**
```json
{
  "phrase": "What's the price of"
}
```

| Status | Body | When |
|--------|------|------|
| `201 Created` | `TriggerResponse` | Created |
| `400 Bad Request` | ProblemDetails | |
| `401 Unauthorized` | ProblemDetails | |

---

### PUT /api/v1/triggers/{id}

Update a trigger's phrase.

**Request**
```json
{
  "phrase": "How much does"
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

Delete a trigger and all its TriggerActionMap links.

| Status | Body | When |
|--------|------|------|
| `204 No Content` | — | Deleted |
| `404 Not Found` | ProblemDetails | |
| `401 Unauthorized` | ProblemDetails | |

---

### POST /api/v1/triggers/{triggerId}/actions

Link an existing Action to a Trigger.

**Request**
```json
{
  "actionId": "guid",
  "sortOrder": 0
}
```

| Status | Body | When |
|--------|------|------|
| `201 Created` | `TriggerResponse` | Linked; returns updated trigger |
| `400 Bad Request` | ProblemDetails | Duplicate link |
| `404 Not Found` | ProblemDetails | Trigger or Action not found |
| `401 Unauthorized` | ProblemDetails | |

---

### DELETE /api/v1/triggers/{triggerId}/actions/{actionId}

Unlink an Action from a Trigger.

| Status | Body | When |
|--------|------|------|
| `204 No Content` | — | Unlinked |
| `404 Not Found` | ProblemDetails | |
| `401 Unauthorized` | ProblemDetails | |

---

## Actions

### GET /api/v1/actions

Get all actions for the authenticated user.

| Status | Body | When |
|--------|------|------|
| `200 OK` | `ActionResponse[]` | Success |
| `401 Unauthorized` | ProblemDetails | |

**ActionResponse**
```json
{
  "id": "guid",
  "actionType": "Query",
  "responseTemplate": "The price of {name} is {price}",
  "createdAt": "2026-04-11T00:00:00Z"
}
```

---

### POST /api/v1/actions

Create a new action.

**Request**
```json
{
  "actionType": "Query",
  "responseTemplate": "The price of {name} is {price}"
}
```

| Status | Body | When |
|--------|------|------|
| `201 Created` | `ActionResponse` | Created |
| `400 Bad Request` | ProblemDetails | Invalid `actionType` or empty template |
| `401 Unauthorized` | ProblemDetails | |

---

### PUT /api/v1/actions/{id}

Update an action.

**Request**
```json
{
  "actionType": "Query",
  "responseTemplate": "{name} costs {price} pesos"
}
```

| Status | Body | When |
|--------|------|------|
| `200 OK` | `ActionResponse` | Updated |
| `400 Bad Request` | ProblemDetails | |
| `404 Not Found` | ProblemDetails | |
| `401 Unauthorized` | ProblemDetails | |

---

### DELETE /api/v1/actions/{id}

Delete an action. Will fail if linked to any trigger (restrict delete).

| Status | Body | When |
|--------|------|------|
| `204 No Content` | — | Deleted |
| `409 Conflict` | ProblemDetails | Action is still linked to one or more triggers |
| `404 Not Found` | ProblemDetails | |
| `401 Unauthorized` | ProblemDetails | |
