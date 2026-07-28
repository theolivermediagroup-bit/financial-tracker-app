# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A personal finance tracker: an Express + PostgreSQL API (`server/`) and a React + Vite SPA (`client/`), managed as npm workspaces from the repo root.

## Commands

Run from the repo root unless noted.

```bash
npm run dev:db        # start Postgres via docker compose (db on localhost:5432)
npm run migrate       # apply pending SQL migrations (server/src/db/migrations)
npm run dev:server    # start API with hot reload (tsx watch) on :4000
npm run dev:client    # start Vite dev server on :5173
```

Typical first-time setup: copy `.env.example` → `.env` at the repo root, `server/`, and `client/`, then `npm run dev:db`, `npm run migrate`, and run `dev:server`/`dev:client` in separate terminals.

Per-workspace commands (`npm run <script> --workspace=server|client`, or `cd server`/`cd client` first):

```bash
# server
npm run build          # tsc -> server/dist
npm run start           # node dist/index.js (run build first)
npm run migrate         # tsx src/db/migrate.ts

# client
npm run build           # tsc -b && vite build
npm run lint             # oxlint
npm run preview          # preview production build
```

There is no test suite configured in either workspace.

## Architecture

### Server: layered modules under `server/src/modules/<name>/`

Each feature (`categories`, `entries`, `dashboard`, `budgets`) follows the same three-file pattern:

- `*.routes.ts` — Express `Router`, maps HTTP verb/path to a controller function.
- `*.controller.ts` — parses/validates `req` (body/query/params), calls the repository, shapes the JSON response (DTOs). Throws `HttpError(status, message)` (from `server/src/middleware/errorHandler.ts`) for expected failures; the global `errorHandler` middleware (mounted last in `server/src/app.ts`) turns those into `{ error: message }` responses and logs+500s anything else.
- `*.repository.ts` — raw SQL via the shared `pg` `Pool` (`server/src/db/pool.ts`), parameterized queries only. Row types use `snake_case` fields matching the DB columns; controllers convert rows to `camelCase` DTOs (see `toEntryDto`, `toCategoryDto`).

Cross-module calls go through repository functions directly (e.g. `entries.controller.ts` imports `getCategoryById` from the categories repository to validate `categoryId`; `categories.controller.ts` imports `countEntriesByCategory` from the entries repository to block deleting categories that still have entries).

Routers are wired up in `server/src/app.ts` under `/api/categories`, `/api/entries`, `/api/dashboard`, `/api/budgets`. `server/src/index.ts` just starts the HTTP listener; `server/src/config/env.ts` loads and validates env vars (`DATABASE_URL` is required; missing it throws at startup).

### Database

- Plain SQL migrations in `server/src/db/migrations/`, applied in filename order (`NNN_description.sql`) by `server/src/db/migrate.ts`, which tracks applied files in a `schema_migrations` table. There's no rollback tooling — migrations are additive; write a new numbered file rather than editing an applied one.
- Core schema: `categories` (`type` is `'income'|'expense'`), `entries` (FK to `categories`, `amount` must be `> 0`), `monthly_budgets` (one row per `month`, unique).
- Money is `NUMERIC` in Postgres and comes back from `pg` as a string — repositories type these fields `string` (e.g. `EntryRow.amount: string`) and controllers call `Number(...)` when building DTOs. Keep this conversion at the controller/DTO boundary, not in the repository.

### Client: pages own data fetching, components are presentational

- `client/src/routes/` — top-level pages (`DashboardPage`, `CategoriesPage`) wired in `client/src/App.tsx` via `react-router-dom`. Pages fetch data in a `useEffect`/`refresh` callback using functions from `client/src/api/*`, hold it in local state, and pass a `refresh`/`onChange`/`onAdded` callback down to child components so they can trigger a full refetch after a mutation (no client-side cache or global store).
- `client/src/api/client.ts` — shared `apiFetch<T>` wrapper (adds JSON headers, throws `ApiError` with the server's `error` message on non-2xx, treats 204 as `undefined`) plus date helpers (`todayLocalISODate`, `currentYearMonth`, `formatMonthLabel`). Each `client/src/api/<module>.ts` file wraps one server module's endpoints and mirrors its request/response shapes; `client/src/types/index.ts` has the corresponding TS interfaces (`Entry`, `Category`, `DashboardSummary`, `MonthlyBudget`, etc.) matching the server DTOs field-for-field.
- `client/src/components/` — presentational/form components (`AddEntryForm`, `AddCategoryForm`, `EntryList`/`EntryRow`, `CategoryList`, `BudgetProgress`, `StatTile`, `SpendingByCategoryChart` using `recharts`, `Nav`).
- Env: `VITE_API_URL` (default `http://localhost:4000`) points the client at the API.

### Conventions to follow when extending

- New endpoint: add repository function(s) (parameterized SQL, `snake_case` row type) → controller (validate input, throw `HttpError` on bad input, map rows to a `camelCase` DTO) → route → mount in `app.ts` if it's a new module.
- New table/column: add a new numbered file in `server/src/db/migrations/`; never edit a migration that may already be applied.
- Dates are stored/passed as `YYYY-MM-DD` strings (see `DATE_RE` in `entries.controller.ts`) and months as `YYYY-MM` (see `MONTH_RE` in `budgets.controller.ts`); the client's `todayLocalISODate`/`currentYearMonth` helpers produce these in local time (not UTC) to avoid off-by-one-day bugs.
- Client module: add/extend `client/src/api/<module>.ts` mirroring the server response shape, update `client/src/types/index.ts`, then wire into a page's fetch + a component.

## Git workflow

Regularly commit all changes and push to GitHub so there's always a saved version of the project:

- After completing a meaningful chunk of work (a feature, fix, or otherwise reviewable unit), stage the relevant files, commit with a clear, specific message describing the *why*, and push to the remote.
- Don't let uncommitted work pile up across turns — commit as you go rather than batching many unrelated changes into one commit.
- Follow the standard safety rules: never force-push, never skip hooks, never commit `.env` files or other secrets, and confirm before any destructive git operation.
