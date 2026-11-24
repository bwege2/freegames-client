#!/usr/bin/env bash
# Reference version of OpenClonk: master 36de799544af0459014ea088867fe263779a8bdd (2026-04-28, 9.0 alpha),
# GitHub's source archive of that commit (engine ISC, content CC BY 3.0 / some images CC BY-SA 3.0):
#   https://github.com/openclonk/openclonk/archive/36de799544af0459014ea088867fe263779a8bdd.tar.gz
#   134,607,499 bytes, sha256 840c43c3678c3fa27fc7fad435e064d9bdc4d632b710cef9ff275ea7a79aa440
# (GitHub makes the archive on request; should its gzip ever change, the sha256 check fails here, and
# `git archive` of that commit gives the same tree.)
# Unpacks into orig/openclonk (gitignored). Nothing of it is run here: oracle/build.sh compiles what the
# tests need, tools/translate.sh reads the sources, tools/pack.sh packs the content groups.
set -euo pipefail
cd "$(dirname "$0")"
sha=36de799544af0459014ea088867fe263779a8bdd
want=840c43c3678c3fa27fc7fad435e064d9bdc4d632b710cef9ff275ea7a79aa440
size=134607499
f=orig/openclonk-$sha.tar.gz
mkdir -p orig
if [ ! -f "$f" ] || ! echo "$want  $f" | sha256sum -c --status -; then
  curl -fsSL -o "$f.part" "https://github.com/openclonk/openclonk/archive/$sha.tar.gz"
  mv "$f.part" "$f"
fi
echo "$want  $f" | sha256sum -c -
test "$(stat -c %s "$f" 2>/dev/null || stat -f %z "$f")" = "$size"
rm -rf orig/openclonk "orig/openclonk-$sha"
tar xzf "$f" -C orig
mv "orig/openclonk-$sha" orig/openclonk
for p in src/lib/C4Real.cpp src/lib/C4Random.cpp src/c4group/C4Group.cpp thirdparty/pcg/pcg_random.hpp planet/Arena.ocf TRADEMARK; do
  test -e "orig/openclonk/$p" || { echo "missing $p" >&2; exit 1; }
done
echo "unpacked into $(pwd)/orig/openclonk"
