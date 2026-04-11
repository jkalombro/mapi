# Implementation Plan: Mapi – Smart Voice & Storage Hub

**Branch**: `001-mapi-voice-hub` | **Date**: 2026-04-11 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-mapi-voice-hub/spec.md`

## Summary

Mapi is a full-stack web application combining a manual item management dashboard with a persistent browser-based voice interface. Users register with a store name, manage bilingual items (ItemName / BisayaName / Price), and define custom trigger-action mappings that power personalized voice workflows. The voice interface captures speech via the browser's Web Speech API, sends the transcript to a .NET Minimal API backend, dispatches it through MediatR to an `ICommandService` that resolves the command against the user's triggers and built-in patterns, and plays back a synthesized spoken response. Alexa integration exposes the same command engine through a dedicated MVC controller. Authentication is custom: a `User` table (email, password hash, StoreName, AlexaUserId) with JWT tokens — no social providers.

## Technical Context

**Language/Version**: C# 12 / .NET 9 (backend); TypeScript 5 / Angular 19 (frontend)  
**Primary Dependencies**:
- Backend: MediatR 12, FluentValidation, EF Core 9 (SQL Server), Serilog, Swashbuckle, xUnit, Reqnroll, Alexa.NET
- Frontend: NgRx 19, Jest, Angular Testing Library, ngxtension, @ngx-env/builder

**Storage**: SQL Server (EF Core code-first migrations)  
**Testing**: xUnit + Reqnroll (backend); Jest + Angular Testing Library (frontend)  
**Target Platform**: Web browser (Chrome/Edge primary; mic icon disabled on unsupported browsers) + Alexa skill endpoint  
**Project Type**: Web application — Angular 19 SPA + ASP.NET Core 9 Web API  
**Performance Goals**: Voice query spoken result ≤ 3 seconds end-to-end (SC-002); item add form ≤ 60 seconds (SC-001)  
**Constraints**: Per-user data isolation at data access layer (FR-001); JWT expiry configurable; Alexa request signature verification required  
**Scale/Scope**: Multi-tenant (per-user isolation); small-to-medium data volumes per user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design — all gates unchanged.*

### .NET Constitution Gates

| Gate | Status | Note |
|------|--------|------|
| Clean Architecture layers (Domain ← Application ← Infrastructure ← API) | ✅ PASS | Strict layer ordering enforced |
| MediatR for all command/query dispatch from endpoints | ✅ PASS | `ICommandService` invoked inside handlers only |
| Minimal API (no controllers) | ⚠️ DEVIATION | `AlexaController` (MVC) for Alexa only; all web endpoints remain Minimal API |
| ASP.NET Core Identity | ⚠️ DEVIATION | Custom `User` table + BCrypt + JWT; Identity not used |
| Google + Facebook social login (mandatory per constitution) | ⚠️ DEVIATION | Excluded by explicit user decision |
| EF Core SQL Server, code-first | ✅ PASS | |
| Repository pattern | ✅ PASS | |
| FluentValidation (no Data Annotations) | ✅ PASS | |
| Serilog structured logging | ✅ PASS | |
| xUnit TDD + Reqnroll integration tests | ✅ PASS | |
| RFC 7807 ProblemDetails error responses | ✅ PASS | Handled via `GlobalExceptionHandlerMiddleware` |
| `BaseEntity` with `CreatedAt` / `UpdatedAt` auto-set | ✅ PASS | |

### Angular Constitution Gates

| Gate | Status | Note |
|------|--------|------|
| Standalone components (no NgModules) | ✅ PASS | |
| NgRx (Actions / Reducers / Effects) | ✅ PASS | |
| OnPush change detection on every component | ✅ PASS | |
| Jest (not Karma/Jasmine) | ✅ PASS | |
| SCSS only, no inline styles | ✅ PASS | |
| Reactive Forms only | ✅ PASS | |
| `@if` / `@for` / `@switch` template syntax | ✅ PASS | |
| Signals: `input()`, `output()`, `signal()`, `toSignal()` | ✅ PASS | |
| `@ngx-env/builder` for env variable support | ✅ PASS | |
| HTTP interceptors: auth + error | ✅ PASS | |
| 100% Jest coverage enforced | ✅ PASS | |

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Custom `User` table (no ASP.NET Identity) | `StoreName` and `AlexaUserId` are first-class business fields; simpler auth surface with only email/password + JWT | Identity adds AspNetUsers, AspNetRoles, AspNetUserClaims, AspNetUserTokens tables for a feature that only needs three custom columns; migration complexity outweighs benefit |
| `AlexaController` (MVC) alongside Minimal API | Alexa.NET request verification and model binding integrate cleanly with controller action filters and `[FromBody]` model binding | Rewriting Alexa request binding for Minimal API requires custom `IValueProvider` and loses Alexa.NET's built-in signature verification middleware |
| Social login excluded | Explicit user decision — email/password + JWT is sufficient for this build | Social providers require OAuth client credentials, callback URL registration, and provider-specific account linking flows; scope not justified |

## Project Structure

### Documentation (this feature)

```text
specs/001-mapi-voice-hub/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── api.md           # REST API contract
│   └── alexa.md         # Alexa skill contract
└── tasks.md             # Phase 2 output (/speckit.tasks — not created here)
```

### Source Code (repository root)

```text
backend/
├── Mapi.sln
├── src/
│   ├── Mapi.Domain/
│   │   ├── Entities/               — User, Item, Trigger, Action, TriggerActionMap (+ BaseEntity)
│   │   ├── Enums/                  — ActionType (Query, Add, Update, Remove)
│   │   ├── Events/                 — INotification domain events (e.g. ItemAddedEvent)
│   │   ├── Exceptions/             — domain-specific exceptions
│   │   └── Interfaces/             — IRepository<T>, IUserRepository, IItemRepository,
│   │                                 ITriggerRepository, IActionRepository
│   ├── Mapi.Application/
│   │   ├── Common/
│   │   │   ├── Behaviors/          — ValidationBehavior, LoggingBehavior
│   │   │   ├── Exceptions/         — NotFoundException, ValidationException, ConflictException
│   │   │   └── Interfaces/         — ICurrentUserService, ITokenService, ICommandService,
│   │   │                             IPasswordHasher
│   │   ├── Auth/
│   │   │   ├── Commands/           — RegisterCommand, LoginCommand (+ handlers)
│   │   │   ├── DTOs/               — RegisterRequest, LoginRequest, AuthResponse
│   │   │   └── Validators/         — RegisterCommandValidator, LoginCommandValidator
│   │   ├── Items/
│   │   │   ├── Commands/           — CreateItemCommand, UpdateItemCommand, DeleteItemCommand
│   │   │   ├── Queries/            — GetItemsQuery, GetItemByIdQuery
│   │   │   ├── DTOs/               — ItemRequest, ItemResponse
│   │   │   └── Validators/
│   │   ├── Voice/
│   │   │   ├── Commands/           — ProcessVoiceCommand (+ handler — invokes ICommandService)
│   │   │   ├── DTOs/               — VoiceCommandRequest, VoiceCommandResult
│   │   │   └── Validators/         — ProcessVoiceCommandValidator
│   │   ├── Triggers/
│   │   │   ├── Commands/           — CreateTriggerCommand, UpdateTriggerCommand, DeleteTriggerCommand,
│   │   │   │                         LinkActionCommand, UnlinkActionCommand
│   │   │   ├── Queries/            — GetTriggersQuery, GetTriggerByIdQuery
│   │   │   ├── DTOs/               — TriggerRequest, TriggerResponse, TriggerActionLinkRequest
│   │   │   └── Validators/
│   │   ├── Actions/
│   │   │   ├── Commands/           — CreateActionCommand, UpdateActionCommand, DeleteActionCommand
│   │   │   ├── Queries/            — GetActionsQuery, GetActionByIdQuery
│   │   │   ├── DTOs/               — ActionRequest, ActionResponse
│   │   │   └── Validators/
│   │   └── DependencyInjection.cs
│   ├── Mapi.Infrastructure/
│   │   ├── Persistence/
│   │   │   ├── ApplicationDbContext.cs
│   │   │   ├── Configurations/     — UserConfiguration, ItemConfiguration, TriggerConfiguration,
│   │   │   │                         ActionConfiguration, TriggerActionMapConfiguration
│   │   │   ├── Migrations/
│   │   │   └── Repositories/       — UserRepository, ItemRepository, TriggerRepository,
│   │   │                             ActionRepository, TriggerActionMapRepository
│   │   ├── Auth/                   — JwtTokenService, BCryptPasswordHasher
│   │   ├── Services/               — CommandService (ICommandService impl),
│   │   │                             AlexaRequestVerificationService
│   │   └── DependencyInjection.cs
│   └── Mapi.API/
│       ├── Program.cs
│       ├── Controllers/            — AlexaController (MVC, Alexa requests only)
│       ├── Endpoints/              — AuthEndpoints, ItemsEndpoints, VoiceEndpoints,
│       │                             TriggersEndpoints, ActionsEndpoints
│       ├── Middleware/             — GlobalExceptionHandlerMiddleware
│       └── Extensions/
├── tests/
│   ├── Mapi.Domain.Tests/
│   ├── Mapi.Application.Tests/
│   └── Mapi.API.IntegrationTests/
│       ├── Features/               — Items.feature, Voice.feature, Triggers.feature, Auth.feature
│       └── StepDefinitions/

