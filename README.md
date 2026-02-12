# Simple Calorie Counter

A progressive web app for tracking daily calorie intake. Set a daily goal, log what you eat, and see your progress at a glance.

**Try it out:** [https://daverendell.github.io/simple-calorie-counter/](https://daverendell.github.io/simple-calorie-counter/)

## Disclaimer

This project is an experiment in vibe coding — built almost entirely through AI-assisted development with minimal manual editing. It is not intended as a polished or production-grade application.

## Features

- Daily calorie tracking with a configurable goal
- Drag-and-drop reordering of entries
- Meal placeholders for auto-populating daily entries
- "Reuse Recent Entry" for quick re-adding of past foods
- Offline support (PWA with IndexedDB storage)
- Installable on mobile and desktop

## Tech Stack

- React 19, TypeScript, Vite
- IndexedDB via `idb` for client-side persistence
- `vite-plugin-pwa` for service worker / offline support
- Deployed to GitHub Pages via Actions

## Development

```sh
bun install
bun run dev       # Start dev server
bun run build     # Type-check and production build
bun run test      # Run tests
bun run lint      # ESLint
bun run format    # Prettier
```
