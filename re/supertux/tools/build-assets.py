#!/usr/bin/env python3
"""Copies the SuperTux 0.6.3 data the port uses into web/games/supertux/assets/.

Everything is copied unchanged (lossless): the original .stl/.stwm level files, .sprite and
.strf tile definitions, .stf bitmap fonts, PNG artwork, OGG/WAV music and sounds. The port parses
the original text formats at runtime, so no data is retranslated here.

Sprites are found by scanning the original's C++ for sprite names and by following every
sprite/image the Icy Island levels and the worldmap name; each .sprite's images are followed
relative to its own folder. Tileset images are followed relative to data/images/. Backgrounds are
followed through the original's fallback_paths table (Background::load_background). Every file's
licence and author is listed in web/games/supertux/LICENSE.md.

Run after re/supertux/fetch.sh:  python3 -I re/supertux/tools/build-assets.py
"""
import os, re, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
RE = os.path.dirname(HERE)                      # re/supertux
REPO = os.path.dirname(os.path.dirname(RE))     # checkout
SRC = os.path.join(RE, 'orig', 'SuperTux-v0.6.3-Source')
DATA = os.path.join(SRC, 'data')
OUT = os.path.join(REPO, 'web', 'games', 'supertux', 'assets')

# the original's Background::load_background fallback names (src/object/background.cpp)
FALLBACK = {
  'arctis2.png': 'antarctic/arctis2.png', 'misty_snowhills_small.png': 'antarctic/misty_snowhills_small.png',
  'semi_arctic.jpg': 'antarctic/semi_arctic.jpg', 'bridgecloud-dark.png': 'arctic_bridge/bridgecloud-dark.png',
  'bridgecloud-light.png': 'arctic_bridge/bridgecloud-light.png', 'bridgeocean-fade.png': 'arctic_bridge/bridgeocean-fade.png',
  'bridgeocean-nofade.png': 'arctic_bridge/bridgeocean-nofade.png', 'bridgeocean-original.png': 'arctic_bridge/bridgeocean-original.png',
  'arcticskies1.png': 'arcticskies/arcticskies1.png', 'arcticskies2.png': 'arcticskies/arcticskies2.png',
  'arcticskies3.png': 'arcticskies/arcticskies3.png', 'arcticskies35.png': 'arcticskies/arcticskies35.png',
  'arcticskies4.png': 'arcticskies/arcticskies4.png', 'block-snow-background.png': 'block_snow/block-snow-background.png',
  'block-snow-midground.png': 'block_snow/block-snow-midground.png', 'block-snow-top.png': 'block_snow/block-snow-top.png',
  'bluemountain-bottom.png': 'bluemountain/bluemountain-bottom.png', 'bluemountain-middle.png': 'bluemountain/bluemountain-middle.png',
  'bluemountain-top.png': 'bluemountain/bluemountain-top.png', 'bluemountain2.png': 'bluemountain/bluemountain2.png',
  'castle_foreground.png': 'castle/castle_foreground.png', 'snowcastle.png': 'castle/snowcastle.png',
  'cloud-mountains-background.png': 'cloud_mountains/cloud-mountains-background.png',
  'cloud-mountains-bottom.png': 'cloud_mountains/cloud-mountains-bottom.png',
  'cloud-mountains-forground.png': 'cloud_mountains/cloud-mountains-forground.png',
  'cloud-mountains-midground.png': 'cloud_mountains/cloud-mountains-midground.png',
  'dawn_hill_para_blur.png': 'forest/dawn_hill_para_blur.png', 'forest2_para.png': 'forest/forest2_para.png',
  'forest_para2.png': 'forest/forest_para2.png', 'forest_para3.png': 'forest/forest_para3.png',
  'forest_para3_bottom.png': 'forest/forest_para3_bottom.png', 'nighthills.png': 'forest/nighthills.png',
  'ghostforest.jpg': 'ghostforest/ghostforest.jpg', 'ghostforest_grave.png': 'ghostforest/ghostforest_grave.png',
  'ghostforest_para.png': 'ghostforest/ghostforest_para.png', 'cave2.jpg': 'ice_cave/cave2.jpg',
  'darkcave-background.png': 'ice_cave/darkcave-background.png', 'darkcave-middle.png': 'ice_cave/darkcave-middle.png',
  'darkcave-preview.png': 'ice_cave/darkcave-preview.png', 'darkcave-top_and_bottom.png': 'ice_cave/darkcave-top_and_bottom.png',
  'darkcavemidground-middle.png': 'ice_cave/darkcavemidground-middle.png',
  'darkcavemidground-top_and_bottom.png': 'ice_cave/darkcavemidground-top_and_bottom.png',
  'black_800px.png': 'misc/black_800px.png', 'fog.png': 'misc/fog.png', 'grid.png': 'misc/grid.png',
  'grid.surface': 'misc/grid.surface', 'heatshimmer-displacement.png': 'misc/heatshimmer-displacement.png',
  'heatshimmer.png': 'misc/heatshimmer.png', 'heatshimmer.surface': 'misc/heatshimmer.surface',
  'leaves.png': 'misc/leaves.png', 'oiltux.jpg': 'misc/oiltux.jpg', 'transparent_up.png': 'misc/transparent_up.png',
  'nightsky.png': 'nightsky/nightsky.png', 'nightsky_bottom.png': 'nightsky/nightsky_bottom.png',
  'nightsky_middle.png': 'nightsky/nightsky_middle.png', 'nightsky_para.png': 'nightsky/nightsky_para.png',
  'nightsky_top.png': 'nightsky/nightsky_top.png',
}

