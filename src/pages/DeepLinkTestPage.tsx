import React, { useState, useMemo } from 'react';
import { isWebOS } from '../utils/webosProviders';
import { config } from '../config';

/**
 * Developer-only page for testing webOS deep link launch parameters.
 * Accessible at /#/dev/deeplink-test
 *
 * Workflow:
 *  1. Use the API Lookup to fetch real deep link URLs for a known title.
 *  2. Select a provider preset to populate the App ID + Content URL.
 *  3. Cycle through the format presets for that provider to find which one
 *     actually deep links to the title on hardware.
 *  4. Note working formats in the Launch Log, then update webosProviders.ts.
 */

interface TestResult {
  timestamp: string;
  appId: string;
  label: string;
  params: Record<string, any>;
  status: 'success' | 'failure';
  error?: string;
}

interface FormatPreset {
  label: string;
  /** Build the Luna `params` object given the content URL. */
  build: (url: string) => Record<string, any>;
}

// --- Per-provider format presets ---
// Each provider has several known/suspected param formats to try on hardware.

const extractId = (url: string, pattern: RegExp): string => {
  const m = url.match(pattern);
  return m ? m[1] : url;
};

const PROVIDER_FORMATS: Record<string, FormatPreset[]> = {
  netflix: [
    {
      label: 'contentTarget (full URL)',
      build: (url) => ({ contentTarget: url }),
    },
    {
      label: 'contentTarget (netflix.com/title/ID)',
      build: (url) => {
        const id = extractId(url, /netflix\.com\/(?:title|watch)\/(\d+)/);
        return { contentTarget: `https://www.netflix.com/title/${id}` };
      },
    },
    {
      label: 'contentId: m=URL',
      build: (url) => {
        const id = extractId(url, /netflix\.com\/(?:title|watch)\/(\d+)/);
        return { contentId: `m=https://www.netflix.com/title/${id}` };
      },
    },
    {
      label: 'contentId: numeric ID only',
      build: (url) => {
        const id = extractId(url, /netflix\.com\/(?:title|watch)\/(\d+)/);
        return { contentId: id };
      },
    },
    {
      label: 'contentTarget: nflx://www.netflix.com/title/ID',
      build: (url) => {
        const id = extractId(url, /netflix\.com\/(?:title|watch)\/(\d+)/);
        return { contentTarget: `nflx://www.netflix.com/title/${id}` };
      },
    },
  ],
  amazon: [
    {
      label: 'contentTarget (full URL)',
      build: (url) => ({ contentTarget: url }),
    },
    {
      label: 'contentTarget (amazon.com/dp/ASIN)',
      build: (url) => {
        const asin = extractId(url, /\/dp\/([A-Z0-9]+)/i);
        return { contentTarget: `https://www.amazon.com/dp/${asin}` };
      },
    },
    {
      label: 'contentTarget (primevideo.com/detail/ASIN)',
      build: (url) => {
        const asin = extractId(url, /(?:\/dp\/|\/detail\/)([A-Z0-9]+)/i);
        return { contentTarget: `https://www.primevideo.com/detail/${asin}` };
      },
    },
    {
      label: 'contentId: ASIN only',
      build: (url) => {
        const asin = extractId(url, /(?:\/dp\/|\/detail\/)([A-Z0-9]+)/i);
        return { contentId: asin };
      },
    },
    {
      label: 'source + contentId',
      build: (url) => {
        const asin = extractId(url, /(?:\/dp\/|\/detail\/)([A-Z0-9]+)/i);
        return { source: 'piv', contentId: asin };
      },
    },
  ],
  'com.disney.disneyplus-prod': [
    {
      label: 'contentTarget (full URL)',
      build: (url) => ({ contentTarget: url }),
    },
    {
      label: 'contentTarget (disneyplus.com/video/UUID)',
      build: (url) => {
        const uuid = extractId(url, /disneyplus\.com\/(?:video|movies|series)\/([a-f0-9-]+)/i);
        return { contentTarget: `https://www.disneyplus.com/video/${uuid}` };
      },
    },
    {
      label: 'contentId: UUID only',
      build: (url) => {
        const uuid = extractId(url, /disneyplus\.com\/(?:video|movies|series)\/([a-f0-9-]+)/i);
        return { contentId: uuid };
      },
    },
    {
      label: 'contentId: disneyplus://video/UUID',
      build: (url) => {
        const uuid = extractId(url, /disneyplus\.com\/(?:video|movies|series)\/([a-f0-9-]+)/i);
        return { contentId: `disneyplus://video/${uuid}` };
      },
    },
  ],
  'com.apple.appletv': [
    {
      label: 'contentTarget (full URL)',
      build: (url) => ({ contentTarget: url }),
    },
    {
      label: 'contentId (full URL)',
      build: (url) => ({ contentId: url }),
    },
    {
      label: 'contentTarget: com.apple.tv://... scheme',
      build: (url) => {
        const path = url.replace(/^https?:\/\/tv\.apple\.com/, '');
        return { contentTarget: `com.apple.tv:/${path}` };
      },
    },
  ],
  'com.hbo.max': [
    {
      label: 'contentTarget (full URL)',
      build: (url) => ({ contentTarget: url }),
    },
    {
      label: 'contentTarget (play.max.com/video/ID)',
      build: (url) => {
        const id = extractId(url, /play\.(?:max|hbomax)\.com\/(?:movie|show|video)\/([a-zA-Z0-9-]+)/);
        return { contentTarget: `https://play.max.com/video/${id}` };
      },
    },
    {
      label: 'contentId: slug only',
      build: (url) => {
        const id = extractId(url, /play\.(?:max|hbomax)\.com\/(?:movie|show|video)\/([a-zA-Z0-9-]+)/);
        return { contentId: id };
      },
    },
    {
      label: 'contentId: hbomax://... scheme',
      build: (url) => {
        const id = extractId(url, /play\.(?:max|hbomax)\.com\/(?:movie|show|video)\/([a-zA-Z0-9-]+)/);
        return { contentId: `hbomax://video/${id}` };
      },
    },
  ],
  'com.hulu.plus': [
    {
      label: 'contentTarget (full URL)',
      build: (url) => ({ contentTarget: url }),
    },
    {
      label: 'contentId: UUID only',
      build: (url) => {
        const uuid = extractId(url, /hulu\.com\/(?:movie|series|watch)\/([a-f0-9-]+)/i);
        return { contentId: uuid };
      },
    },
    {
      label: 'contentTarget: hulu://watch/UUID',
      build: (url) => {
        const uuid = extractId(url, /hulu\.com\/(?:movie|series|watch)\/([a-f0-9-]+)/i);
        return { contentTarget: `hulu://watch/${uuid}` };
      },
    },
  ],
  'youtube.leanback.v4': [
    {
      label: 'contentTarget (full URL)',
      build: (url) => ({ contentTarget: url }),
    },
    {
      label: 'contentTarget (youtube.com/watch?v=ID)',
      build: (url) => {
        const vid = extractId(url, /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        return { contentTarget: `https://www.youtube.com/watch?v=${vid}` };
      },
    },
    {
      label: 'contentId: video ID only',
      build: (url) => {
        const vid = extractId(url, /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        return { contentId: vid };
      },
    },
  ],
};

// Fallback for unknown/custom app IDs
const GENERIC_FORMATS: FormatPreset[] = [
  { label: 'contentTarget (full URL)', build: (url) => ({ contentTarget: url }) },
  { label: 'contentId (full URL)', build: (url) => ({ contentId: url }) },
];

// Also try alternate app IDs for providers whose real ID is uncertain
const ALTERNATE_APP_IDS: Record<string, string[]> = {
  netflix: ['netflix', 'com.netflix.mediaclient'],
  amazon: ['amazon', 'amazon.prime.video', 'com.amazon.avod'],
  'com.disney.disneyplus-prod': ['com.disney.disneyplus-prod', 'com.disney.disneyplus'],
  'com.hbo.max': ['com.hbo.max', 'com.hbo.hbomax'],
  'com.hulu.plus': ['com.hulu.plus', 'hulu'],
  'youtube.leanback.v4': ['youtube.leanback.v4', 'youtube.leanback.v4'],
};

const PRESET_PROVIDERS = [
  { label: 'Netflix', appId: 'netflix', sampleUrl: 'https://www.netflix.com/title/80002472' },
  { label: 'Prime Video', appId: 'amazon', sampleUrl: 'https://www.amazon.com/dp/B08F9WCF9Y' },
  { label: 'Disney+', appId: 'com.disney.disneyplus-prod', sampleUrl: 'https://www.disneyplus.com/video/some-uuid' },
  { label: 'Apple TV', appId: 'com.apple.appletv', sampleUrl: 'https://tv.apple.com/show/some-show' },
  { label: 'HBO Max', appId: 'com.hbo.max', sampleUrl: 'https://play.max.com/movie/some-id' },
  { label: 'Hulu', appId: 'com.hulu.plus', sampleUrl: 'https://www.hulu.com/watch/some-uuid' },
  { label: 'YouTube', appId: 'youtube.leanback.v4', sampleUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
];

const DeepLinkTestPage: React.FC = () => {
  const [appId, setAppId] = useState('netflix');
  const [contentUrl, setContentUrl] = useState('https://www.netflix.com/title/80002472');
  const [selectedFormatIdx, setSelectedFormatIdx] = useState(0);
  const [results, setResults] = useState<TestResult[]>([]);
  const [tmdbId, setTmdbId] = useState('');
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [deepLinkResults, setDeepLinkResults] = useState<string>('');
  const [fetchingDeepLinks, setFetchingDeepLinks] = useState(false);

  const onWebOS = isWebOS();

  const formats = useMemo(
    () => PROVIDER_FORMATS[appId] ?? GENERIC_FORMATS,
    [appId]
  );

  const altIds = ALTERNATE_APP_IDS[appId] ?? [appId];

  const selectPreset = (preset: typeof PRESET_PROVIDERS[0]) => {
    setAppId(preset.appId);
    setContentUrl(preset.sampleUrl);
    setSelectedFormatIdx(0);
  };

  const currentFormat = formats[selectedFormatIdx] ?? formats[0];
  const currentParams = currentFormat.build(contentUrl);

  const doLaunch = (launchAppId: string, params: Record<string, any> | null, label: string) => {
    const result: TestResult = {
      timestamp: new Date().toISOString().split('T')[1].split('.')[0],
      appId: launchAppId,
      label,
      params: params ?? {},
      status: 'success',
    };

    const launchParameters: Record<string, any> = { id: launchAppId };
    if (params) launchParameters.params = params;

    const webOS = (window as any).webOS;
    if (webOS?.service?.request) {
      webOS.service.request('luna://com.webos.applicationManager', {
        method: 'launch',
        parameters: launchParameters,
        onSuccess: () => {
          result.status = 'success';
          setResults((prev) => [result, ...prev].slice(0, 50));
        },
        onFailure: (e: any) => {
          result.status = 'failure';
          result.error = JSON.stringify(e);
          setResults((prev) => [result, ...prev].slice(0, 50));
        },
      });
    } else {
      result.status = 'failure';
      result.error = 'Not on webOS — Luna service unavailable';
      setResults((prev) => [result, ...prev].slice(0, 50));
    }
  };

  const fetchDeepLinks = async () => {
    if (!config.streamingApiKey || !tmdbId) return;
    setFetchingDeepLinks(true);
    try {
      const showId = `${mediaType}/${tmdbId}`;
      const url = `https://api.movieofthenight.com/v4/shows/${showId}?series_granularity=show&output_language=en`;
      const res = await fetch(url, {
        headers: { 'X-API-Key': config.streamingApiKey },
      });
      if (!res.ok) {
        setDeepLinkResults(`Error ${res.status}: ${await res.text()}`);
      } else {
        const data = await res.json();
        setDeepLinkResults(JSON.stringify(data.streamingOptions, null, 2));
      }
    } catch (e: any) {
      setDeepLinkResults(`Fetch error: ${e.message}`);
    }
    setFetchingDeepLinks(false);
  };

  const inputClass = 'w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary';
  const btnClass = 'px-4 py-2 rounded text-sm font-medium transition-colors';

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-white text-2xl font-bold mb-2">Deep Link Test Bench</h1>
      <p className="text-white/60 text-sm mb-6">
        {onWebOS ? 'Running on webOS — Luna service available' : 'Not on webOS — launch calls will be simulated'}
      </p>

      {/* Provider presets */}
      <div className="mb-6">
        <h2 className="text-white font-semibold text-sm mb-2">Provider</h2>
        <div className="flex flex-wrap gap-2">
          {PRESET_PROVIDERS.map((p) => (
            <button
              key={p.appId}
              onClick={() => selectPreset(p)}
              className={`${btnClass} ${appId === p.appId ? 'bg-primary text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Launch test form */}
      <div className="bg-bg-paper rounded-xl border border-white/10 p-5 mb-6 flex flex-col gap-4">
        <h2 className="text-white font-semibold">Launch Test</h2>

        {/* App ID + alternates */}
        <div>
          <label className="text-white/60 text-xs mb-1 block">App ID</label>
          <input value={appId} onChange={(e) => setAppId(e.target.value)} className={inputClass} />
          {altIds.length > 1 && (
            <div className="flex gap-2 mt-2">
              <span className="text-white/40 text-xs leading-7">Try:</span>
              {altIds.map((alt) => (
                <button
                  key={alt}
                  onClick={() => setAppId(alt)}
                  className={`text-xs px-2 py-1 rounded ${
                    alt === appId ? 'bg-primary/30 text-primary' : 'bg-white/5 text-white/50 hover:text-white/80'
                  }`}
                >
                  {alt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content URL */}
        <div>
          <label className="text-white/60 text-xs mb-1 block">Content URL (paste from API lookup below)</label>
          <input value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} className={inputClass} />
        </div>

        {/* Format selector */}
        <div>
          <label className="text-white/60 text-xs mb-2 block">
            Param format ({selectedFormatIdx + 1}/{formats.length})
          </label>
          <div className="flex flex-col gap-1.5">
            {formats.map((fmt, i) => (
              <button
                key={i}
                onClick={() => setSelectedFormatIdx(i)}
                className={`text-left text-sm px-3 py-2 rounded border transition-colors ${
                  i === selectedFormatIdx
                    ? 'border-primary bg-primary/15 text-white'
                    : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white/5 rounded p-3">
          <p className="text-white/40 text-xs mb-1">Launch parameters preview:</p>
          <pre className="text-green-400 text-xs overflow-x-auto">
            {JSON.stringify({ id: appId, params: currentParams }, null, 2)}
          </pre>
        </div>

        {/* Launch buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => doLaunch(appId, currentParams, currentFormat.label)}
            className={`${btnClass} bg-primary hover:bg-primary/80 text-white flex-1`}
          >
            Launch with Deep Link
          </button>
          <button
            onClick={() => doLaunch(appId, null, 'no params')}
            className={`${btnClass} bg-white/10 hover:bg-white/20 text-white`}
          >
            Launch (no params)
          </button>
        </div>
      </div>

      {/* Streaming Availability API test */}
      <div className="bg-bg-paper rounded-xl border border-white/10 p-5 mb-6 flex flex-col gap-4">
        <h2 className="text-white font-semibold">Streaming Availability API Lookup</h2>
        {!config.streamingApiKey && (
          <p className="text-amber-400 text-sm">No API key configured. Set VITE_STREAMING_API_KEY in .env</p>
        )}

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-white/60 text-xs mb-1 block">TMDB ID</label>
            <input
              value={tmdbId}
              onChange={(e) => setTmdbId(e.target.value)}
              className={inputClass}
              placeholder="e.g. 597 (Titanic)"
            />
          </div>
          <div>
            <label className="text-white/60 text-xs mb-1 block">Type</label>
            <select value={mediaType} onChange={(e) => setMediaType(e.target.value as any)} className={inputClass}>
              <option value="movie">Movie</option>
              <option value="tv">TV</option>
            </select>
          </div>
        </div>

        <button
          onClick={fetchDeepLinks}
          disabled={!config.streamingApiKey || !tmdbId || fetchingDeepLinks}
          className={`${btnClass} bg-primary hover:bg-primary/80 text-white disabled:opacity-50`}
        >
          {fetchingDeepLinks ? 'Fetching...' : 'Fetch Deep Links'}
        </button>

        {deepLinkResults && (
          <pre className="bg-white/5 rounded p-3 text-xs text-white/80 overflow-x-auto max-h-80 overflow-y-auto whitespace-pre-wrap">
            {deepLinkResults}
          </pre>
        )}
      </div>

      {/* Test results log */}
      <div className="bg-bg-paper rounded-xl border border-white/10 p-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-white font-semibold">Launch Log</h2>
          {results.length > 0 && (
            <button
              onClick={() => setResults([])}
              className="text-white/40 hover:text-white/70 text-xs"
            >
              Clear
            </button>
          )}
        </div>
        {results.length === 0 ? (
          <p className="text-white/40 text-sm">No launches tested yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {results.map((r, i) => (
              <div
                key={i}
                className={`rounded p-3 text-xs border ${
                  r.status === 'success'
                    ? 'bg-green-900/20 border-green-500/30'
                    : 'bg-red-900/20 border-red-500/30'
                }`}
              >
                <div className="flex justify-between mb-1">
                  <span className="text-white font-mono">{r.timestamp} — {r.appId}</span>
                  <span className={r.status === 'success' ? 'text-green-400' : 'text-red-400'}>
                    {r.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-white/50 mb-1">{r.label}</p>
                <pre className="text-white/60 overflow-x-auto">{JSON.stringify(r.params)}</pre>
                {r.error && <p className="text-red-400 mt-1">{r.error}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeepLinkTestPage;
