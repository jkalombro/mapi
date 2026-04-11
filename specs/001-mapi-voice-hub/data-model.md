# Data Model: Mapi – Smart Voice & Storage Hub

**Branch**: `001-mapi-voice-hub` | **Date**: 2026-04-11

---

## Entity Overview

```
User ──┬── Item (many)
       ├── Trigger (many) ──── TriggerActionMap (many) ──── Action (many)
       └── Action (many)
```

All user-owned entities carry a `UserId` foreign key. A global EF Core query filter on `ApplicationDbContext` automatically scopes all queries to the authenticated user's `UserId` (see R-005).

---

## BaseEntity

All entities inherit from `BaseEntity`.

| Field | Type | Constraints |
|-------|------|-------------|
| `Id` | `Guid` | PK, generated on creation (`Guid.NewGuid()`) |
| `CreatedAt` | `DateTime` (UTC) | Set automatically by `ApplicationDbContext.SaveChangesAsync()` |
| `UpdatedAt` | `DateTime` (UTC) | Updated automatically on every save |

---

## User

**Table**: `Users`  
**Purpose**: Registered account. Owns all other entities. Not subject to the global per-user query filter.

| Field | Type | Constraints |
|-------|------|-------------|
| `Id` | `Guid` | PK (from BaseEntity) |
| `Email` | `string` | Required; unique index; max 256 chars |
| `PasswordHash` | `string` | Required; BCrypt hash; never exposed in responses |
| `StoreName` | `string` | Required; max 100 chars |
| `AlexaUserId` | `string?` | Nullable; no unique constraint; max 256 chars; multiple accounts may share the same AlexaUserId |
| `CreatedAt` | `DateTime` | From BaseEntity |
| `UpdatedAt` | `DateTime` | From BaseEntity |

**Validation Rules**:
- `Email` must be a valid email address format.
- `Password` (at registration): min 8 characters (validated in `RegisterCommandValidator`; never stored raw).
- `StoreName` must not be empty or whitespace.
- `AlexaUserId` has no uniqueness constraint — multiple Mapi accounts may share the same `AlexaUserId` to support account recovery scenarios.

**Relationships**:
- One `User` → many `Item`
- One `User` → many `Trigger`
- One `User` → many `Action`

---

## Item

**Table**: `Items`  
**Purpose**: A billingual product tracked by a user. Both name fields are searchable by voice.

| Field | Type | Constraints |
|-------|------|-------------|
| `Id` | `Guid` | PK |
| `UserId` | `Guid` | FK → `Users.Id`; required; global query filter applied |
| `ItemName` | `string` | Required; max 200 chars |
| `BisayaName` | `string` | Required; max 200 chars |
| `Price` | `decimal` | Required; precision (18, 2); must be ≥ 0 |
| `CreatedAt` | `DateTime` | From BaseEntity |
| `UpdatedAt` | `DateTime` | From BaseEntity |

**Validation Rules**:
- `ItemName` and `BisayaName` must not be empty or whitespace.
- `Price` must be a non-negative decimal.
- Duplicate name check: before creating via voice-add, `CommandService` checks for existing items where `ItemName == spokenName` OR `BisayaName == spokenName` (case-insensitive, scoped to user). If found, returns `IsConfirmationRequired = true`.

**Relationships**:
- Many `Item` → one `User`

**Search Behavior**:
- Voice price queries match against `ItemName` OR `BisayaName` (case-insensitive `Contains` or `EF.Functions.Like`).
- If more than one item matches → `IsAmbiguous = true`; system lists matched names.
- If exactly one matches → price returned.
- If none match → "Item not found" response.

---

## Trigger

**Table**: `Triggers`  
**Purpose**: A user-defined voice phrase that activates one or more linked Actions.

| Field | Type | Constraints |
|-------|------|-------------|
| `Id` | `Guid` | PK |
| `UserId` | `Guid` | FK → `Users.Id`; required; global query filter applied |
| `Phrase` | `string` | Required; max 500 chars |
| `CreatedAt` | `DateTime` | From BaseEntity |
| `UpdatedAt` | `DateTime` | From BaseEntity |

**Validation Rules**:
- `Phrase` must not be empty or whitespace.
- No uniqueness constraint on `Phrase` per user (multiple triggers with the same phrase execute all linked actions).

**Relationships**:
- Many `Trigger` → one `User`
- One `Trigger` → many `TriggerActionMap` (cascades delete)

