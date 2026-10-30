import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Card, Chip, H2, Muted, Screen, Stepper, styles as ui } from '../../components/ui';
import { DISCHARGES, FLOWS, MOODS, SYMPTOMS, type Option } from '../../domain/catalog';
import { formatLong } from '../../domain/dates';
import type { DayLog, Sex, TestResult } from '../../domain/types';
import { useStore } from '../../storage/store';
import { colors } from '../../theme';

export default function LogDay() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { data, logDay } = useStore();
  const log: DayLog = data.days[date] ?? {};
  const set = (patch: Partial<DayLog>) => logDay(date, patch);
  const pregnant = data.settings.goal === 'pregnant';

  const toggle = (key: 'symptoms' | 'moods', id: string) => {
    const list = log[key] ?? [];
    set({ [key]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] });
  };

  const [temp, setTemp] = useState(log.temperature?.toString() ?? '');
  const [weight, setWeight] = useState(log.weightKg?.toString() ?? '');
  const [notes, setNotes] = useState(log.notes ?? '');
  const num = (s: string) => {
    const n = parseFloat(s.replace(',', '.'));
    return Number.isFinite(n) ? n : undefined;
  };

  const group = (title: string, options: Option[], selected: (id: string) => boolean, onPress: (id: string) => void, color?: string) => (
    <Card>
      <H2>{title}</H2>
      <View style={ui.chips}>
        {options.map((o) => <Chip key={o.id} label={o.label} emoji={o.emoji} selected={selected(o.id)} onPress={() => onPress(o.id)} color={color} />)}
      </View>
    </Card>
  );

  const tests: { id: TestResult; label: string; emoji: string }[] = [
    { id: 'positive', label: 'Positif', emoji: '＋' },
    { id: 'negative', label: 'Négatif', emoji: '－' },
  ];
  const sexOptions: { id: Sex; label: string; emoji: string }[] = [
    { id: 'none', label: 'Aucun', emoji: '○' },
    { id: 'protected', label: 'Protégé', emoji: '🛡️' },
    { id: 'unprotected', label: 'Non protégé', emoji: '❤️' },
  ];

  return (
    <Screen>
      <Muted>{formatLong(date)}</Muted>
      <View style={{ height: 12 }} />
      {!pregnant && group('Règles', FLOWS, (id) => log.flow === id, (id) => set({ flow: log.flow === id ? undefined : (id as DayLog['flow']) }), colors.period)}
      {group('Symptômes', SYMPTOMS, (id) => !!log.symptoms?.includes(id), (id) => toggle('symptoms', id), colors.plum)}
      {group('Humeur', MOODS, (id) => !!log.moods?.includes(id), (id) => toggle('moods', id), colors.follicular)}
      {group('Pertes vaginales', DISCHARGES, (id) => log.discharge === id, (id) => set({ discharge: log.discharge === id ? undefined : id }), colors.fertile)}
      {group('Rapport sexuel', sexOptions, (id) => log.sex === id, (id) => set({ sex: log.sex === id ? undefined : (id as Sex) }), colors.primary)}
      {!pregnant && group("Test d'ovulation (LH)", tests, (id) => log.ovulationTest === id, (id) => set({ ovulationTest: log.ovulationTest === id ? undefined : (id as TestResult) }), colors.ovulation)}
      {group('Test de grossesse', tests, (id) => log.pregnancyTest === id, (id) => set({ pregnancyTest: log.pregnancyTest === id ? undefined : (id as TestResult) }), colors.luteal)}
      {group('Contraception', [{ id: 'pill', label: 'Pilule prise', emoji: '💊' }], () => !!log.pillTaken, () => set({ pillTaken: log.pillTaken ? undefined : true }), colors.plum)}

      <Card>
        <H2>Mesures</H2>
        <Muted>Température basale (au réveil, avant de vous lever)</Muted>
        <TextInput style={s.input} keyboardType="decimal-pad" placeholder="36,50 °C" placeholderTextColor={colors.muted} value={temp} onChangeText={setTemp} onEndEditing={() => set({ temperature: num(temp) })} />
        <Muted>Poids</Muted>
        <TextInput style={s.input} keyboardType="decimal-pad" placeholder="kg" placeholderTextColor={colors.muted} value={weight} onChangeText={setWeight} onEndEditing={() => set({ weightKg: num(weight) })} />
        <Muted>Sommeil</Muted>
        <Stepper value={log.sleepHours ?? 0} onChange={(v) => set({ sleepHours: v || undefined })} min={0} max={14} suffix="h" />
        <Muted>Eau</Muted>
        <Stepper value={log.waterGlasses ?? 0} onChange={(v) => set({ waterGlasses: v || undefined })} min={0} max={20} suffix="verres" />
      </Card>

      <Card>
        <H2>Notes</H2>
        <TextInput style={[s.input, { minHeight: 90, textAlignVertical: 'top' }]} multiline placeholder="Comment s'est passée votre journée ?" placeholderTextColor={colors.muted} value={notes} onChangeText={setNotes} onEndEditing={() => set({ notes: notes.trim() || undefined })} />
      </Card>
    </Screen>
  );
}

const s = StyleSheet.create({
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, fontSize: 16, marginVertical: 8, color: colors.text, backgroundColor: colors.white },
});
