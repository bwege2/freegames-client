#!/usr/bin/env python3
"""Builds the browser asset subset of 0 A.D. Release 28 (v0.28.0) for web/games/0ad/.

The reference tree is unpacked by re/0ad/fetch.sh into re/0ad/orig/0ad-0.28.0 (gitignored)
and its public mod is unpacked into re/0ad/work/public. This script then copies only the
data the port uses:

  * the skirmish map Farmland (2): its scenario XML and PMP terrain;
  * the 23 terrain textures the map names, converted from DDS to lossless WebP;
  * the map's sky set (five cube faces), converted from DDS to lossless WebP;
  * the templates of the two civilisations the port plays (Athenians and Carthaginians), their
    units, their seven buildings each and the Gaia resources/fauna on the map, with their whole
    parent/mixin chain;
  * the actors, variants, PMD meshes, PSA animations and textures those templates and actors
    reach, converted DDS -> lossless WebP where needed;
  * the original portrait icons of those templates and the four resource icons.

Every copied file is recorded with its source path, size and SHA-256 in assets/MANIFEST.json.
The port code is GPL-3.0-or-later.  Templates, simulation data and maps are GPL-2.0-or-later
(binaries/data in the reference).  Art (models, textures, actor/variant XML) is CC BY-SA 3.0.
See web/games/0ad/LICENSE.md.

  python3 -I re/0ad/tools/assets.py [path-to-reference-tree]
"""
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
RE = os.path.dirname(HERE)
REPO = os.path.dirname(os.path.dirname(RE))
ORIG = os.path.join(RE, 'orig')
MOD = os.path.join(RE, 'work', 'mod')
OUT = os.path.join(REPO, 'web', 'games', '0ad', 'assets')
REF = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else (os.path.join(RE, 'work', 'public') if os.path.isdir(os.path.join(RE, 'work', 'public')) else os.path.join(ORIG, 'public'))

MAP = 'farmland_2p'

# The templates the port reads.  Their parents, mixins and special/filter layers are copied
# transitively by copy_template().
TEMPLATES = [
    # Athenian buildings
    'structures/athen/civil_centre',
    'structures/athen/house',
    'structures/athen/storehouse',
    'structures/athen/farmstead',
    'structures/athen/field',
    'structures/athen/barracks',
    'structures/athen/defense_tower',
    # Athenian units
    'units/athen/infantry_spearman_b',
    'units/athen/infantry_slinger_b',
    'units/athen/support_civilian',
    # Carthaginian buildings (the same seven Village-phase buildings, Punic actors)
    'structures/cart/civil_centre',
    'structures/cart/house',
    'structures/cart/storehouse',
    'structures/cart/farmstead',
    'structures/cart/field',
    'structures/cart/barracks',
    'structures/cart/defense_tower',
    # Carthaginian units: a spearman and an archer (the original Civ's skirmish replacements)
    'units/cart/infantry_spearman_b',
    'units/cart/infantry_archer_b',
    'units/cart/support_civilian',
    # Gaia resources and fauna on Farmland (2)
    'gaia/tree/temperate',
    'gaia/tree/fir',
    'gaia/tree/bush_temperate',
    'gaia/rock/temperate_small',
    'gaia/fruit/berry_01',
    'gaia/ore/temperate_01',
    'gaia/fauna_deer',
]

# Map templates that only wrap a civ-specific template in SkirmishReplacer.
REPLACED = {
    'skirmish/structures/default_civil_centre': 'structures/{civ}/civil_centre',
    'skirmish/units/default_support_civilian': 'units/{civ}/support_civilian',
    'skirmish/units/default_infantry_melee_b': 'units/{civ}/infantry_spearman_b',
    'skirmish/units/default_infantry_ranged_b': 'units/{civ}/infantry_slinger_b',
}

# Pure scenery actors named directly with "actor|..." in the map XML.  Ground decals, puddles
# and the other eyecandy actors are not copied: the browser port draws no decal layer.
SCENERY_ACTORS = [
    'flora/trees/grass_1',
    'geology/stone_granite_greek_med',
]

