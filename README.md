# Trazo

**Plan. Organize. Deliver.**

Project and task management platform: a Vue 3 single-page app backed by a NestJS REST API. Organize projects, plan sprints, assign tasks and track progress from a role-aware dashboard, with every entity persisted server-side in SQLite and every request authenticated with a JWT.

---

## Live Demo

Deployed on Google Cloud Platform: **[http://34.29.156.222/](http://34.29.156.222/)**

See [Demo Accounts](#demo-accounts) below for login credentials.

---

## Features

- **Project management** — Full CRUD, with membership-based visibility: a project is visible only to the users assigned to it
- **Sprint planning** — Schedule tasks into sprints; committed points, completed points and days remaining are all derived per request, never stored
- **Task tracking** — Full CRUD, scoped to a project, with type, priority, status and assignee
- **Role-based access control**
  - **Administrator**: Full access + Projects, Sprints and Users management panels
  - **Member**: Dashboard and their own assigned tasks
- **Token-based authentication** — Passwords are hashed with bcrypt and never leave the database; sessions are JWTs validated by a guard on every protected route
- **Server-side persistence** — All data lives in SQLite through TypeORM, so it is shared across browsers and devices
- **Interactive data visualizations** — Powered by Chart.js and CountUp.js

---

## Tech Stack

| Layer                | Technology                                |
| -------------------- | ----------------------------------------- |
| Frontend framework   | Vue 3 (Composition API, `<script setup>`) |
| Backend framework    | NestJS 12                                 |
| Language             | TypeScript                                |
| Build tool           | Vite                                      |
| Session state        | Pinia                                     |
| Routing              | Vue Router                                |
| HTTP client          | Axios                                     |
| ORM                  | TypeORM                                   |
| Database             | SQLite (`better-sqlite3`)                 |
| Authentication       | JWT (`@nestjs/jwt`) + bcrypt              |
| Styling              | Tailwind CSS v4                           |
| Charts               | Chart.js, countup.js                      |
| Testing              | Vitest (unit + e2e)                       |
| Containerization     | Docker, Docker Compose, nginx             |
| Linting / Formatting | ESLint, Oxlint, Prettier                  |

---

## Architecture

Trazo is a two-tier application: a browser-side SPA and a REST API, each layered with a clear separation of concerns.

```
┌───────────────────────── Browser ─────────────────────────┐
│                     Presentation Layer                     │
│  Views (pages) · Components · Layouts · App.vue            │
├───────────────────────────────────────────────────────────┤
│                      Routing Layer                         │
│  Vue Router · beforeEach guard · route meta                │
├───────────────────────────────────────────────────────────┤
│                      Session Layer                         │
│  authstore.ts (Pinia) — the signed-in user only            │
├───────────────────────────────────────────────────────────┤
│                      Services Layer                        │
│  AuthService · ProjectService · SprintService · ...        │
│  The only place that performs HTTP calls                   │
└───────────────────────────────────────────────────────────┘
                            │
                   HTTP + Bearer token
                            ▼
┌──────────────────────── Server ───────────────────────────┐
│                     Controllers Layer                      │
│  Route mapping · DTO validation (global ValidationPipe)    │
├───────────────────────────────────────────────────────────┤
│                       Guards Layer                         │
│  AuthGuard (token) · AdminGuard (role)                     │
├───────────────────────────────────────────────────────────┤
│                      Services Layer                        │
│  Every business rule and validation                        │
├───────────────────────────────────────────────────────────┤
│                      Entities Layer                        │
│  TypeORM entities · repositories                           │
├───────────────────────────────────────────────────────────┤
│                    Persistence Layer                       │
│  SQLite (better-sqlite3), path from SQLITE_PATH            │
└───────────────────────────────────────────────────────────┘
```

### Key patterns

- **Navigation & access control** on the client live exclusively in the router guard (`frontend/src/router/index.ts`, `beforeEach`) driven by route `meta` fields — never in views. The server re-checks the same rules with `AuthGuard` and `AdminGuard`, so the client guard is UX, not security.
- **Business logic** is encapsulated in services on both sides (PascalCase static classes on the client, injectable providers on the server), keeping components and controllers thin.
- **DTOs** describe data going into a service's `create`/`update` calls, separate from the entity's own interface, and are validated server-side by the global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`).
- **The session** is a JWT in `localStorage`: `AuthService.logInUser` stores it, the Axios request interceptor in `frontend/src/AxiosConfig.ts` attaches it as a `Bearer` header, and the response interceptor signs the user out on any `401`.
- **Computed fields are never persisted** — `Project.progress`, `Sprint.committedPoints`, `Task.assigneeName` and friends are derived by the services on each request.

The full class diagram and architecture diagrams are documented in the [Wiki](https://github.com/TomasPosada0626/Trazo/wiki/Deliverable-1.2).

---

## Project Structure

```
backend/
├── src/
│   ├── auth/            # AuthService, AuthGuard, AdminGuard — owns no entity
│   ├── users/           # controller · service · dto/ · entities/
│   ├── projects/        # + events/ — the ProjectUserRemoved cross-module event
│   ├── sprints/
│   ├── tasks/
│   ├── home/            # controller + module only, no data
│   ├── common/          # DateUtils, PasswordUtils, @Trim decorator
│   ├── interfaces/auth/ # JWT payload and authenticated-request shapes
│   ├── types/           # Shared domain unions (statuses, roles, priorities)
│   ├── seeders/         # seed.ts CLI + one seeder per entity
│   ├── app.module.ts    # Composition root: wires the six feature modules
│   └── main.ts          # Bootstrap: api prefix, CORS, global ValidationPipe
├── test/                # app.e2e-spec.ts — end-to-end HTTP tests
├── Dockerfile
└── package.json

frontend/
├── src/
│   ├── components/
│   │   ├── shared/      # Domain-agnostic primitives: DataTableComponent (styles-only shell), ...
│   │   ├── dashboard/   # BarChartComponent, PieChartComponent, StatCardComponent
│   │   ├── layout/      # AppSidebarComponent
│   │   ├── projects/    # ProjectFormComponent, ProjectUsersComponent, ProjectTableComponent
│   │   ├── sprints/     # SprintFormComponent, SprintTableComponent
│   │   ├── tasks/       # TaskFormComponent, TaskTableComponent, AssignedTaskTableComponent
│   │   └── users/       # UserFormComponent, UserTableComponent
│   ├── layouts/         # AppLayout — the route-level shell; resolves the session
│   ├── views/           # Route components, one folder per page
│   ├── router/          # Route table + beforeEach guard
│   ├── services/        # Static classes; the only place that calls the API
│   ├── stores/          # authstore.ts — the session only; entity data lives in the API
│   ├── interfaces/      # The shapes the API returns, one per entity
│   ├── dtos/            # Create / update payload shapes sent to the API
│   ├── types/           # Shared domain unions (statuses, roles, priorities)
│   ├── utils/           # Static helpers: DateUtil, IdUtil, LabelUtil, ColorUtil, ErrorUtil
│   ├── assets/          # Tailwind theme tokens and static assets
│   └── AxiosConfig.ts   # Request/response interceptors: Bearer token + 401 sign-out
├── public/              # Static files copied as-is
├── Dockerfile
├── nginx.conf
├── index.html
├── package.json
└── vite.config.ts

docker-compose.yml       # Brings up both services together
```

---

## Getting Started

The fastest path is [Docker](#deployment-with-docker), which builds and seeds nothing but needs no local toolchain. To run the two apps directly, follow the steps below — the backend must be running before the frontend is useful.

### Prerequisites

- [Node.js](https://nodejs.org/) version 22.18 or higher (or 24.12+)
- npm
- A C++ toolchain, which `better-sqlite3` needs to build its native binding (preinstalled on Windows with the Node installer's "Tools for Native Modules" option; `build-essential` + `python3` on Debian/Ubuntu)

### 1. Clone the repository

```sh
git clone https://github.com/TomasPosada0626/Trazo.git
cd Trazo
```

### 2. Start the backend

```sh
cd backend
npm install
npm run seed      # Creates the SQLite file and loads the demo data
npm run start:dev
```

The API listens on `http://localhost:3000/api/`. It reads three environment variables, all optional in development:

| Variable      | Default                                            | Purpose                       |
| ------------- | -------------------------------------------------- | ----------------------------- |
| `PORT`        | `3000`                                             | Port the API binds to         |
| `SQLITE_PATH` | `database.sqlite` next to the backend              | Database file location        |
| `JWT_SECRET`  | `trazo-dev-secret`                                 | Signing secret for sessions   |
| `CORS_ORIGIN` | `http://localhost:5173`, `http://127.0.0.1:5173`   | Comma-separated allowed origins |

### 3. Start the frontend

In a second terminal:

```sh
cd frontend
npm install
cp .env.example .env     # Sets VITE_API_BASE_URL — required, it has no built-in default
npm run dev
```

The app is served at the URL printed by Vite (typically `http://localhost:5173`). `/` redirects straight to `/login`, the main route to invoke.

> `VITE_API_BASE_URL` is read straight from `import.meta.env` by every service, so without `frontend/.env` the bundle ships an `undefined` API URL and every request fails. The trailing slash matters: services append paths like `auth/login` directly to it.

### 4. Build for production

```sh
npm run build
```

The generated files are placed in the `dist/` folder.

### 5. Preview the production build locally

```sh
npm run preview
```

---

## Deployment with Docker

Both services are containerized and brought up together from the repository root.

```sh
docker compose up -d
```

- Frontend (nginx) on port **8080** by default, overridable with `FRONTEND_PORT`
- Backend (NestJS) on port **3000**
- SQLite lives in the named volume `backend-data`, so the database survives `docker compose down && docker compose up -d`

### Configuration

`docker-compose.yml` reads these from a `.env` file next to it, falling back to local development defaults. Copy `.env.example` to `.env` and adjust:

| Variable            | Default                      | Purpose                                              |
| ------------------- | ---------------------------- | ---------------------------------------------------- |
| `VITE_API_BASE_URL` | `http://localhost:3000/api/` | API URL baked into the frontend bundle at build time |
| `CORS_ORIGIN`       | `http://localhost:8080`      | Origins the backend accepts, comma-separated         |
| `JWT_SECRET`        | `trazo-dev-secret`           | Signing secret for session tokens                    |
| `FRONTEND_PORT`     | `8080`                       | Host port the frontend is published on               |

`VITE_API_BASE_URL` is read by Vite at build time, not at runtime, so it is passed as a build argument. Changing it requires `docker compose build frontend`, not just a restart.

For the GCP deployment at `34.29.156.222`, where the frontend is published on port 80 so the demo URL carries no port:

```sh
FRONTEND_PORT=80
VITE_API_BASE_URL=http://34.29.156.222:3000/api/
CORS_ORIGIN=http://34.29.156.222
JWT_SECRET=<a long random string>
```

### Seeding the deployed database

The volume starts empty, so the demo accounts have to be created once after the first `docker compose up -d`:

```sh
docker compose exec backend node dist/seeders/seed.js --fresh
```

Without this step the app loads but no one can sign in.

### Firewall

The GCP VM needs ingress rules allowing TCP on **80** (or whichever `FRONTEND_PORT` is set) and **3000**, otherwise the frontend loads but every API call fails.

---

## Demo Accounts

The demo data is loaded by the seeder — `npm run seed` locally, or the `docker compose exec` command above on a deployment. Use these credentials to log in:

| Email           | Password  | Role          |
| --------------- | --------- | ------------- |
| admin@trazo.com | admin123  | Administrator |
| juan@trazo.com  | admin123  | Administrator |
| maria@trazo.com | member123 | Member        |

> Resetting demo data: re-run the seeder with `--fresh`, which drops and recreates every table.

---

## Routes & Access Control

There is no separate landing page: the Dashboard is the app's home screen once signed in, and `/login` is the only route outside the authenticated area. Every route declares its access rules via `meta` fields, enforced by the global `beforeEach` guard in `frontend/src/router/index.ts` and re-checked server-side by `AuthGuard` and `AdminGuard`.

| Path           | Name      | Requires auth | Requires admin | Purpose                                  |
| -------------- | --------- | :-----------: | :------------: | ---------------------------------------- |
| /login         | login     |      ❌       |       ❌       | Guest-only; redirects signed-in users    |
| /app/dashboard | dashboard |      ✅       |       ❌       | Role-aware home: indicators + charts     |
| /app/tasks     | tasks     |      ✅       |       ❌       | Task CRUD, scoped to the user's projects |
| /app/projects  | projects  |      ✅       |       ✅       | Admin: Project CRUD + its user roster    |
| /app/sprints   | sprints   |      ✅       |       ✅       | Admin: Sprint CRUD + task scheduling     |
| /app/users     | users     |      ✅       |       ✅       | Admin: User CRUD + roles                 |

---

## Scripts Reference

**`frontend/`**

| Script          | Description                             |
| --------------- | --------------------------------------- |
| npm run dev     | Start the Vite dev server with HMR      |
| npm run build   | Type-check, then build for production   |
| npm run preview | Serve the production build locally      |
| npm run lint    | Run Oxlint + ESLint (both with `--fix`) |
| npm run format  | Format `src/` with Prettier             |

**`backend/`**

| Script            | Description                                      |
| ----------------- | ------------------------------------------------ |
| npm run start:dev | Start the API in watch mode                      |
| npm run start     | Start the API once                               |
| npm run build     | Compile to `dist/`                               |
| npm run seed      | Build, then load the demo data (`--fresh` resets) |
| npm test          | Run the unit tests                               |
| npm run test:e2e  | Run the end-to-end HTTP tests                    |
| npm run lint      | Run Oxlint with type-aware rules                 |
| npm run format    | Format `src/` with Prettier                      |

Before every push, the linters and formatters must run without errors (see the [Frontend Style Guide](https://github.com/TomasPosada0626/Trazo/wiki/Frontend-Style-Guide) and [Backend Style Guide](https://github.com/TomasPosada0626/Trazo/wiki/Backend-Style-Guide) in the Wiki).

---

## Recommended Tooling

**Editor**

- [VS Code](https://code.visualstudio.com/) + [Vue - Official (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur if installed)

**Browser**

- [Vue.js devtools](https://devtools.vuejs.org/) for Chrome / Firefox

---

## Team

- Mateo Garcia Carreño
- Hever Andre Alfonso Jimenez
- Tomás Posada Suárez (Architect)
