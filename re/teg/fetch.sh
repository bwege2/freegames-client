#!/usr/bin/env bash
# Downloads the reference version of Tenés Empanadas Graciela (TEG 0.13.0) into re/teg/orig/ and
# converts the data the port uses (web/games/teg/assets/):
#
#   * client/themes/m2/ (the client's default theme, by Wolfgang Morawetz): the board, the 50
#     country overlays, the four country-card pictures and the six dice, copied unchanged (the
#     country files have no extension in the original; they are PNGs and get ".png");
#   * client/teg_pix/ (the client's own pictures): the empanada logo, the player colour swatches,
#     the coloured army discs and the mission card background, copied unchanged;
#   * assets/theme.json: the theme XML (positions, continent offsets, army offsets, card names)
#     as JSON, so the port reads the same layout without an XML parser.
#
# Needs curl, tar and python3 (Pillow is NOT needed; only the standard library).
# The original archive is GPL-2.0-only; its licence and the asset provenance are in
# web/games/teg/LICENSE.md. The archive itself is not committed (re/*/orig/ is ignored).
set -euo pipefail
cd "$(dirname "$0")"

url=https://github.com/wfx/teg/archive/refs/tags/0.13.0.tar.gz
want=d643e0b1b4ebe4baaceb398435517c57a67d7aaaa25dc49880d5f50750b089fc  # 12832517 bytes
mkdir -p orig
[[ -f orig/teg-0.13.0.tar.gz ]] || curl -fsSL -o orig/teg-0.13.0.tar.gz "$url"
echo "$want  orig/teg-0.13.0.tar.gz" | sha256sum -c -

rm -rf orig/src && mkdir -p orig/src
tar -xzf orig/teg-0.13.0.tar.gz -C orig/src --strip-components=1
test -f orig/src/common/version.h

out=../../web/games/teg/assets/theme
pix=../../web/games/teg/assets/pix
mkdir -p "$out" "$pix"

# The default theme, m2 (client/gui-gnome/gui.cpp: g_settings_get_string(..., "theme", "m2")).
theme=orig/src/client/themes/m2
cp "$theme/board.jpg" "$out/board.jpg"
for f in "$theme"/*; do
    base=${f##*/}
    case $base in
        board.jpg|Makefile.am|teg_theme.xml|translate.c|mini_shot.png) continue ;;
        *.png) cp "$f" "$out/$base" ;;
        *) cp "$f" "$out/$base.png" ;;
    esac
done

# The client's own pictures (client/teg_pix): the theme-independent icons and discs.
pixsrc=orig/src/client/teg_pix
cp "$pixsrc"/teg_icono.png ../../web/games/teg/assets/icon.png
cp "$pixsrc"/objetivo.png "$pix/objetivo.png"
for f in "$pixsrc"/disc_*.png "$pixsrc"/color_player_*.png; do cp "$f" "$pix/${f##*/}"; done

python3 -I - "$theme/teg_theme.xml" "$out/theme.json" "$out" <<'PY'
import json, os, sys, xml.etree.ElementTree as ET

xml, dest, out = sys.argv[1], sys.argv[2], sys.argv[3]
root = ET.parse(xml).getroot()
assert root.tag == 'teg_theme', root.tag

def ints(tag, *names):
    return {n: int(tag.get(n, 0)) for n in names}

def ext(f):
    return f + '.png' if not f.endswith('.png') else f

def image_size(f):
    # PNG/JPEG dimensions from the file header, so theme.json needs no image library
    p = os.path.join(out, f)
    with open(p, 'rb') as fh:
        b = fh.read(32)
    if b[:8] == b'\x89PNG\r\n\x1a\n':
        return int.from_bytes(b[16:20], 'big'), int.from_bytes(b[20:24], 'big')
    if b[:2] == b'\xff\xd8':
        with open(p, 'rb') as fh:
            data = fh.read()
        i = 2
        while i < len(data):
            if data[i] != 0xff:
                i += 1
                continue
            while i < len(data) and data[i] == 0xff:
                i += 1
            if i >= len(data):
                break
            marker = data[i]
            i += 1
            if marker in (0xd8, 0xd9) or 0xd0 <= marker <= 0xd7:
                continue
            length = int.from_bytes(data[i:i+2], 'big')
            if 0xc0 <= marker <= 0xcf and marker not in (0xc4, 0xc8, 0xcc):
                h = int.from_bytes(data[i+3:i+5], 'big')
                w = int.from_bytes(data[i+5:i+7], 'big')
                return w, h
            i += length
    raise SystemExit(f'cannot read image size: {p}')

continents = []
for c in root.findall('continent'):
    countries = []
    for k in c.findall('country'):
        f = ext(k.get('file'))
        w, h = image_size(f)
        countries.append({
            'name': k.get('name'), 'file': f,
            'x': int(k.get('pos_x')), 'y': int(k.get('pos_y')),
            'armyX': int(k.get('army_x')), 'armyY': int(k.get('army_y')),
            'w': w, 'h': h,
        })
    continents.append({
        'name': c.get('name'), 'x': int(c.get('pos_x')), 'y': int(c.get('pos_y')),
        'countries': countries,
    })

cards = root.find('cards')
data = {
    'name': 'm2',
    'author': root.findtext('author'),
    'email': root.findtext('email'),
    'version': root.findtext('version'),
    'board': 'board.jpg',
    'boardW': image_size('board.jpg')[0],
    'boardH': image_size('board.jpg')[1],
    'dicePos': ints(root.find('dices_pos'), 'x', 'y'),
    'diceExt': ints(root.find('dices_ext_pos'), 'x1', 'y1', 'x2', 'y2', 'x3', 'y3', 'x4', 'y4', 'x5', 'y5', 'x6', 'y6'),
    'diceText': dict(ints(root.find('dices_text'), 'x1', 'y1', 'x2', 'y2'), color=root.find('dices_text').get('color')),
    'toolbar': {'file': root.find('toolbar').get('name'), 'textColor': root.find('toolbar').get('text_color')},
    'cards': {k.get('type'): ext(k.text) for k in cards.findall('card')},
    'cardsPosY': int(cards.findtext('pos_y')),
    'continents': continents,
}
json.dump(data, open(dest, 'w'), indent=1, ensure_ascii=False)
print(f'{dest}: {len(continents)} continents, {sum(len(c["countries"]) for c in continents)} countries, '
      f'board {data["boardW"]}x{data["boardH"]}')
PY

ls -l ../../web/games/teg/assets/theme/board.jpg ../../web/games/teg/assets/theme/theme.json
du -sh ../../web/games/teg/assets
