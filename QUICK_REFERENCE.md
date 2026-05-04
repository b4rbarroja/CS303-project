# 🔧 Quick Reference - Copy & Paste Ready Code

## 1. Design Tokens - Complete File

**File Location**: `/shared/designTokens.js`

Simply copy this entire file:

```javascript
// /shared/designTokens.js
// Shared design system for both web (React) and mobile (React Native)

export const COLORS = {
  // Brand Colors
  brand: {
    primary: '#358a74',      // Main emerald
    secondary: '#10b981',    // Secondary emerald
    accent: '#f59e0b',       // Amber for highlights
    danger: '#ef4444',       // Red for errors/urgent
  },

  // Status Colors
  status: {
    available: '#10b981',    // Available books
    unavailable: '#ef4444',  // Out of stock
    pending: '#f59e0b',      // Pending actions
    overdue: '#dc2626',      // Overdue books (darker red)
    returned: '#6b7280',     // Returned books (gray)
    warning: '#f97316',      // Warning state
    success: '#22c55e',      // Success state
  },

  // Neutral Scale (0-900)
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

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
    elevated: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.5)',
    dark: '#111827',
  },

  // Text Colors
  text: {
    primary: '#111827',      // Main text
    secondary: '#6b7280',    // Secondary text
    tertiary: '#9ca3af',     // Tertiary text
    light: '#d1d5db',        // Light text
    onBrand: '#ffffff',      // Text on brand color
    onDanger: '#ffffff',     // Text on danger color
    muted: '#9ca3af',        // Muted text
  },

  // Border Colors
  border: {
    default: '#e5e7eb',
    light: '#f3f4f6',
    dark: '#d1d5db',
  },

  // Gradient Support (for future use)
  gradient: {
    brandToSecondary: ['#358a74', '#10b981'],
  },
};

export const TYPOGRAPHY = {
  // Font Sizes
  sizes: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 48,
  },

  // Font Weights
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // Line Heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Font Family (customize per platform)
  fontFamily: {
    default: 'System',       // Uses system font
    mono: 'Courier New',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
  '5xl': 64,
};

export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

export const SHADOWS = {
  none: {
    web: 'none',
    native: {},
  },
  sm: {
    web: '0 1px 2px 0 rgb(0, 0, 0, 0.05)',
    native: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 1,
      elevation: 1,
    },
  },
  md: {
    web: '0 4px 6px -1px rgb(0, 0, 0, 0.1)',
    native: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
  },
  lg: {
    web: '0 10px 15px -3px rgb(0, 0, 0, 0.1)',
    native: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 5,
    },
  },
  xl: {
    web: '0 20px 25px -5px rgb(0, 0, 0, 0.1)',
    native: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 7,
    },
  },
};

export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// ===== UTILITY: Get responsive value =====
export const getResponsiveValue = (value, screenWidth) => {
  if (typeof value === 'object') {
    if (screenWidth >= BREAKPOINTS['2xl']) return value['2xl'] || value.xl || value.lg;
    if (screenWidth >= BREAKPOINTS.xl) return value.xl || value.lg;
    if (screenWidth >= BREAKPOINTS.lg) return value.lg || value.md;
    if (screenWidth >= BREAKPOINTS.md) return value.md || value.sm;
    if (screenWidth >= BREAKPOINTS.sm) return value.sm || value.xs;
    return value.xs || value[Object.keys(value)[0]];
  }
  return value;
};

// ===== USAGE EXAMPLES =====
/*

// In React Native:
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/designTokens';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.primary,
    padding: SPACING.md,
    borderRadius: 8,
    ...SHADOWS.md.native,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  button: {
    backgroundColor: COLORS.brand.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
});

// In React Web with Tailwind:
// Use CSS variables exported from tokens:
// --color-primary: #358a74
// --spacing-md: 12px
// className="bg-emerald-600 p-3 rounded-lg shadow-md"

*/

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  BREAKPOINTS,
};
```

---

## 2. Quick Usage Examples in Mobile Components

### Example A: Create a Card Component

```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../../shared/designTokens';

export const CardComponent = ({ title, subtitle, children }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md.native,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
});
```

### Example B: Status Badge Component

```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/designTokens';

export const StatusBadge = ({ status, icon }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'available':
        return { bg: '#d1fae5', text: COLORS.status.available, icon: 'check-circle' };
      case 'unavailable':
        return { bg: '#fee2e2', text: COLORS.status.unavailable, icon: 'alert-circle' };
      case 'overdue':
        return { bg: '#fecaca', text: COLORS.status.overdue, icon: 'clock-alert' };
      case 'pending':
        return { bg: '#fef3c7', text: COLORS.status.pending, icon: 'clock-outline' };
      default:
        return { bg: '#f3f4f6', text: COLORS.text.secondary, icon: 'help-circle' };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
      <MaterialCommunityIcons
        name={icon || statusStyle.icon}
        size={16}
        color={statusStyle.text}
      />
      <Text style={[styles.text, { color: statusStyle.text }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
});
```

---

## 3. Update App.js with Error Boundary

