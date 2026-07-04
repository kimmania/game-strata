import type { GameState, LevelData, Tube, ActionResult } from './types';

export function initializeLevel(data: LevelData): GameState {
  const tubes = data.tubes.map((t) => ({ layers: [...t.layers] }));
  const state: GameState = {
    levelId: data.id,
    site: data.site,
    tubes,
    height: data.height,
    tampCharges: data.tampCharges,
    maxTampCharges: data.tampCharges,
    moves: 0,
    history: [],
    selectedTube: null,
    won: false,
    targetMoves: data.targetMoves,
  };
  // Record initial state for reset
  state.history.push({
    tubes: tubes.map((t) => ({ layers: [...t.layers] })),
    tampCharges: data.tampCharges,
    moves: 0,
  });
  return state;
}

function cloneTubes(tubes: Tube[]): Tube[] {
  return tubes.map((t) => ({ layers: [...t.layers] }));
}

export function canPour(state: GameState, from: number, to: number): boolean {
  if (from === to) return false;
  const src = state.tubes[from];
  const dst = state.tubes[to];
  if (src.layers.length === 0) return false;
  if (dst.layers.length >= state.height) return false;
  const color = src.layers[src.layers.length - 1];
  if (dst.layers.length === 0) return true;
  return dst.layers[dst.layers.length - 1] === color;
}

export function pour(state: GameState, from: number, to: number): ActionResult {
  if (state.won) return { success: false, message: 'Level already solved.' };
  if (!canPour(state, from, to)) return { success: false, message: 'Invalid move.' };

  pushHistory(state);

  const src = state.tubes[from];
  const dst = state.tubes[to];
  const color = src.layers[src.layers.length - 1];

  // Count contiguous top layers of same color in source
  let count = 0;
  for (let i = src.layers.length - 1; i >= 0 && src.layers[i] === color; i--) {
    count++;
  }

  // Determine how many can fit in destination
  const space = state.height - dst.layers.length;
  const transfer = Math.min(count, space);

  // Move from source to destination
  const moving = src.layers.splice(src.layers.length - transfer, transfer);
  dst.layers.push(...moving);

  state.moves++;
  return { success: true };
}

export function canTamp(state: GameState, tubeIdx: number): boolean {
  if (state.tampCharges <= 0) return false;
  const tube = state.tubes[tubeIdx];
  if (tube.layers.length === 0) return false;

  // Find bottom contiguous block
  const bottomColor = tube.layers[0];
  let blockLen = 1;
  while (blockLen < tube.layers.length && tube.layers[blockLen] === bottomColor) {
    blockLen++;
  }

  // Must be >= 2 layers to tamp
  return blockLen >= 2;
}

export function tamp(state: GameState, tubeIdx: number): ActionResult {
  if (state.won) return { success: false, message: 'Level already solved.' };
  if (!canTamp(state, tubeIdx)) return { success: false, message: 'Cannot tamp this core.' };

  pushHistory(state);

  const tube = state.tubes[tubeIdx];
  const bottomColor = tube.layers[0];
  let blockLen = 1;
  while (blockLen < tube.layers.length && tube.layers[blockLen] === bottomColor) {
    blockLen++;
  }

  // Compress bottom block into single layer
  tube.layers.splice(0, blockLen, bottomColor);

  state.tampCharges--;
  state.moves++;
  return { success: true };
}

export function canUndo(state: GameState): boolean {
  return state.history.length > 1;
}

export function undo(state: GameState): ActionResult {
  if (!canUndo(state)) return { success: false, message: 'Nothing to undo.' };
  const entry = state.history.pop()!;
  state.tubes = entry.tubes.map((t) => ({ layers: [...t.layers] }));
  state.tampCharges = entry.tampCharges;
  state.moves = entry.moves;
  state.selectedTube = null;
  state.won = false;
  return { success: true };
}

export function resetLevel(state: GameState): ActionResult {
  if (state.history.length === 0) return { success: false };
  const initial = state.history[0];
  state.tubes = initial.tubes.map((t) => ({ layers: [...t.layers] }));
  state.tampCharges = initial.tampCharges;
  state.moves = 0;
  state.history = [{
    tubes: initial.tubes.map((t) => ({ layers: [...t.layers] })),
    tampCharges: initial.tampCharges,
    moves: 0,
  }];
  state.selectedTube = null;
  state.won = false;
  return { success: true };
}

export function checkWin(state: GameState): boolean {
  for (const tube of state.tubes) {
    if (tube.layers.length === 0) continue;
    const first = tube.layers[0];
    if (!tube.layers.every((c) => c === first)) return false;
  }
  return true;
}

export function computeStars(state: GameState): number {
  const withinTarget = state.moves <= state.targetMoves;
  const savedTamp = state.tampCharges > 0;
  if (withinTarget && savedTamp) return 3;
  if (withinTarget) return 2;
  return 1;
}

function pushHistory(state: GameState) {
  state.history.push({
    tubes: cloneTubes(state.tubes),
    tampCharges: state.tampCharges,
    moves: state.moves,
  });
}
