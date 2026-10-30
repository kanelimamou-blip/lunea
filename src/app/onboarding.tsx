import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Body, Button, Chip, Muted, Screen, Stepper, styles as ui } from '../components/ui';
import { addDays, formatLong, today } from '../domain/dates';
import type { Goal } from '../domain/types';
import { useStore } from '../storage/store';
import { colors } from '../theme';

const GOALS: { id: Goal; label: string; emoji: string; hint: string }[] = [
  { id: 'track', label: 'Suivre mon cycle', emoji: '🌙', hint: 'Prédictions, symptômes, santé' },
  { id: 'conceive', label: 'Concevoir un enfant', emoji: '🌱', hint: 'Ovulation et jours les plus fertiles' },
  { id: 'avoid', label: 'Mieux connaître ma fertilité', emoji: '🛡️', hint: 'Repérer les jours à risque (pas une contraception)' },
  { id: 'pregnant', label: 'Suivre ma grossesse', emoji: '🤰', hint: 'Semaine par semaine' },
];

export default function Onboarding() {
  const { data, replaceAll } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<Goal>('track');
  const [daysAgo, setDaysAgo] = useState(7);
  const [cycle, setCycle] = useState(28);
  const [period, setPeriod] = useState(5);

  const lastStart = addDays(today(), -daysAgo);

  const finish = () => {
    const settings = { ...data.settings, onboarded: true, name: name || undefined, goal };
    if (goal === 'pregnant') {
      replaceAll({ ...data, settings: { ...settings, pregnancyStart: lastStart } });
    } else {
      const days = { ...data.days };
      for (let i = 0; i < Math.min(period, daysAgo + 1); i++) days[addDays(lastStart, i)] = { flow: i < 2 ? 'medium' : 'light' };
      replaceAll({ ...data, days, settings: { ...settings, defaultCycleLength: cycle, defaultPeriodLength: period } });
    }
    router.replace('/');
  };

  const steps = [
    <View key="welcome">
      <Text style={s.logo}>☾</Text>
      <Text style={s.big}>Bienvenue sur Lunéa</Text>
      <Body>Toutes les fonctionnalités sont incluses, sans abonnement. Vos données restent chiffrées sur votre téléphone : pas de compte, pas de serveur, pas de publicité.</Body>
      <TextInput placeholder="Votre prénom (facultatif)" value={name} onChangeText={setName} style={s.input} placeholderTextColor={colors.muted} />
    </View>,
    <View key="goal">
      <Text style={s.big}>Quel est votre objectif ?</Text>
      {GOALS.map((g) => (
        <Pressable key={g.id} onPress={() => setGoal(g.id)} style={[s.option, goal === g.id && s.optionOn]}>
          <Text style={{ fontSize: 26, marginRight: 12 }}>{g.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[ui.body, { fontWeight: '700' }]}>{g.label}</Text>
            <Muted>{g.hint}</Muted>
          </View>
        </Pressable>
      ))}
    </View>,
    <View key="last">
      <Text style={s.big}>{goal === 'pregnant' ? 'Premier jour de vos dernières règles' : 'Vos dernières règles ont commencé il y a…'}</Text>
      <Stepper value={daysAgo} onChange={setDaysAgo} min={0} max={goal === 'pregnant' ? 290 : 90} suffix="jours" />
      <Muted>Soit le {formatLong(lastStart)}.</Muted>
      <View style={[ui.chips, { marginTop: 16 }]}>
        {[0, 3, 7, 14, 21].map((n) => <Chip key={n} label={n === 0 ? "Aujourd'hui" : `${n} j`} selected={daysAgo === n} onPress={() => setDaysAgo(n)} />)}
      </View>
    </View>,
    <View key="lengths">
      <Text style={s.big}>Durée habituelle</Text>
      <Muted>Une estimation suffit : Lunéa s'adapte à vos vrais cycles au fil des mois.</Muted>
      <Text style={[ui.h2, { marginTop: 24 }]}>Cycle</Text>
      <Stepper value={cycle} onChange={setCycle} min={18} max={60} suffix="jours" />
      <Text style={[ui.h2, { marginTop: 16 }]}>Règles</Text>
      <Stepper value={period} onChange={setPeriod} min={1} max={12} suffix="jours" />
    </View>,
  ];
  const visible = goal === 'pregnant' ? steps.slice(0, 3) : steps;
  const last = step === visible.length - 1;

  return (
    <Screen>
      <View style={s.dots}>{visible.map((_, i) => <View key={i} style={[s.dot, i <= step && { backgroundColor: colors.primary }]} />)}</View>
      {visible[step]}
      <View style={{ marginTop: 32 }}>
        <Button title={last ? 'Commencer' : 'Continuer'} onPress={() => (last ? finish() : setStep(step + 1))} />
        {step > 0 && <Button title="Retour" variant="ghost" onPress={() => setStep(step - 1)} />}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  logo: { fontSize: 72, color: colors.primary, textAlign: 'center', marginTop: 24 },
  big: { fontSize: 26, fontWeight: '800', color: colors.text, marginVertical: 16 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14, fontSize: 16, marginTop: 24, backgroundColor: colors.white, color: colors.text },
  option: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white, marginBottom: 10 },
  optionOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  dot: { width: 28, height: 4, borderRadius: 2, backgroundColor: colors.border, marginHorizontal: 3 },
});
