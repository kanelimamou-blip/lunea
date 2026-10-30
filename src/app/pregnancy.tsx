import { StyleSheet, Text, View } from 'react-native';
import { Body, Button, Card, H2, Muted, Screen, Stepper } from '../components/ui';
import { addDays, diffDays, formatLong } from '../domain/dates';
import { pregnancyStatus } from '../domain/pregnancy';
import { useStore } from '../storage/store';
import { colors } from '../theme';

export default function Pregnancy() {
  const { data, prediction, ref, updateSettings } = useStore();
  const lmp = data.settings.pregnancyStart;
  const active = data.settings.goal === 'pregnant' && lmp;

  if (!active) {
    const suggested = prediction.currentStart ?? addDays(ref, -28);
    return (
      <Screen>
        <Card>
          <H2>Activer le mode grossesse</H2>
          <Body>Suivi semaine par semaine, taille du bébé, date du terme, conseils adaptés. Les prédictions de règles sont mises en pause.</Body>
          <Muted>Date des dernières règles retenue : {formatLong(suggested)}. Vous pourrez l'ajuster ensuite.</Muted>
          <Button title="Je suis enceinte" onPress={() => updateSettings({ goal: 'pregnant', pregnancyStart: suggested })} />
        </Card>
      </Screen>
    );
  }

  const st = pregnancyStatus(lmp, ref);
  const daysAgo = diffDays(ref, lmp);
  return (
    <Screen>
      <Card style={{ alignItems: 'center' }}>
        <Muted>Trimestre {st.trimester}</Muted>
        <Text style={s.big}>{st.week} SA + {st.day} j</Text>
        <Body>Taille d'{st.size}</Body>
        <View style={s.track}><View style={[s.fill, { width: `${st.progress * 100}%` }]} /></View>
        <Muted>Terme prévu le {formatLong(st.dueDate)} · J-{st.daysLeft}</Muted>
      </Card>
      <Card><H2>Cette semaine</H2><Body>{st.tip}</Body></Card>
      <Card>
        <H2>Ajuster le début de grossesse</H2>
        <Muted>Premier jour des dernières règles, il y a :</Muted>
        <Stepper value={daysAgo} onChange={(v) => updateSettings({ pregnancyStart: addDays(ref, -v) })} min={0} max={300} suffix="jours" />
        <Muted>Si votre échographie donne une date différente, ajustez ici : elle prime sur le calcul.</Muted>
      </Card>
      <Button title="Quitter le mode grossesse" variant="ghost" onPress={() => updateSettings({ goal: 'track', pregnancyStart: undefined })} />
    </Screen>
  );
}

const s = StyleSheet.create({
  big: { fontSize: 40, fontWeight: '800', color: colors.primary, marginVertical: 8 },
  track: { height: 10, borderRadius: 5, backgroundColor: colors.primarySoft, width: '100%', marginVertical: 12, overflow: 'hidden' },
  fill: { height: 10, backgroundColor: colors.primary },
});
