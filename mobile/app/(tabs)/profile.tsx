import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Divider, List, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';

export default function ProfileScreen() {
  const { user, token, logout } = useAuth();
  const router = useRouter();

  if (!token || !user) {
    return (
      <View style={styles.center}>
        <Text style={styles.emoji}>👤</Text>
        <Text variant="titleMedium" style={styles.title}>Sign in to view your profile</Text>
        <Button mode="contained" onPress={() => router.replace('/(auth)/login')} style={styles.btn}>
          Sign In
        </Button>
        <Button mode="outlined" onPress={() => router.replace('/(auth)/register')} style={[styles.btn, { marginTop: 8 }]}>
          Create Account
        </Button>
      </View>
    );
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <Avatar.Text size={80} label={initials} style={styles.avatar} color="#fff" />
        <Text variant="headlineSmall" style={styles.name}>{user.name}</Text>
        <Text variant="bodyMedium" style={styles.email}>{user.email}</Text>
        <View style={styles.roleBadge}>
          <Text variant="labelSmall" style={styles.roleText}>{user.role}</Text>
        </View>
      </View>

      <Divider style={styles.divider} />

      {/* Account actions */}
      <View style={styles.listSection}>
        <List.Item
          title="Saved Rooms"
          description="Rooms you've favourited"
          left={(props) => <List.Icon {...props} icon="heart-outline" color="#1e40af" />}
          onPress={() => router.push('/(tabs)/favorites')}
          style={styles.listItem}
        />
        <Divider />
        <List.Item
          title="My Bookings"
          description="View your booking history"
          left={(props) => <List.Icon {...props} icon="calendar-check-outline" color="#1e40af" />}
          onPress={() => router.push('/(tabs)/bookings')}
          style={styles.listItem}
        />
        <Divider />
        <List.Item
          title="Browse Rooms"
          description="Find your next home"
          left={(props) => <List.Icon {...props} icon="home-search-outline" color="#1e40af" />}
          onPress={() => router.push('/(tabs)/')}
          style={styles.listItem}
        />
      </View>

      <Divider style={styles.divider} />

      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutBtn}
        textColor="#ef4444"
        icon="logout"
      >
        Sign Out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatar: { backgroundColor: '#1e40af', marginBottom: 16 },
  name: { fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  email: { color: '#64748b', marginBottom: 12 },
  roleBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: { color: '#1e40af', fontWeight: '700' },
  divider: { marginVertical: 8 },
  listSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  listItem: { paddingHorizontal: 16 },
  logoutBtn: {
    marginTop: 16,
    borderRadius: 12,
    borderColor: '#fecaca',
  },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontWeight: '700', color: '#1e293b', marginBottom: 20, textAlign: 'center' },
  btn: { borderRadius: 12, width: 200 },
});
