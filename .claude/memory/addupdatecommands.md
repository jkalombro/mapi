# Two-Step Add/Update Voice Command Flow

## What was built

Replaced the single-command voice add pattern (`"add rice price 50"`) and the non-functional trigger-based Add/Update (which only returned template text without mutating DB) with a proper two-step conversational flow.

**Why:** Triggers with ActionType.Add and ActionType.Update were not actually adding/updating items — they just returned a template response. The old `"add <name> price <price>"` regex also existed outside the trigger system entirely.

---

## New Flow

### Add (item not found) — 2 turns
1. User says trigger phrase + item name, e.g. `"add rice"`
2. Backend: `{ responseText: "What is the price of rice?", pendingIntent: "Add", pendingItemName: "rice" }`
3. Client stores pending state, user says `"50"`
4. Client sends `{ transcript: "50", pendingIntent: "Add", pendingItemName: "rice" }` to same `/command` endpoint
5. Backend adds item → `{ responseText: "Got it. Rice has been added at 50 pesos.", itemsModified: true }`

### Add (item exists) — 3 turns (confirm first)
1. `"add rice"` → `{ ..., pendingIntent: "ConfirmUpdate", pendingItemName: "rice", isConfirmationRequired: true }`
2. UI shows confirmation dialog OR user says `"yes"` → client sends `{ transcript: "yes", pendingIntent: "ConfirmUpdate", pendingItemName: "rice" }`
3. Backend → `{ responseText: "What is the new price of rice?", pendingIntent: "Update", pendingItemName: "rice" }`
4. User says `"60"` → backend updates → `{ ..., itemsModified: true }`

### Update (item found) — 2 turns
1. `"update rice"` → `{ responseText: "What is the new price of rice?", pendingIntent: "Update", pendingItemName: "rice" }`
2. User says `"60"` → backend updates item

### Update (item not found) — 1 turn
- `"update unknown"` → `"I couldn't find that item."` — no pending state

### Query and Remove — unchanged (single turn)

---

## Key Design Decisions

- **Client-side pending state** — backend returns `pendingIntent` + `pendingItemName` in response; client sends them back in the next call. No server-side session.
- **Single endpoint** — all turns go to `POST /api/v1/voice/command`. The `/confirm-add` endpoint was removed.
- **Only Add + Update** use two-step flow. Query and Remove are single-step.
- **Invalid price** — if user says something unparseable as a number, backend returns the same prompt again with pending state intact (user can retry).
- **"No" to confirm** — returns "Okay, update cancelled." and clears pending state.

---

## PendingIntent Values (string constants in CommandService)

| Value | Meaning |
|-------|---------|
| `"Add"` | Item not found; waiting for price to add new item |
| `"Update"` | Item found (or confirmed); waiting for new price to update |
| `"ConfirmUpdate"` | Add trigger fired but item exists; waiting for "yes"/"no" |

---

## Files Changed

### Backend (`API/src/`)

| File | What changed |
|------|-------------|
| `Mapi.Application/Voice/DTOs/VoiceCommandResult.cs` | Added `string? PendingIntent` and `string? PendingItemName` |
| `Mapi.Application/Voice/DTOs/VoiceCommandRequest.cs` | Added `string? PendingIntent` and `string? PendingItemName` |
| `Mapi.Application/Common/Interfaces/ICommandService.cs` | `ExecuteAsync` gains `pendingIntent?` and `pendingItemName?` params; `ConfirmAddAsync` removed |
| `Mapi.Application/Voice/Commands/ProcessVoiceCommand.cs` | Record gains `PendingIntent` and `PendingItemName`; handler forwards them |
| `Mapi.Infrastructure/Services/CommandService.cs` | Major rewrite — added pending context dispatch at top of `ExecuteAsync`; `ExecuteActionAsync` for Add/Update now returns prompts with pending state instead of mutating; added `HandlePendingAddAsync`, `HandlePendingUpdateAsync`, `HandleConfirmUpdate`, `HandleAddTriggerAsync`, `HandleUpdateTriggerAsync`; removed `ADD_ITEM_PATTERN`, `AddItemRegex`, `HandleAddItemAsync`, `ConfirmAddAsync` |
| `Mapi.API/Endpoints/VoiceEndpoints.cs` | Removed `/confirm-add` endpoint; `ProcessCommandAsync` now reads pending context from request body |
| `Mapi.API/Controllers/AlexaController.cs` | Updated `new ProcessVoiceCommand(transcript)` → `new ProcessVoiceCommand(transcript, null, null)` |
| `Mapi.Application/Voice/Commands/ConfirmVoiceAddCommand.cs` | **Deleted** |
| `Mapi.Application/Voice/Validators/VoiceValidators.cs` | Removed `ConfirmVoiceAddCommandValidator` |

