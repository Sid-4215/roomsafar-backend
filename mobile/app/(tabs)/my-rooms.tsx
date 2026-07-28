import React, { useEffect, useState, useCallback } from 'react';
import {
  View, FlatList, StyleSheet, ActivityIndicator,
  RefreshControl, Alert, TouchableOpacity, Image,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import type { Room } from '@/lib/types';
import { useAuth } from '@/lib/auth';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80';

function MyRoomCard({
  room, onEdit, onDelete,
}: { room: Room; onEdit: () => void; onDelete: () => void }) {
  const imageUrl = room.images?.[0]?.url ?? PLACEHOLDER;
  const area = room.address?.area ?? '';
  const city = room.address?.city ?? '';
  const location = [area, city].filter(Boolean).join(', ');

  return (
    <View style={styles.card}>
      <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View style={styles.typeTag}>
            <Text style={styles.typeTagText}>{room.type}</Text>
          </View>
          <Text style={styles.price}>₹{room.rent.toLocaleString()}<Text style={styles.priceSub}>/mo</Text></Text>
        </View>
        {location ? (
          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={13} color="#FF385C" />
            <Text style={styles.location}>{location}</Text>
          </View>
        ) : null}
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.editBtn} onPress={onEdit} activeOpacity={0.8}>
            <MaterialCommunityIcons name="pencil-outline" size={16} color="#222222" />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} activeOpacity={0.8}>
            <MaterialCommunityIcons name="delete-outline" size={16} color="#FF385C" />
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function MyRoomsScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      // getMyRooms returns PaginatedResponse<Room> — extract .content
      const data = await api.getMyRooms();
      setRooms(data.content ?? []);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const handleDelete = (room: Room) => {
    Alert.alert(
      'Delete listing',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteRoom(room.id);
              setRooms((prev) => prev.filter((r) => r.id !== room.id));
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Delete failed');
            }
          },
        },
      ]
    );
  };

  if (!token) {
    return (
      <View style={styles.guestContainer}>
        <Text style={styles.guestEmoji}>🏡</Text>
        <Text style={styles.guestTitle}>Sign in to manage listings</Text>
        <Text style={styles.guestSubtitle}>List your room and reach thousands of renters.</Text>
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
    <View style={styles.container}>
      <FlatList
        data={rooms}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <MyRoomCard
            room={item}
            onEdit={() => router.push({ pathname: '/room/edit', params: { id: item.id } })}
            onDelete={() => handleDelete(item)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF385C" />
        }
        contentContainerStyle={rooms.length === 0 ? styles.emptyContainer : styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Listings</Text>
            <Text style={styles.headerSubtitle}>{rooms.length} room{rooms.length !== 1 ? 's' : ''}</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🏠</Text>
            <Text style={styles.emptyTitle}>No listings yet</Text>
            <Text style={styles.emptySubtitle}>
              List your first room and start earning today.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/room/add')}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons name="plus" size={26} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#222222', letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 14, color: '#717171', marginTop: 3 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  emptyContainer: { flex: 1, backgroundColor: '#F7F7F7' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  cardImage: { width: '100%', height: 160 },
  cardBody: { padding: 14 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeTag: {
    backgroundColor: '#222222',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeTagText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  price: { fontSize: 18, fontWeight: '800', color: '#222222' },
  priceSub: { fontSize: 12, fontWeight: '400', color: '#717171' },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  location: { fontSize: 13, color: '#717171' },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#DDDDDD',
    borderRadius: 12,
    paddingVertical: 10,
  },
  editBtnText: { fontSize: 13, fontWeight: '700', color: '#222222' },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#FFD0D7',
    borderRadius: 12,
    paddingVertical: 10,
    backgroundColor: '#FFF0F2',
  },
  deleteBtnText: { fontSize: 13, fontWeight: '700', color: '#FF385C' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF385C',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#FF385C',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
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
  emptySubtitle: { fontSize: 14, color: '#717171', textAlign: 'center', lineHeight: 20 },
  guestContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  guestEmoji: { fontSize: 64, marginBottom: 16 },
  guestTitle: { fontSize: 22, fontWeight: '800', color: '#222222', marginBottom: 8, textAlign: 'center' },
  guestSubtitle: { fontSize: 14, color: '#717171', textAlign: 'center', marginBottom: 28, lineHeight: 21 },
  signInBtn: {
    backgroundColor: '#FF385C',
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  signInBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
