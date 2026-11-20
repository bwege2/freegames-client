#!/usr/bin/env python3
# Copies the part of Madness Interactive Reloaded's base/ folder that the game uses into web/games/madness/assets/,
# unchanged and under the same paths: all of data/ and locale/, and every texture, sound and video that the data
# files or the C# source name (string literals and Assets.EnumerateFolder folders). Files nothing names (editor and
# debug leftovers) and the fonts other than Inter and Oxanium are left out.
#   select-assets.py <MIR source dir (src/MadnessInteractiveReloaded)> <out dir>
import os, re, shutil, sys

src_dir, out = sys.argv[1], sys.argv[2]
base = os.path.join(src_dir, 'base')
files = set()
for root, _, fs in os.walk(base):
    for f in fs:
        files.add(os.path.relpath(os.path.join(root, f), base).replace(os.sep, '/'))
need = {f for f in files if f.startswith(('data/', 'locale/'))}
need |= {'fonts/inter.wf', 'fonts/oxanium.wf'}
dirs = {os.path.dirname(f) for f in files}

PATH = re.compile(r'(?:textures|sounds|video|fonts|shaders)/[A-Za-z0-9_\-./ ()]+')
texts = []
for f in need:
    if f.endswith(('.json', '.look', '.armor', '.hand', '.stats', '.txt', '.seq', '.anim', '.preset', '.tags')):
        texts.append(open(os.path.join(base, f), encoding='utf-8-sig', errors='replace').read())
for root, _, fs in os.walk(src_dir):
    if os.path.relpath(root, src_dir).startswith(('base', 'bin', 'obj')):
        continue
    for f in fs:
        if f.endswith('.cs'):
            texts.append(open(os.path.join(root, f), encoding='utf-8-sig', errors='replace').read())
for t in texts:
    for m in PATH.finditer(t.replace('\\\\', '/').replace('\\/', '/')):
        p = m.group(0).rstrip('./ ')
        for cand in (p, p.strip()):
            if cand in files:
                need.add(cand)
            elif cand in dirs:  # a folder the game enumerates
                need |= {f for f in files if os.path.dirname(f) == cand}
# fonts: only the two free ones the port draws with; Impact and Toxigenesis are not free (replaced, fetch.sh),
# Tipografia's licence is unknown and Cascadia Mono is for the debug console
need = {f for f in need if not f.startswith('fonts/') or f in ('fonts/inter.wf', 'fonts/oxanium.wf')}

if os.path.exists(out):
    shutil.rmtree(out)
total = 0
for p in sorted(need):
    d = os.path.join(out, p)
    os.makedirs(os.path.dirname(d), exist_ok=True)
    shutil.copyfile(os.path.join(base, p), d)
    total += os.path.getsize(d)
print(f'{len(need)} of {len(files)} files, {total / 1e6:.1f} MB')
