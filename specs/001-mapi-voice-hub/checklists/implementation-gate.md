# Pre-Implementation Gate Checklist: Mapi – Smart Voice & Storage Hub

**Purpose**: Author self-review gate — validate that all requirements are complete, clear, and unambiguous enough to hand to an implementer without follow-up questions. Covers all four risk clusters equally: Voice UX, Security & Auth, Data Model & Command Routing, Alexa Integration.  
**Created**: 2026-04-11  
**Feature**: [spec.md](../spec.md) · [plan.md](../plan.md) · [data-model.md](../data-model.md) · [contracts/](../contracts/)  
**Scope**: All requirement areas · **Depth**: Pre-implementation gate · **Audience**: Author self-review

---

## Voice UX Requirements

- [ ] CHK001 Is the visual design of the mic icon (size, position in layout, z-index relative to content) specified beyond "visible and accessible on every screen"? [Clarity, Spec §FR-003]
- [ ] CHK002 Are spoken response formats defined for every command outcome: item found, item not found, ambiguous match, add success, add duplicate confirmation, add error (malformed command)? [Completeness, Spec §FR-007]
- [ ] CHK003 Is "begins listening" defined with specific feedback signals — what visual or audio cue indicates the mic is active vs. idle vs. processing? [Clarity, Spec §US2 Acceptance Scenario 4]
- [ ] CHK004 Is the timeout behavior specified when a user activates the mic but does not speak within a given window? [Gap, Edge Case]
- [ ] CHK005 Are requirements defined for what happens when speech recognition returns an empty, null, or noise-only transcript? [Gap, Edge Case]
- [ ] CHK006 Is the confirmation flow interaction fully specified — what happens if the user does not respond to "Do you want to update it?" (timeout, dismiss, no-change)? [Completeness, Spec §Edge Cases]
- [ ] CHK007 Are the exact spoken response strings (or template patterns) for the confirmation prompt and ambiguity prompt specified in requirements, or only described narratively? [Clarity, Spec §Edge Cases]
- [ ] CHK008 Is the behavior defined when the user speaks while a previous voice command is still being processed (concurrent input)? [Gap, Edge Case]
- [ ] CHK009 Are voice command feedback requirements (spoken response + visual feedback) consistent between the web mic interface and the Alexa interface? [Consistency, Spec §US2 vs §US5]
- [ ] CHK010 Is the browser support matrix explicitly specified — which browser versions support the mic icon, and what exact fallback UI is shown on unsupported browsers (hidden vs. disabled with tooltip)? [Clarity, Spec §Assumptions]

---

## Security & Auth Requirements

- [ ] CHK011 Is the JWT expiry policy fully specified — access token lifetime, whether a refresh token exists, and what happens when a token expires mid-session? [Gap, Spec §FR-013]
- [ ] CHK012 Is the password minimum complexity requirement (length, required character classes) explicitly defined in requirements, not deferred to implementation? [Clarity, Spec §FR-013]
- [ ] CHK013 Are rate limiting requirements defined for auth endpoints (register, login) — maximum attempts, lockout duration, response behavior? [Gap, NFR]
- [ ] CHK014 Is the data isolation enforcement strategy documented as a requirement (global query filter) rather than only as an implementation decision in research.md? [Clarity, Spec §FR-001, Assumption]
- [ ] CHK015 Are requirements defined for what happens if an `AlexaUserId` being registered is already linked to a different Mapi account? [Gap, Edge Case, Spec §FR-012]
- [ ] CHK016 Is the security model for `POST /alexa/skill` documented — is it publicly accessible, IP-restricted, or protected by Alexa signature verification as a hard requirement? [Completeness, Spec §FR-010]
- [ ] CHK017 Are requirements defined for account data on user deletion — are items, triggers, and actions hard-deleted, soft-deleted, or retained? [Gap]
- [ ] CHK018 Is sensitive data logging policy specified — are requirements explicit that passwords, tokens, and AlexaUserId must never appear in logs? [Gap, NFR, Spec §Assumptions]

---

## Data Model & Command Routing

