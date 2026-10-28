#!/usr/bin/env bash
# Translates NetHack 3.6.7 to TypeScript (web/games/nethack/src/*.ts, structs.ts, globals.ts, init.ts):
# clang's syntax trees of the game's C files (ast.sh, after oracle/build.sh made the generated headers),
# reduced to what the translation needs (extract.py), then the translator (c2ts/, via translate.py).
# Also copies the installation's data files (made by the original makedefs, lev_comp, dgn_comp and dlb in
# oracle/build.sh) to web/games/nethack/assets/.
set -euo pipefail
cd "$(dirname "$0")"
work=$(cd ../work && pwd)
[[ -d $work/include ]] || { echo "run re/nethack/oracle/build.sh first" >&2; exit 1; }
[[ ${SKIP_AST:-} == 1 ]] || ./ast.sh
rm -rf "$work/ext"
ls "$work/ast" | sed 's/\.json$//' | xargs -P 6 -n 10 python3 -I extract.py 2> /dev/null
python3 -I translate.py
assets=../../../web/games/nethack/assets
mkdir -p "$assets"
cp "$work/install/nhdat" "$work/install/license" "$work/install/symbols" "$work/install/sysconf" "$assets/"
