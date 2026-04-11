# Research: Mapi – Smart Voice & Storage Hub

**Branch**: `001-mapi-voice-hub` | **Date**: 2026-04-11  
**Purpose**: Resolve all technical unknowns before Phase 1 design

---

## R-001: Web Speech API — Browser Support & Angular Integration

**Decision**: Use the browser's native `SpeechRecognition` API (via `webkitSpeechRecognition` prefix on Chrome/Edge) wrapped in an Angular injectable service. Use `SpeechSynthesis` for spoken response playback.

**Rationale**: No external dependency required; the spec already assumes browser-native speech. Wrapping in a service allows the component layer to stay clean and enables Jest mocking for tests.

**Alternatives Considered**:
- Third-party SDK (e.g., Azure Cognitive Services Speech): adds cost and network dependency; not needed given the spec's browser-native assumption.
- `annyang.js`: lightweight, but adds a dependency and limits access to low-level recognition events.

**Key Implementation Notes**:
- Feature detection: `'SpeechRecognition' in window || 'webkitSpeechRecognition' in window`. If absent, the mic icon is hidden and a message is displayed (per spec Assumption).
- `SpeechRecognitionService` wraps `SpeechRecognition` and exposes an Observable-based `transcript$` stream + `isListening` signal.
- `SpeechSynthesisService` wraps `window.speechSynthesis.speak()` and exposes a `speak(text: string)` method.
- Both services live in `src/app/shared/services/` (used across features).
- Browser compatibility: Chrome 33+, Edge 79+. Firefox and Safari: not supported → fallback to disabled mic icon.

---

## R-002: Alexa.NET — Skill Request Handling & Verification

**Decision**: Use the `Alexa.NET` NuGet package (`Alexa.NET` by stoivane) for parsing `SkillRequest` and building `SkillResponse` objects. Use Alexa's built-in HTTPS certificate verification (handled at the load-balancer/API Gateway level in production; testable via simulated payloads in integration tests).

**Rationale**: `Alexa.NET` provides typed request/response models, intent slot accessors, and response builders that match the Alexa Skills Kit JSON schema exactly. Manual JSON mapping would be fragile and verbose.

**Alternatives Considered**:
- `AlexaSkillsKit.NET`: older, less maintained.
- Manual JSON deserialization: high maintenance, no type safety for intent slots.

**Key Implementation Notes**:
- `AlexaController` receives `POST /alexa/skill` as `[FromBody] SkillRequest request`.
- Extract the spoken query: `request.Request` cast to `IntentRequest` → `intent.Slots["query"].Value`.
- Dispatch `ProcessVoiceCommand` via `IMediator` → same handler as web voice.
- Return `SkillResponse` with `PlainTextOutputSpeech` containing the command result text.
- Alexa user identity: `request.Session.User.UserId` → resolve `User` by `AlexaUserId` in `IUserRepository`.
- Signature verification: Alexa sends `SignatureCertChainUrl` and `Signature` headers. In production, verify via `Alexa.NET`'s `RequestVerification` utility. In integration tests, use simulated payloads with verification bypassed.

---

## R-003: Custom JWT Authentication (Without ASP.NET Core Identity)

**Decision**: Implement a custom `User` table with BCrypt password hashing. Issue JWTs using `Microsoft.AspNetCore.Authentication.JwtBearer` + `System.IdentityModel.Tokens.Jwt`. Store `UserId` as the JWT `sub` claim; read it via `ICurrentUserService`.

**Rationale**: The spec explicitly requires a custom `User` table (Id, Email, PasswordHash, AlexaUserId, StoreName) with no social login. This is simpler than ASP.NET Core Identity and avoids unnecessary schema complexity.

**Alternatives Considered**:
- ASP.NET Core Identity with custom fields: adds 5+ system tables and Identity middleware for a feature that only needs email/password + JWT.

