#!/usr/bin/env python3
# Builds web/games/frozenbubble/assets/ from the reference tarball (re/frozenbubble/fetch.sh):
#   fb-data.bin: every graphics file the game loads (gfx/, unchanged bytes), data/levels,
#                data/plasma.raw and the four demo records data/demo1..4 (bunzip2'd: the original
#                runs `bzcat` on them)
#   snd/*.ogg, snd/frozen-mainzik-2p.xm: the sounds and musics, unchanged
# fb-data.bin layout: b"FBPK1\n", u32 LE length of a JSON index {name: [offset, length]}, the index,
# then the files. Nothing is converted: the port decodes PNG and GIF itself, as SDL_image does.
# Usage: python3 -I re/frozenbubble/tools/pack.py
import bz2, json, os, shutil, struct, sys

here = os.path.dirname(os.path.abspath(__file__))
orig = os.path.join(here, '..', 'orig', 'frozen-bubble-2.2.0')
out = os.path.join(here, '..', '..', '..', 'web', 'games', 'frozenbubble', 'assets')
if not os.path.isdir(orig):
    sys.exit('run re/frozenbubble/fetch.sh first')

files = {}
for d, _, fs in os.walk(os.path.join(orig, 'gfx')):
    for f in sorted(fs):
        p = os.path.join(d, f)
        rel = os.path.relpath(p, orig).replace(os.sep, '/')
        # the flags of the server list's languages belong to the original's lobby, which the port does not have
        if rel.startswith('gfx/flags/') or not (f.endswith('.png') or f.endswith('.gif')):
            continue
        files[rel] = open(p, 'rb').read()
files['data/levels'] = open(os.path.join(orig, 'data', 'levels'), 'rb').read()
files['data/plasma.raw'] = open(os.path.join(orig, 'data', 'plasma.raw'), 'rb').read()
for i in range(1, 5):
    files[f'data/demo{i}'] = bz2.decompress(open(os.path.join(orig, 'data', f'demo{i}.bz2'), 'rb').read())

index, blob, off = {}, bytearray(), 0
for name in sorted(files):
    data = files[name]
    index[name] = [off, len(data)]
    blob += data
    off += len(data)
ij = json.dumps(index, separators=(',', ':')).encode()
os.makedirs(out, exist_ok=True)
with open(os.path.join(out, 'fb-data.bin'), 'wb') as f:
    f.write(b'FBPK1\n')
    f.write(struct.pack('<I', len(ij)))
    f.write(ij)
    f.write(blob)
os.makedirs(os.path.join(out, 'snd'), exist_ok=True)
for f in sorted(os.listdir(os.path.join(orig, 'snd'))):
    shutil.copyfile(os.path.join(orig, 'snd', f), os.path.join(out, 'snd', f))
print(f'{len(files)} files, {off} bytes in fb-data.bin')
