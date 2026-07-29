import React from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

function MenuRow({
  icon, label, sublabel, onPress, danger,
}: {
  icon: IconName;
  label: string;
  sublabel?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
        <MaterialCommunityIcons name={icon} size={20} color={danger ? '#FF385C' : '#555555'} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
        {sublabel ? <Text style={styles.menuSublabel}>{sublabel}</Text> : null}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#CCCCCC" />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, token, logout } = useAuth();
  const router = useRouter();

  if (!token || !user) {
    return (
      <View style={styles.guestContainer}>
        <View style={styles.guestHero}>
          <Text style={styles.guestEmoji}>👤</Text>
          <Text style={styles.guestTitle}>Sign in to your account</Text>
          <Text style={styles.guestSubtitle}>
            Manage bookings, save rooms, and list your own property.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.signInBtn}
          onPress={() => router.replace('/(auth)/login')}
          activeOpacity={0.85}
        >
          <Text style={styles.signInBtnText}>Sign in</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => router.replace('/(auth)/register')}
          activeOpacity={0.85}
        >
          <Text style={styles.createBtnText}>Create account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Avatar card */}
      <View style={styles.avatarCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user.role}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editBtn}>
          <MaterialCommunityIcons name="pencil-outline" size={18} color="#FF385C" />
        </TouchableOpacity>
      </View>

      {/* Quick stats */}
      <View style={styles.statsRow}>
        <TouchableOpacity style={styles.statItem} onPress={() => router.push('/(tabs)/favorites')}>
          <MaterialCommunityIcons name="heart" size={22} color="#FF385C" />
          <Text style={styles.statLabel}>Saved</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity style={styles.statItem} onPress={() => router.push('/(tabs)/my-rooms')}>
          <MaterialCommunityIcons name="home-edit" size={22} color="#FF385C" />
          <Text style={styles.statLabel}>My Rooms</Text>
        </TouchableOpacity>
      </View>

      {/* Menu sections */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Activity</Text>
        <View style={styles.menuCard}>
          <MenuRow
            icon="heart-outline"
            label="Saved Rooms"
            sublabel="Rooms you've favorited"
            onPress={() => router.push('/(tabs)/favorites')}
          />
          <View style={styles.rowDivider} />
          <MenuRow
            icon="home-edit-outline"
            label="My Listings"
            sublabel="Rooms you're hosting"
            onPress={() => router.push('/(tabs)/my-rooms')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Explore</Text>
        <View style={styles.menuCard}>
          <MenuRow
            icon="compass-outline"
            label="Browse Rooms"
            sublabel="Find your next home"
            onPress={() => router.push('/(tabs)/')}
          />
        </View>
      </View>

      <View style={[styles.section, { marginBottom: 40 }]}>
        <View style={styles.menuCard}>
          <MenuRow
            icon="logout"
            label="Sign out"
            onPress={logout}
            danger
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#222222', letterSpacing: -0.3 },
  avatarCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF385C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: '800', color: '#222222', marginBottom: 3 },
  userEmail: { fontSize: 13, color: '#717171', marginBottom: 8 },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0F2',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  roleText: { fontSize: 11, color: '#FF385C', fontWeight: '700' },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  statLabel: { fontSize: 12, fontWeight: '600', color: '#717171' },
  statDivider: { width: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#717171',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: { backgroundColor: '#FFF0F2' },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: '#222222' },
  menuLabelDanger: { color: '#FF385C' },
  menuSublabel: { fontSize: 12, color: '#AAAAAA', marginTop: 1 },
  rowDivider: { height: 1, backgroundColor: '#F7F7F7', marginLeft: 64 },
  // Guest state
  guestContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 32,
    paddingTop: 80,
  },
  guestHero: { alignItems: 'center', marginBottom: 40 },
  guestEmoji: { fontSize: 64, marginBottom: 16 },
  guestTitle: { fontSize: 22, fontWeight: '800', color: '#222222', marginBottom: 8, textAlign: 'center' },
  guestSubtitle: { fontSize: 14, color: '#717171', textAlign: 'center', lineHeight: 21 },
  signInBtn: {
    backgroundColor: '#FF385C',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#FF385C',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  signInBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  createBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#DDDDDD',
  },
  createBtnText: { color: '#222222', fontSize: 16, fontWeight: '600' },
});
