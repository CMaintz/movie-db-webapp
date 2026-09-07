export interface WebOSProviderInfo {
  appId: string;
  /** Extracts a content identifier from a deep link URL for use in Luna launch params. */
  extractContentId?: (url: string) => string | null;
  /** Constructs the Luna launch `params` object given the extracted content ID. */
  buildLaunchParams?: (contentId: string) => Record<string, any>;
}

// --- URL → content ID extractors per provider ---

const extractNetflixId = (url: string): string | null => {
  // e.g. https://www.netflix.com/title/80002472 → 80002472
  const match = url.match(/netflix\.com\/(?:title|watch)\/(\d+)/);
  return match ? match[1] : null;
};

const extractDisneyId = (url: string): string | null => {
  // e.g. https://www.disneyplus.com/video/81361203-cc00-... → UUID
  const match = url.match(/disneyplus\.com\/(?:video|movies|series)\/([a-f0-9-]+)/i);
  return match ? match[1] : null;
};

const extractPrimeId = (url: string): string | null => {
  // e.g. https://www.amazon.com/dp/B08XXXXX or https://www.primevideo.com/detail/ASIN/...
  const dpMatch = url.match(/\/dp\/([A-Z0-9]+)/);
  if (dpMatch) return dpMatch[1];
  const detailMatch = url.match(/\/detail\/([A-Z0-9]+)/);
  return detailMatch ? detailMatch[1] : null;
};

const extractAppleTvId = (url: string): string | null => {
  // e.g. https://tv.apple.com/show/... — pass full URL as content target
  return url.includes('tv.apple.com') ? url : null;
};

const extractMaxId = (url: string): string | null => {
  // e.g. https://play.max.com/movie/abc-123-def → path segment
  const match = url.match(/play\.(?:max|hbomax)\.com\/(?:movie|show|video)\/([a-zA-Z0-9-]+)/);
  return match ? match[1] : null;
};

const extractHuluId = (url: string): string | null => {
  const match = url.match(/hulu\.com\/(?:movie|series|watch)\/([a-f0-9-]+)/i);
  return match ? match[1] : null;
};

const extractYouTubeId = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
};

// --- Luna launch param builders per provider ---
// Each returns the `params` object passed to luna://com.webos.applicationManager/launch

const netflixParams = (contentId: string) => ({
  contentTarget: `https://www.netflix.com/title/${contentId}`,
});

const primeParams = (contentId: string) => ({
  contentTarget: `https://www.amazon.com/dp/${contentId}`,
});

const disneyParams = (contentId: string) => ({
  contentTarget: `https://www.disneyplus.com/video/${contentId}`,
});

const appleTvParams = (contentId: string) => ({
  contentTarget: contentId, // full URL
});

const maxParams = (contentId: string) => ({
  contentTarget: `https://play.max.com/video/${contentId}`,
});

const huluParams = (contentId: string) => ({
  contentTarget: `https://www.hulu.com/watch/${contentId}`,
});

const youtubeParams = (contentId: string) => ({
  contentTarget: `https://www.youtube.com/watch?v=${contentId}`,
});

// --- Provider map (TMDB provider_id → webOS info) ---

export const WEBOS_PROVIDER_MAP: Record<number, WebOSProviderInfo> = {
  8: {
    appId: 'netflix',
    extractContentId: extractNetflixId,
    buildLaunchParams: netflixParams,
  },
  9: {
    appId: 'amazon',
    extractContentId: extractPrimeId,
    buildLaunchParams: primeParams,
  },
  337: {
    appId: 'com.disney.disneyplus-prod',
    extractContentId: extractDisneyId,
    buildLaunchParams: disneyParams,
  },
  350: {
    appId: 'com.apple.appletv',
    extractContentId: extractAppleTvId,
    buildLaunchParams: appleTvParams,
  },
  1899: {
    appId: 'com.hbo.max',
    extractContentId: extractMaxId,
    buildLaunchParams: maxParams,
  },
  15: {
    appId: 'com.hulu.plus',
    extractContentId: extractHuluId,
    buildLaunchParams: huluParams,
  },
  283: {
    appId: 'crunchyroll',
  },
  192: {
    appId: 'youtube.leanback.v4',
    extractContentId: extractYouTubeId,
    buildLaunchParams: youtubeParams,
  },
};

/**
 * Launch a webOS app, optionally with a deep link.
 *
 * @param appId       - webOS app identifier
 * @param deepLinkUrl - Full URL from the Streaming Availability API (optional)
 * @param providerId  - TMDB provider_id to look up extraction/launch logic (optional)
 * @param fallbackUrl - URL to open in browser if Luna launch fails
 */
export const launchWebOSApp = (
  appId: string,
  deepLinkUrl?: string,
  providerId?: number,
  fallbackUrl?: string
): void => {
  const webOS = (window as any).webOS;
  if (!webOS?.service?.request) {
    // Not on webOS — open URL in browser
    const url = deepLinkUrl || fallbackUrl;
    if (url) window.open(url, '_blank');
    return;
  }

  // Build launch parameters
  const launchParams: Record<string, any> = { id: appId };

  if (deepLinkUrl && providerId != null) {
    const providerInfo = WEBOS_PROVIDER_MAP[providerId];
    if (providerInfo?.extractContentId && providerInfo.buildLaunchParams) {
      const contentId = providerInfo.extractContentId(deepLinkUrl);
      if (contentId) {
        launchParams.params = providerInfo.buildLaunchParams(contentId);
      }
    }
  }

  webOS.service.request('luna://com.webos.applicationManager', {
    method: 'launch',
    parameters: launchParams,
    onSuccess: () => {
      console.log(`Launched ${appId}`, launchParams.params ?? '(no deep link)');
    },
    onFailure: (e: any) => {
      console.warn('WebOS launch failed:', e);
      const url = deepLinkUrl || fallbackUrl;
      if (url) window.open(url, '_blank');
    },
  });
};

export const isWebOS = (): boolean => {
  return typeof (window as any).webOS !== 'undefined';
};
