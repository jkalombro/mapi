# Quickstart: Mapi – Smart Voice & Storage Hub

**Branch**: `001-mapi-voice-hub` | **Date**: 2026-04-11

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| .NET SDK | 9.0+ | Backend API |
| Node.js | 20 LTS+ | Angular frontend |
| SQL Server | 2019+ or LocalDB | Database |
| Angular CLI | 19+ | Frontend tooling |

---

## Repository Layout

```
mapi/
├── backend/   — .NET 9 Clean Architecture API
└── frontend/  — Angular 19 SPA
```

---

## Backend Setup

### 1. Configure environment

Copy and fill in `backend/src/Mapi.API/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=MapiDb;Trusted_Connection=True;"
  },
  "Jwt": {
    "SecretKey": "your-256-bit-secret-key-here",
    "Issuer": "mapi-api",
    "Audience": "mapi-client",
    "ExpiryMinutes": 60
  }
}
```

> Never commit real secrets. Use `dotnet user-secrets` for local development.

### 2. Restore & migrate

```bash
cd backend
dotnet restore
dotnet ef database update --project src/Mapi.Infrastructure --startup-project src/Mapi.API
```

### 3. Run the API

```bash
dotnet run --project src/Mapi.API
```

API available at `https://localhost:7000`. Swagger UI at `https://localhost:7000/swagger`.

### 4. Run backend tests

```bash
dotnet test
```

---

## Frontend Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in:

```env
NG_APP_API_URL=https://localhost:7000/api/v1
```

### 3. Run the dev server

```bash
npm start
```

App available at `http://localhost:4200`.

### 4. Run frontend tests

```bash
npm test
```

Coverage report generated at `coverage/`.

---

## Key Development Flows

### Adding a new backend feature

1. Define the entity/value object in `Mapi.Domain`.
2. Add the repository interface in `Mapi.Domain/Interfaces/`.
3. Create the command/query + handler + validator + DTO in `Mapi.Application/<Feature>/`.
4. Add the EF Core configuration in `Mapi.Infrastructure/Persistence/Configurations/`.
5. Implement the repository in `Mapi.Infrastructure/Persistence/Repositories/`.
6. Register DI in the appropriate `DependencyInjection.cs`.
7. Add the Minimal API endpoint in `Mapi.API/Endpoints/<Feature>Endpoints.cs`.
8. Add Gherkin scenarios in `Mapi.API.IntegrationTests/Features/<Feature>.feature`.
9. Implement step definitions.

### Adding a new frontend feature

1. Create the feature folder under `src/app/<feature>/`.
2. Define NgRx store: `models/`, `actions/`, `reducers/`, `effects/`, `api/`.
3. Create the feature route file `<feature>.routes.ts` and register it lazily in `app.routes.ts`.
4. Build the smart component (`<feature>.component.ts` + HTML + SCSS) with `OnPush` + signals.
5. Create presentational subcomponents in `<feature>/components/`.
6. Write Jest tests first (TDD) — 100% coverage required.

---

## Alexa Local Testing

Use the Alexa Developer Console's test simulator or the `ask-cli` to send simulated skill requests to the running API. Ensure `POST /alexa/skill` is reachable (use `ngrok` or a tunnel for local dev).

Simulated request example:

```bash
curl -X POST https://localhost:7000/alexa/skill \
  -H "Content-Type: application/json" \
  -d '{
    "version": "1.0",
    "session": { "user": { "userId": "test-alexa-user-id" } },
    "request": {
      "type": "IntentRequest",
      "intent": {
        "name": "PriceQueryIntent",
        "slots": { "query": { "name": "query", "value": "how much is Gatas" } }
      }
    }
  }'
```

> In integration tests, Alexa request signature verification is bypassed. Enable it in production via `AlexaRequestVerificationService`.

---

## Common Commands Reference

| Task | Command |
|------|---------|
| Add EF migration | `dotnet ef migrations add <Name> --project src/Mapi.Infrastructure --startup-project src/Mapi.API` |
| Revert last migration | `dotnet ef migrations remove --project src/Mapi.Infrastructure --startup-project src/Mapi.API` |
| Run all backend tests | `dotnet test` |
| Run all frontend tests | `npm test` |
| Build frontend for production | `npm run build` |
| Lint frontend | `npm run lint` |
