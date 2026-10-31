import type { ThemeConfig } from 'bentopdf-viewer';

export const viewerTheme: ThemeConfig = {
  light: {
    accent: {
      primary: '#6366f1',
      primaryHover: '#4f46e5',
      primaryActive: '#4338ca',
      primaryLight: '#eef2ff',
      primaryForeground: '#ffffff',
    },
    interactive: {
      selected: '#eef2ff',
      focus: '#6366f1',
      focusRing: '#c7d2fe',
    },
    state: {
      info: '#6366f1',
      infoLight: '#eef2ff',
    },
  },
  dark: {
    background: {
      app: '#222222',
      surface: '#2a2a2a',
      surfaceAlt: '#383838',
      elevated: '#2a2a2a',
      input: '#383838',
    },
    foreground: {
      onAccent: '#ffffff',
    },
    border: {
      default: '#444444',
      subtle: '#383838',
      strong: '#737373',
    },
    accent: {
      primary: '#6366f1',
      primaryHover: '#4f46e5',
      primaryActive: '#4338ca',
      primaryLight: '#38395c',
      primaryForeground: '#ffffff',
    },
    interactive: {
      hover: '#383838',
      active: '#444444',
      selected: '#38395c',
      focus: '#818cf8',
      focusRing: '#3730a3',
    },
    state: {
      info: '#818cf8',
      infoLight: '#38395c',
    },
    scrollbar: {
      track: '#2a2a2a',
      thumb: '#444444',
      thumbHover: '#737373',
    },
  },
};
