#!/usr/bin/env python3
# Draws the two replacement textures of the OpenCity port (re/opencity/LICENSE.md, "Replacement textures"):
#
#   graphism/hospitaldept/large/large.png        512x512 RGBA (the hospital: brick wall, windows, red cross,
#                                                 entrance, air conditioning fan; roofs, helipad and lawn)
#   graphism/industrial/containers/containers.png 256x256 RGBA (container doors and long sides)
#
# The original files contain photographs under CC BY-NC 2.0, CC BY-NC-SA 2.0 and CC BY-SA 2.0 and cannot be
# used. These replacements are drawn here from scratch, procedurally (rectangles, ellipses and seeded noise);
# no pixel of the original images is copied or traced. Only the layout is the same: every part sits in the
# same rectangle of the image as in the original, so the models' UV coordinates (large.ac, containers.ac)
# show the same part on the same face. The image sizes are the originals'.
#
# Written for the freegames project; the drawings and this script are dedicated to the public domain (CC0 1.0,
# https://creativecommons.org/publicdomain/zero/1.0/) and may also be used under GPL-2.0-or-later.
#
#   python3 -I re/opencity/tools/make_textures.py <out-dir>
# writes <out-dir>/large.png and <out-dir>/containers.png (deterministic: the same bytes on every run with the
# same Pillow version).
import os, random, sys
from PIL import Image, ImageDraw

out = sys.argv[1] if len(sys.argv) > 1 else '.'
rnd = random.Random(20261115)


def clamp(v):
    return max(0, min(255, int(v)))


def jitter(c, n):
    return tuple(clamp(x + rnd.randint(-n, n)) for x in c[:3]) + (255,)


def noise(img, box, n):
    """adds per-pixel noise of +-n to the rectangle box"""
    px = img.load()
    x0, y0, x1, y1 = box
    for y in range(y0, y1):
        for x in range(x0, x1):
            r, g, b, a = px[x, y]
            d = rnd.randint(-n, n)
            px[x, y] = (clamp(r + d), clamp(g + d), clamp(b + d), a)


