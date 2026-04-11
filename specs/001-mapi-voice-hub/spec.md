# Feature Specification: Mapi – Smart Voice & Storage Hub

**Feature Branch**: `001-mapi-voice-hub`  
**Created**: 2026-04-11  
**Status**: Draft  
**Input**: User description: "Master Specification: Mapi – Smart Voice & Storage Hub"

## User Scenarios & Testing *(mandatory)*

### User Story 0 – Landing Page & Route Guards (Priority: P0)

A public-facing landing page greets unauthenticated visitors at the root path (`/`), explaining Mapi's features and providing direct links to sign in or create an account. Authenticated users are automatically redirected away from the landing and auth pages. Unauthenticated users attempting to access protected pages are redirected to the login page.

**Why this priority**: Route guards establish the security boundary between public and protected areas of the app. Without them, unauthenticated users can access the dashboard, and authenticated users land on the sign-in page unnecessarily.

**Independent Test**: Can be tested without any items or voice setup — open the app as a guest and verify the landing page loads; sign in and verify automatic redirect to items; try accessing `/items` while logged out and verify redirect to login.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user visits the root path (`/`), **When** the page loads, **Then** the landing page is displayed with links to sign in and create an account.
2. **Given** an authenticated user visits the root path (`/`) or any `/auth` route, **When** the guard evaluates, **Then** the user is automatically redirected to `/items`.
3. **Given** an unauthenticated user attempts to navigate to `/items` or `/triggers`, **When** the guard evaluates, **Then** the user is redirected to `/auth/login`.
4. **Given** an unauthenticated user on the landing page, **When** they click "Sign In", **Then** they are taken to the login page.
5. **Given** an unauthenticated user on the landing page, **When** they click "Create Account", **Then** they are taken to the registration page.

---

### User Story 1 – Manual Item Management (Priority: P1)

A registered user can create, view, update, and delete items from a standard admin dashboard. Each item has an English name (ItemName), a Bisaya name (BisayaName), and a price. All CRUD operations are performed through a data-entry form — voice is not required for this flow.

**Why this priority**: This is the foundational data layer. Without items in the system, voice commands have nothing to act on. It also serves users who prefer or require manual data entry.

**Independent Test**: Can be fully tested by logging in and using the item management form; voice and Alexa integrations are not needed.

**Acceptance Scenarios**:

1. **Given** a logged-in user on the Items page, **When** they submit the "Add Item" form with a valid ItemName, BisayaName, and Price, **Then** the new item appears in their item list and is associated only with their account.
2. **Given** a logged-in user viewing their item list, **When** they edit an item and submit the form, **Then** the item reflects the updated values immediately.
3. **Given** a logged-in user, **When** they delete an item, **Then** the item is permanently removed from their list and no longer retrievable.
4. **Given** two separate users each have an item named "Gatas", **When** either user views their item list, **Then** they see only their own items — never the other user's.

---

### User Story 2 – Voice Price Query (Priority: P2)

A logged-in user can speak a query (e.g., "How much is Gatas?") using the persistent microphone icon available on every screen. The system returns the price of the matching item by searching across both the English and Bisaya names.

**Why this priority**: Voice querying is the primary differentiator of Mapi. It delivers immediate value once items exist in the system.

**Independent Test**: Can be fully tested by adding at least one item and using the mic icon on any screen to ask for its price by either name.

**Acceptance Scenarios**:

1. **Given** an item "Gatas" (BisayaName) / "Milk" (ItemName) exists for the user, **When** the user says "How much is Gatas?", **Then** the system responds with the correct price.
2. **Given** the same item, **When** the user says "How much is Milk?", **Then** the system responds with the same correct price.
3. **Given** the user asks for an item that does not exist in their account, **When** the query is processed, **Then** the system responds that the item was not found.
4. **Given** the microphone icon is visible on any screen, **When** the user activates it, **Then** the system begins listening and processes the spoken input.

---

### User Story 3 – Voice Item Addition (Priority: P3)

A logged-in user can add a new item by speaking a command (e.g., "Add Gatas price 50"). The system stores the spoken product name as both the ItemName and the BisayaName, allowing users to query it by that name in either language field.

**Why this priority**: Voice-driven addition extends the voice interface beyond read-only use, reducing friction for users who prefer hands-free data entry.

