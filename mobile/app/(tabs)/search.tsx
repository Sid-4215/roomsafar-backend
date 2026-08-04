import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, ScrollView,
  Platform, useWindowDimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import type { Room } from '@/lib/types';
import RoomCard from '@/components/RoomCard';
import AddressAutocomplete from '@/components/AddressAutocomplete';

const TYPES = [
  { label: '1 BHK', value: 'BHK1' },
  { label: '2 BHK', value: 'BHK2' },
  { label: '3 BHK', value: 'BHK3' },
  { label: 'PG', value: 'PG' },
  { label: 'Shared', value: 'SHARED' },
  { label: 'Room-Kitchen', value: 'RK' },
];

const FURNISHED_OPTS = [
  { label: 'Furnished', value: 'FURNISHED' },
  { label: 'Semi', value: 'SEMI_FURNISHED' },
  { label: 'Unfurnished', value: 'UNFURNISHED' },
];

const GENDER_OPTS = [
  { label: '👨 Boys', value: 'BOYS' },
  { label: '👩 Girls', value: 'GIRLS' },
  { label: '🤝 Any', value: 'ANYONE' },
];

function FilterPill({
  label, active, onPress,
}: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.pill, active && styles.pillActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function useGridColumns() {
  const { width } = useWindowDimensions();
  if (Platform.OS !== 'web') return 2;
  if (width >= 1200) return 4;
  if (width >= 900) return 3;
  if (width >= 600) return 2;
  return 1;
}

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; type?: string }>();
  const numColumns = useGridColumns();

  const [query, setQuery] = useState(params.q ?? '');
  const [type, setType] = useState(params.type ?? '');
  const [furnished, setFurnished] = useState('');
  const [gender, setGender] = useState('');
  const [results, setResults] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const doSearch = async (reset = true) => {
    setLoading(true);
    if (reset) setSearched(true);
    const pg = reset ? 0 : page + 1;
    try {
      const data = await api.searchRooms({
        area: query || undefined,
        city: query || undefined,
        type: type || undefined,
        furnished: furnished || undefined,
        gender: gender || undefined,
        page: pg,
        size: 10,
      });
      if (reset) {
        setResults(data.content ?? []);
      } else {
        setResults((prev) => [...prev, ...(data.content ?? [])]);
      }
      setHasMore(!data.last);
      setPage(pg);
    } catch {
      if (reset) setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.q || params.type) doSearch(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.q, params.type]);

  const toggle = (val: string, current: string, setter: (v: string) => void) =>
    setter(current === val ? '' : val);

  const activeFilterCount = [type, furnished, gender].filter(Boolean).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search Rooms</Text>
      </View>

      {/* Search row */}
      <View style={styles.searchRow}>
        <View style={{ flex: 1 }}>
          <AddressAutocomplete
            value={query}
            onChangeText={setQuery}
            onSelect={(parsed) => {
              // Use the most specific field as the search query
              const q = parsed.area || parsed.city || parsed.displayName;
              setQuery(q);
              setTimeout(() => doSearch(true), 100);
            }}
            placeholder="Area or city…"
          />
        </View>
        <TouchableOpacity
          style={[styles.filterToggle, activeFilterCount > 0 && styles.filterToggleActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <MaterialCommunityIcons
            name="tune-variant"
            size={18}
            color={activeFilterCount > 0 ? '#FFFFFF' : '#222222'}
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchBtn} onPress={() => doSearch()}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Filters panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <Text style={styles.filterGroupLabel}>Room Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
            {TYPES.map(({ label, value }) => (
              <FilterPill
                key={value}
                label={label}
                active={type === value}
                onPress={() => toggle(value, type, setType)}
              />
            ))}
          </ScrollView>

          <Text style={styles.filterGroupLabel}>Furnishing</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
            {FURNISHED_OPTS.map(({ label, value }) => (
              <FilterPill
                key={value}
                label={label}
                active={furnished === value}
                onPress={() => toggle(value, furnished, setFurnished)}
              />
            ))}
          </ScrollView>

          <Text style={styles.filterGroupLabel}>For</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
            {GENDER_OPTS.map(({ label, value }) => (
              <FilterPill
                key={value}
                label={label}
                active={gender === value}
                onPress={() => toggle(value, gender, setGender)}
              />
            ))}
          </ScrollView>

          <View style={styles.filterActions}>
            <TouchableOpacity
              onPress={() => { setType(''); setFurnished(''); setGender(''); }}
              style={styles.clearBtn}
            >
              <Text style={styles.clearBtnText}>Clear all</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => { setShowFilters(false); doSearch(); }}
            >
              <Text style={styles.applyBtnText}>Apply filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Results */}
      {loading && !results.length ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF385C" />
          <Text style={styles.loadingText}>Searching rooms…</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          key={numColumns}
          keyExtractor={(item) => String(item.id)}
          numColumns={numColumns}
          renderItem={({ item }) => (
            <View style={[styles.cardWrap, { width: `${100 / numColumns}%` as any }]}>
              <RoomCard room={item} onPress={() => router.push(`/room/${item.id}`)} />
            </View>
          )}
          contentContainerStyle={results.length === 0 ? styles.emptyContainer : styles.listContent}
          onEndReached={() => { if (hasMore && !loading) doSearch(false); }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loading && results.length > 0 ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#FF385C" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            searched ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={styles.emptyTitle}>No rooms found</Text>
                <Text style={styles.emptySubtitle}>
                  Try adjusting your search or removing filters.
                </Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🏘️</Text>
                <Text style={styles.emptyTitle}>Search for your room</Text>
                <Text style={styles.emptySubtitle}>
                  Enter an area or city above to get started.
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#222222', letterSpacing: -0.3 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#222222',
    padding: 0,
  },
  filterToggle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  filterToggleActive: {
    backgroundColor: '#FF385C',
    borderColor: '#FF385C',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: { fontSize: 9, color: '#FFFFFF', fontWeight: '700' },
  searchBtn: {
    backgroundColor: '#FF385C',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  searchBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  filtersPanel: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterGroupLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#717171',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 8,
  },
  pillRow: { gap: 8, paddingBottom: 2 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  pillActive: { backgroundColor: '#FF385C', borderColor: '#FF385C' },
  pillText: { fontSize: 13, fontWeight: '600', color: '#717171' },
  pillTextActive: { color: '#FFFFFF' },
  filterActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  clearBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    alignItems: 'center',
  },
  clearBtnText: { color: '#717171', fontWeight: '600', fontSize: 14 },
  applyBtn: {
    flex: 2,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#FF385C',
    alignItems: 'center',
  },
  applyBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#717171', fontSize: 14 },
  listContent: { paddingTop: 8, paddingBottom: 32, paddingHorizontal: 8 },
  emptyContainer: { flex: 1 },
  cardWrap: { paddingHorizontal: 8 },
  footerLoader: { paddingVertical: 20, alignItems: 'center' },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#222222', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#717171', textAlign: 'center' },
});
