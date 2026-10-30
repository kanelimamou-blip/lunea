import { useEffect, useState } from 'react';
import { Card, Chip, H2, Muted, Screen, ToggleRow, styles as ui } from '../components/ui';
import { View } from 'react-native';
import type { ReminderSettings } from '../domain/types';
import { requestPermission } from '../services/reminders';
import { useStore } from '../storage/store';

const TIMES = ['07:00', '08:00', '09:00', '12:00', '18:00', '21:00', '22:00'];

export default function Reminders() {
  const { data, updateSettings } = useStore();
  const r = data.settings.reminders;
  const [granted, setGranted] = useState(true);

  useEffect(() => {
    requestPermission().then(setGranted).catch(() => setGranted(false));
  }, []);

  const set = (patch: Partial<ReminderSettings>) => updateSettings({ reminders: { ...r, ...patch } });

  return (
    <Screen>
      {!granted && <Card><Muted>Les notifications sont désactivées pour Lunéa dans les réglages du téléphone.</Muted></Card>}
      <Card>
        <ToggleRow label="Règles à venir" hint="2 jours avant et le jour prévu" value={r.periodSoon} onChange={(v) => set({ periodSoon: v })} />
        <ToggleRow label="Fenêtre de fertilité" hint="Le premier jour fertile" value={r.fertileWindow} onChange={(v) => set({ fertileWindow: v })} />
        <ToggleRow label="Ovulation" hint="La veille, pour un test d'ovulation" value={r.ovulation} onChange={(v) => set({ ovulation: v })} />
        <ToggleRow label="Journal quotidien" hint="Un rappel pour noter votre journée" value={r.dailyLog} onChange={(v) => set({ dailyLog: v })} />
        <ToggleRow label="Pilule" hint="Tous les jours à la même heure" value={r.pill} onChange={(v) => set({ pill: v })} />
      </Card>
      <Card>
        <H2>Heure des rappels</H2>
        <View style={ui.chips}>{TIMES.map((t) => <Chip key={t} label={t} selected={r.time === t} onPress={() => set({ time: t })} />)}</View>
      </Card>
      <Card>
        <ToggleRow label="Notifications discrètes" hint="Affiche seulement « Un petit rappel vous attend » sur l'écran verrouillé" value={r.discreet} onChange={(v) => set({ discreet: v })} />
      </Card>
    </Screen>
  );
}
