#!/usr/bin/env bash
# Copies the data the client loads from the release's datasrc/ into web/games/teeworlds/assets/, unchanged:
# the game images (game.png, particles.png, emoticons.png, deadtee.png, race_flag.png), ui/, mapres/, skins/,
# countryflags/, audio/ (.wv, decoded in the browser by the WavPack port) and fonts/DejaVuSans.ttf. The official
# maps (maps/) are copied by gen.py. Left out: the editor's images, the translations (the port is English
# only, as the release without a language file), the Python build scripts. Run fetch.sh first.
set -euo pipefail
cd "$(dirname "$0")"
src=$(cd ../orig/teeworlds-0.7.5-src/datasrc 2>/dev/null && pwd) || { echo "run re/teeworlds/fetch.sh first" >&2; exit 1; }
dst=$(cd ../../../web/games/teeworlds && pwd)/assets
mkdir -p "$dst"
for d in ui mapres skins countryflags audio; do
  rm -rf "${dst:?}/$d"
  cp -R "$src/$d" "$dst/$d"
done
cp "$src"/game.png "$src"/particles.png "$src"/emoticons.png "$src"/deadtee.png "$src"/race_flag.png "$dst/"
mkdir -p "$dst/fonts"
cp "$src/fonts/DejaVuSans.ttf" "$dst/fonts/"
# the copies are the original's bytes
(cd "$src" && find ui mapres skins countryflags audio fonts/DejaVuSans.ttf game.png particles.png emoticons.png deadtee.png \
   race_flag.png -type f -print0 | xargs -0 sha256sum) | (cd "$dst" && sha256sum -c --quiet -)
echo "copied $(cd "$dst" && find . -type f ! -path './maps/*' | wc -l) files into $dst"
