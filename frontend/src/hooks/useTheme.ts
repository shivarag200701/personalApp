import { useTheme as useNextTheme } from 'next-themes';
import { themes, type ThemeId } from '@/utils/themes';
import { useEffect, useState } from 'react';

export const useAppTheme = () => {
  const { theme, setTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentThemeId = (theme as ThemeId) || 'dark';
  const currentTheme = themes[currentThemeId];

  return {
    theme: currentThemeId,
    themeData: currentTheme,
    setTheme,
    mounted,
  };
};

