#!/usr/bin/env bash
# Downloads the reference version of PokerTH: 1.1.2 (2017), the last release of the classic Qt Widgets
# client and the version Debian ships in main (bullseye, bookworm, trixie). The git tag v1.1.2 of
# https://github.com/pokerth/pokerth is commit 2ca2e941a616c200e3ec81243ad0ed4243b3030e; it is cloned into
# orig/pokerth-1.1.2 (gitignored). Nothing of it is committed: the port's assets are copied from its data/
# directory unchanged (re/pokerth/tools/assets.sh), and the test oracle (re/pokerth/oracle/) compiles its
# engine sources. Needs git.
set -euo pipefail
cd "$(dirname "$0")"
want=2ca2e941a616c200e3ec81243ad0ed4243b3030e
dir=orig/pokerth-1.1.2
mkdir -p orig
if [ ! -d "$dir/.git" ]; then
  rm -rf "$dir"
  git -c advice.detachedHead=false clone -q --depth 1 --branch v1.1.2 https://github.com/pokerth/pokerth.git "$dir"
fi
got=$(git -C "$dir" rev-parse HEAD)
test "$got" = "$want" || { echo "orig/pokerth-1.1.2 is $got, want $want" >&2; exit 1; }
for p in COPYING data/gfx/cards/default/0.png data/gfx/gui/table/default/table.png data/sounds/default/fold.wav \
         src/engine/local_engine/localplayer.cpp src/engine/local_engine/cardsvalue.cpp; do
  test -f "$dir/$p" || { echo "missing $p" >&2; exit 1; }
done
echo "PokerTH 1.1.2 in $(pwd)/$dir"
