import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import './global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/contexts/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="sign-in" options={{ headerShown: false, title: 'Sign In' }} />
          <Stack.Screen name="sign-up" options={{ headerShown: false, title: 'Sign Up' }} />
          <Stack.Screen name="study-spaces" options={{ headerShown: false, title: 'Study Spaces' }} />
          <Stack.Screen name="dine-play-shop" options={{ headerShown: false, title: 'Dine, Play & Shop' }} />
          <Stack.Screen name="services" options={{ headerShown: false, title: 'Services' }} />
          <Stack.Screen name="information-center" options={{ headerShown: false, title: 'Information Center' }} />
          <Stack.Screen name="forms" options={{ headerShown: false, title: 'Forms & Applications' }} />
          <Stack.Screen name="policies" options={{ headerShown: false, title: 'Policies & Guidelines' }} />
          <Stack.Screen name="virtual-tour" options={{ headerShown: false, title: 'Virtual Tour' }} />
          <Stack.Screen name="admin-panel" options={{ headerShown: false, title: 'Admin Panel' }} />
          <Stack.Screen name="plan-events" options={{ headerShown: false, title: 'Plan Events' }} />
          <Stack.Screen name="notifications" options={{ headerShown: false, title: 'Notifications' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
