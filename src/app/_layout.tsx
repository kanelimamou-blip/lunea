import * as LocalAuthentication from 'expo-local-authentication';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Button } from '../components/ui';
import { StoreProvider, useStore } from '../storage/store';
import { colors } from '../theme';

function Gate() {
  const { ready, data } = useStore();
  const segments = useSegments();
  const [locked, setLocked] = useState(true);
  const background = useRef(false);

  const unlock = useCallback(async () => {
    const res = await LocalAuthentication.authenticateAsync({ promptMessage: 'Déverrouiller Lunéa', cancelLabel: 'Annuler' });
    if (res.success) setLocked(false);
  }, []);

  // Re-lock whenever the app goes to the background.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') background.current = true;
      if (state === 'active' && background.current && data.settings.lockEnabled) {
        background.current = false;
        setLocked(true);
      }
    });
    return () => sub.remove();
  }, [data.settings.lockEnabled]);

  useEffect(() => {
    if (ready && data.settings.lockEnabled && locked) unlock();
  }, [ready, data.settings.lockEnabled, locked, unlock]);

  if (!ready) {
    return <View style={s.center}><ActivityIndicator color={colors.primary} /></View>;
  }
  if (data.settings.lockEnabled && locked) {
    return (
      <View style={s.center}>
        <Text style={s.logo}>☾</Text>
        <Text style={s.title}>Lunéa est verrouillée</Text>
        <View style={{ width: 240 }}><Button title="Déverrouiller" onPress={unlock} /></View>
      </View>
    );
  }
  if (!data.settings.onboarded && segments[0] !== 'onboarding') return <Redirect href="/onboarding" />;

  return (
    <Stack screenOptions={{ headerTintColor: colors.primary, headerStyle: { backgroundColor: colors.bg }, headerShadowVisible: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="log/[date]" options={{ presentation: 'modal', title: 'Journal du jour' }} />
      <Stack.Screen name="pregnancy" options={{ title: 'Grossesse' }} />
      <Stack.Screen name="reminders" options={{ title: 'Rappels' }} />
      <Stack.Screen name="report" options={{ title: 'Rapport médical' }} />
      <Stack.Screen name="privacy" options={{ title: 'Confidentialité' }} />
      <Stack.Screen name="cycle-settings" options={{ title: 'Mon cycle' }} />
      <Stack.Screen name="article/[id]" options={{ title: '' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="dark" />
        <Gate />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  logo: { fontSize: 64, color: colors.primary },
  title: { fontSize: 20, fontWeight: '700', color: colors.text, marginVertical: 16 },
});
