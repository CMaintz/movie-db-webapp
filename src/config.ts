/**
 * Runtime configuration — reads from window.__APP_CONFIG__ (set by public/appconfig.js)
 * with build-time .env vars as fallback.
 *
 * public/appconfig.js is loaded as a regular <script> tag in index.html before the
 * app bundle, so the values are always available synchronously when this module evaluates.
 */

declare global {
  interface Window {
    __APP_CONFIG__?: Record<string, string>;
  }
}

const r = (key: string, envFallback: string): string =>
  window.__APP_CONFIG__?.[key] || envFallback;

export const config = {
  tmdbApiKey:    r('tmdbApiKey',    import.meta.env.VITE_TMDB_API_KEY    || ''),
  tmdbReadToken: r('tmdbReadToken', import.meta.env.VITE_TMDB_READ_TOKEN || ''),
  omdbApiKey:    r('omdbApiKey',    import.meta.env.VITE_OMDB_API_KEY    || ''),
  watchRegion:   r('watchRegion',   import.meta.env.VITE_WATCH_REGION    || 'US'),
} as const;
