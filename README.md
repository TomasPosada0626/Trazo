# Trazo

**Plan. Organize. Deliver.**

Project and task management platform built with Vue 3, TypeScript, and Pinia. Organize projects, plan sprints, assign tasks and track progress from a role-aware dashboard — entirely client-side, no backend required for this delivery.

---

## Features

- **Project management** — Full CRUD, with membership-based visibility: a project is visible only to the users listed in its members
- **Sprint planning** — Schedule tasks into sprints; committed points, completed points and days remaining are all derived, never stored
- **Task tracking** — Full CRUD, scoped to a project, with type, priority, status and assignee
- **Role-based access control**
  - **Administrator**: Full access + Projects, Sprints and Users management panels
  - **Member**: Dashboard and their own assigned tasks
- **Persistent client-side state** — All data persisted in `localStorage`, with mock data seeded automatically on first load
- **Interactive data visualizations** — Powered by Chart.js and CountUp.js

---

## Tech Stack

| Layer                | Technology                                  |
| --------------------- | -------------------------------------------- |
| Framework             | Vue 3 (Composition API, `<script setup>`)    |
| Language              | TypeScript                                   |
| Build tool            | Vite                                         |
| State management      | Pinia                                        |
| Routing               | Vue Router                                   |
| Styling               | Tailwind CSS v4                              |
| Charts                | Chart.js, countup.js                         |
| Linting / Formatting  | ESLint, Oxlint, Prettier                     |

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

- **Navigation & access control** live exclusively in the router guard (`src/router/index.ts`, `beforeEach`) driven by route `meta` fields — never in views.
- **Business logic** is encapsulated in services (PascalCase classes, static methods), keeping stores and components thin.
- **DTOs** describe data going into a service's `create`/`update`/`login` calls, separate from the entity's own interface.
- **State hydration & persistence** is centralized in `PiniaConfig.init()`: it loads from `localStorage` or seeds fresh data, then deep-watches the store state and writes every change back.

The full class diagram and architecture diagram are documented in the [Wiki](https://github.com/TomasPosada0626/Trazo/wiki/Deliverable).

---

## Project Structure

```
src/
├── components/
│   ├── ui/         # Domain-agnostic primitives: DataTableComponent, TextFieldComponent, ...
│   ├── dashboard/  # BarChartComponent, PieChartComponent, StatCardComponent
│   ├── layout/     # AppLayoutComponent, AppSidebarComponent
│   ├── projects/   # ProjectFormComponent, ProjectMembersComponent
│   ├── sprints/    # SprintFormComponent
│   ├── tasks/      # TaskFormComponent
│   └── users/      # UserFormComponent
├── views/          # Route components, one folder per page
├── router/         # Route table + beforeEach guard
├── services/       # Static classes; all business logic lives here
├── stores/         # Pinia state only — one ref<T[]> per entity, no logic
├── seeders/        # Mock data loaded into LocalStorage on first run
├── interfaces/     # Data-only TS interfaces, one per entity
├── dtos/           # Create / update / login input shapes (Omit / Partial / Pick)
├── utils/          # Pure helpers: date formatting, enum labels, id display
└── assets/         # Tailwind theme tokens and static assets
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) version 22.18 or higher (or 24.12+)
- npm

### 1. Clone the repository

```sh
git clone https://github.com/TomasPosada0626/Trazo.git
cd Trazo
```

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

## Demo Accounts

Seed data is loaded automatically on first launch. Use these credentials to log in:

| Email             | Password    | Role          |
| ----------------- | ----------- | ------------- |
| admin@trazo.com   | admin123    | Administrator |
| juan@trazo.com    | admin123    | Administrator |
| maria@trazo.com   | member123   | Member        |

> Resetting demo data: delete the `piniaState` entry from your browser's LocalStorage and reload.

---

## Routes & Access Control

There is no separate landing page: the Dashboard is the app's home screen once signed in, and `/login` is the only route outside the authenticated area. Every route declares its access rules via `meta` fields, enforced by the global `beforeEach` guard in `src/router/index.ts`.

| Path            | Name      | Requires auth | Requires admin | Purpose                                  |
| --------------- | --------- | :-----------: | :-------------: | ----------------------------------------- |
| /login          | login     |      ❌       |       ❌        | Guest-only; redirects signed-in users     |
| /app/dashboard  | dashboard |      ✅       |       ❌        | Role-aware home: indicators + charts      |
| /app/tasks      | tasks     |      ✅       |       ❌        | Task CRUD, scoped to the user's projects  |
| /app/projects   | projects  |      ✅       |       ✅        | Admin: Project CRUD + membership          |
| /app/sprints    | sprints   |      ✅       |       ✅        | Admin: Sprint CRUD + task scheduling      |
| /app/users      | users     |      ✅       |       ✅        | Admin: User CRUD + roles                  |

---

## Scripts Reference

| Script          | Description                                     |
| --------------- | ------------------------------------------------ |
| npm run dev     | Start the Vite dev server with HMR                |
| npm run build   | Type-check, then build for production             |
| npm run preview | Serve the production build locally                |
| npm run lint    | Run Oxlint + ESLint (both with `--fix`)           |
| npm run format  | Format `src/` with Prettier                       |

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
