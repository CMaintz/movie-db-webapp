import { useEffect, useRef, useState } from 'react';

/**
 * Returns a ref to attach to a DOM element and a boolean indicating whether
 * the element has ever entered the viewport. Once visible it stays true,
 * so any lazy-loaded content (e.g. OMDb ratings) is only fetched once.
 */
export const useIntersectionObserver = (options?: IntersectionObserverInit) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || isVisible) return; // already visible — no need to observe again

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible]);

  return { ref, isVisible };
};
