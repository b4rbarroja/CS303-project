# 🛠️ Mobile Frontend Mirroring - Implementation Guide
## Step-by-Step Code Implementation Plan

**Status**: Ready for Development  
**Complexity**: Medium-High  
**Timeline**: 4 Weeks (100-120 hours)

---

## Phase 1: Foundation (Days 1-5)

### Step 1.1: Create Shared Design Tokens System

**File**: `/shared/designTokens.js` (NEW - Create at project root)

This will be imported by BOTH web and mobile apps.

```javascript
// /shared/designTokens.js
export const COLORS = {
  brand: {
    primary: '#358a74',
    secondary: '#10b981',
    accent: '#f59e0b',
    danger: '#ef4444',
  },
  
  status: {
    available: '#10b981',
    unavailable: '#ef4444',
    pending: '#f59e0b',
    overdue: '#dc2626',
    returned: '#6b7280',
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
    elevated: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
    light: '#d1d5db',
    onBrand: '#ffffff',
    onDanger: '#ffffff',
  },
  
  border: {
    default: '#e5e7eb',
    light: '#f3f4f6',
    dark: '#d1d5db',
  },
};

export const TYPOGRAPHY = {
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
  
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
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
};

export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};
```

**Usage in Mobile**:
```javascript
import { COLORS, SPACING, BORDER_RADIUS } from '../../../shared/designTokens';

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.neutral[0],
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.md.native,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
});
```

---

### Step 1.2: Create Error Boundary Component

**File**: `SciLibrary/src/components/AppErrorBoundary.js` (NEW)

```javascript
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../shared/designTokens';

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log to external error reporting service
    console.error('Error Boundary caught:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Could send to API for logging
    // this.logErrorToServer(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            {/* Error Icon */}
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={64}
                color={COLORS.status.danger}
              />
            </View>

            {/* Error Title */}
            <Text style={styles.title}>Something Went Wrong</Text>

            {/* Error Message */}
            <Text style={styles.message}>
              {this.state.error?.toString().slice(0, 100)}...
            </Text>

            {/* Developer Info (Debug Only) */}
            {__DEV__ && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugTitle}>Debug Info:</Text>
                <Text style={styles.debugText}>
                  {this.state.errorInfo?.componentStack}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={this.handleReset}
              >
                <MaterialCommunityIcons name="reload" size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  // Navigate to home
                  this.props.navigation?.navigate('Home');
                }}
              >
                <Text style={styles.secondaryButtonText}>Go to Home</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  iconContainer: {
    marginBottom: SPACING['2xl'],
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  message: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: TYPOGRAPHY.lineHeights.normal * TYPOGRAPHY.sizes.base,
  },
  debugInfo: {
    width: '100%',
    backgroundColor: COLORS.background.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.status.danger,
  },
  debugTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.status.danger,
    marginBottom: SPACING.sm,
  },
  debugText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    fontFamily: 'monospace',
  },
  actionContainer: {
    width: '100%',
    gap: SPACING.md,
  },
  primaryButton: {
    backgroundColor: COLORS.brand.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  primaryButtonText: {
    color: COLORS.text.onBrand,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: COLORS.neutral[100],
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  secondaryButtonText: {
    color: COLORS.brand.primary,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    textAlign: 'center',
  },
};
```

**Usage in App.js**:
```javascript
import AppErrorBoundary from './src/components/AppErrorBoundary';

export default function App() {
  return (
    <AppErrorBoundary>
      <AppNavigator />
    </AppErrorBoundary>
  );
}
```

---

### Step 1.3: Create UI Templates Library

**File**: `SciLibrary/src/components/UITemplates/index.js` (NEW)

