# LULC Watch — Frontend v2

Vite + React + TypeScript + MapLibre GL JS dashboard. Light theme. Bun runtime.

## Stack
| Concern    | Choice |
|------------|--------|
| Bundler    | Vite 5 |
| Runtime    | Bun |
| UI         | React 18 + TypeScript |
| Styling    | Tailwind CSS — warm light design system |
| Fonts      | Plus Jakarta Sans + JetBrains Mono |
| Map        | MapLibre GL JS (WebGL, free) |
| Map compare| @maplibre/maplibre-gl-compare |
| Basemap    | OpenFreeMap Liberty (free, no token) |
| Charts     | Recharts |

## Why MapLibre over Leaflet
- WebGL rendering — smooth zoom/pan even with raster overlays
- `maplibre-gl-compare` plugin gives a proper swipe handle, not just a CSS divider
- Beautiful free basemap (OpenFreeMap Liberty) via a style JSON — no token needed
- Future-proof: can add vector layers, 3D, custom styling later

## Setup
```bash
bun install
cp .env.example .env.local
bun dev          # → http://localhost:3000
```

Backend must be running on port 3001.
Vite proxy forwards `/api/*` → `http://localhost:3001` automatically.

## Production build
```bash
bun run build    # output in dist/
```
Deploy `dist/` to Vercel / Netlify / Cloudflare Pages.
Set env var: `VITE_API_URL=https://your-backend.railway.app`
