import React, { useState } from 'react';
import {
  View, ScrollView, StyleSheet, KeyboardAvoidingView,
  Platform, Alert,
} from 'react-native';
import { Text, TextInput, Button, Chip, HelperText, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import type { RoomRequest } from '@/lib/types';

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
const CONTACT_OPTS = [
  { label: 'WhatsApp', value: 'WHATSAPP' },
  { label: 'Phone', value: 'PHONE' },
  { label: 'Both', value: 'BOTH' },
];
const AMENITIES_LIST = ['WiFi', 'AC', 'Parking', 'Gym', 'Laundry', 'Kitchen', 'Security', 'Power Backup', 'Water'];

function SectionTitle({ title }: { title: string }) {
  return <Text variant="titleSmall" style={styles.sectionTitle}>{title}</Text>;
}

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

export default function AddRoomScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [type, setType] = useState<string>('1BHK');
  const [furnished, setFurnished] = useState<string>('FURNISHED');
  const [gender, setGender] = useState<string>('ANY');
  const [contactPref, setContactPref] = useState<string>('WHATSAPP');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [line1, setLine1] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');

  const toggleAmenity = (a: string) =>
    setAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);

  const handleSubmit = async () => {
    if (!rent) { setError('Rent is required'); return; }
    if (!area && !city) { setError('Area or city is required'); return; }
    setError('');
    setLoading(true);
    try {
      const req: RoomRequest = {
        rent: Number(rent),
        deposit: Number(deposit) || 0,
        type,
        furnished,
        gender,
        contactPreference: contactPref,
        whatsapp: whatsapp || undefined,
        phone: phone || undefined,
        description: description || undefined,
        amenities,
        address: { line1, area, city, state, pincode },
        images: imageUrl ? [{ url: imageUrl }] : [],
      };
      await api.createRoom(req);
      Alert.alert('Success', 'Room listed successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      setError(e.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text variant="headlineSmall" style={styles.heading}>List Your Room</Text>

        {/* Pricing */}
        <SectionTitle title="💰 Pricing" />
        <View style={styles.row2}>
          <TextInput
            label="Monthly Rent (₹) *"
            value={rent}
            onChangeText={setRent}
            keyboardType="numeric"
            mode="outlined"
            style={[styles.input, { flex: 1 }]}
          />
          <TextInput
            label="Deposit (₹)"
            value={deposit}
            onChangeText={setDeposit}
            keyboardType="numeric"
            mode="outlined"
            style={[styles.input, { flex: 1 }]}
          />
        </View>

        {/* Room Type */}
        <SectionTitle title="🏠 Room Type" />
        <ChipGroup
          options={TYPES.map((t) => ({ label: t, value: t }))}
          value={type}
          onSelect={setType}
        />

        {/* Furnished */}
        <SectionTitle title="🛋️ Furnishing" />
        <ChipGroup options={FURNISHED_OPTS} value={furnished} onSelect={setFurnished} />

        {/* Gender */}
        <SectionTitle title="👤 Preferred For" />
        <ChipGroup options={GENDER_OPTS} value={gender} onSelect={setGender} />

        <Divider style={styles.divider} />

        {/* Address */}
        <SectionTitle title="📍 Address" />
        <TextInput label="Street / Line 1" value={line1} onChangeText={setLine1} mode="outlined" style={styles.input} />
        <View style={styles.row2}>
          <TextInput label="Area *" value={area} onChangeText={setArea} mode="outlined" style={[styles.input, { flex: 1 }]} />
          <TextInput label="City *" value={city} onChangeText={setCity} mode="outlined" style={[styles.input, { flex: 1 }]} />
        </View>
        <View style={styles.row2}>
          <TextInput label="State" value={state} onChangeText={setState} mode="outlined" style={[styles.input, { flex: 1 }]} />
          <TextInput label="Pincode" value={pincode} onChangeText={setPincode} keyboardType="numeric" mode="outlined" style={[styles.input, { flex: 1 }]} />
        </View>

        <Divider style={styles.divider} />

        {/* Contact */}
        <SectionTitle title="📞 Contact" />
        <ChipGroup options={CONTACT_OPTS} value={contactPref} onSelect={setContactPref} />
        <View style={styles.row2}>
          <TextInput label="WhatsApp" value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" mode="outlined" style={[styles.input, { flex: 1 }]} />
          <TextInput label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" mode="outlined" style={[styles.input, { flex: 1 }]} />
        </View>

        <Divider style={styles.divider} />

        {/* Description */}
        <SectionTitle title="📝 Description" />
        <TextInput
          label="Describe your room…"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
        />

        {/* Amenities */}
        <SectionTitle title="✨ Amenities" />
        <View style={styles.chipRow}>
          {AMENITIES_LIST.map((a) => (
            <Chip
              key={a}
              selected={amenities.includes(a)}
              onPress={() => toggleAmenity(a)}
              style={[styles.chip, amenities.includes(a) && styles.chipActive]}
              textStyle={[styles.chipText, amenities.includes(a) && styles.chipTextActive]}
              compact
            >
              {a}
            </Chip>
          ))}
        </View>

        {/* Image URL */}
        <SectionTitle title="🖼️ Image URL" />
        <TextInput
          label="Paste a photo URL (optional)"
          value={imageUrl}
          onChangeText={setImageUrl}
          mode="outlined"
          style={styles.input}
          autoCapitalize="none"
        />

        {error ? <HelperText type="error" visible>{error}</HelperText> : null}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitBtn}
          contentStyle={{ paddingVertical: 6 }}
          labelStyle={{ fontSize: 16, fontWeight: '700' }}
        >
          List Room
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  inner: { padding: 20, paddingBottom: 40 },
  heading: { fontWeight: '800', color: '#1e293b', marginBottom: 20 },
  sectionTitle: { fontWeight: '700', color: '#475569', marginBottom: 8, marginTop: 4 },
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
