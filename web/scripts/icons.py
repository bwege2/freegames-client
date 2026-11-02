#!/usr/bin/env python3
# freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
# Draws each listed game's favicon: web/icons/<id>.png (48x48, the page's rel="icon", what Google Search shows) and
# web/icons/<id>-180.png (180x180, the rel="apple-touch-icon"). web/scripts/seo.mjs copies them next to the game's
# page at its own host. The site's own icon (freegames.stream): web/public/icon.png and apple-touch-icon.png.
# The PNGs are committed; run this again only to change an icon.
#
# Every icon is a rounded square tile in the site's style. Games with a logo or an emblem of their own get it from
# their artwork (the game's own files, under the game's license; recorded in the game's LICENSE.md, "Favicon").
# Text-era games get their title's first letter, drawn by us: a phosphor glyph on a terminal-black tile for terminal
# games, a white letter on a colour of their own for the others. Games whose art may not be used (Abuse) get a letter.
#
# Needs Python 3 with Pillow, and ImageMagick (`magick`) for the one SVG source (TuxMath). A few sources are not
# committed and come from the reference archives the games' fetch scripts unpack into re/<id>/orig/ (2048, Biniax,
# A Dark Room, Passage, TuxMath); pass the folder that holds those re/ folders if it is not this checkout's:
#   python3 -I web/scripts/icons.py [path/to/repo]
import json, os, subprocess, sys, tempfile
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

WEB = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
REPO = os.path.dirname(WEB)
ORIG = os.path.join(sys.argv[1] if len(sys.argv) > 1 else REPO, 're')
OUT = os.path.join(WEB, 'icons')
G = lambda *p: os.path.join(WEB, 'games', *p)
FONT_SANS = G('freecol', 'assets', 'fonts', 'DejaVuSans-Bold.ttf')
FONT_MONO = G('freecol', 'assets', 'fonts', 'DejaVuSansMono-Bold.ttf')
FONT_PLAIN = G('freecol', 'assets', 'fonts', 'DejaVuSans.ttf')
SS = 4  # supersampling for what we draw


def hexc(s, a=255):
    s = s.lstrip('#')
    return (int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16), a)


def tile(S, fill, top=None):
    """the rounded square every icon sits on; top: a second colour for a vertical gradient"""
    big = S * SS
    bg = Image.new('RGBA', (big, big), hexc(fill))
    if top:
        a, b = hexc(top), hexc(fill)
        grad = Image.new('RGBA', (1, big))
        for y in range(big):
            t = y / (big - 1)
            grad.putpixel((0, y), tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(4)))
        bg = grad.resize((big, big))
    mask = Image.new('L', (big, big), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, big - 1, big - 1), radius=round(big * 0.22), fill=255)
    out = Image.new('RGBA', (big, big), (0, 0, 0, 0))
    out.paste(bg, (0, 0), mask)
    return out.resize((S, S), Image.LANCZOS)


def clip(img, S):
    """keeps an icon inside the rounded tile"""
    big = S * SS
    mask = Image.new('L', (big, big), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, big - 1, big - 1), radius=round(big * 0.22), fill=255)
    mask = mask.resize((S, S), Image.LANCZOS)
    img.putalpha(ImageChops.multiply(img.getchannel('A'), mask))
    return img


def place(base, art, box, smooth=True):
    """art scaled to fit box (x, y, w, h) of base, centred"""
    x, y, w, h = box
    k = min(w / art.width, h / art.height)
    size = (max(1, round(art.width * k)), max(1, round(art.height * k)))
    a = art.resize(size, Image.LANCZOS if smooth else Image.NEAREST)
    base.alpha_composite(a, (round(x + (w - size[0]) / 2), round(y + (h - size[1]) / 2)))
    return base


