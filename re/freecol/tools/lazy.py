#!/usr/bin/env python3
# Writes "lazyAssets" in web/games/freecol/game.json: every file of web/games/freecol/assets except those the
# first screen needs (re/freecol/startup-files.txt: the files the client reads until its main menu shows,
# plus the main menu's music), as few globs as possible. Play downloads the rest only when the game reads it.
#   python3 -I re/freecol/tools/lazy.py
import json
import os
import sys

here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
game = os.path.normpath(os.path.join(here, '..', '..', 'web', 'games', 'freecol'))
assets = os.path.join(game, 'assets')

needed = set()
with open(os.path.join(here, 'startup-files.txt')) as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#'):
            needed.add('assets' + line)  # /data/x -> assets/data/x

def walk(rel):
    """Globs for the files under rel (a folder in the game's folder) that are not needed."""
    names = sorted(os.listdir(os.path.join(game, rel)))
    subtree_needed = any(n.startswith(rel + '/') for n in needed)
    if not subtree_needed:
        return [rel + '/**']
    out = []
    for n in names:
        p = rel + '/' + n
        if os.path.isdir(os.path.join(game, p)):
            out += walk(p)
        elif p not in needed:
            out.append(p)
    return out

missing = [n for n in needed if not os.path.exists(os.path.join(game, n))]
if missing:
    sys.exit('not in the assets: ' + ', '.join(sorted(missing)))
globs = walk('assets')
path = os.path.join(game, 'game.json')
with open(path) as f:
    manifest = json.load(f)
manifest['lazyAssets'] = globs
with open(path, 'w') as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)
    f.write('\n')
print(len(globs), 'globs;', len(needed), 'files needed at the start')
