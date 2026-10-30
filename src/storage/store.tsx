import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { predict, type Prediction } from '../domain/cycle';
import { today, type ISODate } from '../domain/dates';
import { DEFAULT_DATA, type AppData, type DayLog, type Settings } from '../domain/types';
import { syncReminders } from '../services/reminders';
import { loadData, saveData, wipeData } from './vault';

interface Store {
  ready: boolean;
  data: AppData;
  prediction: Prediction;
  ref: ISODate;
  logDay: (date: ISODate, patch: Partial<DayLog>) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  replaceAll: (data: AppData) => void;
  wipe: () => Promise<void>;
}

const StoreContext = createContext<Store | null>(null);

function clean(log: DayLog): DayLog | undefined {
  const entries = Object.entries(log).filter(([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0));
  return entries.length ? (Object.fromEntries(entries) as DayLog) : undefined;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(DEFAULT_DATA);
  const [ready, setReady] = useState(false);
  const ref = today();
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    loadData()
      .then(setData)
      .catch((e) => console.warn(e))
      .finally(() => setReady(true));
  }, []);

  const prediction = useMemo(() => predict(data, ref), [data, ref]);

  // Debounced persistence + reminder rescheduling after every change.
  const commit = useCallback((next: AppData) => {
    setData(next);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveData(next).catch((e) => console.warn(e));
      syncReminders(next, predict(next, today())).catch((e) => console.warn(e));
    }, 400);
  }, []);

  const value = useMemo<Store>(
    () => ({
      ready,
      data,
      prediction,
      ref,
      logDay: (date, patch) => {
        const merged = clean({ ...data.days[date], ...patch });
        const days = { ...data.days };
        if (merged) days[date] = merged;
        else delete days[date];
        commit({ ...data, days });
      },
      updateSettings: (patch) => commit({ ...data, settings: { ...data.settings, ...patch } }),
      replaceAll: commit,
      wipe: async () => {
        await wipeData();
        setData(DEFAULT_DATA);
      },
    }),
    [ready, data, prediction, ref, commit],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}
