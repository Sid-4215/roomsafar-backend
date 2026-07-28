import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, FlatList, ActivityIndicator,
} from 'react-native';
import { Text, Searchbar, Chip, Button, Menu } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import type { Room } from '@/lib/types';
import RoomCard from '@/components/RoomCard';

const TYPES = ['1BHK', '2BHK', 'PG', 'FLAT', 'STUDIO'];
const FURNISHED_OPTS = [
  { label: 'Furnished', value: 'FURNISHED' },
  { label: 'Semi', value: 'SEMI_FURNISHED' },
  { label: 'Unfurnished', value: 'UNFURNISHED' },
];
const GENDER_OPTS = [
  { label: 'Boys', value: 'MALE' },
  { label: 'Girls', value: 'FEMALE' },
  { label: 'Any', value: 'ANY' },
];

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();

  const [query, setQuery] = useState(params.q ?? '');
  const [type, setType] = useState('');
  const [furnished, setFurnished] = useState('');
  const [gender, setGender] = useState('');
  const [results, setResults] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

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

  // Auto-search when arriving with a query param
  useEffect(() => {
    if (params.q) doSearch(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.q]);

  const toggle = (
    val: string,
    current: string,
    setter: (v: string) => void
  ) => setter(current === val ? '' : val);

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.topBar}>
        <Searchbar
          placeholder="Area or city…"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => doSearch()}
          style={styles.searchBar}
          inputStyle={{ fontSize: 14 }}
        />
        <Button mode="contained" onPress={() => doSearch()} style={styles.searchBtn} compact>
          Go
        </Button>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <Text variant="labelSmall" style={styles.filterLabel}>Type</Text>
        <View style={styles.chipRow}>
          {TYPES.map((t) => (
            <Chip
              key={t}
              selected={type === t}
              onPress={() => toggle(t, type, setType)}
              style={[styles.chip, type === t && styles.chipActive]}
              textStyle={[styles.chipText, type === t && styles.chipTextActive]}
              compact
            >
              {t}
            </Chip>
          ))}
        </View>

        <Text variant="labelSmall" style={[styles.filterLabel, { marginTop: 8 }]}>Furnished</Text>
        <View style={styles.chipRow}>
          {FURNISHED_OPTS.map(({ label, value }) => (
            <Chip
              key={value}
              selected={furnished === value}
              onPress={() => toggle(value, furnished, setFurnished)}
              style={[styles.chip, furnished === value && styles.chipActive]}
              textStyle={[styles.chipText, furnished === value && styles.chipTextActive]}
              compact
            >
              {label}
            </Chip>
          ))}
        </View>

        <Text variant="labelSmall" style={[styles.filterLabel, { marginTop: 8 }]}>Gender</Text>
        <View style={styles.chipRow}>
          {GENDER_OPTS.map(({ label, value }) => (
            <Chip
              key={value}
              selected={gender === value}
              onPress={() => toggle(value, gender, setGender)}
              style={[styles.chip, gender === value && styles.chipActive]}
              textStyle={[styles.chipText, gender === value && styles.chipTextActive]}
              compact
            >
              {label}
            </Chip>
          ))}
        </View>
      </View>

      {/* Results */}
      {loading && !results.length ? (
        <View style={styles.center}>
          <ActivityIndicator color="#1e40af" size="large" />
        </View>
      ) : searched && results.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 40 }}>🔍</Text>
          <Text variant="bodyLarge" style={styles.emptyText}>No rooms found</Text>
          <Text variant="bodySmall" style={styles.emptyHint}>Try adjusting your filters</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <RoomCard room={item} onPress={() => router.push(`/room/${item.id}`)} />
          )}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
          onEndReached={() => hasMore && doSearch(false)}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loading && results.length > 0
              ? <ActivityIndicator style={{ marginVertical: 16 }} color="#1e40af" />
              : null
          }
          ListEmptyComponent={
            !searched ? (
              <View style={styles.center}>
                <Text style={{ fontSize: 48 }}>🏠</Text>
                <Text variant="bodyMedium" style={styles.emptyHint}>
                  Search for rooms by area or city
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  searchBar: { flex: 1, backgroundColor: '#fff', borderRadius: 14 },
  searchBtn: { borderRadius: 12 },
  filters: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterLabel: { color: '#64748b', marginBottom: 6, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: '#f1f5f9', height: 30 },
  chipActive: { backgroundColor: '#1e40af' },
  chipText: { fontSize: 12 },
  chipTextActive: { color: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#1e293b', marginTop: 12, fontWeight: '600' },
  emptyHint: { color: '#94a3b8', marginTop: 6 },
});
