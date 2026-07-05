import {
  initializeLevel,
  pour,
  canTamp,
  tamp,
  undo,
  resetLevel,
  checkWin,
  computeStars,
} from './engine/game-logic';
import { loadSave, saveSave, getDefaultSave, completeLevel, clearSave, patchSettings } from './engine/storage';
import { COLOR_CSS, COLOR_NAMES, SITES, SITE_ORDER } from './engine/constants';
import type { SaveData, LevelData, GameState } from './engine/types';
import { play, refreshSettings, listenForAudioUnlock } from './engine/audio';

import levelBank from './engine/puzzles.json';

const SAVE_DEBOUNCE = 500;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

let state: GameState | null = null;
let saveData: SaveData = getDefaultSave();
let currentLevelId: string | null = null;
let helpReturnToIntro = false;

const els = {
  introScreen: () => document.getElementById('intro-screen')!,
  mapScreen: () => document.getElementById('map-screen')!,
  mapContainer: () => document.getElementById('map-container')!,
  mapSettings: () => document.getElementById('map-settings') as HTMLButtonElement,
  mapHelp: () => document.getElementById('map-help') as HTMLButtonElement,
  gameScreen: () => document.getElementById('game-screen')!,
  startGame: () => document.getElementById('start-game')!,
  tubeRack: () => document.getElementById('tube-rack')!,
  tampBtn: () => document.getElementById('tamp-btn') as HTMLButtonElement,
  tampCount: () => document.getElementById('tamp-count')!,
  undoBtn: () => document.getElementById('undo-btn') as HTMLButtonElement,
  resetBtn: () => document.getElementById('reset-btn') as HTMLButtonElement,
  mapReturn: () => document.getElementById('map-return') as HTMLButtonElement,
  levelLabel: () => document.getElementById('level-label')!,
  levelNumber: () => document.getElementById('level-number')!,
  moveCount: () => document.getElementById('move-count')!,
  targetMoves: () => document.getElementById('target-moves')!,
  settingsBtn: () => document.getElementById('settings-btn') as HTMLButtonElement,
  helpBtn: () => document.getElementById('help-btn') as HTMLButtonElement,
  helpOverlay: () => document.getElementById('help-overlay')!,
  helpClose: () => document.getElementById('help-close')!,
  helpDismiss: () => document.getElementById('help-dismiss')!,
  settingsOverlay: () => document.getElementById('settings-overlay')!,
  settingsClose: () => document.getElementById('settings-close')!,
  soundToggle: () => document.getElementById('sound-toggle') as HTMLButtonElement,
  motionToggle: () => document.getElementById('motion-toggle') as HTMLButtonElement,
  contrastToggle: () => document.getElementById('contrast-toggle') as HTMLButtonElement,
  resetProgressBtn: () => document.getElementById('reset-progress-btn')!,
  resetConfirmBtn: () => document.getElementById('reset-confirm-btn')!,
  levelCompleteOverlay: () => document.getElementById('level-complete-overlay')!,
  lcStars: () => document.getElementById('lc-stars')!,
  lcMoves: () => document.querySelector('#lc-moves .value')!,
  lcTarget: () => document.querySelector('#lc-target .value')!,
  lcBest: () => document.querySelector('#lc-best .value')!,
  lcMessage: () => document.getElementById('lc-message')!,
  lcNext: () => document.getElementById('lc-next') as HTMLButtonElement,
  lcRetry: () => document.getElementById('lc-retry') as HTMLButtonElement,
  lcMap: () => document.getElementById('lc-map') as HTMLButtonElement,
  resetOverlay: () => document.getElementById('reset-overlay')!,
  resetCancel: () => document.getElementById('reset-cancel')!,
  resetConfirm: () => document.getElementById('reset-confirm')!,
  announcer: () => document.getElementById('aria-announcer')!,
};

function getLevels(): LevelData[] {
  return levelBank as unknown as LevelData[];
}

function getLevelById(id: string): LevelData | null {
  return getLevels().find((l) => l.id === id) ?? null;
}

function showScreen(name: string) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.getElementById(`${name}-screen`)?.classList.add('active');
}

function announce(msg: string) {
  const el = els.announcer();
  el.textContent = msg;
  setTimeout(() => { el.textContent = ''; }, 1000);
}

function debouncedSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveSave(saveData), SAVE_DEBOUNCE);
}

