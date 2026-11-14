#!/usr/bin/env bash
# Copies the original's data the port uses, unchanged, from PokerTH 1.1.2 (re/pokerth/fetch.sh first) into
# web/games/pokerth/assets/: the default card deck and its back, the default table style, the action labels,
# the start window's background, the sounds and the font. Licenses: re/pokerth/LICENSE.md.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
data="$here/../orig/pokerth-1.1.2/data"
out="$here/../../../web/games/pokerth/assets"
test -d "$data" || { echo "run re/pokerth/fetch.sh first" >&2; exit 1; }
rm -rf "$out"
mkdir -p "$out/cards" "$out/table" "$out/misc" "$out/sounds" "$out/fonts"
for i in $(seq 0 51); do cp "$data/gfx/cards/default/$i.png" "$out/cards/"; done
cp "$data/gfx/cards/default/flipside.png" "$out/cards/"
for f in bigblindPuck smallblindPuck dealerPuck genereticAvatar cardholder_flop cardholder_turn cardholder_river \
         handranking playerSeatActive playerSeatInactive table toolboxbg \
         playeraction_red playeraction_red_hover playeraction_red_checked playeraction_red_checked_hover \
         playeraction_blue playeraction_blue_hover playeraction_blue_checked playeraction_blue_checked_hover \
         playeraction_green playeraction_green_hover playeraction_green_checked playeraction_green_checked_hover \
         playeraction_orange playeraction_orange_hover playeraction_orange_checked playeraction_orange_checked_hover \
         playeraction_purple playeraction_purple_hover \
         radiobutton_checked radiobutton_unchecked; do
  cp "$data/gfx/gui/table/default/$f.png" "$out/table/"
done
for f in action_allin action_bet action_call action_check action_fold action_raise action_winner; do
  cp "$data/gfx/gui/misc/actionpics/$f.png" "$out/misc/"
done
cp "$data/gfx/gui/misc/startwindowbg10_desktop.png" "$out/misc/"
for f in allin bet blinds_raises_level1 blinds_raises_level2 blinds_raises_level3 call check dealtwocards fold \
         lobbychatnotify onlinegameready playerconnected raise yourturn; do
  cp "$data/sounds/default/$f.wav" "$out/sounds/"
done
cp "$data/fonts/DejaVuSans-Bold.ttf" "$out/fonts/"
du -sh "$out"
