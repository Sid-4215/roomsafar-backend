import React, { useEffect, useState, useCallback } from 'react';
import {
  View, ScrollView, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl, ActivityIndicator, Image,
} from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import type { Room } from '@/lib/types';
import RoomCard from '@/components/RoomCard';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80';

const TYPE_LABEL: Record<string, string> = {
  BHK1: '1 BHK', BHK2: '2 BHK', BHK3: '3 BHK',
  RK: 'Room-Kitchen', SHARED: 'Shared', PG: 'PG',
};

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
      // ignore on load
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
        <Text style={styles.loadingText}>Finding rooms…</Text>
      </View>
    );
  }

  const ListHeader = (
    <View>
      {/* App header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>RoomSafar</Text>
          <Text style={styles.tagline}>Find your perfect room 🏡</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <MaterialCommunityIcons name="bell-outline" size={22} color="#1e40af" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Searchbar
          placeholder="Search by area, city…"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => goSearch(searchQuery)}
          onIconPress={() => goSearch(searchQuery)}
          style={styles.searchBar}
          inputStyle={{ fontSize: 14 }}
          elevation={0}
        />
      </View>

      {/* Featured rooms */}
      {featured.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✨ Featured</Text>
            <TouchableOpacity onPress={() => goSearch()}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredList}>
            {featured.map((room) => (
              <TouchableOpacity key={room.id} onPress={() => goToRoom(room.id)} activeOpacity={0.88}>
                <View style={styles.featuredCard}>
                  <Image
                    source={{ uri: room.images?.[0]?.url ?? PLACEHOLDER }}
                    style={styles.featuredImage}
                    resizeMode="cover"
                  />
                  <View style={styles.featuredOverlay} />
                  <View style={styles.featuredInfo}>
                    <Text style={styles.featuredPrice}>₹{room.rent.toLocaleString('en-IN')}/mo</Text>
                    <Text style={styles.featuredType}>{TYPE_LABEL[room.type] ?? room.type}</Text>
                    <View style={styles.featuredLocation}>
                      <MaterialCommunityIcons name="map-marker" size={11} color="rgba(255,255,255,0.85)" />
                      <Text style={styles.featuredArea} numberOfLines={1}>
                        {room.address?.area ?? room.address?.city ?? '—'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Popular areas */}
      {popularAreaList.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Popular Areas</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.areasRow}>
            {popularAreaList.map(([area, count]) => (
              <TouchableOpacity key={area} onPress={() => goSearch(area)} style={styles.areaChip}>
                <Text style={styles.areaChipText}>{area}</Text>
                <View style={styles.areaCountBadge}>
                  <Text style={styles.areaCountText}>{count}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Section header */}
      <View style={[styles.sectionHeader, { marginHorizontal: 16, marginBottom: 4, marginTop: 4 }]}>
        <Text style={styles.sectionTitle}>🏘️ All Rooms</Text>
        <Text style={styles.subCount}>{rooms.length}+ listings</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={rooms}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <RoomCard room={item} onPress={() => goToRoom(item.id)} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1e40af" />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      ListFooterComponent={
        loadingMore
          ? <ActivityIndicator style={{ marginVertical: 20 }} color="#1e40af" />
          : hasMore ? null
          : <Text style={styles.endText}>You've seen all rooms</Text>
      }
      contentContainerStyle={styles.list}
      ListHeaderComponent={ListHeader}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: '#f8fafc', paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loadingText: { marginTop: 12, color: '#64748b', fontSize: 14 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: '#fff',
  },
  appName: { fontSize: 24, fontWeight: '800', color: '#1e40af', letterSpacing: -0.5 },
  tagline: { fontSize: 13, color: '#64748b', marginTop: 1 },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Search
  searchWrap: { paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff' },
  searchBar: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    borderWidth: 0,
  },

  // Sections
  section: { marginBottom: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginHorizontal: 16, marginTop: 18, marginBottom: 12 },
  seeAll: { fontSize: 13, color: '#1e40af', fontWeight: '600', marginRight: 16, marginTop: 18 },
  subCount: { fontSize: 12, color: '#94a3b8', marginRight: 16, marginTop: 18 },

  // Featured
  featuredList: { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
  featuredCard: {
    width: 160,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  featuredImage: { width: '100%', height: '100%', position: 'absolute' },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  featuredInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  featuredPrice: { fontSize: 16, fontWeight: '800', color: '#fff' },
  featuredType: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '600', marginTop: 1 },
  featuredLocation: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 3 },
  featuredArea: { fontSize: 11, color: 'rgba(255,255,255,0.8)', flex: 1 },

  // Areas
  areasRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  areaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 20,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 7,
    gap: 6,
  },
  areaChipText: { fontSize: 13, color: '#1e40af', fontWeight: '600' },
  areaCountBadge: {
    backgroundColor: '#1e40af',
    borderRadius: 10,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  areaCountText: { fontSize: 10, color: '#fff', fontWeight: '700' },

  endText: { textAlign: 'center', color: '#94a3b8', fontSize: 13, marginVertical: 20 },
});
