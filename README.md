# Lystio Web

A Next.js + React application using Feature-Sliced Design (FSD), TypeScript, React Query, and SCSS modules. Filters are URL-synced for shareable search links.

## Technology Stack

- Next.js 16 (App Router ready) + React 19
- TypeScript
- State: zustand (`@/entities/filters`, `@/entities/tenement`)
- Data fetching/cache: @tanstack/react-query (React Query)
- Styling: SCSS modules (`*.module.scss`)
- Map search: `@mapbox/search-js-react` (suggest), Mapbox Search HTTP APIs
- Architecture: Feature-Sliced Design (FSD)

## Project Structure (FSD)

- `app/` – App shell (providers, routing, styles)
- `widgets/` – Page-level composite blocks (e.g., `navbar`)
- `features/` – User interactions (e.g., `filter-location`, `filter-price`)
- `entities/` – Business entities and stores (e.g., `tenement`, `filters`, `location`)
- `shared/` – UI kit, libs, config (business-agnostic)

Each slice (under pages/widgets/features/entities) may contain:
- `ui/` – React components
- `model/` – state, hooks, query keys
- `config/`, `types/` – optional

Imports follow layer direction: `app → pages → widgets → features → entities → shared`.
Cross-slice imports go through the slice public API (`index.ts`).

## Setup

1) Install dependencies

```bash
pnpm install # or npm install / yarn
```

2) Development

```bash
pnpm dev # or npm run dev
```

Visit http://localhost:3000

3) Production build

```bash
pnpm build && pnpm start
```

## Environment

- Mapbox access token is currently in code for prototyping. For production, move it to an env variable (e.g., `NEXT_PUBLIC_MAPBOX_TOKEN`) and load it from `process.env`.

## Filters and URL Sync

- Filters are applied only when pressing Search.
- On Search, applied filters are written to the URL as query params so links are shareable.
- On first load, the app reads the URL and initializes filters/search.

Query params
- `withinId`: comma-separated IDs, e.g. `withinId=vienna,district-1`
- `type`: comma-separated numbers, e.g. `type=2,3`
- `rentType`: `rent|buy`
- `rent`: `min-max`, e.g. `rent=500-2000`
- `show`: `1|0` (price on request)
- `near`: `lng,lat,radius`, e.g. `near=16.37,48.21,5000`
- `bbox`: `minX,minY,maxX,maxY`

Draft vs applied selections
- The location filter writes to a draft (`draftWithinId`) so the UI updates without triggering a search.
- Pressing Search applies the draft to `withinId` and runs the request.

## Styling

- Use SCSS modules for component-scoped styles: `Component.module.scss`.
- Prefer semantic class names; avoid global leakage.

## FSD in short

Feature-Sliced Design organizes code by business features and UI composition layers:
- Improves scalability by grouping related UI, state, and data logic inside a slice.
- Enforces boundaries with a clear import direction and public APIs per slice.
- Encourages reusability (widgets/features) and separation of concerns (entities/shared).

Recommended practices
- Export only intended surface from each slice `index.ts`.
- Keep domain state in `model/`, UI in `ui/`, side-effect-free helpers in `lib/`.
- Compose pages from widgets and features rather than deep entity/shared usage.

## Scripts

- `dev`: start development server
- `build`: production build
- `start`: run built app
- `lint`: run ESLint

## Notes

- React Query caches and manages async server state.
- Zustand stores handle client state (filters, current request, paging).
- Mapbox search is used for address suggestions; results are mapped to the app’s internal shape.
