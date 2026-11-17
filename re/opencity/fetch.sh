#!/usr/bin/env bash
# Downloads the reference version of OpenCity, 0.0.6.5stable (Debian's opencity_0.0.6.5stable.orig.tar.bz2,
# 8,385,950 bytes), into re/opencity/orig/, unpacks it and prints every license notice of its data
# (the check recorded in LICENSE.md).
#
# With --assets it also copies the data the port uses into web/games/opencity/assets/, unchanged: the
# graphism config, every model of config/graphism.conf (.ac, .conf and its texture), the GUI images, the
# terrain/water/cloud textures and the seven sounds of sound/sound.m3u. The two textures with non-free
# photographs (graphism/hospitaldept/large/large.png, graphism/industrial/containers/containers.png) are
# NOT copied: re/opencity/tools/make_textures.py draws their replacements (see LICENSE.md).
# Needs curl, tar with bzip2, sha256sum (and python3 with Pillow for --assets).
set -euo pipefail
cd "$(dirname "$0")"
here=$PWD
url=http://deb.debian.org/debian/pool/main/o/opencity/opencity_0.0.6.5stable.orig.tar.bz2
tarball=opencity_0.0.6.5stable.orig.tar.bz2
want=7d7015bee0803f4b8257eefc5e1d7f437d581c6dcc0cd48628acf9896f0bc491
mkdir -p orig
[[ -f orig/$tarball ]] || curl -fsSL -o "orig/$tarball" "$url"
echo "$want  orig/$tarball" | sha256sum -c -
rm -rf orig/opencity-0.0.6.5stable
tar -xjf "orig/$tarball" -C orig
cd orig/opencity-0.0.6.5stable
echo "== license notices of the data (count, text)"
grep -rhoE '<licen[cs]e>[^<]*</licen[cs]e>|^license=.*' graphism map | sort | uniq -c
echo "== files naming Creative Commons photos"
grep -rlE 'Creative|flickr' graphism map

[[ ${1:-} == --assets ]] || exit 0
out=$here/../../web/games/opencity/assets
nonfree=(graphism/hospitaldept/large/large.png graphism/industrial/containers/containers.png)
rm -rf "$out/graphism" "$out/sound" "$out/config"
mkdir -p "$out/config" "$out/sound"
cp config/graphism.conf "$out/config/"
copy() { mkdir -p "$out/$(dirname "$1")"; cp "$1" "$out/$1"; }
# the models: every ".ac" of graphism.conf, its ".conf" and the texture it names
for ac in $(grep -oE '^[0-9]+=[^ ]+\.ac' config/graphism.conf | cut -d= -f2 | sort -u); do
  copy "$ac"
  copy "${ac%.ac}.conf"
  for tex in $(grep -oE '^texture "[^"]+"' "$ac" | cut -d'"' -f2 | sort -u); do
    t="$(dirname "$ac")/$tex"
    skip=0
    for n in "${nonfree[@]}"; do [[ $t == "$n" ]] && skip=1; done
    [[ $skip == 1 ]] || copy "$t"
  done
done
for f in graphism/gui/*.png graphism/gui/status/*.png graphism/texture/*.png graphism/icon/OpenCity32.png; do copy "$f"; done
copy sound/sound.m3u
for s in $(grep -v '^#' sound/sound.m3u | tr -d '\r'); do copy "$s"; done
python3 -I "$here/tools/make_textures.py" "$here/work/textures"
cp "$here/work/textures/large.png" "$out/graphism/hospitaldept/large/large.png"
cp "$here/work/textures/containers.png" "$out/graphism/industrial/containers/containers.png"
echo "== assets in $out: $(find "$out" -type f | wc -l) files, $(du -sh "$out" | cut -f1)"
