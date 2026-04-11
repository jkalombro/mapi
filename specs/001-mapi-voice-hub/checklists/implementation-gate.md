# Pre-Implementation Gate Checklist: Mapi – Smart Voice & Storage Hub

**Purpose**: Author self-review gate — validate that all requirements are complete, clear, and unambiguous enough to hand to an implementer without follow-up questions. Covers all four risk clusters equally: Voice UX, Security & Auth, Data Model & Command Routing, Alexa Integration.  
**Created**: 2026-04-11  
**Feature**: [spec.md](../spec.md) · [plan.md](../plan.md) · [data-model.md](../data-model.md) · [contracts/](../contracts/)  
**Scope**: All requirement areas · **Depth**: Pre-implementation gate · **Audience**: Author self-review

---

## Voice UX Requirements

- [x] CHK001 Is the visual design of the mic icon (size, position in layout, z-index relative to content) specified beyond "visible and accessible on every screen"? [Clarity, Spec §FR-003] — Fixed bottom-center, floating above content at all scroll positions, minimum 48×48px.
- [x] CHK002 Are spoken response formats defined for every command outcome: item found, item not found, ambiguous match, add success, add duplicate confirmation, add error (malformed command)? [Completeness, Spec §FR-007] — Template patterns defined for all outcomes; ambiguous match lists all matched item names.
- [x] CHK003 Is "begins listening" defined with specific feedback signals — what visual or audio cue indicates the mic is active vs. idle vs. processing? [Clarity, Spec §US2 Acceptance Scenario 4] — Idle: default icon; Listening: pulsing/ripple animation; Processing: spinner replaces icon.
- [x] CHK004 Is the timeout behavior specified when a user activates the mic but does not speak within a given window? [Gap, Edge Case] — Delegated to browser speech recognition lifecycle; mic resets to idle on `end` event with no result.
- [x] CHK005 Are requirements defined for what happens when speech recognition returns an empty, null, or noise-only transcript? [Gap, Edge Case] — Spoken response "Didn't catch that. Please try again." plus mic icon resets to idle.
- [x] CHK006 Is the confirmation flow interaction fully specified — what happens if the user does not respond to "Do you want to update it?" (timeout, dismiss, no-change)? [Completeness, Spec §Edge Cases] — Times out after 10 seconds; prompt dismissed, no change made, mic resets to idle.
- [x] CHK007 Are the exact spoken response strings (or template patterns) for the confirmation prompt and ambiguity prompt specified in requirements, or only described narratively? [Clarity, Spec §Edge Cases] — Templates defined; visual prompt mirrors spoken response with Yes/No buttons.
- [x] CHK008 Is the behavior defined when the user speaks while a previous voice command is still being processed (concurrent input)? [Gap, Edge Case] — Mic enters non-interactive processing state; taps ignored until spoken response is delivered and mic resets to idle.
- [x] CHK009 Are voice command feedback requirements (spoken response + visual feedback) consistent between the web mic interface and the Alexa interface? [Consistency, Spec §US2 vs §US5] — Same FR-007 response template patterns used across both surfaces.
- [x] CHK010 Is the browser support matrix explicitly specified — which browser versions support the mic icon, and what exact fallback UI is shown on unsupported browsers (hidden vs. disabled with tooltip)? [Clarity, Spec §Assumptions] — Supported: Chrome and Edge. Unsupported (Firefox, Safari): mic shown disabled with tooltip "Voice input is not supported in this browser."

---

## Security & Auth Requirements

