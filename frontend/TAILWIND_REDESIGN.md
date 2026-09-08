# FusionOps Tailwind redesign

This package redesigns the frontend around Tailwind CSS v4 utility classes. Custom component CSS was removed; the only app stylesheet is `src/app/globals.css`, which contains the Tailwind entry import.

## Included
- Dark aviation-operations UI with responsive sidebar/navigation.
- Animated radar login scene using Tailwind utilities and built-in animations.
- Redesigned dashboard with live map, KPI cards and priority incidents.
- Redesigned tracks, data sources, alerts, health, settings, users and roles pages.
- Responsive tables, drawers, dialogs and command palette.
- Existing Laravel API, Zustand stores and realtime services are preserved.

## Setup
1. Replace your existing `src/` with the supplied `src/`.
2. Keep your existing `package.json` if it already matches the uploaded dependencies, or use the included one.
3. Add/keep `postcss.config.mjs` with the Tailwind v4 PostCSS plugin.
4. Run `npm install`, then `npm run dev`.

The map still uses MapLibre's package stylesheet because MapLibre requires its own runtime CSS for map rendering/controls; no custom project stylesheet is used for the UI.
