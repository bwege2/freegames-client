#!/usr/bin/env bash
# Downloads Madness Interactive Reloaded 0.51.1-beta (Studio Minus; tag v0.51.1-beta of
# https://github.com/studio-minus/madness-interactive-reloaded, commit 8d2da4dd5ecd041884ba7cc57ab1ba1e09c73d0e,
# GPL-3.0) into re/madness/orig/mir, and copies the part of its base/ folder that the browser port plays
# (all data and locale files and every texture, sound, video and shader that the data or the C# source names)
# into web/games/madness/assets/ unchanged (tools/select-assets.py). The fonts Impact and Toxigenesis of base/fonts
# are not free and are not copied; the port draws its text with free fonts (LICENSE.md). Needs git and python3.
set -euo pipefail
cd "$(dirname "$0")"
tag=v0.51.1-beta
commit=8d2da4dd5ecd041884ba7cc57ab1ba1e09c73d0e
if [[ ! -d orig/mir ]]; then
  mkdir -p orig
  git clone -q --depth 1 --branch "$tag" https://github.com/studio-minus/madness-interactive-reloaded orig/mir
fi
[[ "$(git -C orig/mir rev-parse HEAD)" == "$commit" ]] || { echo "orig/mir is not $commit" >&2; exit 1; }
out=../../web/games/madness/assets
python3 -I tools/select-assets.py orig/mir/src/MadnessInteractiveReloaded "$out"
# the replacements for the two fonts that are not free: Anton (for Impact) and Russo One (for Toxigenesis),
# both SIL Open Font License 1.1, from Google Fonts' repository, rendered into MIR's .wf format
gf=https://raw.githubusercontent.com/google/fonts/main/ofl
get() { [[ -f "orig/$2" ]] || curl -fsSL -o "orig/$2" "$1"; echo "$3  orig/$2" | sha256sum -c - >/dev/null; }
get "$gf/anton/Anton-Regular.ttf" Anton-Regular.ttf a4ba3a92350ebb031da0cb47630ac49eb265082ca1bc0450442f4a83ab947cab
get "$gf/russoone/RussoOne-Regular.ttf" RussoOne-Regular.ttf bc0abcc660bd8b7ad3000ecb2898a27c58a29a50f7ec81652fa12e75148d09df
curl -fsSL -o "$out/fonts/OFL-Anton.txt" "$gf/anton/OFL.txt"
curl -fsSL -o "$out/fonts/OFL-RussoOne.txt" "$gf/russoone/OFL.txt"
# the licences of the two free fonts of MIR the port uses (inter.wf, oxanium.wf), which MIR does not ship
curl -fsSL -o "$out/fonts/OFL-Inter.txt" "$gf/inter/OFL.txt"
curl -fsSL -o "$out/fonts/OFL-Oxanium.txt" "$gf/oxanium/OFL.txt"
python3 -I tools/make-wf.py orig/Anton-Regular.ttf impact "$out/fonts/impact.wf"
python3 -I tools/make-wf.py orig/RussoOne-Regular.ttf toxigenesis "$out/fonts/toxigenesis.wf"
# the file-by-file list of what is shipped, with hashes, sources and licences (ASSET-MANIFEST.csv)
python3 -I tools/manifest.py
echo "Madness Interactive Reloaded data: $(du -sh "$out" | cut -f1)"
