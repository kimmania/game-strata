import type { SaveData, Settings } from './types';
import { SAVE_KEY, SAVE_VERSION } from './constants';

// compatibility: previous builds used catalyst-save. Migrate if present.
const LEGACY_SAVE_KEY = 'catalyst-save';

export function getDefaultSave(): SaveData {
  return {
    version: SAVE_VERSION,
    progress: {
      completed: {},
      bestMoves: {},
      unlocked: ['a01'],
    },
    settings: {
      sound: true,
      reducedMotion: false,
      highContrast: false,
      colorBlind: false,
    },
    hasSeenIntro: false,
    hasSeenHelp: false,
    currentLevel: 'a01',
  };
}

export function loadSave(): SaveData {
  try {
    let raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_SAVE_KEY);
      if (raw) {
        // migrate on first load
        localStorage.setItem(SAVE_KEY, raw);
      }
    }
    if (!raw) return getDefaultSave();
    const data = JSON.parse(raw) as SaveData;
    if (!data || typeof data !== 'object') return getDefaultSave();
    if (data.version !== SAVE_VERSION) {
      return migrateSave(data);
    }
    return { ...getDefaultSave(), ...data };
  } catch {
    return getDefaultSave();
  }
}

export function saveSave(data: SaveData) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

function migrateSave(old: SaveData): SaveData {
  const fresh = getDefaultSave();
  fresh.settings = { ...fresh.settings, ...old.settings };
  fresh.hasSeenIntro = old.hasSeenIntro ?? false;
  fresh.hasSeenHelp = old.hasSeenHelp ?? false;
  fresh.version = SAVE_VERSION;
  const unlocked = new Set([
    ...fresh.progress.unlocked,
    ...Object.keys(old.progress?.completed ?? {}),
    ...(old.progress?.unlocked ?? []),
    ...(old.currentLevel ? [old.currentLevel] : []),
  ]);
  fresh.progress = {
    ...fresh.progress,
    completed: { ...(old.progress?.completed ?? {}) },
    bestMoves: { ...(old.progress?.bestMoves ?? {}) },
    unlocked: Array.from(unlocked),
  };
  return fresh;
}

export function patchSettings(data: SaveData, patch: Partial<Settings>): SaveData {
  return { ...data, settings: { ...data.settings, ...patch } };
}

export function completeLevel(data: SaveData, levelId: string, stars: number, moves: number): SaveData {
  const completed = { ...data.progress.completed };
  const bestMoves = { ...data.progress.bestMoves };
  const prevStars = completed[levelId] ?? 0;
  completed[levelId] = Math.max(prevStars, stars);
  const prevMoves = bestMoves[levelId];
  if (prevMoves === undefined || moves < prevMoves) {
    bestMoves[levelId] = moves;
  }

  const unlocked = new Set(data.progress.unlocked);
  unlocked.add(levelId);

  const nextId = deriveNextLevelId(levelId);
  if (nextId) unlocked.add(nextId);

  return {
    ...data,
    progress: { completed, bestMoves, unlocked: Array.from(unlocked) },
  };
}

function deriveNextLevelId(current: string): string | null {
  const m = current.match(/^([a-z]+)(\d+)$/i);
  if (!m) return null;
  const prefix = m[1];
  const num = parseInt(m[2], 10);
  return `${prefix}${String(num + 1).padStart(2, '0')}`;
}
