# Deep Linking Research — Streaming Apps on webOS

## Decision: Use Streaming Availability API

**Chosen approach:** [Streaming Availability API](https://www.movieofthenight.com/about/api) by Movie of the Night
- npm package: `streaming-availability`
- Accepts TMDB IDs as input, returns per-title deep link URLs
- Covers 200+ services, 60+ countries
- Free tier available (rate-limited)
- TypeScript client: `npm i streaming-availability`

**Implementation plan:**
- Fetch deep link data **on demand** — only when user opens MediaDetailsPage
- One API call per title view, well within free tier limits
- Extract provider-specific content IDs from returned URLs
- Construct webOS Luna launch params from the extracted IDs

## webOS Launch Parameter Formats (Known)

### Netflix (confirmed working)
```js
// Via Luna service or lgtv2 ssap
{ id: 'netflix', contentId: 'm=https://www.netflix.com/title/80002472' }
// NOTE: Netflix must be fully closed first, then relaunched with contentId
```

### General webOS format (from JustWatch docs)
```json
{"id": "app-id", "params": {"contentTarget": "value"}}
```

### Known webOS App IDs
| Service | App ID |
|---------|--------|
| Netflix | `netflix` |
| Prime Video | `amazon` |
| Disney+ | `com.disney.disneyplus-prod` |
| Apple TV | `com.apple.appletv` |
| YouTube | `youtube.leanback.v4` |
| HBO Max | `com.hbo.max` |
| Hulu | `com.hulu.plus` |
| Crunchyroll | `crunchyroll` |

**Note:** Our `webosProviders.ts` has slightly different IDs for some (e.g., `amazon.prime.video` vs `amazon`). Need to verify on actual hardware which is correct.

## Testing Strategy

Need a way to test `contentTarget` / `contentId` params for each provider on actual webOS hardware:
1. Use `ares-inspect` to open Chrome DevTools on the TV
2. From the JS console, call Luna service directly to test launch params
3. Or use `lgtv2` npm package from a laptop on same network
4. Document working params per provider

Example test via browser console on TV:
```js
window.webOS.service.request('luna://com.webos.applicationManager', {
  method: 'launch',
  parameters: {
    id: 'netflix',
    params: { contentTarget: 'https://www.netflix.com/title/80002472' }
  },
  onSuccess: (r) => console.log('OK', r),
  onFailure: (e) => console.log('FAIL', e)
});
```

Try variations:
- `contentTarget` vs `contentId` as param name
- Full URL vs just the numeric ID
- `m=URL` prefix (Netflix-specific?)

## URL Patterns Per Provider (from Streaming Availability API)

These are the web URLs the API returns — extract the content ID from these:
- Netflix: `https://www.netflix.com/title/60011152/` → ID = `60011152`
- Disney+: `https://www.disneyplus.com/video/81361203-cc00-49dd-b60f-...` → UUID
- Prime Video: `https://www.amazon.com/dp/B08XXXXX` or `https://www.primevideo.com/detail/...`
- Apple TV+: `https://tv.apple.com/show/...`
- HBO Max: `https://play.max.com/movie/...`

## Alternative Approaches (Not Chosen)

### JustWatch Partnership
- Has actual webOS-native `contentTarget` params in their data
- Requires commercial partnership: `data-partner@justwatch.com`
- Their GraphQL API exists but is CORS-blocked and ToS-restricted

### ConnectSDK
- Open-source SDK with `launchNetflix(contentId)` methods
- Requires separate Node.js server on the local network
- Not practical for a self-contained webOS web app

### lgtv2 npm package
- Node.js WebSocket control of LG TVs
- Useful for testing, not for the app itself
- Confirmed Netflix deep linking works via ssap protocol

### TMDB (current)
- Only provides provider availability, not deep links
- Links go to TMDB's own watch page
- No provider-specific content IDs in the API

## Implementation Steps (TODO)

1. Add `streaming-availability` as a dependency
2. Create `src/services/streamingAvailability.ts` with a function that:
   - Takes TMDB ID + media type
   - Returns map of provider_id → deep link URL
   - Caches results in React Query (long staleTime)
3. Update `WatchProviderButtons` to:
   - Fetch deep links when the component mounts (on details page only)
   - When on webOS: extract content ID from URL, construct Luna launch params
   - When in browser: open the deep link URL directly (already works)
4. Update `webosProviders.ts`:
   - Verify app IDs on actual hardware
   - Add URL → contentId extraction logic per provider
   - Add contentTarget param construction per provider
5. Test on actual LG TV:
   - Verify each provider's launch params
   - Document which format works for each
   - Handle edge cases (app not installed, app already running)

## Akash's Notes

- Fetch deep links lazily — only on MediaDetailsPage load, not on browse/grid
- This keeps API usage minimal and avoids rate limit issues
- Need to figure out correct launch params per provider by testing on actual TV hardware
- The `webosProviders.ts` app IDs may need updating (compare with community gist)
