import React, { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View, FlatList, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity, Image, Modal, Pressable,
  Platform, useWindowDimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import type { Room } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import AuthWall from '@/components/AuthWall';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80';

function useGridColumns() {
  const { width } = useWindowDimensions();
  if (Platform.OS !== 'web') return 2;
  if (width >= 1200) return 4;
  if (width >= 900) return 3;
  if (width >= 600) return 2;
  return 1;
}

function MyRoomCard({
  room, onEdit, onDelete,
}: { room: Room; onEdit: () => void; onDelete: () => void }) {
  const imageUrl = room.images?.[0]?.url ?? PLACEHOLDER;
  const area = room.address?.area ?? '';
  const city = room.address?.city ?? '';
  const location = [area, city].filter(Boolean).join(', ');
  const furnished: Record<string, string> = {
    FURNISHED: 'Furnished', SEMI_FURNISHED: 'Semi-furnished', UNFURNISHED: 'Unfurnished',
  };

  return (
    <View style={styles.card}>
      {/* Square photo with overlaid action buttons */}
      <View style={styles.imageWrap}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        {/* Type pill */}
        <View style={styles.typePill}>
          <Text style={styles.typePillText}>{room.type}</Text>
        </View>
        {/* Action buttons top-right */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={onEdit} activeOpacity={0.85}>
            <MaterialCommunityIcons name="pencil-outline" size={15} color="#222222" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDelete]} onPress={onDelete} activeOpacity={0.85}>
            <MaterialCommunityIcons name="delete-outline" size={15} color="#FF385C" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Info — same as RoomCard */}
      <View style={styles.info}>
        <Text style={styles.location} numberOfLines={1}>
          {location || 'Location TBD'}
        </Text>
        {furnished[room.furnished ?? ''] ? (
          <Text style={styles.meta} numberOfLines={1}>{furnished[room.furnished ?? '']}</Text>
        ) : null}
        <Text style={styles.price}>
          <Text style={styles.priceNum}>₹{room.rent.toLocaleString()}</Text>
          <Text style={styles.priceSub}> / month</Text>
        </Text>
      </View>
    </View>
  );
}

export default function MyRoomsScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const numColumns = useGridColumns();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = () => { setRefreshing(true); load(); };

  const handleDelete = (room: Room) => {
    setDeleteTarget(room);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteRoom(deleteTarget.id);
      setRooms((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e: any) {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  if (!token) {
    return (
      <AuthWall
        icon="home-edit-outline"
        title="Sign in to manage listings"
        subtitle="List your room and reach thousands of renters."
      />
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
        key={numColumns}
        keyExtractor={(item) => String(item.id)}
        numColumns={numColumns}
        renderItem={({ item }) => (
          <View style={[styles.cardWrap, { width: `${100 / numColumns}%` as any }]}>
            <MyRoomCard
              room={item}
              onEdit={() => router.push({ pathname: '/room/edit', params: { id: item.id } })}
              onDelete={() => handleDelete(item)}
            />
          </View>
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

      {/* Delete confirmation modal */}
      <Modal
        visible={deleteTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setDeleteTarget(null)}>
          <Pressable style={styles.modalBox} onPress={() => {}}>
            <MaterialCommunityIcons name="delete-outline" size={36} color="#FF385C" style={{ marginBottom: 12 }} />
            <Text style={styles.modalTitle}>Delete listing?</Text>
            <Text style={styles.modalMessage}>This cannot be undone.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setDeleteTarget(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalDeleteBtn, deleting && { opacity: 0.6 }]}
                onPress={confirmDelete}
                disabled={deleting}
                activeOpacity={0.8}
              >
                {deleting
                  ? <ActivityIndicator size="small" color="#FFFFFF" />
                  : <Text style={styles.modalDeleteText}>Delete</Text>
                }
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  list: { paddingHorizontal: 8, paddingBottom: 100 },
  emptyContainer: { flex: 1, backgroundColor: '#F7F7F7' },
  cardWrap: { paddingHorizontal: 8 },
  card: { flex: 1 },
  imageWrap: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E8E8E8',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  typePill: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.93)',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  typePillText: { fontSize: 11, fontWeight: '700', color: '#222' },
  actions: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.93)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnDelete: {
    backgroundColor: 'rgba(255,255,255,0.93)',
  },
  info: { paddingTop: 8, paddingBottom: 16 },
  location: { fontSize: 13, fontWeight: '600', color: '#222222', lineHeight: 18 },
  meta: { fontSize: 12, color: '#717171', lineHeight: 17, marginTop: 1 },
  price: { marginTop: 2, fontSize: 13 },
  priceNum: { fontWeight: '700', color: '#222222' },
  priceSub: { fontWeight: '400', color: '#717171' },
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
  // ── Delete confirmation modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#222222', marginBottom: 6 },
  modalMessage: { fontSize: 14, color: '#717171', marginBottom: 24 },
  modalActions: { flexDirection: 'row', gap: 12, width: '100%' },
  modalCancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#DDDDDD',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalCancelText: { fontWeight: '700', color: '#222222', fontSize: 14 },
  modalDeleteBtn: {
    flex: 1,
    backgroundColor: '#FF385C',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalDeleteText: { fontWeight: '700', color: '#FFFFFF', fontSize: 14 },
});
