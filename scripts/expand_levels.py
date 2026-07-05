import json
from collections import Counter
from heapq import heappush, heappop
import itertools
import random
import copy

# Existing Arctic palette (used by the first 30 committed levels)
ARCTIC_COLORS = ['ice','white','ash','clay','lichen','ocean','moss','rust']

SITES = {
    'arctic':    {'prefix': 'a', 'pool': ARCTIC_COLORS},
    'desert':    {'prefix': 'd', 'pool': ['sand','sienna','salt','graphite','ochre','sage','mirage','bone']},
    'deepsea':   {'prefix': 's', 'pool': ['abyss','brine','coral','kelp','pearl','current','ink','foam']},
    'volcanic':  {'prefix': 'v', 'pool': ['magma','pumice','obsidian','sulfur','scoria','basalt','ember','smoke']},
    'meteorite': {'prefix': 'm', 'pool': ['iron','nickel','olivine','regolith','magnetite','chondrule','sulfide','anorthite']},
}

def make_solved(height, num_colors, colors):
    return [[colors[c]] * height for c in range(num_colors)]

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

def reverse_moves(tubes, height):
    moves = []
    n = len(tubes)
    for a in range(n):
        color, blocklen = top_block(tubes[a])
        if blocklen == 0:
            continue
        # Reverse of a forward block pour: take any k same-color layers off the top.
        for k in range(1, blocklen + 1):
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

def scramble(tubes, height, moves, rng, prefer_mixing=0.9):
    for _ in range(moves):
        valid = reverse_moves(tubes, height)
        if not valid:
            break
        mixing = [m for m in valid if tubes[m[1]]]
        pool = mixing if mixing and rng.random() < prefer_mixing else valid
        a, b, k = rng.choice(pool)
        apply_reverse(tubes, a, b, k)
    return tubes

def solved(tubes):
    return all(len(set(t)) <= 1 for t in tubes)

def solve(tubes, height, max_nodes=600_000):
    """Pour-only A* solver. Reverse-scrambled boards are guaranteed solvable by pours."""
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
        _, _, st, g = heappop(frontier)
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

def make_level(cid, height, colors_count, empty, tamps, scramble_moves,
               min_optimal, seed, target_margin, site, colors_pool,
               max_attempts=None):
    """Generate a single level. Retry seeds and keep the deepest solvable candidate."""
    best = None
    best_opt = -1
    if max_attempts is None:
        max_attempts = 60 if colors_count >= 7 else 30
    colors_pool = colors_pool[:]
    for attempt in range(max_attempts):
        rng = random.Random(seed + attempt * 1009)
        chosen_colors = colors_pool[:colors_count]
        tubes = make_solved(height, colors_count, chosen_colors) + [[] for _ in range(empty)]
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
        "site": site,
        "siteName": site.replace('deepsea', 'Deep Sea').replace('meteorite', 'Meteorite').replace('volcanic','Volcanic').replace('desert','Desert').replace('arctic','Arctic') + ' Station',
        "tubes": [{"layers": list(t)} for t in best],
        "height": height,
        "tampCharges": tamps,
        "targetMoves": target,
        "colors": colors_count
    }, best_opt

# ---------------------------------------------------------------------------
# Level schedule. Each entry returns a dict for that index.
# ---------------------------------------------------------------------------
def a_config(idx):
    ramps = [
        {'height':5,'colors':5,'empty':3,'tamps':2,'scramble':110,'min_opt':14},
        {'height':5,'colors':5,'empty':3,'tamps':2,'scramble':120,'min_opt':15},
        {'height':5,'colors':6,'empty':2,'tamps':2,'scramble':130,'min_opt':16},
        {'height':5,'colors':6,'empty':2,'tamps':2,'scramble':140,'min_opt':17},
        {'height':6,'colors':7,'empty':1,'tamps':2,'scramble':150,'min_opt':18},
        {'height':6,'colors':7,'empty':1,'tamps':2,'scramble':160,'min_opt':19},
        {'height':6,'colors':8,'empty':1,'tamps':2,'scramble':170,'min_opt':20},
        {'height':6,'colors':8,'empty':1,'tamps':2,'scramble':180,'min_opt':21},
        {'height':6,'colors':8,'empty':1,'tamps':2,'scramble':190,'min_opt':22},
        {'height':6,'colors':8,'empty':1,'tamps':2,'scramble':200,'min_opt':23},
    ]
    c = ramps[idx % len(ramps)]
    c['margin'] = 5
    return c

