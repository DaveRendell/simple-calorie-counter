# Simple Calorie Counter

PWA for tracking daily calorie intake. React 18 + TypeScript, Vite, IndexedDB via `idb`.

## Commands

- `bun run dev` - Start dev server
- `bun run build` - Type-check and production build
- `bun run test` - Run all tests (Vitest)
- `bun run test:watch` - Run tests in watch mode
- `bun run lint` - ESLint
- `bun run format` - Prettier

## Architecture

- **Data layer**: `src/store/DataStore.ts` defines the interface, `IndexedDBStore` implements it. Swappable via `DataStoreProvider` context.
- **Hooks**: `useEntries(date)`, `useSettings()`, `useDataStore()` consume the context.
- **Pages**: DayView (`/`), EntryForm (`/add`), EditEntry (`/edit/:id`), Settings (`/settings`).
- **Tests**: Unit tests in `tests/unit/`, integration tests in `tests/e2e/`. Uses `fake-indexeddb` for IndexedDB mocking.

## Deployment

GitHub Pages via Actions workflow. Vite `base` and `BrowserRouter basename` are set to `/simple-calorie-counter/`.
