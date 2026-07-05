import type { SaveData, Settings } from './types';
import { SAVE_KEY, SAVE_VERSION } from './constants';
import type { LevelData } from './types';

// compatibility: previous builds used catalyst-save. Migrate if present.
const LEGACY_SAVE_KEY = 'catalyst-save';

let levelBankForUnlock: LevelData[] | null = null;

export function setLevelBankForUnlock(bank: LevelData[]) {
  levelBankForUnlock = bank;
}

function levelExists(id: string): boolean {
  if (!levelBankForUnlock) return true;
  return levelBankForUnlock.some((l) => l.id === id);
}

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
      showNames: false,
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

  // If a player completed the final level of a site before cross-site unlock was implemented,
  // unlock the first level of the following site.
  const lastBySite: Record<string, string> = { a: 'a40', d: 'd40', s: 's40', v: 'v40' };
  const prefixes = ['a', 'd', 's', 'v', 'm'];
  const completed = Object.keys(old.progress?.completed ?? {});
  for (const id of completed) {
    const prefix = id[0];
    if (id !== lastBySite[prefix]) continue;
    const idx = prefixes.indexOf(prefix);
    if (idx >= 0 && idx < prefixes.length - 1) {
      unlocked.add(`${prefixes[idx + 1]}01`);
    }
  }

  fresh.currentLevel = old.currentLevel ?? null;

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
  if (nextId && levelExists(nextId)) {
    unlocked.add(nextId);
  } else {
    // Finished the last level of a site; unlock the first level of the next site.
    const nextSitePrefix = deriveNextSitePrefix(levelId);
    if (nextSitePrefix) unlocked.add(`${nextSitePrefix}01`);
  }

  return {
    ...data,
    progress: { completed, bestMoves, unlocked: Array.from(unlocked) },
  };
}

function deriveNextSitePrefix(current: string): string | null {
  const lastBySite: Record<string, string> = {
    a: 'a40',
    d: 'd40',
    s: 's40',
    v: 'v40',
  };
  const order = ['a', 'd', 's', 'v', 'm'];
  const prefix = current[0];
  if (!lastBySite[prefix] || current !== lastBySite[prefix]) return null;
  const idx = order.indexOf(prefix);
  if (idx >= 0 && idx < order.length - 1) return order[idx + 1];
  return null;
}

function deriveNextLevelId(current: string): string | null {
  const m = current.match(/^([a-z]+)(\d+)$/i);
  if (!m) return null;
  const prefix = m[1];
  const num = parseInt(m[2], 10);
  return `${prefix}${String(num + 1).padStart(2, '0')}`;
}