**Independent Test**: Can be fully tested by speaking an "Add" command and then querying the newly added item by name.

**Acceptance Scenarios**:

1. **Given** a logged-in user speaks "Add Gatas price 50", **When** the command is processed, **Then** a new item is created with both ItemName and BisayaName set to "Gatas" and Price set to 50.
2. **Given** the same item was added via voice, **When** the user opens the manual item list, **Then** the item appears in the list with the correct values.
3. **Given** a malformed voice command (e.g., "Add price"), **When** the command is processed, **Then** the system responds with a helpful error message without creating a record.

---

### User Story 4 – Trigger & Action Logic Management (Priority: P4)

A logged-in user can define custom voice trigger phrases and link them to one or more actions (Query, Add, Update, Remove) with configurable response templates. A trigger can map to multiple actions (many-to-many).

**Why this priority**: This enables extensibility beyond hardcoded commands, allowing users to define personalized voice workflows.

**Independent Test**: Can be fully tested by creating a trigger phrase, linking it to an action, and verifying that speaking that phrase executes the linked action.

**Acceptance Scenarios**:

1. **Given** a user creates a trigger phrase "What's the price of", **When** they link it to a "Query" action with a response template, **Then** speaking that phrase triggers a price lookup.
2. **Given** a trigger is linked to multiple actions, **When** the trigger phrase is spoken, **Then** all linked actions are executed in sequence.
3. **Given** a user deletes a trigger, **When** that phrase is spoken, **Then** the system does not recognize it as a command.

---

### User Story 5 – Alexa Voice Integration (Priority: P5)

A registered user with a linked Alexa account can speak Mapi commands through an Alexa device. The system processes Alexa skill requests and returns spoken responses via the same command engine used by the web interface.

**Why this priority**: Alexa integration expands the voice interface to smart home devices, extending Mapi's reach beyond the browser.

**Independent Test**: Can be tested independently by sending a simulated Alexa skill request to the backend and verifying the correct spoken response is returned.

**Acceptance Scenarios**:

1. **Given** a user's Alexa identity is linked to their Mapi account, **When** they ask Alexa for an item's price, **Then** Alexa responds with the correct price from the user's item list.
2. **Given** the Alexa request includes a recognized intent, **When** processed, **Then** the same command engine used by the web voice interface resolves the request and the same spoken response template patterns defined in FR-007 are used across both surfaces.
3. **Given** a voice-add command via Alexa names an item that already exists, **When** the command is processed, **Then** Alexa keeps the session open and asks "Gatas already exists at 50. Do you want to update it?". If the user says "Yes" (via `ConfirmAddIntent`), the item is updated. If the user says "No", no change is made and the session ends.

---

### Edge Cases