/* ─── Intro ─── */
function initIntro() {
  els.startGame().addEventListener('click', () => {
    play('click');
    saveData.hasSeenIntro = true;
    debouncedSave();
    if (!saveData.hasSeenHelp) {
      helpReturnToIntro = true;
      showHelp();
    } else {
      showMap();
    }
  });
}

/* ─── Map ─── */
function showMap() {
  showScreen('map');
  renderMap();
}

function renderMap() {
  const container = els.mapContainer();
  container.innerHTML = '';
  const levels = getLevels();
  const bySite: Record<string, LevelData[]> = {};
  for (const lvl of levels) {
    bySite[lvl.site] = bySite[lvl.site] ?? [];
    bySite[lvl.site].push(lvl);
  }

  for (const siteKey of SITE_ORDER) {
    const siteLevels = bySite[siteKey];
    if (!siteLevels || siteLevels.length === 0) continue;
    const siteInfo = SITES[siteKey] ?? { name: siteKey, bgGradient: '' };

    const region = document.createElement('section');
    region.className = 'map-region';
    region.dataset.site = siteKey;

    const heading = document.createElement('h2');
    heading.className = 'region-heading';
    heading.textContent = siteInfo.name;
    region.appendChild(heading);

    const nodesWrap = document.createElement('div');
    nodesWrap.className = 'region-nodes';

    for (const lvl of siteLevels) {
      const completed = saveData.progress.completed[lvl.id] ?? 0;
      const unlocked = saveData.progress.unlocked.includes(lvl.id);
      const node = document.createElement('button');
      node.className = 'map-node';
      node.dataset.level = lvl.id;
      if (completed > 0) {
        node.classList.add('completed');
        node.setAttribute('aria-label', `Level ${lvl.id}: ${completed} stars`);
      } else if (unlocked) {
        node.classList.add('unlocked');
        node.setAttribute('aria-label', `Level ${lvl.id}: unlocked`);
      } else {
        node.classList.add('locked');
        node.disabled = true;
        node.setAttribute('aria-label', `Level ${lvl.id}: locked`);
      }
      node.textContent = lvl.id.toUpperCase();

      const stars = document.createElement('div');
      stars.className = 'node-stars';
      stars.textContent = '⭐'.repeat(completed);
      node.appendChild(stars);

      node.addEventListener('click', () => {
        play('click');
        startLevel(lvl.id);
      });
      nodesWrap.appendChild(node);
    }

    region.appendChild(nodesWrap);
    container.appendChild(region);
  }
}

/* ─── Level start ─── */
function startLevel(id: string) {
  const lvl = getLevelById(id);
  if (!lvl) return;
  currentLevelId = id;
  saveData.currentLevel = id;
  debouncedSave();

  state = initializeLevel(lvl);
  showScreen('game');

  // Apply site-specific background gradient if defined
  const gameScreen = els.gameScreen();
  const siteInfo = SITES[lvl.site];
  if (siteInfo?.bgGradient) {
    gameScreen.style.background = siteInfo.bgGradient;
  } else {
    gameScreen.style.background = '';
  }

  updateGameUI();
  renderTubes();
  announce(`Level ${id}. Tube height ${lvl.height}. Tamp charges: ${lvl.tampCharges}.`);
}

/* ─── Tube Rendering ─── */
function renderTubes() {
  if (!state) return;
  const rack = els.tubeRack();
  rack.innerHTML = '';

  state.tubes.forEach((tube, idx) => {
    const tubeEl = document.createElement('div');
    tubeEl.className = 'tube';
    tubeEl.dataset.index = String(idx);
    if (state!.selectedTube === idx) tubeEl.classList.add('selected');
    if (!state!.won) {
      tubeEl.addEventListener('click', () => handleTubeClick(idx));
      tubeEl.addEventListener('touchstart', (e) => { e.preventDefault(); handleTubeClick(idx); }, { passive: false });
    }

    // Tube interior
    const inner = document.createElement('div');
    inner.className = 'tube-inner';
    const layersEl = document.createElement('div');
    layersEl.className = 'tube-layers';

    // Bottom to top
    for (let i = 0; i < state!.height; i++) {
      const layer = document.createElement('div');
      layer.className = 'layer';
      if (i < tube.layers.length) {
        const color = tube.layers[i];
        layer.style.backgroundColor = COLOR_CSS[color];
        layer.style.borderColor = COLOR_CSS[color];
        layer.title = COLOR_NAMES[color];
      } else {
        layer.classList.add('empty');
      }
      layersEl.appendChild(layer);
    }

    inner.appendChild(layersEl);
    tubeEl.appendChild(inner);
    rack.appendChild(tubeEl);
  });
}

