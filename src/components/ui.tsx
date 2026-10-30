import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, space } from '../theme';

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {scroll ? <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView> : <View style={styles.content}>{children}</View>}
    </SafeAreaView>
  );
}

export function Title({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <View style={{ marginBottom: space(4) }}>
      <Text style={styles.title}>{children}</Text>
      {subtitle ? <Text style={styles.muted}>{subtitle}</Text> : null}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function H2({ children }: { children: ReactNode }) {
  return <Text style={styles.h2}>{children}</Text>;
}

export function Muted({ children }: { children: ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function Body({ children }: { children: ReactNode }) {
  return <Text style={styles.body}>{children}</Text>;
}

export function Button({ title, onPress, variant = 'primary' }: { title: string; onPress: () => void; variant?: 'primary' | 'ghost' | 'danger' }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, variant !== 'primary' && styles.buttonGhost, pressed && { opacity: 0.8 }]}
      accessibilityRole="button"
    >
      <Text style={[styles.buttonText, variant === 'ghost' && { color: colors.primary }, variant === 'danger' && { color: '#C0392B' }]}>{title}</Text>
    </Pressable>
  );
}

export function Chip({ label, emoji, selected, onPress, color = colors.primary }: { label: string; emoji?: string; selected: boolean; onPress: () => void; color?: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      style={[styles.chip, selected && { backgroundColor: color, borderColor: color }]}
    >
      {emoji ? <Text style={styles.chipEmoji}>{emoji}</Text> : null}
      <Text style={[styles.chipText, selected && { color: colors.white }]}>{label}</Text>
    </Pressable>
  );
}

export function Row({ label, value, onPress }: { label: string; value?: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.row} disabled={!onPress}>
      <Text style={styles.body}>{label}</Text>
      <Text style={styles.muted}>{value ?? (onPress ? '›' : '')}</Text>
    </Pressable>
  );
}

export function ToggleRow({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, paddingRight: space(3) }}>
        <Text style={styles.body}>{label}</Text>
        {hint ? <Text style={[styles.muted, { fontSize: 12 }]}>{hint}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary, false: colors.border }} thumbColor={colors.white} />
    </View>
  );
}

export function Stepper({ value, onChange, min, max, suffix }: { value: number; onChange: (v: number) => void; min: number; max: number; suffix: string }) {
  return (
    <View style={styles.stepper}>
      <Pressable style={styles.stepBtn} onPress={() => onChange(Math.max(min, value - 1))}><Text style={styles.stepTxt}>−</Text></Pressable>
      <Text style={styles.stepValue}>{value} {suffix}</Text>
      <Pressable style={styles.stepBtn} onPress={() => onChange(Math.min(max, value + 1))}><Text style={styles.stepTxt}>+</Text></Pressable>
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space(4), paddingBottom: space(16) },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  h2: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: space(2) },
  body: { fontSize: 15, color: colors.text, lineHeight: 21 },
  muted: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: space(4), marginBottom: space(3), shadowColor: '#5B2A5E', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  button: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingVertical: space(3.5), alignItems: 'center', marginVertical: space(1.5) },
  buttonGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  buttonText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  chip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: space(3), paddingVertical: space(2), marginRight: space(2), marginBottom: space(2), backgroundColor: colors.white },
  chipEmoji: { marginRight: space(1.5), fontSize: 14 },
  chipText: { fontSize: 14, color: colors.text, fontWeight: '500' },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: space(3), borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: space(2) },
  stepBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  stepTxt: { fontSize: 22, color: colors.primary, fontWeight: '700' },
  stepValue: { fontSize: 22, fontWeight: '700', color: colors.text, minWidth: 120, textAlign: 'center' },
});
