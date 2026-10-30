import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CycleRing } from '../../components/CycleRing';
import { Body, Button, Card, H2, Muted, Screen } from '../../components/ui';
import { CHANCE_LABEL, PHASE_LABEL, dayStatus, type Phase } from '../../domain/cycle';
import { addDays, diffDays, formatLong, formatShort, parseISO } from '../../domain/dates';
import { pregnancyStatus } from '../../domain/pregnancy';
import { useStore } from '../../storage/store';
import { colors, phaseColor } from '../../theme';

const PHASE_TIP: Record<Phase, string> = {
  menstrual: "Le fer et l'hydratation aident à compenser les pertes. Une bouillotte et une activité douce peuvent soulager les crampes.",
  follicular: "Les œstrogènes remontent : l'énergie et la concentration ont tendance à augmenter. Bon moment pour les défis sportifs.",
  fertile: 'Vous êtes dans votre fenêtre de fertilité. La glaire peut devenir plus fluide et élastique, comme du blanc d’œuf.',
  ovulation: "Ovulation estimée aujourd'hui. Certaines ressentent une légère douleur d'un côté du bas-ventre.",
  luteal: 'La progestérone domine : fringales, seins sensibles ou baisse de moral sont fréquents en fin de cycle. Dormez bien, bougez, limitez le sel.',
};