```javascript
import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../../../shared/designTokens';

// ============ LOADING SKELETON ============
export const LoadingSkeleton = ({ width = '100%', height = 100, borderRadius = 8 }) => {
  return (
    <View
      style={{
        width,
        height,
        backgroundColor: COLORS.neutral[200],
        borderRadius,
        overflow: 'hidden',
      }}
    >
      {/* Add animated shimmer effect with react-native-shimmer-placeholder */}
    </View>
  );
};

// ============ LOADING SPINNER ============
export const LoadingSpinner = ({ size = 'large', color = COLORS.brand.primary }) => {
  return (
    <View style={spinnerStyles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const spinnerStyles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
  },
};

// ============ EMPTY STATE ============
export const EmptyState = ({ icon = 'inbox', title = 'Empty', subtitle, actionLabel, onActionPress }) => {
  return (
    <View style={emptyStateStyles.container}>
      <MaterialCommunityIcons
        name={icon}
        size={64}
        color={COLORS.neutral[400]}
        style={emptyStateStyles.icon}
      />
      
      <Text style={emptyStateStyles.title}>{title}</Text>
      
      {subtitle && (
        <Text style={emptyStateStyles.subtitle}>{subtitle}</Text>
      )}
      
      {actionLabel && onActionPress && (
        <TouchableOpacity
          style={emptyStateStyles.button}
          onPress={onActionPress}
        >
          <Text style={emptyStateStyles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const emptyStateStyles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING['2xl'],
  },
  icon: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  button: {
    backgroundColor: COLORS.brand.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  buttonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
};

// ============ ERROR STATE ============
export const ErrorState = ({ title = 'Error', message, actionLabel = 'Retry', onActionPress }) => {
  return (
    <View style={errorStateStyles.container}>
      <MaterialCommunityIcons
        name="alert-circle"
        size={64}
        color={COLORS.status.danger}
        style={errorStateStyles.icon}
      />
      
      <Text style={errorStateStyles.title}>{title}</Text>
      
      {message && (
        <Text style={errorStateStyles.message}>{message}</Text>
      )}
      
      {onActionPress && (
        <TouchableOpacity
          style={errorStateStyles.button}
          onPress={onActionPress}
        >
          <Text style={errorStateStyles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const errorStateStyles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  icon: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.status.danger,
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  button: {
    backgroundColor: COLORS.status.danger,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
  },
  buttonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
};

// ============ BADGE ============
export const Badge = ({ label, variant = 'neutral', icon }) => {
  const colors = {
    neutral: { bg: COLORS.neutral[100], text: COLORS.neutral[700] },
    success: { bg: '#d1fae5', text: COLORS.status.available },
    error: { bg: '#fee2e2', text: COLORS.status.unavailable },
    warning: { bg: '#fef3c7', text: '#d97706' },
    info: { bg: '#dbeafe', text: '#3b82f6' },
  };

  const color = colors[variant] || colors.neutral;

  return (
    <View style={[
      badgeStyles.container,
      { backgroundColor: color.bg },
    ]}>
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={14}
          color={color.text}
          style={badgeStyles.icon}
        />
      )}
      <Text style={[badgeStyles.label, { color: color.text }]}>
        {label}
      </Text>
    </View>
  );
};

const badgeStyles = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
    gap: SPACING.xs,
  },
  icon: {
    marginRight: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
};

// ============ DIVIDER ============
export const Divider = ({ margin = SPACING.md }) => (
  <View style={{ height: 1, backgroundColor: COLORS.border.default, marginVertical: margin }} />
);

// ============ SECTION HEADER ============
export const SectionHeader = ({ title, action, onActionPress }) => (
  <View style={sectionHeaderStyles.container}>
    <Text style={sectionHeaderStyles.title}>{title}</Text>
    {action && (
      <TouchableOpacity onPress={onActionPress}>
        <Text style={sectionHeaderStyles.action}>{action}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const sectionHeaderStyles = {
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  action: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.brand.primary,
    fontWeight: '600',
  },
};

export { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS };
```

---

### Step 1.4: Update Main App.js with Error Boundary

**File**: `SciLibrary/App.js` (MODIFY)

```javascript
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import store from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import AppErrorBoundary from './src/components/AppErrorBoundary';
import Toast from 'react-native-toast-message';

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

## Phase 2: Core Features (Days 6-15)

### Step 2.1: Book Details Screen

**File**: `SciLibrary/src/screens/BookDetailsScreen.js` (NEW)

```javascript
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS, LoadingSpinner, EmptyState, Badge } from '../components/UITemplates';