# Animation names the port plays.  All variants of a name are copied (the original picks one
# by frequency/seed).
ANIMATION_NAMES = {
    'idle', 'walk', 'run', 'attack_melee', 'attack_ranged', 'death',
    'build', 'gather_tree', 'gather_grain', 'gather_fruit', 'gather_meat',
    'gather_rock', 'gather_ore',
}

# Props attached to units that the port draws.  A unit's base variant may also carry a tool
# (axe/mallet) for gathering; those are skipped because the port does not swap tools.
UNIT_PROP_POINTS = {'head', 'helmet', 'weapon_R', 'shield', 'shield_arm'}
SKIP_PROP_WORDS = ('decal', 'dirt_', 'mud', 'particle', 'paving', 'sparkle', 'rubble', 'scaffold')

COPIED = []          # {kind, source, dest, bytes, sha256}
ICON_FILES = {}      # portrait source -> shipped file, converted once
SEEN = set()


def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def ensure(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)


def record(kind, source, dest):
    rel = os.path.relpath(source, REF)
    key = (kind, rel)
    if key in SEEN:
        return
    SEEN.add(key)
    COPIED.append({
        'kind': kind,
        'source': rel,
        'dest': os.path.relpath(dest, OUT),
        'bytes': os.path.getsize(dest),
        'sha256': sha256(dest),
    })


def convert_image(source, dest, resize=None):
    """DDS/PNG/JPG -> lossless WebP (or PNG for the small UI icons), alpha preserved."""
    ensure(dest)
    cmd = ['magick', source]
    if resize:
        cmd += ['-filter', 'Lanczos', '-resize', f'{resize}x{resize}']
    if dest.lower().endswith('.webp'):
        cmd += ['-define', 'webp:lossless=true', dest]
    else:
        cmd.append('PNG32:' + dest)
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


def find_texture(file):
    """An actor texture path ("skeletal/hele/x.png") -> its real file in the reference tree."""
    rel = file.replace('\\', '/')
    roots = [os.path.join(REF, 'art', 'textures', 'skins'), os.path.join(REF, 'art', 'textures')]
    candidates = []
    for root in roots:
        base = os.path.join(root, rel)
        candidates.append(base)
        if rel.lower().endswith(('.png', '.dds', '.jpg')):
            stem = base.rsplit('.', 1)[0]
            candidates += [stem + '.png.cached.dds', stem + '.dds.cached.dds',
                           stem + '.png', stem + '.dds', stem + '.jpg']
    for c in candidates:
        if os.path.isfile(c) and not c.endswith('.cached.xmb'):
            return c
    return None


def copy_texture(file, dest_name=None, kind='art-texture'):
    if not file:
        return None
    lower = file.lower()
    if any(x in lower for x in ('_norm', '_spec', 'null_', 'default_norm', 'blackness')):
        return None
    src = find_texture(file)
    if not src:
        raise SystemExit('texture not found: ' + file)
    logical = dest_name or re.sub(r'\.(dds|png|jpg)$', '', file, flags=re.I) + '.webp'
    dest = os.path.join(OUT, 'textures', logical)
    convert_image(src, dest)
    record(kind, src, dest)
    return logical


def template_path(name):
    for sub in ('special/filter', 'mixins', ''):
        p = os.path.join(REF, 'simulation', 'templates', sub, name + '.xml')
        if os.path.isfile(p):
            return p
    raise SystemExit('template not found: ' + name)


def copy_template(name):
    src = template_path(name)
    rel = os.path.relpath(src, os.path.join(REF, 'simulation', 'templates'))
    dest = os.path.join(OUT, 'templates', rel)
    ensure(dest)
    shutil.copyfile(src, dest)
    record('template', src, dest)
    root = ET.parse(src).getroot()
    parent = root.get('parent')
    if parent:
        for layer in parent.split('|'):
            copy_template(layer)
    return root


def actor_source(name):
    name = re.sub(r'\.xml$', '', name, flags=re.I)
    p = os.path.join(REF, 'art', 'actors', name + '.xml')
    if not os.path.isfile(p):
        raise SystemExit('actor not found: ' + name)
    return p


def variant_source(name):
    name = re.sub(r'\.xml$', '', name, flags=re.I)
    p = os.path.join(REF, 'art', 'variants', name + '.xml')
    if not os.path.isfile(p):
        raise SystemExit('variant not found: ' + name)
    return p


