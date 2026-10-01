import { useQuery } from '@tanstack/react-query';
import { config } from '../config';

const BASE_URL = 'https://api.movieofthenight.com/v4';

// --- Types ---

export interface StreamingService {
  id: string;
  name: string;
  homePage: string;
  themeColorCode: string;
}

export interface StreamingOption {
  service: StreamingService;
  type: 'subscription' | 'free' | 'rent' | 'buy' | 'addon';
  link: string;
  quality?: string;
  price?: {
    amount: string;
    currency: string;
    formatted: string;
  };
  addon?: {
    id: string;
    name: string;
  };
}

export interface DeepLinkResult {
  /** Streaming Availability service ID (e.g. "netflix", "prime", "disney") */
  serviceId: string;
  serviceName: string;
  /** Direct deep link URL to the title on this service */
  link: string;
  type: StreamingOption['type'];
}

// --- Service ID → TMDB provider_id mapping ---
// Used to match streaming availability results back to TMDB provider buttons.

const SERVICE_TO_TMDB_PROVIDER: Record<string, number> = {
  netflix: 8,
  prime: 9,
  disney: 337,
  apple: 350,
  max: 1899,
  hulu: 15,
  crunchyroll: 283,
  paramount: 531,
  peacock: 386,
  mubi: 11,
  curiosity: 190,
  starz: 43,
  showtime: 37,
};

const TMDB_PROVIDER_TO_SERVICE: Record<number, string> = Object.fromEntries(
  Object.entries(SERVICE_TO_TMDB_PROVIDER).map(([k, v]) => [v, k])
);

export const getServiceIdForProvider = (tmdbProviderId: number): string | null =>
  TMDB_PROVIDER_TO_SERVICE[tmdbProviderId] ?? null;

export const getTmdbProviderForService = (serviceId: string): number | null =>
  SERVICE_TO_TMDB_PROVIDER[serviceId] ?? null;

// --- Fetch ---

export const getDeepLinks = async (
  mediaType: 'movie' | 'tv',
  tmdbId: number,
  country?: string
): Promise<DeepLinkResult[]> => {
  if (!config.streamingApiKey) return [];

  const showId = `${mediaType}/${tmdbId}`;
  const params = new URLSearchParams();
  if (country) params.set('country', country.toLowerCase());
  params.set('series_granularity', 'show');
  params.set('output_language', 'en');

  const url = `${BASE_URL}/shows/${showId}?${params.toString()}`;

  const res = await fetch(url, {
    headers: { 'X-API-Key': config.streamingApiKey },
  });

  if (!res.ok) {
    if (res.status === 404) return []; // title not in their database
    console.warn(`Streaming Availability API ${res.status}: ${showId}`);
    return [];
  }

  const data = await res.json();

  // streamingOptions is { [countryCode]: StreamingOption[] }
  const allOptions: StreamingOption[] = country
    ? (data.streamingOptions?.[country.toLowerCase()] ?? [])
    : Object.values(data.streamingOptions ?? {}).flat() as StreamingOption[];

  // Deduplicate: prefer subscription > free > addon > rent > buy, one per service
  const typePriority: Record<string, number> = {
    subscription: 0,
    free: 1,
    addon: 2,
    rent: 3,
    buy: 4,
  };

  const bestPerService = new Map<string, DeepLinkResult>();

  for (const opt of allOptions) {
    const existing = bestPerService.get(opt.service.id);
    const existingPriority = existing ? (typePriority[existing.type] ?? 99) : 99;
    const currentPriority = typePriority[opt.type] ?? 99;

    if (currentPriority < existingPriority) {
      bestPerService.set(opt.service.id, {
        serviceId: opt.service.id,
        serviceName: opt.service.name,
        link: opt.link,
        type: opt.type,
      });
    }
  }

  return Array.from(bestPerService.values());
};

/** Lookup a deep link for a specific TMDB provider ID from a set of results. */
export const findDeepLinkForProvider = (
  deepLinks: DeepLinkResult[],
  tmdbProviderId: number
): DeepLinkResult | null => {
  const serviceId = getServiceIdForProvider(tmdbProviderId);
  if (!serviceId) return null;
  return deepLinks.find((dl) => dl.serviceId === serviceId) ?? null;
};

// --- React Query hook ---

export const useDeepLinks = (
  mediaType: 'movie' | 'tv',
  tmdbId: number,
  country?: string
) => {
  return useQuery<DeepLinkResult[]>({
    queryKey: ['deepLinks', mediaType, tmdbId, country],
    queryFn: () => getDeepLinks(mediaType, tmdbId, country),
    enabled: !!config.streamingApiKey && !!tmdbId,
    staleTime: 1000 * 60 * 60, // 1 hour — deep links rarely change
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
