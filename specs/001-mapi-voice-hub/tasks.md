# Tasks: Mapi – Smart Voice & Storage Hub

**Input**: Design documents from `/specs/001-mapi-voice-hub/`  
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅  
**Tests**: Included — both constitutions mandate TDD (Angular: write test first; .NET: failing test first)

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Paths: `backend/` = .NET API, `frontend/` = Angular SPA

---

## Phase 1: Setup

**Purpose**: Project initialization and tooling configuration.

- [ ] T001 Create backend solution `backend/Mapi.sln` with four `.csproj` projects: `Mapi.Domain`, `Mapi.Application`, `Mapi.Infrastructure`, `Mapi.API` — wire `<ProjectReference>` per layer rules
- [ ] T002 Create three test `.csproj` projects: `Mapi.Domain.Tests`, `Mapi.Application.Tests`, `Mapi.API.IntegrationTests` in `backend/tests/` — reference xUnit, Moq, Reqnroll
- [ ] T003 [P] Initialize Angular 19 project with `@ngx-env/builder` in `frontend/` — configure `angular.json` build/serve builders
- [ ] T004 [P] Configure ESLint (`@angular-eslint`) + Prettier (`eslint-plugin-prettier`) in `frontend/` — create `.prettierrc` and `eslint.config.js`
- [ ] T005 [P] Configure Jest in `frontend/` — create `jest.config.js` with 100% coverage thresholds and `src/__mocks__/environment.js`
- [ ] T006 [P] Add `.editorconfig` and `SonarAnalyzer.CSharp` + `<TreatWarningsAsErrors>true</TreatWarningsAsErrors>` to all backend `.csproj` files
- [ ] T007 [P] Create SCSS design system files: `frontend/src/styles.scss`, `frontend/src/assets/styles/variables.scss`, `mixins.scss`, `global.scss`
- [ ] T008 [P] Create `frontend/.env.example` with `NG_APP_API_URL=` placeholder; create `frontend/.env` for local dev
- [ ] T009 [P] Create `backend/src/Mapi.API/appsettings.json` and `appsettings.Development.json` with `ConnectionStrings`, `Jwt` (`SecretKey`, `Issuer`, `Audience`, `ExpiryMinutes`) sections — document all keys in `backend/src/Mapi.API/appsettings.json` with placeholder values

---

## Phase 2: Foundational

**Purpose**: Core infrastructure and auth — MUST be complete before any user story can begin.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Domain Core

- [ ] T010 Create `BaseEntity` (Id: Guid, CreatedAt: DateTime, UpdatedAt: DateTime) in `backend/src/Mapi.Domain/Entities/BaseEntity.cs`
- [ ] T011 Create `User` entity (Email, PasswordHash, StoreName, AlexaUserId?) inheriting `BaseEntity` in `backend/src/Mapi.Domain/Entities/User.cs`
- [ ] T012 Create `IRepository<T>` interface (GetByIdAsync, GetAllAsync, AddAsync, UpdateAsync, DeleteAsync) in `backend/src/Mapi.Domain/Interfaces/IRepository.cs`
- [ ] T013 Create `IUserRepository` (extends `IRepository<User>`, adds `FindByEmailAsync`, `FindByAlexaUserIdAsync`) in `backend/src/Mapi.Domain/Interfaces/IUserRepository.cs`
- [ ] T014 [P] Create domain exceptions: `NotFoundException`, `ConflictException` in `backend/src/Mapi.Domain/Exceptions/`

### Application Interfaces & Behaviors

- [ ] T015 [P] Create `IPasswordHasher` interface (Hash, Verify) in `backend/src/Mapi.Application/Common/Interfaces/IPasswordHasher.cs`
- [ ] T016 [P] Create `ITokenService` interface (GenerateToken) in `backend/src/Mapi.Application/Common/Interfaces/ITokenService.cs`
- [ ] T017 [P] Create `ICurrentUserService` interface (UserId: Guid) in `backend/src/Mapi.Application/Common/Interfaces/ICurrentUserService.cs`
- [ ] T018 [P] Create `ICommandService` interface (ExecuteAsync, ConfirmAddAsync) in `backend/src/Mapi.Application/Common/Interfaces/ICommandService.cs`
- [ ] T019 Create `ValidationBehavior<TRequest, TResponse>` MediatR pipeline behavior in `backend/src/Mapi.Application/Common/Behaviors/ValidationBehavior.cs`
- [ ] T020 Create `LoggingBehavior<TRequest, TResponse>` MediatR pipeline behavior in `backend/src/Mapi.Application/Common/Behaviors/LoggingBehavior.cs`
- [ ] T021 Create `Application/DependencyInjection.cs` — `AddApplication()` registering MediatR, FluentValidation validators, pipeline behaviors in `backend/src/Mapi.Application/DependencyInjection.cs`

### Infrastructure Core