function handleTubeClick(idx: number) {
  if (!state || state.won) return;
  play('click');

  if (state.selectedTube === null) {
    // Select source
    if (state.tubes[idx].layers.length === 0) {
      play('invalid');
      announce('Empty tube. Choose a tube with sediment.');
      return;
    }
    state.selectedTube = idx;
    renderTubes();
    updateTampButton();
  } else if (state.selectedTube === idx) {
    // Deselect
    state.selectedTube = null;
    renderTubes();
    updateTampButton();
  } else {
    // Attempt pour
    const result = pour(state, state.selectedTube, idx);
    if (result.success) {
      play('pour');
      state.selectedTube = null;
      afterMove();
    } else {
      play('invalid');
      announce(result.message ?? 'Invalid move.');
      // Wobble animation?
      const rack = els.tubeRack();
      const el = rack.children[idx] as HTMLElement;
      if (el) {
        el.classList.add('wobble');
        setTimeout(() => el.classList.remove('wobble'), 300);
      }
    }
  }
}

function afterMove() {
  if (!state) return;
  updateGameUI();
  renderTubes();
  if (checkWin(state)) {
    state.won = true;
    const stars = computeStars(state);
    const best = saveData.progress.bestMoves[state.levelId];
    debouncedSave();
    setTimeout(() => showLevelComplete(stars, best), 400);
  }
}

function updateGameUI() {
  if (!state) return;
  els.moveCount().textContent = String(state.moves);
  els.targetMoves().textContent = `/ ${state.targetMoves}`;
  els.levelNumber().textContent = state.levelId.toUpperCase();
  els.levelLabel().textContent = 'Core Sample';
  updateTampButton();
}

function updateTampButton() {
  if (!state) return;
  const btn = els.tampBtn();
  const count = els.tampCount();
  count.textContent = String(state.tampCharges);
  if (state.selectedTube !== null && canTamp(state, state.selectedTube)) {
    btn.disabled = false;
    btn.classList.add('active');
  } else {
    btn.disabled = true;
    btn.classList.remove('active');
  }
}

/* ─── Tamp ─── */
function handleTamp() {
  if (!state || state.won || state.selectedTube === null) return;
  const result = tamp(state, state.selectedTube);
  if (result.success) {
    play('tamp');
    state.selectedTube = null;
    afterMove();
  } else {
    play('invalid');
    announce(result.message ?? 'Cannot tamp this core.');
  }
}

/* ─── Undo ─── */
function handleUndo() {
  if (!state) return;
  const result = undo(state);
  if (result.success) {
    play('undo');
    state.selectedTube = null;
    updateGameUI();
    renderTubes();
  }
}

/* ─── Reset ─── */
function handleReset() {
  if (!state) return;
  play('click');
  els.resetOverlay().classList.add('active');
}

function confirmReset() {
  if (!state) return;
  play('reset');
  resetLevel(state);
  state.selectedTube = null;
  updateGameUI();
  renderTubes();
  els.resetOverlay().classList.remove('active');
}

/* ─── Level Complete ─── */
function showLevelComplete(stars: number, best: number | undefined) {
  play('win');
  saveData = completeLevel(saveData, state!.levelId, stars, state!.moves);
  debouncedSave();

  const overlay = els.levelCompleteOverlay();
  overlay.classList.add('active');

  els.lcStars().querySelectorAll('.star').forEach((s, i) => {
    s.classList.toggle('earned', i < stars);
  });
  els.lcMoves().textContent = String(state!.moves);
  els.lcTarget().textContent = String(state!.targetMoves);
  els.lcBest().textContent = String(best ?? state!.moves);

  const messages = [
    'The core needs more work.',
    'Acceptable sampling.',
    'Excellent — target met!',
    'Pristine work, scientist! Target met with charges to spare.',
  ];
  els.lcMessage().textContent = messages[stars] ?? messages[1];
}

function hideLevelComplete() {
  els.levelCompleteOverlay().classList.remove('active');
}

/* ─── Help ─── */
function showHelp() {
  els.helpOverlay().classList.add('active');
}

function hideHelp() {
  els.helpOverlay().classList.remove('active');
  if (!saveData.hasSeenHelp) {
    saveData.hasSeenHelp = true;
    debouncedSave();
    if (helpReturnToIntro) {
      helpReturnToIntro = false;
      showMap();
      return;
    }
  }
}

