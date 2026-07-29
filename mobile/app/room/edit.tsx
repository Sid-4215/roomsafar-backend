import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
  TouchableOpacity, Image, Alert, ActivityIndicator,
} from 'react-native';
import { Text, TextInput, Button, Chip, HelperText } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import { pickImage, uploadImageAsset } from '@/lib/uploadImage';
import type { RoomRequest, Room } from '@/lib/types';

/* ─── constants ──────────────────────────────────────────────────────────── */
const PRIMARY = '#FF385C';
const TYPES = [
  { label: '1 BHK', value: 'BHK1' },
  { label: '2 BHK', value: 'BHK2' },
  { label: '3 BHK', value: 'BHK3' },
  { label: 'Studio/RK', value: 'RK' },
  { label: 'Shared', value: 'SHARED' },
  { label: 'PG', value: 'PG' },
];
const FURNISHED_OPTS = [
  { label: 'Furnished', value: 'FURNISHED' },
  { label: 'Semi', value: 'SEMI_FURNISHED' },
  { label: 'Unfurnished', value: 'UNFURNISHED' },
];
const GENDER_OPTS = [
  { label: 'Boys', value: 'BOYS' },
  { label: 'Girls', value: 'GIRLS' },
  { label: 'Anyone', value: 'ANYONE' },
];
const CONTACT_OPTS = [
  { label: 'WhatsApp', value: 'WHATSAPP' },
  { label: 'Phone', value: 'PHONE' },
  { label: 'Both', value: 'BOTH' },
];
const AMENITIES_LIST = [
  'WiFi', 'AC', 'Parking', 'Gym', 'Laundry',
  'Kitchen', 'Security', 'Power Backup', 'Water',
];
const TILE = 104;

/* ─── helpers ────────────────────────────────────────────────────────────── */
function SectionLabel({ text }: { text: string }) {
  return <Text style={styles.sectionLabel}>{text}</Text>;
}

function ChipRow<T extends string>({
  options, value, onSelect,
}: {
  options: { label: string; value: T }[];
  value: T;
  onSelect: (v: T) => void;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <Chip
            key={o.value}
            selected={active}
            onPress={() => onSelect(o.value)}
            style={[styles.chip, active && styles.chipActive]}
            textStyle={[styles.chipText, active && styles.chipTextActive]}
            compact
          >
            {o.label}
          </Chip>
        );
      })}
    </View>
  );
}

