#!/usr/bin/env python3
"""Packs the data files of Lincity 1.13.1 that the port uses into web/games/lincity/assets/lincity-data.bin:
the files byte for byte, as the original installs them (colour.pal, opening/, help/, messages/, icons/),
in one gzip-compressed archive. Leaves out what only other builds use: the Windows fonts
(opening/winfont_*.fnt, opening/iso8859-*.fnt), the ISO 8859-2 and alternative console fonts, and the
POV-Ray scene the opening picture was rendered from (open.pov, do_image).
Archive: b'LCPK', u32 count, then per file u16 name length, name (UTF-8, relative to the data directory),
u32 size, the bytes. Needs re/lincity/fetch.sh first."""
import gzip, os, struct, sys

here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, '..', 'orig', 'lincity-1.13.1')
dst = os.path.join(here, '..', '..', '..', 'web', 'games', 'lincity', 'assets', 'lincity-data.bin')
LEAVE_OUT = {'opening/winfont_8x8.fnt', 'opening/winfont_16x16.fnt', 'opening/iso8859-1-8x8.fnt',
             'opening/iso8859-2-8x8.fnt', 'opening/iso8859-2-8x8.raw', 'opening/alt-8x8', 'opening/open.pov',
             'opening/do_image'}

files = ['colour.pal']
for d in ('opening', 'help', 'messages', 'icons'):
    for f in sorted(os.listdir(os.path.join(src, d))):
        p = f'{d}/{f}'
        if os.path.isfile(os.path.join(src, p)) and p not in LEAVE_OUT:
            files.append(p)

out = bytearray(b'LCPK' + struct.pack('<I', len(files)))
for p in files:
    data = open(os.path.join(src, p), 'rb').read()
    name = p.encode()
    out += struct.pack('<H', len(name)) + name + struct.pack('<I', len(data)) + data
os.makedirs(os.path.dirname(dst), exist_ok=True)
with open(dst, 'wb') as f:
    f.write(gzip.compress(bytes(out), compresslevel=9, mtime=0))
print(f'{len(files)} files, {len(out)} bytes, written to {os.path.relpath(dst)}', file=sys.stderr)
