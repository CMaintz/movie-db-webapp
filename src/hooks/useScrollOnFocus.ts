import { useEffect } from 'react';
import { getCurrentFocusKey } from '@noriginmedia/norigin-spatial-navigation';

/**
 * Auto-scrolls the currently focused element into view when spatial
 * navigation focus changes (D-pad movement on TV remote).
 */
export const useScrollOnFocus = () => {
  useEffect(() => {
    let lastFocusKey = '';

    const check = () => {
      const key = getCurrentFocusKey();
      if (key && key !== lastFocusKey) {
        lastFocusKey = key;
        // The focused element gets a data-focus-key attribute from norigin
        const el = document.querySelector(`[data-focus-key="${key}"]`);
        if (el) {
          el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    };

    // Poll for focus changes — norigin doesn't expose a global focus change event
    const interval = setInterval(check, 150);
    return () => clearInterval(interval);
  }, []);
};
