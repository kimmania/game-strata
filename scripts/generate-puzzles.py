import json
from collections import Counter

def mk(cid, height, tamps, target, tubes):
    all_colors = []
    for tube in tubes:
        all_colors.extend(tube)
    counts = Counter(all_colors)
    for c, n in counts.items():
        assert n == height, f'{cid}: color {c} has {n} layers, expected {height}'
    return {
        "id": cid,
        "site": "arctic",
        "siteName": "Arctic Station",
        "tubes": [{"layers": list(t)} for t in tubes],
        "height": height,
        "tampCharges": tamps,
        "targetMoves": target,
        "colors": len(counts)
    }

levels = []

# --- 3 colors h=4, 5 tubes ---
levels.append(mk("a01", 4, 3, 8, [
    ["ice", "ice", "white", "white"],
    ["ash", "ash", "white", "white"],
    ["ash", "ash", "ice", "ice"],
    [],
    []
]))

levels.append(mk("a02", 4, 3, 8, [
    ["ice", "ice", "ash", "ash"],
    ["white", "white", "ash", "ash"],
    ["white", "white", "ice", "ice"],
    [],
    []
]))

levels.append(mk("a03", 4, 2, 10, [
    ["ice", "white", "ash", "ice"],
    ["white", "ash", "ice", "white"],
    ["ash", "ice", "white", "ash"],
    [],
    []
]))

levels.append(mk("a04", 4, 2, 10, [
    ["ice", "ash", "ice", "white"],
    ["white", "ice", "white", "ash"],
    ["ash", "white", "ash", "ice"],
    [],
    []
]))

levels.append(mk("a05", 4, 2, 12, [
    ["ice", "ash", "white", "ice"],
    ["white", "ice", "ash", "white"],
    ["ash", "white", "ice", "ash"],
    [],
    []
]))

# --- 4 colors h=4, 7 tubes ---
levels.append(mk("a06", 4, 2, 14, [
    ["ice", "ice", "white", "white"],
    ["ash", "ash", "clay", "clay"],
    ["ice", "ice", "ash", "ash"],
    ["white", "white", "clay", "clay"],
    [], [], []
]))

levels.append(mk("a07", 4, 2, 14, [
    ["ice", "ice", "clay", "clay"],
    ["white", "white", "ash", "ash"],
    ["ice", "ice", "white", "white"],
    ["ash", "ash", "clay", "clay"],
    [], [], []
]))

levels.append(mk("a08", 4, 2, 16, [
    ["ice", "white", "ash", "clay"],
    ["white", "ash", "clay", "ice"],
    ["ash", "clay", "ice", "white"],
    ["clay", "ice", "white", "ash"],
    [], [], []
]))

levels.append(mk("a09", 4, 2, 16, [
    ["ice", "ash", "white", "clay"],
    ["ash", "white", "clay", "ice"],
    ["white", "clay", "ice", "ash"],
    ["clay", "ice", "ash", "white"],
    [], [], []
]))

levels.append(mk("a10", 4, 2, 18, [
    ["clay", "ice", "clay", "ice"],
    ["ash", "white", "ash", "white"],
    ["ice", "clay", "ice", "clay"],
    ["white", "ash", "white", "ash"],
    [], [], []
]))

# --- 5 colors h=5, 9 tubes ---
levels.append(mk("a11", 5, 2, 20, [
    ["ice", "ice", "white", "white", "ash"],
    ["white", "white", "ash", "ash", "clay"],
    ["ash", "ash", "clay", "clay", "lichen"],
    ["clay", "clay", "lichen", "lichen", "ice"],
    ["lichen", "lichen", "ice", "ice", "white"],
    [], [], [], []
]))

levels.append(mk("a12", 5, 2, 22, [
    ["white", "white", "ash", "ash", "clay"],
    ["ash", "ash", "clay", "clay", "lichen"],
    ["clay", "clay", "lichen", "lichen", "ice"],
    ["lichen", "lichen", "ice", "ice", "white"],
    ["ice", "ice", "white", "white", "ash"],
    [], [], [], []
]))

levels.append(mk("a13", 5, 2, 24, [
    ["ash", "clay", "lichen", "ice", "white"],
    ["clay", "lichen", "ice", "white", "ash"],
    ["lichen", "ice", "white", "ash", "clay"],
    ["ice", "white", "ash", "clay", "lichen"],
    ["white", "ash", "clay", "lichen", "ice"],
    [], [], [], []
]))

levels.append(mk("a14", 5, 2, 26, [
    ["clay", "lichen", "ice", "white", "ash"],
    ["lichen", "ice", "white", "ash", "clay"],
    ["ice", "white", "ash", "clay", "lichen"],
    ["white", "ash", "clay", "lichen", "ice"],
    ["ash", "clay", "lichen", "ice", "white"],
    [], [], [], []
]))

levels.append(mk("a15", 5, 2, 28, [
    ["ice", "ash", "lichen", "white", "clay"],
    ["white", "ice", "clay", "ash", "lichen"],
    ["ash", "white", "lichen", "clay", "ice"],
    ["clay", "ash", "ice", "lichen", "white"],
    ["lichen", "clay", "white", "ice", "ash"],
    [], [], [], []
]))

