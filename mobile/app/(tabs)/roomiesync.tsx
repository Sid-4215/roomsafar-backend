import React, { useEffect, useState, useCallback } from 'react';
import {
  View, FlatList, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity, Alert,
} from 'react-native';
import {
  Text, Searchbar, Chip, Button, Card, FAB,
  Modal, Portal, TextInput, HelperText,
} from 'react-native-paper';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import type { RoomieListing } from '@/lib/types';
import { useRouter } from 'expo-router';

const TYPE_OPTS = [
  { label: 'All', value: '' },
  { label: 'Looking for Room', value: 'LOOKING_FOR_ROOM' },
  { label: 'Have a Room', value: 'HAVE_ROOM' },
];
const GENDER_OPTS = [
  { label: 'Any', value: '' },
  { label: 'Boys', value: 'MALE' },
  { label: 'Girls', value: 'FEMALE' },
];

function ListingCard({ listing, onContact }: { listing: RoomieListing; onContact: () => void }) {
  const typeLabel = listing.listingType === 'LOOKING_FOR_ROOM' ? '🔍 Looking for room' : '🏠 Has a room';
  const typeColor = listing.listingType === 'LOOKING_FOR_ROOM' ? '#eff6ff' : '#f0fdf4';
  const typeTextColor = listing.listingType === 'LOOKING_FOR_ROOM' ? '#1e40af' : '#166534';
  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.cardHeader}>
          <Chip style={[styles.typeChip, { backgroundColor: typeColor }]}
            textStyle={[styles.typeText, { color: typeTextColor }]} compact>
            {typeLabel}
          </Chip>
          {listing.rent ? (
            <Text variant="titleSmall" style={styles.rent}>₹{listing.rent.toLocaleString()}/mo</Text>
          ) : null}
        </View>
        {listing.title ? (
          <Text variant="bodyMedium" style={styles.title} numberOfLines={2}>{listing.title}</Text>
        ) : null}
        {listing.description ? (
          <Text variant="bodySmall" style={styles.desc} numberOfLines={3}>{listing.description}</Text>
        ) : null}
        <View style={styles.metaRow}>
          {listing.area || listing.city ? (
            <Chip compact style={styles.metaChip} textStyle={styles.metaText}>
              📍 {[listing.area, listing.city].filter(Boolean).join(', ')}
            </Chip>
          ) : null}
          {listing.gender ? (
            <Chip compact style={styles.metaChip} textStyle={styles.metaText}>
              {listing.gender === 'MALE' ? '👦 Boys' : listing.gender === 'FEMALE' ? '👧 Girls' : '👥 Any'}
            </Chip>
          ) : null}
          {listing.createdAt ? (
            <Chip compact style={styles.metaChip} textStyle={styles.metaText}>
              {new Date(listing.createdAt).toLocaleDateString()}
            </Chip>
          ) : null}
        </View>
      </Card.Content>
      <Card.Actions style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
        <Button onPress={onContact} mode="contained" compact style={{ borderRadius: 8, flex: 1 }}>
          Contact
        </Button>
      </Card.Actions>
    </Card>
  );
}

