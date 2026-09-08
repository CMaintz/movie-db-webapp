# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server (Vite)
npm run build     # Type-check and build for production (tsc -b && vite build)
npm run lint      # Run ESLint
npm run typecheck # Type-check without emitting (tsc -b)
npm run test      # Run the vitest suite
npm run coverage  # Run tests with coverage
npm run preview   # Preview production build
```

### TV (webOS) Commands

```bash
npm run build:tv    # Build for TV: production build + copy appinfo.json & icons into dist/
npm run package:tv  # Build + package into .ipk (requires ares-cli)
npm run install:tv  # Package + sideload to connected LG TV
npm run launch:tv   # Launch app on connected TV
npm run inspect:tv  # Open Chrome DevTools inspector for the TV app
```

### The gate

This repo uses the Foundry verb interface. Prefer these over the raw tools — CI
runs the identical verbs, so a green gate locally means a green gate on the PR.

```bash
mise run gate       # lint + typecheck + test + audit. The authoritative check.
mise run fix        # auto-fix, then prune stale lint suppressions
mise run lint       # eslint (non-mutating)
mise run typecheck  # tsc -b
mise run test       # vitest + coverage floor
mise run audit      # npm audit, blocking at critical
habit-hooks         # structural smells, with coaching output
```

Two rules that are enforced in CI, not merely requested:

1. **Never weaken the gate to make it pass.** Do not disable an eslint rule, lower
   a coverage threshold, or hand-edit `eslint-suppressions.json` /
   `.habit-hooks/snooze.json`. Those files are an accepted-debt baseline that may
   only ever shrink. A PR touching both the ruleset and `src/` fails the
   `ruleset-guard` job unless it carries the `ruleset-change` label.
2. **The gate is the oracle, not your judgement.** After any fix, re-run
   `mise run gate` from clean. Its exit code is the evidence — not your summary
   of what you believe you fixed.

Tests live beside the code as `*.test.ts`. The default environment is `node`; add
a `@vitest-environment jsdom` docblock only when a file genuinely needs a DOM,
since jsdom costs roughly 5s per file to boot.

## Environment Setup

Copy `.env.example` to `.env` and fill in the required values:

- `VITE_TMDB_API_KEY` — from [themoviedb.org](https://www.themoviedb.org/)
- `VITE_TMDB_READ_TOKEN` — TMDB v4 read access token (for watch provider data)
- `VITE_OMDB_API_KEY` — from [omdbapi.com](https://www.omdbapi.com/) (optional, for IMDb/Rotten Tomatoes scores)
- `VITE_FIREBASE_*` — from Firebase project settings (Auth + Firestore required)
- `VITE_WATCH_REGION` — ISO 3166-1 alpha-2 country code override (optional; auto-detected from IP if not set)
- `VITE_STREAMING_API_KEY` — from developers.movieofthenight.com (optional, per-title deep links)

All env vars must be prefixed with `VITE_` to be accessible in Vite.

## Architecture Overview

This is a React 19 + TypeScript SPA built with Vite. Runs as both a standard web app and a native LG webOS TV app (sideloaded via .ipk).

### External APIs

| API | Purpose | Auth |
|-----|---------|------|
| **TMDB** (v3 + v4) | Media data, trending, genres, details, watch providers | API key + Bearer token |
| **OMDb** | IMDb ratings, Rotten Tomatoes scores | API key (optional) |
| **ip-api.com** | IP-based geolocation for watch region auto-detection | None (free, 45 req/min) |
| **Firebase Auth** | Email/password authentication | Firebase config |
| **Firestore** | Wishlist, watched list, user settings | Firebase config |
| **Streaming Availability** | Per-title deep links to streaming apps | API key (optional) |

### Watch Region Flow

1. IP auto-detection via ip-api.com (cached per session in `src/utils/geoRegion.ts`)
2. Authenticated users can override in Profile (stored in Firestore)
3. `useWatchRegion()` hook resolves: Firestore > env config > IP detection
4. Used by `WatchProviderButtons`, GenrePage, and RoulettePage to show region-correct streaming availability

### Routing

Uses `HashRouter` (required for webOS sideloading).

### WebOS Packaging

- App manifest: `webos/appinfo.json` (id: `com.mdb.app`, 1920x1080 — auto-scaled to 4K by webOS)
- Icons: `webos/icon.png` (80x80), `webos/largeIcon.png` (130x130)
- Build target: `es2015`
- Platform detection: `src/utils/platform.ts` → `isTV()`

### Theme

Dark theme with primary blue (`#2196f3`). Tailwind CSS with custom color tokens.
