import React, { useEffect, useState, useCallback } from 'react';
import {
  View, FlatList, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Room } from '@/lib/types';
import RoomCard from '@/components/RoomCard';

export default function FavoritesScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const favorites = await api.getFavorites();
      // getFavorites returns Favorite[] (roomId only) — fetch room details for each
      const roomDetails = await Promise.all(
        favorites.map((fav) => api.getRoomById(fav.roomId).catch(() => null))
      );
      setRooms(roomDetails.filter((r): r is Room => r !== null));
      setError('');
    } catch (e: any) {
      setError(e.message || 'Failed to load favorites');
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
        <Text style={styles.guestEmoji}>❤️</Text>
        <Text style={styles.guestTitle}>Sign in to see saved rooms</Text>
        <Text style={styles.guestSubtitle}>
          Rooms you save will appear here for easy access.
        </Text>
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
      data={rooms}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <View style={styles.cardWrap}>
          <RoomCard room={item} onPress={() => router.push(`/room/${item.id}`)} />
        </View>
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF385C" />
      }
      contentContainerStyle={rooms.length === 0 ? styles.emptyContainer : styles.list}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Saved Rooms</Text>
          <Text style={styles.headerSubtitle}>{rooms.length} saved</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>💔</Text>
          <Text style={styles.emptyTitle}>No saved rooms yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the ♡ on any room to save it here.
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
  list: { backgroundColor: '#F7F7F7', paddingBottom: 32 },
  emptyContainer: { flex: 1, backgroundColor: '#F7F7F7' },
  cardWrap: { paddingHorizontal: 16 },
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
  guestTitle: { fontSize: 22, fontWeight: '800', color: '#222222', marginBottom: 8, textAlign: 'center' },
  guestSubtitle: { fontSize: 14, color: '#717171', textAlign: 'center', marginBottom: 28 },
  signInBtn: {
    backgroundColor: '#FF385C',
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  signInBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
