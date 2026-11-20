#!/usr/bin/env bash
# Reference version of SuperTux 0.6.3 (2021-12-22, the last 0.6.x release):
#   SuperTux-v0.6.3-Source.tar.gz, 182,065,428 bytes, sha256
#   f7940e6009c40226eb34ebab8ffb0e3a894892d891a07b35d0e5762dd41c79f6
# The release archive contains the game's C++ source and the complete game data (data/), so the
# code and every asset the port uses come from the same pinned file. Unpacks into orig/ (gitignored).
# The port's assets are copied by `python3 -I tools/build-assets.py`; comments in that script list
# what is copied and where its licence is recorded.
set -euo pipefail
cd "$(dirname "$0")"
url=https://github.com/SuperTux/supertux/releases/download/v0.6.3/SuperTux-v0.6.3-Source.tar.gz
want=f7940e6009c40226eb34ebab8ffb0e3a894892d891a07b35d0e5762dd41c79f6
mkdir -p orig
tgz=orig/SuperTux-v0.6.3-Source.tar.gz
if [ ! -f "$tgz" ] || ! echo "$want  $tgz" | sha256sum -c --status -; then
  curl -fL --retry 3 -o "$tgz.part" "$url"
  mv "$tgz.part" "$tgz"
fi
echo "$want  $tgz" | sha256sum -c -
test "$(stat -c %s "$tgz" 2>/dev/null || stat -f %z "$tgz")" = 182065428
rm -rf orig/SuperTux-v0.6.3-Source
tar -xzf "$tgz" -C orig
src=orig/SuperTux-v0.6.3-Source
for f in src/object/player.cpp src/badguy/badguy.cpp src/supertux/physic.cpp src/supertux/tile.cpp \
         data/images/tiles.strf data/images/tiles/auxiliary/notile.png data/levels/world1/journey_begins.stl \
         data/levels/world1/worldmap.stwm data/fonts/white.stf data/music/antarctic/voc-daytime.music; do
  test -f "$src/$f" || { echo "missing $f" >&2; exit 1; }
done
echo "unpacked into $(pwd)/$src"
