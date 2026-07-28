import React, { useEffect, useState } from 'react';
import {
  View, ScrollView, StyleSheet, Image,
  TouchableOpacity, Linking, ActivityIndicator, Alert,
} from 'react-native';
import { Text, Chip, Button, Divider, Snackbar } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Room } from '@/lib/types';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80';

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [snack, setSnack] = useState('');
  const [imageIdx, setImageIdx] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getRoomById(Number(id));
        setRoom(data);
        if (token) {
          const fav = await api.checkFavorite(data.id).catch(() => false);
          setIsFav(fav);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load room');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token]);

  const toggleFav = async () => {
    if (!token) { setSnack('Sign in to save rooms'); return; }
    if (!room) return;
    setFavLoading(true);
    try {
      if (isFav) {
        await api.removeFavorite(room.id);
        setIsFav(false);
        setSnack('Removed from saved');
      } else {
        await api.addFavorite(room.id);
        setIsFav(true);
        setSnack('Saved to favourites ❤️');
      }
    } catch (e: any) {
      setSnack(e.message || 'Something went wrong');
    } finally {
      setFavLoading(false);
    }
  };

  const handleBook = async () => {
    if (!token) { setSnack('Sign in to book this room'); return; }
    if (!room) return;

    // Pick move-in date (today + 1 day default, move-out + 30 days)
    const today = new Date();
    const startDate = new Date(today); startDate.setDate(today.getDate() + 1);
    const endDate = new Date(startDate); endDate.setDate(startDate.getDate() + 30);
    const fmt = (d: Date) => d.toISOString().split('T')[0];

    setBooking(true);
    try {
      const result = await api.createBooking({
        roomId: room.id,
        amount: room.rent,
        startDate: fmt(startDate),
        endDate: fmt(endDate),
      });
      setSnack(`✅ Booking #${result.bookingId} created! Check-in: ${fmt(startDate)}`);
    } catch (e: any) {
      setSnack(e.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const openContact = (type: 'whatsapp' | 'phone', value?: string) => {
    if (!value) return;
    const num = value.replace(/\D/g, '');
    const url =
      type === 'whatsapp'
        ? `https://wa.me/${num}`
        : `tel:${num}`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  if (error || !room) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#ef4444' }}>{error || 'Room not found'}</Text>
      </View>
    );
  }

  const images = room.images?.length ? room.images.map((i) => i.url) : [PLACEHOLDER];
  const addr = room.address;
  const addressStr = [addr?.line1, addr?.area, addr?.city, addr?.state, addr?.pincode]
    .filter(Boolean)
    .join(', ');

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Image gallery */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: images[imageIdx] ?? PLACEHOLDER }} style={styles.image} resizeMode="cover" />
          {images.length > 1 && (
            <View style={styles.dots}>
              {images.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setImageIdx(i)}>
                  <View style={[styles.dot, i === imageIdx && styles.dotActive]} />
                </TouchableOpacity>
              ))}
            </View>
          )}
          {/* Fav button over image */}
          <TouchableOpacity style={styles.favBtn} onPress={toggleFav} disabled={favLoading}>
            <MaterialCommunityIcons
              name={isFav ? 'heart' : 'heart-outline'}
              size={24}
              color={isFav ? '#ef4444' : '#fff'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {/* Price row */}
          <View style={styles.priceRow}>
            <View>
              <Text variant="headlineMedium" style={styles.price}>
                ₹{room.rent.toLocaleString()}
                <Text variant="bodyMedium" style={styles.perMonth}>/month</Text>
              </Text>
              {room.deposit > 0 && (
                <Text variant="bodySmall" style={styles.deposit}>
                  Deposit: ₹{room.deposit.toLocaleString()}
                </Text>
              )}
            </View>
            <Chip style={styles.typeChip}>{room.type}</Chip>
          </View>

          {/* Tags */}
          <View style={styles.tags}>
            {room.furnished && (
              <Chip compact style={styles.tag}>
                {room.furnished === 'FURNISHED' ? '🛋️ Furnished'
                  : room.furnished === 'SEMI_FURNISHED' ? '🪑 Semi-furnished'
                  : '📦 Unfurnished'}
              </Chip>
            )}
            {room.gender && (
              <Chip compact style={styles.tag}>
                {room.gender === 'MALE' ? '👦 Boys' : room.gender === 'FEMALE' ? '👧 Girls' : '👥 Any'}
              </Chip>
            )}
            {room.brokerageRequired && (
              <Chip compact style={[styles.tag, { backgroundColor: '#fef3c7' }]}>
                Brokerage ₹{(room.brokerageAmount ?? 0).toLocaleString()}
              </Chip>
            )}
          </View>

          <Divider style={styles.divider} />

          {/* Address */}
          {addressStr ? (
            <View style={styles.row}>
              <MaterialCommunityIcons name="map-marker-outline" size={18} color="#1e40af" />
              <Text variant="bodyMedium" style={styles.rowText}>{addressStr}</Text>
            </View>
          ) : null}

          {/* Description */}
          {room.description ? (
            <>
              <Text variant="titleSmall" style={styles.sectionTitle}>About this room</Text>
              <Text variant="bodyMedium" style={styles.description}>{room.description}</Text>
            </>
          ) : null}

          {/* Amenities */}
          {room.amenities?.length > 0 && (
            <>
              <Text variant="titleSmall" style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenities}>
                {room.amenities.map((a) => (
                  <Chip key={a} compact style={styles.amenityChip} textStyle={styles.amenityText}>
                    {a}
                  </Chip>
                ))}
              </View>
            </>
          )}

          <Divider style={styles.divider} />

          {/* Contact options */}
          <Text variant="titleSmall" style={styles.sectionTitle}>Contact Owner</Text>
          <View style={styles.contactRow}>
            {room.phone && (
              <Button
                mode="outlined"
                icon="phone"
                onPress={() => openContact('phone', room.phone)}
                style={styles.contactBtn}
                compact
              >
                Call
              </Button>
            )}
            {room.whatsapp && (
              <Button
                mode="outlined"
                icon="whatsapp"
                onPress={() => openContact('whatsapp', room.whatsapp)}
                style={[styles.contactBtn, styles.waBtn]}
                textColor="#25D366"
                compact
              >
                WhatsApp
              </Button>
            )}
          </View>

          {/* Book button */}
          <Button
            mode="contained"
            onPress={handleBook}
            loading={booking}
            disabled={booking}
            style={styles.bookBtn}
            contentStyle={{ paddingVertical: 6 }}
            labelStyle={{ fontSize: 16, fontWeight: '700' }}
            icon="calendar-check"
          >
            Book Now
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={!!snack}
        onDismiss={() => setSnack('')}
        duration={3000}
        style={styles.snack}
      >
        {snack}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 280 },
  dots: {
    position: 'absolute',
    bottom: 12,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: { backgroundColor: '#fff', width: 18 },
  favBtn: {
    position: 'absolute',
    top: 14,
    right: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: { padding: 20 },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  price: { color: '#1e40af', fontWeight: '800' },
  perMonth: { color: '#64748b', fontWeight: '400' },
  deposit: { color: '#64748b', marginTop: 2 },
  typeChip: { backgroundColor: '#eff6ff', alignSelf: 'flex-start' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  tag: { backgroundColor: '#f1f5f9' },
  divider: { marginVertical: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 16 },
  rowText: { flex: 1, color: '#475569', lineHeight: 22 },
  sectionTitle: { fontWeight: '700', color: '#1e293b', marginBottom: 10 },
  description: { color: '#475569', lineHeight: 22, marginBottom: 4 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityChip: { backgroundColor: '#f0fdf4' },
  amenityText: { color: '#166534', fontSize: 12 },
  contactRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  contactBtn: { flex: 1, borderRadius: 10 },
  waBtn: { borderColor: '#25D366' },
  bookBtn: { borderRadius: 14, marginBottom: 8 },
  snack: { backgroundColor: '#1e293b' },
});