- [ ] CHK019 Is the case-sensitivity behavior for ItemName and BisayaName matching explicitly specified as a requirement (case-insensitive) rather than inferred from examples? [Clarity, Spec §FR-005]
- [ ] CHK020 Is the `ResponseTemplate` placeholder syntax (`{name}`, `{price}`) fully defined — are escaping rules, unsupported placeholders, and missing-value behavior specified? [Clarity, Spec §Key Entities — Action]
- [ ] CHK021 Is the price format in spoken responses specified — decimal precision, currency symbol, locale format (e.g., "50.00" vs. "50 pesos")? [Clarity, Spec §FR-007]
- [ ] CHK022 Are requirements defined for what happens when a trigger phrase is a prefix of another trigger phrase (both would match the same input)? [Gap, Edge Case]
- [ ] CHK023 Is `SortOrder` conflict resolution specified — what executes first when two linked actions share the same `SortOrder` value? [Gap, Edge Case, Spec §data-model.md]
- [ ] CHK024 Are requirements defined for what happens to `TriggerActionMap` entries when a linked Action is deleted (cascade, restrict, or nullify)? [Gap, Edge Case]
- [ ] CHK025 Is the `StoreName` field's role in the live application defined beyond registration — does it appear in the dashboard UI, voice responses, or Alexa responses? [Clarity, Spec §FR-014]
- [ ] CHK026 Are requirements defined for the edge case where `ItemName` and `BisayaName` are identical — does a voice query return one result or trigger the ambiguity flow? [Gap, Edge Case]
- [ ] CHK027 Is the command routing priority order explicitly specified as a requirement — do user-defined triggers always take precedence over built-in patterns, or can built-ins override? [Clarity, Spec §research.md R-004, Gap]
- [ ] CHK028 Are maximum length constraints on `Phrase` (Trigger) and `ResponseTemplate` (Action) defined as requirements, not only as data-model implementation details? [Completeness, Spec §Key Entities]

---

## Alexa Integration Requirements

- [ ] CHK029 Is the Alexa account linking flow specified — how does a user associate their `AlexaUserId` with their Mapi account (in-app setting, Alexa app linking, API endpoint)? [Gap, Spec §FR-012]
- [ ] CHK030 Is the Alexa skill invocation name specified as a requirement, or is it deferred to Alexa developer configuration? [Gap, Spec §US5]
- [ ] CHK031 Are requirements defined for the Alexa confirmation flow — when `IsConfirmationRequired = true`, does Alexa keep the session open and accept a `ConfirmAddIntent`, or redirect the user to the web app? [Completeness, Spec §US5]
- [ ] CHK032 Are Alexa session management requirements specified — under what conditions should `shouldEndSession` be `true` vs. `false`? [Gap, Spec §contracts/alexa.md]
- [ ] CHK033 Are requirements defined for Alexa responses when the Mapi backend is unavailable — does Alexa respond with a user-facing error or silently fail? [Gap, Exception Flow]
- [ ] CHK034 Is Alexa request signature verification defined as a hard requirement for production, or is it optional? [Clarity, Spec §US5, research.md R-002]

---

## Acceptance Criteria Quality

- [ ] CHK035 Is SC-002 ("spoken result within 3 seconds") broken down to clarify whether the 3-second window includes speech synthesis playback time or only server processing time? [Measurability, Spec §SC-002]
- [ ] CHK036 Is SC-003 ("100% accuracy" for bilingual name retrieval) defined with a specific test methodology — how many items, which name variants, what constitutes a test pass? [Measurability, Spec §SC-003]
- [ ] CHK037 Is SC-006 ("same accuracy as the web voice interface") quantified with a baseline metric rather than a relative comparison? [Measurability, Spec §SC-006]
- [ ] CHK038 Can SC-008 ("fully usable on desktop, tablet, and mobile without horizontal scrolling") be objectively verified without specific breakpoint pixel values defined in requirements? [Measurability, Spec §SC-008]

---

## Non-Functional Requirements

- [ ] CHK039 Are scalability bounds defined as requirements — maximum number of items, triggers, and actions per user account? [Gap, NFR]
- [ ] CHK040 Are availability requirements specified for the voice endpoint — acceptable downtime, degraded-mode behavior when the command engine is unavailable? [Gap, NFR]
- [ ] CHK041 Are keyboard accessibility requirements defined for the mic icon beyond responsive design — can it be activated via keyboard (Enter/Space), and is screen reader behavior specified? [Gap, NFR, Spec §SC-008]
- [ ] CHK042 Is an Alexa Skills Kit certification dependency documented — are there certification-blocking requirements (e.g., privacy policy URL, skill description) that must be in scope? [Gap, Dependency]

---

## Notes

- Mark items `[x]` when the requirement gap is resolved (either spec updated or gap accepted as out-of-scope with documented rationale)
- Add inline comments with the spec section updated or the decision made
- Items marked `[Gap]` represent missing requirements — update spec.md before implementation begins
- Items marked `[Clarity]` represent vague requirements — either quantify them or document the acceptable ambiguity
- Run `/speckit.clarify` again if 3 or more `[Gap]` items are resolved with new content
