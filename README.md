# Mapi – Smart Voice & Storage Hub

A full-stack web application that lets users manage a personal item catalogue and query item prices using natural voice commands — including Alexa skill integration.

---

## What this is

Mapi is a smart voice and storage hub built for bilingual (English/Bisaya) price lookups. Users can manage items manually through a dashboard or add and query them hands-free via a microphone interface or an Alexa skill. Custom trigger phrases can be mapped to actions (query, add, update, remove) with configurable response templates.

---

## Tech Stack

### Frontend — `UI/`

| Concern | Choice |
|---|---|
| Framework | Angular 19 (standalone components, OnPush) |
| State | NgRx 19 (Actions / Reducers / Effects) |
| Build | `@ngx-env/builder` (Vite-based, `.env` support) |
| Styling | SCSS with design tokens |
| Forms | Reactive Forms |
| Language | TypeScript 5.7 |

### Backend — `API/`

| Concern | Choice |
|---|---|
| Runtime | .NET 9 Minimal API |
| Architecture | Clean Architecture (Domain / Application / Infrastructure / API) |
| CQRS | MediatR |
| ORM | Entity Framework Core (SQL Server) |
| Auth | JWT Bearer |
| Voice | Alexa.NET skill integration |
| Logging | Serilog |
| Docs | Swagger / OpenAPI |

---

## Project Structure

```
.
├── UI/                          # Angular 19 frontend
│   └── src/app/
│       ├── auth/                # Login & registration
│       ├── items/               # Item CRUD dashboard
│       ├── voice/               # Microphone voice query UI
│       ├── triggers/            # Trigger & action management
│       ├── landing/             # Public landing page
│       ├── shared/              # Cross-feature components, interceptors, services
│       └── store/               # Global NgRx store
│
├── API/
│   └── src/
│       ├── Mapi.Domain/         # Entities, value objects, repository interfaces
│       ├── Mapi.Application/    # CQRS handlers, validators, DTOs (MediatR)
│       ├── Mapi.Infrastructure/ # EF Core, repositories, Identity, JWT
│       └── Mapi.API/            # Minimal API endpoints, Alexa controller, middleware
│
└── specs/                       # SpecKit feature specs and plans
```

---

## Features

### User Story 0 — Landing & Route Guards
- Public landing page at `/` with sign-in and register CTAs
- Auth guard redirects unauthenticated users away from protected routes
- Guest guard redirects authenticated users away from auth/landing pages

### User Story 1 — Manual Item Management
- Create, read, update, and delete items via a dashboard form
- Each item has an **ItemName** (English), **BisayaName** (Bisaya), and **Price**
- Items are scoped to the authenticated user — no cross-user visibility

### User Story 2 — Voice Price Query
- Persistent microphone icon available on every screen
- Speak a query (e.g., "How much is Gatas?") and receive the item price
- Matches by both ItemName and BisayaName

### User Story 3 — Voice Item Addition
- Add items hands-free: "Add Gatas price 50"
- Stores spoken name as both ItemName and BisayaName

### User Story 4 — Trigger & Action Logic Management
- Define custom voice trigger phrases
- Link triggers to one or more actions (Query, Add, Update, Remove)
- Configurable response templates per action

### User Story 5 — Alexa Skill Integration
- Alexa skill linked to a user's Mapi account
- `PriceQueryIntent` — ask Alexa for an item's price
- `AddItemIntent` — add an item via Alexa voice command

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Authenticate and receive a JWT |
| GET | `/api/v1/items` | List all items for the authenticated user |
| POST | `/api/v1/items` | Create a new item |
| PUT | `/api/v1/items/{id}` | Update an existing item |
| DELETE | `/api/v1/items/{id}` | Delete an item |
| GET | `/api/v1/triggers` | List triggers |
| POST | `/api/v1/triggers` | Create a trigger |
| PUT | `/api/v1/triggers/{id}` | Update a trigger |
| DELETE | `/api/v1/triggers/{id}` | Delete a trigger |
| GET | `/api/v1/actions` | List actions |
| POST | `/api/v1/actions` | Create an action |
| PUT | `/api/v1/actions/{id}` | Update an action |
| DELETE | `/api/v1/actions/{id}` | Delete an action |
| POST | `/api/v1/voice/query` | Process a voice price query |
| POST | `/alexa/skill` | Alexa skill webhook |

Swagger UI is available at `/swagger` in development.

---

## Getting Started

### Prerequisites

- Node.js 20+
- .NET 9 SDK
- SQL Server LocalDB (comes with Visual Studio) or a SQL Server instance

### Backend

```bash
cd API

# Restore packages
dotnet restore

# Apply database migrations
dotnet ef database update --project src/Mapi.Infrastructure --startup-project src/Mapi.API

# Run the API (http://localhost:5000, swagger at /swagger)
dotnet run --project src/Mapi.API
```

Copy `src/Mapi.API/appsettings.Development.json` and fill in your JWT secret key before running.

### Frontend

```bash
cd UI

# Install dependencies
npm install

# Copy env template and fill in values
cp .env.example .env

# Start the dev server (http://localhost:4200)
npm start
```

---

## Environment Variables

### Frontend (`.env`)

| Variable | Description |
|---|---|
| `NG_APP_API_URL` | Base URL of the Mapi API |

### Backend (`appsettings.json` / environment)

| Key | Description |
|---|---|
| `ConnectionStrings:DefaultConnection` | SQL Server connection string |
| `Jwt:SecretKey` | JWT signing key (min 32 characters) |
| `Jwt:Issuer` | JWT issuer |
| `Jwt:Audience` | JWT audience |
| `Jwt:ExpiryMinutes` | Access token lifetime in minutes |
| `Cors:AllowedOrigins` | Allowed frontend origins |
| `Alexa:SkipSignatureVerification` | Set `true` for local dev only |

---

## Development Workflow

This project uses the **SpecKit** workflow. Feature specs, plans, and task lists live under `specs/`.

```
/speckit.specify → /speckit.clarify → /speckit.plan → /speckit.tasks → /speckit.implement
```

See `claude.speckit.md` for the full SpecKit command reference.
