# Alexa Skill Contract: Mapi – Smart Voice & Storage Hub

**Branch**: `001-mapi-voice-hub` | **Date**: 2026-04-11  
**Endpoint**: `POST /alexa/skill`  
**Auth**: Alexa identity resolved via `AlexaUserId` on the `User` record. No JWT required on this endpoint — Alexa provides its own signed request mechanism.  
**Library**: `Alexa.NET` NuGet package

---

## Endpoint

```
POST /alexa/skill
Content-Type: application/json
```

This endpoint is handled by `AlexaController` (MVC). It receives a standard `SkillRequest` JSON payload from the Alexa Skills Kit and returns a `SkillResponse`.

---

## Supported Intents

### PriceQueryIntent

Triggered when the user asks for the price of an item.

**Example utterances**:
- "Ask Mapi how much is Gatas"
- "Ask Mapi what is the price of Milk"

**Slots**:

| Slot | Type | Required | Description |
|------|------|----------|-------------|
| `query` | `AMAZON.SearchQuery` | Yes | The full spoken query (e.g., "how much is Gatas") |

**Skill Request (condensed)**:
```json
{
  "version": "1.0",
  "session": {
    "user": {
      "userId": "amzn1.ask.account.XXXXX"
    }
  },
  "request": {
    "type": "IntentRequest",
    "intent": {
      "name": "PriceQueryIntent",
      "slots": {
        "query": {
          "name": "query",
          "value": "how much is Gatas"
        }
      }
    }
  }
}
```

**Processing**:
1. Extract `session.user.userId` → resolve `User` by `AlexaUserId`.
2. If `AlexaUserId` not found → respond with "I couldn't find a Mapi account linked to this Alexa account."
3. Extract `slots["query"].value` → dispatch `ProcessVoiceCommand(transcript, userId)` via `IMediator`.
4. Return `responseText` from `VoiceCommandResult` as `PlainTextOutputSpeech`.

**Skill Response**:
```json
{
  "version": "1.0",
  "response": {
    "outputSpeech": {
      "type": "PlainText",
      "text": "Price of Gatas is 50.00"
    },
    "shouldEndSession": true
  }
}
```

---

### AddItemIntent

Triggered when the user wants to add a new item via Alexa.

**Example utterances**:
- "Ask Mapi to add Gatas price 50"

**Slots**:

| Slot | Type | Required | Description |
|------|------|----------|-------------|
| `query` | `AMAZON.SearchQuery` | Yes | The full add command (e.g., "add Gatas price 50") |

**Processing**: Same pipeline as `PriceQueryIntent` — transcript dispatched to `ProcessVoiceCommand`. The `ICommandService` resolves the "Add" pattern internally.

**Confirmation flow**: If `IsConfirmationRequired = true` (duplicate item), the Alexa response prompts the user to confirm. The session is kept open (`shouldEndSession: false`) and a `ConfirmAddIntent` follows.

---

### ConfirmAddIntent

Triggered after Alexa prompts the user to confirm updating an existing item's price.

**Slots**:

| Slot | Type | Required | Description |
|------|------|----------|-------------|
| `itemName` | `AMAZON.SearchQuery` | Yes | Name of the item to update |
| `newPrice` | `AMAZON.NUMBER` | Yes | The new price |

**Processing**: Dispatches `ConfirmVoiceAddCommand(itemName, newPrice, userId)` via `IMediator`.

**Skill Response**:
```json
{
  "version": "1.0",
  "response": {
    "outputSpeech": {
      "type": "PlainText",
      "text": "Updated. Gatas now costs 60.00."
    },
    "shouldEndSession": true
  }
}
```

---

## Error Responses

| Scenario | Response Text |
|----------|---------------|
| Unlinked Alexa user | "I couldn't find a Mapi account linked to this Alexa account. Please link your account in the Mapi app." |
| Item not found | "I couldn't find an item with that name in your account." |
| Ambiguous match | "Found multiple items with that name. Please be more specific or use the Mapi app to clarify." |
| Unrecognized command | "I didn't understand that command. Please try again." |
| Internal error | "Something went wrong. Please try again in a moment." |

---

## Alexa Skill Configuration Notes

- **Invocation name**: `mapi` (e.g., "Alexa, ask Mapi how much is Gatas")
- **Endpoint type**: HTTPS (not Lambda) — points to `POST /alexa/skill` on the Mapi API server
- **Certificate**: Must use a valid SSL certificate (Alexa requires HTTPS with a cert from a trusted CA)
- **Request verification**: `Alexa.NET`'s `RequestVerification.Verify()` validates `SignatureCertChainUrl` and `Signature` headers in production
- **Session management**: Most responses set `shouldEndSession: true`; confirmation flows keep the session open with `shouldEndSession: false`
