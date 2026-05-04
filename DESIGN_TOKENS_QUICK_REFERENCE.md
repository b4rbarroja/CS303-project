# Quick Reference: Component Token Status

## Color-Coded Summary

### ✅ Already Using Design Tokens (2 components)
```
UITemplatesEnhanced.jsx
  ├─ Imports: DESIGN_TOKENS, getBadgeClasses, getButtonClasses
  ├─ Usage: Inline token values for spinner, empty state, error state
  └─ Quality: ⭐⭐⭐⭐⭐

BookCardEnhanced.jsx
  ├─ Imports: DESIGN_TOKENS, getBadgeClasses, getButtonClasses
  ├─ Usage: Badge and button styling with tokens
  └─ Quality: ⭐⭐⭐⭐⭐
```

### ⚠️ Partial Migration (1 component)
```
Stats.jsx
  ├─ Status: Uses hardcoded chart colors ["#358a74", "#f1f5f9"]
  ├─ Issue: Should use DESIGN_TOKENS.COLORS.brand.primary instead
  └─ Impact: Medium - only affects chart visualization
```

### ❌ Still Using Hardcoded Colors (18 components)

#### Components (11):
```
1.  AdminDashboard.jsx        - Table UI with inline Tailwind
2.  AppErrorBoundary.jsx      - Error display
3.  BookCard.jsx              - Book card display
4.  BookManagement.jsx        - Borrow management table
5.  BorrowRequests.jsx        - Request approval UI
6.  Catalog.jsx               - Catalog display (#358a74 hardcoded)
7.  MyBorrowedBooks.jsx       - Borrowed books list
8.  UITemplates.jsx           - Base templates (text-[#358a74])
9.  UserDashboard.jsx         - User dashboard (text-[#358a74])
10. UserProfile.jsx           - Profile view
11. Users.jsx                 - User management (40+ hardcoded colors)
```

#### Pages (7):
```
1. Login.jsx              - (#358a74, #2c7360 hardcoded)
2. Register.jsx           - (#358a74, #2c7360 hardcoded)
3. OTP.jsx                - Basic Tailwind
4. ForgotPassword.jsx     - (#358a74, #2c7360 hardcoded)
5. ResetPassword.jsx      - (#358a74, #2c7360 hardcoded)
6. Settings.jsx           - (#358a74, emerald-50 hardcoded)
7. Home.jsx               - Routing only
```

#### Layout (3):
```
1. Header.jsx             - PRIMARY (#358a74, #2c7360)
2. SideBar.jsx            - PRIMARY (#358a74, #2c7360)
3. DashboardLayout.jsx    - Bg (#f4f7f6)
```

---

## Key Metrics

| Metric | Value |
|--------|-------|
| **Components/Pages with Tokens** | 2/22 (9%) |
| **Components/Pages Hardcoded** | 18/22 (82%) |
| **Instances of #358a74** | 40+ |
| **Instances of #2c7360** | 10+ |
| **Tailwind Config Customization** | ❌ None (empty extend) |
| **Token File Status** | ✅ Complete |

---

## Top Hardcoded Colors

| Color | Hex | Token | Usage Count |
|-------|-----|-------|-------------|
| Brand Primary | `#358a74` | `DESIGN_TOKENS.COLORS.brand.primary` | 40+ |
| Brand Hover | `#2c7360` | (derived) | 10+ |
| Layout BG | `#f4f7f6` | `DESIGN_TOKENS.COLORS.background.primary` | 3+ |
| Light BG | `#f8fafc` | `DESIGN_TOKENS.COLORS.neutral[50]` | 3+ |

---

## Migration Checklist by Priority

### 🔴 CRITICAL (Highest Impact)
- [ ] Update `tailwind.config.js` with design token colors
- [ ] Migrate `Layout/Header.jsx`
- [ ] Migrate `Layout/SideBar.jsx`
- [ ] Migrate auth pages (Login, Register, ForgotPassword, ResetPassword)

### 🟠 HIGH
- [ ] Migrate `UITemplates.jsx` base components
- [ ] Migrate `Components/Users.jsx`
- [ ] Migrate `Components/Stats.jsx`

### 🟡 MEDIUM
- [ ] Migrate `Components/BookCard.jsx`
- [ ] Migrate `Components/Catalog.jsx`
- [ ] Migrate `Components/AdminDashboard.jsx`

### 🟢 LOW
- [ ] Migrate remaining single-use components

---

## Recommended Tailwind Config Update

```javascript
// Frontend/tailwind.config.js (RECOMMENDED)
import { DESIGN_TOKENS } from './src/utils/designTokens.js';

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: DESIGN_TOKENS.COLORS.brand.primary,    // #358a74
          secondary: DESIGN_TOKENS.COLORS.brand.secondary, // #10b981
          accent: DESIGN_TOKENS.COLORS.brand.accent,      // #f59e0b
          danger: DESIGN_TOKENS.COLORS.brand.danger,      // #ef4444
        },
        status: DESIGN_TOKENS.COLORS.status,
        neutral: DESIGN_TOKENS.COLORS.neutral,
      },
      fontSize: DESIGN_TOKENS.TYPOGRAPHY.fontSize,
      spacing: DESIGN_TOKENS.SPACING,
      borderRadius: DESIGN_TOKENS.BORDER_RADIUS,
      boxShadow: DESIGN_TOKENS.SHADOWS,
    }
  },
  plugins: [],
}
```

Then use: `className="bg-brand-primary text-white"` instead of `className="bg-[#358a74] text-white"`

---

## Example: Before & After

### ❌ BEFORE (Current)
```jsx
<button className="bg-[#358a74] text-white px-4 py-2 rounded-lg hover:bg-[#2c7360]">
  Click me
</button>
```

### ✅ AFTER (With Design Tokens)
```jsx
import { DESIGN_TOKENS } from '../utils/designTokens';

<button className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-primary/90">
  Click me
</button>
```

Or even better:
```jsx
import { tailwindClasses } from '../utils/designTokens';

<button className={tailwindClasses.button}>
  Click me
</button>
```

---

**Generated:** April 3, 2026 | **Workspace:** CS303-project
