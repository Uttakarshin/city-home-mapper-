# PriceWise Homes

A full-stack Indian property listings app with AI house visualization, interactive map, favourites, and a city-data SVG visualizer.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind v4 + Wouter + TanStack Query + framer-motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Maps: react-leaflet + OpenStreetMap tiles

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/` — Drizzle ORM table definitions (properties, favorites, visualizations)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/pricewise-homes/src/pages/` — React page components
- `artifacts/pricewise-homes/src/components/` — Shared components incl. `house-visualization.tsx`
- `artifacts/pricewise-homes/src/data/cities.ts` — Static Indian cities dataset (22 cities)

## Architecture decisions

- Contract-first API via OpenAPI → Orval codegen → typed React Query hooks + Zod validators
- SVG house on the `/visualization` page is 100% client-side, driven by static city data — no API call needed
- The AI visualizer (`/visualize`) generates an SVG house server-side, stored as a `data:image/svg+xml;base64,` URL in the `image_base64` column
- Favorites are stored per-session (no auth); the `favorites` table references `properties` with cascade delete
- DB numeric columns (price, lat, lng, bathrooms) are stored as `text/numeric` in Postgres and cast to `Number` in route responses

## Product

- **Home** — hero with search, market stats strip, featured listings, CTA to City Visualizer
- **Listings** — filterable property grid (city, type, bedrooms, max price)
- **Map** — Leaflet map with clickable markers for each property
- **Property Detail** — full details, favorite toggle, agent contact
- **Favorites** — saved properties list
- **AI Visualize** (`/visualize`) — describe a dream home → generates an SVG house concept
- **City Data** (`/visualization`) — 22-city dropdown; SVG house that dynamically scales with avg price, population, growth rate, and city area

## Gotchas

- After every `openapi.yaml` change run codegen before touching frontend or routes
- react-leaflet@4.2.1 requires React 18 peer but works fine with React 19 in practice
- The DB push command is safe to re-run; Drizzle diffs and only applies changes
