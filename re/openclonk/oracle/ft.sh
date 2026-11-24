#!/usr/bin/env bash
# Builds the FreeType oracle (ft-glyphs.c, with the FreeType of the original's build) and writes the glyphs of the
# original's font (planet/Graphics.ocg/Endeavour.ttf) to re/openclonk/work/ft/glyphs.txt, which
# web/games/openclonk/test/freetype.test.ts compares with src/rt/freetype.ts.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p ../work/ft
out=$(cd ../work/ft && pwd)
font=$(cd ../orig/openclonk/planet/Graphics.ocg && pwd)/Endeavour.ttf
nix-shell --extra-experimental-features 'nix-command flakes' -I nixpkgs=flake:nixpkgs -p clang pkg-config freetype --run \
  "clang -O2 -o '$out/ft-glyphs' ft-glyphs.c \$(pkg-config --cflags --libs freetype2) && '$out/ft-glyphs' '$font' > '$out/glyphs.txt'"
echo "$(wc -l < "$out/glyphs.txt") glyphs in $out/glyphs.txt ($("$out/ft-glyphs" --version 2>/dev/null || true))"