// Add Listing Modal
function AddListingModal({ visible, onDismiss, onCreated }: { visible: boolean; onDismiss: () => void; onCreated: () => void }) {
  const { token } = useAuth();
  const [listingType, setListingType] = useState('LOOKING_FOR_ROOM');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rent, setRent] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState('ANY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => { setTitle(''); setDescription(''); setRent(''); setArea(''); setCity(''); setGender('ANY'); setError(''); };

  const handleCreate = async () => {
    if (!title) { setError('Title is required'); return; }
    setError('');
    setLoading(true);
    try {
      await api.createRoomieListing({ listingType, title, description, rent: rent ? Number(rent) : undefined, area, city, gender });
      reset();
      onCreated();
    } catch (e: any) {
      setError(e.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Text variant="titleMedium" style={styles.modalTitle}>Post a Listing</Text>

        <Text variant="labelSmall" style={styles.fieldLabel}>Type</Text>
        <View style={styles.chipRow}>
          {[{ label: 'Looking for Room', value: 'LOOKING_FOR_ROOM' }, { label: 'Have a Room', value: 'HAVE_ROOM' }].map((o) => (
            <Chip key={o.value} selected={listingType === o.value} onPress={() => setListingType(o.value)}
              style={[styles.chip, listingType === o.value && styles.chipActive]}
              textStyle={[styles.chipText, listingType === o.value && styles.chipTextActive]} compact>
              {o.label}
            </Chip>
          ))}
        </View>

        <TextInput label="Title *" value={title} onChangeText={setTitle} mode="outlined" style={styles.modalInput} />
        <TextInput label="Description" value={description} onChangeText={setDescription} mode="outlined" multiline numberOfLines={3} style={styles.modalInput} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextInput label="Area" value={area} onChangeText={setArea} mode="outlined" style={[styles.modalInput, { flex: 1 }]} />
          <TextInput label="City" value={city} onChangeText={setCity} mode="outlined" style={[styles.modalInput, { flex: 1 }]} />
        </View>
        <TextInput label="Expected Rent (₹)" value={rent} onChangeText={setRent} keyboardType="numeric" mode="outlined" style={styles.modalInput} />

        <Text variant="labelSmall" style={styles.fieldLabel}>Gender</Text>
        <View style={styles.chipRow}>
          {[{ label: 'Any', value: 'ANY' }, { label: 'Boys', value: 'MALE' }, { label: 'Girls', value: 'FEMALE' }].map((o) => (
            <Chip key={o.value} selected={gender === o.value} onPress={() => setGender(o.value)}
              style={[styles.chip, gender === o.value && styles.chipActive]}
              textStyle={[styles.chipText, gender === o.value && styles.chipTextActive]} compact>
              {o.label}
            </Chip>
          ))}
        </View>

        {error ? <HelperText type="error" visible>{error}</HelperText> : null}

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
          <Button mode="outlined" onPress={onDismiss} style={{ flex: 1, borderRadius: 10 }}>Cancel</Button>
          <Button mode="contained" onPress={handleCreate} loading={loading} disabled={loading} style={{ flex: 1, borderRadius: 10 }}>Post</Button>
        </View>
      </Modal>
    </Portal>
  );
}

export default function RoomieSyncScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<RoomieListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const load = useCallback(async (reset = true) => {
    const pg = reset ? 0 : page + 1;
    try {
      const data = await api.getRoomieListings({
        query: query || undefined,
        listingType: typeFilter || undefined,
        page: pg,
        size: 15,
      });
      if (reset) {
        setListings(data.content ?? []);
      } else {
        setListings((prev) => [...prev, ...(data.content ?? [])]);
      }
      setHasMore(!data.last);
      setPage(pg);
    } catch {
      if (reset) setListings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [query, typeFilter, page]);

  useEffect(() => { setLoading(true); load(true); }, [typeFilter]);

  const onRefresh = () => { setRefreshing(true); load(true); };

  const handleContact = (listing: RoomieListing) => {
    Alert.alert('Contact', `Send a connection request to listing #${listing.id}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Connect', onPress: () => {} },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <AddListingModal visible={showAdd} onDismiss={() => setShowAdd(false)} onCreated={() => { setShowAdd(false); onRefresh(); }} />

      <FlatList
        data={listings}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ListingCard listing={item} onContact={() => handleContact(item)} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={() => { if (hasMore) load(false); }}
        onEndReachedThreshold={0.4}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Searchbar
              placeholder="Search by area, city…"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => load(true)}
              style={styles.searchBar}
              inputStyle={{ fontSize: 14 }}
            />
            <View style={styles.filterRow}>
              {TYPE_OPTS.map((o) => (
                <Chip key={o.value} selected={typeFilter === o.value} onPress={() => setTypeFilter(o.value)}
                  style={[styles.filterChip, typeFilter === o.value && styles.chipActive]}
                  textStyle={[{ fontSize: 12 }, typeFilter === o.value && styles.chipTextActive]} compact>
                  {o.label}
                </Chip>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 48 }}>🤝</Text>
              <Text variant="titleMedium" style={styles.emptyTitle}>No listings found</Text>
              <Text variant="bodySmall" style={styles.emptyHint}>Be the first to post a roomie listing!</Text>
            </View>
          ) : null
        }
        ListFooterComponent={loading ? <ActivityIndicator style={{ marginVertical: 16 }} color="#1e40af" /> : null}
      />

      <FAB icon="plus" style={styles.fab} onPress={() => token ? setShowAdd(true) : router.replace('/(auth)/login')} color="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: '#f8fafc', padding: 16, paddingBottom: 80, flexGrow: 1 },
  searchBar: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 10, elevation: 2 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  filterChip: { backgroundColor: '#f1f5f9', height: 30 },
  card: { marginBottom: 12, borderRadius: 16, backgroundColor: '#fff' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  typeChip: { height: 26 },
  typeText: { fontSize: 11, fontWeight: '700' },
  rent: { color: '#1e40af', fontWeight: '700' },
  title: { color: '#1e293b', fontWeight: '600', marginBottom: 4 },
  desc: { color: '#64748b', lineHeight: 18, marginBottom: 8 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  metaChip: { backgroundColor: '#f1f5f9', height: 24 },
  metaText: { fontSize: 10 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontWeight: '700', color: '#1e293b', marginTop: 12 },
  emptyHint: { color: '#94a3b8', marginTop: 4 },
  fab: { position: 'absolute', right: 20, bottom: 24, backgroundColor: '#1e40af', borderRadius: 16 },
  // Modal
  modal: { backgroundColor: '#fff', margin: 20, borderRadius: 20, padding: 24, maxHeight: '90%' },
  modalTitle: { fontWeight: '700', color: '#1e293b', marginBottom: 16 },
  modalInput: { marginBottom: 10, backgroundColor: '#fff' },
  fieldLabel: { color: '#64748b', marginBottom: 6, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { backgroundColor: '#f1f5f9', height: 32 },
  chipActive: { backgroundColor: '#1e40af' },
  chipText: { fontSize: 12 },
  chipTextActive: { color: '#fff' },
});
