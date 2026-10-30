import { addDays, diffDays, type ISODate } from './dates';

export interface PregnancyStatus {
  week: number;
  day: number;
  trimester: 1 | 2 | 3;
  dueDate: ISODate;
  daysLeft: number;
  progress: number;
  size: string;
  tip: string;
}

// Approximate size by week of amenorrhea (from the last period), as is usual in France.
const SIZES: [number, string][] = [
  [4, 'une graine de pavot'], [5, 'une graine de sésame'], [6, 'une lentille'], [7, 'une myrtille'],
  [8, 'une framboise'], [9, 'une cerise'], [10, 'une fraise'], [11, 'une figue'], [12, 'un citron vert'],
  [13, 'une pêche'], [14, 'un citron'], [15, 'une pomme'], [16, 'un avocat'], [17, 'une poire'],
  [18, 'un poivron'], [19, 'une mangue'], [20, 'une banane'], [22, 'une papaye'], [24, 'un épi de maïs'],
  [26, 'une laitue'], [28, 'une aubergine'], [30, 'un chou'], [32, 'une courge'], [34, 'un melon'],
  [36, 'une laitue romaine'], [38, 'un poireau'], [40, 'une petite pastèque'],
];

const TIPS: [number, string][] = [
  [4, "Commencez l'acide folique si ce n'est pas déjà fait, et prenez rendez-vous avec un médecin ou une sage-femme."],
  [8, 'Les nausées sont fréquentes : fractionnez les repas et hydratez-vous régulièrement.'],
  [12, "L'échographie du premier trimestre a lieu en général entre 11 et 13 semaines."],
  [16, 'Une activité physique douce (marche, natation, yoga prénatal) aide à rester en forme.'],
  [20, "Vous pourriez sentir les premiers mouvements du bébé. L'échographie morphologique approche."],
  [24, 'Pensez au dépistage du diabète gestationnel si votre praticien le recommande.'],
  [28, 'Début du troisième trimestre : dormir sur le côté gauche peut être plus confortable.'],
  [32, "C'est le bon moment pour préparer la valise de maternité et le projet de naissance."],
  [36, 'Surveillez les contractions régulières, la perte des eaux ou une baisse des mouvements, et appelez la maternité au moindre doute.'],
  [40, "Terme théorique atteint. Votre équipe de suivi vous dira quand venir si le travail n'a pas commencé."],
];

function lookup<T>(table: [number, T][], week: number): T {
  let value = table[0][1];
  for (const [w, v] of table) if (week >= w) value = v;
  return value;
}

/** `lmp`: first day of the last menstrual period. Term is LMP + 280 days. */
export function pregnancyStatus(lmp: ISODate, ref: ISODate): PregnancyStatus {
  const elapsed = Math.max(0, diffDays(ref, lmp));
  const week = Math.floor(elapsed / 7);
  const dueDate = addDays(lmp, 280);
  return {
    week,
    day: elapsed % 7,
    trimester: week < 14 ? 1 : week < 28 ? 2 : 3,
    dueDate,
    daysLeft: Math.max(0, diffDays(dueDate, ref)),
    progress: Math.min(1, elapsed / 280),
    size: lookup(SIZES, week),
    tip: lookup(TIPS, week),
  };
}

/** Lets someone who knows the due date enter it instead of the LMP. */
export function lmpFromDueDate(due: ISODate): ISODate {
  return addDays(due, -280);
}
