import React from 'react';
import { useFocusable, FocusContext } from '@noriginmedia/norigin-spatial-navigation';
import { ExternalLink, Tv } from 'lucide-react';
import { useWatchProviders } from '../services/api';
import { useDeepLinks, findDeepLinkForProvider } from '../services/streamingAvailability';
import { WEBOS_PROVIDER_MAP, launchWebOSApp, isWebOS } from '../utils/webosProviders';

interface WatchProviderButtonsProps {
  mediaType: 'movie' | 'tv';
  mediaId: number;
  region?: string;
}

const ProviderButton: React.FC<{
  provider: { provider_id: number; provider_name: string; logo_path: string };
  hasDeepLink: boolean;
  onClick: () => void;
}> = ({ provider, hasDeepLink, onClick }) => {
  const { ref, focused } = useFocusable({ onEnterPress: onClick });
  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      onClick={onClick}
      className={`flex items-center gap-2 bg-bg-paper hover:bg-white/10 border border-white/10 px-3 py-2 rounded-lg transition-colors focus:outline-none ${
        focused ? 'ring-2 ring-primary bg-white/10' : ''
      }`}
      title={hasDeepLink ? `Open in ${provider.provider_name}` : provider.provider_name}
    >
      <img
        src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
        alt={provider.provider_name}
        className="w-6 h-6 rounded object-cover"
      />
      <span className="text-white text-sm font-medium">{provider.provider_name}</span>
      {hasDeepLink ? (
        <Tv className="w-3.5 h-3.5 text-green-400" />
      ) : (
        <ExternalLink className="w-3.5 h-3.5 text-white/40" />
      )}
    </button>
  );
};

const WatchProviderButtons: React.FC<WatchProviderButtonsProps> = ({
  mediaType,
  mediaId,
  region,
}) => {
  const { data: providers, isLoading } = useWatchProviders(mediaType, mediaId, region);
  const { data: deepLinks } = useDeepLinks(mediaType, mediaId, region);

  const { ref, focusKey } = useFocusable({
    trackChildren: true,
  });

  if (isLoading || !providers?.flatrate?.length) return null;

  const handleProviderClick = (providerId: number) => {
    // Try to find a deep link for this provider
    const deepLink = deepLinks ? findDeepLinkForProvider(deepLinks, providerId) : null;
    const webosInfo = WEBOS_PROVIDER_MAP[providerId];

    if (isWebOS() && webosInfo) {
      // On webOS: launch the app with deep link params if available
      launchWebOSApp(
        webosInfo.appId,
        deepLink?.link,
        providerId,
        providers.link
      );
    } else if (deepLink?.link) {
      // In browser: open the deep link directly (goes to the title on the service)
      window.open(deepLink.link, '_blank');
    } else if (providers.link) {
      // Fallback: open TMDB's "where to watch" page
      window.open(providers.link, '_blank');
    }
  };

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref as React.RefObject<HTMLDivElement>} className="flex flex-col gap-3">
        <h3 className="text-white font-semibold text-base">Where to Watch</h3>
        <div className="flex flex-wrap gap-2">
          {providers.flatrate.map((provider) => {
            const hasDeepLink = deepLinks
              ? !!findDeepLinkForProvider(deepLinks, provider.provider_id)
              : false;
            return (
              <ProviderButton
                key={provider.provider_id}
                provider={provider}
                hasDeepLink={hasDeepLink}
                onClick={() => handleProviderClick(provider.provider_id)}
              />
            );
          })}
        </div>
        {deepLinks && deepLinks.length > 0 && (
          <p className="text-white/40 text-xs flex items-center gap-1">
            <Tv className="w-3 h-3" /> = direct link to title
          </p>
        )}
      </div>
    </FocusContext.Provider>
  );
};

export default WatchProviderButtons;
