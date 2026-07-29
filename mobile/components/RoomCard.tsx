import React from 'react';
import {
  View, TouchableOpacity, StyleSheet, Image, Dimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Room } from '@/lib/types';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - 32;

const PLACEHOLDER = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80';

const FURNISHED_LABEL: Record<string, string> = {
  FURNISHED: 'Furnished',
  SEMI_FURNISHED: 'Semi-furnished',
  UNFURNISHED: 'Unfurnished',
};

interface Props {
  room: Room;
  onPress: () => void;
  horizontal?: boolean;
}

export default function RoomCard({ room, onPress, horizontal = false }: Props) {
  const imageUrl = room.images?.[0]?.url ?? PLACEHOLDER;
  const area = room.address?.area ?? '';
  const city = room.address?.city ?? '';
  const location = [area, city].filter(Boolean).join(', ');
  const furnished = FURNISHED_LABEL[room.furnished ?? ''] ?? '';

  if (horizontal) {
    return (
      <TouchableOpacity style={styles.hCard} onPress={onPress} activeOpacity={0.9}>
        <Image source={{ uri: imageUrl }} style={styles.hImage} resizeMode="cover" />
        <View style={styles.hContent}>
          <Text style={styles.hLocation} numberOfLines={1}>{location || 'Location TBD'}</Text>
          <Text style={styles.hType}>{room.type} {furnished ? `· ${furnished}` : ''}</Text>
          <Text style={styles.hPrice}>
            <Text style={styles.hPriceNum}>₹{room.rent.toLocaleString()}</Text>
            <Text style={styles.hPriceSub}> / month</Text>
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      {/* Photo */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        {/* Type badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{room.type}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        {/* Location row */}
        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="map-marker-outline" size={14} color="#FF385C" />
          <Text style={styles.location} numberOfLines={1}>
            {location || 'Location TBD'}
          </Text>
        </View>

        {/* Price + deposit */}
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.price}>
              ₹{room.rent.toLocaleString()}
              <Text style={styles.priceSub}> /mo</Text>
            </Text>
            {room.deposit ? (
              <Text style={styles.deposit}>₹{room.deposit.toLocaleString()} deposit</Text>
            ) : null}
          </View>
        </View>

        {/* Tags */}
        <View style={styles.tagsRow}>
          {furnished ? (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{furnished}</Text>
            </View>
          ) : null}
          {room.gender && room.gender !== 'ANYONE' ? (
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {room.gender === 'BOYS' ? '👨 Boys' : '👩 Girls'}
              </Text>
            </View>
          ) : null}
          {room.amenities?.slice(0, 2).map((a) => (
            <View key={a} style={styles.tag}>
              <Text style={styles.tagText}>{a}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#F0F0F0',
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#222222',
  },
  info: {
    padding: 14,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  location: {
    flex: 1,
    fontSize: 13,
    color: '#717171',
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222222',
    letterSpacing: -0.3,
  },
  priceSub: {
    fontSize: 13,
    fontWeight: '400',
    color: '#717171',
  },
  deposit: {
    fontSize: 12,
    color: '#717171',
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#F7F7F7',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  tagText: {
    fontSize: 11,
    color: '#555555',
    fontWeight: '500',
  },
  // Horizontal card styles
  hCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginRight: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  hImage: {
    width: '100%',
    height: 130,
    backgroundColor: '#F0F0F0',
  },
  hContent: {
    padding: 10,
  },
  hLocation: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 2,
  },
  hType: {
    fontSize: 11,
    color: '#717171',
    marginBottom: 4,
  },
  hPrice: {
    fontSize: 13,
  },
  hPriceNum: {
    fontWeight: '800',
    color: '#222222',
  },
  hPriceSub: {
    color: '#717171',
    fontWeight: '400',
    fontSize: 11,
  },
});
