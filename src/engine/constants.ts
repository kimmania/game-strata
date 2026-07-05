export type TubeColor =
  // Arctic
  | 'ice' | 'white' | 'ash' | 'clay' | 'lichen' | 'ocean' | 'moss' | 'rust'
  // Desert
  | 'sand' | 'sienna' | 'salt' | 'graphite' | 'ochre' | 'sage' | 'mirage' | 'bone'
  // Deep Sea
  | 'abyss' | 'brine' | 'coral' | 'kelp' | 'pearl' | 'current' | 'ink' | 'foam'
  // Volcanic
  | 'magma' | 'pumice' | 'obsidian' | 'sulfur' | 'scoria' | 'basalt' | 'ember' | 'smoke'
  // Meteorite
  | 'iron' | 'nickel' | 'olivine' | 'regolith' | 'magnetite' | 'chondrule' | 'sulfide' | 'anorthite';

export const TUBE_COLORS: TubeColor[] = [
  // Arctic
  'ice', 'white', 'ash', 'clay', 'lichen', 'ocean', 'moss', 'rust',
  // Desert
  'sand', 'sienna', 'salt', 'graphite', 'ochre', 'sage', 'mirage', 'bone',
  // Deep Sea
  'abyss', 'brine', 'coral', 'kelp', 'pearl', 'current', 'ink', 'foam',
  // Volcanic
  'magma', 'pumice', 'obsidian', 'sulfur', 'scoria', 'basalt', 'ember', 'smoke',
  // Meteorite
  'iron', 'nickel', 'olivine', 'regolith', 'magnetite', 'chondrule', 'sulfide', 'anorthite',
];

export const COLOR_CSS: Record<TubeColor, string> = {
  // Arctic
  ice: '#8ecae6',
  white: '#f1faee',
  ash: '#1d3557',
  clay: '#d4a373',
  lichen: '#588157',
  ocean: '#006d77',
  moss: '#606c38',
  rust: '#bc4749',
  // Desert
  sand: '#e6c288',
  sienna: '#a0522d',
  salt: '#f7f7f7',
  graphite: '#2e2e2e',
  ochre: '#cc7722',
  sage: '#8fbc8f',
  mirage: '#9ea792',
  bone: '#e3dac9',
  // Deep Sea
  abyss: '#0d1b2a',
  brine: '#00b4d8',
  coral: '#ff6f61',
  kelp: '#3a5a40',
  pearl: '#f0ebd8',
  current: '#0077b6',
  ink: '#050510',
  foam: '#caf0f8',
  // Volcanic
  magma: '#d00000',
  pumice: '#b8b8d1',
  obsidian: '#16161d',
  sulfur: '#ffd60a',
  scoria: '#3d0c02',
  basalt: '#4a4a55',
  ember: '#ff4800',
  smoke: '#6c757d',
  // Meteorite
  iron: '#7a7269',
  nickel: '#b0b5b3',
  olivine: '#9ead7e',
  regolith: '#8d7f72',
  magnetite: '#2f3e46',
  chondrule: '#c18a5c',
  sulfide: '#f4d06f',
  anorthite: '#d6cfc7',
};

export const COLOR_NAMES: Record<TubeColor, string> = {
  // Arctic
  ice: 'Ice Blue',
  white: 'Glacial White',
  ash: 'Volcanic Ash',
  clay: 'Ochre Clay',
  lichen: 'Sage Lichen',
  ocean: 'Deep Ocean',
  moss: 'Moss',
  rust: 'Rust',
  // Desert
  sand: 'Desert Sand',
  sienna: 'Burnt Sienna',
  salt: 'Salt Flat',
  graphite: 'Graphite',
  ochre: 'Ochre',
  sage: 'Desert Sage',
  mirage: 'Mirage',
  bone: 'Fossil Bone',
  // Deep Sea
  abyss: 'Abyss Black',
  brine: 'Brine',
  coral: 'Deep Coral',
  kelp: 'Kelp',
  pearl: 'Abyssal Pearl',
  current: 'Current',
  ink: 'Ink',
  foam: 'Sea Foam',
  // Volcanic
  magma: 'Magma',
  pumice: 'Pumice',
  obsidian: 'Obsidian',
  sulfur: 'Sulfur',
  scoria: 'Scoria',
  basalt: 'Basalt',
  ember: 'Ember',
  smoke: 'Volcanic Smoke',
  // Meteorite
  iron: 'Meteoric Iron',
  nickel: 'Nickel',
  olivine: 'Olivine',
  regolith: 'Regolith',
  magnetite: 'Magnetite',
  chondrule: 'Chondrule',
  sulfide: 'Sulfide',
  anorthite: 'Anorthite',
};

export const SAVE_VERSION = 2;
export const SAVE_KEY = 'strata-save';

export interface LevelConfig {
  id: string;
  site: string;
  siteName: string;
  colors: number;
  tubes: number;
  height: number;
  emptyTubes: number;
  tampCharges: number;
  targetMoves: number;
}

export interface SiteInfo {
  name: string;
  bgGradient: string;
  levelPrefix: string;
}

export const SITE_ORDER: string[] = ['arctic', 'desert', 'deepsea', 'volcanic', 'meteorite'];

export const SITES: Record<string, SiteInfo> = {
  arctic: {
    name: 'Arctic Station',
    bgGradient: 'linear-gradient(180deg, #0a1218 0%, #162b3a 100%)',
    levelPrefix: 'a',
  },
  desert: {
    name: 'Desert Outpost',
    bgGradient: 'linear-gradient(180deg, #1a1510 0%, #3d2b1f 100%)',
    levelPrefix: 'd',
  },
  deepsea: {
    name: 'Deep Sea Lab',
    bgGradient: 'linear-gradient(180deg, #020617 0%, #0a2540 100%)',
    levelPrefix: 's',
  },
  volcanic: {
    name: 'Volcanic Observatory',
    bgGradient: 'linear-gradient(180deg, #1a0a0a 0%, #3d1005 100%)',
    levelPrefix: 'v',
  },
  meteorite: {
    name: 'Meteorite Crater',
    bgGradient: 'linear-gradient(180deg, #121015 0%, #2a2530 100%)',
    levelPrefix: 'm',
  },
};
