import React, { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View, ScrollView, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl, ActivityIndicator,
  Image, TextInput, Platform, useWindowDimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import type { Room } from '@/lib/types';
import RoomCard from '@/components/RoomCard';

function useGridColumns() {
  const { width } = useWindowDimensions();
  if (Platform.OS !== 'web') return 1;
  if (width >= 1200) return 3;
  if (width >= 700) return 2;
  return 1;
}
const PLACEHOLDER = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80';

const CATEGORIES = [
  { key: '', label: '✨ All', icon: 'view-grid-outline' },
  { key: 'BHK1', label: '1 BHK', icon: 'home-outline' },
  { key: 'BHK2', label: '2 BHK', icon: 'home-city-outline' },
  { key: 'PG', label: 'PG', icon: 'account-multiple-outline' },
  { key: 'SHARED', label: 'Shared', icon: 'account-group-outline' },
  { key: 'FLAT', label: 'Flat', icon: 'office-building-outline' },
];

export default function HomeScreen() {
  const router = useRouter();
  const numColumns = useGridColumns();
  const [featured, setFeatured] = useState<Room[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [areas, setAreas] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
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
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

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

  const goSearch = (query?: string, type?: string) => {
    router.push({
      pathname: '/(tabs)/search',
      params: { ...(query ? { q: query } : {}), ...(type ? { type } : {}) },
    });
  };

  const popularAreaList = Object.entries(areas)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF385C" />
        <Text style={styles.loadingText}>Finding rooms for you…</Text>
      </View>
    );
  }

  const ListHeader = (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Good day! 👋</Text>
          <Text style={styles.headerTitle}>Find your perfect room</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <MaterialCommunityIcons name="bell-outline" size={22} color="#222222" />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => goSearch(searchQuery)}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="magnify" size={20} color="#717171" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by area, city…"
          placeholderTextColor="#AAAAAA"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => goSearch(searchQuery)}
          returnKeyType="search"
        />
        <View style={styles.filterBtn}>
          <MaterialCommunityIcons name="tune-variant" size={16} color="#FF385C" />
        </View>
      </TouchableOpacity>

      {/* Category pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.categoryPill,
              activeCategory === cat.key && styles.categoryPillActive,
            ]}
            onPress={() => {
              setActiveCategory(cat.key);
              if (cat.key) goSearch(undefined, cat.key);
            }}
          >
            <Text
              style={[
                styles.categoryText,
                activeCategory === cat.key && styles.categoryTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Featured section */}
      {featured.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Rooms</Text>
            <TouchableOpacity onPress={() => goSearch()}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          >
            {featured.map((room) => (
              <TouchableOpacity
                key={room.id}
                style={styles.featuredCard}
                onPress={() => router.push(`/room/${room.id}`)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: room.images?.[0]?.url ?? PLACEHOLDER }}
                  style={styles.featuredImage}
                  resizeMode="cover"
                />
                <View style={styles.featuredGradient} />
                <View style={styles.featuredBadge}>
                  <MaterialCommunityIcons name="star" size={11} color="#F5A623" />
                  <Text style={styles.featuredBadgeText}>Featured</Text>
                </View>
                <View style={styles.featuredInfo}>
                  <Text style={styles.featuredLocation} numberOfLines={1}>
                    {[room.address?.area, room.address?.city].filter(Boolean).join(', ')}
                  </Text>
                  <Text style={styles.featuredPrice}>₹{room.rent.toLocaleString()}/mo</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Popular areas */}
      {popularAreaList.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Areas</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.areaList}
          >
            {popularAreaList.map(([area, count]) => (
              <TouchableOpacity
                key={area}
                style={styles.areaChip}
                onPress={() => goSearch(area)}
              >
                <MaterialCommunityIcons name="map-marker-outline" size={14} color="#FF385C" />
                <Text style={styles.areaName}>{area}</Text>
                <Text style={styles.areaCount}>{count}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* All rooms header */}
      <View style={[styles.sectionHeader, { paddingHorizontal: 16, marginBottom: 4 }]}>
        <Text style={styles.sectionTitle}>All Rooms</Text>
        <Text style={styles.sectionCount}>{rooms.length}+ listings</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={rooms}
      key={numColumns}
      keyExtractor={(item) => String(item.id)}
      numColumns={numColumns}
      renderItem={({ item }) => (
        <View style={[styles.cardWrap, numColumns > 1 && styles.cardWrapGrid]}>
          <RoomCard room={item} onPress={() => router.push(`/room/${item.id}`)} />
        </View>
      )}
      ListHeaderComponent={ListHeader}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#FF385C"
          colors={['#FF385C']}
        />
      }
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator size="small" color="#FF385C" />
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🏠</Text>
          <Text style={styles.emptyTitle}>No rooms yet</Text>
          <Text style={styles.emptySubtitle}>Check back soon — listings are added daily.</Text>
        </View>
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.list, numColumns > 1 && styles.listGrid]}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  loadingText: { color: '#717171', fontSize: 14 },
  list: { backgroundColor: '#F7F7F7', paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerGreeting: { fontSize: 13, color: '#717171', marginBottom: 2 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#222222', letterSpacing: -0.3 },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF385C',
    borderWidth: 1.5,
    borderColor: '#F7F7F7',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 40,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    gap: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#222222',
    padding: 0,
  },
  filterBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF0F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  categoryPillActive: {
    backgroundColor: '#FF385C',
    borderColor: '#FF385C',
  },
  categoryText: { fontSize: 13, fontWeight: '600', color: '#717171' },
  categoryTextActive: { color: '#FFFFFF' },
  section: { backgroundColor: '#FFFFFF', marginBottom: 8 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#222222' },
  sectionCount: { fontSize: 13, color: '#717171' },
  seeAll: { fontSize: 13, color: '#FF385C', fontWeight: '600' },
  featuredList: { paddingHorizontal: 16, paddingBottom: 20, gap: 12 },
  featuredCard: {
    width: 240,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  featuredImage: { width: '100%', height: '100%' },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  featuredBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 3,
  },
  featuredBadgeText: { fontSize: 11, fontWeight: '700', color: '#222222' },
  featuredInfo: { position: 'absolute', bottom: 12, left: 12, right: 12 },
  featuredLocation: { fontSize: 13, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 },
  featuredPrice: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  areaList: { paddingHorizontal: 16, paddingBottom: 20, gap: 8 },
  areaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF0F2',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  areaName: { fontSize: 13, fontWeight: '600', color: '#222222' },
  areaCount: {
    fontSize: 11,
    color: '#FF385C',
    fontWeight: '700',
    backgroundColor: '#FFD7DD',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  cardWrap: { paddingHorizontal: 16 },
  cardWrapGrid: { flex: 1, paddingHorizontal: 8 },
  listGrid: { paddingHorizontal: 8 },
  footerLoader: { paddingVertical: 20, alignItems: 'center' },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#222222', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#717171', textAlign: 'center' },
});
