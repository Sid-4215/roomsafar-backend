import React, { useEffect, useState, useCallback } from 'react';
import {
  View, FlatList, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Booking } from '@/lib/types';

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  CONFIRMED: { color: '#00A699', bg: '#E8FAF8', icon: 'check-circle-outline', label: 'Confirmed' },
  PENDING:   { color: '#F5A623', bg: '#FFF8EC', icon: 'clock-outline',         label: 'Pending' },
  CANCELLED: { color: '#FF385C', bg: '#FFF0F2', icon: 'close-circle-outline',  label: 'Cancelled' },
  COMPLETED: { color: '#717171', bg: '#F7F7F7', icon: 'archive-outline',       label: 'Completed' },
};

function BookingCard({ booking }: { booking: Booking }) {
  const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.PENDING;
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <View style={styles.card}>
      {/* Status banner */}
      <View style={[styles.statusBanner, { backgroundColor: status.bg }]}>
        <MaterialCommunityIcons name={status.icon as any} size={16} color={status.color} />
        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
      </View>

      <View style={styles.cardBody}>
        {/* Booking ID */}
        <View style={styles.cardHeader}>
          <Text style={styles.bookingId}>Booking #{booking.bookingId}</Text>
          <Text style={styles.amount}>₹{booking.amount?.toLocaleString()}</Text>
        </View>

        <Text style={styles.roomRef}>Room ID: {booking.roomId}</Text>

        {/* Dates */}
        <View style={styles.datesRow}>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>Check-in</Text>
            <Text style={styles.dateValue}>{booking.startDate ? fmt(booking.startDate) : '—'}</Text>
          </View>
          <View style={styles.dateDivider}>
            <MaterialCommunityIcons name="arrow-right" size={16} color="#CCCCCC" />
          </View>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>Check-out</Text>
            <Text style={styles.dateValue}>{booking.endDate ? fmt(booking.endDate) : '—'}</Text>
          </View>
        </View>

        {booking.createdAt && (
          <Text style={styles.createdAt}>
            Booked {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </Text>
        )}
      </View>
    </View>
  );
}

export default function BookingsScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const data = await api.getMyBookings();
      setBookings(data);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  if (!token) {
    return (
      <View style={styles.guestContainer}>
        <Text style={styles.guestEmoji}>🗓️</Text>
        <Text style={styles.guestTitle}>Sign in to view trips</Text>
        <Text style={styles.guestSubtitle}>Your booking history will appear here.</Text>
        <TouchableOpacity style={styles.signInBtn} onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.signInBtnText}>Sign in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={bookings}
      keyExtractor={(item) => String(item.bookingId)}
      renderItem={({ item }) => <BookingCard booking={item} />}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF385C" />
      }
      contentContainerStyle={bookings.length === 0 ? styles.emptyContainer : styles.list}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Trips</Text>
          <Text style={styles.headerSubtitle}>{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>✈️</Text>
          <Text style={styles.emptyTitle}>No trips yet</Text>
          <Text style={styles.emptySubtitle}>
            Browse rooms and book your first stay to get started.
          </Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(tabs)/')}>
            <Text style={styles.browseBtnText}>Browse Rooms</Text>
          </TouchableOpacity>
        </View>
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#222222', letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 14, color: '#717171', marginTop: 3 },
  list: { backgroundColor: '#F7F7F7', paddingHorizontal: 16, paddingBottom: 32 },
  emptyContainer: { flex: 1, backgroundColor: '#F7F7F7' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  statusText: { fontSize: 12, fontWeight: '700' },
  cardBody: { padding: 14 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bookingId: { fontSize: 16, fontWeight: '800', color: '#222222' },
  amount: { fontSize: 16, fontWeight: '800', color: '#FF385C' },
  roomRef: { fontSize: 13, color: '#717171', marginBottom: 14 },
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  dateBox: { flex: 1 },
  dateLabel: { fontSize: 11, color: '#AAAAAA', fontWeight: '600', marginBottom: 3 },
  dateValue: { fontSize: 13, fontWeight: '700', color: '#222222' },
  dateDivider: { paddingHorizontal: 8 },
  createdAt: { fontSize: 12, color: '#AAAAAA' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    gap: 12,
  },
  errorEmoji: { fontSize: 44 },
  errorText: { color: '#FF385C', fontSize: 14, textAlign: 'center' },
  retryBtn: {
    backgroundColor: '#FF385C',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryText: { color: '#FFFFFF', fontWeight: '700' },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    paddingTop: 60,
  },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#222222', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#717171', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  browseBtn: {
    backgroundColor: '#FF385C',
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  browseBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  guestContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  guestEmoji: { fontSize: 64, marginBottom: 16 },
  guestTitle: { fontSize: 22, fontWeight: '800', color: '#222222', marginBottom: 8 },
  guestSubtitle: { fontSize: 14, color: '#717171', textAlign: 'center', marginBottom: 28 },
  signInBtn: {
    backgroundColor: '#FF385C',
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  signInBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
