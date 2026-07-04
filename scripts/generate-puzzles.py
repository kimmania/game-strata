import json
from collections import Counter
from heapq import heappush, heappop
import itertools
import random

COLORS = ['ice','white','ash','clay','lichen','ocean','moss','rust']

def make_solved(height, num_colors):
    return [[COLORS[c]] * height for c in range(num_colors)]

def top_block(tube):
    if not tube:
        return (None, 0)
    color = tube[-1]
    count = 0
    for i in range(len(tube)-1, -1, -1):
        if tube[i] == color:
            count += 1
        else:
            break
    return (color, count)

# ---------- Reverse scrambling ----------

def reverse_moves(tubes, height):
    """Inverse-of-pour moves. Placing onto a DIFFERENT color mixes tubes."""
    moves = []
    n = len(tubes)
    for a in range(n):
        color, blocklen = top_block(tubes[a])
        if blocklen == 0:
            continue
        for k in range(1, blocklen + 1):
            if not (k < blocklen or k == len(tubes[a])):
                continue
            for b in range(n):
                if b == a:
                    continue
                if len(tubes[b]) + k > height:
                    continue
                b_color, _ = top_block(tubes[b])
                if b_color == color:
                    continue
                moves.append((a, b, k))
    return moves

def apply_reverse(tubes, a, b, k):
    block = tubes[a][-k:]
    tubes[a] = tubes[a][:-k]
    tubes[b] = tubes[b] + block

def mix_score(tubes):
    return sum(1 for t in tubes for i in range(1, len(t)) if t[i] != t[i-1])

def scramble(tubes, height, moves, rng):
    for _ in range(moves):
        valid = reverse_moves(tubes, height)
        if not valid:
            break
        # strongly prefer moves that increase mixing (onto non-empty, small k)
        mixing = [m for m in valid if tubes[m[1]]]
        pool = mixing if mixing and rng.random() < 0.9 else valid
        a, b, k = rng.choice(pool)
        apply_reverse(tubes, a, b, k)
    return tubes

# ---------- Forward solver (A*, pour only — no tamp) ----------

def solved(tubes):
    return all(len(set(t)) <= 1 for t in tubes)

def solve(tubes, height, max_nodes=300000):
    start = tuple(tuple(t) for t in tubes)
    if solved(start):
        return 0
    seen = {start}
    counter = itertools.count()
    def h(st):
        return sum(1 for t in st for i in range(1, len(t)) if t[i] != t[i-1])
    frontier = [(h(start), 0, start, 0)]
    nodes = 0
    while frontier:
        f, _, st, g = heappop(frontier)
        nodes += 1
        if nodes > max_nodes:
            return None
        lst = [list(t) for t in st]
        n = len(lst)
        for s in range(n):
            c, k = top_block(lst[s])
            if k == 0:
                continue
            for d in range(n):
                if s == d:
                    continue
                dc, _ = top_block(lst[d])
                if lst[d] and dc != c:
                    continue
                room = height - len(lst[d])
                if room <= 0:
                    continue
                mv = min(k, room)
                new = [list(t) for t in lst]
                blk = new[s][-mv:]
                new[s] = new[s][:-mv]
                new[d] = new[d] + blk
                nst = tuple(tuple(t) for t in new)
                if nst in seen:
                    continue
                if solved(nst):
                    return g + 1
                seen.add(nst)
                heappush(frontier, (g + 1 + h(nst), next(counter), nst, g + 1))
    return None

# ---------- Level factory ----------

def make_level(cid, height, colors_count, empty, tamps, scramble_moves,
               min_optimal, seed, target_margin):
    """Generate a level; retry seeds and keep the deepest solvable candidate."""
    best = None
    best_opt = -1
    for attempt in range(30):
        rng = random.Random(seed + attempt * 1000)
        tubes = make_solved(height, colors_count) + [[] for _ in range(empty)]
        tubes = scramble(tubes, height, scramble_moves, rng)
        if solved(tubes):
            continue
        opt = solve([list(t) for t in tubes], height)
        if opt is None:
            continue
        if opt > best_opt:
            best, best_opt = tubes, opt
        if opt >= min_optimal:
            break
    if best is None:
        raise RuntimeError(f"{cid}: could not generate a solvable level")
    target = best_opt + target_margin
    return {
        "id": cid,
        "site": "arctic",
        "siteName": "Arctic Station",
        "tubes": [{"layers": list(t)} for t in best],
        "height": height,
        "tampCharges": tamps,
        "targetMoves": target,
        "colors": colors_count
    }, best_opt

levels = []
report = []

# Tier 1: 3 colors, h=4, 2 empty. Gentle intro.
for i in range(5):
    lvl, opt = make_level(f"a{i+1:02d}", 4, 3, 2, 2, 60, 5 + i // 2, seed=100 + i, target_margin=3)
    levels.append(lvl); report.append((lvl['id'], opt, lvl['targetMoves']))

# Tier 2: 4 colors, h=4, 2 empty.
for i in range(5):
    lvl, opt = make_level(f"a{i+6:02d}", 4, 4, 2, 2, 80, 7 + i // 2, seed=200 + i, target_margin=3)
    levels.append(lvl); report.append((lvl['id'], opt, lvl['targetMoves']))

# Tier 3: 5 colors, h=5, 2 empty.
for i in range(5):
    lvl, opt = make_level(f"a{i+11:02d}", 5, 5, 2, 2, 100, 11 + i // 2, seed=300 + i, target_margin=4)
    levels.append(lvl); report.append((lvl['id'], opt, lvl['targetMoves']))

# Tier 4: 6 colors, h=5, 1 empty. Tight — tamp very useful.
for i in range(5):
    lvl, opt = make_level(f"a{i+16:02d}", 5, 6, 1, 2, 120, 14 + i // 2, seed=400 + i, target_margin=4)
    levels.append(lvl); report.append((lvl['id'], opt, lvl['targetMoves']))

# Tier 5: 7 colors, h=6, 1 empty. Hard.
for i in range(5):
    lvl, opt = make_level(f"a{i+21:02d}", 6, 7, 1, 2, 150, 17 + i // 2, seed=500 + i, target_margin=5)
    levels.append(lvl); report.append((lvl['id'], opt, lvl['targetMoves']))

# Tier 6: 8 colors, h=6, 1 empty. Expert.
for i in range(5):
    lvl, opt = make_level(f"a{i+26:02d}", 6, 8, 1, 2, 180, 20 + i // 2, seed=600 + i, target_margin=5)
    levels.append(lvl); report.append((lvl['id'], opt, lvl['targetMoves']))

# Verify layer counts
for lvl in levels:
    allc = []
    for t in lvl["tubes"]:
        allc.extend(t["layers"])
    cnt = Counter(allc)
    for c, n in cnt.items():
        assert n == lvl["height"], f"{lvl['id']}: color {c} count {n} != height {lvl['height']}"

with open('src/engine/puzzles.json', 'w') as f:
    json.dump(levels, f, indent=2)

for rid, opt, target in report:
    print(f"{rid}: optimal={opt} target={target}")
print(f"Generated {len(levels)} levels")
