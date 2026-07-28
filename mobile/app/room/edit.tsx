import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, StyleSheet, KeyboardAvoidingView,
  Platform, Alert, ActivityIndicator,
} from 'react-native';
import { Text, TextInput, Button, Chip, HelperText, Divider } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import type { RoomRequest, Room } from '@/lib/types';

const TYPES = ['1BHK', '2BHK', 'STUDIO', 'PG', 'FLAT'];
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
const AMENITIES_LIST = ['WiFi', 'AC', 'Parking', 'Gym', 'Laundry', 'Kitchen', 'Security', 'Power Backup', 'Water'];

function ChipGroup<T extends string>({
  options,
  value,
  onSelect,
}: {
  options: { label: string; value: T }[];
  value: T;
  onSelect: (v: T) => void;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((o) => (
        <Chip
          key={o.value}
          selected={value === o.value}
          onPress={() => onSelect(o.value)}
          style={[styles.chip, value === o.value && styles.chipActive]}
          textStyle={[styles.chipText, value === o.value && styles.chipTextActive]}
          compact
        >
          {o.label}
        </Chip>
      ))}
    </View>
  );
}

export default function EditRoomScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [type, setType] = useState<string>('1BHK');
  const [furnished, setFurnished] = useState<string>('FURNISHED');
  const [gender, setGender] = useState<string>('ANY');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const room = await api.getRoomById(Number(id));
        setRent(String(room.rent));
        setDeposit(String(room.deposit ?? ''));
        setType(room.type ?? '1BHK');
        setFurnished(room.furnished ?? 'FURNISHED');
        setGender(room.gender ?? 'ANY');
        setWhatsapp(room.whatsapp ?? '');
        setPhone(room.phone ?? '');
        setDescription(room.description ?? '');
        setArea(room.address?.area ?? '');
        setCity(room.address?.city ?? '');
        setState(room.address?.state ?? '');
        setPincode(room.address?.pincode ?? '');
        setAmenities(room.amenities ?? []);
        setImageUrl(room.images?.[0]?.url ?? '');
      } catch (e: any) {
        setError(e.message || 'Failed to load room');
      } finally {
        setLoadingRoom(false);
      }
    })();
  }, [id]);

  const toggleAmenity = (a: string) =>
    setAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);

  const handleSave = async () => {
    if (!rent) { setError('Rent is required'); return; }
    setError('');
    setSaving(true);
    try {
      const req: RoomRequest = {
        rent: Number(rent),
        deposit: Number(deposit) || 0,
        type,
        furnished,
        gender,
        whatsapp: whatsapp || undefined,
        phone: phone || undefined,
        description: description || undefined,
        amenities,
        address: { area, city, state, pincode },
        images: imageUrl ? [{ url: imageUrl }] : [],
      };
      await api.updateRoom(Number(id), req);
      Alert.alert('Saved', 'Room updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      setError(e.message || 'Failed to update room');
    } finally {
      setSaving(false);
    }
  };

  if (loadingRoom) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text variant="headlineSmall" style={styles.heading}>Edit Listing</Text>

        <View style={styles.row2}>
          <TextInput label="Rent (₹) *" value={rent} onChangeText={setRent} keyboardType="numeric" mode="outlined" style={[styles.input, { flex: 1 }]} />
          <TextInput label="Deposit (₹)" value={deposit} onChangeText={setDeposit} keyboardType="numeric" mode="outlined" style={[styles.input, { flex: 1 }]} />
        </View>

        <Text variant="labelSmall" style={styles.label}>Room Type</Text>
        <ChipGroup options={TYPES.map((t) => ({ label: t, value: t }))} value={type} onSelect={setType} />

        <Text variant="labelSmall" style={styles.label}>Furnishing</Text>
        <ChipGroup options={FURNISHED_OPTS} value={furnished} onSelect={setFurnished} />

        <Text variant="labelSmall" style={styles.label}>Preferred For</Text>
        <ChipGroup options={GENDER_OPTS} value={gender} onSelect={setGender} />

        <Divider style={styles.divider} />

        <View style={styles.row2}>
          <TextInput label="Area" value={area} onChangeText={setArea} mode="outlined" style={[styles.input, { flex: 1 }]} />
          <TextInput label="City" value={city} onChangeText={setCity} mode="outlined" style={[styles.input, { flex: 1 }]} />
        </View>
        <View style={styles.row2}>
          <TextInput label="State" value={state} onChangeText={setState} mode="outlined" style={[styles.input, { flex: 1 }]} />
          <TextInput label="Pincode" value={pincode} onChangeText={setPincode} keyboardType="numeric" mode="outlined" style={[styles.input, { flex: 1 }]} />
        </View>

        <Divider style={styles.divider} />

        <View style={styles.row2}>
          <TextInput label="WhatsApp" value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" mode="outlined" style={[styles.input, { flex: 1 }]} />
          <TextInput label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" mode="outlined" style={[styles.input, { flex: 1 }]} />
        </View>

        <TextInput label="Description" value={description} onChangeText={setDescription} mode="outlined" multiline numberOfLines={3} style={styles.input} />

        <Text variant="labelSmall" style={styles.label}>Amenities</Text>
        <View style={styles.chipRow}>
          {AMENITIES_LIST.map((a) => (
            <Chip key={a} selected={amenities.includes(a)} onPress={() => toggleAmenity(a)}
              style={[styles.chip, amenities.includes(a) && styles.chipActive]}
              textStyle={[styles.chipText, amenities.includes(a) && styles.chipTextActive]} compact>
              {a}
            </Chip>
          ))}
        </View>

        <TextInput label="Image URL" value={imageUrl} onChangeText={setImageUrl} mode="outlined" style={styles.input} autoCapitalize="none" />

        {error ? <HelperText type="error" visible>{error}</HelperText> : null}

        <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving}
          style={styles.submitBtn} contentStyle={{ paddingVertical: 6 }} labelStyle={{ fontSize: 16, fontWeight: '700' }}>
          Save Changes
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  inner: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading: { fontWeight: '800', color: '#1e293b', marginBottom: 20 },
  label: { color: '#64748b', marginBottom: 6, fontWeight: '600' },
  input: { marginBottom: 10, backgroundColor: '#fff' },
  row2: { flexDirection: 'row', gap: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { backgroundColor: '#f1f5f9', height: 32 },
  chipActive: { backgroundColor: '#1e40af' },
  chipText: { fontSize: 12 },
  chipTextActive: { color: '#fff' },
  divider: { marginVertical: 12 },
  submitBtn: { marginTop: 16, borderRadius: 14 },
});
