#!/usr/bin/env bash
# Packs the game content (planet/) into C4Group files with the original's own c4group tool, as its CMake
# install does (`c4group planet/<group> -t <group>`, the list OC_C4GROUPS of CMakeLists.txt, plus Music.ocg),
# into re/openclonk/work/pack/<group> (or the directory given with --out). The port reads them with
# src/rt/group.ts.
#
# The four files whose sources are non-commercial today (re/openclonk/NOTES.md, "Licences") are taken out of their
# groups and written unchanged to <out>/noncommercial/<path in planet>; the port adds them only while
# NONCOMMERCIAL_FILES (web/games/openclonk/src/settings.ts) is on. The list is noncommercial.txt next to this script.
#   pack.sh [--out DIR] [group ...]
#   DIR is relative to the directory the script is called from (not to this script): from the repository root,
#   `tools/pack.sh --out web/games/openclonk/assets` writes the groups into the game's assets.
set -euo pipefail
invoked=$PWD
cd "$(dirname "$0")"
here=$PWD
c4group=$(cd ../work/build 2>/dev/null && pwd)/c4group
[[ -x $c4group ]] || { echo "run re/openclonk/oracle/build.sh first" >&2; exit 1; }
planet=$(cd ../orig/openclonk/planet && pwd)
out=../work/pack
if [[ ${1:-} == --out ]]; then
  out=$2
  [[ $out == /* ]] || out=$invoked/$out
  shift 2
fi
mkdir -p "$out"
out=$(cd "$out" && pwd)
groups=(Graphics.ocg Material.ocg Sound.ocg System.ocg Objects.ocd Decoration.ocd Arena.ocf Parkour.ocf Defense.ocf
        Missions.ocf Tutorials.ocf Worlds.ocf Music.ocg)
(($#)) && groups=("$@")
mapfile -t nc < <(grep -v '^#' "$here/noncommercial.txt" | sed '/^$/d')
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
for g in "${groups[@]}"; do
  src=$planet/$g
  mine=()
  for f in "${nc[@]}"; do [[ $f == "$g"/* ]] && mine+=("$f"); done
  if ((${#mine[@]})); then
    # a copy of the group's folder without the non-commercial files; they are kept beside the groups
    rm -rf "${tmp:?}/$g"
    cp -a "$src" "$tmp/$g"
    for f in "${mine[@]}"; do
      [[ -f $planet/$f ]] || { echo "missing $f" >&2; exit 1; }
      rm "$tmp/$f"
      mkdir -p "$out/noncommercial/$(dirname "$f")"
      cp "$planet/$f" "$out/noncommercial/$f"
    done
    src=$tmp/$g
  fi
  rm -f "$out/$g"
  "$c4group" "$src" -t "$out/$g" >"$tmp/log" 2>&1 || { cat "$tmp/log" >&2; exit 1; }
  [[ -f $out/$g ]] || { echo "c4group did not pack $g" >&2; exit 1; }
  echo "$g $(stat -c %s "$out/$g")${mine:+ (without ${#mine[@]} non-commercial files)}"
done
