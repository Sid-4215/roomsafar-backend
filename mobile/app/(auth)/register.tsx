import React, { useState } from 'react';
import {
  View, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, TouchableOpacity,
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (e: any) {
      setError(e.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🏠</Text>
          </View>
          <Text style={styles.brand}>RoomSafar</Text>
          <Text style={styles.tagline}>Your next room is just a tap away.</Text>
        </View>

        {/* Form card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Create account</Text>
          <Text style={styles.formSubtitle}>Join thousands finding their perfect room</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TextInput
            label="Full name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            mode="outlined"
            style={styles.input}
            outlineColor="#DDDDDD"
            activeOutlineColor="#FF385C"
            outlineStyle={{ borderRadius: 12 }}
          />

          <TextInput
            label="Email address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            mode="outlined"
            style={styles.input}
            outlineColor="#DDDDDD"
            activeOutlineColor="#FF385C"
            outlineStyle={{ borderRadius: 12 }}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            mode="outlined"
            style={styles.input}
            outlineColor="#DDDDDD"
            activeOutlineColor="#FF385C"
            outlineStyle={{ borderRadius: 12 }}
            right={
              <TextInput.Icon
                icon={showPass ? 'eye-off-outline' : 'eye-outline'}
                onPress={() => setShowPass(!showPass)}
                color="#717171"
              />
            }
          />

          <TouchableOpacity
            style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>{loading ? 'Creating account…' : 'Create account'}</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.signupLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  inner: { flexGrow: 1, padding: 24, paddingTop: 60 },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#FFF0F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#FF385C',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  logoEmoji: { fontSize: 38 },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FF385C',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 15,
    color: '#717171',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#222222',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#717171',
    marginBottom: 24,
  },
  errorBox: {
    backgroundColor: '#FFF2F4',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#FF385C',
  },
  errorText: { color: '#CC1432', fontSize: 13, fontWeight: '500' },
  input: { marginBottom: 14, backgroundColor: '#FFFFFF' },
  ctaButton: {
    backgroundColor: '#FF385C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    elevation: 2,
    shadowColor: '#FF385C',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  ctaButtonDisabled: { opacity: 0.65 },
  ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#EBEBEB' },
  dividerText: { color: '#AAAAAA', fontSize: 13, fontWeight: '500' },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: { color: '#717171', fontSize: 14 },
  signupLink: { color: '#FF385C', fontWeight: '700', fontSize: 14 },
});
