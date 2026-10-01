import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserSettings } from './useUserSettings';
import { config } from '../config';
import { getDetectedRegion } from '../utils/geoRegion';

/**
 * Returns the effective watch region for the current user.
 * Priority:
 *   1. Firestore user setting (if logged in)
 *   2. Runtime config (appconfig.js / VITE_WATCH_REGION)
 *   3. IP-based geolocation (cached per session)
 *   4. 'US' only as an absolute last resort while IP detection is in-flight
 */
export const useWatchRegion = (): string => {
  const { user } = useAuth();
  const { settings } = useUserSettings();
  const [detectedRegion, setDetectedRegion] = useState<string | null>(null);

  useEffect(() => {
    getDetectedRegion().then((region) => {
      if (region) setDetectedRegion(region);
    });
  }, []);

  // Priority 1: authenticated user's saved setting
  if (user && settings.watchRegion) return settings.watchRegion;
  // Priority 2: runtime config
  if (config.watchRegion && config.watchRegion !== 'US') return config.watchRegion;
  // Priority 3: IP detection result
  if (detectedRegion) return detectedRegion;
  // Priority 4: config fallback (may be 'US') or absolute fallback
  return config.watchRegion || 'US';
};