- When a voice query matches multiple items by name, the system responds with an ambiguity message listing the matched item names and prompts the user to clarify (e.g., "Found 2 items named Gatas. Please specify which one.").
- What happens when the browser does not support speech recognition — is the mic icon disabled with a message?
- What happens when a user's spoken price contains non-numeric characters?
- When a trigger phrase is a prefix of another trigger phrase and both match the spoken input, the system uses longest match wins — the trigger phrase that matches the most of the spoken input is selected.
- When two actions linked to the same trigger share the same `SortOrder` value, execution order falls back to insertion order (the action linked first executes first). No error is raised.
- When an Action is deleted, all associated `TriggerActionMap` entries are cascade-deleted. The linked Trigger remains intact with its remaining actions.
- When `ItemName` and `BisayaName` are identical and a voice query matches that name, the system returns a single result. The ambiguity flow is only triggered when multiple distinct items match the spoken name.
- User-defined trigger phrases always take precedence over built-in command patterns. Built-in patterns are used as fallback only when no user-defined trigger matches the spoken input.
- When a voice-add command names an item that already exists in the user's account, the system responds with a spoken and visual confirmation prompt using the template: *"{name} already exists at {price} pesos. Do you want to update it?"* The visual prompt displays "Yes" and "No" buttons. If the user confirms, the existing item's price is updated. If the user declines or does not respond within 10 seconds, the prompt is dismissed, no change is made, and the mic resets to idle.
- What happens when an Alexa request is received for an unlinked or unknown Alexa user identity?
- When an incoming Alexa request matches multiple Mapi accounts sharing the same `AlexaUserId`, the system resolves to the most recently created account.
- Alexa session management: `shouldEndSession` is set to `true` after any completed response (successful query, add, update, or error). `shouldEndSession` is set to `false` only when the session is awaiting user confirmation (duplicate add flow).
- When the Mapi backend is unavailable, Alexa responds with a spoken error — "Mapi is currently unavailable. Please try again later." — and ends the session. Silent failure is not permitted.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST enforce data isolation per user — no user can access, view, or modify another user's items, triggers, or actions. Isolation MUST be enforced via a global query filter at the data access layer applied to all queries for Item, Trigger, Action, and TriggerActionMap. Individual endpoints MUST NOT implement their own data filtering.
- **FR-002**: System MUST allow users to create, read, update, and delete items through a manual form interface, with ItemName, BisayaName, and Price as distinct, required fields.
- **FR-003**: System MUST provide a persistent voice activation control (microphone icon) visible and accessible on every screen of the application. The mic button MUST be fixed at the bottom-center of the screen, floating above content at all scroll positions. Minimum size: 48×48px to meet touch target guidelines. The mic button MUST display three distinct visual states: idle (default mic icon, no animation), listening (pulsing/ripple animation while capturing audio), and processing (spinner replaces mic icon while the command is being resolved).
- **FR-004**: System MUST accept spoken input and process it as a command for the authenticated user.
- **FR-005**: System MUST search items by both ItemName and BisayaName when resolving voice queries for price. Name matching MUST be case-insensitive for both fields.
- **FR-006**: System MUST map a voice-added item's spoken name to both ItemName and BisayaName fields simultaneously.
- **FR-007**: System MUST synthesize and play back a spoken response to the user after processing a voice command. Prices in spoken responses are formatted as *"{price} pesos"* — no decimal places for whole numbers (e.g., "50 pesos"), up to 2 decimal places when needed (e.g., "50.50 pesos"). Response template patterns are as follows:
  - Item found: *"{name} costs {price} pesos."*
  - Item not found: *"I couldn't find {name}."*
  - Ambiguous match: *"Found {count} items matching {name}: {list of matched names}. Please specify which one."*
  - Add success: *"{name} has been added at {price} pesos."*
  - Add duplicate: *"{name} already exists at {price} pesos. Do you want to update it?"*
  - Malformed command: *"Sorry, I didn't understand that. Please try again."*
- **FR-008**: System MUST allow users to define custom trigger phrases and link them to one or more actions (many-to-many relationship).
- **FR-009**: System MUST support action types: Query, Add, Update, and Remove.
- **FR-010**: System MUST accept and process voice requests from Alexa devices via a dedicated integration endpoint. The endpoint MUST verify Alexa request signatures on every incoming request in production and reject any request that fails signature verification. Signature verification MUST be bypassable in non-production environments via an environment variable flag to support local development and testing. The Alexa skill invocation name MUST be "Mapi".
- **FR-011**: System MUST authenticate users and protect all data operations behind authenticated sessions.
- **FR-012**: System MUST allow a user account to be linked to an Alexa user identity for Alexa skill requests. Linking is performed manually via a settings page in the Mapi web app where the user enters their `AlexaUserId`. The same `AlexaUserId` may be linked to multiple Mapi accounts to support account recovery scenarios. OAuth-based Alexa account linking is explicitly out of scope for this version.
- **FR-013**: System MUST authenticate users via a custom `User` table (fields: `Id`, `Email`, `PasswordHash`, `AlexaUserId`, `StoreName`). Authentication tokens MUST be issued as JWTs using email and password credentials. Social login providers (Google, Facebook) are explicitly excluded. JWT access tokens expire after 1 hour. A refresh token valid for 7 days is issued alongside the access token and stored in an HTTP-only cookie. When an access token expires mid-session, the system silently issues a new one using the refresh token. After 7 days of inactivity the user must log in again. Password MUST meet the following minimum requirements: at least 8 characters, at least one uppercase letter, and at least one number.
- **FR-014**: System MUST capture a `StoreName` for each user account at registration. `StoreName` is a required field representing the name of the user's store and MUST be stored on the `User` record. `StoreName` MUST be displayed in the dashboard header so the user knows which store they are managing. It does not appear in voice or Alexa responses.
- **FR-015**: System MUST display a public landing page at the root route (`/`). The landing page MUST contain: a hero section (app name, tagline, description, Sign In and Create Account CTAs), a features grid (Voice Queries, Bilingual Items, Custom Triggers, Alexa Integration), and a footer call-to-action section with a "Create Account" link and a "Sign in" inline link. The landing page is a guest-only route.
- **FR-016**: System MUST protect the `/items` and `/triggers` routes with an authentication guard (`authGuard`) that redirects unauthenticated users to `/auth/login`.
- **FR-017**: System MUST protect the root (`/`) and `/auth` routes with a guest guard (`guestGuard`) that redirects authenticated users to `/items`. The wildcard route (`**`) MUST redirect to the root path (`''`).

