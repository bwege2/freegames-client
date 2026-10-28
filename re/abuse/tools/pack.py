"""pack.py <data dir> <out file> [--sound <dir>]: the data files of Abuse 0.8 the port loads, in one
gzip-compressed file (web/games/abuse/assets/abuse-data.bin).

Format ABUSEPK1: the 8 bytes "ABUSEPK1", then for each file: uint16 length of the name, the name
(latin-1, relative to the data directory, '/' separated), uint32 length of the data, the data
(little-endian numbers). The gzip header carries no name and no time, so the output depends only on
the input.

Left out: sfx/ and music/ (the original's sounds are not free; build.sh's silent stand-ins live there
in the oracle's data directory) and any .wav/.hmi file. --sound <dir> adds the files of <dir> (a
directory with sfx/ and music/ as the original has them) to the pack, for a site that has a licence
for them; nothing in the repository does that.
"""
import gzip
import os
import struct
import sys


def files(root, skip_sound):
    out = []
    for d, dirs, names in os.walk(root):
        dirs.sort()
        rel_d = os.path.relpath(d, root)
        top = rel_d.split(os.sep)[0]
        if skip_sound and top in ('sfx', 'music'):
            continue
        for n in sorted(names):
            rel = os.path.normpath(os.path.join(rel_d, n)).replace(os.sep, '/')
            if skip_sound and n.lower().endswith(('.wav', '.hmi')):
                continue
            if n.startswith(' '):
                continue  # files the original program wrote into its data directory (open_FILE)
            out.append((rel, os.path.join(d, n)))
    return out


def main():
    args = sys.argv[1:]
    sound = None
    if '--sound' in args:
        i = args.index('--sound')
        sound = args[i + 1]
        del args[i:i + 2]
    data, out = args
    entries = files(data, True)
    if sound:
        entries += files(sound, False)
    body = bytearray(b'ABUSEPK1')
    for rel, path in sorted(entries):
        with open(path, 'rb') as f:
            b = f.read()
        name = rel.encode('latin-1')
        body += struct.pack('<H', len(name)) + name + struct.pack('<I', len(b)) + b
    with open(out, 'wb') as f:
        with gzip.GzipFile(filename='', mode='wb', fileobj=f, mtime=0, compresslevel=9) as g:
            g.write(bytes(body))
    print(f'{out}: {len(entries)} files, {len(body)} bytes, {os.path.getsize(out)} compressed')


if __name__ == '__main__':
    main()
