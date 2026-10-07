export type FuzzyColor =
  | 'purple'
  | 'blue'
  | 'yellow'
  | 'green'
  | 'pink'
  | 'red'
  | 'orange'
  | 'brown';

export type SpecialType =
  | 'none'
  | 'rainbow'
  | 'bomb'
  | 'lightning'
  | 'ice'
  | 'wild'
  | 'chameleon';

export type FuzzyExpression =
  | 'idle'
  | 'aiming'
  | 'popping'
  | 'falling'
  | 'surprised'
  | 'dizzy';

export interface FuzzyBall {
  id: string;
  row: number;
  col: number;
  color: FuzzyColor;
  special: SpecialType;
  iceHitsRemaining?: number; // For ice fuzzies (starts at 2)
  scale: number; // For spawn/squash animation
  alpha: number;
  rotation: number;
  blinkTimer: number;
  isBlinking: boolean;
  eyeOffset: { x: number; y: number };
  expression: FuzzyExpression;
  seed?: number;
  lookTimer?: number;
  wiggleTimer?: number;
  scaleX?: number;
  scaleY?: number;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: FuzzyColor;
  special: SpecialType;
  expression: FuzzyExpression;
  rotation: number;
  trail: { x: number; y: number; alpha: number }[];
  flightTime?: number;
}

export interface FallingFuzzy {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: FuzzyColor;
  special: SpecialType;
  rotation: number;
  vRot: number;
  alpha: number;
  bounceCount: number;
}

export interface PopParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape: 'fur' | 'sparkle' | 'circle';
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
  life: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  colors: FuzzyColor[];
  targetPops: number; // e.g. 15
  shotsLimit: number; // e.g. 25
  starThresholds: [number, number, number]; // [1 star, 2 stars, 3 stars]
  layout: (FuzzyColor | SpecialType | null)[][]; // 8 or 7 cols per row
  description?: string;
}

export type GameOverReason = 'launcher_hit' | 'out_of_shots';

export type Language = 'tr' | 'en';

export interface UserProgress {
  unlockedLevel: number;
  levels: {
    [levelId: number]: {
      completed: boolean;
      stars: number;
      highScore: number;
    };
  };
  settings: {
    sound: boolean;
    music: boolean;
    aimAssist: boolean;
    language: Language;
  };
}

export const COLOR_CONFIG: Record<
  FuzzyColor,
  {
    main: string;
    dark: string;
    light: string;
    eyeColor: string;
    furFringe: string;
    name: string;
    emoji: string;
  }
> = {
  purple: {
    main: '#A855F7',
    dark: '#7E22CE',
    light: '#E9D5FF',
    eyeColor: '#3B0764',
    furFringe: '#C084FC',
    name: 'Purple',
    emoji: '🟣',
  },
  blue: {
    main: '#38BDF8',
    dark: '#0284C7',
    light: '#BAE6FD',
    eyeColor: '#082F49',
    furFringe: '#7DD3FC',
    name: 'Blue',
    emoji: '🔵',
  },
  yellow: {
    main: '#FACC15',
    dark: '#CA8A04',
    light: '#FEF08A',
    eyeColor: '#713F12',
    furFringe: '#FDE047',
    name: 'Yellow',
    emoji: '🟡',
  },
  green: {
    main: '#4ADE80',
    dark: '#16A34A',
    light: '#BBF7D0',
    eyeColor: '#052E16',
    furFringe: '#86EFAC',
    name: 'Green',
    emoji: '🟢',
  },
  pink: {
    main: '#F472B6',
    dark: '#DB2777',
    light: '#FCE7F3',
    eyeColor: '#500724',
    furFringe: '#F9A8D4',
    name: 'Pink',
    emoji: '🩷',
  },
  red: {
    main: '#F87171',
    dark: '#DC2626',
    light: '#FECACA',
    eyeColor: '#450A0A',
    furFringe: '#FCA5A5',
    name: 'Red',
    emoji: '🔴',
  },
  orange: {
    main: '#FB923C',
    dark: '#EA580C',
    light: '#FED7AA',
    eyeColor: '#431407',
    furFringe: '#FDBA74',
    name: 'Orange',
    emoji: '🟠',
  },
  brown: {
    main: '#B45309',
    dark: '#78350F',
    light: '#FDE68A',
    eyeColor: '#451A03',
    furFringe: '#D97706',
    name: 'Brown',
    emoji: '🤎',
  },
};
