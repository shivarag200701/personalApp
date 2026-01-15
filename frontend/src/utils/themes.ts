export type ThemeId = 'dark' | 'light';

export interface Theme {
  id: ThemeId;
  name: string;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    border: string;
    input: string;
    ring: string;
    sidebar: string;
    sidebarForeground: string;
    sidebarPrimary: string;
    sidebarPrimaryForeground: string;
    sidebarAccent: string;
    sidebarAccentForeground: string;
    sidebarBorder: string;
    sidebarRing: string;
  };
}

export const themes: Record<ThemeId, Theme> = {
  dark: {
    id: 'dark',
    name: 'Dark',
    colors: {
      background: 'oklch(0.145 0 0)',
      foreground: 'oklch(0.985 0 0)',
      card: 'oklch(0.205 0 0)',
      cardForeground: 'oklch(0.985 0 0)',
      popover: 'oklch(0.205 0 0)',
      popoverForeground: 'oklch(0.985 0 0)',
      primary: 'oklch(0.922 0 0)',
      primaryForeground: 'oklch(0.205 0 0)',
      secondary: 'oklch(0.269 0 0)',
      secondaryForeground: 'oklch(0.985 0 0)',
      muted: 'oklch(0.280 0 0)',
      mutedForeground: 'oklch(0.708 0 0)',
      accent: 'oklch(0.45 0.15 264)',
      accentForeground: 'oklch(0.985 0 0)',
      destructive: 'oklch(0.704 0.191 22.216)',
      border: 'oklch(1 0 0 / 10%)',
      input: 'oklch(1 0 0 / 15%)',
      ring: 'oklch(0.556 0 0)',
      sidebar: 'oklch(0.205 0 0)',
      sidebarForeground: 'oklch(0.985 0 0)',
      sidebarPrimary: 'oklch(0.488 0.243 264.376)',
      sidebarPrimaryForeground: 'oklch(0.985 0 0)',
      sidebarAccent: 'oklch(0.269 0 0)',
      sidebarAccentForeground: 'oklch(0.985 0 0)',
      sidebarBorder: 'oklch(1 0 0 / 10%)',
      sidebarRing: 'oklch(0.556 0 0)',
    },
  },
  light: {
    id: 'light',
    name: 'Light',
    colors: {
      background: 'oklch(0.99 0 0)', // Very light background
      foreground: 'oklch(0.15 0 0)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.15 0 0)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.15 0 0)',
      primary: 'oklch(0.45 0.15 264)', // Purple accent similar to Todoist
      primaryForeground: 'oklch(0.99 0 0)',
      secondary: 'oklch(0.96 0 0)',
      secondaryForeground: 'oklch(0.25 0 0)',
      muted: 'oklch(0.9 0 0)',
      mutedForeground: 'oklch(0.5 0 0)',
      accent: 'oklch(0.45 0.15 264)', // Purple accent
      accentForeground: 'oklch(0.99 0 0)',
      destructive: 'oklch(0.577 0.245 27.325)',
      border: 'oklch(0.9 0 0)',
      input: 'oklch(0.95 0 0)',
      ring: 'oklch(0.45 0.15 264)',
      sidebar: 'oklch(0.98 0.005 241.67)',
      sidebarForeground: 'oklch(0.2 0 0)',
      sidebarPrimary: 'oklch(0.45 0.15 264)',
      sidebarPrimaryForeground: 'oklch(0.99 0 0)',
      sidebarAccent: 'oklch(0.96 0 0)',
      sidebarAccentForeground: 'oklch(0.25 0 0)',
      sidebarBorder: 'oklch(0.9 0 0)',
      sidebarRing: 'oklch(0.45 0.15 264)',
    },
  },
};

export const getThemeColors = (themeId: ThemeId) => themes[themeId].colors;

