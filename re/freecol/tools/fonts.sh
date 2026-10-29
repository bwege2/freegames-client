#!/usr/bin/env bash
# The fonts the port's Java logical fonts use (as the original's JDK on a Linux desktop with DejaVu): the DejaVu 2.37
# TrueType files of fetch.sh, unchanged, and the text metrics table Java2D computes for them
# (oracle/run.sh FontTable, re/freecol/NOTES.md "Fonts"), into web/games/freecol/assets/fonts.
set -euo pipefail
here=$(cd "$(dirname "$0")/.." && pwd)
dv=$here/orig/dejavu/dejavu-fonts-ttf-2.37
dst=$here/../../web/games/freecol/assets/fonts
test -f "$dv/ttf/DejaVuSans.ttf" || { echo "run re/freecol/fetch.sh first" >&2; exit 1; }
table=$here/work/javametrics.bin
test -f "$table" || bash "$here/oracle/run.sh" FontTable "$table"
rm -rf "$dst"
mkdir -p "$dst"
for f in DejaVuSans DejaVuSans-Bold DejaVuSans-Oblique DejaVuSans-BoldOblique DejaVuSerif DejaVuSerif-Bold \
         DejaVuSerif-Italic DejaVuSerif-BoldItalic DejaVuSansMono DejaVuSansMono-Bold DejaVuSansMono-Oblique \
         DejaVuSansMono-BoldOblique; do
  cp "$dv/ttf/$f.ttf" "$dst/"
done
cp "$dv/LICENSE" "$dst/DejaVu-LICENSE.txt"
cp "$table" "$dst/javametrics.bin"
echo "$(ls "$dst" | wc -l) files, $(du -sh "$dst" | cut -f1)"
