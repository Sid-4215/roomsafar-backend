import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AuthWallProps {
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  subtitle: string;
}

export default function AuthWall({ icon = 'lock-outline', title, subtitle }: AuthWallProps) {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name={icon} size={48} color="#FF385C" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/(auth)/login')} activeOpacity={0.85}>
        <Text style={styles.signInText}>Sign in</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.registerBtn} onPress={() => router.push('/(auth)/register')} activeOpacity={0.85}>
        <Text style={styles.registerText}>Create an account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    gap: 12,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFF0F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#222222',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#717171',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  signInBtn: {
    width: '100%',
    backgroundColor: '#FF385C',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  registerBtn: {
    width: '100%',
    backgroundColor: '#F7F7F7',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  registerText: {
    color: '#222222',
    fontSize: 16,
    fontWeight: '600',
  },
});
