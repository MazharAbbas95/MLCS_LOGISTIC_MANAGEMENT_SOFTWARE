import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large';
export type AccentColor = 'sage' | 'blue' | 'rose' | 'amber' | 'violet';
export type Language = 'en' | 'ur';
export type SidebarBehavior = 'auto' | 'always-open' | 'always-collapsed';
export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

export interface AppSettings {
  theme: Theme;
  fontSize: FontSize;
  accentColor: AccentColor;
  language: Language;
  sidebarBehavior: SidebarBehavior;
  dateFormat: DateFormat;
  compactMode: boolean;
  animationsEnabled: boolean;
  notificationsEnabled: boolean;
  autoSave: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  fontSize: 'medium',
  accentColor: 'sage',
  language: 'en',
  sidebarBehavior: 'auto',
  dateFormat: 'DD/MM/YYYY',
  compactMode: false,
  animationsEnabled: true,
  notificationsEnabled: true,
  autoSave: true,
};

const ACCENT_COLORS: Record<AccentColor, { primary: string; dark: string; light: string }> = {
  sage:   { primary: '#88887A', dark: '#3D473D', light: '#A3B18A' },
  blue:   { primary: '#3b82f6', dark: '#1d4ed8', light: '#93c5fd' },
  rose:   { primary: '#f43f5e', dark: '#be123c', light: '#fda4af' },
  amber:  { primary: '#f59e0b', dark: '#b45309', light: '#fcd34d' },
  violet: { primary: '#8b5cf6', dark: '#6d28d9', light: '#c4b5fd' },
};

const FONT_SIZES: Record<FontSize, string> = {
  small:  '13px',
  medium: '15px',
  large:  '17px',
};

interface SettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

function applySettings(settings: AppSettings) {
  const root = document.documentElement;

  // Theme
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = settings.theme === 'dark' || (settings.theme === 'system' && prefersDark);
  root.classList.toggle('dark', isDark);

  // Font size
  root.style.setProperty('--base-font-size', FONT_SIZES[settings.fontSize]);
  root.style.setProperty('font-size', FONT_SIZES[settings.fontSize]);

  // Accent colors
  const accent = ACCENT_COLORS[settings.accentColor];
  root.style.setProperty('--accent-primary', accent.primary);
  root.style.setProperty('--accent-dark', accent.dark);
  root.style.setProperty('--accent-light', accent.light);

  // Compact mode
  root.classList.toggle('compact-mode', settings.compactMode);
  if (settings.compactMode) {
    root.style.setProperty('--spacing-scale', '0.75');
    root.style.setProperty('--base-font-multiplier', '0.9');
  } else {
    root.style.setProperty('--spacing-scale', '1');
    root.style.setProperty('--base-font-multiplier', '1');
  }

  // Animations
  root.classList.toggle('no-animations', !settings.animationsEnabled);
  root.style.setProperty('--animation-duration', settings.animationsEnabled ? '300ms' : '0ms');
  root.style.setProperty('--transition-speed', settings.animationsEnabled ? '200ms' : '0ms');

  // Dark mode colors
  if (isDark) {
    root.style.setProperty('--color-natural-bg', '#121212');
    root.style.setProperty('--color-natural-text', '#f1f5f1');
    root.style.setProperty('--color-sage-border', '#2a2a2a');
  } else {
    root.style.setProperty('--color-natural-bg', '#F5F5F0');
    root.style.setProperty('--color-natural-text', '#2D332D');
    root.style.setProperty('--color-sage-border', '#E0E0D6');
  }
}

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem('mlcs_settings');
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    applySettings(settings);
    localStorage.setItem('mlcs_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => setSettings(DEFAULT_SETTINGS);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};
