import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import type { Prediction } from '../domain/cycle';
import { diffDays, type ISODate } from '../domain/dates';
import { colors } from '../theme';

interface Props {
  prediction: Prediction;
  cycleDay?: number;
  headline: string;
  caption: string;
  size?: number;
}

function arc(cx: number, cy: number, r: number, from: number, to: number) {
  const a0 = (from - 0.25) * 2 * Math.PI;
  const a1 = (to - 0.25) * 2 * Math.PI;
  const large = to - from > 0.5 ? 1 : 0;
  return `M ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}`;
}

/** The whole cycle as a ring: period, fertile window and ovulation as arcs, today as a dot. */
export function CycleRing({ prediction: p, cycleDay, headline, caption, size = 280 }: Props) {
  const stroke = 18;
  const r = (size - stroke) / 2 - 6;
  const c = size / 2;
  const len = p.cycleLength;
  const frac = (day: number) => Math.min(1, Math.max(0, (day - 1) / len));
  const startOf = (d: ISODate) => (p.currentStart ? diffDays(d, p.currentStart) + 1 : 0);

  const fertileFrom = startOf(p.fertileStart);
  const fertileTo = startOf(p.fertileEnd) + 1;
  const ovu = startOf(p.ovulation);
  const todayFrac = cycleDay ? frac(Math.min(cycleDay, len) + 0.5) : undefined;
  const dot = todayFrac !== undefined ? { x: c + r * Math.cos((todayFrac - 0.25) * 2 * Math.PI), y: c + r * Math.sin((todayFrac - 0.25) * 2 * Math.PI) } : undefined;

  return (
    <View style={{ width: size, height: size, alignSelf: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={c} cy={c} r={r} stroke={colors.primarySoft} strokeWidth={stroke} fill="none" />
        {p.currentStart && (
          <>
            <Path d={arc(c, c, r, 0, frac(p.periodLength + 1))} stroke={colors.period} strokeWidth={stroke} strokeLinecap="round" fill="none" />
            {fertileFrom > 0 && <Path d={arc(c, c, r, frac(fertileFrom), frac(fertileTo))} stroke={colors.fertile} strokeWidth={stroke} strokeLinecap="round" fill="none" />}
            {ovu > 0 && <Circle cx={c + r * Math.cos((frac(ovu + 0.5) - 0.25) * 2 * Math.PI)} cy={c + r * Math.sin((frac(ovu + 0.5) - 0.25) * 2 * Math.PI)} r={stroke / 2 + 2} fill={colors.ovulation} />}
          </>
        )}
        {dot && <Circle cx={dot.x} cy={dot.y} r={stroke / 2 + 5} fill={colors.white} stroke={colors.plum} strokeWidth={4} />}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        {cycleDay ? <Text style={styles.day}>Jour {cycleDay}</Text> : null}
        <Text style={styles.headline} numberOfLines={2} adjustsFontSizeToFit>{headline}</Text>
        <Text style={styles.caption}>{caption}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 48 },
  day: { fontSize: 14, color: colors.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  headline: { fontSize: 30, fontWeight: '800', color: colors.text, textAlign: 'center', marginVertical: 4 },
  caption: { fontSize: 14, color: colors.muted, textAlign: 'center' },
});
