import type { ISODate } from './dates';

export type Flow = 'spotting' | 'light' | 'medium' | 'heavy';
export type TestResult = 'positive' | 'negative';
export type Goal = 'track' | 'conceive' | 'avoid' | 'pregnant';
export type Sex = 'none' | 'protected' | 'unprotected';

export interface DayLog {
  flow?: Flow;
  symptoms?: string[];
  moods?: string[];
  discharge?: string;
  /** Basal body temperature in °C, taken on waking. */
  temperature?: number;
  weightKg?: number;
  sleepHours?: number;
  waterGlasses?: number;
  ovulationTest?: TestResult;
  pregnancyTest?: TestResult;
  sex?: Sex;
  pillTaken?: boolean;
  notes?: string;
}

export interface ReminderSettings {
  periodSoon: boolean;
  fertileWindow: boolean;
  ovulation: boolean;
  dailyLog: boolean;
  pill: boolean;
  /** "HH:MM", local time. */
  time: string;
  /** Neutral wording so lock-screen notifications reveal nothing. */
  discreet: boolean;
}

export interface Settings {
  onboarded: boolean;
  name?: string;
  birthYear?: number;
  goal: Goal;
  /** Used until enough cycles are logged. */
  defaultCycleLength: number;
  defaultPeriodLength: number;
  /** LMP used by pregnancy mode. */
  pregnancyStart?: ISODate;
  lockEnabled: boolean;
  reminders: ReminderSettings;
}

export interface AppData {
  version: 1;
  settings: Settings;
  days: Record<ISODate, DayLog>;
}

export const DEFAULT_DATA: AppData = {
  version: 1,
  settings: {
    onboarded: false,
    goal: 'track',
    defaultCycleLength: 28,
    defaultPeriodLength: 5,
    lockEnabled: false,
    reminders: {
      periodSoon: true,
      fertileWindow: true,
      ovulation: false,
      dailyLog: false,
      pill: false,
      time: '09:00',
      discreet: true,
    },
  },
  days: {},
};