**Key Implementation Notes**:
- `BCryptPasswordHasher` in `Mapi.Infrastructure/Auth/` implements `IPasswordHasher` from Application.
- `JwtTokenService` in `Mapi.Infrastructure/Auth/` implements `ITokenService`. Reads `Jwt:SecretKey`, `Jwt:Issuer`, `Jwt:Audience`, `Jwt:ExpiryMinutes` from `appsettings.json`.
- Registration flow: `RegisterCommand` handler validates email uniqueness → hashes password → persists `User` → returns JWT.
- Login flow: `LoginCommand` handler fetches user by email → verifies hash → returns JWT.
- `ICurrentUserService` reads `HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)` → returns `Guid` UserId.
- All protected Minimal API endpoints call `.RequireAuthorization()`. `AlexaController` uses `[Authorize]`.
- JWT settings must come from configuration — never hardcoded. Document all required keys in `.env.example` (frontend) and `appsettings.json` (backend).

---

## R-004: Voice Command Parsing & Trigger Matching

**Decision**: `CommandService` (implements `ICommandService`) uses a two-phase matching strategy:
1. **Trigger matching**: scan the user's `Trigger` records; find any whose `Phrase` is a prefix match in the transcript (case-insensitive). If one or more matches found, execute all linked `Action`s in `SortOrder` sequence.
2. **Built-in fallback**: if no trigger matches, apply regex patterns for the two built-in commands:
   - Query: `^how much is (?<name>.+)\??$` (case-insensitive)
   - Add: `^add (?<name>.+) price (?<price>\d+(\.\d+)?)$` (case-insensitive)

**Rationale**: User-defined triggers take precedence, enabling full customization. Built-in patterns provide out-of-the-box functionality without requiring trigger setup. Regex patterns are explicit and testable.

**Alternatives Considered**:
- NLP intent classification (e.g., ML.NET): far more complex than needed for structured command strings; spec defines exact command formats.
- Exact string matching: too brittle for natural speech variations.

**Key Implementation Notes**:
- Ambiguity (multiple items match by name): `CommandService` returns a `VoiceCommandResult` with `IsAmbiguous = true` and a list of matched names. The response text reads: `"Found {n} items named {name}. Please specify which one."` (FR confirmed in clarifications).
- Duplicate add (item already exists): `CommandService` returns `IsConfirmationRequired = true` with the existing item's current price. The frontend displays the confirmation prompt before re-submitting. The backend exposes a separate `ConfirmVoiceAddCommand` for the confirmed update path.
- Non-numeric price in "Add" command: regex requires `\d+(\.\d+)?` — if the spoken price does not match, the command falls through to an unrecognized state and the system responds with a helpful error message (per edge case in spec).
- Trigger phrase matching multiple `Trigger` records: all matched triggers execute. If this is undesirable, a future enhancement can enforce uniqueness — not in scope for this build.
- All `CommandService` logic is unit-tested in `Mapi.Application.Tests` with 100% handler coverage.

---

## R-005: Multi-Tenancy — Per-User Data Isolation

**Decision**: Apply a global EF Core query filter on all user-owned entities (`Item`, `Trigger`, `Action`, `TriggerActionMap`) via `HasQueryFilter(e => e.UserId == _currentUserId)` in `ApplicationDbContext`.

**Rationale**: Centralizing the filter in `DbContext` means no individual handler or repository needs to remember to scope by user — it is enforced automatically for all queries. This satisfies FR-001 and SC-005.

**Alternatives Considered**:
- Per-repository user filtering: each repository method accepts a `userId` parameter and applies it manually. Riskier — forgetting to pass it in a new query would silently expose cross-user data.
- Row-Level Security in SQL Server: effective but couples the isolation strategy to the database engine and complicates testing.

**Key Implementation Notes**:
- `ApplicationDbContext` receives `ICurrentUserService` via DI. The `_currentUserId` is read once per request scope.
- During integration tests, the factory seeds a test user and populates `HttpContext` with the appropriate claim so the filter resolves correctly.
- Alexa requests resolve `UserId` from `AlexaUserId` lookup before any data access — the same filter then applies automatically.
- `User` entity itself is not filtered (users look themselves up by `Id` or `Email` during auth).
