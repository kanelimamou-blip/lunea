import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { Body, Button, Card, H2, Muted, Screen, Title } from '../../components/ui';
import { PHASE_LABEL } from '../../domain/cycle';
import { formatShort } from '../../domain/dates';
import { computeInsights } from '../../domain/insights';
import { useStore } from '../../storage/store';
import { colors, phaseColor } from '../../theme';

export default function InsightsScreen() {
  const { data, ref } = useStore();
  const ins = computeInsights(data, ref);
  const bars = ins.history.filter((c) => c.length).slice(0, 8).reverse();
  const maxLen = Math.max(35, ...bars.map((b) => b.length!));

  return (
    <Screen>
      <Title subtitle={`${ins.cyclesLogged} cycle(s) complet(s) enregistré(s)`}>Analyses</Title>

      <View style={s.kpis}>
        <Kpi value={`${ins.avgCycle} j`} label="Cycle moyen" />
        <Kpi value={`${ins.avgPeriod} j`} label="Règles" />
        <Kpi value={ins.shortest ? `${ins.shortest}–${ins.longest}` : '–'} label="Variation (j)" />
      </View>

      {ins.alerts.map((a) => (
        <Card key={a.title} style={{ backgroundColor: a.level === 'warning' ? colors.warning : colors.primarySoft }}>
          <H2>{a.level === 'warning' ? '⚠️ ' : 'ℹ️ '}{a.title}</H2>
          <Body>{a.body}</Body>
        </Card>
      ))}

      <Card>
        <H2>Durée des cycles</H2>
        {bars.length ? (
          <View style={s.chart}>
            {bars.map((b) => (
              <View key={b.start} style={s.barCol}>
                <Text style={s.barValue}>{b.length}</Text>
                <View style={[s.bar, { height: (b.length! / maxLen) * 120, backgroundColor: b.length! < 21 || b.length! > 35 ? colors.follicular : colors.primary }]} />
                <Text style={s.barLabel}>{formatShort(b.start)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Muted>Notez au moins deux débuts de règles pour voir vos cycles ici.</Muted>
        )}
      </Card>

      <Card>
        <H2>Température basale (cycle en cours)</H2>
        {ins.temperatures.length >= 3 ? <TempChart points={ins.temperatures.map((x) => x.t)} /> : <Muted>Notez votre température au réveil chaque matin : Lunéa détecte la montée qui confirme l'ovulation (règle des 3 au-dessus de 6).</Muted>}
      </Card>

      <Card>
        <H2>Vos tendances par phase</H2>
        {ins.patterns.length ? ins.patterns.map((pt) => (
          <View key={pt.phase} style={{ marginBottom: 10 }}>
            <Text style={[s.phase, { color: phaseColor[pt.phase] }]}>{PHASE_LABEL[pt.phase]}</Text>
            <Body>{pt.top.map((t) => `${t.label} (${Math.round(t.share * 100)} %)`).join(' · ')}</Body>
          </View>
        )) : <Muted>Notez symptômes et humeurs quelques jours par cycle pour découvrir ce qui revient à chaque phase.</Muted>}
      </Card>

      <Card>
        <H2>Historique</H2>
        {ins.history.slice(0, 12).map((c) => (
          <View key={c.start} style={s.histRow}>
            <Text style={s.histDate}>{formatShort(c.start)}</Text>
            <Muted>{c.length ? `${c.length} j` : 'en cours'} · règles {c.periodLength} j{c.ovulationConfirmed ? ' · ovulation confirmée' : ''}</Muted>
          </View>
        ))}
      </Card>

      <Button title="Générer un rapport pour mon médecin" onPress={() => router.push('/report')} />
    </Screen>
  );
}

function Kpi({ value, label }: { value: string; label: string }) {
  return (
    <View style={s.kpi}>
      <Text style={s.kpiValue}>{value}</Text>
      <Text style={s.kpiLabel}>{label}</Text>
    </View>
  );
}

function TempChart({ points }: { points: number[] }) {
  const w = 300;
  const h = 120;
  const min = Math.min(...points) - 0.1;
  const max = Math.max(...points) + 0.1;
  const xy = points.map((t, i) => [(i / Math.max(1, points.length - 1)) * (w - 20) + 10, h - ((t - min) / (max - min)) * (h - 20) - 10]);
  return (
    <View>
      <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
        <Line x1={0} y1={h - 10} x2={w} y2={h - 10} stroke={colors.border} />
        <Polyline points={xy.map((p) => p.join(',')).join(' ')} stroke={colors.primary} strokeWidth={2} fill="none" />
        {xy.map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={3} fill={colors.primary} />)}
      </Svg>
      <Muted>{min.toFixed(1)} – {max.toFixed(1)} °C</Muted>
    </View>
  );
}

const s = StyleSheet.create({
  kpis: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  kpi: { flex: 1, backgroundColor: colors.white, borderRadius: 16, padding: 14, alignItems: 'center' },
  kpiValue: { fontSize: 22, fontWeight: '800', color: colors.primary },
  kpiLabel: { fontSize: 13, color: colors.muted, textAlign: 'center' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 170 },
  barCol: { alignItems: 'center', flex: 1 },
  bar: { width: 18, borderRadius: 9 },
  barValue: { fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 4 },
  barLabel: { fontSize: 10, color: colors.muted, marginTop: 4 },
  phase: { fontWeight: '700', marginBottom: 2 },
  histRow: { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  histDate: { fontWeight: '700', color: colors.text },
});