def copy_mesh(file, kind='mesh'):
    name = re.sub(r'\.dae$', '', file, flags=re.I)
    src = os.path.join(REF, 'art', 'meshes', name + '.dae.cached.pmd')
    if not os.path.isfile(src):
        raise SystemExit('mesh not found: ' + file + ' -> ' + src)
    dest = os.path.join(OUT, 'meshes', name + '.pmd')
    ensure(dest)
    shutil.copyfile(src, dest)
    record(kind, src, dest)
    return name + '.pmd'


def copy_animation(file, kind='animation'):
    name = re.sub(r'\.dae$', '', file, flags=re.I)
    src = os.path.join(REF, 'art', 'animation', name + '.dae.cached.psa')
    if not os.path.isfile(src):
        raise SystemExit('animation not found: ' + file)
    dest = os.path.join(OUT, 'animations', name + '.psa')
    ensure(dest)
    shutil.copyfile(src, dest)
    record(kind, src, dest)
    return name + '.psa'


def prop_visual(name, depth=0):
    """A prop actor reduced to the original mesh + base texture the port draws."""
    src = actor_source(name)
    dest = os.path.join(OUT, 'actors', name + '.xml')
    ensure(dest)
    shutil.copyfile(src, dest)
    record('actor', src, dest)
    root = ET.parse(src).getroot()
    material = (root.findtext('material') or '').strip() or None
    mesh = None
    textures = []
    def scan(node, depth=0):
        nonlocal mesh, textures
        if depth > 8:
            return
        file = node.get('file') if node.tag == 'variant' else None
        if file:
            scan(ET.parse(variant_source(file)).getroot(), depth + 1)
        m = node.findtext('mesh')
        if m and not mesh:
            mesh = copy_mesh(m.strip())
        texs = node.find('textures')
        if texs is not None and not textures:
            for tex in texs.findall('texture'):
                if tex.get('name') == 'baseTex' and tex.get('file'):
                    logical = copy_texture(tex.get('file').strip())
                    if logical:
                        textures.append(logical)
        for child in node.findall('variant'):
            scan(child, depth + 1)
        for group in node.findall('group'):
            for child in group.findall('variant'):
                scan(child, depth + 1)
    for group in root.findall('group'):
        for variant in group.findall('variant'):
            if int(variant.get('frequency', '1')) <= 0:
                continue
            scan(variant)
            if mesh and textures:
                break
        if mesh and textures:
            break
    if not mesh:
        return None
    return {'actor': name, 'mesh': mesh, 'textures': textures, 'material': material}


def merge_variant(info, variant, unit, collect_anims, depth=0):
    if depth > 12:
        raise SystemExit('variant recursion')
    vfile = variant.get('file')
    if vfile:
        root = ET.parse(variant_source(vfile)).getroot()
        merge_variant(info, root, unit, collect_anims, depth + 1)
    mesh = variant.findtext('mesh')
    if mesh:
        info['meshes'].append(copy_mesh(mesh.strip()))
    textures = variant.find('textures')
    if textures is not None:
        for tex in textures.findall('texture'):
            if tex.get('name') == 'baseTex' and tex.get('file'):
                logical = copy_texture(tex.get('file').strip())
                if logical:
                    info['textures'].append(logical)
    props = variant.find('props')
    if props is not None:
        for prop in props.findall('prop'):
            act = prop.get('actor')
            point = prop.get('attachpoint', '')
            if not act:
                continue
            if any(w in act.lower() for w in SKIP_PROP_WORDS + ('projectile',)) or 'projectile' in point:
                continue
            if unit and point not in UNIT_PROP_POINTS:
                continue
            act = re.sub(r'\.xml$', '', act, flags=re.I)
            pv = prop_visual(act)
            if pv:
                pv['attachpoint'] = point
                info['props'].append(pv)
    if collect_anims:
        anims = variant.find('animations')
        if anims is not None:
            for a in anims.findall('animation'):
                if (a.get('name') or '').lower() in ANIMATION_NAMES and a.get('file'):
                    info['animations'].append({
                        'name': a.get('name').lower(),
                        'file': copy_animation(a.get('file').strip()),
                        'id': a.get('id', ''),
                        'frequency': int(a.get('frequency', '1')),
                        'speed': float(a.get('speed', '100')),
                    })


