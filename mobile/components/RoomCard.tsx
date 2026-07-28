import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Room } from '@/lib/types';

interface RoomCardProps {
  room: Room;
  onPress: () => void;
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80';

const TYPE_LABEL: Record<string, string> = {
  BHK1: '1 BHK', BHK2: '2 BHK', BHK3: '3 BHK',
  RK: 'Room-Kitchen', SHARED: 'Shared', PG: 'PG',
};

const FURNISHED_ICON: Record<string, string> = {
  FURNISHED: '🛋️', SEMI_FURNISHED: '🪑', UNFURNISHED: '📦',
};

const FURNISHED_LABEL: Record<string, string> = {
  FURNISHED: 'Furnished', SEMI_FURNISHED: 'Semi-furnished', UNFURNISHED: 'Unfurnished',
};

const GENDER_MAP: Record<string, { label: string; color: string; bg: string }> = {
  MALE:   { label: 'Boys only',  color: '#1d4ed8', bg: '#dbeafe' },
  FEMALE: { label: 'Girls only', color: '#9d174d', bg: '#fce7f3' },
  ANY:    { label: 'Any gender', color: '#166534', bg: '#dcfce7' },
};

export default function RoomCard({ room, onPress }: RoomCardProps) {
  const imageUrl = room.images?.[0]?.url ?? PLACEHOLDER;
  const addr = room.address;
  const locationLine = [addr?.area, addr?.city].filter(Boolean).join(', ');
  const stateLine = [addr?.state, addr?.pincode].filter(Boolean).join(' ');
  const gender = GENDER_MAP[room.gender] ?? GENDER_MAP.ANY;
  const typeLabel = TYPE_LABEL[room.type] ?? room.type;
  const furnishIcon = FURNISHED_ICON[room.furnished] ?? '';
  const furnishLabel = FURNISHED_LABEL[room.furnished] ?? room.furnished;
  const hasWhatsapp = !!room.whatsapp;
  const hasPhone = !!room.phone;
  const topAmenities = (room.amenities ?? []).slice(0, 3);
  const hasMoreAmenities = (room.amenities ?? []).length > 3;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.92} style={styles.wrapper}>
      <View style={styles.card}>
        {/* Image */}
        <View style={styles.imageWrap}>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
          {/* Type badge */}
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{typeLabel}</Text>
          </View>
          {/* Image count */}
          {(room.images?.length ?? 0) > 1 && (
            <View style={styles.imageCount}>
              <MaterialCommunityIcons name="image-multiple-outline" size={12} color="#fff" />
              <Text style={styles.imageCountText}>{room.images.length}</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          {/* Price row */}
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.price}>₹{room.rent.toLocaleString('en-IN')}</Text>
              <Text style={styles.perMonth}>per month</Text>
            </View>
            {room.deposit > 0 && (
              <View style={styles.depositBadge}>
                <Text style={styles.depositText}>Dep ₹{room.deposit.toLocaleString('en-IN')}</Text>
              </View>
            )}
          </View>

          {/* Location */}
          {locationLine ? (
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker" size={14} color="#1e40af" />
              <Text style={styles.locationText} numberOfLines={1}>
                {locationLine}
                {stateLine ? <Text style={styles.stateText}>  {stateLine}</Text> : null}
              </Text>
            </View>
          ) : null}

          {/* Tags row: furnished + gender */}
          <View style={styles.tagsRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{furnishIcon} {furnishLabel}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: gender.bg }]}>
              <Text style={[styles.tagText, { color: gender.color }]}>{gender.label}</Text>
            </View>
            {room.brokerageRequired && (
              <View style={[styles.tag, { backgroundColor: '#fef9c3' }]}>
                <Text style={[styles.tagText, { color: '#854d0e' }]}>
                  Brokerage ₹{(room.brokerageAmount ?? 0).toLocaleString('en-IN')}
                </Text>
              </View>
            )}
          </View>

          {/* Description snippet */}
          {room.description ? (
            <Text style={styles.description} numberOfLines={2}>{room.description}</Text>
          ) : null}

          {/* Amenities */}
          {topAmenities.length > 0 && (
            <View style={styles.amenitiesRow}>
              {topAmenities.map((a) => (
                <View key={a} style={styles.amenityTag}>
                  <Text style={styles.amenityText}>{a}</Text>
                </View>
              ))}
              {hasMoreAmenities && (
                <View style={styles.amenityTag}>
                  <Text style={styles.amenityText}>+{room.amenities.length - 3} more</Text>
                </View>
              )}
            </View>
          )}

          {/* Footer: contact availability */}
          <View style={styles.footer}>
            <View style={styles.contactRow}>
              {hasWhatsapp && (
                <View style={styles.contactBadge}>
                  <MaterialCommunityIcons name="whatsapp" size={13} color="#25D366" />
                  <Text style={[styles.contactLabel, { color: '#25D366' }]}>WhatsApp</Text>
                </View>
              )}
              {hasPhone && (
                <View style={styles.contactBadge}>
                  <MaterialCommunityIcons name="phone" size={13} color="#64748b" />
                  <Text style={styles.contactLabel}>Call</Text>
                </View>
              )}
            </View>
            <View style={styles.viewBtn}>
              <Text style={styles.viewBtnText}>View Details</Text>
              <MaterialCommunityIcons name="chevron-right" size={14} color="#1e40af" />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginBottom: 14 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#1e40af',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 195 },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(30,64,175,0.88)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  imageCount: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  imageCountText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  body: { padding: 14 },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  price: { fontSize: 22, fontWeight: '800', color: '#1e40af', letterSpacing: -0.5 },
  perMonth: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  depositBadge: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  depositText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  locationText: { flex: 1, fontSize: 13, color: '#475569', fontWeight: '500' },
  stateText: { fontSize: 12, color: '#94a3b8' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tag: {
    backgroundColor: '#f1f5f9',
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  tagText: { fontSize: 12, color: '#475569', fontWeight: '500' },
  description: { fontSize: 13, color: '#64748b', lineHeight: 19, marginBottom: 10 },
  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 10 },
  amenityTag: {
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  amenityText: { fontSize: 11, color: '#166534', fontWeight: '500' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
    marginTop: 2,
  },
  contactRow: { flexDirection: 'row', gap: 10 },
  contactBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  contactLabel: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  viewBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewBtnText: { fontSize: 13, color: '#1e40af', fontWeight: '700' },
});
