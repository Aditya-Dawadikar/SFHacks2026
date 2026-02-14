// Color palette - MongoDB inspired theme
export const colors = {
  // Primary colors
  primary: '#13AA52', // MongoDB green
  primaryLight: '#e8f5e9',
  primaryDark: '#0b7d3a',

  // Secondary colors
  secondary: '#1a1a1a', // Dark/black
  secondaryLight: '#404040',

  // Neutral colors
  white: '#ffffff',
  lightGray: '#f5f5f5',
  mediumGray: '#e0e0e0',
  darkGray: '#666666',
  charcoal: '#333333',

  // Status colors
  success: '#13AA52',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',

  // Component specific
  divider: '#eeeeee',
  border: '#e0e0e0',
}

export const theme = {
  colors,
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  radius: {
    small: '4px',
    medium: '8px',
    large: '12px',
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.12)',
    md: '0 2px 4px rgba(0, 0, 0, 0.15)',
    lg: '0 4px 8px rgba(0, 0, 0, 0.18)',
  },
}
