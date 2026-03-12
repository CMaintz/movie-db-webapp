/**
 * Copy this file to appconfig.js and fill in your API keys.
 * appconfig.js is loaded before the app bundle so values are available at startup.
 * It is gitignored — you only need to supply it when building/sideloading for WebOS.
 *
 * To update keys on the TV without rebuilding:
 *   1. SSH into the TV (LG Developer Mode → add device in ares-setup-device)
 *   2. Edit this file at: /media/developer/apps/<your-app-id>/appconfig.js
 *   3. Restart the app
 */
window.__APP_CONFIG__ = {
  tmdbApiKey:    '',   // from themoviedb.org → Settings → API
  tmdbReadToken: '',   // from themoviedb.org → Settings → API → Read Access Token
  omdbApiKey:    '',   // from omdbapi.com/apikey.aspx  (optional — IMDb/RT scores)
  watchRegion:   'US', // ISO 3166-1 country code for streaming availability
};
