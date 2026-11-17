#!/usr/bin/env python3
# Writes web/games/opencity/src/font8x8.ts from the original's src/font_8x8.h (the Linux kernel's 8x8
# console font as OpenCity stores it: 256 glyphs of 8 rows, bottom row first, as glBitmap wants them).
#   python3 -I re/opencity/tools/font.py
import os, re
here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, '..', 'orig', 'opencity-0.0.6.5stable', 'src', 'font_8x8.h')
out = os.path.join(here, '..', '..', '..', 'web', 'games', 'opencity', 'src', 'font8x8.ts')
text = open(src, encoding='latin1').read()
body = text[text.index('fontdata_8x8['):]
body = body[body.index('{') + 1:body.index('}')]
data = bytes(int(v, 16) for v in re.findall(r'0x[0-9a-fA-F]+', body))
assert len(data) == 2048, len(data)
with open(out, 'w') as f:
    f.write('// src/font_8x8.h of OpenCity 0.0.6.5stable: the Linux kernel 2.6.14 8x8 console font (GPL-2.0), 256 glyphs\n')
    f.write('// of 8 bytes, bottom row first (glBitmap order); bit 7 is the left pixel. Written by re/opencity/tools/font.py.\n')
    f.write("export const FONT_8x8 = Uint8Array.from(atob('")
    import base64
    f.write(base64.b64encode(data).decode())
    f.write("'), (c) => c.charCodeAt(0));\n")
    f.write('/** FONT_8x8_X_MOVE: the pen advances 10 pixels per character */\nexport const FONT_X_MOVE = 10;\n')
print('wrote', out)
