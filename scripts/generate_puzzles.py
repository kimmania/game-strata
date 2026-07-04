import json

def level(lid, height, tamps, target, tubes):
    colors = set()
    for t in tubes:
        for c in t:
            colors.add(c)
    return {
        "id": lid,
        "site": "arctic",
        "siteName": "Arctic Station",
        "tubes": [{"layers": list(t)} for t in tubes],
        "height": height,
        "tampCharges": tamps,
        "targetMoves": target,
        "colors": len(colors)
    }

# Level a01: 3 colors, height 4, 5 tubes (3 filled + 2 empty), simple introduction
# Solved: tube0=ice, tube1=white, tube2=ash, tube3=empty, tube4=empty
# Scrambled by moving blocks around
levels = [
    # Tutorial - 3 colors, 5 tubes, height 4
    level("a01", 4, 3, 6, [
        ["ash", "ice"],
        ["ice", "ash", "white"],
        ["white", "ice", "ash"],
        ["white"],
        [],
    ]),  # Actually this might have a full tube
]

# Wait, let me just verify solvability manually for a few levels.
# The simplest valid scramble:
# Start: [ice,ice,ice,ice], [white,white,white,white], [ash,ash,ash,ash], [], []
# Move 2 ice to tube3: [ice,ice], [white,white,white,white], [ash,ash,ash,ash], [ice,ice], []
# Move 2 white to tube4: [ice,ice], [white,white], [ash,ash,ash,ash], [ice,ice], [white,white]
# Move 2 ash to tube0: [ice,ice,ash,ash], [white,white], [ash,ash], [ice,ice], [white,white]
# But tube0 now has 4 layers... let me start over and track carefully.

# Start solved state (bottom to top):
# tube0: [ice, ice, ice, ice]
# tube1: [white, white, white, white]
# tube2: [ash, ash, ash, ash]
# tube3: []
# tube4: []

# After 1 move: pour tube0 -> tube3 (2 ice layers since that's the top block)
# Wait, in our game, ALL contiguous top layers of same color pour together.
# tube0 top = 4 ice layers. Since tube3 is empty, all 4 pour! That empties tube0. Not good.

# So from a solved state, any pour to an empty tube moves the ENTIRE tube content.
# To create mixed tubes, we need to pour partial blocks.
# But that's impossible with the whole-block-pour rule from a solved state.

# Therefore: start with a 