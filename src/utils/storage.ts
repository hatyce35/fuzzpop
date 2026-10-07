import { UserProgress } from '../types/game';

const STORAGE_KEY = 'fuzzpop_v1_save_data';

const DEFAULT_PROGRESS: UserProgress = {
  unlockedLevel: 1,
  levels: {},
  settings: {
    sound: true,
    music: true,
    aimAssist: true,
    language: 'tr',
  },
};

export function loadUserProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as UserProgress;
    return {
      unlockedLevel: Math.max(1, parsed.unlockedLevel || 1),
      levels: parsed.levels || {},
      settings: {
        sound: parsed.settings?.sound ?? true,
        music: parsed.settings?.music ?? true,
        aimAssist: parsed.settings?.aimAssist ?? true,
        language: parsed.settings?.language ?? 'tr',
      },
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveUserProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function recordLevelSuccess(
  levelId: number,
  score: number,
  stars: number
): UserProgress {
  const current = loadUserProgress();
  const existing = current.levels[levelId] || { completed: false, stars: 0, highScore: 0 };

  current.levels[levelId] = {
    completed: true,
    stars: Math.max(existing.stars, stars),
    highScore: Math.max(existing.highScore, score),
  };

  // Unlock next level up to 30
  if (levelId >= current.unlockedLevel && levelId < 30) {
    current.unlockedLevel = levelId + 1;
  }

  saveUserProgress(current);
  return current;
}

export function unlockLevel(levelId: number): UserProgress {
  const current = loadUserProgress();
  if (levelId > 1) {
    const prev = levelId - 1;
    const existing = current.levels[prev] || { completed: true, stars: 1, highScore: 1200 };
    current.levels[prev] = {
      completed: true,
      stars: Math.max(existing.stars, 1),
      highScore: Math.max(existing.highScore, 1200),
    };
  }
  if (levelId > current.unlockedLevel && levelId <= 30) {
    current.unlockedLevel = levelId;
  }
  saveUserProgress(current);
  return current;
}

export function resetAllProgress(): UserProgress {
  const fresh: UserProgress = {
    unlockedLevel: 1,
    levels: {},
    settings: {
      sound: true,
      music: true,
      aimAssist: true,
      language: 'tr',
    },
  };
  saveUserProgress(fresh);
  return fresh;
}
