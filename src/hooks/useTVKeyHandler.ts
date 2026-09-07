import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// webOS TV remote key codes
const KEY = {
  BACK: 461,
  RED: 403,
  GREEN: 404,
  YELLOW: 405,
  BLUE: 406,
  PLAY: 415,
  PAUSE: 19,
  STOP: 413,
  REWIND: 412,
  FAST_FORWARD: 417,
} as const;

/**
 * Handles TV remote button presses.
 * - Back (461) / Escape: navigate back, or minimize at root
 * - Other media keys are captured to prevent default browser behavior
 */
export const useTVKeyHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.keyCode) {
        case KEY.BACK:
          e.preventDefault();
          if (location.pathname === '/') {
            const webOS = (window as any).webOS;
            if (webOS?.platformBack) {
              webOS.platformBack();
            }
          } else {
            navigate(-1);
          }
          break;

        // Capture media keys to prevent webOS default behavior
        case KEY.PLAY:
        case KEY.PAUSE:
        case KEY.STOP:
        case KEY.REWIND:
        case KEY.FAST_FORWARD:
          e.preventDefault();
          break;

        default:
          // Escape key (keyboard fallback for Back)
          if (e.key === 'Escape') {
            e.preventDefault();
            if (location.pathname === '/') {
              const webOS = (window as any).webOS;
              if (webOS?.platformBack) {
                webOS.platformBack();
              }
            } else {
              navigate(-1);
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [navigate, location.pathname]);
};
