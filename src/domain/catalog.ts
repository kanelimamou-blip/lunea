import type { Flow } from './types';

export interface Option {
  id: string;
  label: string;
  emoji: string;
}

export const FLOWS: (Option & { id: Flow })[] = [
  { id: 'spotting', label: 'Spotting', emoji: '·' },
  { id: 'light', label: 'Léger', emoji: '💧' },
  { id: 'medium', label: 'Moyen', emoji: '💧💧' },
  { id: 'heavy', label: 'Abondant', emoji: '💧💧💧' },
];

export const SYMPTOMS: Option[] = [
  { id: 'cramps', label: 'Crampes', emoji: '⚡' },
  { id: 'headache', label: 'Maux de tête', emoji: '🤕' },
  { id: 'migraine', label: 'Migraine', emoji: '🌩️' },
  { id: 'backache', label: 'Mal de dos', emoji: '🦴' },
  { id: 'tender_breasts', label: 'Seins sensibles', emoji: '💗' },
  { id: 'bloating', label: 'Ballonnements', emoji: '🎈' },
  { id: 'acne', label: 'Acné', emoji: '🔴' },
  { id: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { id: 'nausea', label: 'Nausées', emoji: '🤢' },
  { id: 'cravings', label: 'Fringales', emoji: '🍫' },
  { id: 'insomnia', label: 'Insomnie', emoji: '🌙' },
  { id: 'constipation', label: 'Constipation', emoji: '🚫' },
  { id: 'diarrhea', label: 'Diarrhée', emoji: '💨' },
  { id: 'pelvic_pain', label: 'Douleur pelvienne', emoji: '📍' },
  { id: 'ovulation_pain', label: "Douleur d'ovulation", emoji: '🎯' },
  { id: 'hot_flashes', label: 'Bouffées de chaleur', emoji: '🔥' },
  { id: 'dizziness', label: 'Vertiges', emoji: '💫' },
  { id: 'everything_fine', label: 'Tout va bien', emoji: '👍' },
];

export const MOODS: Option[] = [
  { id: 'calm', label: 'Calme', emoji: '😌' },
  { id: 'happy', label: 'Joyeuse', emoji: '😊' },
  { id: 'energetic', label: 'Énergique', emoji: '⚡' },
  { id: 'playful', label: 'Espiègle', emoji: '😜' },
  { id: 'libido_high', label: 'Libido élevée', emoji: '🔥' },
  { id: 'sensitive', label: 'Sensible', emoji: '🥺' },
  { id: 'irritable', label: 'Irritable', emoji: '😤' },
  { id: 'anxious', label: 'Anxieuse', emoji: '😰' },
  { id: 'sad', label: 'Triste', emoji: '😢' },
  { id: 'mood_swings', label: "Sautes d'humeur", emoji: '🎢' },
  { id: 'unfocused', label: 'Distraite', emoji: '🌀' },
  { id: 'low_energy', label: "Peu d'énergie", emoji: '🪫' },
];

export const DISCHARGES: Option[] = [
  { id: 'none', label: 'Aucune', emoji: '○' },
  { id: 'sticky', label: 'Collante', emoji: '◐' },
  { id: 'creamy', label: 'Crémeuse', emoji: '◑' },
  { id: 'egg_white', label: "Blanc d'œuf", emoji: '◉' },
  { id: 'watery', label: 'Aqueuse', emoji: '◌' },
  { id: 'unusual', label: 'Inhabituelle', emoji: '⚠️' },
];

export const label = (list: Option[], id: string) => list.find((o) => o.id === id)?.label ?? id;
