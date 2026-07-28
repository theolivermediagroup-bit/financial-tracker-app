# Financial Tracker

A personal finance tracker with an Express + PostgreSQL API and a React + Vite single-page app, managed as npm workspaces from the repo root.

## Stack

- **Server** (`server/`): Express, PostgreSQL (via `pg`), TypeScript, `tsx` for dev hot-reload
- **Client** (`client/`): React 19, Vite, TypeScript, `react-router-dom`, `recharts`

## Features

- Track income/expense entries against categories
- Monthly budgets with progress tracking
- Dashboard with spending-by-category breakdown

## Prerequisites

- Node.js
- Docker (for local Postgres via `docker compose`)

## Setup

1. Copy the example env files:
   ```bash
   cp .env.example .env
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Postgres:
   ```bash
   npm run dev:db
   ```
4. Apply migrations:
   ```bash
   npm run migrate
   ```
5. In separate terminals, start the API and the client:
   ```bash
   npm run dev:server   # http://localhost:4000
   npm run dev:client   # http://localhost:5173
   ```

## Scripts

Run from the repo root unless noted.

| Command | Description |
| --- | --- |
| `npm run dev:db` | Start Postgres via `docker compose` (`localhost:5432`) |
| `npm run migrate` | Apply pending SQL migrations |
| `npm run dev:server` | Start the API with hot reload on `:4000` |
| `npm run dev:client` | Start the Vite dev server on `:5173` |

Per-workspace commands (`npm run <script> --workspace=server|client`):

```bash
# server
npm run build     # tsc -> server/dist
npm run start      # node dist/index.js (run build first)
npm run migrate    # tsx src/db/migrate.ts

# client
npm run build      # tsc -b && vite build
npm run lint        # oxlint
npm run preview     # preview production build
```

There is no test suite configured in either workspace yet.

## Project structure

```
server/src/
  modules/<name>/        # categories, entries, dashboard, budgets
    *.routes.ts           # Express Router: HTTP verb/path -> controller
    *.controller.ts       # validates req, calls repository, shapes JSON response
    *.repository.ts       # parameterized SQL via a shared pg Pool
  db/migrations/          # numbered, additive SQL migrations
  app.ts                  # mounts routers under /api/*
  index.ts                # starts the HTTP listener

client/src/
  routes/                 # top-level pages (DashboardPage, CategoriesPage)
  api/                    # one file per server module, wraps its endpoints
  components/             # presentational/form components
  types/                  # TS interfaces matching server DTOs
```

See `CLAUDE.md` for detailed architecture notes and conventions for extending the app.
