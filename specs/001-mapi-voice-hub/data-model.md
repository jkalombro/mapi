# Data Model: Mapi – Smart Voice & Storage Hub

**Branch**: `001-mapi-voice-hub` | **Date**: 2026-04-11

---

## Entity Overview

```
User ──┬── Item (many)
       └── Trigger (many) ──── Action (one, seeded global)

Action (4 globally seeded, no UserId)
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
- Duplicate name check: before creating via voice-add, `CommandService` checks for existing items where `ItemName == spokenName` OR `BisayaName == spokenName` (case-insensitive, scoped to user). If found, returns `pendingIntent = "ConfirmUpdate"` — client must send a follow-up "yes"/"no" transcript to confirm or cancel.

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
| `ActionId` | `Guid` | FK → `Actions.Id`; required; references one of the 4 seeded actions |
| `CreatedAt` | `DateTime` | From BaseEntity |
| `UpdatedAt` | `DateTime` | From BaseEntity |

**Validation Rules**:
- `Phrase` must not be empty or whitespace.
- `ActionId` must reference a valid seeded action ID.
- No uniqueness constraint on `Phrase` per user.

**Relationships**:
- Many `Trigger` → one `User`
- Many `Trigger` → one `Action` (direct FK; no TriggerActionMap join table)

---

## Action

**Table**: `Actions`  
**Purpose**: A globally seeded system operation. There are exactly 4 actions (Query, Add, Update, Remove) shared across all users — not user-owned. Actions cannot be created, edited, or deleted via the API.

| Field | Type | Constraints |
|-------|------|-------------|
| `Id` | `Guid` | PK; fixed seeded values |
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
- One `Action` → many `Trigger` (triggers reference the seeded action via `ActionId`)

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

All turns go to the same `POST /api/v1/voice/command` endpoint. The client passes `pendingIntent` and `pendingItemName` back on follow-up turns.

```
User speaks
     │
     ▼
SpeechRecognitionService (browser) → transcript
     │
     ▼
POST /api/v1/voice/command { transcript, pendingIntent?, pendingItemName? }
     │
     ▼
ProcessVoiceCommand (MediatR handler)
     │
     ▼
ICommandService.ExecuteAsync(transcript, userId, pendingIntent?, pendingItemName?)
     │
     ├─ pendingIntent == "Add"           → parse price → CreateItemCommand
     ├─ pendingIntent == "Update"        → parse price → UpdateItemCommand
     ├─ pendingIntent == "ConfirmUpdate" → "yes" → pendingIntent="Update"
     │                                    "no"  → "Add command has been cancelled."
     │                                    other → "Yes or no only. Please start over."
     │
     ├─ Trigger phrase match? → Execute linked Action (via ActionId)
     ├─ Built-in Query match? → Search Items by name
     │     ├─ 0 results → "I couldn't find that item."
     │     └─ 1 result  → "Rice costs 50 pesos."
     ├─ Built-in Add match?   → Check for existing item
     │     ├─ Not exists → pendingIntent="Add"   → "What is the price of {name}?"
     │     └─ Exists    → pendingIntent="ConfirmUpdate" → "{name} already exists..."
     ├─ Built-in Update match? → Check for existing item
     │     ├─ Found     → pendingIntent="Update" → "What is the new price of {name}?"
     │     └─ Not found → "I couldn't find that item."
     └─ No match → "Sorry, I didn't understand that."
     │
     ▼
VoiceCommandResult { responseText, pendingIntent?, pendingItemName?, itemsModified }
     │
     ▼
SpeechSynthesisService.speak(responseText)
     │
     ▼
If pendingIntent in ["Add", "Update", "ConfirmUpdate"] → mic auto-activates
```

---

## EF Core Configuration Notes

- All entity configurations live in `Mapi.Infrastructure/Persistence/Configurations/` as `IEntityTypeConfiguration<T>` classes.
- No Data Annotations on entity classes.
- `ApplicationDbContext` applies global query filter: `modelBuilder.Entity<Item>().HasQueryFilter(e => e.UserId == _currentUserId)` — same for `Trigger`. `Action` has no per-user filter (global seeded data).
- `Price` configured with `.HasPrecision(18, 2)`.
- `ActionType` stored as `int` (`.HasConversion<int>()`).
- Unique index on `User.Email` only. No unique index on `User.AlexaUserId` — multiple accounts may share the same value.
- `Trigger.ActionId` FK → `Actions.Id` with restrict delete (seeded actions cannot be deleted).
