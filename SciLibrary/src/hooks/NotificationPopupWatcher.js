import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

const NotificationPopupWatcher = () => {
  const navigation = useNavigation();
  // Get the notifications from your slice
  const { items } = useSelector((state) => state.notifications);
  
  // We use a Ref to remember the last notification we showed a popup for
  // This prevents the same notification from popping up every 30 seconds
  const lastProcessedId = useRef(null);

  useEffect(() => {
    Toast.show({ type: 'success', text1: 'Test Working!' });
    if (items && items.length > 0) {
      const latestNotification = items[0]; // The newest one (because of unshift in your slice)

      // Only show Toast if:
      // 1. It's a new ID we haven't seen in this session
      // 2. It is unread
      if (latestNotification._id !== lastProcessedId.current && !latestNotification.read) {
        
        lastProcessedId.current = latestNotification._id;

        Toast.show({
          type: 'info',
          text1: 'New Update! 📚',
          text2: latestNotification.message,
          onPress: () => {
            // When they tap the popup, take them to your NotificationCenter
            navigation.navigate('NotificationCenter'); 
            Toast.hide();
          },
          visibilityTime: 4000,
        });
      }
    }
  }, [items]); // This effect runs every time your polling (useNotificationStream) updates the list

  return null; // This component doesn't draw anything on the screen
};

export default NotificationPopupWatcher;