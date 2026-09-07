# MDB — Movie & TV Browser (Web + LG webOS TV)

A movie and TV show browser that runs both as a standard web app **and** as a native LG webOS TV app with full remote-control (D-pad) navigation. Browse trending titles, dive into details with trailers and ratings from multiple sources, see exactly which streaming services carry each title in your country, and launch straight into the streaming app on your TV via deep links.

## Features

- **Browse & discover** — trending movies and TV shows, genre pages, and detailed media pages with cast, trailers, and similar titles
- **Multi-source ratings** — TMDB scores plus IMDb and Rotten Tomatoes ratings via OMDb
- **Streaming availability** — automatically detects your country (IP geolocation, with manual override) and shows which streaming services carry each title there
- **Deep links** — per-title deep links into streaming services; on webOS these launch the target app directly with Luna launch parameters
- **Roulette** — can't decide? Spin for a random title, filtered by genre, year, minimum score (TMDB/IMDb/RT), and your subscribed streaming services — sourced from all of TMDB or your own wishlist
- **Accounts** — Firebase email/password auth with wishlist, watched list, and settings synced through Firestore (optimistic updates)
- **TV-first UX** — spatial navigation for D-pad remotes, media key handling, auto-scroll on focus, safe-area padding, and 1080p rendering that webOS upscales to 4K

## Tech Stack

- **React 19** + **TypeScript**, **Vite**, **Tailwind CSS**
- **TanStack React Query** for server state
- **React Router 7** (`HashRouter` — required for webOS sideloading)
- **Firebase Auth + Firestore**
- **@noriginmedia/norigin-spatial-navigation** for TV D-pad focus management
- **APIs:** TMDB (v3 + v4), OMDb, Streaming Availability (movieofthenight), ip-api.com
- **webOS:** ares-cli packaging, `webOSTV.js`, Luna service launch params

## Getting Started

```bash
npm install
cp .env.example .env   # fill in keys (see below)
npm run dev
```

Required environment variables (all `VITE_`-prefixed):

| Variable | Purpose |
|---|---|
| `VITE_TMDB_API_KEY` / `VITE_TMDB_READ_TOKEN` | TMDB media data + watch providers |
| `VITE_FIREBASE_*` | Firebase Auth + Firestore |
| `VITE_OMDB_API_KEY` | IMDb / Rotten Tomatoes scores (optional) |
| `VITE_STREAMING_API_KEY` | Per-title deep links (optional) |
| `VITE_WATCH_REGION` | Country override, e.g. `DK` (optional — auto-detected) |

### TV build (LG webOS)

Requires [ares-cli](https://webostv.developer.lge.com/develop/tools/cli-introduction) and a TV in developer mode:

```bash
npm run build:tv     # production build + webOS manifest/icons
npm run package:tv   # package into .ipk
npm run install:tv   # sideload to connected TV
npm run launch:tv    # launch on TV
npm run inspect:tv   # remote DevTools
```

## Architecture Notes

- **Region resolution** priority: Firestore user setting → build/runtime config → IP detection → `US` fallback
- **Watch providers**: TMDB `/watch/providers` filtered to the resolved region; discover queries can filter by `watch_region` + `with_watch_providers`
- **webOS deep links**: `src/utils/webosProviders.ts` maps TMDB provider IDs to webOS app IDs and builds `contentTarget` launch params from deep-link URLs; a dev test bench lives at `/#/dev/deeplink-test`
- **Firestore layout**: `users/{uid}/wishlist`, `users/{uid}/watched`, `users/{uid}/meta/settings`
- **Type hierarchy**: `MediaBase → Media → MediaDetails → MovieDetails | SeriesDetails`, with TMDB's `name`/`title` inconsistency normalized at the API layer
