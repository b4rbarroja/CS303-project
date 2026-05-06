import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllDonations,
  approveDonation,
  rejectDonation,
  resetDonationSlice,
} from '../store/slices/donationSlice';
import { fetchAllBooks } from '../store/books';
import Toast from 'react-native-toast-message';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../shared/designTokens';

export default function DonationRequestsScreen({ navigation }) {
  const dispatch = useDispatch();
  const { donations, loading, error, message } = useSelector((state) => state.donation);
  const { user } = useSelector((state) => state.auth);

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [actionLoading, setActionLoading] = useState(null);

  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';
  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.accessDeniedContainer}>
          <Text style={styles.accessDeniedText}>Access Denied</Text>
          <Text style={styles.accessDeniedSubtext}>Admin access required</Text>
        </View>
      </View>
    );
  }

  useEffect(() => {
    dispatch(fetchAllDonations());
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      Toast.show({ type: 'success', text1: 'Success', text2: message });
      dispatch(resetDonationSlice());
      dispatch(fetchAllDonations());
      dispatch(fetchAllBooks());
    }
    if (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error });
      dispatch(resetDonationSlice());
    }
  }, [message, error]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchAllDonations());
    setRefreshing(false);
  };

  const handleApprove = (donation) => {
    Alert.alert(
      'Approve Donation',
      `Approve "${donation.title}" donated by ${donation.donorName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            setActionLoading(donation.id);
            await dispatch(approveDonation(donation.id));
            setActionLoading(null);
          },
        },
      ]
    );
  };

  const handleReject = (donation) => {
    Alert.alert(
      'Reject Donation',
      `Reject "${donation.title}" donated by ${donation.donorName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(donation.id);
            await dispatch(rejectDonation(donation.id));
            setActionLoading(null);
          },
        },
      ]
    );
  };

  const getFilteredDonations = () => {
    switch (activeTab) {
      case 'pending':
        return donations.filter((d) => d.status === 'Pending');
      case 'all':
      default:
        return donations;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return COLORS.status.pending;
      case 'Approved': return COLORS.status.available;
      case 'Rejected': return COLORS.status.unavailable;
      default: return COLORS.neutral[400];
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    const date = dateValue._seconds ? new Date(dateValue._seconds * 1000) : new Date(dateValue);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const DonationCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image
          source={{ uri: item.image?.url || 'https://via.placeholder.com/80x110' }}
          style={styles.bookImage}
        />
        <View style={styles.cardInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.bookAuthor}>{item.author}</Text>
          <Text style={styles.bookMeta}>{item.genre} • {item.edition}</Text>
          <View style={styles.donorRow}>
            <Text style={styles.donorLabel}>Donated by:</Text>
            <Text style={styles.donorName}>{item.donorName}</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      {item.note && (
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>📝 {item.note}</Text>
        </View>
      )}

      {item.status === 'Pending' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.approveBtn}
            onPress={() => handleApprove(item)}
            disabled={actionLoading === item.id}
          >
            {actionLoading === item.id ? (
              <ActivityIndicator size="small" color={COLORS.status.available} />
            ) : (
              <>
                <Text style={styles.actionIcon}>✅</Text>
                <Text style={styles.approveBtnText}>Approve</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => handleReject(item)}
            disabled={actionLoading === item.id}
          >
            <Text style={styles.actionIcon}>❌</Text>
            <Text style={styles.rejectBtnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const filteredDonations = getFilteredDonations();

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['pending', 'all'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'pending' && donations.filter((d) => d.status === 'Pending').length > 0 &&
                ` (${donations.filter((d) => d.status === 'Pending').length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && filteredDonations.length === 0 ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.brand.primary} />
          <Text style={styles.loadingText}>Loading donations...</Text>
        </View>
      ) : filteredDonations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎁</Text>
          <Text style={styles.emptyTitle}>No Donations Found</Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'pending' ? 'All pending donations have been processed' : 'No donation requests yet'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredDonations}
          renderItem={({ item }) => <DonationCard item={item} />}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.brand.primary} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  accessDeniedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  accessDeniedText: { fontSize: 20, fontWeight: 'bold', color: COLORS.brand.danger, marginBottom: 8 },
  accessDeniedSubtext: { fontSize: 14, color: COLORS.text.secondary },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    paddingHorizontal: 16,
    paddingTop: 12,
    elevation: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.brand.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral[600],
  },
  tabTextActive: {
    color: COLORS.brand.primary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.neutral[600],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.neutral[700],
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.neutral[600],
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.brand.accent,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  bookImage: {
    width: 60,
    height: 84,
    borderRadius: 8,
    backgroundColor: COLORS.neutral[200],
  },
  cardInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.neutral[700],
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 13,
    color: COLORS.neutral[600],
    marginBottom: 2,
  },
  bookMeta: {
    fontSize: 11,
    color: COLORS.neutral[400],
    marginBottom: 6,
  },
  donorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  donorLabel: {
    fontSize: 11,
    color: COLORS.text.secondary,
  },
  donorName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.brand.primary,
  },
  dateText: {
    fontSize: 10,
    color: COLORS.neutral[400],
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    height: 28,
  },
  statusText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  noteBox: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  noteText: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionIcon: {
    fontSize: 14,
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  approveBtnText: {
    color: COLORS.status.available,
    fontSize: 12,
    fontWeight: '600',
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rejectBtnText: {
    color: COLORS.brand.danger,
    fontSize: 12,
    fontWeight: '600',
  },
});
