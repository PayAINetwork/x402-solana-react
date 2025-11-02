import { CSSProperties } from 'react';

/**
 * Theme preset options
 */
export type ThemePreset = 'solana-light' | 'solana-dark' | 'dark' | 'light' | 'seeker' | 'terminal' | 'terminal-light' | 'seeker-2';

/**
 * Component styling configuration
 */
export interface ComponentClassNames {
  container?: string;
  button?: string;
  card?: string;
  text?: string;
  status?: string;
  spinner?: string;
}

export interface ComponentStyles {
  container?: CSSProperties;
  button?: CSSProperties;
  card?: CSSProperties;
  text?: CSSProperties;
  status?: CSSProperties;
  spinner?: CSSProperties;
}

/**
 * Complete theme configuration
 */
export interface ThemeConfig {
  preset?: ThemePreset;
  classNames?: ComponentClassNames;
  customStyles?: ComponentStyles;
}
