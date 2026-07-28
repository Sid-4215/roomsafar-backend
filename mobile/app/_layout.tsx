import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/lib/auth';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1e40af',
    secondary: '#f59e0b',
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceVariant: '#f1f5f9',
    onPrimary: '#ffffff',
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
          options={{
            headerShown: true,
            headerTitle: 'Room Details',
            headerStyle: { backgroundColor: '#fff' },
            headerTintColor: '#1e40af',
          }}
        />
        <Stack.Screen
          name="room/add"
          options={{
            headerShown: true,
            headerTitle: 'List a Room',
            headerStyle: { backgroundColor: '#fff' },
            headerTintColor: '#1e40af',
          }}
        />
        <Stack.Screen
          name="room/edit"
          options={{
            headerShown: true,
            headerTitle: 'Edit Listing',
            headerStyle: { backgroundColor: '#fff' },
            headerTintColor: '#1e40af',
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
