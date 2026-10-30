import { addDays, diffDays, type ISODate } from './dates';
import type { AppData, DayLog } from './types';

export type Phase = 'menstrual' | 'follicular' | 'fertile' | 'ovulation' | 'luteal';
export type Chance = 'low' | 'medium' | 'high';

export interface Period {
  start: ISODate;
  end: ISODate;
  length: number;
}

export interface Cycle {
  start: ISODate;
  /** Undefined for the current, unfinished cycle. */
  length?: number;
  periodLength: number;
  /** Detected from LH tests or temperature shift, when available. */
  ovulation?: ISODate;
}

export interface Prediction {
  cycleLength: number;
  periodLength: number;
  lutealLength: number;
  /** ± days of uncertainty around the next period. */
  uncertainty: number;
  confidence: 'low' | 'medium' | 'high';
  nextPeriodStart: ISODate;
  ovulation: ISODate;
  fertileStart: ISODate;
  fertileEnd: ISODate;
  /** Start of the current cycle, if any period has been logged. */
  currentStart?: ISODate;
  irregular: boolean;
}

export interface DayStatus {
  cycleDay?: number;
  phase?: Phase;
  isPeriod: boolean;
  isPredictedPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  chance: Chance;
  daysLate: number;
}

const MIN_CYCLE = 15;
const MAX_CYCLE = 60;
const DEFAULT_LUTEAL = 14;

const isBleeding = (log?: DayLog) => !!log?.flow && log.flow !== 'spotting';

/** Groups bleeding days into periods; a single dry day inside a period is tolerated. */
export function detectPeriods(days: Record<ISODate, DayLog>): Period[] {
  const bleeding = Object.keys(days).filter((d) => isBleeding(days[d])).sort();
  const periods: Period[] = [];
  for (const d of bleeding) {
    const last = periods[periods.length - 1];
    if (last && diffDays(d, last.end) <= 2) {
      last.end = d;
      last.length = diffDays(d, last.start) + 1;
    } else {
      periods.push({ start: d, end: d, length: 1 });
    }
  }
  return periods;
}

/**
 * Symptothermal "3 over 6" rule: ovulation is the day before the first of three
 * consecutive temperatures that are all at least 0.2 °C above the previous six.
 */
export function detectTemperatureShift(days: Record<ISODate, DayLog>, from: ISODate, to: ISODate): ISODate | undefined {
  const temps: { date: ISODate; t: number }[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) {
    const t = days[d]?.temperature;
    if (t) temps.push({ date: d, t });
  }
  for (let i = 6; i + 2 < temps.length; i++) {
    const baseline = Math.max(...temps.slice(i - 6, i).map((x) => x.t));
    if ([0, 1, 2].every((k) => temps[i + k].t >= baseline + 0.2)) return addDays(temps[i].date, -1);
  }
  return undefined;
}

/** First positive LH test in the range; ovulation usually follows within ~24-36 h. */
export function detectLHSurge(days: Record<ISODate, DayLog>, from: ISODate, to: ISODate): ISODate | undefined {
  for (let d = from; d <= to; d = addDays(d, 1)) {
    if (days[d]?.ovulationTest === 'positive') return addDays(d, 1);
  }
  return undefined;
}

export function buildCycles(data: AppData): Cycle[] {
  const periods = detectPeriods(data.days);
  return periods.map((p, i) => {
    const next = periods[i + 1];
    const end = next ? addDays(next.start, -1) : addDays(p.start, MAX_CYCLE);
    const ovulation = detectLHSurge(data.days, p.start, end) ?? detectTemperatureShift(data.days, p.start, end);
    return { start: p.start, length: next ? diffDays(next.start, p.start) : undefined, periodLength: p.length, ovulation };
  });
}

function weightedMean(values: number[]): number {
  // Recent cycles weigh more: weights 1, 2, 3 … from oldest to newest.
  let sum = 0;
  let w = 0;
  values.forEach((v, i) => {
    sum += v * (i + 1);
    w += i + 1;
  });
  return sum / w;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(values.reduce((a, b) => a + (b - m) ** 2, 0) / (values.length - 1));
}