---

## Action

**Table**: `Actions`  
**Purpose**: A named system operation with a configurable spoken response template. Belongs to a user.

| Field | Type | Constraints |
|-------|------|-------------|
| `Id` | `Guid` | PK |
| `UserId` | `Guid` | FK → `Users.Id`; required; global query filter applied |
| `ActionType` | `ActionType` (enum) | Required; stored as `int` |
| `ResponseTemplate` | `string` | Required; max 1000 chars |
| `CreatedAt` | `DateTime` | From BaseEntity |
| `UpdatedAt` | `DateTime` | From BaseEntity |

**ActionType Enum**:

| Value | Int | Meaning |
|-------|-----|---------|
| `Query` | 0 | Look up an item's price |
| `Add` | 1 | Add a new item |
| `Update` | 2 | Update an existing item |
| `Remove` | 3 | Delete an item |

**Validation Rules**:
- `ActionType` must be one of the four defined enum values.
- `ResponseTemplate` must not be empty or whitespace. May contain `{name}` and `{price}` placeholders resolved at runtime.

**Relationships**:
- Many `Action` → one `User`
- One `Action` → many `TriggerActionMap`

---

## TriggerActionMap

**Table**: `TriggerActionMaps`  
**Purpose**: Many-to-many join between `Trigger` and `Action`. Includes execution order.

| Field | Type | Constraints |
|-------|------|-------------|
| `Id` | `Guid` | PK |
| `TriggerId` | `Guid` | FK → `Triggers.Id`; required; cascade delete |
| `ActionId` | `Guid` | FK → `Actions.Id`; required; restrict delete |
| `SortOrder` | `int` | Required; default 0; ascending execution order |
| `CreatedAt` | `DateTime` | From BaseEntity |
| `UpdatedAt` | `DateTime` | From BaseEntity |

**Validation Rules**:
- The combination (`TriggerId`, `ActionId`) must be unique — no duplicate links.
- `SortOrder` must be ≥ 0.

**Relationships**:
- Many `TriggerActionMap` → one `Trigger`
- Many `TriggerActionMap` → one `Action`

---

## State Transitions

### Item Lifecycle

```
[Not Exists]
     │  CreateItemCommand (manual form or voice-add confirmed)
     ▼
  [Active]
     │  UpdateItemCommand (manual edit or voice-add duplicate confirmed)
     ▼
  [Active]
     │  DeleteItemCommand
     ▼
[Deleted (hard delete — no soft delete for items)]
```

### Voice Command Flow

```
User speaks
     │
     ▼
SpeechRecognitionService (browser) → transcript
     │
     ▼
POST /api/v1/voice/command { transcript }
     │
     ▼
ProcessVoiceCommand (MediatR handler)
     │
     ▼
ICommandService.ExecuteAsync(transcript, userId)
     ├─ Trigger match? → Execute linked Actions in SortOrder
     ├─ Built-in Query match? → Search Items by name
     │     ├─ 0 results → "Item not found"
     │     ├─ 1 result → "Price of {name} is {price}"
     │     └─ N results → IsAmbiguous = true → "Found N items named X..."
     ├─ Built-in Add match? → Check for existing item
     │     ├─ Not exists → CreateItemCommand
     │     └─ Exists → IsConfirmationRequired = true → confirmation prompt
     └─ No match → "I didn't understand that command"
     │
     ▼
VoiceCommandResult { ResponseText, IsAmbiguous, IsConfirmationRequired, MatchedNames? }
     │
     ▼
SpeechSynthesisService.speak(ResponseText)
```

---

## EF Core Configuration Notes

- All entity configurations live in `Mapi.Infrastructure/Persistence/Configurations/` as `IEntityTypeConfiguration<T>` classes.
- No Data Annotations on entity classes.
- `ApplicationDbContext` applies global query filter: `modelBuilder.Entity<Item>().HasQueryFilter(e => e.UserId == _currentUserId)` — same for `Trigger`, `Action`, `TriggerActionMap`.
- `Price` configured with `.HasPrecision(18, 2)`.
- `ActionType` stored as `int` (`.HasConversion<int>()`).
- Unique index on `User.Email` only. No unique index on `User.AlexaUserId` — multiple accounts may share the same value.
- Unique composite index on `TriggerActionMap(TriggerId, ActionId)`.
