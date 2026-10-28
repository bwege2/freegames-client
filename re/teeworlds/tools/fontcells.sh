#!/usr/bin/env bash
# Builds fontcells.c against FreeType (the pinned nixpkgs of the oracles) and prints the glyph cells of the
# release's font (datasrc/fonts/DejaVuSans.ttf), the table FONT_CELLS in web/games/teeworlds/src/client/engine/text.ts.
set -euo pipefail
cd "$(dirname "$0")"
src=$(cd ../orig/teeworlds-0.7.5-src/datasrc 2>/dev/null && pwd) || { echo "run re/teeworlds/fetch.sh first" >&2; exit 1; }
nixpkgs=${TEEWORLDS_NIXPKGS:-github:NixOS/nixpkgs/d3b13ad75cc492690728f9307e443dec9ef9a20e}
paths=$(nix --extra-experimental-features 'nix-command flakes' build "$nixpkgs#freetype.dev" "$nixpkgs#freetype" "$nixpkgs#clang" --no-link --print-out-paths)
dev=$(echo "$paths" | grep -- '-dev$' | head -1)
lib=$(echo "$paths" | grep -v -- '-dev$' | grep freetype | head -1)
cc=$(for p in $paths; do [[ -x "$p/bin/clang" ]] && echo "$p/bin/clang"; done | head -1)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
"$cc" -O1 -I"$dev/include/freetype2" -o "$work/fontcells" fontcells.c -L"$lib/lib" -Wl,-rpath,"$lib/lib" -lfreetype
"$work/fontcells" "$src/fonts/DejaVuSans.ttf"
