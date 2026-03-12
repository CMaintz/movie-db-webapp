/**
 * Detect the user's country code from their IP address.
 * Uses ip-api.com — free, no API key required, 45 req/min limit.
 * Returns ISO 3166-1 alpha-2 country code (e.g. "US", "GB", "DE").
 * Falls back to "US" on any failure (VPN, network error, etc.).
 */
export const detectWatchRegion = async (): Promise<string> => {
  try {
    const res = await fetch('https://ip-api.com/json?fields=countryCode', { cache: 'no-store' });
    const data = await res.json();
    if (data.status === 'success' && typeof data.countryCode === 'string') {
      return data.countryCode.toUpperCase();
    }
  } catch {
    // silently fall through
  }
  return 'US';
};

/** Countries shown in the region selector, ordered by streaming market size. */
export const COUNTRIES: { code: string; name: string }[] = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'IE', name: 'Ireland' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AR', name: 'Argentina' },
  { code: 'SG', name: 'Singapore' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'TR', name: 'Turkey' },
];