def pixel_place(base, art, scale, dy=0):
    """pixel art at a whole-number scale, centred"""
    a = art.resize((art.width * scale, art.height * scale), Image.NEAREST)
    base.alpha_composite(a, ((base.width - a.width) // 2, (base.height - a.height) // 2 + dy))
    return base


def letter(S, ch, fill, fg='#ffffff', font=FONT_SANS, size=0.62, top=None, dy=0.0):
    base = tile(S, fill, top)
    big = S * SS
    lay = Image.new('RGBA', (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    f = ImageFont.truetype(font, round(big * size))
    d.text((big / 2, big / 2 + dy * big), ch, font=f, fill=hexc(fg), anchor='mm')
    base.alpha_composite(lay.resize((S, S), Image.LANCZOS))
    return base


def terminal(S, ch, fg):
    """a text-mode game: its glyph in a phosphor colour on a terminal-black tile"""
    return letter(S, ch, "#101418", fg=fg, font=FONT_MONO, size=0.70)


def trim(img):
    bb = img.getchannel('A').getbbox()
    return img.crop(bb) if bb else img


def opaque_to_alpha(img, key, tol=8):
    """a colour key (the original's background) made transparent"""
    img = img.convert('RGBA')
    px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if abs(r - key[0]) <= tol and abs(g - key[1]) <= tol and abs(b - key[2]) <= tol:
                px[x, y] = (r, g, b, 0)
    return img


def fb_file(name):
    """a file of Frozen Bubble's packed data (re/frozenbubble/tools/pack.py)"""
    import struct, io
    b = open(G('frozenbubble', 'assets', 'fb-data.bin'), 'rb').read()
    n = struct.unpack('<I', b[6:10])[0]
    idx = json.loads(b[10:10 + n])
    o, l = idx[name]
    return Image.open(io.BytesIO(b[10 + n + o:10 + n + o + l])).convert('RGBA')


def orig(*p):
    f = os.path.join(ORIG, *p)
    if not os.path.exists(f):
        sys.exit(f'missing {f}: run the game\'s re/<id>/fetch.sh (or pass the checkout that has it)')
    return f


# ---- the games

def i_2048(S):
    # the original's own apple-touch-icon (meta/apple-touch-icon.png, 152x152, MIT)
    art = Image.open(orig('2048', 'orig', '2048-478b6ec346e3787f589e4af751378d06ded4cbbc', 'meta', 'apple-touch-icon.png')).convert('RGBA')
    return clip(art.resize((S, S), Image.LANCZOS), S)


def i_frozenbubble(S):
    # the penguin from the pause screen (gfx/pause_0001.png), its head and shoulders, on ice blue
    art = fb_file('gfx/pause_0001.png')
    head = art.crop((12, 2, 152, 142))
    base = tile(S, '#9fd3f2', top='#e6f5ff')
    return clip(place(base, head, (S * 0.04, S * 0.06, S * 0.92, S * 0.98)), S)


def i_tuxracer(S):
    # the gold "T" of the Tux Racer logo on its snow (textures/splash_*.png, the splash screen's four quarters), on the splash screen's navy
    tex = G('tuxracer', 'assets', 'textures')
    splash = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
    for n, at in (('tl', (0, 0)), ('tr', (256, 0)), ('bl', (0, 256)), ('br', (256, 256))):
        splash.alpha_composite(Image.open(os.path.join(tex, f'splash_{n}.png')).convert('RGBA'), at)
    t = splash.crop((52, 84, 212, 244))
    base = tile(S, '#13213a', top='#22385e')
    return clip(place(base, t, (S * 0.02, S * 0.02, S * 0.96, S * 0.96)), S)


def tee(size):
    """Teeworlds' default tee (skins/default.json: standard body, feet and eyes in its colours), drawn the way
    RenderTee draws an idle tee facing right"""
    sk = G('teeworlds', 'assets', 'skins')
    body = Image.open(os.path.join(sk, 'body', 'standard.png')).convert('RGBA')
    feet = Image.open(os.path.join(sk, 'feet', 'standard.png')).convert('RGBA')
    eyes = Image.open(os.path.join(sk, 'eyes', 'standard.png')).convert('RGBA')
    cell = lambda im, x, y, w, h: im.crop((x, y, x + w, y + h))
    b_outline, b_fill = cell(body, 0, 0, 128, 128), cell(body, 128, 0, 128, 128)
    b_shadow, b_upper = cell(body, 0, 128, 128, 128), cell(body, 128, 128, 128, 128)
    f_fill, f_outline = cell(feet, 0, 0, 64, 64), cell(feet, 64, 0, 64, 64)
    e_normal = cell(eyes, 0, 0, 64, 32)

    def hsl(h, s, l):  # the 0.7 skin colour: HSL bytes, lightness above DARKEST_COLOR_LGT
        import colorsys
        dark = 61 / 255
        r, g, b = colorsys.hls_to_rgb(h / 255, dark + l / 255 * (1 - dark), s / 255)
        return (r, g, b)
    c_body, c_feet = hsl(27, 111, 116), hsl(28, 135, 62)

    def tint(im, c):
        r, g, b, a = im.split()
        return Image.merge('RGBA', (r.point(lambda v: v * c[0]), g.point(lambda v: v * c[1]), b.point(lambda v: v * c[2]), a))

    B = 64  # BaseSize; the canvas is 96 units, the tee's position at its centre
    k = size / 96
    can = Image.new('RGBA', (size, size), (0, 0, 0, 0))

    def quad(im, cx, cy, w, h):
        cx, cy = (48 + cx) * k, (48 + cy) * k
        q = im.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS)
        can.alpha_composite(q, (round(cx - q.width / 2), round(cy - q.height / 2)))
    fw = B / 2.1
    bx, by = 0, -4 + 6  # the body's idle offset, the whole tee moved down a little to centre it
    back, front = (-7, 10 + 6), (7, 10 + 6)
    quad(f_outline, *back, fw, fw)
    quad(b_outline, bx, by, B, B)
    quad(f_outline, *front, fw, fw)
    quad(tint(f_fill, c_feet), *back, fw, fw)
    quad(tint(b_fill, c_body), bx, by, B, B)
    quad(b_shadow, bx, by, B, B)
    quad(b_upper, bx, by, B, B)
    quad(e_normal, bx + 0.125 * B, by - 0.05 * B, 0.6 * B, 0.3 * B)
    quad(tint(f_fill, c_feet), *front, fw, fw)
    return can


def i_teeworlds(S):
    base = tile(S, '#6f9fd0', top='#a5c8ea')  # the menus' sky blue
    t = trim(tee(S * SS * 2))
    return clip(place(base, t, (S * 0.08, S * 0.08, S * 0.84, S * 0.84)), S)


def i_maelstrom(S):
    # the player's ship (sprites/icl8_200.png, 32x32) on black space with a few stars
    ship = Image.open(G('maelstrom', 'assets', 'sprites', 'icl8_200.png')).convert('RGBA')
    base = tile(S, '#000000', top='#0b0b2a')
    d = ImageDraw.Draw(base)
    for (x, y) in [(0.18, 0.2), (0.8, 0.16), (0.86, 0.7), (0.12, 0.78), (0.6, 0.88), (0.34, 0.1)]:
        r = max(0.5, S / 96)
        d.ellipse((x * S - r, y * S - r, x * S + r, y * S + r), fill=(220, 220, 255, 255))
    scale = 1 if S < 96 else 4
    return clip(pixel_place(base, ship, scale), S)


def i_sopwith(S):
    # SDL Sopwith's window icon (assets/sopwith.png, 128x128), already a black rounded tile with the plane
    art = Image.open(G('sopwith', 'assets', 'sopwith.png')).convert('RGBA')
    plane = art.crop((10, 10, 118, 118))
    return clip(place(tile(S, '#000000'), plane, (0, 0, S, S)), S)


def i_freecol(S):
    # FreeCol's own icon, the ship (data/freecol.png), on the sea
    art = Image.open(G('freecol', 'assets', 'data', 'freecol.png')).convert('RGBA')
    base = tile(S, '#1d5a8c', top='#6fb0e0')
    return clip(place(base, art, (S * 0.06, S * 0.04, S * 0.88, S * 0.92)), S)


def i_xpilot(S):
    # the orange "X" of XPilot's logo (textures/logo.ppm)
    art = Image.open(G('xpilot', 'assets', 'textures', 'logo.ppm')).convert('RGBA')
    x = art.crop((24, 10, 232, 218))
    return clip(place(tile(S, '#000000'), x, (0, 0, S, S)), S)


def i_tuxmath(S):
    # the game's icon: Tux with a sum (data/images/icons/icon.png at 48; tuxmath.svg for the large one)
    base = tile(S, '#1a2a6c', top='#3a5bb8')
    if S <= 48:
        art = Image.open(G('tuxmath', 'assets', 'images', 'icons', 'icon.png')).convert('RGBA')
    else:
        with tempfile.TemporaryDirectory() as t:
            p = os.path.join(t, 'tux.png')
            subprocess.run(['magick', '-background', 'none', '-density', '600',
                            orig('tuxmath', 'orig', 'tuxmath_w_fonts-2.0.3', 'data', 'images', 'icons', 'tuxmath.svg'),
                            '-resize', f'{S}x{S}', p], check=True)
            art = Image.open(p).convert('RGBA')
            art.load()
    return clip(place(base, trim(art), (S * 0.08, S * 0.08, S * 0.84, S * 0.84)), S)


def i_netrek(S):
    # the client's own icon (pixmaps/icon.png, 48x48 pixel art), on deep space
    art = Image.open(G('netrek', 'assets', 'pixmaps', 'icon.png')).convert('RGBA')
    base = tile(S, '#05081a', top='#16204a')
    a = trim(art)
    k = max(1, int(S * 0.8 // max(a.width, a.height)))
    return clip(pixel_place(base, a, k), S) if S > 48 else clip(place(base, a, (S * 0.1, S * 0.1, S * 0.8, S * 0.8)), S)


def i_darkroom(S):
    # "ADR", the game's own image (img/adr.png, MPL-2.0), on black
    art = Image.open(orig('darkroom', 'orig', 'adarkroom-1.4', 'img', 'adr.png')).convert('RGBA')
    gray = art.convert('L')
    letters = gray.point(lambda v: 255 if v > 60 else 0).getbbox()
    a = art.crop(letters)
    a.putalpha(gray.crop(letters))
    base = tile(S, '#000000')
    return clip(place(base, a, (S * 0.1, S * 0.1, S * 0.8, S * 0.8)), S)


def i_biniax(S):
    # the original's window icon (src/icon.ico, 32x32, zlib): its two elements in the field's corners
    art = Image.open(orig('biniax', 'orig', 'src', 'icon.ico')).convert('RGBA')
    base = tile(S, '#202020')
    if S == 48:
        return clip(place(base, art, (4, 4, 40, 40)), S)
    return clip(pixel_place(base, art, S // 36), S)


def i_passage(S):
    # the player and the spouse as the game draws them (characterSprite.png, spouseSprite.png: 8x8 frames,
    # public domain), under a heart (heart.png)
    root = ('passage', 'orig', 'Passage_v4_UnixSource', 'gamma256', 'gameSource')
    him = Image.open(orig(*root, 'characterSprite.png')).convert('RGBA').crop((0, 0, 8, 8))
    her = Image.open(orig(*root, 'spouseSprite.png')).convert('RGBA').crop((0, 0, 8, 8))
    heart = Image.open(orig(*root, 'heart.png')).convert('RGBA')
    # the frames' background is a key colour
    key = him.getpixel((0, 0))[:3]
    him, her = opaque_to_alpha(him, key, 0), opaque_to_alpha(her, her.getpixel((0, 0))[:3], 0)
    hk = heart.getpixel((0, 0))[:3]
    # five frames of 16 rows, each after the first under a separator line: the fourth (rows 51-66) is the full heart
    heart = trim(opaque_to_alpha(heart.crop((0, 51, heart.width, 67)), hk, 0))
    base = tile(S, '#5a7a3a', top='#8fb4d8')
    k = 3 if S <= 48 else 10
    pair = Image.new('RGBA', (17, 8), (0, 0, 0, 0))
    pair.alpha_composite(him, (1, 0))
    pair.alpha_composite(her, (8, 0))
    pair = trim(pair)
    p = pair.resize((pair.width * k, pair.height * k), Image.NEAREST)
    hs = 1 if S <= 48 else 5
    h = heart.resize((heart.width * hs, heart.height * hs), Image.NEAREST)
    gap = 2 if S <= 48 else 10
    total = h.height + gap + p.height
    y0 = (S - total) // 2
    base.alpha_composite(h, ((S - h.width) // 2, y0))
    base.alpha_composite(p, ((S - p.width) // 2, y0 + h.height + gap))
    return clip(base, S)


def i_gltron(S):
    # drawn by us: two light-cycle trails meeting on the grid (no art of the game used)
    big = S * SS
    base = tile(S, '#05070d').resize((big, big), Image.LANCZOS)
    d = ImageDraw.Draw(base)
    for i in range(1, 6):
        v = round(big * i / 6)
        d.line((v, 0, v, big), fill=(40, 70, 110, 255), width=max(1, big // 96))
        d.line((0, v, big, v), fill=(40, 70, 110, 255), width=max(1, big // 96))
    trails = [([(0.12, 0.8), (0.12, 0.3), (0.58, 0.3), (0.58, 0.55)], (0, 230, 255)),
              ([(0.88, 0.2), (0.88, 0.72), (0.38, 0.72), (0.38, 0.5)], (255, 150, 20))]
    glow = Image.new('RGBA', (big, big), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for pts, c in trails:
        gd.line([(x * big, y * big) for x, y in pts], fill=c + (255,), width=round(big * 0.13), joint='curve')
    glow = glow.filter(ImageFilter.GaussianBlur(big * 0.04))
    base.alpha_composite(glow)
    d = ImageDraw.Draw(base)
    for pts, c in trails:
        d.line([(x * big, y * big) for x, y in pts], fill=c + (255,), width=round(big * 0.08), joint='curve')
        d.line([(x * big, y * big) for x, y in pts], fill=(255, 255, 255, 255), width=round(big * 0.025), joint='curve')
    return clip(base.resize((S, S), Image.LANCZOS), S)


def i_gnuchess(S):
    # drawn by us: a knight (DejaVu Sans' chess glyph) on a board square
    base = tile(S, '#b58863', top='#f0d9b5')
    big = S * SS
    lay = Image.new('RGBA', (big, big), (0, 0, 0, 0))
    f = ImageFont.truetype(FONT_PLAIN, round(big * 0.86))
    d = ImageDraw.Draw(lay)
    d.text((big / 2, big * 0.53), '♞', font=f, fill=(20, 20, 20, 255), anchor='mm')
    base.alpha_composite(lay.resize((S, S), Image.LANCZOS))
    return clip(base, S)


# letters (ours): (character, tile colour) for DOS-era games; terminal games: (glyph, phosphor)
LETTERS = {
    'abuse': ('A', '#8a2c18'),          # drawn by us: Abuse's art may not be used
    'ballerburg': ('B', '#8a5a26'),
    'pinball': ('P', '#b0307f'),
    'worms': ('W', '#258a45'),
}
TERMINAL = {
    'wumpus': ('H', '#ffb000'),       # amber
    'adventure': ('C', '#33ff66'),    # green
    'moria': ('M', '#e0e0e0'),
    'nethack': ('@', '#ffffff'),      # the player, as NetHack draws it
    'corewar': ('C', '#00e5ff'),      # cyan: the core
}


def site(S):
    # the site's own icon (freegames.stream): its play button, white on the site's blue (ours)
    base = tile(S, '#2f6fdf')
    big = S * SS
    lay = Image.new('RGBA', (big, big), (0, 0, 0, 0))
    ImageDraw.Draw(lay).polygon([(0.38 * big, 0.27 * big), (0.38 * big, 0.73 * big), (0.74 * big, 0.5 * big)], fill=(255, 255, 255, 255))
    base.alpha_composite(lay.resize((S, S), Image.LANCZOS))
    return base


def make(gid, S):
    if gid in LETTERS:
        ch, c = LETTERS[gid]
        return letter(S, ch, c)
    if gid in TERMINAL:
        ch, c = TERMINAL[gid]
        return terminal(S, ch, c)
    f = globals().get(f'i_{gid}')
    if not f:
        sys.exit(f'{gid}: no icon')
    return f(S)


def save(img, path):
    """a palette PNG (libimagequant): 256 colours at 48 px, 64 at 180 px keep each icon at a few KB; RGBA where smaller"""
    q = img.quantize(colors=256 if img.width <= 48 else 64, method=Image.LIBIMAGEQUANT)
    q.save(path, optimize=True)
    rgba = path + '.rgba.png'
    img.save(rgba, optimize=True)
    if os.path.getsize(rgba) < os.path.getsize(path):
        os.replace(rgba, path)
    else:
        os.remove(rgba)


def main():
    os.makedirs(OUT, exist_ok=True)
    games = sorted(d for d in os.listdir(os.path.join(WEB, 'games'))
                   if os.path.exists(G(d, 'game.json')) and json.load(open(G(d, 'game.json'))).get('listed', True) is not False)
    for gid in games:
        for S, name in ((48, f'{gid}.png'), (180, f'{gid}-180.png')):
            img = make(gid, S)
            assert img.size == (S, S), (gid, img.size)
            save(img, os.path.join(OUT, name))
    save(site(48), os.path.join(WEB, 'public', 'icon.png'))
    save(site(180), os.path.join(WEB, 'public', 'apple-touch-icon.png'))
    print(f'{len(games)} games: web/icons/<id>.png (48x48) and <id>-180.png (180x180); the site: public/icon.png, public/apple-touch-icon.png')


if __name__ == '__main__':
    main()
