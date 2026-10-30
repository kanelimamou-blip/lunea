import { Pressable, StyleSheet, Text, View } from 'react-native';
import { dayStatus } from '../domain/cycle';
import { monthGrid, type ISODate } from '../domain/dates';
import { useStore } from '../storage/store';
import { colors } from '../theme';

const WEEK = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function MonthCalendar({ year, month, selected, onSelect }: { year: number; month: number; selected?: ISODate; onSelect: (d: ISODate) => void }) {
  const { data, prediction, ref } = useStore();
  const cells = monthGrid(year, month);

  return (
    <View>
      <View style={styles.week}>
        {WEEK.map((w, i) => <Text key={i} style={styles.weekday}>{w}</Text>)}
      </View>
      <View style={styles.grid}>
        {cells.map((d, i) => {
          if (!d) return <View key={i} style={styles.cell} />;
          const s = dayStatus(data, prediction, d, ref);
          const log = data.days[d];
          const hasLog = !!log && (log.symptoms?.length || log.moods?.length || log.notes || log.temperature || log.sex);
          const bg = s.isPeriod ? colors.period : s.isPredictedPeriod ? colors.periodPredicted : s.isOvulation ? colors.ovulation : s.isFertile ? colors.fertileSoft : 'transparent';
          const fg = s.isPeriod || s.isOvulation ? colors.white : colors.text;
          return (
            <Pressable key={d} style={styles.cell} onPress={() => onSelect(d)} accessibilityLabel={d}>
              <View style={[styles.dayCircle, { backgroundColor: bg }, s.isPredictedPeriod && styles.dashed, d === selected && styles.selected, d === ref && styles.today]}>
                <Text style={[styles.dayText, { color: fg }, d > ref && !s.isPredictedPeriod && !s.isFertile && { color: colors.muted }]}>{Number(d.slice(8))}</Text>
              </View>
              {hasLog ? <View style={styles.dot} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function Legend() {
  const items = [
    [colors.period, 'Règles'],
    [colors.periodPredicted, 'Règles prévues'],
    [colors.fertileSoft, 'Fertilité'],
    [colors.ovulation, 'Ovulation'],
  ];
  return (
    <View style={styles.legend}>
      {items.map(([c, l]) => (
        <View key={l} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: c }]} />
          <Text style={styles.legendText}>{l}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  week: { flexDirection: 'row' },
  weekday: { width: `${100 / 7}%`, textAlign: 'center', color: colors.muted, fontWeight: '600', marginBottom: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  dashed: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.period },
  selected: { borderWidth: 2, borderColor: colors.plum },
  today: { borderWidth: 2, borderColor: colors.text },
  dayText: { fontSize: 15, fontWeight: '600' },
  dot: { position: 'absolute', bottom: 3, width: 5, height: 5, borderRadius: 3, backgroundColor: colors.plum },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8, marginVertical: 4 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
  legendText: { fontSize: 12, color: colors.muted },
});
