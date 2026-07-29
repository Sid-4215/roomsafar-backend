import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from '@/lib/auth';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#FF385C',
    secondary: '#00A699',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceVariant: '#F7F7F7',
    onPrimary: '#FFFFFF',
    outline: '#DDDDDD',
  },
};

function RootLayoutNav() {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuth = segments[0] === '(auth)';
    if (!token && !inAuth) {
      router.replace('/(auth)/login');
    } else if (token && inAuth) {
      router.replace('/(tabs)');
    }
  }, [token, isLoading, segments]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="room/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="room/add"
          options={{
            headerShown: true,
            headerTitle: 'List Your Room',
            headerStyle: { backgroundColor: '#FFFFFF' },
            headerTintColor: '#222222',
            headerTitleStyle: { fontWeight: '700', fontSize: 18 },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="room/edit"
          options={{
            headerShown: true,
            headerTitle: 'Edit Listing',
            headerStyle: { backgroundColor: '#FFFFFF' },
            headerTintColor: '#222222',
            headerTitleStyle: { fontWeight: '700', fontSize: 18 },
            headerShadowVisible: false,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        {Platform.OS === 'web' ? (
          <View style={webStyles.shell}>
            <View style={webStyles.phone}>
              <RootLayoutNav />
            </View>
          </View>
        ) : (
          <RootLayoutNav />
        )}
      </PaperProvider>
    </AuthProvider>
  );
}

const webStyles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  phone: {
    width: '100%',
    maxWidth: 480,
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    // subtle shadow so it looks like a phone on desktop
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
});