- [ ] T022 Create `ApplicationDbContext` with `Users` DbSet, `CreatedAt`/`UpdatedAt` auto-set in `SaveChangesAsync`, and global query filter scaffold in `backend/src/Mapi.Infrastructure/Persistence/ApplicationDbContext.cs`
- [ ] T023 Create `UserConfiguration` (`IEntityTypeConfiguration<User>`) — unique index on Email, filtered unique index on AlexaUserId in `backend/src/Mapi.Infrastructure/Persistence/Configurations/UserConfiguration.cs`
- [ ] T024 Implement `BCryptPasswordHasher` (implements `IPasswordHasher`) in `backend/src/Mapi.Infrastructure/Auth/BCryptPasswordHasher.cs`
- [ ] T025 Implement `JwtTokenService` (implements `ITokenService`) — reads config, sets `sub` claim to `UserId` in `backend/src/Mapi.Infrastructure/Auth/JwtTokenService.cs`
- [ ] T026 Implement `UserRepository` (implements `IUserRepository`) in `backend/src/Mapi.Infrastructure/Persistence/Repositories/UserRepository.cs`
- [ ] T027 Implement `CurrentUserService` — reads `HttpContext.User` sub claim → Guid in `backend/src/Mapi.Infrastructure/Services/CurrentUserService.cs`
- [ ] T028 Create `Infrastructure/DependencyInjection.cs` — `AddInfrastructure()` registering DbContext, repositories, auth services in `backend/src/Mapi.Infrastructure/DependencyInjection.cs`

### Auth Application Layer

- [X] T029 [P] Write xUnit unit tests for `RegisterCommandHandler` (valid registration, duplicate email conflict) in `backend/tests/Mapi.Application.Tests/Auth/RegisterCommandHandlerTests.cs`
- [X] T030 [P] Write xUnit unit tests for `LoginCommandHandler` (valid login, wrong password, unknown email) in `backend/tests/Mapi.Application.Tests/Auth/LoginCommandHandlerTests.cs`
- [ ] T031 Create `AuthResponse`, `RegisterRequest`, `LoginRequest` DTOs in `backend/src/Mapi.Application/Auth/DTOs/`
- [ ] T032 Implement `RegisterCommand` + handler (validate uniqueness → hash → persist → return JWT) in `backend/src/Mapi.Application/Auth/Commands/RegisterCommand.cs`
- [ ] T033 Implement `LoginCommand` + handler (fetch user → verify hash → return JWT) in `backend/src/Mapi.Application/Auth/Commands/LoginCommand.cs`
- [ ] T034 [P] Create `RegisterCommandValidator` + `LoginCommandValidator` in `backend/src/Mapi.Application/Auth/Validators/`
- [ ] T035 Create `AuthEndpoints` (POST `/api/v1/auth/register`, POST `/api/v1/auth/login`) in `backend/src/Mapi.API/Endpoints/AuthEndpoints.cs`

### API Host

- [ ] T036 Create `GlobalExceptionHandlerMiddleware` mapping domain exceptions to RFC 7807 `ProblemDetails` in `backend/src/Mapi.API/Middleware/GlobalExceptionHandlerMiddleware.cs`
- [ ] T037 Configure `backend/src/Mapi.API/Program.cs` — `AddApplication()`, `AddInfrastructure()`, JWT Bearer, Serilog, Swagger, CORS, middleware pipeline, endpoint mapping
- [ ] T038 Create and apply initial EF Core migration `InitialCreate` (Users table) — run `dotnet ef migrations add InitialCreate`

### Integration Test Setup

- [X] T039 Configure `WebApplicationFactory<Program>` + SQL Server LocalDB test database + `[BeforeScenario]` seed hooks in `backend/tests/Mapi.API.IntegrationTests/`
- [X] T040 Write Auth Gherkin scenarios (register, login, duplicate email, wrong password) in `backend/tests/Mapi.API.IntegrationTests/Features/Auth.feature`
- [X] T041 Implement `AuthStepDefinitions` for Auth.feature in `backend/tests/Mapi.API.IntegrationTests/StepDefinitions/AuthStepDefinitions.cs`

### Angular Foundation