### Key Entities

- **User**: Represents a registered account stored in a custom `User` table. Fields: `Id` (unique identifier), `Email` (unique, required), `PasswordHash` (required), `AlexaUserId` (nullable, for Alexa account linking), `StoreName` (required, the name of the user's store). Authentication is email/password with JWT tokens. All other entities belong to a User.
- **Item**: A product or good tracked by the user. Has an English name (ItemName), a Bisaya name (BisayaName), and a price. Both name fields are searchable by voice commands.
- **Trigger**: A voice phrase defined by the user that the system listens for (e.g., "How much is", "Add"). The `Phrase` field has a maximum length of 200 characters.
- **Action**: A system operation (Query, Add, Update, Remove) with a configurable response template. Belongs to a user. The `ResponseTemplate` field has a maximum length of 500 characters.
- **TriggerActionMap**: A many-to-many relationship linking one Trigger to one or more Actions, defining what the system does when a trigger phrase is spoken.
- **ResponseTemplate placeholder rules**: Supported placeholders are `{name}` and `{price}`. Unrecognized placeholders (e.g., `{foo}`) are left as-is in the spoken response. If a supported placeholder's value is missing at runtime, it is replaced with "unknown". No errors are thrown in either case.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can add an item manually in under 60 seconds from opening the form to seeing it in their item list.
- **SC-002**: A voice price query for an existing item begins playing a spoken result within 3 seconds of the user finishing speaking. The 3-second window covers server processing time only — speech synthesis playback duration is excluded.
- **SC-003**: For every item in a user's account, querying by either its exact `ItemName` or exact `BisayaName` (case-insensitive) MUST return that item. A test pass requires a correct result for 100% of items tested. Fuzzy or partial matching is not included in this criterion — exact name match only.
- **SC-004**: The microphone icon is reachable within 1 interaction (click or tap) from any screen in the application.
- **SC-005**: Items belonging to one user are never returned in queries made by a different user's session — verified across 100% of tested scenarios.
- **SC-006**: For every recognized Alexa intent, the correct spoken response MUST be returned in 100% of tested scenarios. A test pass requires a correct result for 100% of intents tested.
- **SC-007**: A user can create a trigger, link it to an action, and successfully invoke it via voice within a single session.
- **SC-008**: The admin dashboard is fully usable at the following breakpoints without horizontal scrolling or overlapping elements: mobile (375px and above), tablet (768px and above), and desktop (1280px and above). A test pass requires no horizontal scrolling and no overlapping elements at each of these widths.
- **SC-009**: An unauthenticated user visiting the root path (`/`) sees the landing page without being redirected. An authenticated user visiting `/` or any `/auth` route is immediately redirected to `/items` within a single Angular navigation cycle.

### Non-Functional Requirements

- **NFR-001 (Account Deletion)**: When a user account is deleted, all associated data — items, triggers, actions, and trigger-action maps — MUST be hard-deleted immediately via cascade delete. No soft-delete or data retention is applied.
- **NFR-002 (Sensitive Data Logging)**: Passwords, JWT tokens (access and refresh), and `AlexaUserId` values MUST never appear in application logs under any circumstances.
- **NFR-003 (Voice Endpoint Availability)**: When the voice command engine is unavailable, the system MUST respond with a spoken and visual error — "Something went wrong. Please try again." — and reset the mic to idle. No degraded mode or fallback behavior is required.
- **NFR-004 (Scalability Bounds)**: Per user account, the system MUST enforce the following limits: 500 items, 100 triggers, and 100 actions. Attempts to exceed these limits MUST be rejected with a clear error message.
- **NFR-005 (Rate Limiting — Login)**: The login endpoint MUST be rate-limited to 5 failed attempts per IP within a 10-minute window. On breach, the IP is locked out for 15 minutes and the system returns `429 Too Many Requests`.
- **NFR-006 (Rate Limiting — Registration)**: The registration endpoint MUST be rate-limited to 5 requests per IP per day. On breach, further registration attempts from that IP are blocked for the remainder of the day and the system returns `429 Too Many Requests`.
- **NFR-008 (Alexa Certification)**: Full Alexa Skills Kit certification (privacy policy URL, skill description, Amazon testing instructions) is explicitly out of scope for this version. The Alexa integration MUST be functional and testable via the Alexa developer console. Certification submission is a separate future effort.
- **NFR-007 (Keyboard Accessibility)**: The mic icon MUST be implemented as a native `<button>` element, making it keyboard-focusable and activatable via `Enter`/`Space` only when it is the focused element. It MUST NOT intercept keyboard input when focus is inside a text input, textarea, or any form field. Screen readers MUST announce the mic button's current state (idle, listening, processing).

## Assumptions

- The application is a per-account data model: each user manages their own isolated dataset, and data isolation is enforced at the data access layer for all queries.
- Voice input in the browser relies on the browser's built-in speech recognition capability. Supported browsers: Chrome and Edge. On unsupported browsers (Firefox, Safari), the mic button is shown in a disabled state with a tooltip: "Voice input is not supported in this browser."
- Mic timeout behavior is delegated to the browser's built-in speech recognition lifecycle. When the browser fires the `end` event with no result (typically after 5–7 seconds of silence), the mic icon resets to idle. No custom timeout logic is implemented.
- When speech recognition returns an empty, null, or noise-only transcript, the system responds with a spoken message ("Didn't catch that. Please try again.") and resets the mic icon to idle.
- While a voice command is being processed, the mic icon enters a non-interactive processing state (e.g., spinner or animation). Any tap during this state is ignored. The mic resets to idle once the spoken response is delivered.
- Voice-added items default both ItemName and BisayaName to the spoken product name; the user can later edit them individually via the manual form to separate the English and Bisaya values.
- The voice "Add" command parses product name as everything between the keyword "Add" and the keyword "price", and the numeric value following "price" as the price.
- The Alexa integration processes standard Alexa skill request/response payloads; Alexa user identity is stored on the User record and used to resolve the correct account.
- Multi-tenancy is enforced at the data access layer via a per-user filter on all queries — individual endpoints do not implement their own data filtering.
- Web voice endpoints are implemented as Minimal API feature endpoints (e.g., `VoiceEndpoints`). The Alexa integration endpoint is implemented as a traditional MVC controller (`AlexaController`) due to its structured request/response payload requirements. Both surfaces share the same application/domain layer.
- `ICommandService` is an Application layer interface encapsulating voice parsing and resolution logic. Endpoints (Minimal API and `AlexaController`) dispatch MediatR commands only; MediatR handlers invoke `ICommandService` internally. No direct service calls from endpoints.

## Clarifications

### Session 2026-04-11

- Q: Should Mapi use the constitution-standard ASP.NET Core Identity stack (with social providers), or a custom User table with email/password and JWT only? → A: ~~ASP.NET Core Identity with Google as the sole social login provider~~ (revised) Custom `User` table with `Id`, `Email`, `PasswordHash`, `AlexaUserId`, `StoreName`; email/password + JWT only; all social login providers excluded.
- Q: Should the backend use traditional MVC controllers or Minimal API feature endpoints? → A: Minimal API for web voice endpoints; MVC controller (`AlexaController`) for the Alexa interface; both share the same application/domain layer.
- Q: Should `ICommandService` replace MediatR as the dispatch mechanism, or live inside MediatR handlers? → A: `ICommandService` is an Application layer service invoked inside MediatR command handlers; endpoints only dispatch MediatR commands.
- Q: What should the system do when a voice query matches multiple items by name? → A: Respond with an ambiguity message listing matched item names and prompt the user to clarify.
- Q: What should happen when a voice-add command names an item that already exists? → A: Prompt the user to confirm if they want to update the existing item's price; update on confirmation, no change on decline.
