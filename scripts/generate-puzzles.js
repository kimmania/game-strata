import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLORS = ['ice', 'white', 'ash', 'clay', 'lichen', 'ocean', 'moss', 'rust'];

function cloneTubes(tubes) {
  return tubes.map(t => [...t]);
}

function getTopBlock(tube) {
  if (tube.length === 0) return { color: null, count: 0 };
  const color = tube[tube.length - 1];
  let count = 0;
  for (let i = tube.length - 1; i >= 0 && tube[i] === color; i--) count++;
  return { color, count };
}

function pourForward(tubes, from, to, height) {
  const src = tubes[from];
  const dst = tubes[to];
  const { color, count } = getTopBlock(src);
  const space = height - dst.length;
  const transfer = Math.min(count, space);
  const block = src.splice(src.length - transfer, transfer);
  dst.push(...block);
}

function isSolved(tubes) {
  for (const tube of tubes) {
    if (tube.length === 0) continue;
    if (!tube.every(c => c === tube[0])) return false;
  }
  return true;
}

function generateLevel(id, numColors, numTubes, height, emptyTubes, tampCharges, moveCount) {
  const colorNames = COLORS.slice(0, numColors);
  let attempts = 0;
  while (attempts < 3000) {
    attempts++;
    const solved = [];
    for (let i = 0; i < numColors; i++) {
      solved.push(Array(height).fill(colorNames[i]));
    }
    for (let i = 0; i < emptyTubes; i++) {
      solved.push([]);
    }

    let current = cloneTubes(solved);
    let performed = 0;
    for (let step = 0; step < moveCount * 4; step++) {
      // We perform reverse moves. A reverse move in generation is:
      // pick two different tubes f,t. Move top block from f to t.
      // Valid if: f non-empty, t not full, and t accepts color.
      // To ensure we don't trivially solve things, we reject moves that create a fully�uniform tube of height layers unless it's part of progress.
      const options = [];
      for (let f = 0; f < current.length; f++) {
        if (current[f].length === 0) continue;
        const { color, count } = getTopBlock(current[f]);
        for (let t = 0; t < current.length; t++) {
          if (f === t) continue;
          if (current[t].length >= height) continue;
          if (current[t].length > 0 && current[t][current[t].length - 1] !== color) continue;
          // Create the test board
          const after = cloneTubes(current);
          pourForward(after, f, t, height);
          // Skip if this would solve the whole board
          if (isSolved(after)) continue;
          options.push({ f, t, after });
        }
      }
      if (options.length === 0) break;
      const pick = options[Math.floor(Math.random() * options.length)];
      current = pick.after;
      performed++;
      if (performed >= moveCount) break;
    }

    if (isSolved(current)) continue;

    return {
      id,
      site: 'arctic',
      siteName: 'Arctic Station',
      tubes: current.map(layers => ({ layers })),
      height,
      tampCharges,
      targetMoves: Math.max(5, Math.floor(moveCount * 0.7)),
      colors: numColors
    };
  }
  return null;
}

const levels = [];
const configs = [
  { colors: 3, tubes: 5, height: 4, empty: 2, tamps: 3, moves: 6 },
  { colors: 3, tubes: 5, height: 4, empty: 2, tamps: 3, moves: 7 },
  { colors: 3, tubes: 5, height: 4, empty: 2, tamps: 2, moves: 8 },
  { colors: 3, tubes: 5, height: 4, empty: 2, tamps: 2, moves: 9 },
  { colors: 3, tubes: 5, height: 4, empty: 2, tamps: 2, moves: 10 },
  { colors: 4, tubes: 7, height: 4, empty: 2, tamps: 2, moves: 12 },
  { colors: 4, tubes: 7, height: 4, empty: 2, tamps: 2, moves: 14 },
  { colors: 4, tubes: 7, height: 4, empty: 2, tamps: 2, moves: 16 },
  { colors: 4, tubes: 7, height: 4, empty: 2, tamps: 2, moves: 18 },
  { colors: 4, tubes: 7, height: 4, empty: 2, tamps: 2, moves: 20 },
  { colors: 5, tubes: 9, height: 5, empty: 2, tamps: 2, moves: 22 },
  { colors: 5, tubes: 9, height: 5, empty: 2, tamps: 2, moves: 24 },
  { colors: 5, tubes: 9, height: 5, empty: 2, tamps: 2, moves: 26 },
  { colors: 5, tubes: 9, height: 5, empty: 2, tamps: 2, moves: 28 },
  { colors: 5, tubes: 9, height: 5, empty: 2, tamps: 2, moves: 30 },
  { colors: 6, tubes: 11, height: 5, empty: 1, tamps: 1, moves: 35 },
  { colors: 6, tubes: 11, height: 5, empty: 1, tamps: 1, moves: 38 },
  { colors: 6, tubes: 11, height: 5, empty: 1, tamps: 1, moves: 42 },
  { colors: 6, tubes: 11, height: 5, empty: 1, tamps: 1, moves: 46 },
  { colors: 6, tubes: 11, height: 5, empty: 1, tamps: 1, moves: 50 },
  { colors: 7, tubes: 13, height: 6, empty: 0, tamps: 1, moves: 55 },
  { colors: 7, tubes: 13, height: 6, empty: 0, tamps: 1, moves: 60 },
  { colors: 7, tubes: 13, height: 6, empty: 0, tamps: 1, moves: 65 },
  { colors: 7, tubes: 13, height: 6, empty: 0, tamps: 1, moves: 70 },
  { colors: 7, tubes: 13, height: 6, empty: 0, tamps: 1, moves: 75 },
];

for (let i = 0; i < configs.length; i++) {
  const cfg = configs[i];
  const id = `a${String(i + 1).padStart(2, '0')}`;
  const level = generateLevel(id, cfg.colors, cfg.tubes, cfg.height, cfg.empty, cfg.tamps, cfg.moves);
  if (level) levels.push(level);
  else console.warn('Failed to generate ' + id);
}

const outPath = path.join(__dirname, '../src/engine/puzzles.json');
fs.writeFileSync(outPath, JSON.stringify(levels, null, 2));
console.log('Generated ' + levels.length + ' levels');
