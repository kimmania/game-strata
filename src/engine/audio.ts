import { loadSave } from './storage';

export type SoundName = 'pour' | 'tamp' | 'invalid' | 'win' | 'click' | 'undo' | 'reset' | 'unlock';

let audioContext: AudioContext | null = null;
let settings = loadSave().settings;

function ctx(): AudioContext {
  if (!audioContext) {
    try {
      const Ctor =
        window.AudioContext ||
        ((window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      audioContext = new Ctor();
    } catch {
      // unsupported
    }
  }
  return audioContext as AudioContext;
}

export function refreshSettings() {
  settings = loadSave().settings;
}

export function unlockAudio() {
  const c = ctx();
  if (!c) return;
  if (c.state === 'suspended') {
    try {
      void c.resume();
    } catch {
      // ignore
    }
  }
}

let unlockAttached = false;

export function listenForAudioUnlock() {
  if (unlockAttached) return;
  unlockAttached = true;
  const handler = () => {
    unlockAudio();
    if (settings.music && !isMusicPlaying) startMusic();
  };
  document.addEventListener('pointerdown', handler, { once: true });
  document.addEventListener('keydown', handler, { once: true });
  document.addEventListener('touchstart', handler, { once: true });
}

export function play(name: SoundName) {
  unlockAudio();
  if (!settings.sound) return;
  const c = ctx();
  if (!c) return;
  if (c.state !== 'running') {
    requestAnimationFrame(() => {
      if (ctx().state === 'running') scheduleSound(name);
    });
    return;
  }
  scheduleSound(name);
}

function scheduleSound(name: SoundName) {
  switch (name) {
    case 'pour': playPour(); break;
    case 'tamp': playTamp(); break;
    case 'invalid': playInvalid(); break;
    case 'win': playWin(); break;
    case 'click': playClick(); break;
    case 'undo': playUndo(); break;
    case 'reset': playReset(); break;
    case 'unlock': playUnlock(); break;
  }
}

function whiteNoise(duration: number, gainValue: number): AudioBufferSourceNode {
  const c = ctx();
  const len = Math.ceil(c.sampleRate * duration);
  const buffer = c.createBuffer(1, len, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const g = c.createGain();
  g.gain.setValueAtTime(gainValue, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  src.connect(g).connect(c.destination);
  return src;
}

function playPour() {
  const c = ctx();
  const len = Math.ceil(c.sampleRate * 0.3);
  const buffer = c.createBuffer(1, len, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / len) * 0.7;
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(700, c.currentTime);
  filter.frequency.linearRampToValueAtTime(220, c.currentTime + 0.3);
  const g = c.createGain();
  g.gain.setValueAtTime(0.2, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
  src.connect(filter).connect(g).connect(c.destination);
  src.start();
}

function playTamp() {
  const c = ctx();
  const noise = whiteNoise(0.25, 0.25);
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(400, c.currentTime);
  filter.frequency.linearRampToValueAtTime(100, c.currentTime + 0.25);
  noise.disconnect();
  noise.connect(filter).connect(c.destination);
  noise.start();

  const o = c.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(110, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(55, c.currentTime + 0.25);
  const g = c.createGain();
  g.gain.setValueAtTime(0.25, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.35);
  o.connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + 0.4);
}

function playInvalid() {
  const c = ctx();
  const o = c.createOscillator();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(140, c.currentTime);
  o.frequency.linearRampToValueAtTime(90, c.currentTime + 0.12);
  const g = c.createGain();
  g.gain.setValueAtTime(0.12, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
  o.connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + 0.18);
}

function playWin() {
  const c = ctx();
  const notes = [587.33, 880.0, 1046.5, 1396.9]; // D5, A5, C6, F6 (icy chime)
  notes.forEach((freq, i) => {
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, c.currentTime + i * 0.12);
    const g = c.createGain();
    g.gain.setValueAtTime(0, c.currentTime + i * 0.12);
    g.gain.linearRampToValueAtTime(0.2, c.currentTime + i * 0.12 + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.12 + 0.55);
    o.connect(g).connect(c.destination);
    o.start(c.currentTime + i * 0.12);
    o.stop(c.currentTime + i * 0.12 + 0.65);
  });
}

function playClick() {
  const c = ctx();
  const o = c.createOscillator();
  o.type = 'triangle';
  o.frequency.setValueAtTime(400, c.currentTime);
  const g = c.createGain();
  g.gain.setValueAtTime(0.08, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.05);
  o.connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + 0.07);
}

function playUndo() {
  const c = ctx();
  const o = c.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(300, c.currentTime);
  o.frequency.linearRampToValueAtTime(150, c.currentTime + 0.1);
  const g = c.createGain();
  g.gain.setValueAtTime(0.1, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
  o.connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + 0.14);
}

function playReset() {
  const c = ctx();
  const noise = whiteNoise(0.15, 0.1);
  const filter = c.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1200;
  noise.disconnect();
  noise.connect(filter).connect(c.destination);
  noise.start();
}

function playUnlock() {
  const c = ctx();
  const o = c.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(880, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(1760, c.currentTime + 0.2);
  const g = c.createGain();
  g.gain.setValueAtTime(0.12, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
  o.connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + 0.35);
}

// Ambient wind via oscillators
let musicNodes: (AudioScheduledSourceNode | GainNode)[] | null = null;
let isMusicPlaying = false;

export function startMusic() {
  const c = ctx();
  if (!c) return;
  if (isMusicPlaying) return;
  if (!settings.music) return;
  unlockAudio();
  isMusicPlaying = true;

  // Wind noise
  const len = Math.ceil(c.sampleRate * 4);
  const buffer = c.createBuffer(1, len, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const windSrc = c.createBufferSource();
  windSrc.buffer = buffer;
  windSrc.loop = true;
  const windFilter = c.createBiquadFilter();
  windFilter.type = 'bandpass';
  windFilter.frequency.value = 300;
  windFilter.Q.value = 0.6;
  const windGain = c.createGain();
  windGain.gain.value = 0.02;
  windSrc.connect(windFilter).connect(windGain).connect(c.destination);
  windSrc.start();

  // Low drone (station generator hum)
  const drone = c.createOscillator();
  drone.type = 'sine';
  drone.frequency.value = 50;
  const droneGain = c.createGain();
  droneGain.gain.value = 0.015;
  drone.connect(droneGain).connect(c.destination);
  drone.start();

  // Distant ice crackle (randomized clicks)
  musicNodes = [windSrc, windFilter, windGain, drone, droneGain];
}

export function stopMusic() {
  if (!isMusicPlaying || !musicNodes) return;
  const c = ctx();
  musicNodes.forEach((node) => {
    try {
      if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) {
        node.stop(c.currentTime + 0.1);
      }
    } catch {
      // ignore
    }
  });
  isMusicPlaying = false;
  musicNodes = null;
}
