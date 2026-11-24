#!/usr/bin/env bash
# Reference version of OpenTTD: 15.3 (2026-04-04), the latest stable release.
# 16.0-RC1 (2026-10-31) is a release candidate, so it is not the reference.
#
# Official downloads, each verified by SHA-256 against
# https://cdn.openttd.org/<set>-releases/<version>/manifest.yaml:
#
#   openttd-15.3-source.tar.xz      8,531,992 bytes
#     5ea21eea7d59c78a42071924ac18c6bc0116088f2e96b14cfee9369175973be7
#     the source of the release; GitHub tag 15.3 = commit
#     14ec60f248547d4d062a1160f0fc26d742319888 (2026-04-04)
#   opengfx-8.0-all.zip             3,583,152 bytes
#     43a0c1dabf39cb865394f3a6cc36d4da5c10ecfaaf55652043104806810903be
#     the free base graphics (GPL-2.0-only); metadata in opengfx.obg
#   opensfx-1.0.3-all.zip          11,566,000 bytes
#     e0a218b7dd9438e701503b0f84c25a97c1c11b7c2f025323fb19d6db16ef3759
#     the free base sounds (sounds CC BY-SA 3.0, other files GPL-2.0+ / CDDL-1.1)
#   openmsx-0.4.2-all.zip             140,204 bytes
#     5a4277a2e62d87f2952ea5020dc20fb2f6ffafdccf9913fbf35ad45ee30ec762
#     the free base music (GPL-2.0-only)
#   opensfx-1.0.3-source.tar.xz     9,943,616 bytes
#     43cacb3ca2d86e5729d19c7fcf2533e1bb9c9a32a39f515cf6cbe665ec32635c
#     the sound source package: src/opensfx.psfo names author and licence of
#     every one of the 73 sounds (the licence check in web/games/openttd/LICENSE.md)
#
# Unpacks into orig/ (gitignored): orig/openttd-15.3, orig/opengfx-8.0,
# orig/opensfx-1.0.3, orig/openmsx-0.4.2, orig/opensfx-1.0.3-source.
# Nothing downloaded here is committed; the port's assets are built from this
# tree by re/openttd/tools/ (see NOTES.md).
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p orig

get() { # url sha256 bytes file
  local url=$1 want=$2 size=$3 f=$4
  if [ ! -f "$f" ] || ! echo "$want  $f" | sha256sum -c --status -; then
    curl -fsSL --retry 10 --retry-delay 3 --retry-all-errors -o "$f.part" "$url"
    mv "$f.part" "$f"
  fi
  echo "$want  $f" | sha256sum -c -
  test "$(stat -c %s "$f" 2>/dev/null || stat -f %z "$f")" = "$size"
}

cdn=https://cdn.openttd.org
get "$cdn/openttd-releases/15.3/openttd-15.3-source.tar.xz" \
  5ea21eea7d59c78a42071924ac18c6bc0116088f2e96b14cfee9369175973be7 8531992 \
  orig/openttd-15.3-source.tar.xz
get "$cdn/opengfx-releases/8.0/opengfx-8.0-all.zip" \
  43a0c1dabf39cb865394f3a6cc36d4da5c10ecfaaf55652043104806810903be 3583152 \
  orig/opengfx-8.0-all.zip
get "$cdn/opensfx-releases/1.0.3/opensfx-1.0.3-all.zip" \
  e0a218b7dd9438e701503b0f84c25a97c1c11b7c2f025323fb19d6db16ef3759 11566000 \
  orig/opensfx-1.0.3-all.zip
get "$cdn/openmsx-releases/0.4.2/openmsx-0.4.2-all.zip" \
  5a4277a2e62d87f2952ea5020dc20fb2f6ffafdccf9913fbf35ad45ee30ec762 140204 \
  orig/openmsx-0.4.2-all.zip
get "$cdn/opensfx-releases/1.0.3/opensfx-1.0.3-source.tar.xz" \
  43cacb3ca2d86e5729d19c7fcf2533e1bb9c9a32a39f515cf6cbe665ec32635c 9943616 \
  orig/opensfx-1.0.3-source.tar.xz

