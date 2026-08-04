import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
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
    // Only redirect away from auth screens when already logged in
    if (token && inAuth) {
      router.replace('/(tabs)');
    }
  }, [token, isLoading, segments]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
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
        <RootLayoutNav />
      </PaperProvider>
    </AuthProvider>
  );
}
