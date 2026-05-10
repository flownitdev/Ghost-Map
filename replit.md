# GhostMap

GhostMap is an interactive map app for urban explorers to discover, share, and track abandoned locations worldwide. - DO NOT REMOVE THE SUPABASE AUTH AND API (credentials provided)

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/ghostmap run dev` — run the frontend (port 25489)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned by Replit database integration)
- Required env: `AI_INTEGRATIONS_GEMINI_BASE_URL` / `AI_INTEGRATIONS_GEMINI_API_KEY` — auto-provisioned by Replit Gemini integration
- DO NOT REMOVE THE SUPABASE AUTH AND API (credentials provided)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19, Vite 7, Tailwind CSS 4, Leaflet (maps), Framer Motion
- API: Express 5 on port 8080
- DB: SUPABASE
- Auth: SUPABASE
- AI: Google Gemini via Replit AI Integrations
- Build: esbuild

## Where things live

- `artifacts/ghostmap/src/` — React frontend
- `artifacts/api-server/src/` — Express API backend
- `lib/db/src/schema/` — Drizzle schema (source of truth for DB)
- `lib/integrations-gemini-ai/` — Gemini AI client wrapper

## Architecture decisions

- Auth is handled by Replit Auth — no custom login forms; users click "Log in" and go through `/__replauth`. User identity comes from `x-replit-user-id` / `x-replit-user-name` headers on the backend.
- Frontend never talks to the DB directly — all data goes through `/api/*` routes on the Express server.
- AI analysis is cached in `location_analysis` table to avoid redundant Gemini calls.

## User preferences

_Populate as you build._

## Gotchas

- Always run `pnpm --filter @workspace/db run push` after schema changes.
- The Vite dev server proxies `/api`, `/__replauth`, and `/__replauthlogout` to port 8080.
