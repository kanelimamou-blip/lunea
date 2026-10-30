import { describe, expect, it } from 'vitest';
import { addDays } from './dates';
import { buildCycles, dayStatus, detectPeriods, detectTemperatureShift, predict } from './cycle';
import { computeInsights } from './insights';
import { pregnancyStatus } from './pregnancy';
import { DEFAULT_DATA, type AppData, type DayLog } from './types';

function withPeriods(starts: string[], length = 5, extra: Record<string, DayLog> = {}): AppData {
  const days: Record<string, DayLog> = {};
  for (const s of starts) for (let i = 0; i < length; i++) days[addDays(s, i)] = { flow: i < 2 ? 'heavy' : 'light' };
  return { ...DEFAULT_DATA, days: { ...days, ...extra } };
}

describe('detectPeriods', () => {
  it('groups consecutive bleeding days and tolerates a one-day gap', () => {
    const data = withPeriods(['2026-01-01']);
    delete data.days['2026-01-03'];
    expect(detectPeriods(data.days)).toEqual([{ start: '2026-01-01', end: '2026-01-05', length: 5 }]);
  });

  it('ignores spotting', () => {
    expect(detectPeriods({ '2026-01-10': { flow: 'spotting' } })).toEqual([]);
  });
});

describe('predict', () => {
  it('falls back to defaults with no data', () => {
    const p = predict(DEFAULT_DATA, '2026-03-01');
    expect(p.cycleLength).toBe(28);
    expect(p.confidence).toBe('low');
  });

  it('learns a regular 30-day cycle', () => {
    const data = withPeriods(['2026-01-01', '2026-01-31', '2026-03-02', '2026-04-01', '2026-05-01']);
    const p = predict(data, '2026-05-10');
    expect(p.cycleLength).toBe(30);
    expect(p.nextPeriodStart).toBe('2026-05-31');
    expect(p.ovulation).toBe('2026-05-17');
    expect(p.fertileStart).toBe('2026-05-12');
    expect(p.fertileEnd).toBe('2026-05-18');
    expect(p.confidence).toBe('high');
    expect(p.irregular).toBe(false);
  });

  it('flags irregular cycles and widens the margin', () => {
    const data = withPeriods(['2026-01-01', '2026-01-23', '2026-03-05', '2026-03-31', '2026-05-10']);
    const p = predict(data, '2026-05-12');
    expect(p.irregular).toBe(true);
    expect(p.uncertainty).toBeGreaterThan(3);
  });

  it('uses the personal luteal phase from positive LH tests', () => {
    // LH+ on cycle day 17 → ovulation on cycle day 18 → luteal phase = 30 - 17 = 13 days.
    const starts = ['2026-01-01', '2026-01-31', '2026-03-02'];
    const extra: Record<string, DayLog> = {
      [addDays(starts[0], 16)]: { ovulationTest: 'positive' },
      [addDays(starts[1], 16)]: { ovulationTest: 'positive' },
    };
    const p = predict(withPeriods(starts, 5, extra), '2026-03-05');
    expect(p.lutealLength).toBe(13);
    expect(p.ovulation).toBe(addDays(p.nextPeriodStart, -13));
  });
});

describe('detectTemperatureShift', () => {
  it('applies the 3-over-6 rule', () => {
    const days: Record<string, DayLog> = {};
    const temps = [36.4, 36.5, 36.4, 36.3, 36.5, 36.4, 36.4, 36.8, 36.8, 36.9];
    temps.forEach((t, i) => (days[addDays('2026-02-01', i)] = { temperature: t }));
    expect(detectTemperatureShift(days, '2026-02-01', '2026-02-28')).toBe('2026-02-07');
  });
});

describe('dayStatus', () => {
  const data = withPeriods(['2026-01-01', '2026-01-29', '2026-02-26']);

  it('reports cycle day and phase', () => {
    const p = predict(data, '2026-03-05');
    expect(dayStatus(data, p, '2026-02-27', '2026-03-05')).toMatchObject({ cycleDay: 2, phase: 'menstrual', isPeriod: true });
    expect(dayStatus(data, p, p.ovulation, '2026-03-05')).toMatchObject({ phase: 'ovulation', chance: 'high' });
  });

  it('marks predicted periods in the future', () => {
    const p = predict(data, '2026-03-05');
    expect(dayStatus(data, p, p.nextPeriodStart, '2026-03-05').isPredictedPeriod).toBe(true);
  });

  it('counts days late', () => {
    const p = predict(data, '2026-03-30');
    expect(dayStatus(data, p, '2026-03-30', '2026-03-30').daysLate).toBe(4);
  });
});

describe('insights', () => {
  it('summarises history and raises alerts for long cycles', () => {
    const data = withPeriods(['2026-01-01', '2026-02-10', '2026-03-22', '2026-05-01']);
    const ins = computeInsights(data, '2026-05-05');
    expect(buildCycles(data)).toHaveLength(4);
    expect(ins.cyclesLogged).toBe(3);
    expect(ins.alerts.some((a) => a.title === 'Cycles longs')).toBe(true);
  });
});

describe('pregnancy', () => {
  it('computes week, trimester and due date', () => {
    const s = pregnancyStatus('2026-01-01', '2026-04-10');
    expect(s.week).toBe(14);
    expect(s.trimester).toBe(2);
    expect(s.dueDate).toBe('2026-10-08');
  });
});