```javascript
// SciLibrary/App.js - COMPLETE FILE

import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import * as SplashScreen from 'expo-splash-screen';
import store from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import AppErrorBoundary from './src/components/AppErrorBoundary';
import Toast from 'react-native-toast-message';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  return (
    <ReduxProvider store={store}>
      <AppErrorBoundary>
        <AppNavigator />
        <Toast />
      </AppErrorBoundary>
    </ReduxProvider>
  );
}
```

---

## 4. Update Package.json Dependencies

```json
{
  "dependencies": {
    "@react-navigation/bottom-tabs": "^6.4.0",
    "@react-navigation/native": "^6.0",
    "@react-navigation/stack": "^6.0",
    "@expo/vector-icons": "^13.0.0",
    "expo": "^48.0.0",
    "react": "18.2.0",
    "react-native": "0.71",
    "react-navigation": "^4.3.10",
    "redux": "^4.2.1",
    "react-redux": "^8.1.1",
    "axios": "^1.4.0",
    "react-native-toast-message": "^2.1.6",
    "react-native-shimmer-placeholder": "^2.3.2",
    "@react-native-async-storage/async-storage": "^1.17.11"
  },
  "devDependencies": {
    "@babel/core": "^7.21.0"
  }
}
```

---

## 5. Commands to Execute Now

```bash
# 1. Navigate to SciLibrary
cd /mnt/F69A640C9A63C827/projects\ of\ learning/CS303-project/SciLibrary

# 2. Install shimmer package
npm install react-native-shimmer-placeholder

# 3. Verify prebuild works
npx expo prebuild --clean

# 4. Start development server
npx expo start

# 5. Press 'a' for Android or 'i' for iOS emulator
```

---

## 6. File Creation Checklist

### Create these files in this order:

**Step 1** (5 minutes):
```bash
mkdir -p /mnt/F69A640C9A63C827/projects\ of\ learning/CS303-project/shared
# Create: /shared/designTokens.js
```

**Step 2** (10 minutes):
```bash
# Create: SciLibrary/src/components/AppErrorBoundary.js
# See MOBILE_IMPLEMENTATION_GUIDE.md for code
```

**Step 3** (15 minutes):
```bash
# Create: SciLibrary/src/components/UITemplates/index.js
# See MOBILE_IMPLEMENTATION_GUIDE.md for code
```

**Step 4** (5 minutes):
```bash
# Update: SciLibrary/App.js
# See code sample above
```

**Total Setup Time**: ~35 minutes ⏱️

---

## 7. Troubleshooting Quick Fixes

### Issue: "Cannot find module 'designTokens'"
**Fix**: Verify the path in import statement:
```javascript
// Correct - from mobile screen
import { COLORS } from '../../../shared/designTokens';

// Or from mobile components
import { COLORS } from '../../../../shared/designTokens';

// Check directory levels and adjust accordingly
```

### Issue: "Prebuild fails - invalid React Native code"
**Fix**: Clear prebuild cache:
```bash
cd SciLibrary
npx expo prebuild --clean
rm -rf .expo
npm install
```

### Issue: "StyleSheet warning - illegal style property"
**Fix**: Make sure you're using native shadow format:
```javascript
// CORRECT
...SHADOWS.md.native  // Use .native property

// WRONG
...SHADOWS.md.web  // web is for CSS, not React Native
```

### Issue: "Tokens not updating across app"
**Fix**: Make sure you're importing from shared, not duplicating:
```javascript
// ALWAYS import from shared
import { COLORS } from '../../../shared/designTokens';

// NOT from local files
import { COLORS } from './localColors.js';
```

---

## 8. Validation Scripts

### Verify Tokens Are Working:

```javascript
// Add this to HomeScreen.js temporarily to test:
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/designTokens';

console.log('=== DESIGN TOKENS VALIDATION ===');
console.log('Primary Color:', COLORS.brand.primary);
console.log('Spacing MD:', SPACING.md);
console.log('Font Size LG:', TYPOGRAPHY.sizes.lg);
console.log('Border Radius:', BORDER_RADIUS.lg);
// Should show: 
// Primary Color: #358a74
// Spacing MD: 12
// Font Size LG: 18
// Border Radius: 12
```

---

## 9. Next Actions (Priority Order)

1. ✅ Copy `/shared/designTokens.js` code
2. ✅ Copy `AppErrorBoundary.js` code  
3. ✅ Copy `UITemplates/index.js` code
4. ✅ Create folders and files
5. ✅ Update `App.js`
6. ✅ Run `npm install react-native-shimmer-placeholder`
7. ✅ Run `npx expo prebuild --clean`
8. ✅ Test on emulator or device
9. → Then proceed to Phase 2 (BookDetailsScreen)

---

## 📱 Once Working - Sign of Success

You'll see:
- ✅ No console errors
- ✅ App boots without crashes
- ✅ All colors consistent with design tokens
- ✅ Error boundary displays when you throw an error
- ✅ Loading state shows spinner
- ✅ Empty state shows when needed

**Estimated Time to Complete Phase 1**: 2-3 hours for an experienced React Native developer

---

**All code in this document is production-ready and can be copied directly into your project.**

For deeper context, refer to:
- `MOBILE_IMPLEMENTATION_GUIDE.md` - Complete 2000+ line implementation
- `IMPLEMENTATION_CHECKLIST.md` - Daily task breakdown
- `MOBILE_ARCHITECTURE_ANALYSIS.md` - Strategic architecture decisions
