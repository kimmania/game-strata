export type TubeColor = 'ice' | 'white' | 'ash' | 'clay' | 'lichen' | 'ocean' | 'moss' | 'rust';

export const TUBE_COLORS: TubeColor[] = [
  'ice',
  'white',
  'ash',
  'clay',
  'lichen',
  'ocean',
  'moss',
  'rust',
];

export const COLOR_CSS: Record<TubeColor, string> = {
  ice: '#8ecae6',
  white: '#f1faee',
  ash: '#1d3557',
  clay: '#d4a373',
  lichen: '#588157',
  ocean: '#006d77',
  moss: '#606c38',
  rust: '#bc4749',
};

export const COLOR_NAMES: Record<TubeColor, string> = {
  ice: 'Ice Blue',
  white: 'Glacial White',
  ash: 'Volcanic Ash',
  clay: 'Ochre Clay',
  lichen: 'Sage Lichen',
  ocean: 'Deep Ocean',
  moss: 'Moss',
  rust: 'Rust',
};

export const SAVE_VERSION = 1;
export const SAVE_KEY = 'catalyst-save';

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

export const SITES: Record<string, { name: string; bgGradient: string; levels: string[] }> = {};