def d_config(idx):
    ramps = [
        {'height':4,'colors':4,'empty':2,'tamps':2,'scramble':85,'min_opt':11},
        {'height':4,'colors':4,'empty':2,'tamps':2,'scramble':95,'min_opt':12},
        {'height':4,'colors':5,'empty':2,'tamps':2,'scramble':105,'min_opt':13},
        {'height':5,'colors':5,'empty':2,'tamps':2,'scramble':115,'min_opt':14},
        {'height':5,'colors':6,'empty':2,'tamps':2,'scramble':125,'min_opt':15},
        {'height':5,'colors':6,'empty':1,'tamps':2,'scramble':135,'min_opt':16},
        {'height':5,'colors':7,'empty':1,'tamps':2,'scramble':145,'min_opt':17},
        {'height':5,'colors':7,'empty':1,'tamps':2,'scramble':155,'min_opt':18},
        {'height':5,'colors':8,'empty':1,'tamps':2,'scramble':165,'min_opt':19},
        {'height':5,'colors':8,'empty':1,'tamps':2,'scramble':175,'min_opt':20},
    ]
    c = ramps[idx % len(ramps)]
    c['margin'] = 5
    return c

def s_config(idx):
    ramps = [
        {'height':5,'colors':5,'empty':2,'tamps':2,'scramble':110,'min_opt':13},
        {'height':5,'colors':5,'empty':2,'tamps':2,'scramble':120,'min_opt':14},
        {'height':5,'colors':6,'empty':2,'tamps':2,'scramble':130,'min_opt':15},
        {'height':5,'colors':6,'empty':1,'tamps':2,'scramble':140,'min_opt':16},
        {'height':5,'colors':7,'empty':1,'tamps':2,'scramble':150,'min_opt':17},
        {'height':5,'colors':7,'empty':1,'tamps':2,'scramble':160,'min_opt':18},
        {'height':6,'colors':7,'empty':1,'tamps':2,'scramble':170,'min_opt':19},
        {'height':6,'colors':8,'empty':1,'tamps':2,'scramble':180,'min_opt':20},
        {'height':6,'colors':8,'empty':1,'tamps':2,'scramble':190,'min_opt':21},
        {'height':6,'colors':8,'empty':1,'tamps':2,'scramble':200,'min_opt':22},
    ]
    c = ramps[idx % len(ramps)]
    c['margin'] = 5
    return c

def v_config(idx):
    ramps = [
        {'height':5,'colors':6,'empty':2,'tamps':2,'scramble':140,'min_opt':16},
        {'height':5,'colors':6,'empty':1,'tamps':2,'scramble':150,'min_opt':17},
        {'height':5,'colors':7,'empty':1,'tamps':2,'scramble':160,'min_opt':18},
        {'height':5,'colors':7,'empty':1,'tamps':2,'scramble':170,'min_opt':19},
        {'height':6,'colors':7,'empty':1,'tamps':2,'scramble':180,'min_opt':20},
        {'height':6,'colors':8,'empty':1,'tamps':2,'scramble':190,'min_opt':21},
        {'height':6,'colors':8,'empty':1,'tamps':2,'scramble':200,'min_opt':22},
        {'height':6,'colors':8,'empty':1,'tamps':2,'scramble':210,'min_opt':23},
        {'height':6,'colors':8,'empty':1,'tamps':2,'scramble':220,'min_opt':24},
        {'height':6,'colors':8,'empty':1,'tamps':2,'scramble':230,'min_opt':25},
    ]
    c = ramps[idx % len(ramps)]
    c['margin'] = 5
    return c