export function predict(data: AppData, ref: ISODate): Prediction {
  const cycles = buildCycles(data);
  const complete = cycles.filter((c) => c.length && c.length >= MIN_CYCLE && c.length <= MAX_CYCLE).slice(-6);
  const lengths = complete.map((c) => c.length!);
  const cycleLength = lengths.length ? Math.round(weightedMean(lengths)) : data.settings.defaultCycleLength;
  const periodLengths = cycles.slice(-6).map((c) => c.periodLength);
  const periodLength = periodLengths.length >= 2 ? Math.round(weightedMean(periodLengths)) : data.settings.defaultPeriodLength;

  // Personal luteal phase from confirmed ovulations, otherwise the textbook 14 days.
  const luteals = complete
    .filter((c) => c.ovulation)
    .map((c) => diffDays(addDays(c.start, c.length!), c.ovulation!))
    .filter((l) => l >= 9 && l <= 18);
  const lutealLength = luteals.length ? Math.round(luteals.reduce((a, b) => a + b, 0) / luteals.length) : Math.min(DEFAULT_LUTEAL, cycleLength - 7);

  const sd = stdDev(lengths);
  const range = lengths.length ? Math.max(...lengths) - Math.min(...lengths) : 0;
  const irregular = lengths.length >= 3 && (range > 7 || sd > 4);
  const uncertainty = lengths.length < 2 ? 3 : Math.min(7, Math.max(1, Math.round(sd)));
  const confidence = lengths.length >= 4 && !irregular ? 'high' : lengths.length >= 2 ? 'medium' : 'low';

  const current = cycles.filter((c) => c.start <= ref).pop();
  let nextPeriodStart: ISODate;
  if (current) {
    nextPeriodStart = addDays(current.start, cycleLength);
    // Project forward when several predicted periods were skipped (no logging).
    while (diffDays(ref, nextPeriodStart) > cycleLength) nextPeriodStart = addDays(nextPeriodStart, cycleLength);
  } else {
    nextPeriodStart = addDays(ref, cycleLength);
  }

  const ovulation = current?.ovulation && current.ovulation < nextPeriodStart && diffDays(nextPeriodStart, current.start) <= cycleLength
    ? current.ovulation
    : addDays(nextPeriodStart, -lutealLength);

  return {
    cycleLength,
    periodLength,
    lutealLength,
    uncertainty,
    confidence,
    nextPeriodStart,
    ovulation,
    fertileStart: addDays(ovulation, -5),
    fertileEnd: addDays(ovulation, 1),
    currentStart: current?.start,
    irregular,
  };
}

/** Predicted period starts for the next `count` cycles (for the calendar). */
export function futurePeriods(p: Prediction, count: number): { start: ISODate; ovulation: ISODate }[] {
  const out = [];
  for (let i = 0; i < count; i++) {
    const start = addDays(p.nextPeriodStart, i * p.cycleLength);
    out.push({ start, ovulation: addDays(start, p.cycleLength - p.lutealLength) });
  }
  return out;
}

export function dayStatus(data: AppData, p: Prediction, date: ISODate, ref: ISODate): DayStatus {
  const periods = detectPeriods(data.days);
  const loggedPeriod = periods.find((x) => date >= x.start && date <= x.end);
  const isPeriod = isBleeding(data.days[date]) || (!!loggedPeriod && date <= ref);

  // Which cycle does this date belong to: a logged one, or a predicted one?
  const lastStart = periods.filter((x) => x.start <= date).pop()?.start;
  const predicted = date >= p.nextPeriodStart ? futurePeriods(p, 24).filter((x) => x.start <= date).pop() : undefined;
  const cycleStart = predicted?.start ?? lastStart;

  const ovulation = predicted ? predicted.ovulation : cycleStart === p.currentStart ? p.ovulation : undefined;
  const isPredictedPeriod = !!predicted && diffDays(date, predicted.start) < p.periodLength && date > ref && !isPeriod;

  let isFertile = false;
  let isOvulation = false;
  if (ovulation) {
    const delta = diffDays(date, ovulation);
    isFertile = delta >= -5 && delta <= 1;
    isOvulation = delta === 0;
  } else if (cycleStart && !predicted) {
    // Past cycles: approximate from that cycle's own length.
    const next = periods.find((x) => x.start > cycleStart);
    if (next) {
      const ov = addDays(next.start, -p.lutealLength);
      const delta = diffDays(date, ov);
      isFertile = delta >= -5 && delta <= 1;
      isOvulation = delta === 0;
    }
  }

  const cycleDay = cycleStart ? diffDays(date, cycleStart) + 1 : undefined;
  let phase: Phase | undefined;
  if (cycleDay) {
    if (isPeriod || isPredictedPeriod || cycleDay <= p.periodLength) phase = 'menstrual';
    else if (isOvulation) phase = 'ovulation';
    else if (isFertile) phase = 'fertile';
    else if (ovulation && date > ovulation) phase = 'luteal';
    else phase = 'follicular';
  }

  let chance: Chance = 'low';
  if (isFertile && ovulation) {
    const delta = diffDays(date, ovulation);
    chance = delta >= -2 && delta <= 0 ? 'high' : 'medium';
  }

  const daysLate = date === ref && !isPeriod && ref > p.nextPeriodStart ? diffDays(ref, p.nextPeriodStart) : 0;
  return { cycleDay, phase, isPeriod, isPredictedPeriod, isFertile, isOvulation, chance, daysLate };
}

export const PHASE_LABEL: Record<Phase, string> = {
  menstrual: 'Règles',
  follicular: 'Phase folliculaire',
  fertile: 'Fenêtre de fertilité',
  ovulation: 'Ovulation',
  luteal: 'Phase lutéale',
};

export const CHANCE_LABEL: Record<Chance, string> = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Élevée',
};