def actor_visual(name, unit):
    """The actor's groups and their variants; the port picks one variant per group by seed."""
    src = actor_source(name)
    dest = os.path.join(OUT, 'actors', name + '.xml')
    ensure(dest)
    shutil.copyfile(src, dest)
    record('actor', src, dest)
    root = ET.parse(src).getroot()
    groups = []
    for group in root.findall('group'):
        variants = []
        for variant in group.findall('variant'):
            freq = int(variant.get('frequency', '1'))
            if freq <= 0:
                continue
            info = {'frequency': freq, 'name': variant.get('name', ''),
                    'meshes': [], 'textures': [], 'props': [], 'animations': []}
            merge_variant(info, variant, unit, collect_anims=True)
            if info['meshes'] or info['textures'] or info['props'] or info['animations']:
                variants.append(info)
        if variants:
            groups.append({'variants': variants})
    return {
        'actor': name,
        'material': (root.findtext('material') or '').strip() or None,
        'groups': groups,
    }


def icon_path(icon):
    src = os.path.join(REF, 'art', 'textures', 'ui', 'session', 'portraits', icon)
    if not os.path.isfile(src):
        src = os.path.join(REF, 'art', 'textures', 'ui', 'session', 'portraits', icon + '.cached.dds')
    if not os.path.isfile(src):
        # try common names (the template icons are relative to portraits/)
        candidates = []
        for root, _, files in os.walk(os.path.join(REF, 'art', 'textures', 'ui', 'session', 'portraits')):
            if os.path.basename(icon) in files or os.path.basename(icon) + '.cached.dds' in files:
                candidates.append(os.path.join(root, os.path.basename(icon)))
                break
        if not candidates:
            raise SystemExit('icon not found: ' + icon)
        src = candidates[0]
    if src in ICON_FILES:
        return ICON_FILES[src]
    # Unit portraits live under their civilisation (units/athen, units/cart): keep that level in
    # the shipped name, or the two civilisations' spearman and citizen icons overwrite each other.
    rel = re.sub(r'\.(dds|png)$', '', icon)
    name = rel + '.png' if icon.startswith('units/') else os.path.basename(rel) + '.png'
    dest = os.path.join(OUT, 'icons', name)
    ensure(dest)
    subprocess.run(['magick', src, '-resize', '128x128', 'PNG32:' + dest], check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    record('icon', src, dest)
    ICON_FILES[src] = name
    return name


def template_layers(name, seen=None):
    """The template file then its parent layers, the order the engine applies them."""
    seen = seen or set()
    if name in seen:
        return []
    seen.add(name)
    root = ET.parse(template_path(name)).getroot()
    out = [root]
    parent = root.get('parent')
    if parent:
        for layer in reversed(parent.split('|')):
            out += template_layers(layer, seen)
    return out


def template_actor(name):
    for root in template_layers(name):
        va = root.find('VisualActor')
        if va is not None and va.findtext('Actor'):
            return re.sub(r'\.xml$', '', va.findtext('Actor').strip(), flags=re.I)
    return None


def template_icon(name):
    for root in template_layers(name):
        ident = root.find('Identity')
        if ident is not None and ident.findtext('Icon'):
            return ident.findtext('Icon').strip()
    return None



def main():
    if not os.path.isdir(REF):
        raise SystemExit(f'reference not unpacked: {REF}\nrun re/0ad/fetch.sh')
    if not shutil.which('magick'):
        raise SystemExit('ImageMagick (magick) is needed to convert DDS to PNG')
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT)

    # map
    for ext in ('xml', 'pmp'):
        src = os.path.join(REF, 'maps', 'skirmishes', f'{MAP}.{ext}')
        dest = os.path.join(OUT, 'maps', f'{MAP}.{ext}')
        ensure(dest)
        shutil.copyfile(src, dest)
        record('map', src, dest)
    terrain = None
    # terrain textures: resolve the names stored in the PMP through art/terrains/**/<name>.xml
    import struct
    pmp = open(os.path.join(REF, 'maps', 'skirmishes', f'{MAP}.pmp'), 'rb').read()
    pos = 12
    patches = struct.unpack_from('<I', pmp, pos)[0]
    pos += 4
    vp = patches * 16 + 1
    pos += vp * vp * 2
    ntex = struct.unpack_from('<I', pmp, pos)[0]
    pos += 4
    names = []
    for _ in range(ntex):
        length = struct.unpack_from('<I', pmp, pos)[0]
        pos += 4
        names.append(pmp[pos:pos + length].decode())
        pos += length
    terrain = []
    terrain_root = os.path.join(REF, 'art', 'terrains')
    for name in names:
        found = None
        for root, _, files in os.walk(terrain_root):
            if name + '.xml' in files:
                found = os.path.join(root, name + '.xml')
                break
        if not found:
            raise SystemExit('terrain definition not found: ' + name)
        root = ET.parse(found).getroot()
        base = None
        for tex in root.iter('texture'):
            if tex.get('name') == 'baseTex':
                base = tex.get('file')
        if not base:
            raise SystemExit('terrain has no base texture: ' + name)
        src = os.path.join(REF, 'art', 'textures', 'terrain', base.replace('\\', '/'))
        if not os.path.isfile(src):
            src = src + '.cached.dds'
        if not os.path.isfile(src):
            raise SystemExit('terrain texture not found: ' + name + ' -> ' + base)
        dest = os.path.join(OUT, 'terrain', name + '.webp')
        convert_image(src, dest, resize=256)
        record('terrain-texture', src, dest)
        terrain.append({'name': name, 'file': f'terrain/{name}.webp', 'source': base})
    with open(os.path.join(OUT, 'terrain', 'terrains.json'), 'w') as f:
        json.dump(terrain, f, indent=1)

    # sky set of the map
    sky = 'default'
    sky_files = {}
    mod_zip = os.path.join(ORIG, '0ad-0.28.0', 'binaries', 'data', 'mods', 'mod', 'mod.zip')
    for face in ('front', 'back', 'top', 'right', 'left'):
        src = os.path.join(REF, 'art', 'textures', 'skies', sky, face + '.dds.cached.dds')
        if not os.path.isfile(src):
            src = os.path.join(REF, 'art', 'textures', 'skies', sky, face + '.dds')
        dest = os.path.join(OUT, 'sky', f'{sky}_{face}.webp')
        if not os.path.isfile(src):
            # the engine mod's unpacked tree (fetch.sh --unpack -> work/mod)
            src = os.path.join(MOD, 'art', 'textures', 'skies', sky, face + '.dds.cached.dds')
        if os.path.isfile(src):
            convert_image(src, dest)
            record('sky', src, dest)
        else:
            # last resort: read the member straight from the engine mod zip
            import zipfile
            member = f'art/textures/skies/{sky}/{face}.dds.cached.dds'
            with zipfile.ZipFile(os.path.abspath(mod_zip)) as z:
                data = z.read(member)
            tmp = os.path.join(ORIG, f'sky-{sky}-{face}.dds')
            with open(tmp, 'wb') as f:
                f.write(data)
            convert_image(tmp, dest)
            record('sky', tmp, dest)
            os.remove(tmp)
        sky_files[face] = f'sky/{sky}_{face}.webp'
    with open(os.path.join(OUT, 'sky', 'sky.json'), 'w') as f:
        json.dump({'name': sky, 'faces': sky_files}, f, indent=1)

    # templates and their visual actors
    templates = {}
    acts = {}
    for name in TEMPLATES:
        copy_template(name)
        templates[name] = {'file': os.path.relpath(template_path(name), os.path.join(REF, 'simulation', 'templates'))}
    for name in TEMPLATES:
        actor = template_actor(name)
        if name in ('structures/athen/field', 'structures/cart/field'):
            # plot_field_medit.xml has a thousand per-tile crop/foliage props; the port uses the
            # original's simple field plot actor (field_plot.dae + field_01.dds) instead.
            actor = 'structures/plot_field'
        if actor:
            actor = actor.replace('{phenotype}', 'male')
            if actor.startswith('actor|'):
                actor = actor[6:]
            acts[name] = actor_visual(actor, unit=name.startswith('units/'))
    for name in SCENERY_ACTORS:
        acts['actor|' + name] = actor_visual(name, unit=False)
    with open(os.path.join(OUT, 'actors.json'), 'w') as f:
        json.dump(acts, f, indent=1, ensure_ascii=False)

    # icons: template icons are relative to art/textures/ui/session/portraits/
    icons = {}
    for name in TEMPLATES:
        root = ET.parse(template_path(name)).getroot()
        icon = None
        # the icon may live in any layer, so look through the copied files' chain
        seen = set()
        def find_icon(n):
            nonlocal icon
            if n in seen:
                return
            seen.add(n)
            p = template_path(n)
            r = ET.parse(p).getroot()
            ident = r.find('Identity')
            if ident is not None and ident.findtext('Icon') and not icon:
                icon = ident.findtext('Icon').strip()
            parent = r.get('parent')
            if parent:
                for layer in parent.split('|'):
                    find_icon(layer)
        find_icon(name)
        if icon:
            icons[name] = icon_path(icon)
    for res in ('food', 'wood', 'stone', 'metal', 'population'):
        src = os.path.join(REF, 'art', 'textures', 'ui', 'session', 'icons', 'resources', res + '.png.cached.dds')
        dest = os.path.join(OUT, 'icons', res + '.png')
        convert_image(src, dest)
        record('icon', src, dest)
        icons['resource/' + res] = res + '.png'
    src = os.path.join(REF, 'art', 'textures', 'ui', 'session', 'portraits', 'emblems', 'emblem_athenians.png.cached.dds')
    dest = os.path.join(OUT, 'icon-source.png')
    convert_image(src, dest, resize=256)
    record('icon-source', src, dest)

    # the HUD's original fonts: FreeSans (GPL-3.0+ font exception) and Linux Biolinum (same).
    # They live in the engine mod; fetch.sh --unpack puts them in re/0ad/work/mod/fonts/.
    for name in ('FreeSans.ttf', 'FreeFont-LICENSE.txt', 'LinBiolinum_Rah.ttf', 'LibBiolinum-LICENSE.txt'):
        src = os.path.join(MOD, 'fonts', name)
        if not os.path.isfile(src):
            raise SystemExit('font not found (run fetch.sh --unpack): ' + src)
        dest = os.path.join(OUT, 'fonts', name)
        ensure(dest)
        shutil.copyfile(src, dest)
        record('font', src, dest)

    with open(os.path.join(OUT, 'icons', 'icons.json'), 'w') as f:
        json.dump(icons, f, indent=1)

    # The manifest describes the files as they finally are (an icon can be reached from several
    # templates; the last write must not leave an earlier record's hash stale).
    for c in COPIED:
        path = os.path.join(OUT, c['dest'])
        c['bytes'] = os.path.getsize(path)
        c['sha256'] = sha256(path)

    # manifest, grouped by licence
    art = [c for c in COPIED if c['kind'] in ('art-texture', 'terrain-texture', 'sky', 'unit-actor', 'scenery-actor',
                                              'prop', 'actor', 'variant', 'mesh', 'animation', 'icon', 'icon-source', 'font', 'ui')]
    data = [c for c in COPIED if c['kind'] in ('template', 'map')]
    manifest = {
        'reference': '0 A.D. Release 28 "Boiorix" (v0.28.0), Wildfire Games',
        'map': MAP,
        'counts': {'art': len(art), 'data': len(data)},
        'bytes': {'art': sum(c['bytes'] for c in art), 'data': sum(c['bytes'] for c in data)},
        'licenses': {
            'art': 'CC BY-SA 3.0 (binaries/data/mods/public/art)',
            'data': 'GPL-2.0-or-later (binaries/data: templates and maps)',
        },
        'files': sorted(COPIED, key=lambda c: c['dest']),
    }
    with open(os.path.join(OUT, 'MANIFEST.json'), 'w') as f:
        json.dump(manifest, f, indent=1)
    print(f'{len(COPIED)} files, {sum(c["bytes"] for c in COPIED)/1e6:.1f} MB '
          f'(art {manifest["bytes"]["art"]/1e6:.1f} MB, data {manifest["bytes"]["data"]/1e6:.1f} MB)')


if __name__ == '__main__':
    main()