def m_config(idx):
    ramps = [
        {'height':6,'colors':7,'empty':1,'tamps':2,'scramble':180,'min_opt':19},
        {'height':6,'colors':7,'empty':1,'tamps':2,'scramble':190,'min_opt':20},
        {'height':6,'colors':8,'empty':1,'tamps':2,'scramble':200,'min_opt':21},
        {'height':6,'colors':8,'empty':1,'tamps':2,'scramble':210,'min_opt':22},
        {'height':6,'colors':8,'empty':1,'tamps':2,'scramble':220,'min_opt':23},
        {'height':6,'colors':8,'empty':1,'tamps':2,'scramble':230,'min_opt':24},
        {'height':6,'colors':8,'empty':1,'tamps':2,'scramble':240,'min_opt':25},
        {'height':6,'colors':8,'empty':1,'tamps':2,'scramble':250,'min_opt':26},
        {'height':6,'colors':8,'empty':1,'tamps':2,'scramble':260,'min_opt':27},
        {'height':6,'colors':8,'empty':1,'tamps':2,'scramble':270,'min_opt':28},
    ]
    c = ramps[idx % len(ramps)]
    c['margin'] = 5
    return c

SCHEDULE = [
    ('arctic',    10, 'a', a_config),
    ('desert',    40, 'd', d_config),
    ('deepsea',   40, 's', s_config),
    ('volcanic',  40, 'v', v_config),
    ('meteorite', 40, 'm', m_config),
]

OUTPUT = '/Users/kmann/Documents/GitHub/kimmania/game-strata/src/engine/puzzles.json'

with open(OUTPUT) as f:
    existing = json.load(f)

existing_ids = {lvl['id'] for lvl in existing}
levels = list(existing)
report = []

def prefix_num(prefix, num):
    return f"{prefix}{num:02d}"

for site, count, prefix, cfg_fn in SCHEDULE:
    pool = SITES[site]['pool']
    site_existing = [lvl for lvl in existing if lvl['site'] == site]
    start = len(site_existing) + 1
    for i in range(count):
        num = start + i
        cid = prefix_num(prefix, num)
        if cid in existing_ids:
            print('skipping duplicate', cid)
            continue
        c = cfg_fn(i)
        height = c['height']
        colors_count = min(c['colors'], len(pool))
        empty = c['empty']
        tamps = c['tamps']
        scramble_moves = c['scramble']
        min_optimal = c['min_opt']
        margin = c.get('margin', 5)
        seed = hash((site, num, 2026)) % (2**31)
        try:
            lvl, opt = make_level(cid, height, colors_count, empty, tamps, scramble_moves,
                                  min_optimal, seed, margin, site, pool)
            levels.append(lvl); report.append((lvl['id'], opt, lvl['targetMoves'], site))
            print(f"{cid}: opt={opt} target={lvl['targetMoves']} c={colors_count} t={len(lvl['tubes'])} h={height} tamps={tamps}")
        except Exception as e:
            print(f"ERROR {cid}: {e}")
            # Fallback: more empty space and slightly relaxed minimum
            try:
                lvl, opt = make_level(cid, height, colors_count, empty + 1, tamps, max(scramble_moves - 20, 60),
                                      max(min_optimal - 5, 3), seed + 1, margin, site, pool,
                                      max_attempts=80)
                levels.append(lvl); report.append((lvl['id'], opt, lvl['targetMoves'], site))
                print(f"{cid} (fallback): opt={opt} target={lvl['targetMoves']} c={colors_count} t={len(lvl['tubes'])} h={height} tamps={tamps}")
            except Exception as e2:
                print(f"FATAL {cid}: {e2}")
                raise

# Verify layer counts for all levels
for lvl in levels:
    allc = []
    for t in lvl["tubes"]:
        allc.extend(t["layers"])
    cnt = Counter(allc)
    for c, n in cnt.items():
        assert n == lvl["height"], f"{lvl['id']}: color {c} count {n} != height {lvl['height']}"

# Sort by site order then sequential number
order = {'a':0,'d':1,'s':2,'v':3,'m':4}
levels.sort(key=lambda x: (order.get(x['id'][0], 5), int(x['id'][1:])))

with open(OUTPUT, 'w') as f:
    json.dump(levels, f, indent=2)

print()
print(f"Total levels: {len(levels)}")
for site_name, prefix in [('arctic','a'),('desert','d'),('deepsea','s'),('volcanic','v'),('meteorite','m')]:
    c = sum(1 for l in levels if l['id'].startswith(prefix))
    print(f"  {site_name}: {c}")