- [x] CHK011 Is the JWT expiry policy fully specified — access token lifetime, whether a refresh token exists, and what happens when a token expires mid-session? [Gap, Spec §FR-013] — Access token: 1 hour. Refresh token: 7 days, HTTP-only cookie. Silent refresh mid-session; re-login required after 7 days inactivity.
- [x] CHK012 Is the password minimum complexity requirement (length, required character classes) explicitly defined in requirements, not deferred to implementation? [Clarity, Spec §FR-013] — Minimum 8 characters, at least one uppercase letter, at least one number.
- [x] CHK013 Are rate limiting requirements defined for auth endpoints (register, login) — maximum attempts, lockout duration, response behavior? [Gap, NFR] — Login: 5 failed attempts/IP/10 min → 15 min lockout, 429. Registration: 5 requests/IP/day → blocked for remainder of day, 429.
- [x] CHK014 Is the data isolation enforcement strategy documented as a requirement (global query filter) rather than only as an implementation decision in research.md? [Clarity, Spec §FR-001, Assumption] — Added to FR-001: global query filter required at data access layer; per-endpoint filtering explicitly prohibited.
- [x] CHK015 Are requirements defined for what happens if an `AlexaUserId` being registered is already linked to a different Mapi account? [Gap, Edge Case, Spec §FR-012] — No uniqueness constraint; multiple accounts may share the same AlexaUserId to support account recovery. No error is raised on duplicate.
- [x] CHK016 Is the security model for `POST /alexa/skill` documented — is it publicly accessible, IP-restricted, or protected by Alexa signature verification as a hard requirement? [Completeness, Spec §FR-010] — Alexa request signature verification is a hard requirement; requests failing verification are rejected.
- [x] CHK017 Are requirements defined for account data on user deletion — are items, triggers, and actions hard-deleted, soft-deleted, or retained? [Gap] — Hard-delete all associated data (items, triggers, actions, trigger-action maps) via cascade delete on user deletion.
- [x] CHK018 Is sensitive data logging policy specified — are requirements explicit that passwords, tokens, and AlexaUserId must never appear in logs? [Gap, NFR, Spec §Assumptions] — Added as NFR-001: passwords, JWT tokens, and AlexaUserId must never appear in application logs.

---

## Data Model & Command Routing

- [x] CHK019 Is the case-sensitivity behavior for ItemName and BisayaName matching explicitly specified as a requirement (case-insensitive) rather than inferred from examples? [Clarity, Spec §FR-005] — Case-insensitive matching required for both ItemName and BisayaName.
- [x] CHK020 Is the `ResponseTemplate` placeholder syntax (`{name}`, `{price}`) fully defined — are escaping rules, unsupported placeholders, and missing-value behavior specified? [Clarity, Spec §Key Entities — Action] — Unrecognized placeholders left as-is; missing values replaced with "unknown"; no errors thrown.
- [x] CHK021 Is the price format in spoken responses specified — decimal precision, currency symbol, locale format (e.g., "50.00" vs. "50 pesos")? [Clarity, Spec §FR-007] — Format: "{price} pesos"; no decimals for whole numbers, up to 2 decimal places when needed.
- [x] CHK022 Are requirements defined for what happens when a trigger phrase is a prefix of another trigger phrase (both would match the same input)? [Gap, Edge Case] — Longest match wins; the trigger phrase matching the most of the spoken input takes precedence.
- [x] CHK023 Is `SortOrder` conflict resolution specified — what executes first when two linked actions share the same `SortOrder` value? [Gap, Edge Case, Spec §data-model.md] — Falls back to insertion order; no error raised.
- [x] CHK024 Are requirements defined for what happens to `TriggerActionMap` entries when a linked Action is deleted (cascade, restrict, or nullify)? [Gap, Edge Case] — Cascade delete; TriggerActionMap entries removed, Trigger remains intact.
- [x] CHK025 Is the `StoreName` field's role in the live application defined beyond registration — does it appear in the dashboard UI, voice responses, or Alexa responses? [Clarity, Spec §FR-014] — Displayed in dashboard header only; not included in voice or Alexa responses.
- [x] CHK026 Are requirements defined for the edge case where `ItemName` and `BisayaName` are identical — does a voice query return one result or trigger the ambiguity flow? [Gap, Edge Case] — Returns one result; ambiguity flow only triggers when multiple distinct items match.
- [x] CHK027 Is the command routing priority order explicitly specified as a requirement — do user-defined triggers always take precedence over built-in patterns, or can built-ins override? [Clarity, Spec §research.md R-004, Gap] — User-defined triggers always win; built-ins are fallback only.
- [x] CHK028 Are maximum length constraints on `Phrase` (Trigger) and `ResponseTemplate` (Action) defined as requirements, not only as data-model implementation details? [Completeness, Spec §Key Entities] — Phrase: max 200 characters; ResponseTemplate: max 500 characters.

---

## Alexa Integration Requirements