### Frontend (`UI/src/app/`)

| File | What changed |
|------|-------------|
| `voice/store/models/voice.model.ts` | `VoiceCommandResult` gains `pendingIntent: string\|null` and `pendingItemName: string\|null`; `VoiceState` gains same two fields; `ConfirmAddRequest` removed |
| `voice/store/actions/voice.actions.ts` | Removed `confirmAdd`, `confirmAddSuccess`, `confirmAddFailure`; kept `dismissConfirmation` |
| `voice/store/reducers/voice.reducer.ts` | `initialVoiceState` gains `pendingIntent: null` and `pendingItemName: null`; `commandSuccess` sets them from result; `dismissConfirmation` also clears pending; `selectIsConfirmationRequired` now derives from `pendingIntent === 'ConfirmUpdate'`; added `selectPendingState` selector |
| `voice/store/effects/voice.effects.ts` | `sendCommand$` uses `withLatestFrom(this.store.select(selectPendingState))` to pass pending context to API; `confirmAdd$` effect removed; `speakResponse$` and `refetchItemsAfterMutation$` only listen to `commandSuccess` now |
| `voice/store/api/voice.service.ts` | `sendCommand(transcript, pendingIntent?, pendingItemName?)` passes pending fields; `confirmAdd` method and `VOICE_ENDPOINTS.confirmAdd` removed |
| `app.component.ts` | `onConfirmAdd()` now dispatches `sendCommand({ transcript: 'yes' })`; `confirmAdd` import removed |

### Tests

| File | What changed |
|------|-------------|
| `Mapi.Application.Tests/Voice/ConfirmVoiceAddCommandHandlerTests.cs` | **Deleted** |
| `Mapi.Application.Tests/Voice/ProcessVoiceCommandHandlerTests.cs` | Updated to new command signature; added test for pending context forwarding |
| `Mapi.Application.Tests/Voice/CommandServiceAddTests.cs` | Completely rewritten — tests for Add trigger flow, ConfirmUpdate flow, Update trigger flow, and all pending-context price-input cases |
| `Mapi.API.IntegrationTests/Features/Voice.feature` | Removed old single-command add/confirm scenarios; added new two-step add, update, and confirm flows |
| `Mapi.API.IntegrationTests/StepDefinitions/VoiceStepDefinitions.cs` | Removed `WhenISendAConfirmAddRequest`; added `WhenISendAVoiceCommandWithPendingContext`, `ThenTheVoiceResultShouldHavePendingIntent`, `ThenTheVoiceResultShouldHaveItemsModified` |
| `voice/store/voice.store.spec.ts` | Removed all `confirmAdd*` tests; added pending state reducer tests; updated `selectIsConfirmationRequired` tests; added effects tests for `withLatestFrom` pending context passing |
| `voice/store/api/voice.service.spec.ts` | Removed `confirmAdd` test; added tests for pending context in `sendCommand` |
| `app.component.spec.ts` | Removed old `confirmAdd` dispatch tests; updated `onConfirmAdd` test to assert `sendCommand({ transcript: 'yes' })`; added `interimTranscript: signal('')` to speech mock; updated `initialState` voice slice with pending fields |

---

## Test Results (at time of implementation)

- **Backend unit tests**: 55 passing (up from 48)
- **Frontend**: 283 passing across 25 suites
- **Pre-existing failures** (NOT caused by this work):
  - `src/app/items/items.component.spec.ts` — 1 test fails (CSS selector `.btn--primary` not found)
  - `src/app/shared/services/speech-recognition.service.spec.ts` — 1 test fails (zone.js timing issue)
  - Both confirmed failing before these changes via `git stash` test

---

## Important: `withLatestFrom` not `concatLatestFrom`

`concatLatestFrom` was removed from `@ngrx/effects` in v18. This project uses `@ngrx/effects@^19`. Use `withLatestFrom` from `rxjs` instead when you need to read store state inside an effect.

```typescript
import { withLatestFrom } from 'rxjs';
// NOT: import { concatLatestFrom } from '@ngrx/effects';
```

---

## Known Fix: `AddAsync` mock signature

In `CommandServiceAddTests.cs`, mocking `AddAsync` requires returning the item back:

```csharp
_itemRepository
    .Setup(r => r.AddAsync(It.IsAny<Item>(), It.IsAny<CancellationToken>()))
    .ReturnsAsync((Item item, CancellationToken _) => item);
// NOT: .Returns(Task.CompletedTask)  ← wrong return type
```