TOK = re.compile(r'\s*(?:(\()|(\))|("(?:[^"\\]|\\.)*")|([^\s()]+))')
def parse(s):
    """SuperTux S-expressions: ; comments outside strings, quoted strings, atoms and lists."""
    out, q, i = [], False, 0
    while i < len(s):
        c = s[i]
        if c == '"':
            q = not q; out.append(c)
        elif c == ';' and not q:
            while i < len(s) and s[i] != '\n': i += 1
            continue
        else:
            out.append(c)
        i += 1
    s = ''.join(out); pos = 0; stack = [[]]
    while True:
        m = TOK.match(s, pos)
        if not m: break
        pos = m.end()
        if m.group(1): stack.append([])
        elif m.group(2):
            x = stack.pop(); stack[-1].append(x)
        elif m.group(3):
            t = m.group(3)[1:-1]
            t = t.replace('\\"', '"').replace('\\\\', '\\')
            stack[-1].append(t)
        elif m.group(4):
            stack[-1].append(m.group(4))
    return stack[0][0]

def nodes(node):
    yield node
    if isinstance(node, list):
        for x in node[1:]:
            yield from nodes(x)

copied = set()
wanted = set()   # (source absolute path) -> logical target relative to assets/

def want(path, logical=None):
    """queue a data/-relative path (or absolute with leading /) for copying"""
    p = path.lstrip('/')
    src = os.path.join(DATA, p)
    if not os.path.isfile(src):
        print(f'  (missing in the release: {path})', file=sys.stderr)
        return
    wanted.add((src, logical or p))

def follow_sprite(sprite_path):
    """copy a .sprite and every image it names, relative to its folder"""
    p = sprite_path.lstrip('/')
    if p.startswith('images/') is False and not p.startswith('/'):
        p = 'images/' + p
    src = os.path.join(DATA, p)
    if not os.path.isfile(src):
        print(f'  (missing sprite: {sprite_path})', file=sys.stderr)
        return
    want(p)
    d = os.path.dirname(p)
    doc = parse(open(src, encoding='utf-8', errors='replace').read())
    for n in nodes(doc):
        if isinstance(n, list) and n:
            if n[0] in ('images', 'image', 'editor-images', 'glyphs', 'shadows', 'glyph-image', 'shadow-image', 'file'):
                vals = n[1:] if n[0] not in ('images', 'editor-images') else n[1:]
                for v in vals:
                    if not isinstance(v, str): continue
                    if n[0] in ('glyphs', 'shadows', 'glyph-image', 'shadow-image'):
                        continue   # handled by follow_font
                    want(os.path.join(d, v))
            if n[0] == 'surface':
                # (surface (image "x") ...) from a .surface file
                for sub in n[1:]:
                    if isinstance(sub, list) and sub and sub[0] in ('image', 'diffuse-texture', 'displacement-texture'):
                        for v in sub[1:]:
                            if isinstance(v, str): want(os.path.join(d, v))

def follow_font(name):
    p = os.path.join('fonts', name)
    want(p)
    doc = parse(open(os.path.join(DATA, p), encoding='utf-8', errors='replace').read())
    for n in nodes(doc):
        if isinstance(n, list) and n and n[0] in ('glyphs', 'shadows', 'glyph-image', 'shadow-image'):
            for v in n[1:]:
                if isinstance(v, str): want(os.path.join('images/engine/fonts', v))

def follow_tileset(rel):
    p = os.path.join('images', rel)
    want(p)
    doc = parse(open(os.path.join(DATA, p), encoding='utf-8', errors='replace').read())
    d = os.path.dirname(p)
    def walk(n):
        if isinstance(n, list) and n:
            if n[0] in ('images', 'image', 'editor-images'):
                for v in n[1:]:
                    if isinstance(v, str): want(os.path.join(d, v))
                    elif isinstance(v, list) and v and v[0] == 'region' and len(v) > 1:
                        want(os.path.join(d, v[1]))
            for x in n[1:]: walk(x)
    walk(doc)