- [X] T042 [P] Write Jest tests for `auth.interceptor.ts` (token attachment, missing token) in `frontend/src/app/shared/interceptors/auth.interceptor.spec.ts`
- [X] T043 [P] Write Jest tests for `error.interceptor.ts` (401 redirect, 5xx handling) in `frontend/src/app/shared/interceptors/error.interceptor.spec.ts`
- [X] T044 [P] Write Jest tests for global auth NgRx store (actions, reducers, effects, selectors) in `frontend/src/app/store/`
- [X] T044a [P] Write Jest tests for `auth.guard.ts` (authenticated user passes, unauthenticated user redirects to `/auth/login`) in `frontend/src/app/shared/guards/auth.guard.spec.ts`
- [X] T044b [P] Write Jest tests for `guest.guard.ts` (authenticated user redirects to `/items`, unauthenticated user passes) in `frontend/src/app/shared/guards/guest.guard.spec.ts`
- [ ] T045 Create `auth.interceptor.ts` (attach JWT from store to outgoing requests) in `frontend/src/app/shared/interceptors/auth.interceptor.ts`
- [ ] T046 Create `error.interceptor.ts` (handle 401, 403, 5xx globally) in `frontend/src/app/shared/interceptors/error.interceptor.ts`
- [ ] T047 Create global auth NgRx store slice (user, token, loginSuccess, loginFailure actions + effects + api service) in `frontend/src/app/store/`
- [ ] T048 Create login page component (Reactive Form) in `frontend/src/app/auth/login/login.component.{ts,html,scss}`
- [ ] T049 Create register page component (Reactive Form: email, password, storeName) in `frontend/src/app/auth/register/register.component.{ts,html,scss}`
- [ ] T050 Configure `frontend/src/app/app.config.ts` (provideStore, provideEffects, provideRouter, provideHttpClient with interceptors), `app.component.{ts,html,scss}` (root shell + router-outlet)
- [X] T050a [P] Implement `authGuard` functional guard (reads `selectIsAuthenticated` from NgRx store via `take(1)`; redirects to `/auth/login` if not authenticated) in `frontend/src/app/shared/guards/auth.guard.ts`
- [X] T050b [P] Implement `guestGuard` functional guard (reads `selectIsAuthenticated` from NgRx store via `take(1)`; redirects to `/items` if authenticated) in `frontend/src/app/shared/guards/guest.guard.ts`
- [X] T050c [P] Write Jest tests for `LandingComponent` (renders hero section, features grid, CTA section; contains links to `/auth/login` and `/auth/register`) in `frontend/src/app/landing/landing.component.spec.ts`
- [X] T050d Create `LandingComponent` (standalone, OnPush; imports RouterLink; hero section with brand icon + tagline, 4-card features grid, footer CTA) in `frontend/src/app/landing/landing.component.{ts,html,scss}`
- [X] T050e Configure `app.routes.ts`: root path (`''`) loads `LandingComponent` with `guestGuard`; apply `authGuard` to `items` and `triggers` routes; apply `guestGuard` to `auth` route; wildcard redirects to `''` in `frontend/src/app/app.routes.ts`

**Checkpoint**: Backend API starts, register/login endpoints return JWTs, Angular app loads landing page for guests (redirects authenticated users to /items), interceptors attach tokens.

---

## Phase 3: User Story 1 – Manual Item Management (Priority: P1) 🎯 MVP

**Goal**: Users can create, read, update, and delete items (ItemName, BisayaName, Price) through an admin dashboard. Data is scoped per authenticated user.

**Independent Test**: Log in → open Items page → add an item → edit it → delete it. No voice or Alexa needed.

### Tests for User Story 1 (write first — must FAIL before implementation)

- [X] T051 Write Gherkin CRUD scenarios (create item, edit item, delete item, data isolation between users) in `backend/tests/Mapi.API.IntegrationTests/Features/Items.feature`
- [X] T052 [P] [US1] Write xUnit tests for `CreateItemCommandHandler` (valid create, validation failure) in `backend/tests/Mapi.Application.Tests/Items/CreateItemCommandHandlerTests.cs`
- [X] T053 [P] [US1] Write xUnit tests for `UpdateItemCommandHandler` (update, not-found) in `backend/tests/Mapi.Application.Tests/Items/UpdateItemCommandHandlerTests.cs`
- [X] T054 [P] [US1] Write xUnit tests for `DeleteItemCommandHandler` (delete, not-found) in `backend/tests/Mapi.Application.Tests/Items/DeleteItemCommandHandlerTests.cs`
- [X] T055 [P] [US1] Write xUnit tests for `GetItemsQueryHandler` and `GetItemByIdQueryHandler` in `backend/tests/Mapi.Application.Tests/Items/GetItemsQueryHandlerTests.cs`
- [X] T056 [P] [US1] Write Jest tests for items NgRx store (actions, reducers, effects, selectors, api service) in `frontend/src/app/items/store/`
- [ ] T057 [P] [US1] Write Jest tests for `item-list` component in `frontend/src/app/items/components/item-list/item-list.component.spec.ts`
- [ ] T058 [P] [US1] Write Jest tests for `item-form` component (add mode, edit mode, validation) in `frontend/src/app/items/components/item-form/item-form.component.spec.ts`
- [ ] T059 [P] [US1] Write Jest tests for `items` smart component in `frontend/src/app/items/items.component.spec.ts`

### Implementation for User Story 1

