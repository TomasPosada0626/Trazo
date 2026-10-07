# Trazo

**Plan. Organize. Deliver.**

Project and task management platform built with Vue 3, TypeScript, and Pinia. Organize projects, plan sprints, assign tasks and track progress from a role-aware dashboard — entirely client-side, no backend required for this delivery.

---

## Live Demo

Deployed on Google Cloud Platform: **[http://34.29.156.222/](http://34.29.156.222/)**

See [Demo Accounts](#demo-accounts) below for login credentials.

---

## Features

- **Project management** — Full CRUD, with membership-based visibility: a project is visible only to the users listed in its `userIds`
- **Sprint planning** — Schedule tasks into sprints; committed points, completed points and days remaining are all derived, never stored
- **Task tracking** — Full CRUD, scoped to a project, with type, priority, status and assignee
- **Role-based access control**
  - **Administrator**: Full access + Projects, Sprints and Users management panels
  - **Member**: Dashboard and their own assigned tasks
- **Persistent client-side state** — All data persisted in `localStorage`, with mock data seeded automatically on first load
- **Interactive data visualizations** — Powered by Chart.js and CountUp.js

---

## Tech Stack

| Layer                | Technology                                |
| -------------------- | ----------------------------------------- |
| Framework            | Vue 3 (Composition API, `<script setup>`) |
| Language             | TypeScript                                |
| Build tool           | Vite                                      |
| State management     | Pinia                                     |
| Routing              | Vue Router                                |
| Styling              | Tailwind CSS v4                           |
| Charts               | Chart.js, countup.js                      |
| Linting / Formatting | ESLint, Oxlint, Prettier                  |

---

## Architecture

Trazo follows a layered architecture with a clear separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                   Presentation Layer                 │
│  Views (pages) · Components · App.vue                │
├─────────────────────────────────────────────────────┤
│                    Routing Layer                     │
│  Vue Router · beforeEach guard · route meta           │
├─────────────────────────────────────────────────────┤
│                     State Layer                       │
│  Pinia Stores (Auth, Project, Sprint, Task, User)     │
├─────────────────────────────────────────────────────┤
│                   Services Layer                      │
│  AuthService · ProjectService · SprintService · ...   │
├─────────────────────────────────────────────────────┤
│                    Models Layer                       │
│  Interfaces · DTOs · Seeders (mock data)              │
├─────────────────────────────────────────────────────┤
│                  Persistence Layer                    │
│  LocalStorage (via PiniaConfig deep watch)            │
└─────────────────────────────────────────────────────┘
```

### Key patterns

- **Navigation & access control** live exclusively in the router guard (`frontend/src/router/index.ts`, `beforeEach`) driven by route `meta` fields — never in views.
- **Business logic** is encapsulated in services (PascalCase classes, static methods), keeping stores and components thin.
- **DTOs** describe data going into a service's `create`/`update`/`login` calls, separate from the entity's own interface.
- **State hydration & persistence** is centralized in `PiniaConfig.init()`: it loads from `localStorage` or seeds fresh data, then deep-watches the store state and writes every change back.

The full class diagram and architecture diagram are documented in the [Wiki](https://github.com/TomasPosada0626/Trazo/wiki/Deliverable).

---

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── shared/     # Domain-agnostic primitives: DataTableComponent (styles-only shell), ...
│   │   ├── dashboard/  # BarChartComponent, PieChartComponent, StatCardComponent
│   │   ├── layout/     # AppSidebarComponent
│   │   ├── projects/   # ProjectFormComponent, ProjectUsersComponent, ProjectTableComponent
│   │   ├── sprints/    # SprintFormComponent, SprintTableComponent
│   │   ├── tasks/      # TaskFormComponent, TaskTableComponent, AssignedTaskTableComponent
│   │   └── users/      # UserFormComponent, UserTableComponent
│   ├── layouts/         # AppLayout — the route-level shell; resolves the session
│   ├── views/           # Route components, one folder per page
│   ├── router/          # Route table + beforeEach guard
│   ├── services/        # Static classes; all business logic lives here
│   ├── stores/          # Pinia state only — one ref<T[]> per entity, no logic
│   ├── seeders/         # Mock data loaded into LocalStorage on first run
│   ├── interfaces/      # Data-only TS interfaces, one per entity
│   ├── dtos/            # Create / update / login input shapes (Omit / Partial / Pick)
│   ├── utils/           # Static helper classes: DateUtils, IdUtils, LabelUtils, ColorUtils
│   └── assets/          # Tailwind theme tokens and static assets
├── public/              # Static files copied as-is
├── index.html
├── package.json
└── vite.config.ts
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) version 22.18 or higher (or 24.12+)
- npm

### 1. Clone the repository

```sh
git clone https://github.com/TomasPosada0626/Trazo.git
cd Trazo/frontend
```

> The app lives entirely under `frontend/` — every command below runs from inside that folder.

### 2. Install dependencies

```sh
npm install
```

### 3. Run the dev server

```sh
npm run dev
```

The app is served at the URL printed by Vite (typically `http://localhost:5173`). `/` redirects straight to `/login`, the main route to invoke.

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

- Frontend (nginx) on port **8080**
- Backend (NestJS) on port **3000**
- SQLite lives in the named volume `backend-data`, so the database survives `docker compose down && docker compose up -d`

### Configuration

`docker-compose.yml` reads these from a `.env` file next to it, falling back to local development defaults. Copy `.env.example` to `.env` and adjust:

| Variable            | Default                      | Purpose                                              |
| ------------------- | ---------------------------- | ---------------------------------------------------- |
| `VITE_API_BASE_URL` | `http://localhost:3000/api/` | API URL baked into the frontend bundle at build time |
| `CORS_ORIGIN`       | `http://localhost:8080`      | Origins the backend accepts, comma-separated         |
| `JWT_SECRET`        | `trazo-dev-secret`           | Signing secret for session tokens                    |

`VITE_API_BASE_URL` is read by Vite at build time, not at runtime, so it is passed as a build argument. Changing it requires `docker compose build frontend`, not just a restart.

For the GCP deployment at `34.29.156.222`:

```sh
VITE_API_BASE_URL=http://34.29.156.222:3000/api/
CORS_ORIGIN=http://34.29.156.222:8080,http://34.29.156.222
JWT_SECRET=<a long random string>
```

### Seeding the deployed database

The volume starts empty, so the demo accounts have to be created once:

```sh
docker compose exec backend node dist/seeders/seed.js --fresh
```

### Firewall

The GCP VM needs ingress rules allowing TCP on **8080** and **3000**, otherwise the frontend loads but every API call fails.

---

## Demo Accounts

Seed data is loaded automatically on first launch. Use these credentials to log in:

| Email           | Password  | Role          |
| --------------- | --------- | ------------- |
| admin@trazo.com | admin123  | Administrator |
| juan@trazo.com  | admin123  | Administrator |
| maria@trazo.com | member123 | Member        |

> Resetting demo data: delete the `piniaState` entry from your browser's LocalStorage and reload.

---

## Routes & Access Control

There is no separate landing page: the Dashboard is the app's home screen once signed in, and `/login` is the only route outside the authenticated area. Every route declares its access rules via `meta` fields, enforced by the global `beforeEach` guard in `frontend/src/router/index.ts`.

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

| Script          | Description                             |
| --------------- | --------------------------------------- |
| npm run dev     | Start the Vite dev server with HMR      |
| npm run build   | Type-check, then build for production   |
| npm run preview | Serve the production build locally      |
| npm run lint    | Run Oxlint + ESLint (both with `--fix`) |
| npm run format  | Format `src/` with Prettier             |

Before every push, `npm run lint` and `npm run format` must run without errors (see the [Programming Style Guide](https://github.com/TomasPosada0626/Trazo/wiki/Programming-Style-Guide) in the Wiki).

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
