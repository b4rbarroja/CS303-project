/**
 * Web Design Tokens Configuration
 * Shares the same token values with mobile for cross-platform consistency
 * Maps design tokens to Tailwind CSS classes and CSS variables
 */

export const DESIGN_TOKENS = {
  // ─── COLORS ───
  COLORS: {
    brand: {
      primary: '#358a74',        // Emerald/teal primary
      secondary: '#10b981',      // Green secondary
      accent: '#f59e0b',         // Amber accent
      danger: '#ef4444',         // Red danger
    },
    status: {
      available: '#10b981',      // Available - Green
      unavailable: '#ef4444',    // Unavailable - Red
      pending: '#f59e0b',        // Pending - Amber/Yellow
      overdue: '#dc2626',        // Overdue - Dark Red
      returned: '#6b7280',       // Returned - Gray
      warning: '#f59e0b',        // Warning - Amber
    },
    neutral: {
      0: '#ffffff',
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      tertiary: '#f3f4f6',
    },
    text: {
      primary: '#111827',        // Near black
      secondary: '#6b7280',      // Gray
      tertiary: '#9ca3af',       // Light gray
      onBrand: '#ffffff',        // White on brand colors
      onDanger: '#ffffff',       // White on danger colors
    },
    border: {
      light: '#e5e7eb',
      medium: '#d1d5db',
      dark: '#9ca3af',
    },
  },

  // ─── TYPOGRAPHY ───
  TYPOGRAPHY: {
    fontSize: {
      xs: '0.6875rem',   // 11px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      md: '1.125rem',    // 18px
      lg: '1.25rem',     // 20px
      xl: '1.5rem',      // 24px
      '2xl': '1.875rem', // 30px
      '3xl': '2.25rem',  // 36px
      '4xl': '3rem',     // 48px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },

  // ─── SPACING ───
  SPACING: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem',   // 32px
    '4xl': '3rem',   // 48px
    '5xl': '4rem',   // 64px
  },

  // ─── BORDER RADIUS ───
  BORDER_RADIUS: {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.25rem', // 20px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // ─── SHADOWS ───
  SHADOWS: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
  },

  // ─── BREAKPOINTS ───
  BREAKPOINTS: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

/**
 * Tailwind CSS Class Generator
 * Maps design tokens to Tailwind classes
 */
export const tailwindClasses = {
  // Text colors
  textPrimary: 'text-slate-900',
  textSecondary: 'text-slate-600',
  textTertiary: 'text-slate-400',

  // Background colors
  bgPrimary: 'bg-white',
  bgSecondary: 'bg-slate-50',
  bgTertiary: 'bg-slate-100',

  // Brand colors
  brandPrimary: 'bg-emerald-600 text-white',
  brandSecondary: 'bg-green-500 text-white',
  brandAccent: 'bg-amber-500 text-white',

  // Status badges
  badgeSuccess: 'bg-emerald-50 border border-emerald-100 text-emerald-600',
  badgeError: 'bg-rose-50 border border-rose-100 text-rose-500',
  badgeWarning: 'bg-amber-50 border border-amber-100 text-amber-600',
  badgeInfo: 'bg-blue-50 border border-blue-100 text-blue-600',
  badgePending: 'bg-amber-50 border border-amber-100 text-amber-600',

  // Borders
  borderLight: 'border border-slate-100',
  borderMedium: 'border border-slate-200',
  borderDark: 'border border-slate-400',

  // Shadows
  shadowSm: 'shadow-sm',
  shadowMd: 'shadow-md',
  shadowLg: 'shadow-lg',
  shadowXl: 'shadow-xl',

  // Components
  card: 'bg-white rounded-lg shadow-md border border-slate-100 p-6 hover:shadow-xl transition-shadow',
  button: 'px-4 py-2 rounded-lg font-semibold transition-all active:scale-95',
  input: 'w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500',
};

/**
 * CSS Variables for Dynamic Styling
 * Can be injected into document root
 */
export const getCSSVariables = () => {
  const tokens = DESIGN_TOKENS.COLORS;
  return {
    '--color-brand-primary': tokens.brand.primary,
    '--color-brand-secondary': tokens.brand.secondary,
    '--color-brand-accent': tokens.brand.accent,
    '--color-brand-danger': tokens.brand.danger,
    '--color-status-available': tokens.status.available,
    '--color-status-unavailable': tokens.status.unavailable,
    '--color-status-pending': tokens.status.pending,
    '--color-status-overdue': tokens.status.overdue,
    '--color-status-returned': tokens.status.returned,
    '--color-text-primary': tokens.text.primary,
    '--color-text-secondary': tokens.text.secondary,
    '--color-text-tertiary': tokens.text.tertiary,
  };
};

/**
 * Utility: Get CSS color by token path
 * E.g., getCSSColor('brand.primary') => '#358a74'
 */
export const getCSSColor = (path) => {
  const keys = path.split('.');
  let value = DESIGN_TOKENS.COLORS;
  for (const key of keys) {
    value = value[key];
  }
  return value;
};

/**
 * Utility: Badge styling based on status
 */
export const getBadgeClasses = (status) => {
  const statusMap = {
    available: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    unavailable: 'bg-rose-50 border-rose-100 text-rose-500',
    pending: 'bg-amber-50 border-amber-100 text-amber-600',
    overdue: 'bg-red-50 border-red-100 text-red-600',
    returned: 'bg-slate-50 border-slate-100 text-slate-600',
    borrowed: 'bg-indigo-50 border-indigo-100 text-indigo-600',
  };
  return statusMap[status] || statusMap.unavailable;
};

/**
 * Utility: Button styling based on variant
 */
export const getButtonClasses = (variant = 'primary', disabled = false) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantMap = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
    danger: 'bg-rose-500 text-white hover:bg-rose-600',
    outline: 'border border-slate-300 text-slate-900 hover:bg-slate-50',
  };

  return `${baseClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : variantMap[variant]}`;
};

/**
 * Utility: Responsive spacing helper
 */
export const getSpacingClasses = (size = 'md') => {
  const sizeMap = {
    xs: 'p-1',
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
    xl: 'p-5',
    '2xl': 'p-6',
    '3xl': 'p-8',
    '4xl': 'p-12',
  };
  return sizeMap[size] || sizeMap.md;
};

export default DESIGN_TOKENS;