- [ ] T060 [P] [US1] Create `Item` entity (UserId FK, ItemName, BisayaName, Price decimal) inheriting `BaseEntity` in `backend/src/Mapi.Domain/Entities/Item.cs`
- [ ] T061 [P] [US1] Create `IItemRepository` (extends `IRepository<Item>`, adds `GetAllByUserAsync`, `FindByNameAsync`) in `backend/src/Mapi.Domain/Interfaces/IItemRepository.cs`
- [ ] T062 [US1] Create `ItemConfiguration` (`HasPrecision(18,2)` on Price, global query filter on UserId, indexes) in `backend/src/Mapi.Infrastructure/Persistence/Configurations/ItemConfiguration.cs`
- [ ] T063 [US1] Implement `ItemRepository` in `backend/src/Mapi.Infrastructure/Persistence/Repositories/ItemRepository.cs`
- [ ] T064 [US1] Add `Items` DbSet and `Item` global query filter to `ApplicationDbContext` in `backend/src/Mapi.Infrastructure/Persistence/ApplicationDbContext.cs`
- [ ] T065 [P] [US1] Create `ItemRequest` and `ItemResponse` DTOs in `backend/src/Mapi.Application/Items/DTOs/`
- [ ] T066 [US1] Implement `CreateItemCommand` + handler in `backend/src/Mapi.Application/Items/Commands/CreateItemCommand.cs`
- [ ] T067 [US1] Implement `UpdateItemCommand` + handler in `backend/src/Mapi.Application/Items/Commands/UpdateItemCommand.cs`
- [ ] T068 [US1] Implement `DeleteItemCommand` + handler in `backend/src/Mapi.Application/Items/Commands/DeleteItemCommand.cs`
- [ ] T069 [US1] Implement `GetItemsQuery` + handler in `backend/src/Mapi.Application/Items/Queries/GetItemsQuery.cs`
- [ ] T070 [US1] Implement `GetItemByIdQuery` + handler in `backend/src/Mapi.Application/Items/Queries/GetItemByIdQuery.cs`
- [ ] T071 [US1] Create FluentValidation validators for all Item commands/queries in `backend/src/Mapi.Application/Items/Validators/`
- [ ] T072 [US1] Create `ItemsEndpoints` (GET `/api/v1/items`, GET `/api/v1/items/{id}`, POST, PUT, DELETE) with `.RequireAuthorization()`, `.WithTags("Items")`, response type annotations in `backend/src/Mapi.API/Endpoints/ItemsEndpoints.cs`
- [ ] T073 [US1] Add and apply EF migration `AddItemsTable` — run `dotnet ef migrations add AddItemsTable`
- [X] T074 [US1] Implement `ItemsStepDefinitions` for Items.feature in `backend/tests/Mapi.API.IntegrationTests/StepDefinitions/ItemsStepDefinitions.cs`
- [ ] T075 [US1] Create items NgRx store (models, loadItems/createItem/updateItem/deleteItem actions + reducers + effects + api service hitting `/api/v1/items`) in `frontend/src/app/items/store/`
- [ ] T076 [US1] Create `item-list` presentational component (displays item rows, emits edit/delete events) in `frontend/src/app/items/components/item-list/item-list.component.{ts,html,scss}`
- [ ] T077 [US1] Create `item-form` presentational component (Reactive Form: ItemName, BisayaName, Price; supports add and edit mode) in `frontend/src/app/items/components/item-form/item-form.component.{ts,html,scss}`
- [ ] T078 [US1] Create `items` smart component (selects store via `toSignal`, dispatches actions, composes item-list + item-form) in `frontend/src/app/items/items.component.{ts,html,scss}`
- [ ] T079 [US1] Create `items.routes.ts` and register as lazy-loaded route in `frontend/src/app/app.routes.ts`

**Checkpoint**: User can log in, add/edit/delete items via the dashboard, and data isolation between users is verified by integration tests.

---

## Phase 4: User Story 2 – Voice Price Query (Priority: P2)

**Goal**: A persistent mic icon on every screen captures voice queries (e.g., "How much is Gatas?") and returns a spoken price response. Matches on both ItemName and BisayaName. Handles ambiguous matches.

**Independent Test**: Add at least one item → click the mic icon on any screen → say "How much is Gatas?" → hear the correct price spoken back.

### Tests for User Story 2 (write first — must FAIL before implementation)

