import json
from collections import Counter
import random

random.seed(42)

COLORS = ['ice','white','ash','clay','lichen','ocean','moss','rust']

def make_solved(height, num_colors):
    tubes = []
    for c in range(num_colors):
        tubes.append([COLORS[c]] * height)
    return tubes

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

def can_reverse_move(tubes, src, dst, height):
    if not tubes[src]:
        return False
    color, count = top_block(tubes[src])
    dst_has_room = len(tubes[dst]) + count <= height
    if not dst_has_room:
        return False
    if not tubes[dst]:
        return True
    dst_color, _ = top_block(tubes[dst])
    return dst_color == color

def apply_reverse(tubes, src, dst):
    color, count = top_block(tubes[src])
    block = tubes[src][-count:]
    tubes[src] = tubes[src][:-count]
    tubes[dst].extend(block)

def scramble(tubes, height, moves=120):
    n = len(tubes)
    for _ in range(moves):
        valid = []
        for s in range(n):
            for d in range(n):
                if s != d and can_reverse_move(tubes, s, d, height):
                    valid.append((s, d))
        if not valid:
            break
        s, d = random.choice(valid)
        apply_reverse(tubes, s, d)
    return tubes

def make_level(cid, height, colors_count, empty, tamps, target, scramble_moves, seed):
    random.seed(seed)
    solved = make_solved(height, colors_count)
    tubes = [list(t) for t in solved] + [[] for _ in range(empty)]
    tubes = scramble(tubes, height, scramble_moves)
    return {
        "id": cid,
        "site": "arctic",
        "siteName": "Arctic Station",
        "tubes": [{"layers": list(t)} for t in tubes],
        "height": height,
        "tampCharges": tamps,
        "targetMoves": target,
        "colors": colors_count
    }

levels = []

# Tier 1: 3 colors, h=4, 1 empty (4 tubes). Entry/intro.
for i in range(5):
    levels.append(make_level(f"a{i+1:02d}", 4, 3, 1, 2, 12 + i*2, 40 + i*6, seed=1 + i))

# Tier 2: 4 colors, h=4, 1 empty (5 tubes). Easy.
for i in range(5):
    levels.append(make_level(f"a{i+6:02d}", 4, 4, 1, 2, 14 + i*2, 50 + i*6, seed=10 + i))

# Tier 3: 5 colors, h=5, 1 empty (6 tubes). Medium.
for i in range(5):
    levels.append(make_level(f"a{i+11:02d}", 5, 5, 1, 2, 16 + i*3, 60 + i*7, seed=20 + i))

# Tier 4: 6 colors, h=5, 1 empty (7 tubes). Tamp required.
for i in range(5):
    levels.append(make_level(f"a{i+16:02d}", 5, 6, 1, 2, 20 + i*3, 70 + i*8, seed=30 + i))

# Tier 5: 7 colors, h=6, 1 empty (8 tubes). Hard.
for i in range(5):
    levels.append(make_level(f"a{i+21:02d}", 6, 7, 1, 1, 24 + i*4, 80 + i*9, seed=40 + i))

# Tier 6: 8 colors, h=6, 0 empty (8 tubes). Expert — only solvable with tamp.
for i in range(5):
    levels.append(make_level(f"a{i+26:02d}", 6, 8, 0, 2, 28 + i*5, 90 + i*10, seed=50 + i))

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

print(f"Generated {len(levels)} levels")