function PhotoGrid({
  photos, uploading, onAdd, onRemove,
}: {
  photos: string[];
  uploading: boolean;
  onAdd: () => void;
  onRemove: (i: number) => void;
}) {
  return (
    <View>
      <View style={styles.photoGrid}>
        {photos.map((uri, i) => (
          <View key={uri + i} style={styles.photoTile}>
            <Image source={{ uri }} style={styles.photoImage} />
            <TouchableOpacity
              style={styles.photoDelete}
              onPress={() => onRemove(i)}
              hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
            >
              <Ionicons name="close-circle" size={22} color="#fff" />
            </TouchableOpacity>
            {i === 0 && (
              <View style={styles.photoCover}>
                <Text style={styles.photoCoverText}>Cover</Text>
              </View>
            )}
          </View>
        ))}
        {photos.length < 5 && (
          <TouchableOpacity
            style={styles.photoAdd}
            onPress={onAdd}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color={PRIMARY} />
            ) : (
              <>
                <Ionicons name="camera-outline" size={26} color={PRIMARY} />
                <Text style={styles.photoAddText}>
                  {photos.length === 0 ? 'Add Photos' : 'Add More'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
      {photos.length === 0 && !uploading && (
        <Text style={styles.photoHint}>
          No photos yet — add at least one so tenants can see the space.
        </Text>
      )}
    </View>
  );
}

/* ─── screen ─────────────────────────────────────────────────────────────── */
export default function EditRoomScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loadingRoom, setLoadingRoom] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const [photos, setPhotos] = useState<string[]>([]);
  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [type, setType] = useState<string>('BHK1');
  const [furnished, setFurnished] = useState<string>('FURNISHED');
  const [gender, setGender] = useState<string>('ANYONE');
  const [line1, setLine1] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [contactPref, setContactPref] = useState<string>('WHATSAPP');
  const [description, setDescription] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [brokerageRequired, setBrokerageRequired] = useState(false);
  const [brokerageAmount, setBrokerageAmount] = useState('');

  /* load existing room */
  useEffect(() => {
    (async () => {
      try {
        const room: Room = await api.getRoomById(Number(id));
        setRent(String(room.rent));
        setDeposit(String(room.deposit ?? ''));
        setType(room.type ?? 'BHK1');
        setFurnished(room.furnished ?? 'FURNISHED');
        setGender(room.gender ?? 'ANYONE');
        setLine1(room.address?.line1 ?? '');
        setArea(room.address?.area ?? '');
        setCity(room.address?.city ?? '');
        setState(room.address?.state ?? '');
        setPincode(room.address?.pincode ?? '');
        setWhatsapp(room.whatsapp ?? '');
        setPhone(room.phone ?? '');
        setContactPref(room.contactPreference ?? 'WHATSAPP');
        setDescription(room.description ?? '');
        setAmenities(room.amenities ?? []);
        setBrokerageRequired(room.brokerageRequired ?? false);
        setBrokerageAmount(room.brokerageAmount ? String(room.brokerageAmount) : '');
        // Pre-populate existing photo URLs
        const existingPhotos = (room.images ?? [])
          .sort((a: any, b: any) => (a.sequence ?? 0) - (b.sequence ?? 0))
          .map((img: any) => img.url)
          .filter(Boolean);
        setPhotos(existingPhotos);
      } catch (e: any) {
        setError(e.message ?? 'Failed to load room');
      } finally {
        setLoadingRoom(false);
      }
    })();
  }, [id]);

  const toggleAmenity = (a: string) =>
    setAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );

  const handlePickPhoto = async () => {
    try {
      setUploading(true);
      const asset = await pickImage();
      if (!asset) return;
      const url = await uploadImageAsset(asset);
      setPhotos((prev) => [...prev, url]);
      setError('');
    } catch (e: any) {
      Alert.alert('Upload failed', e.message ?? 'Could not upload photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = (index: number) =>
    setPhotos((prev) => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    if (!rent || Number(rent) < 1000) {
      setError('Rent must be at least ₹1,000'); return;
    }
    if (!area && !city) { setError('Please enter at least an area or city'); return; }
    if (!whatsapp || whatsapp.replace(/\D/g, '').length !== 10) {
      setError('WhatsApp number must be exactly 10 digits'); return;
    }
    if (photos.length === 0) {
      setError('Please add at least one photo'); return;
    }

    setError('');
    setSaving(true);
    try {
      const req: RoomRequest = {
        rent: Number(rent),
        deposit: Number(deposit) || 0,
        type,
        furnished,
        gender,
        contactPreference: contactPref,
        whatsapp: whatsapp.replace(/\D/g, ''),
        phone: phone ? phone.replace(/\D/g, '') : undefined,
        description: description || undefined,
        brokerageRequired,
        brokerageAmount: brokerageRequired && brokerageAmount ? Number(brokerageAmount) : undefined,
        amenities,
        address: { line1, area, city, state, pincode },
        images: photos.map((url, i) => ({
          url,
          label: i === 0 ? 'EXTERIOR' : 'OTHER',
          sequence: i,
        })),
      };
      await api.updateRoom(Number(id), req);
      Alert.alert('✅ Saved', 'Your listing has been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /* ── loading state ── */
  if (loadingRoom) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={{ color: '#717171', marginTop: 12 }}>Loading room…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Edit listing</Text>

        {/* ── Photos ── */}
        <SectionLabel text="Photos" />
        <PhotoGrid
          photos={photos}
          uploading={uploading}
          onAdd={handlePickPhoto}
          onRemove={handleRemovePhoto}
        />

        {/* ── Pricing ── */}
        <SectionLabel text="Pricing" />
        <View style={styles.row2}>
          <TextInput
            label="Monthly Rent (₹)"
            value={rent}
            onChangeText={setRent}
            keyboardType="numeric"
            mode="outlined"
            style={[styles.input, { flex: 1 }]}
            outlineColor="#E0E0E0"
            activeOutlineColor={PRIMARY}
          />
          <TextInput
            label="Deposit (₹)"
            value={deposit}
            onChangeText={setDeposit}
            keyboardType="numeric"
            mode="outlined"
            style={[styles.input, { flex: 1 }]}
            outlineColor="#E0E0E0"
            activeOutlineColor={PRIMARY}
          />
        </View>

        {/* ── Brokerage ── */}
        <SectionLabel text="Brokerage" />
        <View style={styles.brokerageRow}>
          <TouchableOpacity
            style={[styles.brokerageBtn, !brokerageRequired && styles.brokerageBtnActive]}
            onPress={() => { setBrokerageRequired(false); setBrokerageAmount(''); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.brokerageBtnText, !brokerageRequired && styles.brokerageBtnTextActive]}>
              No Brokerage
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.brokerageBtn, brokerageRequired && styles.brokerageBtnActiveRed]}
            onPress={() => setBrokerageRequired(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.brokerageBtnText, brokerageRequired && styles.brokerageBtnTextActive]}>
              Brokerage Required
            </Text>
          </TouchableOpacity>
        </View>
        {brokerageRequired && (
          <TextInput
            label="Brokerage Amount (₹)"
            value={brokerageAmount}
            onChangeText={setBrokerageAmount}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            outlineColor="#E0E0E0"
            activeOutlineColor={PRIMARY}
          />
        )}

        <SectionLabel text="Room Type" />
        <ChipRow options={TYPES} value={type} onSelect={setType} />

        <SectionLabel text="Furnishing" />
        <ChipRow options={FURNISHED_OPTS} value={furnished} onSelect={setFurnished} />

        <SectionLabel text="Preferred Tenants" />
        <ChipRow options={GENDER_OPTS} value={gender} onSelect={setGender} />

        {/* ── Location ── */}
        <SectionLabel text="Location" />
        <TextInput
          label="Street / Landmark"
          value={line1}
          onChangeText={setLine1}
          mode="outlined"
          style={styles.input}
          outlineColor="#E0E0E0"
          activeOutlineColor={PRIMARY}
        />
        <View style={styles.row2}>
          <TextInput
            label="Area *"
            value={area}
            onChangeText={setArea}
            mode="outlined"
            style={[styles.input, { flex: 1 }]}
            outlineColor="#E0E0E0"
            activeOutlineColor={PRIMARY}
          />
          <TextInput
            label="City *"
            value={city}
            onChangeText={setCity}
            mode="outlined"
            style={[styles.input, { flex: 1 }]}
            outlineColor="#E0E0E0"
            activeOutlineColor={PRIMARY}
          />
        </View>
        <View style={styles.row2}>
          <TextInput
            label="State"
            value={state}
            onChangeText={setState}
            mode="outlined"
            style={[styles.input, { flex: 1 }]}
            outlineColor="#E0E0E0"
            activeOutlineColor={PRIMARY}
          />
          <TextInput
            label="Pincode"
            value={pincode}
            onChangeText={setPincode}
            keyboardType="numeric"
            mode="outlined"
            style={[styles.input, { flex: 1 }]}
            outlineColor="#E0E0E0"
            activeOutlineColor={PRIMARY}
          />
        </View>

        {/* ── Amenities ── */}
        <SectionLabel text="Amenities" />
        <View style={styles.chipRow}>
          {AMENITIES_LIST.map((a) => {
            const active = amenities.includes(a);
            return (
              <Chip
                key={a}
                selected={active}
                onPress={() => toggleAmenity(a)}
                style={[styles.chip, active && styles.chipActive]}
                textStyle={[styles.chipText, active && styles.chipTextActive]}
                compact
              >
                {a}
              </Chip>
            );
          })}
        </View>

        {/* ── Contact ── */}
        <SectionLabel text="Contact Details" />
        <View style={styles.row2}>
          <TextInput
            label="WhatsApp * (10 digits)"
            value={whatsapp}
            onChangeText={setWhatsapp}
            keyboardType="phone-pad"
            mode="outlined"
            style={[styles.input, { flex: 1 }]}
            outlineColor="#E0E0E0"
            activeOutlineColor={PRIMARY}
          />
          <TextInput
            label="Phone (optional)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            mode="outlined"
            style={[styles.input, { flex: 1 }]}
            outlineColor="#E0E0E0"
            activeOutlineColor={PRIMARY}
          />
        </View>
        <SectionLabel text="Contact Preference" />
        <ChipRow options={CONTACT_OPTS} value={contactPref} onSelect={setContactPref} />

        <TextInput
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={[styles.input, { minHeight: 96 }]}
          outlineColor="#E0E0E0"
          activeOutlineColor={PRIMARY}
        />

        {error ? (
          <HelperText type="error" visible style={styles.errorText}>
            {error}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving || uploading}
          style={styles.submitBtn}
          contentStyle={styles.submitContent}
          labelStyle={styles.submitLabel}
          buttonColor={PRIMARY}
        >
          Save Changes
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ─── styles ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1 },
  inner: { padding: 20, paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  heading: { fontSize: 24, fontWeight: '800', color: '#222', marginBottom: 20 },

  sectionLabel: {
    fontSize: 15, fontWeight: '700', color: '#222',
    marginTop: 20, marginBottom: 10,
  },

  input: { marginBottom: 10, backgroundColor: '#fff' },
  row2: { flexDirection: 'row', gap: 10 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: { backgroundColor: '#F7F7F7', borderWidth: 1, borderColor: '#E0E0E0' },
  chipActive: { backgroundColor: '#222', borderColor: '#222' },
  chipText: { fontSize: 13, color: '#444' },
  chipTextActive: { color: '#fff' },

  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  photoTile: {
    width: TILE, height: TILE, borderRadius: 12, overflow: 'hidden',
    position: 'relative',
  },
  photoImage: { width: '100%', height: '100%' },
  photoDelete: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 12,
  },
  photoCover: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', paddingVertical: 2,
  },
  photoCoverText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  photoAdd: {
    width: TILE, height: TILE, borderRadius: 12,
    borderWidth: 1.5, borderColor: PRIMARY, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: '#FFF5F7',
  },
  photoAddText: { fontSize: 11, color: PRIMARY, fontWeight: '600' },
  photoHint: { fontSize: 12, color: '#717171', marginBottom: 8, lineHeight: 18 },

  brokerageRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  brokerageBtn: {
    flex: 1, paddingVertical: 11, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E0E0E0',
    alignItems: 'center', backgroundColor: '#F7F7F7',
  },
  brokerageBtnActive: { backgroundColor: '#222', borderColor: '#222' },
  brokerageBtnActiveRed: { backgroundColor: '#FF385C', borderColor: '#FF385C' },
  brokerageBtnText: { fontSize: 13, fontWeight: '600', color: '#444' },
  brokerageBtnTextActive: { color: '#fff' },
  errorText: { fontSize: 13, marginBottom: 4 },
  submitBtn: { marginTop: 20, borderRadius: 12 },
  submitContent: { paddingVertical: 8 },
  submitLabel: { fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