# ---------------------------------------------------------------------------------------------- hospital
def bricks(img, box):
    """a running-bond brick wall: bricks 9x4 px with 1 px mortar, each brick its own red-brown"""
    d = ImageDraw.Draw(img)
    x0, y0, x1, y1 = box
    d.rectangle((x0, y0, x1 - 1, y1 - 1), fill=(196, 188, 176, 255))  # mortar
    bw, bh = 9, 4
    row = 0
    for y in range(y0, y1, bh):
        off = 0 if row % 2 == 0 else -(bw // 2)
        for x in range(x0 + off, x1, bw):
            k = rnd.random()
            if k < 0.08:
                base = (92, 70, 78)      # dark blue-brown header
            elif k < 0.20:
                base = (178, 104, 80)    # light
            else:
                base = (150, 66, 48)     # red
            c = jitter(base, 14)
            d.rectangle((max(x, x0), y, min(x + bw - 2, x1 - 1), min(y + bh - 2, y1 - 1)), fill=c)
        row += 1
    noise(img, box, 8)


def window(d, x, y, w, h):
    """a sash window with a sandstone lintel and a cream frame"""
    d.rectangle((x - 1, y - 3, x + w, y - 1), fill=(222, 196, 140, 255))          # lintel
    d.rectangle((x, y, x + w - 1, y + h - 1), fill=(236, 232, 206, 255))           # frame
    pane = (196, 192, 160, 255)
    mx = x + w // 2
    my = y + h // 2
    d.rectangle((x + 1, y + 1, mx - 1, my - 1), fill=pane)
    d.rectangle((mx + 1, y + 1, x + w - 2, my - 1), fill=pane)
    d.rectangle((x + 1, my + 1, mx - 1, y + h - 2), fill=pane)
    d.rectangle((mx + 1, my + 1, x + w - 2, y + h - 2), fill=pane)
    d.line((x, y + h, x + w - 1, y + h), fill=(214, 206, 180, 255))                # sill


def hospital():
    img = Image.new('RGBA', (512, 512), (0, 0, 0, 255))
    # left half: the facade
    bricks(img, (0, 0, 256, 512))
    d = ImageDraw.Draw(img)
    cross = (206, 12, 252, 60)
    fan = (180, 432, 240, 504)
    entrance = (88, 388, 118, 416)

    def hits(b, x, y, w, h):
        return not (x + w < b[0] or x > b[2] or y + h < b[1] or y > b[3])

    for j in range(14):
        y = round(9 + 29.7 * j)
        for i in range(13):
            x = round(7 + 18.25 * i)
            w, h = 12, 17
            if hits(cross, x, y, w, h) or hits(fan, x, y, w, h) or hits(entrance, x, y, w, h):
                continue
            window(d, x, y, w, h)
    # the entrance: a wide glazed double door with a canopy
    x0, y0, x1, y1 = entrance
    d.rectangle((x0 - 2, y0 - 4, x1 + 2, y0 - 1), fill=(222, 196, 140, 255))
    d.rectangle((x0, y0, x1, y1), fill=(236, 232, 206, 255))
    for k in range(3):
        a = x0 + 1 + k * 10
        d.rectangle((a, y0 + 2, a + 8, y1 - 1), fill=(170, 182, 176, 255))
    # the red cross on a white disc
    cx, cy = (cross[0] + cross[2]) // 2 + 1, (cross[1] + cross[3]) // 2 - 1
    d.ellipse((cx - 22, cy - 22, cx + 22, cy + 22), fill=(242, 242, 238, 255))
    red = (220, 24, 30, 255)
    d.rectangle((cx - 7, cy - 18, cx + 7, cy + 18), fill=red)
    d.rectangle((cx - 18, cy - 7, cx + 18, cy + 7), fill=red)
    # the air conditioning unit: a grey metal box with a round black fan
    x0, y0, x1, y1 = fan
    d.rectangle((x0, y0, x1 - 1, y1 - 1), fill=(150, 154, 152, 255))
    d.rectangle((x0 + 1, y0 + 1, x1 - 2, y1 - 2), outline=(118, 122, 120, 255))
    noise(img, fan, 4)
    fx, fy, fr = 210, 470, 29
    d.ellipse((fx - fr, fy - fr, fx + fr, fy + fr), fill=(20, 20, 22, 255))
    for r in range(fr - 2, 9, -4):
        d.ellipse((fx - r, fy - r, fx + r, fy + r), outline=(42, 42, 46, 255))
    for a in range(0, 360, 45):
        import math
        t = math.radians(a)
        d.line((fx + 10 * math.cos(t), fy + 10 * math.sin(t), fx + (fr - 1) * math.cos(t), fy + (fr - 1) * math.sin(t)),
               fill=(48, 48, 52, 255))
    d.ellipse((fx - 9, fy - 9, fx + 9, fy + 9), fill=(162, 164, 160, 255))
    for sx, sy in ((-4, -4), (4, -4), (-4, 4), (4, 4)):
        d.point((fx + sx, fy + sy), fill=(90, 90, 90, 255))

    # right half: the lawn with the two flat roofs, the bridge between them and the path to the road
    d.rectangle((256, 0, 511, 511), fill=(48, 128, 40, 255))
    px = img.load()
    for y in range(512):
        for x in range(256, 512):
            px[x, y] = jitter((48, 128, 40), 16)
    roof = (92, 96, 70, 255)
    edge = (226, 230, 226, 255)

    def flat_roof(poly):
        d.polygon(poly, fill=edge)
        # shrink by 2 px towards the centre for the gravel
        xs = [p[0] for p in poly]
        ys = [p[1] for p in poly]
        mx, my = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
        inner = [(x + (2 if x < mx else -2), y + (2 if y < my else -2)) for x, y in poly]
        d.polygon(inner, fill=roof)

    path = (180, 180, 176, 255)
    d.rectangle((256, 131, 318, 175), fill=path)                       # the path to the street
    flat_roof([(352, 11), (460, 11), (460, 28), (494, 28), (494, 238), (316, 238), (316, 28), (352, 28)])
    d.rectangle((302, 138, 318, 170), fill=edge)                       # the porch
    d.rectangle((304, 140, 318, 168), fill=roof)
    flat_roof([(403, 240), (442, 240), (442, 272), (403, 272)])       # the bridge
    flat_roof([(316, 275), (494, 275), (494, 486), (460, 486), (460, 501), (352, 501), (352, 486), (316, 486)])
    noise(img, (300, 10, 496, 503), 6)
    # the helipad: a yellow ring and H on the lower roof
    hx, hy = 380, 328
    d.ellipse((hx - 30, hy - 30, hx + 30, hy + 30), fill=(140, 146, 120, 255))
    d.ellipse((hx - 28, hy - 28, hx + 28, hy + 28), outline=(232, 222, 40, 255), width=4)
    yel = (232, 222, 40, 255)
    d.rectangle((hx - 12, hy - 12, hx - 7, hy + 12), fill=yel)
    d.rectangle((hx + 7, hy - 12, hx + 12, hy + 12), fill=yel)
    d.rectangle((hx - 7, hy - 2, hx + 7, hy + 2), fill=yel)
    return img


# ---------------------------------------------------------------------------------------------- containers
BLUE = (44, 104, 184)
GREEN = (120, 176, 52)
GREY = (150, 142, 140)


def container_door(img, box, base):
    """the door end of a container: two doors, four locking bars, hinges"""
    d = ImageDraw.Draw(img)
    x0, y0, x1, y1 = box
    dark = tuple(clamp(c * 0.55) for c in base) + (255,)
    d.rectangle((x0, y0, x1 - 1, y1 - 1), fill=dark)
    d.rectangle((x0 + 1, y0 + 2, x1 - 2, y1 - 3), fill=base + (255,))
    mid = (x0 + x1) // 2
    d.line((mid, y0 + 2, mid, y1 - 3), fill=dark)
    bar = tuple(clamp(c * 0.75) for c in base) + (255,)
    for bx in (x0 + 5, mid - 4, mid + 4, x1 - 6):
        d.line((bx, y0 + 3, bx, y1 - 4), fill=bar)
        d.rectangle((bx - 1, y0 + (y1 - y0) // 2, bx + 1, y0 + (y1 - y0) // 2 + 1), fill=(60, 60, 60, 255))
    for hy in (y0 + 5, y1 - 7):
        d.rectangle((x0 + 1, hy, x0 + 2, hy + 1), fill=(40, 40, 40, 255))
        d.rectangle((x1 - 3, hy, x1 - 2, hy + 1), fill=(40, 40, 40, 255))
    # a plain data plate
    d.rectangle((mid + 7, y0 + 5, mid + 12, y0 + 9), fill=(228, 228, 220, 255))
    noise(img, box, 7)


def container_side(img, box, base):
    """the long side of a container: corrugated panels, corner posts, top and bottom rails"""
    d = ImageDraw.Draw(img)
    x0, y0, x1, y1 = box
    dark = tuple(clamp(c * 0.55) for c in base) + (255,)
    light = tuple(clamp(c * 1.12) for c in base) + (255,)
    shade = tuple(clamp(c * 0.85) for c in base) + (255,)
    d.rectangle((x0, y0, x1 - 1, y1 - 1), fill=dark)
    d.rectangle((x0 + 2, y0 + 2, x1 - 3, y1 - 3), fill=base + (255,))
    for x in range(x0 + 3, x1 - 3, 3):
        d.line((x, y0 + 2, x, y1 - 3), fill=light)
        d.line((x + 1, y0 + 2, x + 1, y1 - 3), fill=shade)
    noise(img, box, 6)


def containers():
    img = Image.new('RGBA', (256, 256), (0, 0, 0, 255))
    rows = [
        (0, [BLUE, BLUE, GREEN, GREEN]),
        (36, [GREY, GREEN, BLUE, GREY, BLUE]),
        (72, [BLUE, BLUE, GREY, GREY, GREEN]),
    ]
    for y, colours in rows:
        for i, c in enumerate(colours):
            container_door(img, (i * 32, y, i * 32 + 32, y + 36), c)
    for box, c in [
        ((0, 108, 60, 144), BLUE), ((60, 108, 120, 144), GREY),
        ((0, 144, 60, 180), GREY), ((60, 144, 120, 180), GREEN),
        ((0, 180, 60, 216), BLUE), ((60, 180, 121, 216), BLUE),
        ((0, 216, 60, 252), GREEN),
        ((198, 112, 256, 148), GREY),
        ((136, 148, 196, 184), BLUE), ((196, 148, 256, 184), GREEN),
        ((136, 184, 196, 220), BLUE), ((196, 184, 256, 220), BLUE),
        ((136, 220, 196, 256), GREY), ((196, 220, 256, 256), GREY),
    ]:
        container_side(img, box, c)
    return img


os.makedirs(out, exist_ok=True)
hospital().save(os.path.join(out, 'large.png'), optimize=True)
containers().save(os.path.join(out, 'containers.png'), optimize=True)
