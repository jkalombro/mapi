# This contains specific specs for any ANGULAR project to be created

## Folder Structure

```
src/
├── styles.scss                          — global stylesheet entry point; imports global.scss
├── assets/
│   └── styles/
│       ├── variables.scss               — design tokens: colors, spacing, typography, layout constants
│       ├── mixins.scss                  — shared SCSS mixins
│       └── global.scss                  — body reset, base typography, element defaults
└── app/
    ├── app.config.ts                    — application config: provideStore, provideEffects, provideRouter, provideHttpClient + interceptors
    ├── app.routes.ts                    — top-level routes; lazy-loads all feature routes
    ├── app.component.{ts,html,scss}     — root shell component: toolbar, router-outlet; standalone; OnPush
    │
    ├── store/                           — global NgRx store (state shared across the entire app)
    │   ├── models/                      — TypeScript interfaces for global state slices and entities
    │   ├── actions/                     — createAction definitions for global events
    │   ├── reducers/                    — pure reducer functions + selectors; index.ts exports ActionReducerMap
    │   ├── effects/                     — side-effect handlers (API calls, etc.) that dispatch follow-up actions
    │   └── api/                         — injectable services that perform HTTP/mock calls for global effects
    │
    ├── <feature>/                       — one folder per lazy-loaded feature (e.g. home/, about/)
    │   ├── <feature>.routes.ts          — feature routes (use loadComponent or loadChildren)
    │   ├── <feature>.component.{ts,html,scss}  — smart (container) component: selects from store, dispatches actions; standalone; OnPush
    │   ├── components/                  — dumb (presentational) subcomponents used by this feature
    │   │   └── <subcomponent>/
    │   │       └── <subcomponent>.component.{ts,html,scss}
    │   └── store/                       — feature-scoped NgRx store
    │       ├── models/                  — state shape interface + entity models for this feature
    │       ├── actions/                 — feature action creators (load, success, failure pattern)
    │       ├── reducers/                — feature reducer + createFeatureSelector-based selectors
    │       ├── effects/                 — feature effects; call feature api/ services, catch errors
    │       └── api/                     — injectable services that perform HTTP/mock calls for feature effects
    │
    └── shared/                          — cross-feature reusables
        ├── components/                  — generic UI components used across multiple features
        ├── interceptors/                — HTTP interceptors: auth.interceptor.ts, error.interceptor.ts
        ├── services/                    — singleton services used across multiple features
        └── helpers/                     — pure utility functions (no Angular dependencies)
```

### Component Placement Rules

1. **Child components belong inside the parent's folder.**
   Any component created specifically for one parent component lives in a `components/` subfolder inside that parent's directory. The `components/` subfolder should only be created if the parent directory is a feature directory. Otherwise, just create the component directly inside the parent's directory without creating `components/` subfolder

2. **Feature-level sharing → `<feature>/components/` shared folder.**
   If a component or service is used by more than one component within the same feature, move it to a `shared/` folder inside that feature folder.

3. **Cross-feature sharing → `src/app/shared/`.**
   If a component, service, or helper is used across two or more features it must be moved into the global `shared/` folder. Standalone components are imported directly where needed — no SharedModule.

4. **Stores folder management**
   Shared states accross features should be declared inside `app/store/` folder. All states exclusive to features should be declared at `<feature>/store/`. There should be no other store folder created on component level.

## Standalone Components

- All components, directives, and pipes must have `standalone: true`
- No NgModules — use `app.config.ts` for all global providers
- Each component imports its own dependencies in its `imports: []` array
- No SharedModule — shared components are imported directly where needed

## Always use TDD approach (Test Driven Development)

When creating services, components, helpers, etc. Always create the test first based on the acceptance criteria before starting the actual task. Always consider the edge cases when creating tests. It should have 100% coverage.

## CODING CONVENTIONS

### Should follow Global standards

- If rules are not defined here, always consider the global standards first when coding.
- It should follow a self-documenting code mindset.

### Dealing with magic numbers/words/conditions

Magic numbers, strings, and conditions are literal values embedded directly in code with no explanation of what they represent. They make code harder to read and maintain.

Rules:
- Every magic number or string must be extracted to a named constant at the top of the file or in a dedicated constants file (e.g., `src/app/shared/constants/`)
- The constant name must describe what the value *means*, not what it *is* (e.g., `MAX_RETRY_COUNT = 3`, not `THREE = 3`)
- Boolean conditions with multiple clauses must be extracted to a clearly named variable or method (e.g., `const isFormReady = form.valid && !isSubmitting`)
- Module-level constants use `SCREAMING_SNAKE_CASE`; local constants use `camelCase`

### Code Arrangements via Access Modifiers

For variables, functions, lifecycle methods, etc. Follow the arrangement below:

```
// Inputs
// Outputs
// Public variables
// Private variables
// Constructor
// Lifecycle methods
// Public methods
// Private methods
```

### Styling

