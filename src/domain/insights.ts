import { addDays, diffDays, type ISODate } from './dates';
import { buildCycles, dayStatus, predict, type Phase } from './cycle';
import { MOODS, SYMPTOMS, label } from './catalog';
import type { AppData } from './types';

export interface HealthAlert {
  level: 'info' | 'warning';
  title: string;
  body: string;
}

export interface PhasePattern {
  phase: Phase;
  top: { label: string; share: number }[];
}

export interface Insights {
  cyclesLogged: number;
  avgCycle: number;
  avgPeriod: number;
  shortest?: number;
  longest?: number;
  history: { start: ISODate; length?: number; periodLength: number; ovulationConfirmed: boolean }[];
  patterns: PhasePattern[];
  alerts: HealthAlert[];
  temperatures: { date: ISODate; t: number }[];
}

export function computeInsights(data: AppData, ref: ISODate): Insights {
  const cycles = buildCycles(data);
  const p = predict(data, ref);
  const lengths = cycles.map((c) => c.length).filter((l): l is number => !!l);

  // Which symptoms and moods cluster in which phase.
  const counts: Record<string, Record<string, number>> = {};
  const phaseDays: Record<string, number> = {};
  for (const [date, log] of Object.entries(data.days)) {
    const phase = dayStatus(data, p, date, ref).phase;
    if (!phase) continue;
    const tags = [...(log.symptoms ?? []).filter((s) => s !== 'everything_fine'), ...(log.moods ?? [])];
    if (!tags.length) continue;
    phaseDays[phase] = (phaseDays[phase] ?? 0) + 1;
    counts[phase] ??= {};
    for (const t of tags) counts[phase][t] = (counts[phase][t] ?? 0) + 1;
  }
  const allOptions = [...SYMPTOMS, ...MOODS];
  const patterns = (Object.keys(counts) as Phase[]).map((phase) => ({
    phase,
    top: Object.entries(counts[phase])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, n]) => ({ label: label(allOptions, id), share: n / phaseDays[phase] })),
  }));

  const alerts: HealthAlert[] = [];
  const recent = lengths.slice(-3);
  if (recent.length >= 2 && recent.every((l) => l < 21)) {
    alerts.push({ level: 'warning', title: 'Cycles courts', body: 'Vos derniers cycles durent moins de 21 jours. Parlez-en à un professionnel de santé.' });
  }
  if (recent.length >= 2 && recent.every((l) => l > 35)) {
    alerts.push({ level: 'warning', title: 'Cycles longs', body: 'Vos derniers cycles dépassent 35 jours. Cela peut avoir plusieurs causes (stress, SOPK, thyroïde) qui méritent un avis médical.' });
  }
  if (cycles.slice(-3).some((c) => c.periodLength > 7)) {
    alerts.push({ level: 'warning', title: 'Règles prolongées', body: 'Des règles de plus de 7 jours méritent un avis médical, surtout si elles sont abondantes.' });
  }
  if (p.irregular) {
    alerts.push({ level: 'info', title: 'Cycles irréguliers', body: `La durée de vos cycles varie de plus de 7 jours. Les prédictions affichent une marge de ±${p.uncertainty} jours.` });
  }
  const st = dayStatus(data, p, ref, ref);
  if (st.daysLate >= 7 && data.settings.goal !== 'pregnant') {
    alerts.push({ level: 'info', title: `Retard de ${st.daysLate} jours`, body: 'Un test de grossesse peut lever le doute. Le stress, le voyage ou la maladie peuvent aussi décaler les règles.' });
  }
  const heavyDays = Object.values(data.days).filter((d) => d.flow === 'heavy').length;
  if (cycles.length >= 2 && heavyDays / cycles.length > 4) {
    alerts.push({ level: 'info', title: 'Flux abondant fréquent', body: 'Des règles souvent abondantes peuvent entraîner une carence en fer. Un bilan sanguin peut être utile.' });
  }

  const temperatures: { date: ISODate; t: number }[] = [];
  const from = p.currentStart ?? addDays(ref, -35);
  for (let d = from; d <= ref && diffDays(d, from) < 60; d = addDays(d, 1)) {
    const t = data.days[d]?.temperature;
    if (t) temperatures.push({ date: d, t });
  }

  return {
    cyclesLogged: lengths.length,
    avgCycle: p.cycleLength,
    avgPeriod: p.periodLength,
    shortest: lengths.length ? Math.min(...lengths) : undefined,
    longest: lengths.length ? Math.max(...lengths) : undefined,
    history: cycles.slice().reverse().map((c) => ({ start: c.start, length: c.length, periodLength: c.periodLength, ovulationConfirmed: !!c.ovulation })),
    patterns,
    alerts,
    temperatures,
  };
}
