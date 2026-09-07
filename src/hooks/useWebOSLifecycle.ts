import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Handles webOS lifecycle events:
 * - webOSRelaunch: parses deep link params and navigates
 * - visibilitychange: could pause/resume expensive work
 */
export const useWebOSLifecycle = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleRelaunch = () => {
      try {
        const params = (window as any).launchParams;
        if (params) {
          const parsed = typeof params === 'string' ? JSON.parse(params) : params;
          if (parsed.mediaType && parsed.id) {
            navigate(`/${parsed.mediaType}/${parsed.id}`);
          }
        }
      } catch {
        // ignore malformed launch params
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        // App backgrounded — could pause timers/fetches here
      } else {
        // App foregrounded — could resume activity
      }
    };

    document.addEventListener('webOSRelaunch', handleRelaunch);
    document.addEventListener('visibilitychange', handleVisibility);

    // Handle initial launch params
    handleRelaunch();

    return () => {
      document.removeEventListener('webOSRelaunch', handleRelaunch);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [navigate]);
};
