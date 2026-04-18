# Command Service Bug Fix — Delete via Trigger

## Context

The app is a voice-commanded store price tracker. Users speak phrases that are matched against **triggers** (user-defined phrases linked to an **action**). The action defines what happens (Query, Add, Update, Remove) and a `ResponseTemplate` that gets spoken back via text-to-speech.

The flow is:
1. User speaks → `SpeechRecognitionService` → transcript sent to `POST /api/v1/voice/command`
2. Backend: `ProcessVoiceCommand` → `ICommandService.ExecuteAsync`
3. If a trigger phrase matches, `ExecuteActionAsync` is called with the matched `Action` and the suffix (words after the trigger phrase)
4. Result `responseText` is spoken back via `SpeechSynthesisService`

---

## The Three Bugs Identified

All three bugs live in `CommandService.ExecuteAsync` inside `ExecuteActionAsync`. The root cause is that `ExecuteActionAsync` was a **one-size-fits-all method that never checked `action.ActionType`** — it only implemented Query behaviour.

### Bug 1: Add command — "I couldn't find the item"
- Trigger phrase fires, suffix (e.g. `"banana 20"`) is passed to `FindByNameAsync`
- The item doesn't exist yet (it's new), so `items.Count == 0` → returns `RESPONSE_ITEM_NOT_FOUND`
- **Not fixed in this session** — user has separate plans for this

### Bug 2: Edit/Update command — "I couldn't find the item"
- Suffix `"banana 20"` (name + new price together) is searched as a single item name
- No item has the name `"banana 20"` → returns `RESPONSE_ITEM_NOT_FOUND`
- **Not fixed in this session** — user has separate plans for this

### Bug 3: Delete command — says it removed, but item still exists
- `FindByNameAsync` succeeds (item found)
- The code returned the `ResponseTemplate` (e.g. `"I've removed {item}."`) immediately
- `DeleteAsync` was **never called** — only a read happened, not a mutation
- **Fixed in this session**

---

## The Fix

**File:** `API/src/Mapi.Infrastructure/Services/CommandService.cs`

Added an `ActionType.Remove` check inside `ExecuteActionAsync` that calls `DeleteAsync` before returning the response template:

```csharp
// Before fix — only read, never deleted:
var item = items[0];
return action.ResponseTemplate
    .Replace("{item}", item.ItemName)
    .Replace("{value}", FormatPrice(item.Price));

// After fix — deletes when action type is Remove:
var item = items[0];

if (action.ActionType == ActionType.Remove)
{
    await _itemRepository.DeleteAsync(item, cancellationToken);
}

return action.ResponseTemplate
    .Replace("{item}", item.ItemName)
    .Replace("{value}", FormatPrice(item.Price));
```

Also added `using Mapi.Domain.Enums;` to the file's imports.

---

## Tests Written

### Unit Tests
**File:** `API/tests/Mapi.Application.Tests/Voice/CommandServiceTriggerTests.cs`

Two new tests added to the existing `CommandServiceTriggerTests` class:

1. `ExecuteAsync_WhenTriggerWithRemoveActionMatchesItem_CallsDeleteAndReturnsTemplate`
   - Verifies `DeleteAsync` is called exactly once on the matched item
   - Verifies the response contains the item name (template is rendered)

2. `ExecuteAsync_WhenTriggerWithRemoveActionButItemNotFound_DoesNotDeleteAndReturnsNotFound`
   - Verifies `DeleteAsync` is never called when item doesn't exist
   - Verifies the "couldn't find" message is returned

### Integration Tests (Reqnroll / Gherkin)
**Feature file:** `API/tests/Mapi.API.IntegrationTests/Features/Voice.feature`

Two new scenarios added:

1. `Remove trigger deletes the matched item`
   - Sets up a Remove-action trigger with phrase `"remove"`
   - Sends voice command `"remove Milk"`
   - Asserts voice response contains `"Milk"`
   - GETs `/api/v1/items` and asserts `"Milk"` is no longer in the list

2. `Remove trigger with unknown item returns not found`
   - Sets up a Remove-action trigger
   - Sends voice command `"remove Unknown"`
   - Asserts voice response contains `"couldn't find"`

**Step definition added:** `API/tests/Mapi.API.IntegrationTests/StepDefinitions/TriggersStepDefinitions.cs`

```csharp
[Given(@"I have a trigger with phrase ""(.*)"" and the Remove action")]
public async Task GivenIHaveATriggerWithRemoveAction(string phrase)
{
    await CreateTriggerAsync(phrase, REMOVE_ACTION_ID);
}
```

---

## Key Reference Points

| Concern | File |
|---|---|
| Bug location | `API/src/Mapi.Infrastructure/Services/CommandService.cs` — `ExecuteActionAsync` |
| Action type enum | `API/src/Mapi.Domain/Enums/ActionType.cs` — `Query`, `Add`, `Update`, `Remove` |
| Seeded action IDs | `API/src/Mapi.Infrastructure/Persistence/Configurations/ActionConfiguration.cs` |
| Remove action template | `"I've removed {item}."` (GUID `00000000-0000-0000-0000-000000000004`) |
| Trigger → Action relationship | `Trigger.ActionId` FK → `Action.Id`; `Trigger.Action` navigation property |
| Repository | `GenericRepository<T>` — `DeleteAsync` calls `_dbSet.Remove` + `SaveChangesAsync` |
| Item lookup | `IItemRepository.FindByNameAsync(name, userId)` — matches on `ItemName` or `BisayaName`, case-insensitive |

---

## What Still Needs Fixing (Not Done Here)

- **Add via trigger** (`ActionType.Add`): needs to parse name + price from suffix, create item, return template
- **Update via trigger** (`ActionType.Update`): needs to split suffix into name + new price, find item by name only, update price, return template

Both of these require changes to `ExecuteActionAsync` with new logic branches, similar to how the Remove fix was done. The user indicated they have separate plans for these two.
