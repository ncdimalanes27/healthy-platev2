# HealthyPlate

A Filipino nutrition companion app connecting patients with dieticians and nutritionists. Supports role-based access (patient, dietician, nutritionist, admin) with dashboards tailored to each role.

## Run & Operate

- `pnpm --filter @workspace/healthy-plate run dev` — run the frontend (uses workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- Required secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: Vite + React + react-router-dom + Tailwind CSS v3
- Auth/DB: Supabase (auth + PostgreSQL)
- State: Zustand with persist middleware
- Charts: Recharts
- API: Express 5 (artifacts/api-server)

## Where things live

- `artifacts/healthy-plate/` — main React frontend
- `artifacts/healthy-plate/src/pages/` — all page components (Login, Dashboard, HealthData, MealPlans, etc.)
- `artifacts/healthy-plate/src/store/useStore.ts` — Zustand store with Supabase auth + all data methods
- `artifacts/healthy-plate/src/lib/supabaseClient.ts` — Supabase client (reads VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- `artifacts/healthy-plate/src/lib/database.ts` — Supabase DB helpers
- `artifacts/healthy-plate/src/types/index.ts` — all TypeScript types incl. disease guidelines
- `artifacts/healthy-plate/src/components/layout/Layout.tsx` — sidebar + mobile nav
- `artifacts/api-server/` — Express API server (currently minimal, healthz only)
- `lib/db/` — Drizzle ORM (not used yet — app uses Supabase directly)

## Architecture decisions

- App uses Supabase directly from the frontend (no API server proxy for DB calls)
- Role hierarchy: admin (4) > nutritionist (3) > dietician (2) > patient (1)
- ProtectedRoute component enforces role-based access at the route level
- Zustand persist middleware keeps auth state across refreshes
- Tailwind v3 (not v4) with PostCSS — configured via `tailwind.config.js` + `postcss.config.js`

## Product

HealthyPlate is a chronic disease management nutrition app. Patients log meals, track health metrics, and view assigned meal plans. Dieticians and nutritionists manage patient notes, assign meal plans, and track progress. Admins manage all users and system settings.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Vite secrets prefixed `VITE_` must be set in Replit Secrets (not env vars) to be exposed to the browser
- The app uses Supabase for both auth and database — `DATABASE_URL` (Replit Postgres) is not used by the frontend
- Tailwind v3 is used (not v4) — do not upgrade to v4 or switch to `@tailwindcss/vite`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Supabase schema: see `.migration-backup/supabase-schema.sql` for the original table definitions
