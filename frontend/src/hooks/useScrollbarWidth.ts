import { useEffect, useState } from 'react';

export function useScrollbarWidth() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      // Create a temporary div with scrollbar
      const outer = document.createElement('div');
      outer.style.visibility = 'hidden';
      outer.style.overflow = 'scroll';
      document.body.appendChild(outer);

      const inner = document.createElement('div');
      outer.appendChild(inner);

      const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
      outer.parentNode?.removeChild(outer);

      setWidth(scrollbarWidth);
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return { width };
}

