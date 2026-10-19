import { ElementType, Effectiveness } from '../types/game';

// Effectiveness matrix: attackType -> defenderType -> multiplier
export const TYPE_CHART: Record<ElementType, Partial<Record<ElementType, number>>> = {
  fire: {
    grass: 2.0,
    ice: 2.0,
    fire: 0.5,
    water: 0.5,
    dragon: 0.5,
    ground: 0.8,
  },
  water: {
    fire: 2.0,
    ground: 2.0,
    water: 0.5,
    grass: 0.5,
    dragon: 0.5,
  },
  grass: {
    water: 2.0,
    ground: 2.0,
    fire: 0.5,
    grass: 0.5,
    dragon: 0.5,
  },
  electric: {
    water: 2.0,
    electric: 0.5,
    grass: 0.5,
    dragon: 0.5,
    ground: 0.0, // Ground is immune
  },
  ice: {
    grass: 2.0,
    dragon: 2.0,
    ground: 2.0,
    fire: 0.5,
    water: 0.5,
    ice: 0.5,
  },
  psychic: {
    ground: 1.5,
    dragon: 1.2,
    psychic: 0.5,
    dark: 0.0, // Dark immune or resists
  },
  ground: {
    fire: 2.0,
    electric: 2.0,
    grass: 0.5,
  },
  dark: {
    psychic: 2.0,
    dark: 0.5,
  },
  dragon: {
    dragon: 2.0,
  },
  normal: {
    ground: 0.8,
  },
};

export function getTypeMultiplier(moveType: ElementType, defenderType: ElementType, secondaryType?: ElementType): number {
  const mult1 = TYPE_CHART[moveType]?.[defenderType] ?? 1.0;
  const mult2 = secondaryType ? (TYPE_CHART[moveType]?.[secondaryType] ?? 1.0) : 1.0;
  return mult1 * mult2;
}

export function getEffectivenessCategory(multiplier: number): Effectiveness {
  if (multiplier === 0) return 'immune';
  if (multiplier > 1.2) return 'super_effective';
  if (multiplier < 0.9) return 'not_effective';
  return 'normal';
}

export const ELEMENT_COLORS: Record<ElementType, { bg: string; text: string; border: string; glow: string; accent: string }> = {
  fire: {
    bg: 'bg-orange-950/80',
    text: 'text-amber-400',
    border: 'border-orange-500/60',
    glow: 'rgba(249, 115, 22, 0.45)',
    accent: '#f97316',
  },
  water: {
    bg: 'bg-cyan-950/80',
    text: 'text-cyan-300',
    border: 'border-cyan-500/60',
    glow: 'rgba(6, 182, 212, 0.45)',
    accent: '#06b6d4',
  },
  grass: {
    bg: 'bg-emerald-950/80',
    text: 'text-emerald-300',
    border: 'border-emerald-500/60',
    glow: 'rgba(16, 185, 129, 0.45)',
    accent: '#10b981',
  },
  electric: {
    bg: 'bg-amber-950/80',
    text: 'text-yellow-300',
    border: 'border-yellow-400/60',
    glow: 'rgba(234, 179, 8, 0.45)',
    accent: '#eab308',
  },
  ice: {
    bg: 'bg-sky-950/80',
    text: 'text-sky-200',
    border: 'border-sky-400/60',
    glow: 'rgba(56, 189, 248, 0.45)',
    accent: '#38bdf8',
  },
  psychic: {
    bg: 'bg-fuchsia-950/80',
    text: 'text-fuchsia-300',
    border: 'border-fuchsia-500/60',
    glow: 'rgba(217, 70, 239, 0.45)',
    accent: '#d946ef',
  },
  ground: {
    bg: 'bg-amber-950/80',
    text: 'text-amber-500',
    border: 'border-amber-700/60',
    glow: 'rgba(180, 83, 9, 0.45)',
    accent: '#b45309',
  },
  dark: {
    bg: 'bg-purple-950/80',
    text: 'text-purple-300',
    border: 'border-purple-600/60',
    glow: 'rgba(147, 51, 234, 0.45)',
    accent: '#9333ea',
  },
  dragon: {
    bg: 'bg-indigo-950/80',
    text: 'text-indigo-300',
    border: 'border-indigo-500/60',
    glow: 'rgba(99, 102, 241, 0.45)',
    accent: '#6366f1',
  },
  normal: {
    bg: 'bg-slate-900/80',
    text: 'text-slate-300',
    border: 'border-slate-500/60',
    glow: 'rgba(148, 163, 184, 0.3)',
    accent: '#94a3b8',
  },
};
