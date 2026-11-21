#!/usr/bin/env bash
# Downloads the pinned Lugaru reference (WolfireGames/lugaru, commit 6a58b62, 1.3.0-dev) and copies
# the data the browser port uses: the Wolfire models, skeleton, animations, textures, sound effects,
# the main campaign maps and dialogues. No music, no Temple/Empire/Seven Tasks campaigns, no
# FontMono.png, no HD-only assets. The reference archive is never committed (re/*/orig is gitignored).
#
#   bash re/lugaru/fetch.sh
#
# Needs curl, tar and python3 with Pillow (for the heightmap conversion and the asset manifest).
set -euo pipefail
cd "$(dirname "$0")"
url=https://codeload.github.com/WolfireGames/lugaru/tar.gz/6a58b62858d9c3c3630abf00bf43075f65a09d38
want=40cddfc07e81e8c37ea770dce75e51565a56c3cb43de610b1ee0532e0de2282d
size=36004161
mkdir -p orig
tgz=orig/lugaru-6a58b62.tar.gz
if [ ! -f "$tgz" ] || ! echo "$want  $tgz" | sha256sum -c --status -; then
  curl -fL --retry 3 -o "$tgz.part" "$url"
  mv "$tgz.part" "$tgz"
fi
echo "$want  $tgz" | sha256sum -c -
test "$(stat -c %s "$tgz" 2>/dev/null || stat -f %z "$tgz")" = "$size"
rm -rf orig/lugaru-6a58b62858d9c3c3630abf00bf43075f65a09d38
tar -xzf "$tgz" -C orig
src=orig/lugaru-6a58b62858d9c3c3630abf00bf43075f65a09d38
test -f "$src/Data/Maps/Lugaru1.json"
test -f "$src/Data/Skeleton/BasicFigure"
test -f "$src/Data/Models/Body.solid"

python3 -I tools/assets.py "$src"

echo "Lugaru assets ready: $(du -sh ../../web/games/lugaru/assets | cut -f1)"
