"""Read Endless Sky's Debian-format copyright catalog and classify its files.

The catalog is `copyright` in the release tree. Every entry there is a `Files:`
block (globs), its copyright holders and its license. Later blocks override
earlier ones, as the Debian copyright format says.
"""
from __future__ import annotations

import fnmatch
import re
from dataclasses import dataclass, field
from pathlib import Path

# The license of the port's code and of the original's data is GPL-3+.
# CC-BY-SA-4.0 is one-way compatible with GPLv3 (Creative Commons' own
# compatibility statement): the assets stay under it, are used unmodified (or
# only converted losslessly) and are credited, while the combined work is GPL-3+.
COMPATIBLE = {
    'GPL-3+', 'GPL-3.0-or-later',
    'CC-BY-SA-4.0', 'CC-BY-4.0', 'CC-BY-3.0',
    'CC0', 'public-domain',
}
INCOMPATIBLE = {
    'CC-BY-SA-3.0': 'CC BY-SA 3.0 is not compatible with the GPL',
    'Unsplash': 'the Unsplash license is not a free license compatible with the GPL',
}


@dataclass
class Block:
    patterns: list[str] = field(default_factory=list)
    copyright: list[str] = field(default_factory=list)
    license: str | None = None
    comment: list[str] = field(default_factory=list)
    line: int = 0


def parse_copyright(text: str) -> list[Block]:
    blocks: list[Block] = []
    cur: Block | None = None
    field = ''
    for number, line in enumerate(text.splitlines(), 1):
        if line.startswith('Files:'):
            cur = Block(line=number)
            blocks.append(cur)
            field = 'files'
            rest = line[len('Files:'):].strip()
            if rest:
                cur.patterns.append(rest)
        elif cur is None:
            continue
        elif line.startswith('Copyright:'):
            field = 'copyright'
            cur.copyright.append(line[len('Copyright:'):].strip())
        elif line.startswith('License:'):
            field = 'license'
            cur.license = line[len('License:'):].strip()
        elif line.startswith('Comment:'):
            field = 'comment'
            cur.comment.append(line[len('Comment:'):].strip())
        elif line.startswith(' ') or line == '':
            value = line.strip()
            if not value:
                continue
            if field == 'files':
                cur.patterns.append(value)
            elif field == 'copyright':
                cur.copyright.append(value)
            elif field == 'comment':
                cur.comment.append(value)
        else:
            # Free text inside a license paragraph (the license texts at the
            # bottom of the file) is not part of any Files block.
            if line.startswith('License:'):
                field = 'license'
    return blocks


def _match(pattern: str, path: str) -> bool:
    # Debian's file syntax: * and ? only; no path character is special.
    return fnmatch.fnmatchcase(path, pattern)


def classify(blocks: list[Block], path: str) -> Block | None:
    """The last block whose pattern matches `path` (Debian override order)."""
    found = None
    for block in blocks:
        if any(_match(p, path) for p in block.patterns):
            found = block
    return found


def assets() -> tuple[list[str], list[str]]:
    """The release-relative files the port uses, and the incompatible ones it must not."""
    here = Path(__file__).resolve().parent.parent / 'orig' / 'endless-sky-0.11.4'
    if not here.is_dir():
        raise SystemExit(f'missing {here}; run re/endlesssky/fetch.sh first')
    blocks = parse_copyright((here / 'copyright').read_text(encoding='utf-8', errors='replace'))

    wanted: list[str] = []
    rejected: list[str] = []
    for folder in ('data', 'images', 'sounds'):
        for file in sorted((here / folder).rglob('*')):
            if not file.is_file() or file.suffix.lower() not in ('.txt', '.png', '.wav'):
                continue
            rel = file.relative_to(here).as_posix()
            if folder == 'images' and not rel.startswith(('images/font/', 'images/ui/', 'images/icon/', 'images/label/')):
                # Only the image folders the port ships. (`thumbnail` is used by
                # the shipyard, `_menu` by the main menu, `scene` by the spaceport.)
                top = rel.split('/')[1]
                if top not in ('ship', 'thumbnail', 'outfit', 'projectile', 'effect', 'star', 'planet',
                               'land', 'asteroid', 'hardpoint', 'scene', 'map', '_menu'):
                    continue
            block = classify(blocks, rel)
            if block is None or block.license is None:
                rejected.append(rel)
                continue
            if block.license in INCOMPATIBLE:
                rejected.append(rel)
            elif block.license not in COMPATIBLE:
                raise SystemExit(f'unknown license {block.license!r} for {rel}')
            else:
                wanted.append(rel)
    return wanted, rejected


def main() -> None:
    wanted, rejected = assets()
    print(f'{len(wanted)} compatible assets, {len(rejected)} excluded')
    for file in rejected:
        print('EXCLUDED', file)


if __name__ == '__main__':
    main()
