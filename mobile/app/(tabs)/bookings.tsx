import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';

export default function BookingsScreen() {
  const { user } = useAuth();
  const router = useRouter();

  // Bookings are created inline from Room Detail.
  // This screen is a placeholder for future booking history integration.
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📅</Text>
      <Text variant="headlineSmall" style={styles.title}>My Bookings</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Rooms you've booked will appear here.{'\n'}
        Browse rooms and tap "Book Now" to get started.
      </Text>
      <Button
        mode="contained"
        onPress={() => router.push('/(tabs)/')}
        style={styles.button}
        contentStyle={{ paddingVertical: 4 }}
      >
        Browse Rooms
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontWeight: '700', color: '#1e293b', marginBottom: 12, textAlign: 'center' },
  subtitle: { color: '#64748b', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  button: { borderRadius: 12 },
});
