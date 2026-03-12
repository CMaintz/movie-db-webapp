export interface WebOSProviderInfo {
  appId: string;
  deepLinkTemplate?: string;
}

// Maps TMDB provider_id → WebOS app launch info.
// appId values should be confirmed by testing on target hardware.
// deepLinkTemplate uses {contentId} as a placeholder for content-specific deep links.
export const WEBOS_PROVIDER_MAP: Record<number, WebOSProviderInfo> = {
  8:    { appId: 'netflix',                  deepLinkTemplate: 'https://www.netflix.com/watch/{contentId}' },
  9:    { appId: 'amazon.prime.video',       deepLinkTemplate: '' },
  337:  { appId: 'com.disney.disneyplus',    deepLinkTemplate: '' },
  350:  { appId: 'com.apple.appletv',        deepLinkTemplate: '' },
  1899: { appId: 'com.hbo.max',              deepLinkTemplate: '' },
  15:   { appId: 'com.hulu.plus',            deepLinkTemplate: '' },
  283:  { appId: 'crunchyroll',              deepLinkTemplate: '' },
  192:  { appId: 'youtube.leanback.v4',      deepLinkTemplate: 'https://www.youtube.com/watch?v={contentId}' },
  // Add more as IDs are confirmed on the target TV.
};

export const launchWebOSApp = (appId: string, fallbackUrl?: string): void => {
  const webOS = (window as any).webOS;
  if (webOS?.service?.request) {
    webOS.service.request('luna://com.webos.applicationManager', {
      method: 'launch',
      parameters: { id: appId },
      onSuccess: () => {},
      onFailure: (e: any) => {
        console.warn('WebOS launch failed:', e);
        if (fallbackUrl) window.open(fallbackUrl, '_blank');
      },
    });
  } else if (fallbackUrl) {
    window.open(fallbackUrl, '_blank');
  }
};

export const isWebOS = (): boolean => {
  return typeof (window as any).webOS !== 'undefined';
};
