import React from 'react';
import {
  View, TouchableOpacity, StyleSheet, Image,
} from 'react-native';
import { Text } from 'react-native-paper';
import type { Room } from '@/lib/types';

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
  const meta = [room.type, furnished].filter(Boolean).join(' · ');

  if (horizontal) {
    return (
      <TouchableOpacity style={styles.hCard} onPress={onPress} activeOpacity={0.88}>
        <Image source={{ uri: imageUrl }} style={styles.hImage} resizeMode="cover" />
        <View style={styles.hInfo}>
          <Text style={styles.hLocation} numberOfLines={1}>{location || 'Location TBD'}</Text>
          <Text style={styles.hMeta} numberOfLines={1}>{meta}</Text>
          <Text style={styles.hPrice}>
            <Text style={styles.hPriceNum}>₹{room.rent.toLocaleString()}</Text>
            <Text style={styles.hPriceSub}> /mo</Text>
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      {/* Square photo */}
      <View style={styles.imageWrap}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        {/* Type pill */}
        <View style={styles.typePill}>
          <Text style={styles.typePillText}>{room.type}</Text>
        </View>
      </View>

      {/* Info — tight like Airbnb */}
      <View style={styles.info}>
        <Text style={styles.location} numberOfLines={1}>
          {location || 'Location TBD'}
        </Text>
        {furnished ? (
          <Text style={styles.meta} numberOfLines={1}>{furnished}</Text>
        ) : null}
        <Text style={styles.price}>
          <Text style={styles.priceNum}>₹{room.rent.toLocaleString()}</Text>
          <Text style={styles.priceSub}> / month</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  imageWrap: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E8E8E8',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  typePill: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.93)',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#222',
  },
  info: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  location: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222222',
    lineHeight: 18,
  },
  meta: {
    fontSize: 12,
    color: '#717171',
    lineHeight: 17,
    marginTop: 1,
  },
  price: {
    marginTop: 2,
    fontSize: 13,
  },
  priceNum: {
    fontWeight: '700',
    color: '#222222',
  },
  priceSub: {
    fontWeight: '400',
    color: '#717171',
  },

  // ── Horizontal (featured scroll) ──────────────────────────────
  hCard: {
    width: 180,
    marginRight: 12,
  },
  hImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    backgroundColor: '#E8E8E8',
  },
  hInfo: {
    paddingTop: 7,
  },
  hLocation: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222222',
  },
  hMeta: {
    fontSize: 11,
    color: '#717171',
    marginTop: 1,
  },
  hPrice: {
    marginTop: 3,
    fontSize: 12,
  },
  hPriceNum: {
    fontWeight: '700',
    color: '#222222',
  },
  hPriceSub: {
    fontWeight: '400',
    color: '#717171',
  },
});