export default function Today() {
  const { data, prediction: p, ref, logDay } = useStore();
  const st = dayStatus(data, p, ref, ref);
  const name = data.settings.name;

  if (data.settings.goal === 'pregnant' && data.settings.pregnancyStart) {
    const preg = pregnancyStatus(data.settings.pregnancyStart, ref);
    return (
      <Screen>
        <Text style={s.hello}>{name ? `Bonjour ${name}` : 'Bonjour'}</Text>
        <Pressable onPress={() => router.push('/pregnancy')}>
          <Card style={{ alignItems: 'center', paddingVertical: 32 }}>
            <Muted>Semaine</Muted>
            <Text style={s.week}>{preg.week} SA + {preg.day} j</Text>
            <Body>Bébé a la taille d'{preg.size}</Body>
            <Muted>Terme prévu le {formatLong(preg.dueDate)}</Muted>
          </Card>
        </Pressable>
        <Card><H2>Conseil de la semaine</H2><Body>{preg.tip}</Body></Card>
        <Button title="Noter ma journée" onPress={() => router.push(`/log/${ref}`)} />
      </Screen>
    );
  }

  const daysToPeriod = diffDays(p.nextPeriodStart, ref);
  let headline: string;
  let caption: string;
  if (st.isPeriod) {
    const start = p.currentStart ?? ref;
    headline = `Règles : jour ${diffDays(ref, start) + 1}`;
    caption = 'Notez votre flux pour affiner les prédictions';
  } else if (st.daysLate > 0) {
    headline = `Retard de ${st.daysLate} j`;
    caption = st.daysLate >= 5 ? 'Un test de grossesse peut lever le doute' : 'Les cycles varient souvent de quelques jours';
  } else if (daysToPeriod === 0) {
    headline = "Règles prévues aujourd'hui";
    caption = `Marge ±${p.uncertainty} j`;
  } else {
    headline = `Règles dans ${daysToPeriod} j`;
    caption = st.isFertile ? `Chance de conception : ${CHANCE_LABEL[st.chance].toLowerCase()}` : `Prévues le ${formatShort(p.nextPeriodStart)} ±${p.uncertainty} j`;
  }

  const week = Array.from({ length: 7 }, (_, i) => addDays(ref, i - 3));
  const togglePeriod = () => logDay(ref, { flow: st.isPeriod ? undefined : 'medium' });

  return (
    <Screen>
      <Text style={s.hello}>{name ? `Bonjour ${name}` : 'Bonjour'}</Text>
      <Muted>{formatLong(ref)}</Muted>

      <View style={s.strip}>
        {week.map((d) => {
          const ds = dayStatus(data, p, d, ref);
          const bg = ds.isPeriod ? colors.period : ds.isPredictedPeriod ? colors.periodPredicted : ds.isOvulation ? colors.ovulation : ds.isFertile ? colors.fertileSoft : colors.white;
          return (
            <Pressable key={d} onPress={() => router.push(`/log/${d}`)} style={[s.stripDay, { backgroundColor: bg }, d === ref && s.stripToday]}>
              <Text style={[s.stripWd, (ds.isPeriod || ds.isOvulation) && { color: colors.white }]}>{'DLMMJVS'[parseISO(d).getUTCDay()]}</Text>
              <Text style={[s.stripNum, (ds.isPeriod || ds.isOvulation) && { color: colors.white }]}>{Number(d.slice(8))}</Text>
            </Pressable>
          );
        })}
      </View>

      <CycleRing prediction={p} cycleDay={st.cycleDay} headline={headline} caption={caption} />

      <View style={s.actions}>
        <Pressable style={[s.action, { backgroundColor: colors.period }]} onPress={togglePeriod}>
          <Text style={s.actionText}>{st.isPeriod ? 'Pas de règles ce jour' : 'Règles aujourd’hui'}</Text>
        </Pressable>
        <Pressable style={[s.action, { backgroundColor: colors.plum }]} onPress={() => router.push(`/log/${ref}`)}>
          <Text style={s.actionText}>＋ Symptômes</Text>
        </Pressable>
      </View>

      {st.phase && (
        <Card>
          <View style={s.phaseRow}>
            <View style={[s.phaseDot, { backgroundColor: phaseColor[st.phase] }]} />
            <H2>{PHASE_LABEL[st.phase]}</H2>
          </View>
          <Body>{PHASE_TIP[st.phase]}</Body>
        </Card>
      )}

      <Card>
        <H2>Vos prochaines dates</H2>
        <Row label="Fenêtre de fertilité" value={`${formatShort(p.fertileStart)} – ${formatShort(p.fertileEnd)}`} color={colors.fertile} />
        <Row label="Ovulation" value={formatShort(p.ovulation)} color={colors.ovulation} />
        <Row label="Prochaines règles" value={`${formatShort(p.nextPeriodStart)} ±${p.uncertainty} j`} color={colors.period} />
        <Muted>
          Fiabilité {p.confidence === 'high' ? 'élevée' : p.confidence === 'medium' ? 'moyenne' : 'en apprentissage'}
          {p.confidence !== 'high' ? ' : notez vos règles pendant 3-4 cycles pour des prédictions plus précises.' : '.'}
        </Muted>
      </Card>

      {data.settings.goal === 'conceive' && (
        <Card style={{ backgroundColor: colors.fertileSoft }}>
          <H2>Chance de conception aujourd'hui : {CHANCE_LABEL[st.chance]}</H2>
          <Body>Notez vos tests d'ovulation et votre température au réveil : Lunéa confirme alors l'ovulation et apprend la durée réelle de votre phase lutéale.</Body>
        </Card>
      )}
      {data.settings.goal === 'avoid' && st.isFertile && (
        <Card style={{ backgroundColor: colors.warning }}>
          <H2>Jour potentiellement fertile</H2>
          <Body>Les prédictions d'une application ne remplacent pas une contraception. Utilisez une méthode fiable si vous ne souhaitez pas de grossesse.</Body>
        </Card>
      )}
    </Screen>
  );
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={s.row}>
      <View style={[s.phaseDot, { backgroundColor: color }]} />
      <Text style={{ flex: 1, color: colors.text, fontSize: 15 }}>{label}</Text>
      <Text style={{ color: colors.text, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  hello: { fontSize: 26, fontWeight: '800', color: colors.text },
  week: { fontSize: 40, fontWeight: '800', color: colors.primary, marginVertical: 8 },
  strip: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 16 },
  stripDay: { width: 42, paddingVertical: 8, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  stripToday: { borderColor: colors.text, borderWidth: 2 },
  stripWd: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  stripNum: { fontSize: 16, color: colors.text, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10, marginVertical: 16 },
  action: { flex: 1, borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
  actionText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  phaseRow: { flexDirection: 'row', alignItems: 'center' },
  phaseDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
});