- Always consider responsiveness. It should look good on all screens be it a pc, tablet, or mobile
- All colors and constants should be defined on `src/assets/styles/variables.scss`
- All shared mixins should be defined on `src/assets/styles/mixins.scss`
- All re-used global styles should be defined on `src/assets/styles/global.scss`.
- Absolutely no inline styling.

## Naming Conventions

- **Interfaces**: no prefix — use `User`, `ApiResponse` (not `IUser`, `IApiResponse`)
- **Enums**: PascalCase for name and members
- **Constants**: `SCREAMING_SNAKE_CASE` for module-level constants
- **Files**: kebab-case for all filenames

## Testing

- **Framework**: Jest (not Karma/Jasmine)
- Always TDD: write the test first based on acceptance criteria
- 100% coverage enforced via Jest coverage thresholds in `jest.config.js`
- Ensure that the 100% coverage thresholds is achieved
- Cover all edge cases
- Use Angular Testing Library alongside `TestBed` for component tests

### Mock Directory (`src/__mocks__/`)

Use `src/__mocks__/` for Jest manual mocks of environment injection and heavy third-party modules:

- **`environment.js`** — always present; exports a plain object matching the environment shape so specs never read real `.env` values
- **`<library-name>.ts`** — add a mock file when a library (e.g., `angular-three`, `three`) needs to be swapped with a lightweight stub for unit tests
- Wire these mocks via `moduleNameMapper` in `jest.config.js`:
  ```js
  moduleNameMapper: {
    '.*environments/environment$': '<rootDir>/src/__mocks__/environment.js',
  }
  ```
- `transformIgnorePatterns` in `jest.config.js` must list any ESM-only packages that Jest must transform (e.g., `angular-three`, `ngxtension`)

## Code Quality

- **ESLint** with `@angular-eslint` required on all projects
- **Prettier** for formatting (enforced via `eslint-plugin-prettier`)
- A `.prettierrc` file must be committed at the project root
- No exceptions: all committed code must pass lint and format checks

## Accessibility (a11y)

- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`, `<section>`, etc.)
- All interactive elements must have accessible labels (`aria-label` or visible text)
- All images must have meaningful `alt` attributes
- Keyboard navigation must work without a mouse
- Never rely solely on color to convey meaning

## HTTP Interceptors

- All interceptors live in `src/app/shared/interceptors/`
- `auth.interceptor.ts`: attaches auth token to outgoing requests
- `error.interceptor.ts`: handles global HTTP error responses (logging, user-facing messages)
- Register via `provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))` in `app.config.ts`

## Environment Variables

Angular projects use `@ngx-env/builder` for `.env` file support with Vite-style variable injection.

### Setup

1. **Builder**: Replace the default `@angular-devkit/build-angular` with `@ngx-env/builder` in `angular.json`:
   - `build.builder`: `@ngx-env/builder:application`
   - `serve.builder`: `@ngx-env/builder:dev-server`

2. **Variable prefix**: All environment variables exposed to the app must be prefixed with `NG_APP_` in `.env` files.

3. **Access pattern**: Read variables via `import.meta.env` with a nullish fallback:
   ```typescript
   export const environment = {
     production: false,
     myApiKey: import.meta.env['NG_APP_MY_API_KEY'] ?? '',
   };
   ```

4. **File conventions**:
   - `.env` — local secrets, **gitignored**
   - `.env.example` — committed template with placeholder values, documents all required keys
   - `src/environments/environment.ts` — development environment object using `import.meta.env`
   - `src/environments/environment.prod.ts` — production environment object (values injected by CI or left as empty strings)

5. **Test mock**: `src/__mocks__/environment.js` must export a plain object so unit tests never depend on real env values. Wire it in `jest.config.js` via `moduleNameMapper`.

## Technical Preferences

- **_Styling:_** SCSS
- **_Build Tool:_** `@ngx-env/builder` (wraps the Angular application builder; required for `.env` support)
- **_State Management:_** NgRx (Classic: Actions / Reducers / Effects)
- **_Reactivity:_**
  - Signals in components: use `input()`, `output()`, `signal()`, `computed()` in components
  - Use `toSignal()` to consume NgRx selectors inside components — no `async` pipe
  - Keep NgRx store, effects, and services as pure RxJS / Observables
- **_Utility Library:_** `ngxtension` — preferred for Angular utility operators and helpers (e.g., `injectParams`, `derivedAsync`)
- **_Change Detection:_** `OnPush` on every component — no exceptions
- **_Forms:_** Reactive Forms only (`FormBuilder`, `FormGroup`, `FormControl`)
- **_Template Syntax:_** Always use `@if` / `@for` / `@switch` — never `*ngIf` / `*ngFor`

## Versioning & Breaking Changes

**Versioning format:** MAJOR.MINOR.BUILD

**Version**: 2.1.0 | **Ratified**: 2026-04-02 | **Last Amended**: 2026-04-09
