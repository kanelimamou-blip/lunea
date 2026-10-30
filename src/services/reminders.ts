import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { addDays, parseISO, type ISODate } from '../domain/dates';
import type { Prediction } from '../domain/cycle';
import type { AppData } from '../domain/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

export async function requestPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', { name: 'Rappels', importance: Notifications.AndroidImportance.DEFAULT });
  }
  const { granted } = await Notifications.requestPermissionsAsync();
  return granted;
}

function at(date: ISODate, time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const d = parseISO(date);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), h, m);
}

/**
 * Rebuilds every scheduled reminder from the current prediction. Everything is
 * computed and scheduled on-device: no push server ever learns about the cycle.
 */
export async function syncReminders(data: AppData, p: Prediction): Promise<void> {
  if (Platform.OS === 'web') return;
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;
  await Notifications.cancelAllScheduledNotificationsAsync();

  const r = data.settings.reminders;
  const pregnant = data.settings.goal === 'pregnant';
  const neutral = { title: 'Lunéa', body: 'Un petit rappel vous attend.' };
  const [hour, minute] = r.time.split(':').map(Number);
  const now = new Date();

  const once = async (date: ISODate, title: string, body: string) => {
    const when = at(date, r.time);
    if (when <= now) return;
    await Notifications.scheduleNotificationAsync({
      content: r.discreet ? neutral : { title, body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId: 'reminders' },
    });
  };

  if (!pregnant && r.periodSoon) {
    await once(addDays(p.nextPeriodStart, -2), 'Règles dans 2 jours', 'Pensez à prévoir vos protections.');
    await once(p.nextPeriodStart, 'Vos règles sont prévues aujourd’hui', 'Notez-les dès qu’elles arrivent pour affiner les prédictions.');
  }
  if (!pregnant && r.fertileWindow) {
    await once(p.fertileStart, 'Début de la fenêtre de fertilité', 'Vos chances de conception augmentent pendant les 6 prochains jours.');
  }
  if (!pregnant && r.ovulation) {
    await once(addDays(p.ovulation, -1), 'Ovulation prévue demain', 'C’est le moment idéal pour un test d’ovulation.');
  }
  if (r.dailyLog) {
    await Notifications.scheduleNotificationAsync({
      content: r.discreet ? neutral : { title: 'Comment vous sentez-vous ?', body: 'Prenez 10 secondes pour noter votre journée.' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: 'reminders' },
    });
  }
  if (r.pill) {
    await Notifications.scheduleNotificationAsync({
      content: r.discreet ? neutral : { title: 'Pilule', body: 'C’est l’heure de prendre votre pilule.' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: 'reminders' },
    });
  }
}