# --- 6 colors h=5, 11 tubes ---
# Diagonal-shift pattern guarantees exact counts
C6 = ["ice", "white", "ash", "clay", "lichen", "ocean"]
# tube f: [C6[(f+t)%6] for t in range(5)]
# color counts: each color appears exactly 5 times (once per tube except its "skip")
levels.append(mk("a16", 5, 1, 30, [
    [C6[(0+t)%6] for t in range(5)],
    [C6[(1+t)%6] for t in range(5)],
    [C6[(2+t)%6] for t in range(5)],
    [C6[(3+t)%6] for t in range(5)],
    [C6[(4+t)%6] for t in range(5)],
    [C6[(5+t)%6] for t in range(5)],
    [], [], [], [], []
]))

levels.append(mk("a17", 5, 1, 32, [
    [C6[(2+t)%6] for t in range(5)],
    [C6[(3+t)%6] for t in range(5)],
    [C6[(4+t)%6] for t in range(5)],
    [C6[(5+t)%6] for t in range(5)],
    [C6[(0+t)%6] for t in range(5)],
    [C6[(1+t)%6] for t in range(5)],
    [], [], [], [], []
]))

levels.append(mk("a18", 5, 1, 34, [
    [C6[(1+t)%6] for t in range(5)],
    [C6[(3+t)%6] for t in range(5)],
    [C6[(5+t)%6] for t in range(5)],
    [C6[(0+t)%6] for t in range(5)],
    [C6[(2+t)%6] for t in range(5)],
    [C6[(4+t)%6] for t in range(5)],
    [], [], [], [], []
]))

levels.append(mk("a19", 5, 1, 36, [
    [C6[(4+t)%6] for t in range(5)],
    [C6[(0+t)%6] for t in range(5)],
    [C6[(2+t)%6] for t in range(5)],
    [C6[(5+t)%6] for t in range(5)],
    [C6[(1+t)%6] for t in range(5)],
    [C6[(3+t)%6] for t in range(5)],
    [], [], [], [], []
]))

levels.append(mk("a20", 5, 1, 38, [
    [C6[(5+t)%6] for t in range(5)],
    [C6[(4+t)%6] for t in range(5)],
    [C6[(3+t)%6] for t in range(5)],
    [C6[(2+t)%6] for t in range(5)],
    [C6[(1+t)%6] for t in range(5)],
    [C6[(0+t)%6] for t in range(5)],
    [], [], [], [], []
]))

# --- 7 colors h=6, 13 tubes ---
C7 = ["ice", "white", "ash", "clay", "lichen", "ocean", "moss"]
levels.append(mk("a21", 6, 1, 45, [
    [C7[(0+t)%7] for t in range(6)],
    [C7[(1+t)%7] for t in range(6)],
    [C7[(2+t)%7] for t in range(6)],
    [C7[(3+t)%7] for t in range(6)],
    [C7[(4+t)%7] for t in range(6)],
    [C7[(5+t)%7] for t in range(6)],
    [C7[(6+t)%7] for t in range(6)],
    [], [], [], [], [], []
]))

levels.append(mk("a22", 6, 1, 50, [
    [C7[(3+t)%7] for t in range(6)],
    [C7[(4+t)%7] for t in range(6)],
    [C7[(5+t)%7] for t in range(6)],
    [C7[(6+t)%7] for t in range(6)],
    [C7[(0+t)%7] for t in range(6)],
    [C7[(1+t)%7] for t in range(6)],
    [C7[(2+t)%7] for t in range(6)],
    [], [], [], [], [], []
]))

levels.append(mk("a23", 6, 1, 55, [
    [C7[(2+t)%7] for t in range(6)],
    [C7[(4+t)%7] for t in range(6)],
    [C7[(6+t)%7] for t in range(6)],
    [C7[(1+t)%7] for t in range(6)],
    [C7[(3+t)%7] for t in range(6)],
    [C7[(5+t)%7] for t in range(6)],
    [C7[(0+t)%7] for t in range(6)],
    [], [], [], [], [], []
]))

levels.append(mk("a24", 6, 1, 60, [
    [C7[(5+t)%7] for t in range(6)],
    [C7[(0+t)%7] for t in range(6)],
    [C7[(2+t)%7] for t in range(6)],
    [C7[(4+t)%7] for t in range(6)],
    [C7[(6+t)%7] for t in range(6)],
    [C7[(1+t)%7] for t in range(6)],
    [C7[(3+t)%7] for t in range(6)],
    [], [], [], [], [], []
]))

levels.append(mk("a25", 6, 1, 65, [
    [C7[(6+t)%7] for t in range(6)],
    [C7[(5+t)%7] for t in range(6)],
    [C7[(4+t)%7] for t in range(6)],
    [C7[(3+t)%7] for t in range(6)],
    [C7[(2+t)%7] for t in range(6)],
    [C7[(1+t)%7] for t in range(6)],
    [C7[(0+t)%7] for t in range(6)],
    [], [], [], [], [], []
]))

with open('src/engine/puzzles.json', 'w') as f:
    json.dump(levels, f, indent=2)

print(f"Generated {len(levels)} levels")