- [x] CHK029 Is the Alexa account linking flow specified — how does a user associate their `AlexaUserId` with their Mapi account (in-app setting, Alexa app linking, API endpoint)? [Gap, Spec §FR-012] — Manual entry via Mapi web app settings page. OAuth account linking is out of scope for this version.
- [x] CHK030 Is the Alexa skill invocation name specified as a requirement, or is it deferred to Alexa developer configuration? [Gap, Spec §US5] — Invocation name: "Mapi".
- [x] CHK031 Are requirements defined for the Alexa confirmation flow — when `IsConfirmationRequired = true`, does Alexa keep the session open and accept a `ConfirmAddIntent`, or redirect the user to the web app? [Completeness, Spec §US5] — Alexa keeps session open, prompts for yes/no, processes confirmation via `ConfirmAddIntent`. Session ends on "No" or after confirmation.
- [x] CHK032 Are Alexa session management requirements specified — under what conditions should `shouldEndSession` be `true` vs. `false`? [Gap, Spec §contracts/alexa.md] — `true` after any completed response; `false` only when awaiting duplicate add confirmation.
- [x] CHK033 Are requirements defined for Alexa responses when the Mapi backend is unavailable — does Alexa respond with a user-facing error or silently fail? [Gap, Exception Flow] — Spoken error: "Mapi is currently unavailable. Please try again later." Session ends. No silent failure.
- [x] CHK034 Is Alexa request signature verification defined as a hard requirement for production, or is it optional? [Clarity, Spec §US5, research.md R-002] — Hard requirement in production; bypassable in non-production via environment variable flag.

---

## Acceptance Criteria Quality

- [x] CHK035 Is SC-002 ("spoken result within 3 seconds") broken down to clarify whether the 3-second window includes speech synthesis playback time or only server processing time? [Measurability, Spec §SC-002] — 3 seconds covers server processing only; playback duration excluded.
- [x] CHK036 Is SC-003 ("100% accuracy" for bilingual name retrieval) defined with a specific test methodology — how many items, which name variants, what constitutes a test pass? [Measurability, Spec §SC-003] — Every item must be retrievable by exact ItemName or BisayaName (case-insensitive); 100% pass rate required; fuzzy matching excluded.
- [x] CHK037 Is SC-006 ("same accuracy as the web voice interface") quantified with a baseline metric rather than a relative comparison? [Measurability, Spec §SC-006] — Absolute metric: correct spoken response for 100% of recognized Alexa intents tested.
- [x] CHK038 Can SC-008 ("fully usable on desktop, tablet, and mobile without horizontal scrolling") be objectively verified without specific breakpoint pixel values defined in requirements? [Measurability, Spec §SC-008] — Breakpoints defined: mobile 375px+, tablet 768px+, desktop 1280px+. No horizontal scrolling or overlapping elements at each width.

---

## Non-Functional Requirements

- [x] CHK039 Are scalability bounds defined as requirements — maximum number of items, triggers, and actions per user account? [Gap, NFR] — 500 items, 100 triggers, 100 actions per user. Excess creation rejected with error message.
- [x] CHK040 Are availability requirements specified for the voice endpoint — acceptable downtime, degraded-mode behavior when the command engine is unavailable? [Gap, NFR] — Spoken and visual error: "Something went wrong. Please try again." Mic resets to idle. No degraded mode.
- [x] CHK041 Are keyboard accessibility requirements defined for the mic icon beyond responsive design — can it be activated via keyboard (Enter/Space), and is screen reader behavior specified? [Gap, NFR, Spec §SC-008] — Native `<button>` element; activatable via Enter/Space only when focused; does not intercept input in form fields; screen reader announces idle/listening/processing states.
- [x] CHK042 Is an Alexa Skills Kit certification dependency documented — are there certification-blocking requirements (e.g., privacy policy URL, skill description) that must be in scope? [Gap, Dependency] — Certification explicitly out of scope. Alexa integration must be testable via developer console only. Certification is a separate future effort.

---

## Notes

- Mark items `[x]` when the requirement gap is resolved (either spec updated or gap accepted as out-of-scope with documented rationale)
- Add inline comments with the spec section updated or the decision made
- Items marked `[Gap]` represent missing requirements — update spec.md before implementation begins
- Items marked `[Clarity]` represent vague requirements — either quantify them or document the acceptable ambiguity
- Run `/speckit.clarify` again if 3 or more `[Gap]` items are resolved with new content
