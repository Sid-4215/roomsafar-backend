import React, { useEffect, useState, useCallback } from 'react';
import {
  View, FlatList, StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import type { Favorite, Room } from '@/lib/types';
import RoomCard from '@/components/RoomCard';
import { useAuth } from '@/lib/auth';

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
      setError('');
      const favs: Favorite[] = await api.getFavorites();
      // Fetch room details for each favorite
      const roomResults = await Promise.allSettled(
        favs.map((f) => api.getRoomById(f.roomId))
      );
      const fetchedRooms = roomResults
        .filter((r): r is PromiseFulfilledResult<Room> => r.status === 'fulfilled')
        .map((r) => r.value);
      setRooms(fetchedRooms);
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
      <View style={styles.center}>
        <Text style={styles.emoji}>❤️</Text>
        <Text variant="titleMedium" style={styles.title}>Sign in to see saved rooms</Text>
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
        <Text style={styles.errorText}>{error}</Text>
        <Button onPress={load} mode="outlined" style={styles.btn}>Retry</Button>
      </View>
    );
  }

  return (
    <FlatList
      data={rooms}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <RoomCard room={item} onPress={() => router.push(`/room/${item.id}`)} />
      )}
      contentContainerStyle={rooms.length === 0 ? styles.empty : { paddingTop: 12, paddingBottom: 24 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1e40af" />}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.emoji}>💔</Text>
          <Text variant="titleMedium" style={styles.title}>No saved rooms yet</Text>
          <Text variant="bodySmall" style={styles.hint}>
            Tap the heart icon on any room to save it here.
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  empty: { flex: 1 },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontWeight: '700', color: '#1e293b', marginBottom: 8, textAlign: 'center' },
  hint: { color: '#94a3b8', textAlign: 'center', marginBottom: 24 },
  errorText: { color: '#ef4444', textAlign: 'center', marginBottom: 16 },
  btn: { borderRadius: 12, marginTop: 8 },
});