export default function BookDetailsScreen({ route, navigation }) {
  const { bookId } = route.params;
  const dispatch = useDispatch();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchBookDetails();
  }, [bookId]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      // Fetch from API
      const response = await fetch(`http://192.168.1.12:5000/api/v1/book/${bookId}`);
      const data = await response.json();
      setBook(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = () => {
    // Navigate to borrow confirmation screen
    navigation.navigate('BorrowConfirm', { bookId });
  };

  if (loading) return <LoadingSpinner />;
  if (!book) return <EmptyState title="Book Not Found" />;

  return (
    <ScrollView style={styles.container}>
      {/* Hero Section: Large Book Cover */}
      <View style={styles.heroSection}>
        <Image
          source={{ uri: book.image?.url || 'https://via.placeholder.com/300x400' }}
          style={styles.bookCover}
        />
        
        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <MaterialCommunityIcons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? COLORS.status.danger : '#fff'}
          />
        </TouchableOpacity>
      </View>

      {/* Book Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>By {book.author}</Text>
        
        {/* Rating */}
        <View style={styles.ratingContainer}>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map(i => (
              <MaterialCommunityIcons
                key={i}
                name="star"
                size={16}
                color={i <= (book.rating || 0) ? COLORS.accent : COLORS.neutral[300]}
              />
            ))}
          </View>
          <Text style={styles.ratingText}>({book.reviewCount || 0} reviews)</Text>
        </View>

        {/* Metadata Grid */}
        <View style={styles.metadataGrid}>
          <MetadataItem label="Publisher" value={book.publisher || 'Unknown'} />
          <MetadataItem label="Year" value={book.publishedYear || 'N/A'} />
          <MetadataItem label="Pages" value={book.pages || 'N/A'} />
          <MetadataItem label="ISBN" value={book.isbn || 'N/A'} />
        </View>

        {/* Availability Badge */}
        <View style={styles.availabilitySection}>
          <Badge
            label={book.quantity > 0 ? 'Available' : 'Out of Stock'}
            variant={book.quantity > 0 ? 'success' : 'error'}
            icon={book.quantity > 0 ? 'check-circle' : 'alert-circle'}
          />
          {book.quantity > 0 && (
            <Text style={styles.availabilityText}>{book.quantity} copies available</Text>
          )}
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About This Book</Text>
        <Text style={styles.description}>{book.description || 'No description available'}</Text>
      </View>

      {/* Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <DetailRow label="Category" value={book.category} />
        <DetailRow label="Language" value={book.language || 'English'} />
        <DetailRow label="Edition" value={book.edition || 'First'} />
      </View>

      {/* Reviews Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        {book.reviews && book.reviews.length > 0 ? (
          book.reviews.slice(0, 3).map((review, idx) => (
            <ReviewCard key={idx} review={review} />
          ))
        ) : (
          <Text style={styles.noReviews}>No reviews yet</Text>
        )}
      </View>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.borrowButton}
          onPress={handleBorrow}
          disabled={book.quantity === 0}
        >
          <MaterialCommunityIcons name="plus-circle" size={20} color="#fff" />
          <Text style={styles.borrowButtonText}>
            {book.quantity > 0 ? 'Borrow Now' : 'Out of Stock'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: SPACING.xl }} />
    </ScrollView>
  );
}

const MetadataItem = ({ label, value }) => (
  <View style={metadataStyles.item}>
    <Text style={metadataStyles.label}>{label}</Text>
    <Text style={metadataStyles.value}>{value}</Text>
  </View>
);

const DetailRow = ({ label, value }) => (
  <View style={detailRowStyles.container}>
    <Text style={detailRowStyles.label}>{label}</Text>
    <Text style={detailRowStyles.value}>{value || 'N/A'}</Text>
  </View>
);

const ReviewCard = ({ review }) => (
  <View style={reviewStyles.container}>
    <View style={reviewStyles.header}>
      <Text style={reviewStyles.author}>{review.author}</Text>
      <View style={reviewStyles.rating}>
        {[1, 2, 3, 4, 5].map(i => (
          <MaterialCommunityIcons
            key={i}
            name="star"
            size={12}
            color={i <= review.rating ? COLORS.accent : COLORS.neutral[300]}
          />
        ))}
      </View>
    </View>
    <Text style={reviewStyles.text}>{review.text}</Text>
  </View>
);

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  heroSection: {
    position: 'relative',
    height: 400,
    backgroundColor: COLORS.neutral[900],
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookCover: {
    width: 160,
    height: 240,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.lg.native,
  },
  favoriteButton: {
    position: 'absolute',
    top: SPACING.xl,
    right: SPACING.lg,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    marginTop: -SPACING.lg,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  author: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  stars: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  metadataGrid: {
    display: 'grid',
    gridAutoFlow: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  availabilitySection: {
    gap: SPACING.md,
    marginVertical: SPACING.lg,
  },
  availabilityText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    lineHeight: TYPOGRAPHY.lineHeights.normal * TYPOGRAPHY.sizes.base,
  },
  noReviews: {
    fontStyle: 'italic',
    color: COLORS.text.tertiary,
  },
  actionBar: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  borrowButton: {
    backgroundColor: COLORS.brand.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.md,
  },
  borrowButtonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
};

const metadataStyles = {
  item: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  value: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
};

const detailRowStyles = {
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
  },
  value: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
};

const reviewStyles = {
  container: {
    backgroundColor: COLORS.neutral[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  author: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  rating: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  text: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    lineHeight: TYPOGRAPHY.lineHeights.normal * TYPOGRAPHY.sizes.base,
  },
};
```

---

### Step 2.2: Borrow History Screen

**File**: `SciLibrary/src/screens/BorrowHistoryScreen.js` (NEW)

```javascript
import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, LoadingSpinner, EmptyState } from '../components/UITemplates';

export default function BorrowHistoryScreen({ navigation }) {
  const dispatch = useDispatch();
  const { borrowHistory, loading } = useSelector(state => state.borrow);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (user?.id) {
      // Dispatch action to fetch history from API
      dispatch(fetchBorrowHistory(user.id));
    }
  }, [user]);

  if (loading) return <LoadingSpinner />;
  
  if (!borrowHistory || borrowHistory.length === 0) {
    return (
      <EmptyState
        icon="history"
        title="No Borrow History"
        subtitle="Your borrowed books will appear here"
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={borrowHistory}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <BorrowHistoryItem item={item} />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const BorrowHistoryItem = ({ item }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Returned':
        return COLORS.status.returned;
      case 'Active':
        return COLORS.status.pending;
      case 'Overdue':
        return COLORS.status.overdue;
      default:
        return COLORS.text.secondary;
    }
  };

  return (
    <TouchableOpacity style={styles.item}>
      {/* Left: Book Icon */}
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="book"
          size={32}
          color={COLORS.brand.primary}
        />
      </View>

      {/* Center: Book Info */}
      <View style={styles.content}>
        <Text style={styles.title}>{item.book?.title || 'Unknown Book'}</Text>
        <Text style={styles.author}>{item.book?.author || 'Unknown Author'}</Text>
        
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Borrowed:</Text>
          <Text style={styles.dateValue}>
            {new Date(item.borrowDate).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Returned:</Text>
          <Text style={styles.dateValue}>
            {item.returnDate ? new Date(item.returnDate).toLocaleDateString() : 'Active'}
          </Text>
        </View>
      </View>

      {/* Right: Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  listContent: {
    padding: SPACING.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.brand.primary,
  },
  iconContainer: {
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  author: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  dateRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  dateLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
  },
  dateValue: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
};
```

---

## Summary: Next Steps

1. ✅ **Days 1-5**: Implement Phase 1 (Design tokens, Error boundary, UI templates)
2. ⏳ **Days 6-15**: Implement Phase 2 (Book details, History, Advanced search)
3. ⏳ **Days 16-22**: Implement Phase 3 (Polish, animations, testing)
4. ⏳ **Days 23-28**: Deployment and launch

**Total Time**: 4 weeks, 80-100 developer hours

**Tools Needed**:
- `react-native-shimmer-placeholder` for skeleton loading
- `react-native-chart-kit` for statistics data visualization
- `react-native-swiper` for image galleries (optional)
- `@react-native-bottom-sheet/bottom-sheet` for modals

---

## Testing Checklist

Before launching mobile app:

- [ ] All screens render without crashing
- [ ] Error boundary catches and recovers from errors
- [ ] Loading states show skeletons/spinners
- [ ] Empty states display when needed
- [ ] All navigation flows work smoothly
- [ ] Book details load and display correctly
- [ ] History shows all past borrows
- [ ] Search and filtering work
- [ ] Admin features accessible to admins only
- [ ] Responsive on various screen sizes (small, medium, large)
- [ ] Performance tested (no janky animations)
- [ ] Testing on real device (iOS + Android)

---

This completes the implementation guide. Follow these steps to mirror the web frontend to your mobile app while maintaining mobile-specific best practices. Good luck! 🚀