frontend/
├── angular.json
├── jest.config.js
├── .env
├── .env.example
├── .prettierrc
├── src/
│   ├── styles.scss
│   ├── assets/
│   │   └── styles/
│   │       ├── variables.scss
│   │       ├── mixins.scss
│   │       └── global.scss
│   ├── __mocks__/
│   │   └── environment.js
│   └── app/
│       ├── app.config.ts
│       ├── app.routes.ts
│       ├── app.component.{ts,html,scss}
│       ├── store/                  — global state: auth slice (user, token), voice status
│       │   ├── models/
│       │   ├── actions/
│       │   ├── reducers/
│       │   ├── effects/
│       │   └── api/
│       ├── auth/                   — login, register pages
│       │   ├── auth.routes.ts
│       │   ├── login/
│       │   ├── register/
│       │   └── store/
│       ├── items/                  — item list, add/edit form
│       │   ├── items.routes.ts
│       │   ├── items.component.{ts,html,scss}
│       │   ├── components/
│       │   │   ├── item-form/
│       │   │   └── item-list/
│       │   └── store/
│       ├── voice/                  — mic button, voice state, command dispatch
│       │   └── store/
│       ├── triggers/               — trigger + action management
│       │   ├── triggers.routes.ts
│       │   ├── triggers.component.{ts,html,scss}
│       │   ├── components/
│       │   │   ├── trigger-form/
│       │   │   └── action-link-form/
│       │   └── store/
│       └── shared/
│           ├── components/
│           │   ├── mic-icon/       — persistent microphone button (rendered in app.component)
│           │   └── confirmation-dialog/
│           ├── interceptors/
│           │   ├── auth.interceptor.ts
│           │   └── error.interceptor.ts
│           ├── services/
│           │   ├── speech-recognition.service.ts
│           │   └── speech-synthesis.service.ts
│           └── helpers/
```

**Structure Decision**: Option 2 (Web application) — Angular 19 SPA in `frontend/`, .NET 9 Clean Architecture API in `backend/`. Both communicate via REST + JWT. The `AlexaController` lives in `backend/Mapi.API/Controllers/` alongside Minimal API endpoints.
