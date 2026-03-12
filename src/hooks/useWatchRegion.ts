import { useAuth } from '../context/AuthContext';
import { useUserSettings } from './useUserSettings';
import { config } from '../config';

/**
 * Returns the effective watch region for the current user.
 * Priority: Firestore user setting > runtime config (appconfig.js / .env) > 'US'
 */
export const useWatchRegion = (): string => {
  const { user } = useAuth();
  const { settings } = useUserSettings();

  if (user && settings.watchRegion) return settings.watchRegion;
  return config.watchRegion || 'US';
};
