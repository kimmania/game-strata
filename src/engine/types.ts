import type { TubeColor } from './constants';

export interface Tube {
  layers: TubeColor[]; // bottom to top
}

export interface LevelData {
  id: string;
  site: string;
  siteName: string;
  tubes: Tube[];
  height: number;
  tampCharges: number;
  targetMoves: number;
  colors: number;
}

export interface HistoryEntry {
  tubes: Tube[];
  tampCharges: number;
  moves: number;
}

export interface GameState {
  levelId: string;
  site: string;
  tubes: Tube[];
  height: number;
  tampCharges: number;
  maxTampCharges: number;
  moves: number;
  history: HistoryEntry[];
  selectedTube: number | null;
  won: boolean;
  targetMoves: number;
}

export interface SaveData {
  version: number;
  progress: {
    completed: Record<string, number>; // highest star rating (0-3)
    bestMoves: Record<string, number>;
    unlocked: string[];
  };
  settings: {
    sound: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
    colorBlind: boolean;
    showNames: boolean;
  };
  hasSeenIntro: boolean;
  hasSeenHelp: boolean;
  currentLevel: string | null;
}

export type Settings = SaveData['settings'];

export interface ActionResult {
  success: boolean;
  message?: string;
}
