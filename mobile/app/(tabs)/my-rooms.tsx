import React, { useEffect, useState, useCallback } from 'react';
import {
  View, FlatList, StyleSheet, ActivityIndicator,
  RefreshControl, Alert, TouchableOpacity,
} from 'react-native';
import { Text, Button, Card, FAB, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import type { Room } from '@/lib/types';
import { useAuth } from '@/lib/auth';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80';

function MyRoomCard({ room, onEdit, onDelete }: { room: Room; onEdit: () => void; onDelete: () => void }) {
  const imageUrl = room.images?.[0]?.url ?? PLACEHOLDER;
  const area = room.address?.area ?? '';
  const city = room.address?.city ?? '';
  const location = [area, city].filter(Boolean).join(', ');
  return (
    <Card style={styles.card} mode="elevated">
      <Card.Cover source={{ uri: imageUrl }} style={styles.cover} />
      <Card.Content style={{ paddingTop: 12 }}>
        <View style={styles.rowBetween}>
          <Text variant="titleMedium" style={styles.price}>₹{room.rent.toLocaleString()}/mo</Text>
          <Chip compact style={styles.typeChip} textStyle={{ fontSize: 11 }}>{room.type}</Chip>
        </View>
        {location ? (
          <Text variant="bodySmall" style={styles.location}>📍 {location}</Text>
        ) : null}
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <Button onPress={onEdit} icon="pencil" mode="outlined" compact style={styles.actionBtn}>
          Edit
        </Button>
        <Button onPress={onDelete} icon="delete" mode="outlined" compact style={[styles.actionBtn, styles.deleteBtn]} textColor="#ef4444">
          Delete
        </Button>
      </Card.Actions>
    </Card>
  );
}

export default function MyRoomsScreen() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      setError('');
      const data = await api.getMyRooms();
      setRooms(data.content ?? []);
    } catch (e: any) {
      setError(e.message || 'Failed to load your rooms');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const handleDelete = (room: Room) => {
    Alert.alert('Delete Room', 'Are you sure you want to delete this listing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteRoom(room.id);
            setRooms((prev) => prev.filter((r) => r.id !== room.id));
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to delete room');
          }
        },
      },
    ]);
  };

  if (!token) {
    return (
      <View style={styles.center}>
        <Text style={styles.emoji}>🏠</Text>
        <Text variant="titleMedium" style={styles.title}>Sign in to manage your rooms</Text>
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

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={rooms}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <MyRoomCard
            room={item}
            onEdit={() => router.push({ pathname: '/room/edit', params: { id: String(item.id) } })}
            onDelete={() => handleDelete(item)}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="titleMedium" style={styles.headerTitle}>
              🏠 My Listings ({rooms.length})
            </Text>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.center}>
              <Text style={styles.emoji}>🏠</Text>
              <Text variant="titleMedium" style={styles.title}>No listings yet</Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Tap the + button to add your first room listing.
              </Text>
            </View>
          ) : null
        }
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/room/add')}
        color="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: '#f8fafc', padding: 16, paddingBottom: 80, flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#f8fafc' },
  emoji: { fontSize: 56, marginBottom: 12 },
  title: { fontWeight: '700', color: '#1e293b', marginBottom: 8, textAlign: 'center' },
  subtitle: { color: '#64748b', textAlign: 'center', marginBottom: 24 },
  btn: { borderRadius: 12 },
  header: { marginBottom: 12 },
  headerTitle: { fontWeight: '700', color: '#1e293b' },
  card: { marginBottom: 12, borderRadius: 16, backgroundColor: '#fff', overflow: 'hidden' },
  cover: { height: 160, borderRadius: 0 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  price: { color: '#1e40af', fontWeight: '700' },
  typeChip: { backgroundColor: '#eff6ff' },
  location: { color: '#64748b' },
  actions: { paddingHorizontal: 12, paddingBottom: 12, gap: 8 },
  actionBtn: { borderRadius: 8, flex: 1 },
  deleteBtn: { borderColor: '#fecaca' },
  fab: { position: 'absolute', right: 20, bottom: 24, backgroundColor: '#1e40af', borderRadius: 16 },
});
