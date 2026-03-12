import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useWatchProviders } from '../services/api';
import { WEBOS_PROVIDER_MAP, launchWebOSApp } from '../utils/webosProviders';

interface WatchProviderButtonsProps {
  mediaType: 'movie' | 'tv';
  mediaId: number;
  region?: string;
}

const WatchProviderButtons: React.FC<WatchProviderButtonsProps> = ({
  mediaType,
  mediaId,
  region,
}) => {
  const { data: providers, isLoading } = useWatchProviders(mediaType, mediaId, region);

  if (isLoading || !providers?.flatrate?.length) return null;

  const handleProviderClick = (providerId: number, providerLink?: string) => {
    const webosInfo = WEBOS_PROVIDER_MAP[providerId];
    if (webosInfo) {
      launchWebOSApp(webosInfo.appId, providerLink || providers.link);
    } else if (providerLink || providers.link) {
      window.open(providerLink || providers.link, '_blank');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-white font-semibold text-base">Where to Watch</h3>
      <div className="flex flex-wrap gap-2">
        {providers.flatrate.map((provider) => (
          <button
            key={provider.provider_id}
            onClick={() => handleProviderClick(provider.provider_id, providers.link)}
            className="flex items-center gap-2 bg-bg-paper hover:bg-white/10 border border-white/10 px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <img
              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
              alt={provider.provider_name}
              className="w-6 h-6 rounded object-cover"
            />
            <span className="text-white text-sm font-medium">{provider.provider_name}</span>
            <ExternalLink className="w-3.5 h-3.5 text-white/40" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default WatchProviderButtons;