- [X] T080 Write Gherkin voice query scenarios (exact match, BisayaName match, not found, ambiguous) in `backend/tests/Mapi.API.IntegrationTests/Features/Voice.feature`
- [X] T081 [P] [US2] Write xUnit tests for `ProcessVoiceCommandHandler` (dispatches to ICommandService, returns result) in `backend/tests/Mapi.Application.Tests/Voice/ProcessVoiceCommandHandlerTests.cs`
- [X] T082 [P] [US2] Write xUnit tests for `CommandService` query logic (exact match, BisayaName match, no match, ambiguous multi-match) in `backend/tests/Mapi.Application.Tests/Voice/CommandServiceQueryTests.cs`
- [X] T083 [P] [US2] Write Jest tests for `SpeechRecognitionService` (feature detection, start/stop listening, transcript$ stream, unsupported browser signal) in `frontend/src/app/shared/services/speech-recognition.service.spec.ts`
- [X] T084 [P] [US2] Write Jest tests for `SpeechSynthesisService` (speak method, queue behavior) in `frontend/src/app/shared/services/speech-synthesis.service.spec.ts`
- [ ] T085 [P] [US2] Write Jest tests for `mic-icon` component (enabled state, disabled state when browser unsupported, click event) in `frontend/src/app/shared/components/mic-icon/mic-icon.component.spec.ts`
- [X] T086 [P] [US2] Write Jest tests for voice NgRx store (listening state, transcript, command result, spoken response) in `frontend/src/app/voice/store/`

### Implementation for User Story 2

- [ ] T087 [P] [US2] Create `VoiceCommandRequest` and `VoiceCommandResult` DTOs (ResponseText, IsAmbiguous, IsConfirmationRequired, MatchedNames) in `backend/src/Mapi.Application/Voice/DTOs/`
- [ ] T088 [US2] Implement `CommandService` (implements `ICommandService`) — query pattern `^how much is (?<name>.+)\??$`, case-insensitive ItemName/BisayaName search, ambiguity detection — in `backend/src/Mapi.Infrastructure/Services/CommandService.cs`
- [ ] T089 [US2] Implement `ProcessVoiceCommand` + handler (invokes `ICommandService.ExecuteAsync`, never calls repos directly) in `backend/src/Mapi.Application/Voice/Commands/ProcessVoiceCommand.cs`
- [ ] T090 [US2] Create `ProcessVoiceCommandValidator` (transcript not empty) in `backend/src/Mapi.Application/Voice/Validators/ProcessVoiceCommandValidator.cs`
- [ ] T091 [US2] Create `VoiceEndpoints` (POST `/api/v1/voice/command`) with `.RequireAuthorization()`, `.WithTags("Voice")` in `backend/src/Mapi.API/Endpoints/VoiceEndpoints.cs`
- [X] T092 [US2] Implement voice query Reqnroll step definitions in `backend/tests/Mapi.API.IntegrationTests/StepDefinitions/VoiceStepDefinitions.cs`
- [ ] T093 [P] [US2] Create `SpeechRecognitionService` — wraps `SpeechRecognition`/`webkitSpeechRecognition`, exposes `transcript$` Observable and `isListening` signal, handles unsupported-browser detection — in `frontend/src/app/shared/services/speech-recognition.service.ts`
- [ ] T094 [P] [US2] Create `SpeechSynthesisService` — wraps `window.speechSynthesis.speak()`, exposes `speak(text: string)` method — in `frontend/src/app/shared/services/speech-synthesis.service.ts`
- [ ] T095 [US2] Create `mic-icon` shared component (OnPush; shows active/inactive/disabled states; accessible aria-label; hidden when speech unsupported) in `frontend/src/app/shared/components/mic-icon/mic-icon.component.{ts,html,scss}`
- [ ] T096 [US2] Create voice NgRx store (isListening signal, transcript, commandResult, sendCommand effect calling `/api/v1/voice/command`, spoken-response effect calling SpeechSynthesisService) in `frontend/src/app/voice/store/`
- [ ] T097 [US2] Wire `mic-icon` into `app.component.html`; connect `SpeechRecognitionService` transcript to voice store dispatch in `frontend/src/app/app.component.ts`

**Checkpoint**: Mic icon visible on all screens; speaking "How much is Gatas?" returns a spoken price; ambiguous queries prompt a clarification message.

---

## Phase 5: User Story 3 – Voice Item Addition (Priority: P3)

**Goal**: Users can add items via voice ("Add Gatas price 50"). If the item already exists, the system prompts for confirmation before updating the price.

**Independent Test**: Speak "Add Gatas price 50" → item appears in the item list. Then speak the same command again → receive a confirmation prompt → confirm → item's price is updated.

### Tests for User Story 3 (write first — must FAIL before implementation)

- [X] T098 [P] [US3] Write xUnit tests for `CommandService` add logic (new item, duplicate triggers confirmation, malformed command returns error) in `backend/tests/Mapi.Application.Tests/Voice/CommandServiceAddTests.cs`
- [X] T099 [P] [US3] Write xUnit tests for `ConfirmVoiceAddCommandHandler` (item updated, not-found) in `backend/tests/Mapi.Application.Tests/Voice/ConfirmVoiceAddCommandHandlerTests.cs`
- [ ] T100 [P] [US3] Write Jest tests for `confirmation-dialog` component (displays message, confirm/cancel events) in `frontend/src/app/shared/components/confirmation-dialog/confirmation-dialog.component.spec.ts`

### Implementation for User Story 3