def main():
    if not os.path.isdir(DATA):
        sys.exit(f'missing {DATA}: run re/supertux/fetch.sh first')
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT)

    levels = sorted(f for f in os.listdir(os.path.join(DATA, 'levels/world1')) if f.endswith('.stl'))
    for f in levels:
        want(os.path.join('levels/world1', f))
    want('levels/world1/worldmap.stwm')
    want('images/tiles.strf')
    want('images/worldmap.strf')
    follow_tileset('tiles.strf')
    follow_tileset('worldmap.strf')
    follow_tileset('ice_world.strf')
    follow_font('white.stf')
    follow_font('andale12.stf')
    want('images/engine/fonts/white.png'); want('images/engine/fonts/shadow.png')
    want('images/engine/menu/logo.png')
    want('images/engine/missing.png')
    want('images/engine/icons/supertux-256x256.png')
    want('images/engine/hud/airarrow.png')
    for f in os.listdir(os.path.join(DATA, 'images/engine/hud')):
        want(os.path.join('images/engine/hud', f))
    follow_sprite('images/objects/firefly/firefly.sprite')

    # every sprite the Icy Island levels or the worldmap name
    for f in levels + ['worldmap.stwm']:
        doc = parse(open(os.path.join(DATA, 'levels/world1', f), encoding='utf-8', errors='replace').read())
        for n in nodes(doc):
            if isinstance(n, list) and n and n[0] in ('sprite',):
                for v in n[1:]:
                    if isinstance(v, str) and v.endswith('.sprite'): follow_sprite(v)
            if isinstance(n, list) and n and n[0] == 'background':
                for sub in n[1:]:
                    if isinstance(sub, list) and sub and sub[0] in ('image', 'image-top', 'image-bottom', 'image-top', 'image-bottom'):
                        for v in sub[1:]:
                            if isinstance(v, str):
                                p = v.lstrip('/')
                                if p.startswith('images/background/'):
                                    name = p[len('images/background/'):]
                                    cand = os.path.join(DATA, 'images/background', FALLBACK.get(name, name))
                                    if os.path.isfile(cand): want('images/background/' + FALLBACK.get(name, name))
                                    else: print(f'  (missing background: {v})', file=sys.stderr)
            if isinstance(n, list) and n and n[0] in ('decal',):
                for sub in n[1:]:
                    if isinstance(sub, list) and sub and sub[0] == 'sprite':
                        for v in sub[1:]:
                            if isinstance(v, str): follow_sprite(v) if v.endswith('.sprite') else want(v.lstrip('/'))

    # sprites named in the C++ (badguys, objects, particles, player, triggers)
    sprite_names = set()
    for root, _, files in os.walk(os.path.join(SRC, 'src')):
        for f in files:
            if not f.endswith(('.cpp', '.hpp')): continue
            text = open(os.path.join(root, f), encoding='utf-8', errors='replace').read()
            for m in re.finditer(r'"([^"\n]+\.sprite)"', text):
                sprite_names.add(m.group(1))
            for m in re.finditer(r'"((?:images/)?(?:particles|objects|creatures|powerups)/[^"\n]+)"', text):
                v = m.group(1)
                if not v.endswith('.sprite') and os.path.isfile(os.path.join(DATA, v)):
                    want(v)
    for s in sorted(sprite_names):
        follow_sprite(s)

    # music: every .music the levels and worldmap name, plus its ogg
    musics = set()
    for f in levels + ['worldmap.stwm']:
        text = open(os.path.join(DATA, 'levels/world1', f), encoding='utf-8', errors='replace').read()
        musics |= set(re.findall(r'\(file\s+"([^"]+\.music)"\)', text))
    for m in sorted(musics):
        want(m.lstrip('/'))
        src = os.path.join(DATA, m.lstrip('/'))
        if os.path.isfile(src):
            doc = parse(open(src, encoding='utf-8', errors='replace').read())
            for n in nodes(doc):
                if isinstance(n, list) and n and n[0] == 'file':
                    for v in n[1:]:
                        if isinstance(v, str) and v.endswith('.ogg'):
                            want(os.path.join(os.path.dirname(m.lstrip('/')), v))

    # sounds: all except the one sound whose licence (CC-BY-SA 3.0) is not GPL-compatible
    # (splash.ogg, see LICENSE.md); the port uses splash.wav instead
    for f in os.listdir(os.path.join(DATA, 'sounds')):
        if f == 'normalize.sh' or f == 'splash.ogg': continue
        want(os.path.join('sounds', f))

    # particles (smoke puffs, ice pieces, sparkles) - small, all of them
    for root, _, files in os.walk(os.path.join(DATA, 'images/particles')):
        for f in files:
            want(os.path.relpath(os.path.join(root, f), DATA))

    n = 0; size = 0
    for src, logical in sorted(wanted):
        dst = os.path.join(OUT, logical)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copyfile(src, dst)
        n += 1; size += os.path.getsize(dst)
    print(f'copied {n} files, {size / 1e6:.1f} MB, into {OUT}')
    missing = [p for p, _ in ((os.path.join(DATA, x), y) for x, y in [])]
    print(f'levels: {len(levels)}, sprites: {len(sprite_names)}, music: {len(musics)}')

if __name__ == '__main__':
    main()
