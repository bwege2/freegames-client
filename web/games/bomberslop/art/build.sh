#!/usr/bin/env bash
# Renders Bomberslop's pictures: art/bomberslop.px.js -> assets/sprites.png + assets/sprites.json (each sprite's
# x, y, w, h in the sheet). The art is drawn as code for pxl (https://github.com/augusto-scarvalho/claude-pxl, MIT
# license, Copyright (c) 2026 crsolver), a pixel-art tool; this script downloads pxl at the commit the art was made
# with (into a cache folder, never into this repository) and runs it. Needs Node 22.18 or newer, curl and tar.
#   bash web/games/bomberslop/art/build.sh
set -euo pipefail
cd "$(dirname "$0")"
PXL_COMMIT=2cbadb1329fa6a0449a09685e2a853c3c9dc24d2
cache=${XDG_CACHE_HOME:-$HOME/.cache}/bomberslop-pxl/$PXL_COMMIT
if [[ ! -f "$cache/bin/pxl.js" ]]; then
  mkdir -p "$cache"
  curl -fsSL "https://codeload.github.com/augusto-scarvalho/claude-pxl/tar.gz/$PXL_COMMIT" | tar -xz -C "$cache" --strip-components=1
fi
out=$(mktemp -d)
trap 'rm -rf "$out"' EXIT
node "$cache/bin/pxl.js" build bomberslop.px.js --out "$out" --only sprites
cp "$out/sprites.png" ../assets/sprites.png
# the sheet's TexturePacker JSON, cut to what the game reads: name -> [x, y, w, h]
node -e '
const j = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
const out = {};
for (const [name, f] of Object.entries(j.frames)) out[name] = [f.frame.x, f.frame.y, f.frame.w, f.frame.h];
require("fs").writeFileSync(process.argv[2], JSON.stringify(out) + "\n");
' "$out/sprites.json" ../assets/sprites.json
echo "assets/sprites.png ($(wc -c < ../assets/sprites.png) bytes), assets/sprites.json ($(node -e 'console.log(Object.keys(require(process.argv[1])).length)' "$PWD/../assets/sprites.json") sprites)"
