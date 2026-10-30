import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Legend, MonthCalendar } from '../../components/MonthCalendar';
import { Body, Button, Card, H2, Muted, Screen } from '../../components/ui';
import { MOODS, SYMPTOMS, FLOWS, label } from '../../domain/catalog';
import { CHANCE_LABEL, PHASE_LABEL, dayStatus } from '../../domain/cycle';
import { formatLong, monthName, parseISO } from '../../domain/dates';
import { useStore } from '../../storage/store';
import { colors } from '../../theme';

export default function Calendar() {
  const { data, prediction, ref, logDay } = useStore();
  const now = parseISO(ref);
  const [ym, setYm] = useState({ y: now.getUTCFullYear(), m: now.getUTCMonth() });
  const [selected, setSelected] = useState(ref);

  const shift = (n: number) => setYm(({ y, m }) => ({ y: y + Math.floor((m + n) / 12), m: (((m + n) % 12) + 12) % 12 }));
  const st = dayStatus(data, prediction, selected, ref);
  const log = data.days[selected];
  const tags = [...(log?.symptoms ?? []).map((id) => label(SYMPTOMS, id)), ...(log?.moods ?? []).map((id) => label(MOODS, id))];

  return (
    <Screen>
      <View style={s.header}>
        <Pressable onPress={() => shift(-1)} hitSlop={12}><Text style={s.nav}>‹</Text></Pressable>
        <Text style={s.month}>{monthName(ym.m)} {ym.y}</Text>
        <Pressable onPress={() => shift(1)} hitSlop={12}><Text style={s.nav}>›</Text></Pressable>
      </View>
      <Card>
        <MonthCalendar year={ym.y} month={ym.m} selected={selected} onSelect={setSelected} />
        <Legend />
      </Card>

      <Card>
        <H2>{formatLong(selected)}</H2>
        {st.cycleDay ? <Muted>Jour {st.cycleDay} du cycle{st.phase ? ` · ${PHASE_LABEL[st.phase]}` : ''}</Muted> : null}
        {st.isFertile ? <Muted>Chance de conception : {CHANCE_LABEL[st.chance]}</Muted> : null}
        {log?.flow ? <Body>Flux : {label(FLOWS, log.flow)}</Body> : null}
        {tags.length ? <Body>{tags.join(' · ')}</Body> : null}
        {log?.temperature ? <Body>Température : {log.temperature.toFixed(2)} °C</Body> : null}
        {log?.notes ? <Body>« {log.notes} »</Body> : null}
        {selected <= ref && (
          <Button
            title={st.isPeriod ? 'Retirer les règles de ce jour' : 'Marquer comme jour de règles'}
            variant="ghost"
            onPress={() => logDay(selected, { flow: st.isPeriod ? undefined : 'medium' })}
          />
        )}
        <Button title="Ouvrir le journal" onPress={() => router.push(`/log/${selected}`)} />
      </Card>
    </Screen>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  month: { fontSize: 22, fontWeight: '800', color: colors.text, textTransform: 'capitalize' },
  nav: { fontSize: 32, color: colors.primary, paddingHorizontal: 12 },
});
