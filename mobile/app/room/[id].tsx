import React, { useEffect, useState } from 'react';
import {
  View, ScrollView, StyleSheet, Image,
  TouchableOpacity, Linking, ActivityIndicator,
  useWindowDimensions, FlatList, Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Room } from '@/lib/types';
import LeafletMap from '@/components/LeafletMap';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80';
const MAX_CONTENT_W = 860;   // cap for web wide screens

const FURNISHED_LABEL: Record<string, string> = {
  FURNISHED: 'Furnished',
  SEMI_FURNISHED: 'Semi-furnished',
  UNFURNISHED: 'Unfurnished',
};

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const { width: screenW } = useWindowDimensions();

  // On web clamp to MAX_CONTENT_W; on native use full screen
  const isWeb = Platform.OS === 'web';
  const contentW = isWeb ? Math.min(screenW, MAX_CONTENT_W) : screenW;
  // Image height: 56% of content width, capped at 480px
  const imgH = Math.min(Math.round(contentW * 0.56), 480);

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
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

  const showSnack = (msg: string) => {
    setSnackMsg(msg);
    setTimeout(() => setSnackMsg(''), 3000);
  };

  const toggleFav = async () => {
    if (!token) {
      router.push({ pathname: '/(auth)/login', params: { returnTo: `/room/${id}` } });
      return;
    }
    if (!room) return;
    setFavLoading(true);
    try {
      if (isFav) {
        await api.removeFavorite(room.id);
        setIsFav(false);
        showSnack('Removed from saved');
      } else {
        await api.addFavorite(room.id);
        setIsFav(true);
        showSnack('Saved to favourites ❤️');
      }
    } catch (e: any) {
      showSnack(e.message || 'Something went wrong');
    } finally {
      setFavLoading(false);
    }
  };

  const openContact = (type: 'whatsapp' | 'phone', value?: string) => {
    if (!value) return;
    const num = value.replace(/\D/g, '');
    const url = type === 'whatsapp' ? `https://wa.me/${num}` : `tel:${num}`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  if (error || !room) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>{error || 'Room not found'}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = room.images?.length ? room.images.map((i) => i.url) : [PLACEHOLDER];
  const addr = room.address;
  const addressStr = [addr?.line1, addr?.area, addr?.city, addr?.state, addr?.pincode]
    .filter(Boolean)
    .join(', ');
  const furnished = FURNISHED_LABEL[room.furnished ?? ''] ?? room.furnished ?? '';

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={isWeb && styles.webScrollContent}>
        {/* ── Gallery ── */}
        <View style={[styles.galleryWrap, isWeb && { alignSelf: 'center', width: contentW }]}>
          <View style={[styles.gallery, { height: imgH }]}>
            <FlatList
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => String(i)}
              onMomentumScrollEnd={(e) => {
                setImageIdx(Math.round(e.nativeEvent.contentOffset.x / contentW));
              }}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={{ width: contentW, height: imgH }}
                  resizeMode="cover"
                />
              )}
            />

            {/* Overlay nav */}
            <View style={styles.galleryOverlay}>
              <TouchableOpacity style={styles.galleryBack} onPress={() => router.back()}>
                <MaterialCommunityIcons name="arrow-left" size={22} color="#222222" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.galleryFav} onPress={toggleFav}>
                <MaterialCommunityIcons
                  name={isFav ? 'heart' : 'heart-outline'}
                  size={22}
                  color={isFav ? '#FF385C' : '#222222'}
                />
              </TouchableOpacity>
            </View>

            {/* Dot indicator */}
            {images.length > 1 && (
              <View style={styles.dots}>
                {images.map((_, i) => (
                  <View key={i} style={[styles.dot, i === imageIdx && styles.dotActive]} />
                ))}
              </View>
            )}

            {/* Photo count */}
            <View style={styles.photoCount}>
              <MaterialCommunityIcons name="image-multiple-outline" size={13} color="#FFFFFF" />
              <Text style={styles.photoCountText}>{imageIdx + 1}/{images.length}</Text>
            </View>
          </View>
        </View>

        {/* ── Main content ── */}
        <View style={[styles.content, isWeb && { alignSelf: 'center', width: contentW }]}>
          {/* Title row */}
          <View style={styles.titleRow}>
            <View style={styles.typeTag}>
              <Text style={styles.typeTagText}>{room.type}</Text>
            </View>
            {furnished ? (
              <View style={styles.furnishedTag}>
                <Text style={styles.furnishedTagText}>{furnished}</Text>
              </View>
            ) : null}
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              ₹{room.rent.toLocaleString()}
              <Text style={styles.pricePer}> / month</Text>
            </Text>
            {room.deposit ? (
              <Text style={styles.deposit}>+ ₹{room.deposit.toLocaleString()} deposit</Text>
            ) : null}
          </View>

          {/* Location */}
          {addressStr ? (
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={16} color="#FF385C" />
              <Text style={styles.locationText}>{addressStr}</Text>
            </View>
          ) : null}

          {/* Map */}
          {(addr?.latitude != null && addr?.longitude != null) || addressStr ? (
            <>
              <Text style={styles.sectionTitle}>Location</Text>
              <LeafletMap
                mode="view"
                latitude={addr?.latitude}
                longitude={addr?.longitude}
                address={(!addr?.latitude && addressStr) ? addressStr : undefined}
                height={220}
              />
              <View style={styles.divider} />
            </>
          ) : null}

          {/* Quick info row */}
          <View style={styles.infoGrid}>
            {room.gender && (
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="account-outline" size={20} color="#FF385C" />
                <Text style={styles.infoLabel}>For</Text>
                <Text style={styles.infoValue}>
                  {room.gender === 'BOYS' ? 'Boys' :
                   room.gender === 'GIRLS' ? 'Girls' : 'Anyone'}
                </Text>
              </View>
            )}
            {room.brokerageRequired !== undefined && (
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="handshake-outline" size={20} color="#FF385C" />
                <Text style={styles.infoLabel}>Brokerage</Text>
                <Text style={styles.infoValue}>
                  {room.brokerageRequired
                    ? (room.brokerageAmount
                        ? `₹${room.brokerageAmount.toLocaleString()}`
                        : 'Required')
                    : 'None'}
                </Text>
              </View>
            )}
            {room.deposit ? (
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="bank-outline" size={20} color="#FF385C" />
                <Text style={styles.infoLabel}>Deposit</Text>
                <Text style={styles.infoValue}>₹{(room.deposit / 1000).toFixed(0)}k</Text>
              </View>
            ) : null}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          {room.description ? (
            <>
              <Text style={styles.sectionTitle}>About this room</Text>
              <Text style={styles.description}>{room.description}</Text>
              <View style={styles.divider} />
            </>
          ) : null}

          {/* Amenities */}
          {room.amenities?.length ? (
            <>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {room.amenities.map((a) => (
                  <View key={a} style={styles.amenityItem}>
                    <MaterialCommunityIcons name="check-circle" size={16} color="#00A699" />
                    <Text style={styles.amenityText}>{a}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.divider} />
            </>
          ) : null}

          {/* Contact */}
          {(room.phone || room.whatsapp) && (
            <>
              <Text style={styles.sectionTitle}>Contact host</Text>
              <View style={styles.contactRow}>
                {room.phone && (
                  <TouchableOpacity
                    style={styles.contactBtn}
                    onPress={() => openContact('phone', room.phone)}
                  >
                    <MaterialCommunityIcons name="phone-outline" size={20} color="#222222" />
                    <Text style={styles.contactBtnText}>Call</Text>
                  </TouchableOpacity>
                )}
                {room.whatsapp && (
                  <TouchableOpacity
                    style={[styles.contactBtn, styles.whatsappBtn]}
                    onPress={() => openContact('whatsapp', room.whatsapp)}
                  >
                    <MaterialCommunityIcons name="whatsapp" size={20} color="#25D366" />
                    <Text style={[styles.contactBtnText, { color: '#25D366' }]}>WhatsApp</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.divider} />
            </>
          )}

          {/* Bottom padding */}
          <View style={{ height: 32 }} />
        </View>
      </ScrollView>

      {/* Snackbar */}
      {snackMsg ? (
        <View style={styles.snackbar}>
          <Text style={styles.snackText}>{snackMsg}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  errorEmoji: { fontSize: 44 },
  errorText: { color: '#FF385C', fontSize: 14 },
  backBtn: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtnText: { color: '#222222', fontWeight: '600' },
  webScrollContent: {
    alignItems: 'center',
  },
  galleryWrap: {
    width: '100%',
    overflow: 'hidden',
  },
  gallery: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
  },
  galleryOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  galleryBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  galleryFav: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  dots: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 18,
  },
  photoCount: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  photoCountText: { fontSize: 11, color: '#FFFFFF', fontWeight: '600' },
  content: { padding: 20 },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  typeTag: {
    backgroundColor: '#222222',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  typeTagText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  furnishedTag: {
    backgroundColor: '#F7F7F7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  furnishedTagText: { color: '#555555', fontSize: 12, fontWeight: '600' },
  priceRow: { marginBottom: 10 },
  price: { fontSize: 28, fontWeight: '800', color: '#222222', letterSpacing: -0.5 },
  pricePer: { fontSize: 16, fontWeight: '400', color: '#717171' },
  deposit: { fontSize: 13, color: '#717171', marginTop: 3 },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    marginBottom: 20,
  },
  locationText: { flex: 1, fontSize: 14, color: '#717171', lineHeight: 20 },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  infoItem: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  infoLabel: { fontSize: 11, color: '#AAAAAA', fontWeight: '600' },
  infoValue: { fontSize: 13, fontWeight: '700', color: '#222222' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#222222', marginBottom: 12 },
  description: { fontSize: 14, color: '#555555', lineHeight: 22 },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '46%',
  },
  amenityText: { fontSize: 13, color: '#444444', fontWeight: '500' },
  contactRow: {
    flexDirection: 'row',
    gap: 12,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#DDDDDD',
    borderRadius: 14,
    paddingVertical: 14,
  },
  whatsappBtn: {
    borderColor: '#25D366',
    backgroundColor: '#F0FFF4',
  },
  contactBtnText: { fontSize: 14, fontWeight: '700', color: '#222222' },
  snackbar: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#222222',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  snackText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
});
