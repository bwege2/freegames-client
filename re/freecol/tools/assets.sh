#!/usr/bin/env bash
# Copies the game data of the FreeCol 1.2.0 release (re/freecol/fetch.sh) unchanged into
# web/games/freecol/assets/data, the files the website serves. Left out: the intro video (a Theora file no
# browser plays; NOTES.md, "Licences") and data/modsNotWorking (mods FreeCol itself does not offer).
# Run once; the copy is committed as it is (porting rule 4: original data, unchanged).
set -euo pipefail
here=$(cd "$(dirname "$0")/.." && pwd)
src=$here/orig/bin/freecol/data
dst=$here/../../web/games/freecol/assets/data
test -f "$src/rules/classic/specification.xml" || { echo "run re/freecol/fetch.sh first" >&2; exit 1; }
rm -rf "$dst"
mkdir -p "$dst"
cp -R "$src/." "$dst/"
rm -rf "$dst/default/resources/video" "$dst/modsNotWorking"
# every file the same bytes as in the release
(cd "$dst" && find . -type f | sort | while read -r f; do cmp -s "$f" "$src/$f" || { echo "differs: $f" >&2; exit 1; }; done)
big=$(find "$dst" -type f -size +50M)
test -z "$big" || { echo "over 50 MB: $big" >&2; exit 1; }
echo "$(find "$dst" -type f | wc -l) files, $(du -sh "$dst" | cut -f1)"
