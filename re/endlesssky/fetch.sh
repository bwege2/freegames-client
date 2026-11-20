#!/usr/bin/env bash
# Reference version of Endless Sky: v0.11.4 (2026-10-31), the latest stable
# release of the game (https://github.com/endless-sky/endless-sky/releases/tag/v0.11.4).
# The GitHub source archive holds the C++ source, the data files (data/), the
# sprites (images/), the sounds (sounds/) and the copyright catalog. It does not
# hold the music, which the game downloads separately.
#
#   endless-sky-0.11.4.tar.gz   366,129,610 bytes (GitHub may regenerate tarballs;
#   sha256 971399cc91956171261f5a36429572201a35662db2b1d3615fd6043ee4a38a61
#   the extracted tree is checked by the content hashes below)
#
# Unpacks into orig/ (gitignored). The archives are never committed:
# web/games/endlesssky/assets/ is built from that tree by tools/build-assets.py.
set -euo pipefail
cd "$(dirname "$0")"
want=971399cc91956171261f5a36429572201a35662db2b1d3615fd6043ee4a38a61
url=https://codeload.github.com/endless-sky/endless-sky/tar.gz/refs/tags/v0.11.4
mkdir -p orig
tgz=orig/endless-sky-0.11.4.tar.gz
if [ ! -f "$tgz" ] || ! echo "$want  $tgz" | sha256sum -c --status -; then
  curl -fsSL -o "$tgz.part" "$url"
  mv "$tgz.part" "$tgz"
fi
echo "$want  $tgz" | sha256sum -c -
rm -rf orig/endless-sky-0.11.4
tar -xzf "$tgz" -C orig
src=orig/endless-sky-0.11.4
# The content the port is built and checked against.
for f in source/Ship.cpp source/Weapon.cpp source/Projectile.cpp source/Trade.cpp \
         data/commodities.txt data/human/ships.txt data/human/weapons.txt \
         'data/map systems.txt' images/font/ubuntu14r.png copyright license.txt credits.txt; do
  test -f "$src/$f" || { echo "missing $f" >&2; exit 1; }
done
# 5,000+ sprites, 200+ data files, 240+ sounds: a truncated archive must fail here.
test "$(find "$src/images" -type f | wc -l)" -gt 5000
test "$(find "$src/data" -name '*.txt' | wc -l)" -gt 190
test "$(find "$src/sounds" -name '*.wav' | wc -l)" -gt 230
echo "unpacked into $(pwd)/$src"