# The base sets are a zip around one tar, as the official set bundles are.
unpack_zip_tar() { # zip name
  local zip=$1 name=$2 tmp=orig/.unpack.$$
  rm -rf "$tmp" "orig/$name"
  mkdir -p "$tmp"
  unzip -q "$zip" -d "$tmp"
  tar -xf "$tmp/$name.tar" -C "$tmp"
  rm "$tmp/$name.tar"
  mv "$tmp/$name" "orig/$name"
  rmdir "$tmp"
}

rm -rf orig/openttd-15.3
tar -xJf orig/openttd-15.3-source.tar.xz -C orig
unpack_zip_tar orig/opengfx-8.0-all.zip opengfx-8.0
unpack_zip_tar orig/opensfx-1.0.3-all.zip opensfx-1.0.3
unpack_zip_tar orig/openmsx-0.4.2-all.zip openmsx-0.4.2
rm -rf orig/opensfx-1.0.3-source
tar -xJf orig/opensfx-1.0.3-source.tar.xz -C orig

src=orig/openttd-15.3
ogfx=orig/opengfx-8.0
osfx=orig/opensfx-1.0.3
omsx=orig/openmsx-0.4.2
osfxs=orig/opensfx-1.0.3-source

# The content the port is built and checked against. A truncated archive or a
# wrong version must fail here.
for f in COPYING.md README.md src/tgp.cpp src/map.cpp src/landscape.cpp \
         src/town_cmd.cpp src/industry_cmd.cpp src/station_cmd.cpp \
         src/rail_cmd.cpp src/road_cmd.cpp src/train_cmd.cpp src/roadveh_cmd.cpp \
         src/economy.cpp src/table/cargo_const.h src/table/engines.h \
         src/lang/english.txt src/table/palettes.h docs/savegame_format.md \
         docs/desync.md media/baseset/openttd.grf; do
  test -f "$src/$f" || { echo "missing $f" >&2; exit 1; }
done
test "$(find "$src" -type f | wc -l)" -gt 1800
test "$(find "$src/src" -type f \( -name '*.cpp' -o -name '*.h' -o -name '*.hpp' \) | wc -l)" -gt 1200

# Checksums of the shipped files. opensfx.obs and openmsx.obm match their own
# [md5s] tables. opengfx.obg's [md5s] table does not match the GRFs it ships
# with (all six differ; OpenTTD 15.3 only logs that at debug level 0 and loads
# the set), so the values below are the ones computed from this release, which
# is authenticated by the archive SHA-256 above.
echo "d4607d8c356f033b1ee933a12e00fa53  $ogfx/ogfx1_base.grf" | md5sum -c -
echo "56edd8f20cfa7413b68b2f0fb8a27be1  $osfx/opensfx.cat" | md5sum -c -
echo "8d10ea15d5a180873ce4195011fe9f5f  $omsx/tttheme2.mid" | md5sum -c -
for f in ogfx1_base.grf ogfxc_arctic.grf ogfxh_tropical.grf ogfxt_toyland.grf \
         ogfxi_logos.grf ogfxe_extra.grf opengfx.obg; do
  test -f "$ogfx/$f" || { echo "missing $f" >&2; exit 1; }
done
test -f "$osfx/opensfx.obs"
test "$(find "$omsx" -name '*.mid' | wc -l)" = 31
test -f "$omsx/openmsx.obm"
test -f "$osfxs/src/opensfx.psfo"
test "$(find "$osfxs/src/wav" -name '*.wav' | wc -l)" = 73

echo "OpenTTD 15.3 source:  $(pwd)/$src"
echo "OpenGFX 8.0:          $(pwd)/$ogfx"
echo "OpenSFX 1.0.3:        $(pwd)/$osfx"
echo "OpenMSX 0.4.2:        $(pwd)/$omsx"
echo "OpenSFX source:       $(pwd)/$osfxs"