- [ ] T101 [US3] Extend `CommandService` with Add pattern (`^add (?<name>.+) price (?<price>\d+(\.\d+)?)$`) — new item path calls `CreateItemCommand`, duplicate path returns `IsConfirmationRequired = true` — in `backend/src/Mapi.Infrastructure/Services/CommandService.cs`
- [ ] T102 [US3] Implement `ConfirmVoiceAddCommand` + handler (updates existing item's price) + `ConfirmVoiceAddCommandValidator` in `backend/src/Mapi.Application/Voice/Commands/ConfirmVoiceAddCommand.cs`
- [ ] T103 [US3] Add POST `/api/v1/voice/confirm-add` endpoint to `VoiceEndpoints` in `backend/src/Mapi.API/Endpoints/VoiceEndpoints.cs`
- [X] T104 [US3] Add voice add + confirmation Gherkin scenarios to `Voice.feature` and implement step definitions in `backend/tests/Mapi.API.IntegrationTests/`
- [ ] T105 [US3] Create `confirmation-dialog` shared component (displays message string, emits confirm/cancel; OnPush) in `frontend/src/app/shared/components/confirmation-dialog/confirmation-dialog.component.{ts,html,scss}`
- [ ] T106 [US3] Extend voice NgRx store with add-confirmation state (`isConfirmationRequired`, `pendingItem`, `confirmAdd` action + effect calling `/api/v1/voice/confirm-add`) in `frontend/src/app/voice/store/`
- [ ] T107 [US3] Wire `confirmation-dialog` into `app.component.html` — show when `isConfirmationRequired` is true; dispatch `confirmAdd` or dismiss on user choice — in `frontend/src/app/app.component.ts`

**Checkpoint**: Voice "Add" command creates new items; duplicate voice-add triggers a spoken + visual confirmation prompt; confirmed updates are reflected immediately in the item list.

---

## Phase 6: User Story 4 – Trigger & Action Logic Management (Priority: P4)

**Goal**: Users can define custom trigger phrases and link them to one or more typed actions (Query, Add, Update, Remove) with response templates. Speaking a trigger phrase executes all linked actions in order.

**Independent Test**: Create trigger "What's the price of" → link a Query action → speak "What's the price of Gatas" → receive the correct spoken price via the action's response template.

### Tests for User Story 4 (write first — must FAIL before implementation)

- [X] T108 Write Gherkin scenarios for Trigger + Action CRUD and trigger invocation in `backend/tests/Mapi.API.IntegrationTests/Features/Triggers.feature`
- [X] T109 [P] [US4] Write xUnit tests for Trigger CRUD command handlers in `backend/tests/Mapi.Application.Tests/Triggers/`
- [X] T110 [P] [US4] Write xUnit tests for Action CRUD command handlers in `backend/tests/Mapi.Application.Tests/Actions/`
- [X] T111 [P] [US4] Write xUnit tests for `CommandService` trigger matching logic (phrase prefix match, multi-action execution in SortOrder, no-match fallback) in `backend/tests/Mapi.Application.Tests/Voice/CommandServiceTriggerTests.cs`
- [X] T112 [P] [US4] Write Jest tests for triggers NgRx store (actions, reducers, effects, selectors) in `frontend/src/app/triggers/store/`
- [X] T113 [P] [US4] Write Jest tests for `trigger-form` and `action-link-form` components in `frontend/src/app/triggers/components/`

### Implementation for User Story 4

- [ ] T114 [P] [US4] Create `Trigger` entity (UserId FK, Phrase) in `backend/src/Mapi.Domain/Entities/Trigger.cs`
- [ ] T115 [P] [US4] Create `Action` entity (UserId FK, ActionType enum, ResponseTemplate) + `ActionType` enum in `backend/src/Mapi.Domain/Entities/Action.cs` and `backend/src/Mapi.Domain/Enums/ActionType.cs`
- [ ] T116 [US4] Create `TriggerActionMap` entity (TriggerId FK, ActionId FK, SortOrder; unique composite index) in `backend/src/Mapi.Domain/Entities/TriggerActionMap.cs`
- [ ] T117 [P] [US4] Create `ITriggerRepository` and `IActionRepository` interfaces in `backend/src/Mapi.Domain/Interfaces/`
- [ ] T118 [US4] Create `TriggerConfiguration`, `ActionConfiguration`, `TriggerActionMapConfiguration` in `backend/src/Mapi.Infrastructure/Persistence/Configurations/`
- [ ] T119 [US4] Implement `TriggerRepository`, `ActionRepository`, `TriggerActionMapRepository` in `backend/src/Mapi.Infrastructure/Persistence/Repositories/`
- [ ] T120 [US4] Add `Triggers`, `Actions`, `TriggerActionMaps` DbSets and global query filters to `ApplicationDbContext` in `backend/src/Mapi.Infrastructure/Persistence/ApplicationDbContext.cs`
- [ ] T121 [US4] Implement Trigger CRUD commands/queries + DTOs + validators in `backend/src/Mapi.Application/Triggers/`
- [ ] T122 [US4] Implement Action CRUD commands/queries + DTOs + validators in `backend/src/Mapi.Application/Actions/`
- [ ] T123 [US4] Implement `LinkActionCommand` + `UnlinkActionCommand` + handlers + validators in `backend/src/Mapi.Application/Triggers/Commands/`
- [ ] T124 [US4] Create `TriggersEndpoints` (GET/POST/PUT/DELETE trigger; POST/DELETE trigger actions link) in `backend/src/Mapi.API/Endpoints/TriggersEndpoints.cs`
- [ ] T125 [US4] Create `ActionsEndpoints` (GET/POST/PUT/DELETE; 409 Conflict on delete if linked) in `backend/src/Mapi.API/Endpoints/ActionsEndpoints.cs`
- [ ] T126 [US4] Extend `CommandService` with trigger-first matching (case-insensitive prefix match against user's Triggers; execute linked Actions in SortOrder; resolve response template `{name}` / `{price}` placeholders) in `backend/src/Mapi.Infrastructure/Services/CommandService.cs`
- [ ] T127 [US4] Add and apply EF migration `AddTriggersActionsAndMaps` — run `dotnet ef migrations add AddTriggersActionsAndMaps`
- [X] T128 [US4] Implement `TriggersStepDefinitions` for Triggers.feature in `backend/tests/Mapi.API.IntegrationTests/StepDefinitions/TriggersStepDefinitions.cs`
- [X] T129 [US4] Create triggers NgRx store (models, loadTriggers/createTrigger/deleteTrigger/linkAction/unlinkAction actions + reducers + effects + api service) in `frontend/src/app/triggers/store/`
- [X] T130 [US4] Create `trigger-form` component (Reactive Form: Phrase field) in `frontend/src/app/triggers/components/trigger-form/trigger-form.component.{ts,html,scss}`
- [X] T131 [US4] Create `action-link-form` component (select actionId from user's actions, set sortOrder) in `frontend/src/app/triggers/components/action-link-form/action-link-form.component.{ts,html,scss}`
- [X] T132 [US4] Create `triggers` smart component (lists triggers with linked actions; compose trigger-form + action-link-form) in `frontend/src/app/triggers/triggers.component.{ts,html,scss}`
- [ ] T133 [US4] Create `triggers.routes.ts` and register as lazy-loaded route in `frontend/src/app/app.routes.ts`

**Checkpoint**: User can create a trigger "What's the price of", link a Query action, speak the phrase, and hear the action's response template filled with the item's price.

---

## Phase 7: User Story 5 – Alexa Voice Integration (Priority: P5)

**Goal**: Users with a linked Alexa account can speak Mapi commands through an Alexa device. The same `ICommandService` resolves the request and Alexa speaks the response.

**Independent Test**: Send a simulated `SkillRequest` (PriceQueryIntent) to `POST /alexa/skill` with a known AlexaUserId linked to a test user that has items → verify the correct price is returned in the `SkillResponse`.

### Tests for User Story 5 (write first — must FAIL before implementation)

- [X] T134 Write Gherkin Alexa scenarios (linked user price query, linked user item add, unlinked user error) in `backend/tests/Mapi.API.IntegrationTests/Features/Alexa.feature`
- [X] T135 [P] [US5] Write xUnit tests for `AlexaController` (intent routing, AlexaUserId resolution, IMediator dispatch, unlinked user response) in `backend/tests/Mapi.API.IntegrationTests/StepDefinitions/AlexaStepDefinitions.cs`

### Implementation for User Story 5

- [ ] T136 [US5] Add `FindByAlexaUserIdAsync` implementation to `UserRepository` in `backend/src/Mapi.Infrastructure/Persistence/Repositories/UserRepository.cs`
- [ ] T137 [US5] Install `Alexa.NET` NuGet package in `Mapi.API.csproj`
- [ ] T138 [US5] Implement `AlexaController` (POST `/alexa/skill`) — extract `session.user.userId` → resolve `User` by `AlexaUserId` → extract slot value → dispatch `ProcessVoiceCommand` via `IMediator` → return `SkillResponse` with `PlainTextOutputSpeech` — in `backend/src/Mapi.API/Controllers/AlexaController.cs`
- [X] T139 [US5] Implement `AlexaRequestVerificationService` (stub for development; real `RequestVerification.Verify()` call for production) in `backend/src/Mapi.Infrastructure/Services/AlexaRequestVerificationService.cs`
- [ ] T140 [US5] Register `AddControllers()` and `MapControllers()` in `backend/src/Mapi.API/Program.cs` alongside existing Minimal API endpoint mapping
- [X] T141 [US5] Implement Reqnroll step definitions for Alexa.feature using simulated `SkillRequest` payloads in `backend/tests/Mapi.API.IntegrationTests/StepDefinitions/AlexaStepDefinitions.cs`

**Checkpoint**: Simulated Alexa skill requests return correct spoken responses via `AlexaController`; unlinked users receive a clear error message; same `ICommandService` resolves both web and Alexa commands.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Hardening, observability, and developer experience improvements across all stories.

- [ ] T142 [P] Add `.WithSummary()`, `.WithDescription()`, `.Produces<T>()`, `.ProducesProblem()`, `.WithTags()` annotations to all Minimal API endpoints in `backend/src/Mapi.API/Endpoints/`
- [ ] T143 [P] Add `app.UseSerilogRequestLogging()` and verify structured request/response log output in `backend/src/Mapi.API/Program.cs`
- [ ] T144 [P] Configure CORS policy to allow Angular dev origin (`http://localhost:4200`) in `backend/src/Mapi.API/Program.cs`
- [ ] T145 [P] Add Swagger JWT Bearer auth scheme registration so protected endpoints can be tested via Swagger UI in `backend/src/Mapi.API/Program.cs`
- [ ] T146 [P] Verify SC-008: admin dashboard (items, triggers pages) is fully usable on mobile, tablet, desktop — fix any SCSS layout issues in `frontend/src/app/items/` and `frontend/src/app/triggers/`
- [ ] T147 [P] Add keyboard accessibility to `mic-icon` (Enter/Space to activate) and verify `aria-label` is present in `frontend/src/app/shared/components/mic-icon/mic-icon.component.ts`
- [ ] T148 Validate all quickstart.md steps end-to-end: backend starts, migration applied, frontend connects, voice query returns spoken result

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3–7 (User Stories)**: All depend on Phase 2 completion; can proceed in priority order or in parallel if staffed
- **Phase 8 (Polish)**: Depends on all desired user stories being complete

### User Story Dependencies

| Story | Depends On | Reason |
|-------|-----------|--------|
| US1 (P1) | Phase 2 only | Foundational auth + Item entity required |
| US2 (P2) | Phase 2 + US1 | Items must exist for voice queries to return results |
| US3 (P3) | Phase 2 + US1 + US2 | Add command extends the voice pipeline; duplicate detection uses Item entity |
| US4 (P4) | Phase 2 + US1 | Triggers match against Item names; Actions extend voice processing |
| US5 (P5) | Phase 2 + US2 + US4 | Alexa uses the same CommandService that US2/US4 built |

### Within Each User Story

1. Tests written first → verify they FAIL
2. Domain entities → Application DTOs & interfaces → Infrastructure implementations
3. Application commands/queries → API endpoints
4. Backend integration tests pass
5. Frontend store → presentational components → smart component → routing

### Parallel Opportunities

- All `[P]` tasks within a phase can run simultaneously
- Within Foundational: domain interfaces (T015–T018) can be written in parallel; infrastructure implementations follow sequentially
- Within US1: all test tasks (T052–T059) can run in parallel; backend and frontend implementation can proceed in parallel once tests are written
- Within US2–US5: same pattern — parallel tests, parallel implementation across stack

---

## Parallel Example: User Story 1

```
# Write all tests in parallel:
T052 CreateItemCommandHandlerTests     T053 UpdateItemCommandHandlerTests
T054 DeleteItemCommandHandlerTests     T055 GetItemsQueryHandlerTests
T056 Items NgRx store tests            T057 item-list component tests
T058 item-form component tests         T059 items smart component tests

# Then build entities in parallel:
T060 Item entity                       T061 IItemRepository interface

# Then sequentially:
T062 ItemConfiguration → T063 ItemRepository → T064 ApplicationDbContext update
T065 DTOs → T066–T071 Commands/Queries/Validators → T072 ItemsEndpoints → T073 Migration
T075 NgRx store → T076 item-list → T077 item-form → T078 items component → T079 routing
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Log in, add/edit/delete items, verify data isolation
5. Demo or deploy

### Incremental Delivery

1. Setup + Foundational → auth works, Angular shell loads
2. + US1 → item management dashboard works (MVP)
3. + US2 → voice price queries work with mic icon
4. + US3 → voice item addition + confirmation flow works
5. + US4 → custom trigger phrases work
6. + US5 → Alexa integration works
7. Polish → production-ready

### Parallel Team Strategy

With multiple developers (post-Foundational):
- Developer A: US1 (item management)
- Developer B: US2 + US3 (voice pipeline)
- Developer C: US4 (triggers/actions)
- Developer D: US5 (Alexa)

---

## Notes

- `[P]` tasks operate on different files with no incomplete-task dependencies
- `[Story]` label maps each task to a user story for traceability
- Each user story is independently completable and independently testable
- TDD is mandatory per both constitutions — every test must FAIL before implementation begins
- Commit after each logical task group or checkpoint
- Stop at any checkpoint to validate the story independently before proceeding
