/**
 * AddressAutocomplete
 *
 * A smart address input that:
 *  1. Shows live Nominatim suggestions as the user types (debounced 400 ms)
 *  2. Has a "Use my location" GPS button that reverse-geocodes via Nominatim
 *
 * Props
 *  value          – controlled text value
 *  onChangeText   – called on every keystroke (so parent can mirror the raw text)
 *  onSelect       – called when user picks a suggestion or uses GPS.
 *                   Receives a ParsedAddress with all fields already parsed.
 *  placeholder    – input placeholder (default "Search address…")
 *  style          – optional extra ViewStyle for the wrapper
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const PRIMARY = '#FF385C';
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const HEADERS = { 'User-Agent': 'RoomSafar/1.0', 'Accept-Language': 'en' };

export interface ParsedAddress {
  displayName: string; // full formatted string (for the input box)
  line1: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

interface Suggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address: Record<string, string>;
}

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (parsed: ParsedAddress) => void;
  placeholder?: string;
  style?: object;
}

/* ── parse a Nominatim address object into our flat fields ── */
function parseNominatim(result: Suggestion): ParsedAddress {
  const a = result.address ?? {};

  const line1 =
    [a.road, a.house_number].filter(Boolean).join(' ') ||
    a.neighbourhood ||
    a.suburb ||
    '';

  const area =
    a.suburb ||
    a.neighbourhood ||
    a.quarter ||
    a.village ||
    a.hamlet ||
    '';

  const city =
    a.city ||
    a.town ||
    a.municipality ||
    a.county ||
    '';

  const state = a.state || '';
  const pincode = a.postcode || '';

  // Build a clean display name: area, city, state
  const parts = [area, city, state].filter(Boolean);
  const displayName = parts.length ? parts.join(', ') : result.display_name;

  return {
    displayName,
    line1,
    area,
    city,
    state,
    pincode,
    latitude: parseFloat(result.lat),
    longitude: parseFloat(result.lon),
  };
}

export default function AddressAutocomplete({
  value,
  onChangeText,
  onSelect,
  placeholder = 'Search address…',
  style,
}: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── fetch suggestions ── */
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setSearching(true);
    try {
      const url =
        `${NOMINATIM_BASE}/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1&countrycodes=in`;
      const res = await fetch(url, { headers: HEADERS });
      const data: Suggestion[] = await res.json();
      setSuggestions(data);
      setOpen(data.length > 0);
    } catch {
      setSuggestions([]);
      setOpen(false);
    } finally {
      setSearching(false);
    }
  }, []);

  /* debounce on keystroke */
  const handleChange = (text: string) => {
    onChangeText(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(text), 400);
  };

  /* clean up on unmount */
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  /* ── pick a suggestion ── */
  const handlePick = (item: Suggestion) => {
    const parsed = parseNominatim(item);
    onChangeText(parsed.displayName);
    setSuggestions([]);
    setOpen(false);
    onSelect(parsed);
  };

  /* ── GPS locate ── */
  const handleGPS = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Please allow location access to use this feature.',
        );
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = loc.coords;

      // reverse geocode
      const url = `${NOMINATIM_BASE}/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
      const res = await fetch(url, { headers: HEADERS });
      const data = await res.json();

      if (!data || data.error) {
        Alert.alert('Could not fetch address', 'Try searching manually.');
        return;
      }

      const parsed = parseNominatim({
        place_id: data.place_id,
        display_name: data.display_name,
        lat: String(latitude),
        lon: String(longitude),
        address: data.address,
      });

      onChangeText(parsed.displayName);
      setSuggestions([]);
      setOpen(false);
      onSelect(parsed);
    } catch (e: any) {
      Alert.alert('Location error', e.message ?? 'Could not get your location.');
    } finally {
      setGpsLoading(false);
    }
  };

  return (
    <View style={[styles.wrapper, style]}>
      {/* ── input row ── */}
      <View style={styles.inputRow}>
        <MaterialCommunityIcons
          name="map-search-outline"
          size={18}
          color="#717171"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor="#AAAAAA"
          returnKeyType="search"
          onSubmitEditing={() => fetchSuggestions(value)}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          autoCorrect={false}
        />
        {searching && (
          <ActivityIndicator size="small" color={PRIMARY} style={styles.spinner} />
        )}

        {/* GPS button */}
        <TouchableOpacity
          style={styles.gpsBtn}
          onPress={handleGPS}
          disabled={gpsLoading}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {gpsLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialCommunityIcons name="crosshairs-gps" size={16} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* ── suggestions dropdown ── */}
      {open && suggestions.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => {
              const parsed = parseNominatim(item);
              const main = parsed.area || parsed.city || item.display_name;
              const sub = [parsed.city, parsed.state].filter(Boolean).join(', ');
              return (
                <TouchableOpacity
                  style={styles.suggestion}
                  onPress={() => handlePick(item)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={16}
                    color={PRIMARY}
                    style={{ marginTop: 1 }}
                  />
                  <View style={styles.suggestionText}>
                    <Text style={styles.suggestionMain} numberOfLines={1}>
                      {main}
                    </Text>
                    {sub ? (
                      <Text style={styles.suggestionSub} numberOfLines={1}>
                        {sub}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          {/* dismiss */}
          <TouchableOpacity
            style={styles.dismissBtn}
            onPress={() => setOpen(false)}
          >
            <Text style={styles.dismissText}>✕ Close</Text>
          </TouchableOpacity>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 4 },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 12 : 4,
    gap: 6,
  },
  searchIcon: { flexShrink: 0 },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#222',
    paddingVertical: 0,
  },
  spinner: { flexShrink: 0 },

  gpsBtn: {
    backgroundColor: PRIMARY,
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  dropdown: {
    marginTop: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    // Shadow
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 4 },
      default: {},
    }),
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  suggestionText: { flex: 1 },
  suggestionMain: { fontSize: 14, fontWeight: '600', color: '#222' },
  suggestionSub: { fontSize: 12, color: '#717171', marginTop: 1 },
  separator: { height: 1, backgroundColor: '#F2F2F2' },
  dismissBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
    backgroundColor: '#FAFAFA',
  },
  dismissText: { fontSize: 12, color: '#AAAAAA' },

  hint: { fontSize: 11, color: '#AAAAAA', marginTop: 5, marginLeft: 2 },
  hintBold: { color: PRIMARY },
});
