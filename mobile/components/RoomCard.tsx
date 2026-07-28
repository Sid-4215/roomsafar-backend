import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import type { Room } from '@/lib/types';

interface RoomCardProps {
  room: Room;
  onPress: () => void;
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80';

const FURNISHED_LABEL: Record<string, string> = {
  FURNISHED: 'Furnished',
  SEMI_FURNISHED: 'Semi',
  UNFURNISHED: 'Unfurnished',
};

const GENDER_COLOR: Record<string, string> = {
  MALE: '#dbeafe',
  FEMALE: '#fce7f3',
  ANY: '#f0fdf4',
};

export default function RoomCard({ room, onPress }: RoomCardProps) {
  const imageUrl = room.images?.[0]?.url ?? PLACEHOLDER;
  const area = room.address?.area ?? '';
  const city = room.address?.city ?? '';
  const location = [area, city].filter(Boolean).join(', ');

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Card style={styles.card} mode="elevated">
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        <Card.Content style={styles.content}>
          <View style={styles.row}>
            <Text variant="titleMedium" style={styles.price}>
              ₹{room.rent.toLocaleString()}/mo
            </Text>
            {room.type ? (
              <Chip compact style={styles.typeChip} textStyle={styles.chipText}>
                {room.type}
              </Chip>
            ) : null}
          </View>

          {location ? (
            <Text variant="bodySmall" style={styles.location} numberOfLines={1}>
              📍 {location}
            </Text>
          ) : null}

          <View style={styles.tags}>
            {room.furnished ? (
              <Chip compact style={styles.tag} textStyle={styles.chipText}>
                {FURNISHED_LABEL[room.furnished] ?? room.furnished}
              </Chip>
            ) : null}
            {room.gender ? (
              <Chip
                compact
                style={[styles.tag, { backgroundColor: GENDER_COLOR[room.gender] ?? '#f3f4f6' }]}
                textStyle={styles.chipText}
              >
                {room.gender === 'ANY' ? 'All genders' : room.gender === 'MALE' ? 'Boys' : 'Girls'}
              </Chip>
            ) : null}
            {room.deposit ? (
              <Chip compact style={styles.tag} textStyle={styles.chipText}>
                Dep ₹{room.deposit.toLocaleString()}
              </Chip>
            ) : null}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    paddingTop: 12,
    paddingBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  price: {
    color: '#1e40af',
    fontWeight: '700',
  },
  location: {
    color: '#64748b',
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  typeChip: {
    backgroundColor: '#eff6ff',
    height: 26,
  },
  tag: {
    backgroundColor: '#f1f5f9',
    height: 26,
  },
  chipText: {
    fontSize: 11,
    lineHeight: 14,
  },
});
