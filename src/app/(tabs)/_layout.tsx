import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { TabIcon, type TabIconName } from '../../components/TabIcon';
import { colors } from '../../theme';

const icon = (name: TabIconName) => ({ color }: { color: ColorValue }) => <TabIcon name={name} color={color} />;

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.border } }}>
      <Tabs.Screen name="index" options={{ title: "Aujourd'hui", tabBarIcon: icon('today') }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendrier', tabBarIcon: icon('calendar') }} />
      <Tabs.Screen name="insights" options={{ title: 'Analyses', tabBarIcon: icon('insights') }} />
      <Tabs.Screen name="library" options={{ title: 'Santé', tabBarIcon: icon('health') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: icon('profile') }} />
    </Tabs>
  );
}
