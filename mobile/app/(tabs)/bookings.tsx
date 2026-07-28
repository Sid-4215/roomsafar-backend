import React, { useEffect, useState, useCallback } from 'react';
import {
  View, FlatList, StyleSheet, ActivityIndicator,
  RefreshControl, Alert,
} from 'react-native';
import { Text, Button, Card, Chip, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import type { Booking } from '@/lib/types';
import { useAuth } from '@/lib/auth';

const STATUS_COLOR: Record<string, string> = {
  PAYMENT_PENDING: '#fef3c7',
  CONFIRMED: '#dcfce7',
  CANCELLED: '#fee2e2',
  COMPLETED: '#eff6ff',
};
const STATUS_TEXT: Record<string, string> = {
  PAYMENT_PENDING: '#92400e',
  CONFIRMED: '#166534',
  CANCELLED: '#991b1b',
  COMPLETED: '#1e40af',
};

function BookingCard({ booking }: { booking: Booking }) {
  const status = booking.status ?? 'UNKNOWN';
  const bg = STATUS_COLOR[status] ?? '#f1f5f9';
  const tc = STATUS_TEXT[status] ?? '#475569';
  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.cardHeader}>
          <View>
            <Text variant="titleSmall" style={styles.bookingId}>
              Booking #{booking.bookingId}
            </Text>
            {booking.roomId ? (
              <Text variant="bodySmall" style={styles.roomId}>Room ID: {booking.roomId}</Text>
            ) : null}
          </View>
          <Chip style={[styles.statusChip, { backgroundColor: bg }]} textStyle={[styles.statusText, { color: tc }]}>
            {status.replace('_', ' ')}
          </Chip>
        </View>

        <Divider style={{ marginVertical: 10 }} />

        <View style={styles.detailRow}>
          {booking.amount ? (
            <View style={styles.detailItem}>
              <Text variant="labelSmall" style={styles.label}>Amount</Text>
              <Text variant="bodyMedium" style={styles.value}>₹{booking.amount.toLocaleString()}</Text>
            </View>
          ) : null}
          {booking.startDate ? (
            <View style={styles.detailItem}>
              <Text variant="labelSmall" style={styles.label}>Check-in</Text>
              <Text variant="bodyMedium" style={styles.value}>{booking.startDate}</Text>
            </View>
          ) : null}
          {booking.endDate ? (
            <View style={styles.detailItem}>
              <Text variant="labelSmall" style={styles.label}>Check-out</Text>
              <Text variant="bodyMedium" style={styles.value}>{booking.endDate}</Text>
            </View>
          ) : null}
        </View>

        {booking.createdAt ? (
          <Text variant="bodySmall" style={styles.date}>
            📅 {new Date(booking.createdAt).toLocaleDateString()}
          </Text>
        ) : null}

        {booking.paymentOrderId ? (
          <Text variant="bodySmall" style={styles.paymentId} numberOfLines={1}>
            Payment ID: {booking.paymentOrderId}
          </Text>
        ) : null}
      </Card.Content>
    </Card>
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
      setError('');
      const data = await api.getMyBookings();
      setBookings(data);
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
      <View style={styles.center}>
        <Text style={styles.emoji}>📅</Text>
        <Text variant="titleMedium" style={styles.title}>Sign in to view bookings</Text>
        <Button mode="contained" onPress={() => router.replace('/(auth)/login')} style={styles.btn}>
          Sign In
        </Button>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.emoji}>⚠️</Text>
        <Text style={{ color: '#ef4444', marginBottom: 16 }}>{error}</Text>
        <Button onPress={load} mode="outlined">Retry</Button>
      </View>
    );
  }

  return (
    <FlatList
      data={bookings}
      keyExtractor={(item) => String(item.bookingId)}
      renderItem={({ item }) => <BookingCard booking={item} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.emoji}>🏠</Text>
          <Text variant="titleMedium" style={styles.title}>No bookings yet</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Browse rooms and book your stay to get started.
          </Text>
          <Button mode="contained" onPress={() => router.push('/(tabs)/')} style={styles.btn}>
            Browse Rooms
          </Button>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: '#f8fafc', paddingHorizontal: 16, paddingVertical: 12, flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#f8fafc' },
  emoji: { fontSize: 56, marginBottom: 12 },
  title: { fontWeight: '700', color: '#1e293b', marginBottom: 8, textAlign: 'center' },
  subtitle: { color: '#64748b', textAlign: 'center', marginBottom: 24 },
  btn: { borderRadius: 12 },
  card: { marginBottom: 12, borderRadius: 16, backgroundColor: '#fff' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bookingId: { fontWeight: '700', color: '#1e293b' },
  roomId: { color: '#64748b', marginTop: 2 },
  statusChip: { height: 28 },
  statusText: { fontSize: 11, fontWeight: '700' },
  detailRow: { flexDirection: 'row', gap: 20, marginBottom: 8 },
  detailItem: {},
  label: { color: '#94a3b8', marginBottom: 2 },
  value: { color: '#1e293b', fontWeight: '600' },
  date: { color: '#94a3b8', marginTop: 4 },
  paymentId: { color: '#94a3b8', marginTop: 2 },
});
