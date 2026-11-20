#!/usr/bin/env python3
# Builds a Walgelijk font file (.wf: a zip of meta.json + atlas.png, the format of MIR's base/fonts) from a TTF,
# for the two fonts of MIR that are not free (Impact, Toxigenesis): the port ships free fonts under their names.
# The original atlases are multi-channel distance fields; this one stores the glyphs' coverage in all three
# channels, which the same "median of r, g, b at 0.5" rendering draws as the glyph outline.
#   make-wf.py <font.ttf> <name> <out.wf>
import json, sys, zipfile, io
from PIL import Image, ImageDraw, ImageFont

ttf, name, out = sys.argv[1:4]
SIZE = 48
ATLAS = 512
font = ImageFont.truetype(ttf, SIZE)
ascent, descent = font.getmetrics()
chars = [chr(c) for c in range(32, 127)] + list('ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïñòóôõöùúûüýÿ€£')
atlas = Image.new('L', (ATLAS, ATLAS), 0)
draw = ImageDraw.Draw(atlas)
glyphs = []
x, y, row = 2, 2, 0
for ch in chars:
    try:
        l, t, r, b = font.getbbox(ch, anchor='ls')
    except Exception:
        continue
    adv = font.getlength(ch)
    w, h = r - l, b - t
    if ch.isspace() or w <= 0 or h <= 0:
        glyphs.append({'Character': ch, 'Advance': adv, 'GeometryRect': {'MinX': 0.0, 'MinY': float(ascent), 'MaxX': 0.0, 'MaxY': float(ascent)},
                       'TextureRect': {'MinX': 0.0, 'MinY': 0.0, 'MaxX': 0.0, 'MaxY': 0.0}})
        continue
    if x + w + 2 > ATLAS:
        x, y, row = 2, y + row + 2, 0
    if y + h + 2 > ATLAS:
        raise SystemExit('atlas too small')
    draw.text((x - l, y - t), ch, font=font, fill=255, anchor='ls')
    top = ascent + t  # distance from the line's top to the glyph's top (t is negative above the baseline)
    glyphs.append({'Character': ch, 'Advance': adv,
                   'GeometryRect': {'MinX': float(l), 'MinY': float(top + h), 'MaxX': float(r), 'MaxY': float(top)},
                   'TextureRect': {'MinX': x / ATLAS, 'MinY': 1 - (y + h) / ATLAS, 'MaxX': (x + w) / ATLAS, 'MaxY': 1 - y / ATLAS}})
    x += w + 2
    row = max(row, h)
caps = [g for g in glyphs if g['Character'].isupper() and g['Character'].isascii()]
lows = [g for g in glyphs if g['Character'].islower() and g['Character'].isascii()]
height = lambda g: g['GeometryRect']['MinY'] - g['GeometryRect']['MaxY']
meta = {'Name': name, 'Atlas': None, 'Kernings': [], 'Glyphs': glyphs, 'LineHeight': float(ascent + descent), 'Size': SIZE,
        'XHeight': sum(map(height, lows)) / len(lows), 'CapHeight': sum(map(height, caps)) / len(caps), 'Style': 0}
png = io.BytesIO()
Image.merge('RGB', (atlas, atlas, atlas)).save(png, 'PNG', optimize=True)
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    z.writestr('meta.json', json.dumps(meta))
    z.writestr('atlas.png', png.getvalue())
print(out, len(glyphs), 'glyphs')
