/**
 * NOTIFICATION FEATURE - IMPLEMENTATION GUIDE
 * 
 * This file shows how to integrate the NotificationBell component
 * into any screen that needs to display it.
 */

import NavigationHelper from './NavigationHelper';

/**
 * QUICK START: Add Notification Bell to Screen
 * 
 * There are two approaches:
 * 
 * 1. ADD TO SCREEN WITH CUSTOM HEADER (Recommended)
 * 2. ADD TO NAVIGATION OPTIONS
 */

// ===========================
// APPROACH 1: Custom Header Component
// ===========================

import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import NotificationBell from '../components/NotificationBell';

/**
 * Custom header component that includes NotificationBell
 */
export const ScreenHeaderWithNotifications = ({ title, navigation }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const handleNotificationPress = useCallback(() => {
    navigation.navigate('NotificationCenter');
  }, [navigation]);

  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <NotificationBell onPress={handleNotificationPress} />
    </View>
  );
};

/**
 * Example usage in screen:
 * 
 * import ScreenHeaderWithNotifications from '../components/ScreenHeaderWithNotifications';
 * 
 * export default function CatalogScreen({ navigation }) {
 *   return (
 *     <View style={styles.container}>
 *       <ScreenHeaderWithNotifications title="Books" navigation={navigation} />
 *       // Rest of screen content
 *     </View>
 *   );
 * }
 */

// ===========================
// APPROACH 2: Navigation Options (For native stack navigators)
// ===========================

/**
 * If using React Navigation with native stack:
 * 
 * const makeScreenOptions = (navigation) => ({
 *   headerShown: true,
 *   headerRight: () => (
 *     <NotificationBell 
 *       onPress={() => navigation.navigate('NotificationCenter')} 
 *     />
 *   ),
 * });
 * 
 * <Stack.Screen 
 *   name="Catalog" 
 *   component={CatalogScreen}
 *   options={({ navigation }) => makeScreenOptions(navigation)}
 * />
 */

// ===========================
// NOTIFICATION CENTER NAVIGATION
// ===========================

/**
 * From any screen, navigate to NotificationCenter:
 * 
 * navigation.navigate('NotificationCenter');
 * 
 * The NotificationCenter automatically handles:
 * - Loading notifications from Redux
 * - Marking as read when clicked
 * - Deleting notifications
 * - Deep linking via actionUrl
 * - Displaying fallback polling status
 */

// ===========================
// NOTIFICATION REDUX HOOKS
// ===========================

/**
 * Use notifications in your component:
 * 
 * import { useSelector, useDispatch } from 'react-redux';
 * import { markNotificationAsRead } from '../store/slices/notificationSlice';
 * 
 * export default function MyComponent() {
 *   const dispatch = useDispatch();
 *   const { items, unreadCount, sseConnected } = useSelector(
 *     state => state.notifications
 *   );
 *   
 *   const handleMarkAllRead = () => {
 *     dispatch(markAllAsRead());
 *   };
 *   
 *   return (
 *     <Text>Unread: {unreadCount}</Text>
 *   );
 * }
 */

// ===========================
// NOTIFICATION UPDATE FLOW
// ===========================

/**
 * Real-time updates happen through:
 * 
 * 1. SSE (Server-Sent Events) - Primary
 *    - GET /api/v1/notifications/stream
 *    - Receives 'notification_changed' event
 *    - Triggers automatic refetch
 * 
 * 2. Fallback Polling - If SSE fails
 *    - GET /api/v1/notifications every 30 seconds
 *    - Shown in NotificationCenter as "fallback mode"
 * 
 * 3. Manual Refresh
 *    - dispatch(fetchNotifications())
 *    - Use the useRefreshNotifications hook
 */

// ===========================
// NOTIFICATION TYPES & COLORS
// ===========================

/**
 * Supported notification types:
 * 
 * BORROW_APPROVED    - Green (✓ Approved)
 * BORROW_REJECTED    - Red (✗ Rejected)
 * BORROW_OVERDUE     - Orange (⚠ Overdue)
 * BORROW_REMINDER    - Blue (🕐 Reminder)
 * BOOK_RETURNED      - Green (✓ Returned)
 * ISSUE_REPORTED     - Deep Orange (⚠ Issue)
 * BOOK_AVAILABLE     - Blue (📚 Available)
 * USER_PROMOTED      - Purple (⭐ Promoted)
 * 
 * Each type has:
 * - Color via getNotificationColor(type)
 * - Icon via getNotificationIcon(type)
 * - Display label via getNotificationTypeLabel(type)
 */

// ===========================
// ERROR HANDLING
// ===========================

/**
 * Notifications handle errors gracefully:
 * 
 * - Network errors: Falls back to polling (shown as "fallback mode")
 * - Invalid data: Filtered out, doesn't crash
 * - SSE timeout: Automatically reconnects with exponential backoff
 * - Auth errors: Automatically handled by auth middleware
 * 
 * Users see:
 * - Orange status bar when in fallback mode
 * - Toast error if critical failure
 * - Graceful degradation (polling works if SSE fails)
 */

// ===========================
// DEVICE PERMISSIONS
// ===========================

/**
 * Expo SecureStore is used for token storage:
 * - app.json already includes this permission
 * - No additional setup needed
 * 
 * App State monitoring (for foreground/background):
 * - @react-native-camera-roll/camera-roll provides this
 * - Automatically handled by useNotificationStream hook
 */

// ===========================
// METRICS & ANALYTICS
// ===========================

/**
 * Track in your product analytics:
 * - Notification received count
 * - Mark as read rate
 * - Delete rate
 * - Deep link click-through rate
 * - SSE vs fallback polling ratio
 * 
 * Redux state available:
 * - state.notifications.sseConnected (boolean)
 * - state.notifications.fallbackPollingActive (boolean)
 * - state.notifications.unreadCount (number)
 */

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
});
