import { Card, Chip, H2, Muted, Screen, Stepper, styles as ui } from '../components/ui';
import { View } from 'react-native';
import type { Goal } from '../domain/types';
import { useStore } from '../storage/store';

const GOALS: { id: Goal; label: string }[] = [
  { id: 'track', label: 'Suivre mon cycle' },
  { id: 'conceive', label: 'Concevoir' },
  { id: 'avoid', label: 'Connaître ma fertilité' },
  { id: 'pregnant', label: 'Grossesse' },
];

export default function CycleSettings() {
  const { data, prediction, updateSettings } = useStore();
  const s = data.settings;
  return (
    <Screen>
      <Card>
        <H2>Objectif</H2>
        <View style={ui.chips}>
          {GOALS.map((g) => <Chip key={g.id} label={g.label} selected={s.goal === g.id} onPress={() => updateSettings({ goal: g.id })} />)}
        </View>
      </Card>
      <Card>
        <H2>Durée du cycle par défaut</H2>
        <Stepper value={s.defaultCycleLength} onChange={(v) => updateSettings({ defaultCycleLength: v })} min={18} max={60} suffix="jours" />
        <H2>Durée des règles par défaut</H2>
        <Stepper value={s.defaultPeriodLength} onChange={(v) => updateSettings({ defaultPeriodLength: v })} min={1} max={12} suffix="jours" />
        <Muted>
          Utilisées tant que moins de deux cycles sont enregistrés. Valeurs apprises actuellement : cycle de {prediction.cycleLength} jours, règles de {prediction.periodLength} jours, phase lutéale de {prediction.lutealLength} jours.
        </Muted>
      </Card>
    </Screen>
  );
}
