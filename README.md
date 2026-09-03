# Fondue Tour 2026

A pocket roadbook for a five-day Alpine drive from Zürich to Lugano, crossing France, Italy and Switzerland. It carries the day-by-day plan, an interactive route map, restart-from-any-stop navigation links and downloadable TomTom GPX tracks.

**Live site:** https://jayfarei.github.io/fondue-tour-2026/

## What is in here

| Path | What it holds |
| --- | --- |
| `app/page.tsx` | The page itself: hero, roadbook days, essentials, homeward leg |
| `components/stage-profile.tsx` | The elevation profile, drawn stage-race style |
| `components/tour-map.tsx` | Leaflet route map and the restart navigator |
| `data/tour-routes.json` | Days, stops and coordinates. The source of truth for the routes |
| `data/tour-elevation.json` | Generated elevation samples and pass positions |
| `scripts/build-routes.mjs` | Builds GPX and GeoJSON from the route data via OSRM |
| `scripts/build-elevation.mjs` | Samples ground elevation along the route via Open-Meteo |
| `scripts/build-static.mjs` | Assembles the static bundle published to GitHub Pages |

## Running it

```bash
npm install
npm run dev
```

Regenerate the derived files only when the route data changes:

```bash
npm run routes      # GPX and GeoJSON tracks
npm run elevation   # elevation profile (cached, safe to re-run)
```

## Publishing

The page is built to run in two places from one source.

**GitHub Pages**, a fully static bundle served from a sub-path:

```bash
NEXT_PUBLIC_BASE_PATH=/fondue-tour-2026 \
NEXT_PUBLIC_SITE_URL=https://jayfarei.github.io \
npm run build:static
```

That writes `dist-static/`, which is published to the `gh-pages` branch. Setting `NEXT_PUBLIC_BASE_PATH` switches the build to unoptimized images and prefixes every hand-written asset URL, because a static host has no image optimiser and serves the project from `/fondue-tour-2026/`.

**Cloudflare**, the default build, unchanged by any of the above:

```bash
npm run build
```

## Elevation data

The profile is not drawn by hand. `scripts/build-elevation.mjs` walks the generated route every 400 metres, asks Open-Meteo for ground elevation, then snaps each named pass to the nearest local maximum. Every pass lands within about 65 metres of its published altitude. Climb categories follow stage-racing convention: HC above 2,400 m, then 1, 2 and 3.

Route and elevation data are indicative. Live pass status, closures and weather always take precedence.
