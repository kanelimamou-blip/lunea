import type { Phase } from './domain/cycle';

export const colors = {
  bg: '#FFF7F8',
  card: '#FFFFFF',
  text: '#2B1B2E',
  muted: '#8A7A8C',
  border: '#F3E3E7',
  primary: '#E2556F',
  primarySoft: '#FDE3E8',
  period: '#F25C78',
  periodPredicted: '#FBC3CE',
  fertile: '#3FB7B0',
  fertileSoft: '#D6F2EF',
  ovulation: '#1E8F89',
  luteal: '#B79CE0',
  follicular: '#F7B267',
  plum: '#5B2A5E',
  white: '#FFFFFF',
  warning: '#FFF1F3',
};

export const phaseColor: Record<Phase, string> = {
  menstrual: colors.period,
  follicular: colors.follicular,
  fertile: colors.fertile,
  ovulation: colors.ovulation,
  luteal: colors.luteal,
};

export const radius = { sm: 10, md: 16, lg: 24, pill: 999 };
export const space = (n: number) => n * 4;
