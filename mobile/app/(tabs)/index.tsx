import React, { useEffect, useState, useCallback } from 'react';
import {
  View, ScrollView, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { Text, Searchbar, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import type { Room } from '@/lib/types';
import RoomCard from '@/components/RoomCard';

export default function HomeScreen() {
  const router = useRouter();
  const [featured, setFeatured] = useState<Room[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [areas, setAreas] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [featuredData, roomsData, areasData] = await Promise.all([
        api.getFeaturedRooms().catch(() => []),
        api.getRooms(0, 10),
        api.getPopularAreas().catch(() => ({})),
      ]);
      setFeatured(featuredData);
      setRooms(roomsData.content ?? []);
      setHasMore(!roomsData.last);
      setPage(0);
      setAreas(areasData);
    } catch {
      // ignore network errors on load
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const data = await api.getRooms(next, 10);
      setRooms((prev) => [...prev, ...(data.content ?? [])]);
      setHasMore(!data.last);
      setPage(next);
    } finally {
      setLoadingMore(false);
    }
  };

  const goToRoom = (id: number) => router.push(`/room/${id}`);

  const goSearch = (query?: string) => {
    router.push({ pathname: '/(tabs)/search', params: query ? { q: query } : {} });
  };

  const popularAreaList = Object.entries(areas)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e40af" />
        <Text style={styles.loadingText}>Loading rooms…</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={rooms}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <RoomCard room={item} onPress={() => goToRoom(item.id)} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1e40af" />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      ListFooterComponent={
        loadingMore ? <ActivityIndicator style={{ marginVertical: 16 }} color="#1e40af" /> : null
      }
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View>
          {/* Search bar */}
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search by area, city…"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => goSearch(searchQuery)}
              onIconPress={() => goSearch(searchQuery)}
              style={styles.searchBar}
              inputStyle={{ fontSize: 14 }}
            />
          </View>

          {/* Featured rooms */}
          {featured.length > 0 && (
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>✨ Featured Rooms</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredList}>
                {featured.map((room) => (
                  <TouchableOpacity key={room.id} onPress={() => goToRoom(room.id)} activeOpacity={0.85}>
                    <View style={styles.featuredCard}>
                      <View style={styles.featuredImageWrap}>
                        {room.images?.[0] ? (
                          // eslint-disable-next-line @typescript-eslint/no-require-imports
                          <TouchableOpacity onPress={() => goToRoom(room.id)}>
                            {/* Using img tag equivalent in RN */}
                            <View style={[styles.featuredImage, { backgroundColor: '#dbeafe' }]}>
                              <Text style={{ fontSize: 32 }}>🏠</Text>
                            </View>
                          </TouchableOpacity>
                        ) : (
                          <View style={[styles.featuredImage, { backgroundColor: '#dbeafe' }]}>
                            <Text style={{ fontSize: 32 }}>🏠</Text>
                          </View>
                        )}
                      </View>
                      <Text variant="labelLarge" style={styles.featuredPrice}>
                        ₹{room.rent.toLocaleString()}/mo
                      </Text>
                      <Text variant="bodySmall" style={styles.featuredArea} numberOfLines={1}>
                        {room.address?.area ?? room.address?.city ?? 'No location'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Popular areas */}
          {popularAreaList.length > 0 && (
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>📍 Popular Areas</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.areasRow}>
                {popularAreaList.map(([area, count]) => (
                  <Chip
                    key={area}
                    onPress={() => goSearch(area)}
                    style={styles.areaChip}
                    textStyle={styles.areaChipText}
                  >
                    {area} ({count})
                  </Chip>
                ))}
              </ScrollView>
            </View>
          )}

          <Text variant="titleMedium" style={[styles.sectionTitle, { marginHorizontal: 16, marginBottom: 12 }]}>
            🏘️ All Rooms
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: '#f8fafc', paddingBottom: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loadingText: { marginTop: 12, color: '#64748b' },
  searchContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  searchBar: { backgroundColor: '#fff', borderRadius: 14, elevation: 2 },
  section: { marginBottom: 8 },
  sectionTitle: { fontWeight: '700', color: '#1e293b', marginHorizontal: 16, marginBottom: 12, marginTop: 16 },
  featuredList: { paddingHorizontal: 16, gap: 12 },
  featuredCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  featuredImageWrap: { marginBottom: 8 },
  featuredImage: {
    width: '100%',
    height: 90,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredPrice: { color: '#1e40af', fontWeight: '700' },
  featuredArea: { color: '#64748b', marginTop: 2 },
  areasRow: { paddingHorizontal: 16, gap: 8 },
  areaChip: { backgroundColor: '#eff6ff' },
  areaChipText: { color: '#1e40af', fontSize: 12 },
});
