#!/usr/bin/env python3
"""Build web/games/endlesssky/assets/ from the pinned Endless Sky release.

Everything is copied from re/endlesssky/orig/endless-sky-0.11.4 (fetch.sh):
  data/    the original's data files, unchanged
  images/  the original's sprites, converted PNG -> lossless WebP (pixel exact)
  sounds/  the original's sounds, unchanged
  images/font  the original's two bitmap font atlases, lossless WebP

Files whose license is not compatible with GPL-3.0-or-later (the port's code is
GPL-3.0-or-later) are not copied: see licence.py and ../ASSET-LICENSES.md.
"""
from __future__ import annotations

import json
import multiprocessing
import shutil
import sys
from pathlib import Path

from PIL import Image

TOOLS = Path(__file__).resolve().parent
RE = TOOLS.parent
REPO = RE.parent.parent
ORIG = RE / 'orig' / 'endless-sky-0.11.4'
GAME = REPO / 'web' / 'games' / 'endlesssky'
# Sounds derived from a CC-BY-SA-3.0 source (their base file is excluded);
# the @3x variants would otherwise pass as public-domain by the catalog.
INCOMPATIBLE_SOUND_BASES = {'heavy rocket hit', 'meteor', 'explosion huge'}
OUT = GAME / 'assets'

sys.path.insert(0, str(TOOLS))
import licence  # noqa: E402


def referenced_sounds() -> set[str]:
    import re
    names: set[str] = set()
    for file in (ORIG / 'data').rglob('*.txt'):
        text = file.read_text(encoding='utf-8', errors='replace')
        for match in re.finditer(r'^\s*(?:sound|flare sound|reverse flare sound|steering flare sound|hyperdrive sound|hyperdrive in sound|hyperdrive out sound|jump sound|jump in sound|jump out sound|cargo scan sound|outfit scan sound)\s+(?:"([^"]+)"|(\S+))', text, re.M):
            names.add(match.group(1) or match.group(2))
    # The port also plays these directly.
    names.update({'landing', 'afterburner', 'hyperdrive'})
    return names


def selected() -> list[tuple[str, licence.Block]]:
    if not ORIG.is_dir():
        raise SystemExit(f'missing {ORIG}; run re/endlesssky/fetch.sh first')
    blocks = licence.parse_copyright((ORIG / 'copyright').read_text(encoding='utf-8', errors='replace'))
    chosen: list[tuple[str, licence.Block]] = []
    sounds = referenced_sounds()
    for folder in ('data', 'images', 'sounds'):
        for file in sorted((ORIG / folder).rglob('*')):
            if not file.is_file() or file.suffix.lower() not in ('.txt', '.png', '.jpg', '.jpeg', '.wav'):
                continue
            rel = file.relative_to(ORIG).as_posix()
            if folder == 'sounds':
                normal = rel[len('sounds/'):].rsplit('.', 1)[0]
                normal = normal.removesuffix('@3x').removesuffix('~')
                while normal.endswith('~'):
                    normal = normal[:-1]
                if normal not in sounds or normal in INCOMPATIBLE_SOUND_BASES:
                    continue
            if folder == 'images':
                top = rel.split('/')[1]
                if top not in ('ship', 'projectile', 'effect', 'star', 'planet', 'land', '_menu', 'font'):
                    continue
            block = licence.classify(blocks, rel)
            if block is None or block.license is None or block.license in licence.INCOMPATIBLE:
                continue
            if block.license not in licence.COMPATIBLE:
                raise SystemExit(f'unknown license {block.license!r} for {rel}')
            chosen.append((rel, block))
    return chosen


def convert(task: tuple[str, str]) -> None:
    src, dst = task
    image = Image.open(src).convert('RGBA')
    dst = Path(dst)
    dst.parent.mkdir(parents=True, exist_ok=True)
    image.save(dst, 'WEBP', lossless=True, quality=100, method=4, exact=True)


def main() -> None:
    chosen = selected()
    if OUT.exists():
        shutil.rmtree(OUT)
    (OUT / 'data').mkdir(parents=True)
    (OUT / 'images').mkdir(parents=True)
    (OUT / 'sounds').mkdir(parents=True)

    jobs: list[tuple[str, str]] = []
    manifest: list[dict[str, str]] = []
    exclusions: list[str] = []

    for rel, block in chosen:
        src = ORIG / rel
        if rel.startswith('data/'):
            dst = OUT / 'data' / rel[len('data/'):]
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(src, dst)
            out_rel = dst.relative_to(GAME).as_posix()
        elif rel.startswith('sounds/'):
            dst = OUT / 'sounds' / rel[len('sounds/'):]
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(src, dst)
            out_rel = dst.relative_to(GAME).as_posix()
        else:
            # PNGs become lossless WebP; the original's JPG photos are copied
            # unchanged (re-encoding a JPEG could only lose information).
            if src.suffix.lower() == '.png':
                dst = OUT / 'images' / ((rel[len('images/'):]).rsplit('.', 1)[0] + '.webp')
                jobs.append((str(src), str(dst)))
            else:
                dst = OUT / 'images' / rel[len('images/'):]
                dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(src, dst)
            out_rel = dst.relative_to(GAME).as_posix()
        manifest.append({
            'path': out_rel,
            'original': rel,
            'license': block.license,
            'copyright': '; '.join(block.copyright),
            'comment': ' '.join(block.comment),
        })

    # Every PNG under images/ that was not selected is an incompatible one; list
    # it so the licence note can say exactly what is missing.
    for file in sorted((ORIG / 'images').rglob('*')):
        if file.suffix.lower() not in ('.png', '.jpg', '.jpeg'):
            continue
        rel = file.relative_to(ORIG).as_posix()
        block = licence.classify(licence.parse_copyright((ORIG / 'copyright').read_text(encoding='utf-8', errors='replace')), rel)
        if block is None or block.license is None or block.license in licence.INCOMPATIBLE:
            exclusions.append(rel)

    with multiprocessing.Pool(max(1, (multiprocessing.cpu_count() or 2) - 1)) as pool:
        for index, _ in enumerate(pool.imap_unordered(convert, jobs, chunksize=16), 1):
            if index % 500 == 0 or index == len(jobs):
                print(f'  images {index}/{len(jobs)}', flush=True)

    (OUT / 'licenses.json').write_text(
        json.dumps({'version': '0.11.4', 'assets': manifest, 'excluded': exclusions}, indent=1) + '\n',
        encoding='utf-8')

    # The original's own license catalog and credits travel with the port, as the
    # GPL and CC-BY-SA ask for their notices.
    shutil.copyfile(ORIG / 'copyright', GAME / 'ORIGINAL-COPYRIGHT.txt')
    shutil.copyfile(ORIG / 'credits.txt', GAME / 'ORIGINAL-CREDITS.txt')
    shutil.copyfile(ORIG / 'license.txt', GAME / 'LICENSE-GPL-3.0.txt')
    shutil.copyfile(ORIG / 'icons' / 'icon_512x512.png', GAME / 'icon-source.png')

    total = sum(p.stat().st_size for p in OUT.rglob('*') if p.is_file())
    print(f'{len(chosen)} files, {total / 1e6:.1f} MB in {OUT}')
    print(f'{len(exclusions)} incompatible images left out (see web/games/endlesssky/LICENSE.md)')


if __name__ == '__main__':
    main()