/* ─── Settings ─── */
function showSettings() {
  refreshSettings();
  const s = saveData.settings;
  updateToggle(els.soundToggle(), s.sound);
  updateToggle(els.motionToggle(), s.reducedMotion);
  updateToggle(els.contrastToggle(), s.highContrast);
  els.settingsOverlay().classList.add('active');
}

function hideSettings() {
  els.settingsOverlay().classList.remove('active');
}

function toggleSetting(key: keyof typeof saveData.settings, btn: HTMLButtonElement) {
  const current = saveData.settings[key];
  saveData = patchSettings(saveData, { [key]: !current });
  updateToggle(btn, !current as boolean);
  debouncedSave();
  refreshSettings();
}

function updateToggle(btn: HTMLButtonElement, on: boolean) {
  btn.setAttribute('aria-checked', String(on));
  btn.querySelector('.toggle-label')!.textContent = on ? 'On' : 'Off';
}

/* ─── Progress Reset ─── */
let resetConfirm = false;
function handleResetProgress() {
  if (!resetConfirm) {
    resetConfirm = true;
    els.resetConfirmBtn().classList.remove('hidden');
    return;
  }
  clearSave();
  saveData = getDefaultSave();
  debouncedSave();
  els.resetConfirmBtn().classList.add('hidden');
  resetConfirm = false;
  hideSettings();
  showMap();
}

/* ─── Event wiring ─── */
function wireEvents() {
  els.mapSettings().addEventListener('click', () => { play('click'); showSettings(); });
  els.mapHelp().addEventListener('click', () => { play('click'); showHelp(); });
  els.mapReturn().addEventListener('click', () => { play('click'); showMap(); });
  els.settingsBtn().addEventListener('click', () => { play('click'); showSettings(); });
  els.helpBtn().addEventListener('click', () => { play('click'); showHelp(); });
  els.undoBtn().addEventListener('click', handleUndo);
  els.resetBtn().addEventListener('click', handleReset);
  els.tampBtn().addEventListener('click', handleTamp);

  els.helpClose().addEventListener('click', hideHelp);
  els.helpDismiss().addEventListener('click', hideHelp);
  els.settingsClose().addEventListener('click', hideSettings);

  els.soundToggle().addEventListener('click', () => toggleSetting('sound', els.soundToggle()));
  els.motionToggle().addEventListener('click', () => toggleSetting('reducedMotion', els.motionToggle()));
  els.contrastToggle().addEventListener('click', () => toggleSetting('highContrast', els.contrastToggle()));

  els.resetProgressBtn().addEventListener('click', handleResetProgress);
  els.resetConfirmBtn().addEventListener('click', handleResetProgress);

  els.lcNext().addEventListener('click', () => {
    play('click');
    hideLevelComplete();
    const nextId = deriveNextLevelId(currentLevelId!);
    if (nextId && getLevelById(nextId)) startLevel(nextId);
    else showMap();
  });
  els.lcRetry().addEventListener('click', () => {
    play('click');
    hideLevelComplete();
    startLevel(currentLevelId!);
  });
  els.lcMap().addEventListener('click', () => {
    play('click');
    hideLevelComplete();
    showMap();
  });

  els.resetCancel().addEventListener('click', () => {
    play('click');
    els.resetOverlay().classList.remove('active');
  });
  els.resetConfirm().addEventListener('click', confirmReset);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (!state || state.won) return;
    if (e.key === 'u' || e.key === 'U') handleUndo();
    if (e.key === 'r' || e.key === 'R') handleReset();
  });
}

function deriveNextLevelId(current: string): string | null {
  const m = current.match(/^([a-z]+)(\d+)$/i);
  if (!m) return null;
  const prefix = m[1];
  const num = parseInt(m[2], 10);
  return `${prefix}${String(num + 1).padStart(2, '0')}`;
}

/* ─── Init ─── */
export function initApp() {
  listenForAudioUnlock();
  saveData = loadSave();

  initIntro();
  wireEvents();

  if (saveData.hasSeenIntro) {
    if (saveData.currentLevel && getLevelById(saveData.currentLevel)) {
      startLevel(saveData.currentLevel);
    } else {
      showMap();
      if (!saveData.hasSeenHelp) showHelp();
    }
  } else {
    showScreen('intro');
  }
}
